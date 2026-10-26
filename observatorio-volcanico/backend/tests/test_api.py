import pytest
from fastapi.testclient import TestClient

from app.main import app, observatory


@pytest.fixture
def client():
    observatory.reset()
    return TestClient(app)


def test_state_has_seed_data_in_both_trees(client):
    state = client.get("/api/state").json()
    assert len(state["volcanoes"]) == 12
    assert state["trees"]["name"]["stats"]["weight"] == 12
    assert state["trees"]["altitude"]["stats"]["weight"] == 12
    assert state["trees"]["name"]["root"]["id"] == "Galeras"
    assert state["trees"]["name"]["root"]["kind"] == "root"


def test_create_then_update_volcano(client):
    body = {"name": "Santa Isabel", "altitude": 4950, "alert_level": "Verde", "department": "Tolima"}
    created = client.post("/api/volcanoes", json=body).json()
    assert created["action"] == "created"
    assert created["path_name"][0] == "Galeras"
    assert len(created["state"]["volcanoes"]) == 13

    body["alert_level"] = "Naranja"
    updated = client.post("/api/volcanoes", json={**body, "name": "santa  isabel"}).json()
    assert updated["action"] == "updated"
    assert len(updated["state"]["volcanoes"]) == 13
    found = client.get("/api/search", params={"name": "Santa Isabel"}).json()
    assert found["record"]["alert_level"] == "Naranja"


def test_search_missing_volcano(client):
    result = client.get("/api/search", params={"name": "Krakatoa"}).json()
    assert result["found"] is False
    assert result["path"][0] == "Galeras"


def test_remove_volcano_from_both_trees(client):
    removed = client.delete("/api/volcanoes/Galeras").json()
    assert removed["state"]["trees"]["name"]["stats"]["weight"] == 11
    assert removed["state"]["trees"]["altitude"]["stats"]["weight"] == 11
    assert client.delete("/api/volcanoes/Galeras").status_code == 404


def test_altitude_range(client):
    result = client.get("/api/altitude-range", params={"low": 5000, "high": 6000}).json()
    names = {r["name"] for r in result["results"]}
    assert names == {"Nevado del Huila", "Nevado del Ruiz", "Nevado del Tolima"}
    assert len(result["visited"]) < result["total"]


def test_validation_errors(client):
    bad = {"name": "X", "altitude": 100, "alert_level": "Azul"}
    assert client.post("/api/volcanoes", json=bad).status_code == 422
    assert client.get("/api/altitude-range", params={"low": 6000, "high": 100}).status_code == 400
