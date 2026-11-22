from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class UserSignupRequest(BaseModel):
    name: str
    email: str
    password: str


class UserLoginRequest(BaseModel):
    email: str
    password: str


class DocumentCreateRequest(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    name: Optional[str] = None
    category: Optional[str] = None
    category_confidence: Optional[float] = 0.0
    category_reason: Optional[str] = None
    tags: Optional[List[str]] = []
    is_favorite: Optional[bool] = False
    original_ocr_text: str
    improved_text: Optional[str] = None
    summary: Optional[Dict[str, Any]] = None
    key_points: Optional[Dict[str, Any]] = None
    provider: Optional[str] = None
    processing_time_ms: Optional[float] = 0.0
    image_dimensions: Optional[Dict[str, int]] = None


class DocumentUpdateRequest(BaseModel):
    name: Optional[str] = None
    improved_text: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    is_favorite: Optional[bool] = None
    summary: Optional[Dict[str, Any]] = None
    key_points: Optional[Dict[str, Any]] = None


class SummarizeRequest(BaseModel):
    text: str


class KeyPointsRequest(BaseModel):
    text: str


class RecommendedQuestionsRequest(BaseModel):
    text: str


class AskQuestionRequest(BaseModel):
    text: str
    question: str


class ClassifyTextRequest(BaseModel):
    text: str


class ExportDocumentRequest(BaseModel):
    doc_name: str = "Document"
    original_text: str
    improved_text: Optional[str] = ""
    version: str = "improved"
    format: str = "txt"
