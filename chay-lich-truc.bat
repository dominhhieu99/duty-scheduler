@echo off
chcp 65001 >nul
echo ==============================================
echo 🚀 KHỞI ĐỘNG LỊCH TRỰC CẢNH BÁO
echo ==============================================
echo.

echo [1/2] Đang khởi động Backend (cổng 8000)...
start "🔧 Backend" cmd /k "cd backend && python main.py"

timeout /t 3
