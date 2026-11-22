import io
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from PIL import Image

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.main import app
from app.services.vision_service import VisionService
from app.services.usage_service import UsageService

client = TestClient(app)


def create_test_image_bytes(width=100, height=50, color=(255, 255, 255)):
    img = Image.new("RGB", (width, height), color=color)
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "usage" in data
    assert "provider" in data


def test_model_info_endpoint():
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "provider" in data
    assert "model_name" in data
    assert "supported_image_formats" in data
    assert "capabilities" in data


def test_usage_endpoint():
    response = client.get("/api/usage")
    assert response.status_code == 200
    data = response.json()
    assert "monthly_limit" in data
    assert "used_units" in data
    assert "remaining_units" in data


def test_list_samples_endpoint():
    response = client.get("/api/samples")
    assert response.status_code == 200
    data = response.json()
    assert "samples" in data
    assert isinstance(data["samples"], list)


def test_predict_invalid_extension():
    files = {"file": ("test.txt", b"Hello world", "text/plain")}
    response = client.post("/api/predict", files=files)
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]


def test_predict_empty_image():
    files = {"file": ("empty.png", b"", "image/png")}
    response = client.post("/api/predict", files=files)
    assert response.status_code == 422
    assert "empty (0 bytes)" in response.json()["detail"]


def test_predict_corrupted_image():
    files = {"file": ("corrupt.png", b"NOT_A_VALID_IMAGE_HEADER_BYTES", "image/png")}
    response = client.post("/api/predict", files=files)
    assert response.status_code == 422
    assert "Corrupted or invalid" in response.json()["detail"]


def test_predict_mocked_success():
    img_bytes = create_test_image_bytes(200, 80)
    files = {"file": ("sample.png", img_bytes, "image/png")}

    with patch.object(VisionService, "recognize") as mock_rec:
        mock_rec.return_value = {
            "success": True,
            "recognized_text": "hello handwriting",
            "confidence": 0.95,
            "processing_time_ms": 120.0,
            "provider": "Mock Vision",
            "image_dimensions": {"width": 200, "height": 80},
            "structured_blocks": [],
            "paragraphs": [],
            "words": [{"text": "hello", "confidence": 0.95}, {"text": "handwriting", "confidence": 0.95}],
            "error": None
        }
        response = client.post("/api/predict", files=files)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["recognized_text"] == "hello handwriting"
        assert len(data["words"]) == 2


def test_predict_quota_exhausted():
    img_bytes = create_test_image_bytes(100, 50)
    files = {"file": ("sample.png", img_bytes, "image/png")}

    with patch.object(UsageService, "can_consume", return_value=False):
        response = client.post("/api/predict", files=files)
        assert response.status_code == 429
        assert "monthly usage limit reached" in response.json()["detail"]


def test_predict_sample_not_found():
    response = client.post("/api/sample", json={"sample_id": "non_existent_id_xyz"})
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]
