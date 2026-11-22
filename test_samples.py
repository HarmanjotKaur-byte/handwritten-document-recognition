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

samples = [
    ('SimpleHTR-master/data/word.png', 'word'),
    ('SimpleHTR-master/data/line.png', 'line')
]

for p, label in samples:
    if os.path.exists(p):
        with open(p, 'rb') as f:
            data = f.read()
        text, conf, lat, w, h = rec_service.recognize_bytes(data)
        print(f"Sample {p}: Result='{text}', Conf={conf:.2%}, Latency={lat:.1f}ms")
