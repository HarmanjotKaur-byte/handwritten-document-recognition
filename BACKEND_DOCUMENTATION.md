# BACKEND DOCUMENTATION: SimpleHTR Inference API

**Version:** 1.0.0  
**Framework:** FastAPI + Uvicorn + TensorFlow 2.x  
**Service Location:** `D:\Downloads\SimpleHTR-master\backend`

---

## 1. Overview & Architecture

The SimpleHTR Backend is a production-grade asynchronous REST API serving the pretrained Convolutional Recurrent Neural Network (CRNN) with Connectionist Temporal Classification (CTC) for handwritten text recognition.

### Key Architectural Highlights:
1. **Zero-Latency In-Memory Persistence:**
   - The TensorFlow graph, session, and `snapshot-13` weights are initialized **once** during application startup using FastAPI's `lifespan` handler.
   - Subsequent requests reuse the warm session, eliminating the 7-second cold startup and achieving sub-100ms inference times.
2. **Thread Safety:**
   - Inference calls are guarded by a threading lock (`inference_lock`), preventing concurrent requests from corrupting shared graph session buffers.
3. **In-Memory Image Decoding & Validation:**
   - Accepts raw multipart byte streams directly via OpenCV and Pillow.
   - Rejects empty, corrupted, or unsupported file formats with descriptive HTTP 400 errors without saving unnecessary files to disk.
4. **CORS Enabled:**
   - Ready for direct integration with the React / Vite frontend running on `http://localhost:5173`.

---

## 2. Directory Structure

```text
backend/
├── app/
│   ├── api/
│   │   └── routes.py             # REST route handlers (/health, /model-info, /predict, /samples, /sample)
│   ├── schemas/
│   │   ├── request.py            # Pydantic input models
│   │   └── response.py           # Pydantic response models
│   ├── services/
│   │   ├── model_service.py      # Thread-safe Singleton managing TF Session and checkpoint
│   │   ├── preprocessing.py      # Dynamic width aspect-ratio image preprocessor
│   │   └── recognition_service.py# Orchestrates validation, decode, timing, and inference
│   ├── utils/
│   │   └── image_utils.py        # File validation, size checks, in-memory decoding
│   ├── config.py                 # Centralized file paths and model settings
│   └── main.py                   # FastAPI application factory and lifespan manager
├── tests/
│   └── test_api.py               # 13 automated Pytest test cases
├── requirements.txt              # Production dependency specifications
└── README.md                     # Quickstart documentation
```

---

## 3. API Reference

### 3.1 `GET /api/health`
Checks backend responsiveness and model loading state.

**Response `200 OK`:**
```json
{
  "success": true,
  "status": "healthy",
  "model_loaded": true,
  "checkpoint": "snapshot-13",
  "device": "CPU / DirectML",
  "framework": "TensorFlow 2.21.0"
}
```

---

### 3.2 `GET /api/model-info`
Returns full architectural specifications and active checkpoint details.

**Response `200 OK`:**
```json
{
  "success": true,
  "model_name": "SimpleHTR CRNN-CTC",
  "dataset": "IAM Off-line Handwriting Database",
  "checkpoint": "snapshot-13",
  "architecture": {
    "cnn_layers": 5,
    "feature_dimensions": [32, 64, 128, 128, 256],
    "recurrent_cell": "Bidirectional LSTM",
    "recurrent_layers": 2,
    "hidden_units": 256,
    "decoder_type": "CTC Best Path (Greedy)",
    "target_height": 32,
    "vocabulary_size": 79
  },
  "supported_inputs": [
    "Single Word Images",
    "Full Handwritten Text Lines"
  ],
  "capabilities": {
    "supports_line_level": true,
    "supports_word_level": true,
    "dynamic_width_scaling": true,
    "in_memory_persistence": true,
    "decoder": "CTC Best Path"
  }
}
```

---

### 3.3 `POST /api/predict`
Accepts a handwritten image through `multipart/form-data`.

**Request:**
- `file`: Image binary (`image/png`, `image/jpeg`, etc.)

**Response `200 OK`:**
```json
{
  "success": true,
  "recognized_text": "or work on line level",
  "estimated_confidence": 0.6674,
  "confidence_percentage": 66.74,
  "processing_time_ms": 32.15,
  "model_name": "SimpleHTR CRNN-CTC",
  "image_width": 818,
  "image_height": 70,
  "error": null
}
```

**Error Responses:**
- `400 Bad Request`: Empty image, unsupported file extension, corrupted image bytes, or dimensions $< 5 \times 5$.

---

### 3.4 `GET /api/samples`
Returns verified sample reference handwriting images available on the server.

**Response `200 OK`:**
```json
{
  "success": true,
  "samples": [
    {
      "id": "word_sample",
      "filename": "word.png",
      "description": "Standard single-word IAM handwriting sample",
      "ground_truth": "word",
      "category": "single_word"
    },
    {
      "id": "line_sample",
      "filename": "line.png",
      "description": "Standard multi-word text line sample",
      "ground_truth": "or work on line level",
      "category": "text_line"
    }
  ]
}
```

---

### 3.5 `POST /api/sample`
Executes instant recognition on a server sample without uploading an image.

**Request Body (`application/json`):**
```json
{
  "sample_id": "word_sample"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "recognized_text": "word",
  "estimated_confidence": 0.9806,
  "confidence_percentage": 98.06,
  "processing_time_ms": 24.12,
  "model_name": "SimpleHTR CRNN-CTC",
  "image_width": 174,
  "image_height": 61,
  "error": null
}
```

---

## 4. Test Suite Execution

Automated tests are implemented in `backend/tests/test_api.py` covering:
- Service root & health endpoints.
- Model metadata inspection.
- Sample catalog listing and execution.
- Upload predictions on valid word and multi-word text lines.
- Rejection of empty file uploads.
- Rejection of corrupted image payloads.
- Rejection of disallowed file extensions.
- Concurrency and warm-session repeated performance benchmark.

### Running Tests:
```powershell
python -m pytest D:\Downloads\SimpleHTR-master\backend\tests\test_api.py -v
```

**Result:**
```text
======================= 13 passed in 6.56s ========================
```

---

## 5. Running the Backend Server

To start the FastAPI backend service on port `8000`:
```powershell
cd D:\Downloads\SimpleHTR-master\backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger documentation will be available at:  
`http://localhost:8000/docs`
