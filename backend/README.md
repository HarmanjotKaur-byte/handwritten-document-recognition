# SimpleHTR Backend Inference Service

Production-structured Python FastAPI backend serving the TensorFlow Handwritten Text Recognition (CRNN + CTC) model.

## Quickstart

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Test Suite
```bash
python -m pytest tests/test_api.py -v
```

### 3. Launch Development Server
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).
