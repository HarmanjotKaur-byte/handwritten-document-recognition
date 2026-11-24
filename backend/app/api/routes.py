import os
import io
import logging
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Query, Response
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any, Optional

from app.schemas.response import (
    HealthResponse,
    ModelInfoResponse,
    PredictionResponse,
    UsageStatusResponse
)
from app.schemas.request import SamplePredictionRequest
from app.schemas.document_schemas import (
    UserSignupRequest,
    UserLoginRequest,
    DocumentCreateRequest,
    DocumentUpdateRequest,
    SummarizeRequest,
    KeyPointsRequest,
    RecommendedQuestionsRequest,
    AskQuestionRequest,
    ClassifyTextRequest,
    ExportDocumentRequest
)
from app.services.vision_service import VisionService
from app.services.usage_service import UsageService
from app.services.understanding_service import DocumentUnderstandingService
from app.services.export_service import DocumentExportService
from app.services.document_storage import DocumentStorageService
from app.services.auth_service import AuthService

logger = logging.getLogger("simplehtr.routes")
router = APIRouter(prefix="/api", tags=["Recognition & Post-OCR Document Workspace"])

SAMPLE_DIR = Path(__file__).resolve().parent.parent.parent.parent / "test_dataset"
REPO_DATA_DIR = Path(__file__).resolve().parent.parent.parent.parent / "SimpleHTR-master" / "data"

AVAILABLE_SAMPLES = [
    {"id": "irish_blessing", "name": "irish_blessing.jpg", "description": "Calligraphy quotation: 'May the saddest day of your future...'", "path": SAMPLE_DIR / "irish_blessing.jpg", "image_url": "/samples/irish_blessing.jpg"},
    {"id": "positive_sides", "name": "positive_sides.jpg", "description": "Neat cursive notebook rule: 'If you can see the positive sides...'", "path": SAMPLE_DIR / "positive_sides.jpg", "image_url": "/samples/positive_sides.jpg"},
    {"id": "sticky_note", "name": "sticky_note.jpg", "description": "Real desk monitor sticky note: 'It's not about waiting for that one moment...'", "path": SAMPLE_DIR / "sticky_note.jpg", "image_url": "/samples/sticky_note.jpg"},
    {"id": "user_rabbit", "name": "crop_rabbit.png", "description": "Handwriting on green highlighter ('rabbit')", "path": Path("crop_rabbit.png"), "image_url": "/samples/crop_rabbit.png"},
    {"id": "user_red", "name": "crop_red.png", "description": "Cursive written in red ink ('you')", "path": Path("crop_red.png"), "image_url": "/samples/crop_red.png"},
    {"id": "word", "name": "word.png", "description": "Single word cursive handwriting ('word')", "path": REPO_DATA_DIR / "word.png", "image_url": "/samples/word.png"},
    {"id": "line", "name": "line.png", "description": "Full text line handwritten sample", "path": REPO_DATA_DIR / "line.png", "image_url": "/samples/line.png"}
]


# ==========================================
# CORE RECOGNITION & SYSTEM ENDPOINTS
# ==========================================

@router.get("/health", response_model=HealthResponse)
async def get_health():
    vision_service = VisionService.get_instance()
    usage_service = UsageService.get_instance()

    return HealthResponse(
        status="healthy",
        service="SimpleHTR Vision API Backend",
        api_configured=vision_service.is_configured(),
        provider=f"Google Gemini Vision ({vision_service.model_name})",
        usage=UsageStatusResponse(**usage_service.get_status())
    )


@router.get("/model-info", response_model=ModelInfoResponse)
async def get_model_info():
    vision_service = VisionService.get_instance()
    return ModelInfoResponse(
        provider="Google DeepMind / Google AI Studio",
        model_name=vision_service.model_name,
        recognition_method="Multimodal Neural Vision Transformer (Document Text, Handwritten & PDF)",
        supported_image_formats=["PNG", "JPG", "JPEG", "WEBP", "BMP", "PDF"],
        supported_input_types=["Photo Upload", "Canvas Whiteboard Drawing", "Document Page Scans", "Short & Long Multi-Page PDFs"],
        capabilities=[
            "Single-word handwriting recognition",
            "Multi-word text line recognition",
            "Full page and paragraph transcription",
            "Multi-page PDF document processing",
            "Highlighter and colored ink resilience",
            "Table and ruled line insensitivity"
        ],
        description="High-performance multimodal handwriting recognition model capable of transcribing cursive, print, and mixed handwriting across various media and multi-page PDFs without heuristic stroke distortion."
    )


@router.get("/usage", response_model=UsageStatusResponse)
async def get_usage():
    usage_service = UsageService.get_instance()
    return UsageStatusResponse(**usage_service.get_status())


@router.get("/samples")
async def list_samples():
    samples = []
    for s in AVAILABLE_SAMPLES:
        resolved = s["path"]
        if not resolved.is_absolute():
            resolved = Path(__file__).resolve().parent.parent.parent.parent / s["path"]
        if resolved.exists():
            samples.append({
                "id": s["id"],
                "name": s["name"],
                "description": s["description"],
                "image_url": s.get("image_url", f"/samples/{s['name']}")
            })
    return {"samples": samples}


@router.post("/predict", response_model=PredictionResponse)
async def predict_image(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file uploaded.")

    ext = Path(file.filename).suffix.lower()
    allowed_extensions = [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".pdf"]
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed: .png, .jpg, .jpeg, .webp, .bmp, .pdf"
        )

    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Failed to read file: {e}")

    vision_service = VisionService.get_instance()
    try:
        result = await vision_service.recognize(content, filename=file.filename)
        return PredictionResponse(**result)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(ve))
    except RuntimeError as re:
        msg = str(re)
        if "monthly usage limit reached" in msg.lower():
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=msg)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=msg)
    except TimeoutError as te:
        raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail=str(te))
    except Exception as e:
        logger.error(f"Unexpected recognition error: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Inference error: {str(e)}")


