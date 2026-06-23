@echo off
echo ===================================================
echo Starting TaskSphere Local Development Environment...
echo ===================================================

echo.
echo [1/4] Starting PostgreSQL Docker Container...
docker-compose up -d db

echo.
echo [2/4] Waiting for PostgreSQL database to be ready (5s)...
timeout /t 5 /nobreak > NUL

echo.
echo [3/4] Launching Backend API Server (Port 5000)...
start "TaskSphere Backend Dev" cmd /c "cd backend && npm run dev"

echo.
echo [4/4] Launching Frontend Dev Server (Port 5173)...
start "TaskSphere Frontend Dev" cmd /c "cd frontend && npm run dev"

echo.
echo ===================================================
echo All services triggered.
echo Opening browser to http://localhost:5173 in 3 seconds...
echo ===================================================
timeout /t 3 /nobreak > NUL
start http://localhost:5173
echo.
echo Done! Feel free to close this terminal. Dev server windows will remain open.
pause
