import cv2, sys
sys.path.insert(0, 'backend')
from app.utils.image_utils import adaptive_preprocess_image, detect_and_slice_table_cells

rabbit = cv2.imread('crop_rabbit.png')
g_rabbit = adaptive_preprocess_image(rabbit)
print('rabbit:', rabbit.shape, 'min:', g_rabbit.min(), 'max:', g_rabbit.max(), 'mean:', g_rabbit.mean())

multi = cv2.imread('exact_multi.png')
cells = detect_and_slice_table_cells(multi)
print('multi cells:', len(cells))
for i, c in enumerate(cells):
    gc = adaptive_preprocess_image(c)
    print(f'  cell {i}: shape={c.shape}, min={gc.min()}, max={gc.max()}, mean={gc.mean()}')
