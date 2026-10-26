"""
FastAPI integration tests for API endpoints.
"""

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data


def test_examples_endpoint():
    response = client.get("/api/examples")
    assert response.status_code == 200
    examples = response.json()
    assert len(examples) >= 5
    first = examples[0]
    assert "id" in first
    assert "name" in first
    assert "code" in first


def test_analyze_endpoint_success():
    payload = {
        "code": "def search(arr):\n    for x in arr:\n        if x == 42:\n            return True\n    return False"
    }
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["time_complexity"] == "O(n)"
    assert data["space_complexity"] == "O(1)"
    assert data["is_valid_syntax"] is True
    assert len(data["step_by_step_reasoning"]) > 0


def test_analyze_endpoint_empty_code():
    payload = {"code": "   "}
    response = client.post("/api/analyze", json=payload)
    assert response.status_code == 400


def test_compare_endpoint_success():
    payload = {
        "algorithms": [
            {
                "id": "algo_linear",
                "name": "Linear Search",
                "code": "def search(arr):\n    for x in arr:\n        pass",
            },
            {
                "id": "algo_nested",
                "name": "Nested Search",
                "code": "def search(arr):\n    for x in arr:\n        for y in arr:\n            pass",
            },
        ]
    }
    response = client.post("/api/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 2
    assert "comparative_summary" in data
    assert "time_ranking" in data
    assert data["time_ranking"][0] == "algo_linear"


def test_compare_endpoint_insufficient_algorithms():
    payload = {
        "algorithms": [
            {
                "id": "one",
                "name": "Only One",
                "code": "x = 1",
            }
        ]
    }
    response = client.post("/api/compare", json=payload)
    assert response.status_code == 422 or response.status_code == 400
