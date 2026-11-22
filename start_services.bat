@echo off
echo ========================================================
echo Starting SimpleHTR Deep Learning Full-Stack System
echo ========================================================

echo Starting FastAPI Backend on port 8000...
start "SimpleHTR-Backend" cmd /k "cd /d D:\Downloads\SimpleHTR-master\backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo Waiting for backend to warm up TensorFlow model...
timeout /t 5 /nobreak >nul

echo Starting React Frontend on port 5173...
start "SimpleHTR-Frontend" cmd /k "cd /d D:\Downloads\SimpleHTR-master\frontend && npm run dev"

echo ========================================================
echo Both services launched!
echo Access the web application at: http://localhost:5173
echo Access the API documentation at: http://localhost:8000/docs
echo ========================================================
