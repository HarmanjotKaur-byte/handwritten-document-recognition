import cv2, sys
sys.path.insert(0, 'backend')
from app.utils.image_utils import detect_and_slice_table_cells, segment_natural_words

for p in ['crop_rabbit.png', 'crop_red.png', 'exact_multi.png']:
    img = cv2.imread(p)
    tc = detect_and_slice_table_cells(img)
    nw = segment_natural_words(img)
    print(p, 'shape:', img.shape, 'table_cells:', len(tc), 'natural_words:', len(nw))
