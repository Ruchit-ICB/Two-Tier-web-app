@echo off
echo =======================================================
echo Starting TaskSphere Production Mode (Docker Compose)...
echo =======================================================

echo.
echo [1/2] Building and spinning up containers in background...
docker-compose up --build -d

echo.
echo [2/2] Waiting for web application service to boot up (10s)...
timeout /t 10 /nobreak > NUL

echo.
echo =======================================================
echo Services booted. Opening production instance...
echo Web UI: http://localhost:5000
echo Health Status: http://localhost:5000/health
echo =======================================================
start http://localhost:5000
echo.
echo Containers are running in the background. 
echo To stop them, run: docker-compose down
echo.
pause
