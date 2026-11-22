# SimpleHTR to Google Cloud Vision Migration Plan

**Date**: November 22, 2026  
**Status**: Planning / Architecture Ready (Phase 0 Complete)

---

## 1. Migration Overview

The migration transitions the handwriting recognition system from an offline single-line TensorFlow model (SimpleHTR CRNN-CTC) to Google Cloud Vision API (`DOCUMENT_TEXT_DETECTION`). The goal is to maximize recognition accuracy across single words, full text lines, sentences, and multi-line paragraphs while dramatically reducing server resource consumption and eliminating brittle deep-learning runtime issues.

---

## 2. Phased Migration Roadmap

```
  Phase 0: Project Audit & Migration Planning (CURRENT)
      │
      ▼
  Phase 1: Environment Setup & Safe Archival
      │   ├── Archive legacy TensorFlow codebase & model checkpoints to archive/
      │   ├── Configure google-cloud-vision SDK in backend
      │   └── Establish secure credential & environment variable management
      ▼
  Phase 2: Google Cloud Vision Integration Service
      │   ├── Implement VisionRecognitionService (DOCUMENT_TEXT_DETECTION)
      │   ├── Implement response parser & confidence normalizer
      │   ├── Implement strict free-tier application-level rate limiter
      │   └── Run end-to-end verification against real test images
      ▼
  Phase 3: Backend API Adaptation & Clean-up
      │   ├── Update POST /api/predict to route through Vision service
      │   ├── Update GET /api/model-info to reflect Cloud Vision engine & quota
      │   ├── Update GET /api/health with Cloud Vision readiness check
      │   └── Purge TensorFlow, tf-keras, and legacy Keras hooks from backend
      ▼
  Phase 4: Frontend UI/UX Refinement
      │   ├── Update ArchitectureDiagram.jsx to reflect Cloud Vision pipeline
      │   ├── Update ModelInfo.jsx with Vision API documentation & free tier limits
      │   ├── Enhance RecognitionCard.jsx to display paragraphs and word breakdowns
      │   └── Maintain full compatibility with Canvas and Upload workflows
      ▼
  Phase 5: End-to-End Verification & Documentation
          ├── Verify handwriting test cases (rabbit, red, multi-word passages)
          ├── Benchmark latency and memory consumption (<80MB RAM vs >1GB)
          └── Update README.md and API documentation
```

---

## 3. Safe Archival Strategy

To ensure historical project work and academic reproducibility remain intact:
1. **Archive Directory**: Create `archive/legacy_simplehtr/`.
2. **Files to Move**:
   - `SimpleHTR-master/` (the entire upstream subproject including `model/` and `src/`).
   - Old model test scripts: `test_load.py`, `test_raw_vs_adapt.py`, `test_cv_channels.py`, `debug_gray.py`, `verify_all.py`.
   - Legacy Keras isolation folder: `.keras/`.
3. **Active Repository Footprint**:
   - `backend/`: Pure lightweight FastAPI application (Pillow, OpenCV, google-cloud-vision, uvicorn, pydantic).
   - `frontend/`: React + Vite + Tailwind CSS application.
   - `test_dataset/`: Real-world handwriting samples for regression and verification.

---

## 4. Google Cloud Vision API Integration Architecture

### 4.1 Service Design (`backend/app/services/vision_service.py`)
- **API Feature**: `vision.Feature.Type.DOCUMENT_TEXT_DETECTION` (specifically optimized for dense handwritten documents and non-standard alignments).
- **Authentication**:
  - Checks for `GOOGLE_APPLICATION_CREDENTIALS` environment variable pointing to a service account key JSON file.
  - Supports inline service account JSON payload via environment variable `GCP_SERVICE_ACCOUNT_JSON` for cloud deployment platforms (Render, Railway, Fly.io).
  - Falls back gracefully with informative error messages if credentials are missing or unconfigured.

### 4.2 Response Normalization
Google Cloud Vision returns a hierarchical annotation structure:
$$\text{Full Text} \longrightarrow \text{Pages} \longrightarrow \text{Blocks} \longrightarrow \text{Paragraphs} \longrightarrow \text{Words} \longrightarrow \text{Symbols}$$

The backend service normalizes this output into the existing frontend contract:
```json
{
  "text": "rabbit",
  "confidence": 0.942,
  "words": [
    { "text": "rabbit", "confidence": 0.942 }
  ],
  "latency_ms": 182.4,
  "model_name": "Google Cloud Vision API (Document Text)",
  "quota_remaining": 984
}
```

### 4.3 Free-Tier Quota & Cost Guardrails
Google Cloud Vision provides **1,000 free units/month** under its free tier:
- **In-Memory Hard Limit**: The backend maintains a persistent counter (`data/usage_tracker.json`) that limits monthly requests to 950 (leaving a 50-request safety margin).
- **Session Rate Limiting**: Limit individual client IP addresses to 10 requests per minute to prevent accidental spam or abuse.
- **Fail-Safe Behavior**: If the limit is reached, return HTTP 429 (`Monthly Free Tier limit reached. Contact administrator to reset or upgrade.`) without triggering paid Google Cloud API overages.

---

## 5. Security & Secret Management

1. **Rule**: Google Cloud service account keys (`*.json`) must never be placed inside `frontend/` or committed to source control.
2. **Git Protection**:
   - Explicitly ignore `backend/credentials*.json`, `*.pem`, and `.env` files in root `.gitignore`.
3. **Frontend Decoupling**: The React frontend never interacts with Google Cloud directly; all authentication and rate-limiting enforcement occurs strictly on the FastAPI backend.
