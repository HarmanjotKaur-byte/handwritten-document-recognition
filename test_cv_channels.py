import cv2
import sys
sys.path.insert(0, 'backend')
from app.utils.image_utils import detect_and_slice_table_cells, adaptive_preprocess_image

# 1. Inspect rabbit
rabbit = cv2.imread('crop_rabbit.png')
b, g, r = cv2.split(rabbit)
diff = max(abs(int(b.mean()) - int(r.mean())), abs(int(g.mean()) - int(r.mean())))
print(f"rabbit: diff={diff}, b_std={b.std():.1f}, g_std={g.std():.1f}, r_std={r.std():.1f}")
gray = cv2.cvtColor(rabbit, cv2.COLOR_BGR2GRAY)
print(f"rabbit cv2.cvtColor gray: min={gray.min()}, max={gray.max()}, mean={gray.mean():.1f}, std={gray.std():.1f}")

# 2. Inspect exact_multi
multi = cv2.imread('exact_multi.png')
cells = detect_and_slice_table_cells(multi)
print(f"exact_multi cells count: {len(cells)}")
for i, c in enumerate(cells):
    gc = cv2.cvtColor(c, cv2.COLOR_BGR2GRAY)
    print(f" cell {i}: shape={c.shape}, min={gc.min()}, max={gc.max()}, mean={gc.mean():.1f}, std={gc.std():.1f}")
