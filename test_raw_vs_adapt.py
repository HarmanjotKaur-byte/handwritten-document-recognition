import os
os.environ['KERAS_HOME'] = r'D:\Downloads\SimpleHTR-master\.keras'
os.environ['TF_USE_LEGACY_KERAS'] = '1'

import sys
sys.path.insert(0, 'backend')
import cv2
from app.services.model_service import ModelService
from app.services.preprocessing import SimpleHTRPreprocessor
from app.utils.image_utils import detect_and_slice_table_cells, adaptive_preprocess_image

model_svc = ModelService.get_instance()
model_svc.load_model()
prep = SimpleHTRPreprocessor()

# Check raw model predictions on each image without any preprocessing vs with adaptive_preprocess_image
for name, path in [('rabbit', 'crop_rabbit.png'), ('red', 'crop_red.png')]:
    img = cv2.imread(path)
    gray_raw = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray_adapt = adaptive_preprocess_image(img)
    
    # 1. raw grayscale
    b1 = prep.create_batch(prep.process(gray_raw))
    p1, c1 = model_svc.predict(b1)
    
    # 2. adaptive
    b2 = prep.create_batch(prep.process(gray_adapt))
    p2, c2 = model_svc.predict(b2)
    
    print(f"[{name}]")
    print(f"  Raw Gray:     '{p1}' (conf: {c1:.4f})")
    print(f"  Adaptive:     '{p2}' (conf: {c2:.4f})")

# Also test exact_multi cells
img_multi = cv2.imread('exact_multi.png')
cells = detect_and_slice_table_cells(img_multi)
print(f"\n[exact_multi] {len(cells)} cells:")
for i, cell in enumerate(cells):
    gray_raw = cv2.cvtColor(cell, cv2.COLOR_BGR2GRAY)
    gray_adapt = adaptive_preprocess_image(cell)
    p_raw, _ = model_svc.predict(prep.create_batch(prep.process(gray_raw)))
    p_ad, _ = model_svc.predict(prep.create_batch(prep.process(gray_adapt)))
    print(f"  Cell {i}: Raw='{p_raw}' | Adapt='{p_ad}'")
