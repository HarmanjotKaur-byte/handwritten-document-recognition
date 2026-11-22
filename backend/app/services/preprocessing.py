import sys
from pathlib import Path
import numpy as np

from app.config import SIMPLEHTR_SRC_DIR, IMG_HEIGHT, DEFAULT_IMG_WIDTH, PADDING

# Ensure SimpleHTR src directory is on sys.path
if str(SIMPLEHTR_SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SIMPLEHTR_SRC_DIR))

from preprocessor import Preprocessor
from dataloader_iam import Batch


class SimpleHTRPreprocessor:
    """
    Encapsulates image preprocessing consistent with SimpleHTR's expectations.
    Applies aspect ratio normalization, dynamic width computation aligned to 4px boundaries,
    padding, transpose for time-major axis, and [-0.5, 0.5] pixel normalization.
    """
    def __init__(self, target_height: int = IMG_HEIGHT, padding: int = PADDING):
        self.target_height = target_height
        self.padding = padding
        # Dynamic width mode aligns width to multiple of 4 matching CNN 4x pooling
        self._preprocessor = Preprocessor(
            img_size=(DEFAULT_IMG_WIDTH, target_height),
            padding=padding,
            dynamic_width=True,
            data_augmentation=False,
            line_mode=False
        )

    def process(self, img_grayscale: np.ndarray) -> np.ndarray:
        """Processes 2D grayscale image array into model-ready tensor format."""
        return self._preprocessor.process_img(img_grayscale)

    def create_batch(self, processed_img: np.ndarray) -> Batch:
        """Wraps processed tensor into SimpleHTR Batch structure."""
        return Batch([processed_img], None, 1)
