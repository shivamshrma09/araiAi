@echo off
echo ========================================
echo   ARIA Multi-Agent Platform - Startup
echo ========================================
echo.

echo [1/3] Starting Backend (Node.js)...
start "Aria Backend" cmd /k "cd /d %~dp0backend && npm install && npm run dev"

echo [2/3] Starting AI Service (Python FastAPI)...
start "Aria AI Service" cmd /k "cd /d %~dp0ai-service && pip install -r requirements.txt && uvicorn main:app --reload --port 8000"

echo [3/3] Starting Frontend (React)...
start "Aria Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"

echo.
echo ========================================
echo   All services starting...
echo   Backend:    http://localhost:3001
echo   AI Service: http://localhost:8000
echo   Frontend:   http://localhost:5173
echo ========================================
echo.
echo Add your GEMINI_API_KEY in ai-service/.env
pause
