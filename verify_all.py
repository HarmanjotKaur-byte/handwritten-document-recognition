import os
os.environ['KERAS_HOME'] = r'D:\Downloads\SimpleHTR-master\.keras'
os.environ['TF_USE_LEGACY_KERAS'] = '1'

import sys
sys.path.insert(0, 'backend')

from app.services.model_service import ModelService
from app.services.recognition_service import RecognitionService

model_svc = ModelService.get_instance()
model_svc.load_model()
rec_service = RecognitionService()

tests = [
    ('d:/Downloads/SimpleHTR-master/crop_rabbit.png', 'rabbit'),
    ('d:/Downloads/SimpleHTR-master/crop_red.png', 'red'),
    ('d:/Downloads/SimpleHTR-master/exact_multi.png', 'father method all does color')
]

for path, expected in tests:
    with open(path, 'rb') as f:
        data = f.read()
    text, conf, lat, w, h = rec_service.recognize_bytes(data)
    print(f'Test: {path}\n  Expected: {expected}\n  Result:   {text} (conf: {conf:.2%}, {lat:.1f}ms)\n')
