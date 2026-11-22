# SimpleHTR Web Suite - Frontend

Modern AI-powered document intelligence & handwriting recognition application built with **React**, **Vite**, **Tailwind CSS**, and **Lucide Icons**.

---

## 1. Features

- **Dashboard / Home**: Executive summary of model readiness, architecture metrics, and real-time session counters.
- **Handwriting Recognition Workspace**:
  - Drag-and-drop or file browser upload for single words and multi-word text lines.
  - 1-click test benchmarks from verified IAM dataset samples.
  - Real-time transcription display with instant clipboard copy.
  - Precise millisecond inference latency and confidence metrics.
- **Session History Log**: Tabular record of all session predictions with one-click **CSV export**.
- **Model Architecture Explorer**: Comprehensive visual specs of the 5-layer CNN, 2-layer BiLSTM, and CTC BestPath decoding pipeline.
- **Project Information**: Dataset details, academic citations (IAM / Master thesis by Harald Scheidl), and tech stack references.

---

## 2. Directory Structure

```text
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx             # Top bar with responsive navigation & status pill
│   │   ├── Footer.jsx             # Footer with framework badges
│   │   ├── DashboardCard.jsx      # Metric cards with accent colors
│   │   ├── UploadPanel.jsx        # Drag & drop file uploader + sample presets
│   │   ├── RecognitionResult.jsx  # Transcription card with copy button & metrics
│   │   ├── HistoryTable.jsx       # Historical table with CSV download
│   │   ├── ModelArchitecture.jsx  # CNN/BiLSTM/CTC layer inspector
│   │   ├── LoadingIndicator.jsx   # Animated spinner with stage explanation
│   │   └── ErrorMessage.jsx       # Alert box with retry trigger
│   ├── pages/
│   │   ├── Home.jsx               # Main hero & dashboard
│   │   ├── Recognize.jsx          # Recognition workspace
│   │   └── ProjectInfo.jsx        # Academic specifications & citations
│   ├── services/
│   │   └── api.js                 # Typed fetch client connecting to FastAPI
│   ├── App.jsx                    # Root layout & tab router
│   ├── index.css                  # Tailwind CSS root styles
│   └── main.jsx                   # Vite entry point
├── package.json
└── vite.config.js                 # Vite config with backend proxy on /api
```

---

## 3. Development & Build

### Install Dependencies
```bash
npm install
```

### Run Dev Server (with API Proxy)
Ensure the FastAPI backend is running on `http://localhost:8000`:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
```
The compiled assets will be output in `dist/`.
