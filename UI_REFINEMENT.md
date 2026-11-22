# DESIGN SPECIFICATION & UI/UX REFINEMENT: SimpleHTR

**Date:** 2026-11-22  
**Target:** Academic & Portfolio Research Platform  
**Design Tokens:** Tailored Dark & Light Theme, High-Contrast Typography, Smooth Transitions  

---

## 1. Design System Overview

The SimpleHTR interface has been refined into an AI research demonstration application:
- **Dual-Mode Theme Support:** Seamless toggle between **Light Theme** (clean slate and white background) and **Dark Theme** (deep navy `#090d16` and obsidian card surfaces) with localStorage persistence and OS preference detection.
- **Color Palette:**
  - Primary Accent: Deep Blue (`#2563eb` / `#3b82f6`) representing computational intelligence.
  - Success State: Emerald (`#10b981`) for warm sessions, low CER, and copied notifications.
  - Warning State: Amber (`#f59e0b`) for connecting indicators.
  - Error State: Rose (`#f43f5e`) for validation and model exceptions.
- **Card Styling:** Soft double-border aesthetics (`shadow-2xs`), rounded corners (`rounded-2xl`), and subtle hover border lighting.
- **Custom Scrollbar:** Compact rounded scrollbar integrated for dark and light views.

---

## 2. Interactive Enhancements

1. **Floating Toast System ([`components/Toast.jsx`](file:///D:/Downloads/SimpleHTR-master/frontend/src/components/Toast.jsx)):**
   - Non-intrusive notifications for events:
     - Transcription completed with text snippet and latency.
     - History exported (CSV, JSON).
     - Records removed or cleared.
2. **Side-by-Side Recognition Workspace:**
   - Visual distinction between **Input Handwriting** (original slice or canvas drawing) and **Transcribed Text Output**.
   - Input metadata badge showing width, height, and resolution.
   - One-click copy, individual `.txt` text download, and session history integration.
3. **Responsive Navigation:**
   - Desktop: Glassmorphic top navigation bar with active tab pills, theme switcher, and live warm session pill.
   - Mobile / Tablet: Smooth sliding drawer navigation with touch-friendly spacing.
4. **Drawing Canvas Whiteboard:**
   - Adjustable stroke thickness (Fine, Medium, Thick), 15-state undo stack, clear canvas, and PNG export.
   - Stylus, finger touch, and mouse tracking.

---

## 3. Accessibility & Usability Standards

- **Keyboard Navigation:** All interactive controls (tabs, file selectors, theme toggles, copy buttons) have explicit `:focus-visible` outlines and keyboard handlers.
- **Contrast Ratios:** Compliant with WCAG AA standard across light and dark modes.
- **Truthful Transparency:** Confidence metrics clearly state they represent CTC joint alignment probabilities; session stats are distinguished from model benchmark accuracy.
