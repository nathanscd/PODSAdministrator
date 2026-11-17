from __future__ import annotations

import asyncio
import time
from collections.abc import Mapping
from urllib.parse import quote

import httpx

from .config import DatatemSettings
from .errors import DatatemError, DatatemErrorKind
from .models import ConnectionRecord, SimcardRecord, StoredSession, TokenPair
from .normalize import extract_page, normalize_connections, normalize_inventory
from .token_store import FirestoreTokenStore, MemoryTokenStore, TokenStore

LOGIN_PATH = "/authorization/api/v1/auth/login"
REFRESH_PATH = "/authorization/api/v1/auth/refresh_token"
INVENTORY_PATH = "/simcard/invetory/v1/simcard"
CONNECTIONS_PATH = "/simcard/connection/v1/connections"


def _text(value: object) -> str | None:
    if isinstance(value, str) and value.strip():
        return value.strip()
    return None


def _parse_tokens(payload: object) -> TokenPair:
    if not isinstance(payload, Mapping):
        raise DatatemError(DatatemErrorKind.INVALID_RESPONSE)
    nested = payload.get("authenticationToken")
    source = nested if isinstance(nested, Mapping) else payload
    access_token = _text(source.get("accessToken"))
    refresh_token = _text(source.get("refreshToken"))
    if not access_token or not refresh_token:
        raise DatatemError(DatatemErrorKind.INVALID_RESPONSE)
    try:
        expires_in = int(source.get("expiresIn", 3600))
    except (TypeError, ValueError):
        expires_in = 3600
    token_type = _text(source.get("tokenType")) or "Bearer"
    scope = _text(source.get("scope")) or ""
    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=max(60, expires_in),
        token_type=token_type,
        scope=scope,
    )


