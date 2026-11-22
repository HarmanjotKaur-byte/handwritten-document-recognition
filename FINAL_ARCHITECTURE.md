# Final System Architecture: Cloud Vision Handwriting Recognition

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT (BROWSER)                              │
│                                                                        │
│   React 19 + Vite 8 + Tailwind CSS v4 + Lucide React                   │
│                                                                        │
│   ┌─────────────────────┐                 ┌────────────────────────┐   │
│   │  Image Upload &     │                 │   Interactive HTML5    │   │
│   │  Preview Interface  │                 │   Drawing Canvas       │   │
│   └──────────┬──────────┘                 └───────────┬────────────┘   │
│              │                                        │                │
│              └───────────────────┬────────────────────┘                │
│                                  ▼                                     │
│                     ┌────────────────────────┐                         │
│                     │ api.js Service Client  │                         │
│                     └────────────┬───────────┘                         │
│                                  │                                     │
│   ┌──────────────────────────────┴─────────────────────────────────┐   │
│   │                                                                │   │
│   ▼                                                                ▼   │
│ ┌─────────────────────────────┐         ┌────────────────────────────┐ │
│ │  Recognition Output Card    │         │  Session History & Export  │ │
│ │  (Text, Conf, Latency, Word)│         │  (CSV, JSON, LocalStorage) │ │
│ └─────────────────────────────┘         └────────────────────────────┘ │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTP POST /api/predict (Multipart PNG/JPG)
                                   │ HTTP GET  /api/health
                                   │ HTTP GET  /api/model-info
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND SERVICE                         │
│                                                                        │
│   FastAPI Core Engine (Uvicorn ASGI, Python 3.12)                      │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ CORS Middleware & Request Validation                           │   │
│   └──────────────────────────────┬─────────────────────────────────┘   │
│                                  ▼                                     │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Application Rate Limiter & Free-Tier Budget Guard              │   │
│   │ (Caps at 950 calls/mo; enforces 10 req/min per client)         │   │
│   └──────────────────────────────┬─────────────────────────────────┘   │
│                                  ▼                                     │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Pillow / OpenCV Image Validation Pipeline                      │   │
│   │ (Size check, MIME verification, rotation normalization)        │   │
│   └──────────────────────────────┬─────────────────────────────────┘   │
│                                  ▼                                     │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Google Vision Recognition Service                              │   │
│   │ (google-cloud-vision SDK / DOCUMENT_TEXT_DETECTION)            │   │
│   └──────────────────────────────┬─────────────────────────────────┘   │
│                                  ▼                                     │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │ Output Normalization & Confidence Aggregator                   │   │
│   └──────────────────────────────┬─────────────────────────────────┘   │
└──────────────────────────────────┼─────────────────────────────────────┘
                                   │ gRPC / REST with Service Account Key
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       GOOGLE CLOUD PLATFORM                            │
│                                                                        │
│   Google Cloud Vision API (Cloud Multi-tenant Vision Engine)           │
│   - Feature: DOCUMENT_TEXT_DETECTION                                   │
│   - Neural OCR with multi-line, cursive & print handwriting models     │
│   - Built-in contextual language model correction                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
User Action (Upload / Draw)
  │
  ▼
React Client sends FormData to /api/predict
  │
  ▼
FastAPI checks Free Tier Quota (< 950 req/mo)
  ├─ [Quota Exceeded] ──> Return HTTP 429 "Free Tier Quota Reached"
  │
  ▼
Image Pre-Validation (Pillow / OpenCV ensures valid image bytes)
  │
  ▼
Google Cloud Vision Client dispatches DocumentTextDetection request
  │
  ▼
Google Cloud returns fullTextAnnotation (pages, blocks, paragraphs, words, symbols)
  │
  ▼
FastAPI calculates word-level confidences and formats clean response JSON
  │
  ▼
React displays transcription, confidence meter, latency badge, and saves to History
```
