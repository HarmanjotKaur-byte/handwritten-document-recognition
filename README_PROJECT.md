# SimpleHTR: Handwritten Text Recognition Web Suite

A production-grade, full-stack Deep Learning web application for Offline Handwritten Text Recognition (HTR) powered by TensorFlow (CRNN + CTC), FastAPI, and React (Vite + Tailwind CSS).

---

## 1. System Overview

```text
┌──────────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                      │
│                                                                  │
│  • Dashboard with model status & real-time session counters      │
│  • Dual-mode input: File Drag & Drop + HTML5 Drawing Whiteboard  │
│  • 1-Click IAM benchmark test samples                            │
│  • Interactive image rotation & preview controls                 │
│  • Instant transcription output with copy & download (.txt)      │
│  • History log with one-click CSV export                         │
│  • Interactive neural network architecture inspector             │
└─────────────────────────────────┬────────────────────────────────┘
                                  │ HTTP REST (Proxy: /api)
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Backend API (Python FastAPI)                   │
│                                                                  │
│  • Warm in-memory model session (sub-80ms inference latency)     │
│  • Asynchronous endpoints (/predict, /sample, /health, /samples) │
│  • In-memory decoding & validation (OpenCV + Pillow)             │
│  • Thread-safe singleton model execution manager                 │
└─────────────────────────────────┬────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                 Deep Learning Engine (SimpleHTR)                 │
│                                                                  │
│  • 5-Layer CNN Feature Extractor (32x height pooling)            │
│  • 2-Layer Bidirectional LSTM (256 units, 512 context channels)  │
│  • CTC BestPath Greedy Decoder                                   │
│  • Pretrained Checkpoint: snapshot-13 (IAM Offline Dataset)      │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Quickstart Guide (Run With 1 Click)

Double click the included launcher script:
```text
D:\Downloads\SimpleHTR-master\start_services.bat
```
This automatically starts both the FastAPI backend (port `8000`) and the Vite React frontend (port `5173`).

---

## 3. Manual Startup Instructions

### Step 1: Start Backend
```powershell
cd D:\Downloads\SimpleHTR-master\backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Health Check: `http://localhost:8000/api/health`
- Swagger Interactive Docs: `http://localhost:8000/docs`

### Step 2: Start Frontend
```powershell
cd D:\Downloads\SimpleHTR-master\frontend
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 4. Key Project Files

- **`backend/app/main.py`**: FastAPI application factory with lifespan model preloading.
- **`backend/app/services/model_service.py`**: In-memory TensorFlow session manager.
- **`backend/app/api/routes.py`**: Clean REST endpoints.
- **`backend/tests/test_api.py`**: 13 automated tests covering inference, upload, and error handling.
- **`frontend/src/pages/Recognize.jsx`**: Dual-mode handwriting input workspace.
- **`frontend/src/components/DrawingCanvas.jsx`**: Interactive HTML5 whiteboard for stylus/mouse drawing.
- **`frontend/src/components/ImageAdjustmentPanel.jsx`**: Image upload with rotation and metadata.
- **`frontend/src/components/RecognitionResult.jsx`**: Transcription card with copy/download controls.
- **`frontend/src/components/ModelArchitecture.jsx`**: Layer-by-layer architectural breakdown.
- **`PROJECT_AUDIT.md`**: Initial Phase 0 codebase audit.
- **`MODEL_VERIFICATION.md`**: Phase 1 empirical baseline evaluation across IAM handwriting images.
- **`BACKEND_DOCUMENTATION.md`**: Full API reference specification.
