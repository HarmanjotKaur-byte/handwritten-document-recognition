# SimpleHTR to Google Cloud Vision Migration: Project Audit

**Date**: November 22, 2026  
**Auditor**: Senior Full-Stack Engineer & AI Application Architect  
**Objective**: Comprehensive repository audit to transition from local SimpleHTR (TensorFlow 2.x + CRNN + CTC) to Google Cloud Vision API (`DOCUMENT_TEXT_DETECTION`).

---

## 1. Executive Summary

The existing repository is a hybrid handwriting recognition web application that couples a legacy 2018-era TensorFlow model (trained on the IAM Offline Handwriting dataset) with a modern FastAPI backend and a React (Vite + Tailwind CSS v4) frontend. 

While the frontend UI/UX, canvas drawing engine, session history, and REST API contracts are clean and highly polished, the backend inference pipeline suffers from severe architectural bottlenecks inherent to the legacy offline CRNN:
1. **Model Limitations**: The single-line CRNN requires rigid image aspect ratios (128x32), struggles with multi-word passages, multi-colored inks, non-white backgrounds, and complex cursive strokes without extensive heuristic preprocessing.
2. **Heavyweight & Fragile Dependencies**: The legacy TensorFlow 1.x graph running in TF2 compatibility mode requires `tensorflow>=2.16`, `tf-keras`, deprecated RNN cell wrappers (`tf.compat.v1.nn.rnn_cell.LSTMCell`), and custom `KERAS_HOME` workarounds to avoid Windows permission errors.
3. **High Latency & Resource Footprint**: The model weights (`snapshot-13`, ~35MB) consume 500MB–1.2GB RAM and require 15–30 seconds to initialize upon cold start.

Transitioning to **Google Cloud Vision API (`DOCUMENT_TEXT_DETECTION`)** solves these recognition bottlenecks, reduces server footprint to a lightweight stateless FastAPI service (<80MB RAM), and provides state-of-the-art transcription for multi-line, multi-word handwriting across diverse writing instruments.

---

## 2. Inventory of Current Implementation

### 2.1 Backend Architecture (`backend/`)
- **FastAPI Core**:
  - `backend/app/main.py`: Lifespan manager initializing the TF session, CORS middleware, API route mounting.
  - `backend/app/config.py`: Environment configurations, file size caps, allowed formats (`.png`, `.jpg`, `.jpeg`).
  - `backend/app/api/routes.py`:
    - `POST /api/predict`: Multipart image upload endpoint.
    - `POST /api/sample`: Pre-loaded test image inference endpoint.
    - `GET /api/health`: Service health and model status probe.
    - `GET /api/model-info`: Architectural metadata (currently reports CRNN, BiLSTM, CTC BestPath).
- **Inference Services**:
  - `backend/app/services/recognition_service.py`: Orchestrates image validation, cell/word slicing, preprocessing, and text post-processing.
  - `backend/app/services/model_service.py`: Singleton TensorFlow session managing `Model` from legacy `src/model.py`.
  - `backend/app/services/preprocessing.py`: Resizing, padding, and normalizations for 128x32 IAM CRNN tensor inputs.
  - `backend/app/services/text_postprocessing.py`: Levenshtein distance dictionary matching against `corpus.txt` and OCR confusion tables.
- **Image Processing Utilities**:
  - `backend/app/utils/image_utils.py`: OpenCV and Pillow routines for image validation, orientation/deskewing, table column detection (`detect_and_slice_table_cells`), notebook ruled line removal (`remove_notebook_ruled_lines`), and whitespace segmentation (`segment_natural_words`).

### 2.2 Frontend Architecture (`frontend/`)
- **Framework & Tooling**: React 19, Vite 8, Tailwind CSS v4, Lucide React icons.
- **State & Services**:
  - `frontend/src/services/api.js`: Reusable HTTP client communicating with backend endpoints (`predictImage`, `predictSample`, `getHealth`, `getModelInfo`).
  - `frontend/src/context/ThemeContext.jsx`: Dark/light mode theme provider with localStorage persistence.
- **Components**:
  - `ImageUpload.jsx`: Drag-and-drop file uploader with validation, preview, and rotation controls.
  - `DrawingCanvas.jsx`: Interactive HTML5 canvas with stroke thickness, eraser, undo, and PNG export.
  - `RecognitionCard.jsx`: Transcription output with copy-to-clipboard, text download, latency badge, and confidence meter.
  - `QuickSamples.jsx`: Preset sample selector for rapid testing.
  - `ArchitectureDiagram.jsx`: Visual representation of the recognition pipeline.
