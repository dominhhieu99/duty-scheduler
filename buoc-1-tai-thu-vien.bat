@echo off
chcp 65001 >nul
echo ==============================================
echo BƯỚC 1: TẢI THƯ VIỆN — TRÊN MÁY CÓ MẠNG
echo ==============================================
echo.

cd backend
if not exist packages mkdir packages
echo [1/2] Đang tải thư viện Python...
pip download -r requirements.txt -d ./packages
cd ..

cd frontend
echo [2/2] Đang tải thư viện Node.js...
if not exist node_modules npm install
cd ..

echo.
echo ==============================================
echo ✅ TẢI XONG!
echo Copy toàn bộ thư mục "duty-scheduler" vào USB
echo rồi chuyển sang máy không mạng chạy Buoc 2
echo ==============================================
pause
