import ast
import json
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[3]
MAIN_PATH = REPO_ROOT / "apis" / "sharepoint-functions" / "main.py"
FIREBASE_CONFIG_PATH = REPO_ROOT / "firebase.json"


def _decorator_name(node: ast.expr) -> str:
    if isinstance(node, ast.Call):
        return _decorator_name(node.func)
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        return f"{_decorator_name(node.value)}.{node.attr}"
    return ""


def _handlers(tree: ast.Module) -> list[ast.FunctionDef]:
    handlers = []
    for node in tree.body:
        if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            continue
        if any(_decorator_name(dec).endswith("on_request") for dec in node.decorator_list):
            handlers.append(node)
    return handlers


@pytest.fixture(scope="module")
def tree() -> ast.Module:
    return ast.parse(MAIN_PATH.read_text(encoding="utf-8"))


def test_exported_on_request_handlers_are_authenticated(tree):
    handlers = _handlers(tree)
    assert handlers
    for node in handlers:
        decorators = {_decorator_name(dec) for dec in node.decorator_list}
        assert any(
            name == "_authenticated" or name.endswith("._authenticated")
            for name in decorators
        )


def test_authenticated_endpoints_matches_discovered_handlers(tree):
    assignments = [
        node
        for node in tree.body
        if isinstance(node, ast.Assign)
        and any(
            isinstance(target, ast.Name) and target.id == "AUTHENTICATED_ENDPOINTS"
            for target in node.targets
        )
    ]
    assert len(assignments) == 1
    names = set(ast.literal_eval(assignments[0].value))
    handler_names = {node.name for node in _handlers(tree)}
    assert names == handler_names


def test_authenticated_decorator_is_defined_and_applied_by_name(tree):
    defs = [
        node
        for node in tree.body
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
        and node.name == "_authenticated"
    ]
    assert len(defs) == 1
    names = []
    for node in _handlers(tree):
        names.extend(
            _decorator_name(dec)
            for dec in node.decorator_list
            if _decorator_name(dec).endswith("_authenticated")
        )
    assert names == ["_authenticated", "_authenticated"]


def test_main_module_has_no_outbound_client_imports(tree):
    banned = ("msal", "graph.microsoft", "boto3", "requests", "httpx")
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                assert not any(part in alias.name for part in banned)
        elif isinstance(node, ast.ImportFrom):
            module = node.module or ""
            assert not any(part in module for part in banned)
    source = MAIN_PATH.read_text(encoding="utf-8")
    for token in banned:
        assert token not in source


def test_firebase_config_declares_both_codebases_and_ignores_tests():
    data = json.loads(FIREBASE_CONFIG_PATH.read_text(encoding="utf-8"))
    functions = data["functions"]
    assert isinstance(functions, list)
    sources = {entry["source"] for entry in functions}
    assert sources == {"apis/reporting-functions", "apis/sharepoint-functions"}
    sharepoint = next(
        entry for entry in functions if entry["source"] == "apis/sharepoint-functions"
    )
    assert sharepoint["runtime"] == "python312"
    assert sharepoint["codebase"] == "sharepoint"
    assert "**/tests/**" in sharepoint["ignore"]
    assert "**/.venv/**" in sharepoint["ignore"]


def test_handler_source_has_no_unsafe_error_interpolation(tree):
    source = MAIN_PATH.read_text(encoding="utf-8")
    banned = ("error.message", "str(exc)", "traceback")
    for token in banned:
        assert token not in source
