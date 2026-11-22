import os
import sys
from pathlib import Path
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parent / "backend"))
from app.main import app

def test_endpoints():
    with TestClient(app) as client:
        print("Testing GET /api/health...")
        r = client.get("/api/health")
        assert r.status_code == 200, f"Health failed: {r.text}"
        print("Health OK:", r.json()["status"], "| Provider:", r.json()["provider"])

        print("Testing GET /api/model-info...")
        r = client.get("/api/model-info")
        assert r.status_code == 200, f"Model info failed: {r.text}"
        print("Model Info OK | Method:", r.json()["recognition_method"])

        print("Testing GET /api/usage...")
        r = client.get("/api/usage")
        assert r.status_code == 200, f"Usage failed: {r.text}"
        print("Usage OK:", r.json()["used_units"], "/", r.json()["monthly_limit"])

        print("Testing GET /api/samples...")
        r = client.get("/api/samples")
        assert r.status_code == 200, f"Samples failed: {r.text}"
        print("Samples OK, available:", len(r.json()["samples"]))

        print("Testing invalid file upload...")
        r = client.post("/api/predict", files={"file": ("test.txt", b"abc", "text/plain")})
        assert r.status_code == 400
        print("Invalid file rejected correctly (HTTP 400).")

        print("Testing empty file upload...")
        r = client.post("/api/predict", files={"file": ("empty.png", b"", "image/png")})
        assert r.status_code == 422
        print("Empty file rejected correctly (HTTP 422).")

        print("Testing sample prediction on 'user_rabbit'...")
        r = client.post("/api/sample", json={"sample_id": "user_rabbit"})
        assert r.status_code == 200, f"Sample predict failed: {r.text}"
        data = r.json()
        print("Sample Prediction OK! Result:", data["recognized_text"], f"({data['processing_time_ms']} ms)")

    print("\nALL 7 TESTS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_endpoints()
