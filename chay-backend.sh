#!/bin/bash
cd "$(dirname "$0")/backend"
if [ ! -d "venv" ]; then
  echo "🔧 Tạo môi trường ảo..."
  python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
echo "🚀 Khởi động Backend tại cổng 8000..."
python3 main.py
