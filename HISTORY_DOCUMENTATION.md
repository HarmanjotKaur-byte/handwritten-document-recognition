# Recognition History Documentation

## Overview

The **Handwritten Document Recognition System (HDRS)** features a persistent, privacy-preserving session history module. Every handwriting transcription executed via file upload, interactive drawing canvas, or benchmark sample is automatically captured, structured, and presented to the user.

---

## 1. Schema & Data Storage

History items are stored locally in the browser via `localStorage` under the key:
```javascript
const LOCAL_STORAGE_KEY = 'hdrs_session_history_v2';
```

### Record Model Schema
```typescript
interface RecognitionRecord {
  id: string;                     // Unique record UUID (e.g., 'rec_1732279200000_a1b2')
  timestamp: string;              // Wall-clock formatted timestamp
  source: string;                 // 'image_upload' | 'drawing_canvas' | 'sample (name)'
  recognized_text: string;        // Normalized transcription text
  paragraphs: Array<{             // Paragraph structural breakdown
    text: string;
    paragraph_index: number;
    bounding_box?: Array<[number, number]>;
  }>;
  words: Array<{                  // Word-level token structure
    text: string;
    word_index: number;
  }>;
  processing_time_ms: number;     // Real-time API round-trip execution duration
  confidence_percentage?: number; // Normalized posterior score if provided
  image_dimensions?: {            // Resolution metadata
    width: number;
    height: number;
  };
  provider: string;               // Recognition engine (e.g. 'gemini-3.5-flash-lite')
  status: 'success' | 'empty';    // Operational outcome indicator
}
```

---

## 2. Privacy & Lightweight Storage Strategy

### Ephemeral Image References
- Full-resolution binary images and Base64 data URIs can easily exceed the 5MB browser `localStorage` quota and introduce privacy risks for confidential handwriting.
- HDRS creates an ephemeral object URL (`URL.createObjectURL(file)`) strictly for live UI inspection during the active session.
- When serializing to `localStorage`, the storage synchronizer automatically strips `previewUrl`:
  ```javascript
  const sanitized = history.map(({ previewUrl, ...rest }) => rest);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
  ```
- **Zero Server-Side Persistence**: Input handwriting images are held strictly in volatile RAM on the FastAPI server during inference and never saved to server disk or public cloud buckets.

---

## 3. Interactive Capabilities

1. **Record Inspector Modal**: Clicking the open icon displays the full transcription, execution telemetry, timestamp, and dimensional metrics.
2. **In-Place Transcription Editing**: Users can edit recognized text directly in the table or inspector modal to correct any ambiguities before exporting. Changes persist to `localStorage`.
3. **Copy to Clipboard**: Instant one-click copy with positive confirmation icon.
4. **Individual Record Deletion**: Clean removal of specific records.
5. **Clear All History**: Wipes the active history state and clears `localStorage`.
6. **Real-time Filter & Search**: Search across past transcriptions and input modes instantly.
