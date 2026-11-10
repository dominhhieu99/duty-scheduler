@echo off
chcp 65001 >nul
echo ==============================================
echo BƯỚC 2: CÀI ĐẶT — TRÊN MÁY KHÔNG MẠNG
echo ==============================================
echo.

cd backend
echo [1/2] Cài thư viện Python...
pip install --no-index --find-links=./packages -r requirements.txt
cd ..

cd frontend
echo [2/2] Kiểm tra thư viện Node.js...
if not exist node_modules (
  echo ⚠️ LỖI: Không thấy thư mục node_modules
  echo Hãy chép thư mục "frontend/node_modules" từ máy có mạng vào đây
) else (
  echo ✅ Thư viện Frontend đã sẵn sàng
)
cd ..

echo.
echo ==============================================
echo ✅ CÀI ĐẶT XONG!
echo Chạy tệp "chay-lich-truc.bat" để khởi động
echo ==============================================
pause
