import io
import numpy as np
from PIL import Image
from typing import Tuple


class PreprocessingService:
    """
    Image validation and normalization service:
    - Validates file integrity
    - Checks dimensions
    - Fixes EXIF rotation without destroying character strokes
    """
    @staticmethod
    def validate_and_load(image_bytes: bytes, max_mb: int = 10) -> Tuple[Image.Image, int, int]:
        if not image_bytes or len(image_bytes) == 0:
            raise ValueError("Uploaded image file is empty (0 bytes).")

        size_mb = len(image_bytes) / (1024 * 1024)
        if size_mb > max_mb:
            raise ValueError(f"File size exceeds limit of {max_mb}MB (received {size_mb:.2f}MB).")

        try:
            pil_img = Image.open(io.BytesIO(image_bytes))
            pil_img.verify()
        except Exception as e:
            raise ValueError(f"Corrupted or invalid image file: {e}")

        # Re-open after verify()
        pil_img = Image.open(io.BytesIO(image_bytes))
        
        # Correct orientation from EXIF tags if present
        try:
            from PIL import ImageOps
            pil_img = ImageOps.exif_transpose(pil_img)
        except Exception:
            pass

        w, h = pil_img.size
        if w < 5 or h < 5:
            raise ValueError(f"Image dimensions too small ({w}x{h}). Minimum size is 5x5 pixels.")

        # Ensure RGB mode for Vision API
        if pil_img.mode != "RGB":
            pil_img = pil_img.convert("RGB")

        return pil_img, w, h
