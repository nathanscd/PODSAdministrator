from __future__ import annotations

import time

import httpx
import pytest

from fastapi_app.datatem.client import CONNECTIONS_PATH, INVENTORY_PATH, LOGIN_PATH, REFRESH_PATH, DatatemClient
from fastapi_app.datatem.config import DatatemSettings
from fastapi_app.datatem.errors import DatatemError, DatatemErrorKind
from fastapi_app.datatem.models import StoredSession
from fastapi_app.datatem.token_store import TokenStore

SETTINGS = DatatemSettings(
    base_url="https://datatem.test",
    username="user",
    password="secret",
    client_id="client",
    client_secret="client-secret",
    refresh_grant_type="refresh_token",
    page_size=2,
    max_pages=5,
    request_timeout_seconds=5,
    token_expiry_skew_seconds=10,
    token_store_collection="datatemIntegration",
    token_store_document="session",
)

TOKEN_RESPONSE = {
    "authenticationToken": {
        "accessToken": "access-1",
        "tokenType": "Bearer",
        "refreshToken": "refresh-1",
        "expiresIn": 3600,
        "scope": "BAR,READ,WRITE",
    }
}


class MemoryStore(TokenStore):
    def __init__(self) -> None:
        self.session: StoredSession | None = None

    def load(self) -> StoredSession | None:
        return self.session

    def save(self, session: StoredSession) -> None:
        self.session = session

    def clear(self) -> None:
        self.session = None


def make_client(handler, store: TokenStore | None = None) -> DatatemClient:
    transport = httpx.MockTransport(handler)
    return DatatemClient(
        SETTINGS,
        http_client=httpx.AsyncClient(transport=transport),
        token_store=store or MemoryStore(),
    )


@pytest.mark.asyncio
async def test_login_uses_base64_password_and_nested_token():
    captured: dict[str, object] = {}

    def handler(request: httpx.Request) -> httpx.Response:
        import json

        captured.update(json.loads(request.content))
        captured["url"] = str(request.url)
        return httpx.Response(200, json=TOKEN_RESPONSE)

    client = make_client(handler)
    await client.ensure_session()
    assert captured["url"] == f"{SETTINGS.base_url}{LOGIN_PATH}"
    assert captured["password"] == "c2VjcmV0"
    assert captured["grantType"] == "password"
    assert captured["clientId"] == "client"
    assert client.is_authenticated
    await client.close()


@pytest.mark.asyncio
async def test_refresh_uses_configured_grant_and_keeps_single_flight():
    calls = {"refresh": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == LOGIN_PATH:
            return httpx.Response(200, json=TOKEN_RESPONSE)
        calls["refresh"] += 1
        return httpx.Response(
            200,
            json={
                "accessToken": "access-2",
                "tokenType": "Bearer",
                "refreshToken": "refresh-2",
                "expiresIn": 3600,
            },
        )

    store = MemoryStore()
    client = make_client(handler, store)
    client._session = StoredSession(
        access_token="expired",
        refresh_token="refresh-1",
        expires_at=time.time() - 1,
    )
    await client.ensure_session()
    await client.ensure_session()
    assert calls["refresh"] == 1
    assert store.session is not None
    assert store.session.access_token == "access-2"
    await client.close()


@pytest.mark.asyncio
async def test_invalid_login_response_is_sanitized():
    def handler(_request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"unexpected": True})

    client = make_client(handler)
    with pytest.raises(DatatemError) as error:
        await client.ensure_session()
    assert error.value.kind == DatatemErrorKind.INVALID_RESPONSE
    assert "secret" not in str(error.value)
    await client.close()


@pytest.mark.asyncio
async def test_pagination_accumulates_all_pages_and_deduplicates():
    seen_pages: list[str] = []

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == LOGIN_PATH:
            return httpx.Response(200, json=TOKEN_RESPONSE)
        seen_pages.append(request.url.params.get("PageNumber", ""))
        assert request.url.params.get("Pagesize") == "2"
        assert request.url.params.get("Paginate") == "true"
        page = int(request.url.params["PageNumber"])
        items = [
            {
                "id": "1",
                "iccid": "8955-1",
                "phoneNumber": "11999990000",
                "operatorName": "Vivo",
                "statusName": "ACTIVE",
                "operationalStatusName": "SUSPENDED",
            }
        ]
        if page == 1:
            items.append({"id": "1", "iccid": "8955-1"})
        elif page == 2:
            items.append(
                {
                    "id": "2",
                    "iccid": "8955-2",
                    "operatorName": "Claro",
                    "statusName": "ACTIVE",
                }
            )
        return httpx.Response(200, json={"content": items, "totalPages": 2, "last": page == 2})

    client = make_client(handler)
    cards, warnings = await client.list_simcards()
    assert seen_pages == ["1", "2"]
    assert [card.id for card in cards] == ["1", "2"]
    assert cards[0].lifecycleState == "inactive"
    assert cards[0].operatorStatusName is None
    assert cards[0].operationalStatusName == "SUSPENDED"
    assert warnings == []
    await client.close()


@pytest.mark.asyncio
async def test_401_triggers_reauthentication_and_retry():
    attempts = {"inventory": 0, "login": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == LOGIN_PATH:
            attempts["login"] += 1
            return httpx.Response(
                200,
                json={
                    "authenticationToken": {
                        "accessToken": f"access-{attempts['login']}",
                        "refreshToken": f"refresh-{attempts['login']}",
                        "expiresIn": 3600,
                    }
                },
            )
        if request.url.path == REFRESH_PATH:
            return httpx.Response(401, json={})
        attempts["inventory"] += 1
        if attempts["inventory"] == 1:
            return httpx.Response(401, json={})
        return httpx.Response(200, json={"content": []})

    client = make_client(handler)
    cards, _ = await client.list_simcards()
    assert cards == []
    assert attempts == {"inventory": 2, "login": 2}
    await client.close()


@pytest.mark.asyncio
async def test_upstream_errors_map_to_friendly_messages():
    def handler(request: httpx.Request) -> httpx.Response:
        if request.url.path == LOGIN_PATH:
            return httpx.Response(200, json=TOKEN_RESPONSE)
        return httpx.Response(503, json={"error": "internal detail"})

    client = make_client(handler)
    with pytest.raises(DatatemError) as error:
        await client.get_connections()
    assert error.value.kind == DatatemErrorKind.UNAVAILABLE
    assert "internal detail" not in error.value.message
    assert INVENTORY_PATH.startswith("/simcard/invetory")
    assert CONNECTIONS_PATH == "/simcard/connection/v1/connections"
    await client.close()
