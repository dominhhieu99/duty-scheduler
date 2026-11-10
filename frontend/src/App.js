import React, { useEffect, useState } from 'react';

// === DÙNG PROXY — GỌI TRỰC TIẾP /api/... K HAY ĐỔI CỔNG ===
const API = ''; // Để trống → gọi qua cùng domain, proxy tự chuyển đến cổng 8000

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

  useEffect(() => {
    console.log('📥 Đang lấy users qua proxy...');
    fetch(`${API}/api/users`)
      .then(res => {
        console.log('→ Trạng thái:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('✅ Nhận được', data.length, 'nhân viên');
        setUsers(data);
      })
      .catch(err => console.error('❌ Lỗi:', err));
  }, []);

  useEffect(() => {
    if (!users.length) return;
    fetch(`${API}/api/schedule/${year}/${month}`)
      .then(res => res.json())
      .then(setSchedule);
  }, [users, year, month]);

  const handleShiftChange = async (work_date, user_id, shift_type) => {
    if (!isAdmin) return alert('Chỉ Admin được sửa lịch!');
    if (shift_type === '__BUSY__') {
      const reason = prompt('Lý do bận:');
      await fetch(`${API}/api/unavailable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, date: work_date, reason })
      });
      alert('✅ Đăng ký thành công!');
    } else {
      await fetch(`${API}/api/schedule/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ work_date, user_id, shift_type })
      });
    }
    fetch(`${API}/api/schedule/${year}/${month}`)
      .then(r => r.json())
      .then(setSchedule);
  };

  if (!schedule) return <div style={{ padding: 20 }}>Đang tải...<br/>Đang gọi: {API}/api/users</div>;

  return (
    <div style={{ padding: 16, fontFamily: 'Arial', fontSize: 13 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 16 }}>
        📅 Lịch Trực Cảnh Báo — Tháng {month}/{year}
      </h1>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
        <label>Năm:
          <input type="number" value={year} onChange={e => setYear(+e.target.value)} style={{ width: 70, marginLeft: 5 }} />
        </label>
        <label>Tháng:
          <select value={month} onChange={e => setMonth(+e.target.value)} style={{ marginLeft: 5 }}>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </label>
        <span style={{ marginLeft: 'auto', color: '#d93025', fontWeight: 'bold' }}>🔴 Quyền: ADMIN</span>
      </div>
      <table border="1" cellPadding="5" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f1f3f4' }}>
            <th style={{ minWidth: 50 }}>Ngày</th>
            <th style={{ width: 50 }}>Thứ</th>
            {users.map(u => (
              <th key={u.id} style={{ whiteSpace: 'nowrap' }}>
                {u.name}<br/><small style={{ color: '#666' }}>{u.phone}</small>
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
                        <select value={current}
                          onChange={e => handleShiftChange(dayStr, u.id, e.target.value)}
                          style={{ width: '100%', border: 'none', background: 'transparent', color: 'inherit', height: '100%', cursor: 'pointer' }}>
                          <option value="">-- Chọn --</option>
                          {SHIFT_OPTIONS.map(s => <option key={s} value={s} style={{ color: 'black' }}>{s}</option>)}
                          <option value="__BUSY__" style={{ color: 'red' }}>⛔ Đăng ký bận</option>
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
      <div style={{ marginTop: 16, fontSize: 12 }}>
        <strong>Chú thích:</strong>
        {Object.entries(SHIFT_COLORS).map(([name, color]) => (
          <span key={name} style={{ display: 'inline-flex', alignItems: 'center', margin: '0 8px' }}>
            <span style={{ width: 16, height: 12, background: color, marginRight: 4, borderRadius: 2 }}></span>{name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default App;
