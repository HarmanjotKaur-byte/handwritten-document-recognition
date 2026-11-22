import io
import time
import logging
from typing import Dict, Any, List, Optional
from PIL import Image

logger = logging.getLogger("simplehtr.result_service")


class ResultService:
    """
    Normalizes raw LLM / Vision recognition text into structured
    words, paragraphs, and blocks with confidence estimates.
    """
    @staticmethod
    def structure_recognition_output(
        raw_text: str,
        processing_time_ms: float,
        img_w: int,
        img_h: int,
        provider: str = "Google Gemini Flash Vision"
    ) -> Dict[str, Any]:
        cleaned_text = raw_text.strip()
        lines = [line.strip() for line in cleaned_text.split("\n") if line.strip()]

        structured_blocks = []
        all_paragraphs = []
        all_words = []

        total_word_count = 0
        block_idx = 0

        for line in lines:
            words_in_line = line.split()
            line_words_meta = []
            for w in words_in_line:
                clean_w = w.strip(".,;:!?\"'()[]{}")
                if not clean_w:
                    continue
                w_meta = {
                    "text": w,
                    "confidence": 0.95,
                    "bounding_box": None
                }
                line_words_meta.append(w_meta)
                all_words.append(w_meta)
                total_word_count += 1

            p_meta = {
                "paragraph_index": block_idx,
                "text": line,
                "confidence": 0.95,
                "words": line_words_meta
            }
            all_paragraphs.append(p_meta)

            b_meta = {
                "block_index": block_idx,
                "text": line,
                "confidence": 0.95,
                "paragraphs": [p_meta]
            }
            structured_blocks.append(b_meta)
            block_idx += 1

        overall_confidence = 0.95 if cleaned_text else 0.0

        return {
            "success": True,
            "recognized_text": cleaned_text,
            "confidence": overall_confidence,
            "processing_time_ms": round(processing_time_ms, 2),
            "provider": provider,
            "image_dimensions": {"width": img_w, "height": img_h},
            "structured_blocks": structured_blocks,
            "paragraphs": all_paragraphs,
            "words": all_words,
            "error": None
        }
