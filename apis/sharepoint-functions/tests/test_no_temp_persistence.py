from __future__ import annotations

import re
from pathlib import Path

REPOSITORY_ROOT = Path(__file__).resolve().parents[3]
PACKAGE_ROOT = REPOSITORY_ROOT / "apis" / "sharepoint-functions"
SETTINGS_PAGE = REPOSITORY_ROOT / "apps" / "web" / "src" / "pages" / "SettingsPage.tsx"
EXCLUDED_PARTS = frozenset({"tests", ".venv", "__pycache__"})

FORBIDDEN_PERSISTENCE_TOKENS = (
    "tempfile",
    "NamedTemporaryFile",
    "mkstemp",
    "sqlite3",
    "pickle",
    "shelve",
)

WRITE_MODE_OPEN_PATTERN = re.compile(
    r"\bopen\s*\([^)\n]*?['\"](?:w|a|x|wb|ab|xb|w\+|a\+|x\+)['\"]"
)

FORBIDDEN_BROWSER_STORAGE_TOKENS = (
    "localStorage",
    "sessionStorage",
    "indexedDB",
    "document.cookie",
    "caches.",
    "serviceWorker",
)

BASE64_BLOB_PATTERN = re.compile(r"['\"][A-Za-z0-9+/]{43,}={0,2}['\"]")
KEY_LIKE_NAME_PATTERN = re.compile(
    r"(?i)key|secret|token|password|credential|private"
)

FALSE_ENCRYPTION_TOKENS = (
    "Enabled (AES-256)",
    "ENCRYPTION: SECURE",
    "AES-256",
)
ENCRYPTION_LABEL = "label: 'Data Encryption'"

EXPECTED_PRODUCTION_MODULES = frozenset(
    {
        "config",
        "secret_provider",
        "crypto",
        "responses",
        "auth",
        "validation",
        "logging_utils",
        "main",
    }
)


def production_modules() -> list[Path]:
    return sorted(
        path
        for path in PACKAGE_ROOT.rglob("*.py")
        if not EXCLUDED_PARTS.intersection(path.parts)
    )


def first_present_token(content: str, tokens: tuple[str, ...]) -> str | None:
    return next((token for token in tokens if token in content), None)


def test_production_modules_have_no_local_persistence_apis() -> None:
    for path in production_modules():
        token = first_present_token(
            path.read_text(encoding="utf-8"), FORBIDDEN_PERSISTENCE_TOKENS
        )
        assert token is None, f"{path}: forbidden persistence token {token!r}"


def test_production_modules_never_open_files_for_writing() -> None:
    for path in production_modules():
        match = WRITE_MODE_OPEN_PATTERN.search(path.read_text(encoding="utf-8"))
        assert match is None, f"{path}: write-mode open() matched {match.group(0)!r}"


def test_production_modules_have_no_browser_storage_references() -> None:
    for path in production_modules():
        token = first_present_token(
            path.read_text(encoding="utf-8"), FORBIDDEN_BROWSER_STORAGE_TOKENS
        )
        assert token is None, f"{path}: forbidden browser-storage token {token!r}"


def test_production_modules_have_no_long_key_like_literals() -> None:
    for path in production_modules():
        for line in path.read_text(encoding="utf-8").splitlines():
            if "=" not in line or KEY_LIKE_NAME_PATTERN.search(line) is None:
                continue
            match = BASE64_BLOB_PATTERN.search(line)
            assert match is None, f"{path}: embedded key-like blob {match.group(0)!r}"


def test_settings_page_has_no_false_encryption_claims() -> None:
    content = SETTINGS_PAGE.read_text(encoding="utf-8")
    for token in FALSE_ENCRYPTION_TOKENS:
        assert token not in content, (
            f"{SETTINGS_PAGE}: false encryption token {token!r} still present"
        )
    assert ENCRYPTION_LABEL in content, (
        f"{SETTINGS_PAGE}: Data Encryption label is missing"
    )


def test_scan_discovers_all_expected_production_modules() -> None:
    basenames = {path.stem for path in production_modules()}
    missing = EXPECTED_PRODUCTION_MODULES - basenames
    assert not missing, f"{PACKAGE_ROOT}: missing production modules {sorted(missing)}"


def test_in_memory_rate_limiter_is_documented_as_test_only() -> None:
    validation = PACKAGE_ROOT / "validation.py"
    content = validation.read_text(encoding="utf-8")
    index = content.find("class InMemoryRateLimiter")
    assert index != -1, f"{validation}: InMemoryRateLimiter class not found"
    vicinity = content[max(0, index - 200) : index + 400].lower()
    assert "test-only" in vicinity or "test only" in vicinity, (
        f"{validation}: InMemoryRateLimiter is not documented as test-only"
    )
