@echo off
echo Starting ImpactEx Backend...
echo.
echo Installing Python dependencies...
pip install -r requirements.txt
echo.
echo Starting FastAPI server on http://localhost:8000
echo.
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
