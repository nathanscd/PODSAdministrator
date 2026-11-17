from __future__ import annotations

import base64
import os
from dataclasses import dataclass

from ..config import load_env_files

load_env_files()


@dataclass(frozen=True)
class DatatemSettings:
    base_url: str
    username: str
    password: str
    client_id: str
    client_secret: str
    refresh_grant_type: str
    page_size: int
    max_pages: int
    request_timeout_seconds: float
    token_expiry_skew_seconds: int
    token_store_collection: str
    token_store_document: str

    @classmethod
    def from_env(cls) -> "DatatemSettings":
        return cls(
            base_url=os.getenv("DATATEM_BASE_URL", "https://app-gateway.brcaptura.com.br").rstrip("/"),
            username=os.getenv("DATATEM_USERNAME", ""),
            password=os.getenv("DATATEM_PASSWORD", ""),
            client_id=os.getenv("DATATEM_CLIENT_ID", ""),
            client_secret=os.getenv("DATATEM_CLIENT_SECRET", ""),
            refresh_grant_type=os.getenv("DATATEM_REFRESH_GRANT_TYPE", "refresh_token"),
            page_size=max(1, min(_positive_int("DATATEM_PAGE_SIZE", 20), 100)),
            max_pages=max(1, _positive_int("DATATEM_MAX_PAGES", 200)),
            request_timeout_seconds=float(os.getenv("DATATEM_REQUEST_TIMEOUT", "30")),
            token_expiry_skew_seconds=max(0, _positive_int("DATATEM_TOKEN_EXPIRY_SKEW", 60)),
            token_store_collection=os.getenv("DATATEM_TOKEN_COLLECTION", "datatemIntegration"),
            token_store_document=os.getenv("DATATEM_TOKEN_DOCUMENT", "session"),
        )

    def validate(self) -> None:
        missing = [
            name
            for name, value in (
                ("DATATEM_USERNAME", self.username),
                ("DATATEM_PASSWORD", self.password),
                ("DATATEM_CLIENT_ID", self.client_id),
                ("DATATEM_CLIENT_SECRET", self.client_secret),
            )
            if not value.strip()
        ]
        if missing:
            from .errors import DatatemConfigurationError

            raise DatatemConfigurationError(", ".join(missing))

    def encoded_password(self) -> str:
        return base64.b64encode(self.password.encode("utf-8")).decode("ascii")


def _positive_int(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None or not raw.strip():
        return default
    try:
        value = int(raw)
    except ValueError:
        return default
    return value if value > 0 else default
