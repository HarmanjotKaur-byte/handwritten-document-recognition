import io
import itertools
from operator import itemgetter
from typing import Tuple, List
from PIL import Image
import numpy as np
import cv2

from app.config import ALLOWED_EXTENSIONS, MAX_IMAGE_SIZE_MB


class ImageValidationError(Exception):
    """Raised when uploaded image fails format or dimensional validation."""
    pass


def validate_image_bytes(image_bytes: bytes, filename: str = "") -> Tuple[int, int]:
    """
    Validates file size, file integrity, and dimensions.
    Returns (width, height).
    """
    if not image_bytes or len(image_bytes) == 0:
        raise ImageValidationError("Uploaded image file is empty (0 bytes).")

    size_mb = len(image_bytes) / (1024 * 1024)
    if size_mb > MAX_IMAGE_SIZE_MB:
        raise ImageValidationError(f"File size exceeds limit of {MAX_IMAGE_SIZE_MB}MB (received {size_mb:.2f}MB).")

    if filename:
        ext = "." + filename.split(".")[-1].lower() if "." in filename else ""
        if ext and ext not in ALLOWED_EXTENSIONS:
            raise ImageValidationError(f"Unsupported image extension '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}")

    try:
        with Image.open(io.BytesIO(image_bytes)) as pil_img:
            pil_img.verify()
    except Exception as e:
        raise ImageValidationError(f"Corrupted or invalid image file: {str(e)}")

    with Image.open(io.BytesIO(image_bytes)) as pil_img:
        w, h = pil_img.size

    if w < 5 or h < 5:
        raise ImageValidationError(f"Image dimensions too small ({w}x{h}). Minimum size is 5x5 pixels.")

    return w, h


def bytes_to_cv2(image_bytes: bytes) -> np.ndarray:
    """Decodes raw byte array into OpenCV BGR image."""
    arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ImageValidationError("Could not decode image bytes into valid pixels.")
    return img


def deskew_image(img: np.ndarray) -> np.ndarray:
    """
    Corrects slight rotation or slant in handwritten lines (-25° to +25°).
    Aligns text horizontally before sequence slicing.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    coords = np.column_stack(np.where(thresh > 0))
    if len(coords) < 40:
        return img

    angle = cv2.minAreaRect(coords)[-1]
    if angle < -45:
        angle = -(90 + angle)
    elif angle > 45:
        angle = 90 - angle

    # Only deskew if small slant is detected
    if abs(angle) > 25 or abs(angle) < 0.6:
        return img

    h, w = img.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return rotated


def remove_notebook_ruled_lines(gray: np.ndarray) -> np.ndarray:
    """
    Suppresses horizontal ruled notebook lines which disrupt CTC decoding.
    Only triggers if strong horizontal line spanning >= 70% of the image width exists.
    """
    h, w = gray.shape
    if w < 60 or h < 25:
        return gray

    # Line must span at least 70% of the width
    h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (int(w * 0.70), 1))
    lines = cv2.morphologyEx(255 - gray, cv2.MORPH_OPEN, h_kernel)
    line_pixels = np.count_nonzero(lines > 100)
    if line_pixels > (w * 0.5):
        lines_dilated = cv2.dilate(lines, cv2.getStructuringElement(cv2.MORPH_RECT, (1, 3)))
        cleaned = gray.copy()
        cleaned[lines_dilated > 100] = 255
        return cleaned
    return gray


def detect_and_slice_table_cells(img_bgr: np.ndarray) -> List[np.ndarray]:
    """
    Detects if the image is a multi-cell table / strip separated by vertical divider lines.
    Requires aspect ratio w/h >= 2.5 and distinct vertical divider lines.
    Returns list of cropped cell images.
    """
    h, w = img_bgr.shape[:2]
    if w < 120 or h < 20 or (w / h) < 2.5:
        return [img_bgr]

    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY) if len(img_bgr.shape) == 3 else img_bgr

    # Detect vertical lines spanning at least 70% of image height
    v_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, int(h * 0.70)))
    v_lines = cv2.morphologyEx(255 - gray, cv2.MORPH_OPEN, v_kernel)

    v_proj = np.sum(v_lines > 50, axis=0)
    cut_cols = [x for x in range(w) if v_proj[x] > (h * 0.65)]

    if not cut_cols:
        return [img_bgr]

    dividers = []
    for _, g in itertools.groupby(enumerate(cut_cols), lambda ix: ix[0] - ix[1]):
        group = list(map(itemgetter(1), g))
        mid = (group[0] + group[-1]) // 2
        if int(w * 0.08) < mid < int(w * 0.92):
            dividers.append(mid)

    if len(dividers) >= 2:
        boundaries = [0] + sorted(dividers) + [w]
        cells = []
        for i in range(len(boundaries) - 1):
            x1, x2 = boundaries[i], boundaries[i + 1]
            if (x2 - x1) >= 20:
                cell = img_bgr[:, x1:x2]
                if cell.shape[0] > 6 and cell.shape[1] > 6:
                    cell = cell[2:-2, 2:-2]
                cells.append(cell)
        if len(cells) > 1:
            return cells

    return [img_bgr]


def segment_natural_words(img: np.ndarray) -> List[np.ndarray]:
    """
    Segments wide multi-word text lines separated by whitespace into individual word crops.
    Preserves single-word inputs as-is.
    """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if len(img.shape) == 3 else img
    h, w = gray.shape

    # Only segment lines with wide aspect ratio
    if (w / h) < 3.2 or w < 200:
        return [img]

    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    # Morphological dilation to connect letters into word blobs
    k_w = max(5, int(h * 0.35))
    k_h = max(3, int(h * 0.5))
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (k_w, k_h))
    dilated = cv2.dilate(thresh, kernel)

    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    boxes = []
    for c in contours:
        x, y, bw, bh = cv2.boundingRect(c)
        if bw > 18 and bh > 12:
            boxes.append((x, y, bw, bh))

    boxes.sort(key=lambda b: b[0])
    if len(boxes) <= 1:
        return [img]

    crops = []
    for x, y, bw, bh in boxes:
        pad = 4
        x0 = max(0, x - pad)
        y0 = max(0, y - pad)
        x1 = min(w, x + bw + pad)
        y1 = min(h, y + bh + pad)
        crops.append(img[y0:y1, x0:x1])
    return crops


def adaptive_preprocess_image(img_bgr: np.ndarray) -> np.ndarray:
    """
    Careful image preparation for CRNN:
    - Normalizes ink contrast without eroding or distorting character strokes.
    - Preserves stroke connectivity and grayscale intensity gradients.
    """
    if len(img_bgr.shape) == 2:
        gray = img_bgr
    else:
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # Remove horizontal ruled notebook lines if present
    cleaned = remove_notebook_ruled_lines(gray)
    return cleaned
