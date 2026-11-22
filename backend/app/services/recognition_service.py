import time
import logging
from typing import Tuple, List
import numpy as np

from app.services.model_service import ModelService
from app.services.preprocessing import SimpleHTRPreprocessor
from app.services.text_postprocessing import correct_ocr_text
from app.utils.image_utils import (
    validate_image_bytes,
    bytes_to_cv2,
    detect_and_slice_table_cells,
    segment_natural_words,
    adaptive_preprocess_image
)

logger = logging.getLogger("simplehtr.recognition")


class RecognitionService:
    """
    Coordinates image decoding, adaptive computer vision preprocessing,
    word/cell segmentation, CRNN model inference, and lexicon post-processing.
    """
    def __init__(self):
        self.model_service = ModelService.get_instance()
        self.preprocessor = SimpleHTRPreprocessor()

    def recognize_bytes(self, image_bytes: bytes, filename: str = "") -> Tuple[str, float, float, int, int]:
        """
        Processes raw bytes and runs inference.
        Returns:
            recognized_text (str)
            confidence (float)
            latency_ms (float)
            orig_width (int)
            orig_height (int)
        """
        # 1. Validation
        orig_w, orig_h = validate_image_bytes(image_bytes, filename=filename)

        # 2. In-memory color/grayscale decode
        img = bytes_to_cv2(image_bytes)

        t0 = time.perf_counter()

        # 3. Detect and segment table cells if vertical column dividers are present
        segments = detect_and_slice_table_cells(img)

        # If it wasn't a table, check if it's a wide text line containing multiple words
        if len(segments) == 1:
            segments = segment_natural_words(img)

        recognized_parts = []
        confidences = []

        for seg_img in segments:
            # Adaptive CV: deskew, channel-select, illumination normalizer, notebook line removal
            clean_gray = adaptive_preprocess_image(seg_img)

            # SimpleHTR aspect ratio normalization
            processed = self.preprocessor.process(clean_gray)
            batch = self.preprocessor.create_batch(processed)
            text_part, conf = self.model_service.predict(batch)

            # Strip greedy CTC leading/trailing edge noise
            stripped_text = text_part.strip(" .,;:_-~`")

            # Lexicon / beam refinement
            text_cleaned = correct_ocr_text(stripped_text)
            if text_cleaned:
                recognized_parts.append(text_cleaned)
                confidences.append(conf)

        final_text = " ".join(recognized_parts) if recognized_parts else ""
        avg_confidence = float(np.mean(confidences)) if confidences else 0.0

        t1 = time.perf_counter()
        latency_ms = (t1 - t0) * 1000.0

        logger.info(f"Recognized '{final_text}' (conf: {avg_confidence:.2%}) in {latency_ms:.2f}ms")

        return final_text, avg_confidence, latency_ms, orig_w, orig_h
