from __future__ import annotations

import functools
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Callable

from firebase_functions import https_fn, options

import auth
import config
import logging_utils
import responses
import validation
from responses import ApiError, ErrorKind

AUTHENTICATED_ENDPOINTS = ("sharepoint_me", "sharepoint_upload_intent")

logger = logging.getLogger(__name__)


def _authenticated(handler: Callable[[Any], Any]) -> Callable[[Any], Any]:
    @functools.wraps(handler)
    def wrapper(request: Any) -> Any:
        try:
            auth_header = request.headers.get("Authorization")
            if auth_header is None:
                auth_header = request.headers.get("authorization")
            token = auth.extract_bearer_token(auth_header)
            ctx = auth.resolve_auth_context(token)
            request.auth_context = ctx
            return handler(request)
        except auth.AuthError as exc:
            result = responses.private_error(exc.kind)
            return responses.to_https_response(result)
        except Exception:
            request_id = uuid.uuid4().hex
            logging_utils.log_event(
                logger,
                "unhandled_error",
                endpoint=handler.__name__,
                error_kind="internal",
                request_id=request_id,
            )
            result = responses.private_error(ErrorKind.INTERNAL)
            return responses.to_https_response(result)

    return wrapper


def _retry_after_seconds(reset_at: str) -> int:
    try:
        dt = datetime.fromisoformat(reset_at.replace("Z", "+00:00"))
        now = datetime.now(timezone.utc)
        delta = int((dt - now).total_seconds())
        return max(1, delta)
    except Exception:
        return 60


@https_fn.on_request(
    region="southamerica-east1",
    memory=options.MemoryOption.MB_256,
    timeout_sec=30,
    min_instances=0,
    max_instances=10,
)
@_authenticated
def sharepoint_me(request: Any) -> Any:
    if request.method != "GET":
        result = responses.private_error(ErrorKind.INVALID_REQUEST, status=405)
        return responses.to_https_response(result)

    ctx: auth.AuthContext = request.auth_context
    payload = {
        "uid": ctx.uid,
        "email": ctx.email,
        "companyId": ctx.company_id,
        "isAdmin": ctx.is_admin,
        "role": ctx.role,
    }
    result = responses.private_json(payload, status=200)
    status, body, headers = result
    logging_utils.log_event(
        logger,
        "sharepoint_me",
        endpoint="sharepoint_me",
        status=status,
        outcome="success",
        uid_hash=logging_utils.hash_identifier(ctx.uid),
        filename_hash=None,
    )
    return responses.to_https_response((status, body, headers))


@https_fn.on_request(
    region="southamerica-east1",
    memory=options.MemoryOption.MB_256,
    timeout_sec=30,
    min_instances=0,
    max_instances=10,
)
@_authenticated
def sharepoint_upload_intent(request: Any) -> Any:
    if request.method != "POST":
        result = responses.private_error(ErrorKind.INVALID_REQUEST, status=405)
        return responses.to_https_response(result)

    ctx: auth.AuthContext = request.auth_context
    body_json = request.get_json(silent=True)
    if not isinstance(body_json, dict):
        result = responses.private_error(ErrorKind.INVALID_REQUEST)
        status, resp_body, headers = result
        logging_utils.log_event(
            logger,
            "sharepoint_upload_intent",
            endpoint="sharepoint_upload_intent",
            status=status,
            outcome="invalid_request",
            uid_hash=logging_utils.hash_identifier(ctx.uid),
            filename_hash=None,
        )
        return responses.to_https_response((status, resp_body, headers))

    filename = body_json.get("filename")
    mime = body_json.get("mime")
    size = body_json.get("size")

    if "filename" not in body_json or "mime" not in body_json or "size" not in body_json:
        result = responses.private_error(ErrorKind.INVALID_REQUEST)
        status, resp_body, headers = result
        logging_utils.log_event(
            logger,
            "sharepoint_upload_intent",
            endpoint="sharepoint_upload_intent",
            status=status,
            outcome="invalid_request",
            uid_hash=logging_utils.hash_identifier(ctx.uid),
            filename_hash=None,
        )
        return responses.to_https_response((status, resp_body, headers))

    try:
        meta = validation.validate_upload_metadata(filename, mime, size)
    except validation.UploadValidationError as exc:
        result = responses.private_error(exc.kind)
        status, resp_body, headers = result
        logging_utils.log_event(
            logger,
            "sharepoint_upload_intent",
            endpoint="sharepoint_upload_intent",
            status=status,
            outcome="validation_failed",
            uid_hash=logging_utils.hash_identifier(ctx.uid),
            filename_hash=logging_utils.hash_identifier(str(filename)),
        )
        return responses.to_https_response((status, resp_body, headers))

    try:
        auth.initialize_firebase_app()
        from firebase_admin import firestore

        limiter = validation.FirestoreRateLimiter(firestore.client())
    except Exception:
        result = responses.private_error(ErrorKind.INTERNAL)
        status, resp_body, headers = result
        logging_utils.log_event(
            logger,
            "sharepoint_upload_intent",
            endpoint="sharepoint_upload_intent",
            status=status,
            outcome="rate_limit_unavailable",
            uid_hash=logging_utils.hash_identifier(ctx.uid),
            filename_hash=logging_utils.hash_identifier(meta.normalized_filename),
        )
        return responses.to_https_response((status, resp_body, headers))

    try:
        decision = limiter.check(ctx.company_id, ctx.uid, "/sharepoint/upload-intent")
    except validation.RateLimitUnavailable:
        result = responses.private_error(ErrorKind.RATE_LIMITED, retry_after_seconds=60)
        status, resp_body, headers = result
        logging_utils.log_event(
            logger,
            "sharepoint_upload_intent",
            endpoint="sharepoint_upload_intent",
            status=status,
            outcome="rate_limited",
            uid_hash=logging_utils.hash_identifier(ctx.uid),
            filename_hash=logging_utils.hash_identifier(meta.normalized_filename),
        )
        return responses.to_https_response((status, resp_body, headers))

    if not decision.allowed:
        retry_after = _retry_after_seconds(decision.reset_at)
        result = responses.private_error(ErrorKind.RATE_LIMITED, retry_after_seconds=retry_after)
        status, resp_body, headers = result
        logging_utils.log_event(
            logger,
            "sharepoint_upload_intent",
            endpoint="sharepoint_upload_intent",
            status=status,
            outcome="rate_limited",
            uid_hash=logging_utils.hash_identifier(ctx.uid),
            filename_hash=logging_utils.hash_identifier(meta.normalized_filename),
        )
        return responses.to_https_response((status, resp_body, headers))

    settings = config.get_settings()
    payload = {
        "normalizedFilename": meta.normalized_filename,
        "mime": meta.mime,
        "sizeBytes": meta.size_bytes,
        "maxBytes": settings.max_upload_bytes,
        "rateLimit": decision.to_public_dict(),
    }
    result = responses.private_json(payload, status=200)
    status, resp_body, headers = result
    logging_utils.log_event(
        logger,
        "sharepoint_upload_intent",
        endpoint="sharepoint_upload_intent",
        status=status,
        outcome="success",
        uid_hash=logging_utils.hash_identifier(ctx.uid),
        filename_hash=logging_utils.hash_identifier(meta.normalized_filename),
    )
    return responses.to_https_response((status, resp_body, headers))