class DatatemClient:
    """Cliente único e centralizado da conta principal DATATEM."""

    def __init__(
        self,
        settings: DatatemSettings,
        http_client: httpx.AsyncClient | None = None,
        token_store: TokenStore | None = None,
    ) -> None:
        self._settings = settings
        self._http = http_client or httpx.AsyncClient(
            base_url=settings.base_url, timeout=settings.request_timeout_seconds
        )
        self._owns_http = http_client is None
        self._store: TokenStore = token_store or self._default_store()
        self._session: StoredSession | None = None
        self._lock = asyncio.Lock()

    def _default_store(self) -> TokenStore:
        try:
            return FirestoreTokenStore(self._settings)
        except Exception:
            return MemoryTokenStore()

    def _url(self, path: str) -> str:
        return f"{self._settings.base_url}{path}"

    @property
    def is_authenticated(self) -> bool:
        return self._session is not None and self._session.expires_at > time.time()

    async def close(self) -> None:
        if self._owns_http:
            await self._http.aclose()

    async def initialize(self) -> None:
        try:
            loaded = await asyncio.to_thread(self._store.load)
        except DatatemError:
            loaded = None
        except Exception:
            loaded = None
        if loaded is not None:
            self._session = loaded

    async def _post_public(self, path: str, payload: dict[str, object]) -> object:
        try:
            response = await self._http.post(self._url(path), json=payload)
        except httpx.TimeoutException as exc:
            raise DatatemError(DatatemErrorKind.UNAVAILABLE) from exc
        except httpx.RequestError as exc:
            raise DatatemError(DatatemErrorKind.UNAVAILABLE) from exc
        if response.status_code >= 400:
            raise DatatemError.from_status(response.status_code)
        try:
            return response.json()
        except ValueError as exc:
            raise DatatemError(DatatemErrorKind.INVALID_RESPONSE) from exc

    async def _authenticate(self) -> None:
        self._settings.validate()
        payload = await self._post_public(
            LOGIN_PATH,
            {
                "username": self._settings.username,
                "password": self._settings.encoded_password(),
                "grantType": "password",
                "clientId": self._settings.client_id,
                "clientSecret": self._settings.client_secret,
            },
        )
        await self._store_tokens(_parse_tokens(payload))

    async def _refresh(self) -> None:
        if self._session is None:
            raise DatatemError(DatatemErrorKind.AUTHENTICATION_FAILED)
        try:
            response = await self._http.post(
                self._url(REFRESH_PATH),
                json={
                    "refreshToken": self._session.refresh_token,
                    "grantType": self._settings.refresh_grant_type,
                },
                headers={"Authorization": f"Bearer {self._session.access_token}"},
            )
        except (httpx.TimeoutException, httpx.RequestError) as exc:
            raise DatatemError(DatatemErrorKind.UNAVAILABLE) from exc
        if response.status_code >= 400:
            raise DatatemError.from_status(response.status_code)
        try:
            payload = response.json()
        except ValueError as exc:
            raise DatatemError(DatatemErrorKind.INVALID_RESPONSE) from exc
        await self._store_tokens(_parse_tokens(payload))

    async def _store_tokens(self, tokens: TokenPair) -> None:
        session = StoredSession(
            access_token=tokens.access_token,
            refresh_token=tokens.refresh_token,
            expires_at=time.time() + tokens.expires_in,
            token_type=tokens.token_type,
            scope=tokens.scope,
        )
        self._session = session
        try:
            await asyncio.to_thread(self._store.save, session)
        except Exception:
            pass

    def _clear_session(self) -> None:
        self._session = None
        try:
            self._store.clear()
        except Exception:
            pass

    async def ensure_session(self, force: bool = False) -> None:
        skew = self._settings.token_expiry_skew_seconds
        if (
            not force
            and self._session is not None
            and self._session.expires_at > time.time() + skew
        ):
            return
        async with self._lock:
            if (
                not force
                and self._session is not None
                and self._session.expires_at > time.time() + skew
            ):
                return
            if self._session is not None and self._session.refresh_token:
                try:
                    await self._refresh()
                    return
                except DatatemError as exc:
                    if exc.kind not in {
                        DatatemErrorKind.AUTHENTICATION_FAILED,
                        DatatemErrorKind.INVALID_REQUEST,
                        DatatemErrorKind.INVALID_DATA,
                        DatatemErrorKind.INVALID_RESPONSE,
                    }:
                        raise
                    self._clear_session()
            await self._authenticate()

    async def _get(self, path: str, params: dict[str, object] | None = None) -> object:
        await self.ensure_session()
        for attempt in range(2):
            if self._session is None:
                raise DatatemError(DatatemErrorKind.AUTHENTICATION_FAILED)
            headers = {
                "Authorization": f"{self._session.token_type} {self._session.access_token}",
                "Content-Type": "application/json",
            }
            try:
                response = await self._http.get(self._url(path), params=params, headers=headers)
            except httpx.TimeoutException as exc:
                raise DatatemError(DatatemErrorKind.UNAVAILABLE) from exc
            except httpx.RequestError as exc:
                raise DatatemError(DatatemErrorKind.UNAVAILABLE) from exc
            if response.status_code == 401 and attempt == 0:
                self._clear_session()
                await self.ensure_session(force=True)
                continue
            if response.status_code >= 400:
                raise DatatemError.from_status(response.status_code)
            try:
                return response.json()
            except ValueError as exc:
                raise DatatemError(DatatemErrorKind.INVALID_RESPONSE) from exc
        raise DatatemError(DatatemErrorKind.AUTHENTICATION_FAILED)

    async def list_simcards(self) -> tuple[list[SimcardRecord], list[str]]:
        self._settings.validate()
        raw_items: list[object] = []
        warnings: list[str] = []
        page = 1
        while page <= self._settings.max_pages:
            payload = await self._get(
                INVENTORY_PATH,
                params={
                    "Pagesize": self._settings.page_size,
                    "PageNumber": page,
                    "Paginate": "true",
                },
            )
            items, meta, page_warnings = extract_page(payload)
            warnings.extend(page_warnings)
            raw_items.extend(items)
            if not items:
                break
            if meta.get("last") is True or meta.get("last") == "true":
                break
            total_pages = _parse_positive(meta.get("totalPages"))
            if total_pages is not None and page >= total_pages:
                break
            if len(items) < self._settings.page_size:
                break
            page += 1
        else:
            warnings.append("A paginação da DATATEM foi interrompida por limite de segurança.")
        return normalize_inventory(raw_items)

    async def get_simcard(self, simcard_id: str) -> SimcardRecord:
        safe_id = quote(simcard_id, safe="")
        payload = await self._get(f"{INVENTORY_PATH}/{safe_id}")
        records, _ = normalize_inventory([payload])
        if not records:
            raise DatatemError(DatatemErrorKind.INVALID_RESPONSE)
        return records[0]

    async def get_connections(self) -> tuple[list[ConnectionRecord], list[str]]:
        payload = await self._get(CONNECTIONS_PATH)
        return normalize_connections(payload)

    async def reset_simcard(self, simcard_id: str) -> None:
        safe_id = quote(simcard_id, safe="")
        await self._post_authenticated(f"{INVENTORY_PATH}/{safe_id}/action", {"action": "RESET"})

    async def bulk_reset(self, simcard_ids: list[str]) -> None:
        await self._post_authenticated(
            f"{INVENTORY_PATH}/action/bulk",
            [{"action": "RESET", "simcardId": item} for item in simcard_ids],
        )

    async def _post_authenticated(self, path: str, body: object) -> None:
        await self.ensure_session()
        if self._session is None:
            raise DatatemError(DatatemErrorKind.AUTHENTICATION_FAILED)
        try:
            response = await self._http.post(
                self._url(path),
                json=body,
                headers={"Authorization": f"Bearer {self._session.access_token}"},
            )
        except (httpx.TimeoutException, httpx.RequestError) as exc:
            raise DatatemError(DatatemErrorKind.UNAVAILABLE) from exc
        if response.status_code >= 400:
            raise DatatemError.from_status(response.status_code)


def _parse_positive(value: object) -> int | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, int) and value > 0:
        return value
    if isinstance(value, str) and value.strip().isdigit():
        parsed = int(value.strip())
        return parsed if parsed > 0 else None
    return None
