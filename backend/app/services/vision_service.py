import os
import time
import asyncio
import logging
from typing import Dict, Any, Optional
from PIL import Image
from pathlib import Path
from google import genai
from google.genai import types

from app.services.usage_service import UsageService
from app.services.preprocessing_service import PreprocessingService
from app.services.result_service import ResultService

logger = logging.getLogger("simplehtr.vision")


class VisionService:
    """
    Main handwriting recognition service powered by Google Gemini Flash Vision.
    Performs multimodal OCR for images and short/long multi-page PDFs, tracks usage limits, and normalizes outputs.
    """
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.usage_service = UsageService.get_instance()
        self.api_key = self._load_api_key()
        self.model_name = "gemini-3.5-flash-lite"
        self.client = None
        if self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
                logger.info("Google Gemini Vision client successfully initialized.")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini Vision client: {e}")

    def _load_api_key(self) -> Optional[str]:
        # Check environment variable first
        key = os.getenv("GEMINI_API_KEY")
        if key:
            return key

        # Check local backend/.env
        env_path = Path(__file__).resolve().parent.parent.parent / ".env"
        if env_path.exists():
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        if line.startswith("GEMINI_API_KEY="):
                            return line.strip().split("=", 1)[1].strip()
            except Exception as e:
                logger.warning(f"Failed to read .env file: {e}")
        return None

    def is_configured(self) -> bool:
        return self.client is not None

    async def recognize(self, file_bytes: bytes, filename: str = "") -> Dict[str, Any]:
        """
        Asynchronously runs handwriting recognition on uploaded images or PDFs.
        Supports single-page and multi-page PDF documents.
        """
        if not self.is_configured():
            raise RuntimeError("Vision API is not configured. GEMINI_API_KEY is missing.")

        if not self.usage_service.can_consume():
            status = self.usage_service.get_status()
            raise RuntimeError(
                f"Application monthly usage limit reached ({status['used_units']}/{status['monthly_limit']} units). "
                "Further requests rejected to prevent quota overages."
            )

        is_pdf = filename.lower().endswith(".pdf") or file_bytes.startswith(b"%PDF")
        
        if is_pdf:
            w, h = 800, 1100
            content_part = types.Part.from_bytes(data=file_bytes, mime_type="application/pdf")
            prompt = (
                "Transcribe all handwritten and printed text in this PDF document accurately and completely from top to bottom. "
                "If the document has multiple pages, transcribe each page in order. "
                "Preserve word order and line breaks where appropriate. "
                "Return ONLY the transcribed text, nothing else."
            )
        else:
            # Image validation & EXIF orientation normalization
            pil_img, w, h = PreprocessingService.validate_and_load(file_bytes)
            content_part = pil_img
            prompt = (
                "Transcribe all handwritten text in this image accurately and completely from top to bottom. "
                "Preserve word order and line breaks where appropriate. "
                "Return ONLY the transcribed text, nothing else."
            )

        # Asynchronous execution in threadpool to prevent blocking the event loop
        loop = asyncio.get_event_loop()
        t0 = time.perf_counter()

        def _call_api():
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=[prompt, content_part]
            )
            return response.text if response and response.text else ""

        try:
            # 30s timeout for multi-page documents
            raw_text = await asyncio.wait_for(loop.run_in_executor(None, _call_api), timeout=30.0)
        except asyncio.TimeoutError:
            raise TimeoutError("Vision API request timed out after 30 seconds.")
        except Exception as e:
            logger.error(f"Vision API error during inference: {e}")
            raise RuntimeError(f"Vision API error: {str(e)}")

        latency_ms = (time.perf_counter() - t0) * 1000.0

        # Record consumed unit
        self.usage_service.record_usage(1)

        # Structure and normalize output
        return ResultService.structure_recognition_output(
            raw_text=raw_text,
            processing_time_ms=latency_ms,
            img_w=w,
            img_h=h,
            provider=f"Google Gemini Vision ({self.model_name})"
        )
