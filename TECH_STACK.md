# Technology Stack Specifications

## 1. System Environment & Runtimes

| Component | Verified Local Version | Minimum Required Version |
| :--- | :--- | :--- |
| **Python** | `3.12.10` (64-bit AMD64) | `>= 3.10` |
| **Node.js** | `v24.15.0` | `>= 18.0.0` |
| **npm** | `11.12.1` | `>= 9.0.0` |
| **Host OS** | Windows 11 Pro | Windows / Linux / macOS |

---

## 2. Frontend Technology Stack

| Layer | Library / Tool | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | React | `^19.3.1` | Component-based UI layer |
| **Bundler & Dev Server** | Vite | `^8.3.6` | Fast ESM build tool and development server |
| **Styling** | Tailwind CSS | `^4.3.5` | Utility-first responsive design system |
| **Icons** | Lucide React | `^1.77.0` | Modern SVG iconography |
| **Class Utilities** | `clsx`, `tailwind-merge` | Latest | Conditional styling and Tailwind class merging |
| **Canvas Engine** | HTML5 Canvas API | Native | High-DPI interactive handwriting drawing whiteboard |
| **Storage** | Browser LocalStorage | Native | Persistent session recognition history and theme mode |

---

## 3. Backend Technology Stack

| Layer | Library / Tool | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Web Framework** | FastAPI | `>= 0.110.0` | High-performance asynchronous REST API framework |
| **ASGI Server** | Uvicorn | `>= 0.28.0` | Production ASGI web server |
| **Validation** | Pydantic v2 | `>= 2.0.0` | Request and response schema typing |
| **Form Handling** | `python-multipart` | `>= 0.0.9` | Multipart form-data parser for image uploads |
| **Image Processing** | Pillow (PIL) | `>= 10.0.0` | Image verification, metadata extraction, format conversions |
| **Computer Vision** | OpenCV (`opencv-python`) | `>= 4.8.0` | Aspect ratio analysis, image matrix transformations |
| **Cloud AI Client** | `google-cloud-vision` | `>= 3.7.0` | Official Google Cloud Vision API SDK client |
| **HTTP Client** | `httpx` | `>= 0.27.0` | Asynchronous test client and webhook integrations |
| **Testing** | Pytest | `>= 8.0.0` | Automated unit and integration testing suite |

---

## 4. Cloud AI Infrastructure

| Attribute | Specification |
| :--- | :--- |
| **Provider** | Google Cloud Platform (GCP) |
| **Service** | Google Cloud Vision API |
| **Target Feature** | `DOCUMENT_TEXT_DETECTION` |
| **Pricing Tier** | Free Tier (1,000 units / month free) |
| **Budget Enforcement** | Application-level circuit breaker at 950 calls/month |
| **Primary Recognition Target** | English handwritten text (single words, lines, full paragraphs) |
| **Authentication** | Service Account JSON Key via `GOOGLE_APPLICATION_CREDENTIALS` |
| **Fallback Policy** | Strict Free Tier — No automatic paid fallback |
