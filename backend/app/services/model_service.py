import os
import sys
import threading
import logging
from typing import List, Tuple, Optional
from pathlib import Path

# Enable legacy Keras for TF 2.x before importing tensorflow
os.environ['TF_USE_LEGACY_KERAS'] = '1'

from app.config import SIMPLEHTR_SRC_DIR, MODEL_DIR, CHAR_LIST_PATH, CHECKPOINT_NAME

# Ensure SimpleHTR src is in path
if str(SIMPLEHTR_SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SIMPLEHTR_SRC_DIR))

from model import Model, DecoderType
from dataloader_iam import Batch

logger = logging.getLogger("simplehtr.model_service")


class ModelService:
    """
    Thread-safe Singleton managing the life-cycle of the SimpleHTR TensorFlow model.
    Loads graph and weights once during FastAPI startup and keeps session warm in RAM.
    """
    _instance: Optional["ModelService"] = None
    _lock: threading.Lock = threading.Lock()

    def __init__(self):
        self.model: Optional[Model] = None
        self.char_list: List[str] = []
        self.is_loaded: bool = False
        self.inference_lock: threading.Lock = threading.Lock()
        self.checkpoint_name: str = CHECKPOINT_NAME

    @classmethod
    def get_instance(cls) -> "ModelService":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = cls()
        return cls._instance

    def load_model(self) -> None:
        """Loads vocabulary and restores TF checkpoint into memory."""
        with self._lock:
            if self.is_loaded:
                logger.info("Model already initialized and warm in memory.")
                return

            if not CHAR_LIST_PATH.exists():
                raise FileNotFoundError(f"Character list vocabulary file not found at: {CHAR_LIST_PATH}")

            with open(CHAR_LIST_PATH, "r", encoding="utf-8") as f:
                self.char_list = list(f.read())

            logger.info(f"Loaded character vocabulary: {len(self.char_list)} tokens.")
            logger.info(f"Restoring TensorFlow checkpoint '{self.checkpoint_name}' from {MODEL_DIR}...")

            # Store original working dir to ensure relative paths inside SimpleHTR match
            orig_cwd = os.getcwd()
            try:
                os.chdir(str(SIMPLEHTR_SRC_DIR))
                self.model = Model(self.char_list, DecoderType.BestPath, must_restore=True)
                self.is_loaded = True
                logger.info("TensorFlow model loaded successfully into RAM.")
            finally:
                os.chdir(orig_cwd)

    def predict(self, batch: Batch) -> Tuple[str, float]:
        """
        Thread-safe inference call using persistent in-memory session.
        Returns (recognized_text, joint_confidence_probability).
        """
        if not self.is_loaded or self.model is None:
            raise RuntimeError("Model is not loaded. Call load_model() first.")

        with self.inference_lock:
            recognized_list, prob_list = self.model.infer_batch(batch, calc_probability=True)

        text = recognized_list[0] if recognized_list else ""
        prob = float(prob_list[0]) if prob_list else 0.0
        return text, prob
