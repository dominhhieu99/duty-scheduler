import React, { useEffect, useState } from 'react';

// === Gọi qua proxy — không cần đổi cổng ===
const API = '';

const SHIFT_OPTIONS = ['MIDDAY SHIFT', 'OFFLINE', 'UPCODE', 'ONLINE', 'OFFLINE (U)'];
const SHIFT_COLORS = {
  'MIDDAY SHIFT': '#4285F4',
  'OFFLINE': '#34A853',
  'UPCODE': '#FBBC05',
  'ONLINE': '#F2994A',
  'OFFLINE (U)': '#9AA0A6'
};

function App() {
  const [users, setUsers] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const isAdmin = true;

  // === Lấy danh sách nhân viên ===
  useEffect(() => {
    console.log('📥 Đang lấy danh sách nhân viên...');
    fetch(`${API}/api/users`)
      .then(res => {
        console.log('→ Trạng thái:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('✅ Nhận được', data.length, 'nhân viên');
        setUsers(data);
      })
      .catch(err => console.error('❌ Lỗi lấy users:', err));
  }, []);

  // === Lấy lịch khi có đủ dữ liệu ===
  useEffect(() => {
    if (!users.length) return;
    console.log('📥 Đang tải lịch tháng', month, '/', year);
    fetch(`${API}/api/schedule/${year}/${month}`)
      .then(res => res.json())
      .then(data => setSchedule(data))
      .catch(err => console.error('❌ Lỗi lấy lịch:', err));
  }, [users, year, month]);

  // === Lưu thay đổi ca trực ===
  const handleShiftChange = async (work_date, user_id, shift_type) => {
    if (!isAdmin) return alert('Chỉ Admin được sửa lịch!');
    if (!shift_type) return; // Bỏ qua khi chọn trống

    if (shift_type === '__BUSY__') {
      const reason = prompt('Lý do bận:') || 'Không có ghi chú';
      await fetch(`${API}/api/unavailable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, date: work_date, reason })
      });
      alert('✅ Đăng ký bận thành công!');
    } else {
      await fetch(`${API}/api/schedule/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ work_date, user_id, shift_type })
      });
    }

    // === Tải lại ngay sau khi lưu — KHÔNG BỊ MẤT ===
    const res = await fetch(`${API}/api/schedule/${year}/${month}`);
    const data = await res.json();
    setSchedule(data);
  };

  // === Nút Tải lại lịch thủ công ===
  const reloadSchedule = async () => {
    const res = await fetch(`${API}/api/schedule/${year}/${month}`);
    const data = await res.json();
    setSchedule(data);
    alert('✅ Đã cập nhật lịch mới nhất!');
  };

  if (!schedule) return <div style={{ padding: 20 }}>Đang tải...</div>;

  return (
    <div style={{ padding: 16, fontFamily: 'Arial', fontSize: 13 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 16 }}>
        📅 Lịch Trực Cảnh Báo — Tháng {month}/{year}
      </h1>

      {/* === Thanh công cụ: Tháng + Nút Tải lại === */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label>Năm:
          <input 
            type="number" 
            value={year} 
            onChange={e => setYear(+e.target.value)} 
            style={{ width: 70, marginLeft: 5 }} 
          />
        </label>
        <label>Tháng:
          <select 
            value={month} 
            onChange={e => setMonth(+e.target.value)} 
            style={{ marginLeft: 5 }}
          >
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
        
        {/* === Nút Tải lại lịch === */}
        <button 
          onClick={reloadSchedule}
          style={{
            background: '#34A853', 
            color: 'white', 
            border: 'none',
            padding: '6px 14px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔄 Tải lại lịch
        </button>

        <span style={{ marginLeft: 'auto', color: '#d93025', fontWeight: 'bold' }}>
          🔴 Quyền: ADMIN
        </span>
      </div>

      {/* === Bảng lịch === */}
      <table border="1" cellPadding="5" cellSpacing="0" 
        style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f1f3f4' }}>
            <th style={{ minWidth: 50 }}>Ngày</th>
            <th style={{ width: 50 }}>Thứ</th>
            {users.map(u => (
              <th key={u.id} style={{ whiteSpace: 'nowrap' }}>
                {u.name}<br/>
                <small style={{ color: '#666' }}>{u.phone}</small>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schedule.days.map((dayStr, idx) => {
            const dayName = schedule.day_names[idx];
            return (
              <tr key={dayStr}>
                <td align="center" style={{ fontWeight: 'bold', background: '#f8f9fa' }}>
                  {parseInt(dayStr.slice(8))}
                </td>
                <td align="center">{dayName}</td>
                {users.map(u => {
                  const key = [dayStr, u.id];
                  const current = schedule.schedule[key] || '';
                  const isBusy = schedule.unavailable[key];
                  
                  return (
                    <td key={u.id} style={{
                      padding: 0,
                      background: isBusy ? '#fce8e6' : (SHIFT_COLORS[current] || 'transparent'),
                      color: isBusy ? '#d93025' : (current ? 'white' : 'inherit')
                    }}>
                      {isBusy ? (
                        <div style={{ padding: 4, textAlign: 'center' }}>⛔ Bận</div>
                      ) : (
                        <select 
                          value={current}
                          onChange={e => handleShiftChange(dayStr, u.id, e.target.value)}
                          style={{ 
                            width: '100%', 
                            border: 'none', 
                            background: 'transparent', 
                            color: 'inherit', 
                            height: '100%', 
                            cursor: 'pointer' 
                          }}
                        >
                          <option value="">-- Chọn --</option>
                          {SHIFT_OPTIONS.map(s => (
                            <option key={s} value={s} style={{ color: 'black' }}>
                              {s}
                            </option>
                          ))}
                          <option value="__BUSY__" style={{ color: 'red' }}>
                            ⛔ Đăng ký bận
                          </option>
                        </select>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* === Chú thích màu === */}
      <div style={{ marginTop: 16, fontSize: 12 }}>
        <strong>Chú thích:</strong>
        {Object.entries(SHIFT_COLORS).map(([name, color]) => (
          <span key={name} style={{ display: 'inline-flex', alignItems: 'center', margin: '0 8px' }}>
            <span style={{ width: 16, height: 12, background: color, marginRight: 4, borderRadius: 2 }}></span>
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default App;
