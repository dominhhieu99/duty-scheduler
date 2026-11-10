# Lịch Trực Cảnh Báo — ViettelPost

Hệ thống quản lý lịch trực chạy hoàn toàn cục bộ, hỗ trợ môi trường không có mạng.

## Chức năng
- ✅ Bảng lịch theo tháng/năm, giao diện giống Excel
- ✅ Tô màu theo loại ca: MIDDAY SHIFT, OFFLINE, UPCODE, ONLINE, OFFLINE (U)
- ✅ Phân quyền: Admin sửa lịch, người dùng chỉ xem + đăng ký ngày bận
- ✅ Dữ liệu lưu cục bộ trong SQLite
- ✅ Hoàn toàn hoạt động offline sau khi cài đặt

## Cài đặt
1. Máy có mạng: chạy `buoc-1-tai-thu-vien.bat` → tải thư viện
2. Copy toàn bộ thư mục vào USB → chuyển sang máy không mạng
3. Chạy `buoc-2-cai-offline.bat` → cài từ tệp đã tải
4. Chạy `chay-lich-truc.bat` → mở trình duyệt: http://127.0.0.1:3000
