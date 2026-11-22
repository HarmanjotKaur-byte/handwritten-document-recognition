import os
import sys
import time
import concurrent.futures
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.main import app
from app.config import DATA_DIR, TEST_DATASET_DIR


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_concurrent_inference_requests(client):
    """
    Stress-tests backend concurrency to verify thread-safety
    and prevent TensorFlow session race conditions.
    """
    word_file = DATA_DIR / "word.png"
    assert word_file.exists()
    with open(word_file, "rb") as f:
        file_bytes = f.read()

    def send_request():
        resp = client.post(
            "/api/predict",
            files={"file": ("word.png", file_bytes, "image/png")}
        )
        return resp.status_code, resp.json()

    # Launch 6 concurrent inference workers
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
        futures = [executor.submit(send_request) for _ in range(6)]
        results = [f.result() for f in futures]

    for status_code, data in results:
        assert status_code == 200
        assert data["success"] is True
        assert data["recognized_text"] == "word"
        assert data["processing_time_ms"] > 0.0


def test_large_aspect_ratio_image(client):
    """Tests extreme dynamic width text line scaling."""
    line_file = DATA_DIR / "line.png"
    with open(line_file, "rb") as f:
        file_bytes = f.read()

    resp = client.post(
        "/api/predict",
        files={"file": ("line.png", file_bytes, "image/png")}
    )
    assert resp.status_code == 200
    assert resp.json()["recognized_text"] == "or work on line level"


def test_all_sample_catalog_entries(client):
    """Verifies every sample in the catalog resolves and predicts."""
    samples_resp = client.get("/api/samples")
    assert samples_resp.status_code == 200
    samples = samples_resp.json()["samples"]
    assert len(samples) >= 4

    for s in samples:
        pred_resp = client.post("/api/sample", json={"sample_id": s["id"]})
        assert pred_resp.status_code == 200
        data = pred_resp.json()
        assert data["success"] is True
        assert len(data["recognized_text"]) > 0
