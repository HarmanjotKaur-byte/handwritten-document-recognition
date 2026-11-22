import sys
sys.path.insert(0, 'backend')
from app.services.model_service import ModelService

print("Testing ModelService.load_model()...")
m = ModelService.get_instance()
m.load_model()
print("Model loaded successfully!")
