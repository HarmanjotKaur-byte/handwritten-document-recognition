# SimpleHTR Vision Backend API Documentation

**Base URL**: `http://localhost:8000`  
**API Prefix**: `/api`  
**Authentication**: Managed server-side via `GEMINI_API_KEY` (no client auth token required)  

---

## Endpoints

### 1. Service Health Probe
- **Method**: `GET`
- **Path**: `/api/health`
- **Description**: Returns server operational status, Google Vision client readiness, and usage budget metrics.
- **Response (200 OK)**:
```json
{
  "status": "healthy",
  "service": "SimpleHTR Vision API Backend",
  "api_configured": true,
  "provider": "Google Gemini Vision (gemini-3.5-flash-lite)",
  "usage": {
    "current_month": "2026-11",
    "used_units": 1,
    "monthly_limit": 900,
    "remaining_units": 899,
    "is_quota_exhausted": false
  }
}
```

---

### 2. Model & Engine Information
- **Method**: `GET`
- **Path**: `/api/model-info`
- **Description**: Returns technical metadata about the underlying Vision model.
- **Response (200 OK)**:
```json
{
  "provider": "Google DeepMind / Google AI Studio",
  "model_name": "gemini-3.5-flash-lite",
  "recognition_method": "Multimodal Neural Vision Transformer (Document Text & Handwritten)",
  "supported_image_formats": ["PNG", "JPG", "JPEG", "WEBP"],
  "supported_input_types": ["Photo Upload", "Canvas Whiteboard Drawing", "Document Page Scans"],
  "capabilities": [
    "Single-word handwriting recognition",
    "Multi-word text line recognition",
    "Full page and paragraph transcription",
    "Highlighter and colored ink resilience",
    "Table and ruled line insensitivity"
  ],
  "description": "High-performance multimodal handwriting recognition model capable of transcribing cursive, print, and mixed handwriting across various media."
}
```

---

### 3. Application Usage Status
- **Method**: `GET`
- **Path**: `/api/usage`
- **Description**: Returns current free tier consumption and monthly budget limit.
- **Response (200 OK)**:
```json
{
  "current_month": "2026-11",
  "used_units": 1,
  "monthly_limit": 900,
  "remaining_units": 899,
  "is_quota_exhausted": false
}
```

---

### 4. Available Demonstration Samples
- **Method**: `GET`
- **Path**: `/api/samples`
- **Description**: Lists pre-loaded handwriting samples available for instant testing.
- **Response (200 OK)**:
```json
{
  "samples": [
    { "id": "word", "name": "word.png", "description": "Single word handwritten sample" },
    { "id": "line", "name": "line.png", "description": "Full text line handwritten sample" },
    { "id": "user_rabbit", "name": "crop_rabbit.png", "description": "Handwriting on green highlighter" },
    { "id": "user_red", "name": "crop_red.png", "description": "Handwriting in red ink" },
    { "id": "user_multi", "name": "exact_multi.png", "description": "Multi-word boxed table cells" }
  ]
}
```

---

### 5. Handwritten Image Prediction
- **Method**: `POST`
- **Path**: `/api/predict`
- **Content-Type**: `multipart/form-data`
- **Form Parameters**:
  - `file`: The image binary (PNG, JPG, JPEG, WEBP; max 10MB).
- **Response (200 OK)**:
```json
{
  "success": true,
  "recognized_text": "rabbit",
  "confidence": 0.95,
  "processing_time_ms": 2084.17,
  "provider": "Google Gemini Vision (gemini-3.5-flash-lite)",
  "image_dimensions": {
    "width": 177,
    "height": 57
  },
  "structured_blocks": [
    {
      "block_index": 0,
      "text": "rabbit",
      "confidence": 0.95,
      "paragraphs": [...]
    }
  ],
  "paragraphs": [...],
  "words": [
    {
      "text": "rabbit",
      "confidence": 0.95,
      "bounding_box": null
    }
  ],
  "error": null
}
```
- **Error Codes**:
  - `400 Bad Request`: Unsupported file extension.
  - `422 Unprocessable Content`: Empty (0-byte) or corrupted image file.
  - `429 Too Many Requests`: Monthly free tier usage limit (900 units) reached.
  - `504 Gateway Timeout`: API call exceeded 15 seconds.

---

### 6. Sample Image Prediction
- **Method**: `POST`
- **Path**: `/api/sample`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "sample_id": "user_rabbit"
}
```
- **Response (200 OK)**: Identical to `/api/predict`.
