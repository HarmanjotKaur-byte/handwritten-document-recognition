import os
from pathlib import Path

# Base Paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
WORKSPACE_ROOT = BACKEND_DIR.parent
SIMPLEHTR_SRC_DIR = WORKSPACE_ROOT / "SimpleHTR-master" / "src"
MODEL_DIR = WORKSPACE_ROOT / "SimpleHTR-master" / "model"
DATA_DIR = WORKSPACE_ROOT / "SimpleHTR-master" / "data"
TEST_DATASET_DIR = WORKSPACE_ROOT / "test_dataset"

# Model Config
CHAR_LIST_PATH = MODEL_DIR / "charList.txt"
CHECKPOINT_NAME = "snapshot-13"

# Image Preprocessing Config
IMG_HEIGHT = 32
DEFAULT_IMG_WIDTH = 128
LINE_IMG_WIDTH = 256
PADDING = 16
MAX_IMAGE_SIZE_MB = 10
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".webp", ".tiff", ".pdf"}

# Server Config
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
