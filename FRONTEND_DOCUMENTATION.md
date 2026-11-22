# Handwritten Document Recognition System — Frontend Architecture

**Application**: Handwritten Document Recognition System (HDRS)  
**Framework**: React 19 + Vite 8 + Tailwind CSS v4 + Lucide React  
**Production Build**: Built in 978ms (`dist/index.html`, `dist/assets/*`)  
**URL**: `http://localhost:5173`  

---

## 1. Application Identity & Styling

- **Theme & Colors**:
  - Clean white & light slate backgrounds with dark navy/slate accents.
  - Dark mode support powered by `ThemeContext` with `localStorage` persistence.
  - Subtle shadows, rounded cards (`rounded-2xl`, `rounded-3xl`), restrained gradients, and smooth state transitions.
- **Typography**: Inter / sans-serif with monospace metric telemetry badges.

---

## 2. Page Hierarchy

| Page | Route ID | Primary Responsibility |
| :--- | :--- | :--- |
| **Dashboard** | `home` | System overview, active API connection status, monthly usage tracker (`used / limit`), remaining allowance, session query counter, and recent activity. |
| **Handwriting Recognition** | `recognize` | Dual-mode workspace: Drag-and-drop file upload with rotation controls OR interactive HTML5 drawing canvas whiteboard, with real-time transcription cards. |
| **Recognition History** | `history` | Session history log stored in `localStorage`, per-record preview, copy text, delete item, clear history, and CSV / JSON export. |
| **Model Information** | `about` | 5-stage architectural pipeline diagram, multimodal transformer overview, supported mediums, and operational guardrails. |
| **About Project** | `project` | Academic problem scope, system milestones, verified technology stack components, and security/free-tier guarantees. |

---

## 3. Reusable Component Catalog

- `Navbar.jsx`: Responsive sticky navigation bar with application branding, tab switching, active API status indicator, theme switcher, and mobile drawer.
- `DashboardCard.jsx`: Reusable metric card with icon badge, title, primary value, subtext, and trend pill.
- `UploadPanel.jsx`: Drag-and-drop file upload with format validation, preview thumbnail, and 90° rotation controls.
- `DrawingCanvas.jsx`: High-DPI interactive HTML5 whiteboard with stroke width selector, eraser, undo stack, and direct PNG export.
- `RecognitionResult.jsx`: Output transcription display with copy-to-clipboard, text download, latency badge, and structured block inspector.
- `ModelArchitecture.jsx`: Educational 5-stage architecture pipeline visualizer.
- `HistoryTable.jsx`: Filterable session recognition history table with CSV/JSON export.
- `Toast.jsx`: Non-intrusive notification banner for clipboard and transcription feedback.
- `Footer.jsx`: Clean footer with architecture tags and API health status.

---

## 4. Production Build Verification

Executed `npm run build` with Vite:
```
✓ 2144 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.29 kB
dist/assets/index-BhU6_zUs.css   47.94 kB │ gzip:  8.58 kB
dist/assets/index-DA7ej3qG.js   304.36 kB │ gzip: 89.25 kB
✓ built in 978ms
```
