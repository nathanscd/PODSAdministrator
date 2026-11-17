from __future__ import annotations

import os
from dataclasses import dataclass
from io import StringIO
from pathlib import Path

from dotenv import load_dotenv

_env_loaded = False


def _load_env_file(path: Path) -> None:
    try:
        lines = path.read_text(encoding="utf-8-sig").splitlines()
    except OSError:
        return
    usable = [
        line
        for line in lines
        if "=" in line and line.strip() and not line.lstrip().startswith("#")
    ]
    if usable:
        load_dotenv(stream=StringIO("\n".join(usable)), override=False)


def load_env_files() -> None:
    global _env_loaded
    if _env_loaded:
        return
    base = Path(__file__).resolve()
    for env_file in (base.parents[3] / ".env", base.parents[1] / ".env"):
        if env_file.is_file():
            _load_env_file(env_file)
    _env_loaded = True


load_env_files()


def _int_env(name: str, default: int) -> int:
    raw = os.getenv(name)
    if raw is None or not raw.strip():
        return default
    try:
        return int(raw)
    except ValueError:
        return default


def _origins(value: str) -> tuple[str, ...]:
    return tuple(item.strip() for item in value.split(",") if item.strip())


@dataclass(frozen=True)
class BackendSettings:
    cors_allowed_origins: tuple[str, ...]
    datatem_base_url: str
    firebase_project_id: str

    @classmethod
    def from_env(cls) -> "BackendSettings":
        return cls(
            cors_allowed_origins=_origins(
                os.getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
            ),
            datatem_base_url=os.getenv(
                "DATATEM_BASE_URL", "https://app-gateway.brcaptura.com.br"
            ).rstrip("/"),
            firebase_project_id=os.getenv("FIREBASE_PROJECT_ID", "podsadministrator"),
        )


settings = BackendSettings.from_env()
