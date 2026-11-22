# Evaluator & Teacher User Testing Guide

This guide is written specifically for teachers, examiners, and evaluators who wish to test the Handwritten Document Understanding System without inspecting the codebase.

---

## 1. Quick Test Demonstration (2 Minutes)

Follow these steps to test the application in real time:

```
[ Step 1: Open Browser ]  -->  [ Step 2: Sign In ]  -->  [ Step 3: Test Sample ]  -->  [ Step 4: Inspect Result & Q&A ]
```

1. **Open Application**: Navigate to `http://localhost:5173` in your browser.
2. **Landing Page Overview**:
   - Review the 4-step feature overview cards (*Upload or Draw &rarr; Instant AI Transcription &rarr; AI Analysis & Q&A &rarr; Multi-Format Export & DB Save*).
   - Test the **Dark / Light theme toggle** button (Moon/Sun icon) in the header.
3. **Sign In**:
   - Click **"Sign In"** or create a test account (e.g. `teacher@college.edu`).
   - Notice the smooth transition into the purple-and-white dashboard.
4. **Test Quick Samples (Zero-Upload Test)**:
   - On the left sidebar, click **"Upload Document"**.
   - Under the upload area, inspect the **"Quick Test Samples for Teacher"** gallery.
   - Click on any handwritten image card (e.g. `irish_blessing.jpg` or `positive_sides.jpg`).
   - The application will process the image and immediately open the **Post-OCR Document Workspace**.

---

## 2. Testing the Post-OCR Workspace Features

When the transcription opens:

### A. Side-by-Side Verification
- On the left panel, view the original handwriting image. Test the **Zoom controls** (`-`, `+`, `Reset`).
- On the right panel, observe the transcribed text.

### B. Automatic Document Classification
- Look at the badge next to the document title.
- The AI automatically categorizes the text (e.g., `Quote / Blessing / Poetry` or `Notes`) with a confidence score without requiring user manual tagging.

### C. Version Separation & Rollback
- Modify a word in the **Editable Text** box.
- Notice the view toggle options: **"Editable Text"** vs **"Original Output"**.
- Click **"Rollback to Original"** to see your manual edits instantly revert back to the exact initial model output.

### D. Semantic Insights (Summarize, Key Points, Q&A)
- Click **"Summarize"**: Reads an abstracted summary of the document.
- Click **"Extract Key Points"**: Extracts core bulleted points, named entities, and dates.
- Click **"Ask Questions"**: Select one of the dynamic recommended questions to receive an answer grounded strictly in the document text.

### E. Database Persistence & Export
- Click **"Save Document"**: Saves the record to your personal SQLite database.
- Click **"Export"**: Select **DOCX**, **PDF**, **TXT**, or **JSON** to download the document.
- In the left sidebar, click **"Saved Documents"** to verify that your saved document appears in your library and persists across logins.

---

## 3. Testing Real-World Uploads & Canvas Drawing

1. **Upload Your Own Handwriting**:
   - In the sidebar, click **"Upload Document"**.
   - Drag and drop any `.jpg`, `.png`, or `.webp` handwriting photo from your phone or computer.
   - Click **"Recognize Upload"**.
2. **Interactive Drawing Canvas**:
   - In the sidebar, click **"Drawing Canvas"**.
   - Draw handwritten characters or words using your mouse or touchscreen.
   - Click **"Transcribe Writing"** to test handwriting recognition on digital ink strokes.

---

## 4. Troubleshooting Common Scenarios

| Scenario | Cause | Solution |
|---|---|---|
| **"Cannot reach backend server"** | FastAPI service is not running | Start backend with `python run.py` in the `backend/` directory. |
| **"Monthly usage limit reached"** | 900 request limit exceeded | Inspect the Credits pill in the top header (`Credits: X / 900`). Limit automatically resets each calendar month. |
| **"Unsupported file format"** | Uploading `.pdf` directly to single-image route | Upload JPG, PNG, or WebP image files. |