- **Pages**:
  - `Home.jsx`: Dual-mode recognition workspace (Upload vs Canvas).
  - `History.jsx`: Session recognition log stored in `localStorage` with CSV/JSON export capabilities.
  - `ModelInfo.jsx`: Educational overview of the underlying HTR pipeline.

### 2.3 Legacy SimpleHTR Model Directory (`SimpleHTR-master/`)
- `model/`: Checkpoint files (`snapshot-13.data*`, `snapshot-13.index`, `snapshot-13.meta`, `charList.txt`, `summary.json`).
- `src/`: Legacy Python 2/3 code (`model.py`, `preprocessor.py`, `dataloader_iam.py`, `main.py`).
- `data/`: Sample test images (`word.png`, `line.png`) and `corpus.txt`.

---

## 3. Reusable Assets vs Unnecessary Dependencies

### 3.1 Highly Reusable Assets (To Preserve)
| Asset | Location | Reusability |
| :--- | :--- | :--- |
| **Canvas Drawing Engine** | `frontend/src/components/DrawingCanvas.jsx` | 100% — Canvas exports standard PNG bytes; directly compatible with Vision API. |
| **Upload & Preview UX** | `frontend/src/components/ImageUpload.jsx` | 100% — Validates image formats and dimensions before dispatch. |
| **Recognition Result UI** | `frontend/src/components/RecognitionCard.jsx` | 95% — Keep copy/download/latency buttons; adapt confidence display to Vision word/symbol confidence. |
| **History & Export Module** | `frontend/src/pages/History.jsx` | 100% — Lightweight client-side persistence for recognition history with CSV/JSON export. |
| **Image Validation Utils** | `backend/app/utils/image_utils.py` | 100% — PIL/OpenCV checks for image corruption, empty bytes, and maximum file sizes. |
| **FastAPI Route Structure** | `backend/app/api/routes.py` | 90% — Endpoint signatures (`POST /api/predict`, `GET /api/health`) remain stable for seamless frontend integration. |

### 3.2 Unnecessary Dependencies (To Eliminate from Production Backend)
| Dependency | Purpose in Legacy System | Reason for Elimination |
| :--- | :--- | :--- |
| `tensorflow` | Deep Learning framework running CRNN | >1.5GB disk footprint; long cold starts; replaced by Cloud Vision API. |
| `tf-keras` | Legacy Keras v2 compatibility layer | Windows permission conflict with `.keras/keras.json`; redundant. |
| `editdistance` | Levenshtein distance for spelling correction | Cloud Vision API includes language model contextual correction out of the box. |
| `SimpleHTR-master/src/model.py` | TensorFlow 1.x computational graph | Obsolete; incompatible with modern eager execution standards. |
| `SimpleHTR-master/model/*` | Local checkpoint files (~35MB) | Replaced by Google Cloud cloud inference. |

---

## 4. Preservation Strategy for Existing Features
1. **Zero Frontend Regressions**: The user interface, theme toggle, canvas drawings, and history export will continue functioning without breaking user workflows.
2. **Preserved API Contract**: The API contract for `POST /api/predict` will continue returning `{ text, confidence, latency_ms, image_dimensions, model_name }` so existing frontend components require minimal changes.
3. **Safe Archival**: The legacy `SimpleHTR-master/` source code and model weights will be preserved in an `archive/legacy_simplehtr/` folder rather than permanently deleted, maintaining academic reproducibility.

---

## 5. Security & Configuration Requirements
- **Credential Isolation**: Google Cloud service account keys (`credentials.json`) must strictly reside on the backend file system and be referenced via `GOOGLE_APPLICATION_CREDENTIALS` or environment variables. Credentials will NEVER be bundled into frontend client code.
- **Git Hygiene**: Add `*.json` service keys and `.env` files to `.gitignore`.
- **Application-Level Free Tier Rate Limiting**: Google Cloud Vision free tier grants 1,000 requests per month. The backend must enforce in-memory sliding window rate limits (e.g., maximum requests per session/minute and monthly hard cap) to guarantee zero surprise billing.
