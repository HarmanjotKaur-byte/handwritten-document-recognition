import os
import sys

os.environ['KERAS_HOME'] = r'D:\Downloads\SimpleHTR-master\.keras'
os.environ['TF_USE_LEGACY_KERAS'] = '1'

backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import uvicorn

if __name__ == '__main__':
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, log_level="info")
