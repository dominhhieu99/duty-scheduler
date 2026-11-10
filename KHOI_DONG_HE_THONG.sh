#!/bin/bash
clear
echo "=============================================="
echo "   🚀 LỊCH TRỰC CẢNH BÁO — KHỞI ĐỘNG"
echo "=============================================="
echo ""

# Lấy thư mục chứa tệp này
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

# === Chạy Backend ở cửa sổ riêng ===
echo "[1/2] Khởi động Backend..."
cd "$BASE_DIR/backend"
if [ ! -d "venv" ]; then
  python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
# Mở tiến trình nền
python3 main.py &
BACKEND_PID=$!

# Chờ khởi động
sleep 3

# === Chạy Frontend ở cửa sổ riêng ===
echo "[2/2] Khởi động Frontend..."
cd "$BASE_DIR/frontend"
npm start &
FRONTEND_PID=$!

echo ""
echo "=============================================="
echo "   ✅ SẴN SÀNG!"
echo "   🔧 Backend:  http://127.0.0.1:8000"
echo "   📋 Frontend: http://127.0.0.1:3000"
echo "=============================================="
echo ""
echo "Nhấn Ctrl+C để dừng tất cả..."

# Đợi tiến trình
wait $BACKEND_PID $FRONTEND_PID
