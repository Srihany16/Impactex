@echo off
echo ========================================
echo    ImpactEx - Complete Website Startup
echo ========================================
echo.
echo This will start both Frontend and Backend servers.
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo.
echo Press Ctrl+C to stop the servers
echo.
pause

start "ImpactEx Backend" cmd /k start-backend.bat
timeout /t 3 /nobreak > nul
start "ImpactEx Frontend" cmd /k start-frontend.bat

echo.
echo Both servers are starting...
echo Check the separate terminal windows for their status.
echo.