@router.post("/sample", response_model=PredictionResponse)
async def predict_sample(payload: SamplePredictionRequest):
    sample_match = None
    for s in AVAILABLE_SAMPLES:
        if s["id"] == payload.sample_id or s["name"] == payload.sample_id:
            sample_match = s
            break

    if not sample_match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample '{payload.sample_id}' not found. Call GET /api/samples for available IDs."
        )

    file_path = sample_match["path"]
    if not file_path.is_absolute():
        file_path = Path(__file__).resolve().parent.parent.parent.parent / file_path

    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Sample file '{sample_match['name']}' not found on server disk."
        )

    with open(file_path, "rb") as f:
        content = f.read()

    vision_service = VisionService.get_instance()
    try:
        result = await vision_service.recognize(content)
        return PredictionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# ==========================================
# AUTHENTICATION ENDPOINTS
# ==========================================

@router.post("/auth/signup")
async def user_signup(payload: UserSignupRequest):
    try:
        user = AuthService.signup(payload.name, payload.email, payload.password)
        return {"success": True, "user": user}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))


@router.post("/auth/login")
async def user_login(payload: UserLoginRequest):
    try:
        user = AuthService.login(payload.email, payload.password)
        return {"success": True, "user": user}
    except ValueError as ve:
        raise HTTPException(status_code=401, detail=str(ve))


# ==========================================
# POST-OCR DOCUMENT UNDERSTANDING & TOOLS
# ==========================================

@router.post("/documents/classify")
async def classify_text(payload: ClassifyTextRequest):
    """Classifies document text automatically using Gemini."""
    result = DocumentUnderstandingService.classify_text(payload.text)
    return {
        "success": True,
        **result
    }


@router.post("/documents/summarize")
async def summarize_text(payload: SummarizeRequest):
    """Generates concise explanation and key takeaways instead of raw text parroting."""
    result = DocumentUnderstandingService.summarize(payload.text)
    return {
        "success": True,
        **result
    }


@router.post("/documents/key-points")
async def extract_key_points(payload: KeyPointsRequest):
    """Extracts intelligent core insights, entities, and dates/amounts."""
    result = DocumentUnderstandingService.extract_key_points(payload.text)
    return {
        "success": True,
        **result
    }


@router.post("/documents/recommended-questions")
async def get_recommended_questions(payload: RecommendedQuestionsRequest):
    """Generates clickable recommended questions based on document content."""
    questions = DocumentUnderstandingService.get_recommended_questions(payload.text)
    return {
        "success": True,
        "questions": questions
    }


@router.post("/documents/ask")
async def ask_question(payload: AskQuestionRequest):
    """Answers user's chosen question accurately based on extracted document text."""
    result = DocumentUnderstandingService.answer_question(payload.text, payload.question)
    return {
        "success": True,
        **result
    }


@router.post("/documents/export")
async def export_document(payload: ExportDocumentRequest):
    """
    Exports document as TXT, DOCX, PDF, or JSON.
    Allows choosing 'original', 'improved', or 'both' versions.
    """
    fmt = payload.format.lower()
    version = payload.version.lower()
    doc_name = payload.doc_name.strip() or "Transcribed_Document"

    if fmt == "txt":
        data = DocumentExportService.export_txt(doc_name, payload.original_text, payload.improved_text, version)
        return Response(
            content=data,
            media_type="text/plain; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="{doc_name}.txt"'}
        )
    elif fmt == "docx":
        data = DocumentExportService.export_docx(doc_name, payload.original_text, payload.improved_text, version)
        return Response(
            content=data,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="{doc_name}.docx"'}
        )
    elif fmt == "pdf":
        data = DocumentExportService.export_pdf(doc_name, payload.original_text, payload.improved_text, version)
        return Response(
            content=data,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{doc_name}.pdf"'}
        )
    elif fmt == "json":
        data = DocumentExportService.export_json({
            "name": doc_name,
            "original_ocr_text": payload.original_text,
            "improved_text": payload.improved_text,
            "version": version
        })
        return Response(
            content=data,
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="{doc_name}.json"'}
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported format '{fmt}'. Choose txt, docx, pdf, or json.")


# ==========================================
# DOCUMENT PERSISTENCE & ORGANIZATION CRUD
# ==========================================

@router.get("/documents")
async def list_saved_documents(
    user_id: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    tag: Optional[str] = None
):
    store = DocumentStorageService.get_instance()
    docs = store.list_documents(user_id=user_id, category=category, search=search, is_favorite=is_favorite, tag=tag)
    return {
        "success": True,
        "count": len(docs),
        "documents": docs
    }


@router.post("/documents")
async def save_document(payload: DocumentCreateRequest):
    store = DocumentStorageService.get_instance()
    doc = store.create_document(payload.dict())
    return {
        "success": True,
        "document": doc
    }


@router.get("/documents/{document_id}")
async def get_saved_document(document_id: str):
    store = DocumentStorageService.get_instance()
    doc = store.get_document(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "success": True,
        "document": doc
    }


@router.put("/documents/{document_id}")
async def update_saved_document(document_id: str, payload: DocumentUpdateRequest):
    store = DocumentStorageService.get_instance()
    doc = store.update_document(document_id, payload.dict(exclude_unset=True))
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "success": True,
        "document": doc
    }


@router.delete("/documents/{document_id}")
async def delete_saved_document(document_id: str):
    store = DocumentStorageService.get_instance()
    success = store.delete_document(document_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "success": True,
        "deleted_id": document_id
    }
