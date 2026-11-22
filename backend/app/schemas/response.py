from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class BoundingBoxVertex(BaseModel):
    x: Optional[float] = 0.0
    y: Optional[float] = 0.0


class WordMetadata(BaseModel):
    text: str
    confidence: float = 0.95
    bounding_box: Optional[List[BoundingBoxVertex]] = None


class ParagraphMetadata(BaseModel):
    paragraph_index: int
    text: str
    confidence: float = 0.95
    words: List[WordMetadata] = []


class BlockMetadata(BaseModel):
    block_index: int
    text: str
    confidence: float = 0.95
    paragraphs: List[ParagraphMetadata] = []


class UsageStatusResponse(BaseModel):
    current_month: str
    used_units: int
    monthly_limit: int
    remaining_units: int
    is_quota_exhausted: bool


class HealthResponse(BaseModel):
    status: str
    service: str
    api_configured: bool
    provider: str
    usage: UsageStatusResponse


class ModelInfoResponse(BaseModel):
    provider: str
    model_name: str
    recognition_method: str
    supported_image_formats: List[str]
    supported_input_types: List[str]
    capabilities: List[str]
    description: str


class PredictionResponse(BaseModel):
    success: bool
    recognized_text: str
    confidence: float
    processing_time_ms: float
    provider: str
    image_dimensions: Dict[str, int]
    structured_blocks: List[BlockMetadata] = []
    paragraphs: List[ParagraphMetadata] = []
    words: List[WordMetadata] = []
    error: Optional[str] = None
