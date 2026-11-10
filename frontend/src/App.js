import React, { useEffect, useState } from 'react';

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
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [pendingList, setPendingList] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // === Kiểm tra đăng nhập từ localStorage ===
  useEffect(() => {
    const saved = localStorage.getItem('shift_user');
    if (saved) {
      try { setCurrentUser(JSON.parse(saved)); } catch (e) { localStorage.removeItem('shift_user'); }
    }
  }, []);

  // === Đăng nhập ===
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (data.ok) {
        localStorage.setItem('shift_user', JSON.stringify(data));
        setCurrentUser(data);
        setShowLoginModal(false);
        setLoginForm({ username: '', password: '' });
      } else {
        setLoginError(data.detail || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setLoginError('Lỗi kết nối máy chủ');
    }
    setIsLoading(false);
  };

  // === Đăng xuất ===
  const handleLogout = () => {
    localStorage.removeItem('shift_user');
    setCurrentUser(null);
    setPendingList([]);
  };

  // === Tải danh sách nhân viên ===
  useEffect(() => {
    fetch(`${API}/api/users`)
      .then(res => res.json())
      .then(setUsers)
      .catch(err => console.error('❌ Lỗi tải users:', err));
  }, []);

  // === Tải lịch ===
  const loadSchedule = () => {
    if (!users.length) return;
    setIsLoading(true);
    fetch(`${API}/api/schedule/${year}/${month}`)
      .then(res => res.json())
      .then(setSchedule)
      .catch(err => alert('Lỗi tải lịch: ' + err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadSchedule(); }, [users, year, month]);

  // === Tải danh sách chờ duyệt (chỉ Admin) ===
  const loadPending = () => {
    if (!currentUser?.is_admin) return;
    fetch(`${API}/api/unavailable/pending`)
      .then(res => res.json())
      .then(setPendingList)
      .catch(err => console.error('❌ Lỗi:', err));
  };

  useEffect(() => {
    if (currentUser?.is_admin && activeTab === 'approval') loadPending();
  }, [currentUser, activeTab]);

  // === Sửa lịch — CHỈ ADMIN ===
  const handleShiftChange = async (work_date, user_id, shift_type) => {
    if (!currentUser?.is_admin) return;
    if (!shift_type) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/schedule/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ work_date, user_id, shift_type, is_admin: true })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail);
      await loadSchedule();
    } catch (err) {
      alert('Lỗi lưu: ' + err.message);
    }
    setIsLoading(false);
  };

  // === Đăng ký bận — USER chỉ đăng ký cho chính mình ===
  const handleRegisterBusy = async (work_date, user_id) => {
    if (!currentUser) { alert('🔒 Vui lòng đăng nhập để đăng ký bận!'); return; }
    if (user_id !== currentUser.user_id) { alert('Bạn chỉ có thể đăng ký bận cho chính mình!'); return; }
    const reason = prompt('Nhập lý do bận:');
    if (!reason) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/unavailable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, current_user_id: currentUser.user_id, date: work_date, reason })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail);
      alert('✅ ' + result.message);
    } catch (err) {
      alert('❌ ' + err.message);
    }
    setIsLoading(false);
  };

  // === Duyệt đăng ký bận — CHỈ ADMIN ===
  const handleApprove = async (id, status) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/unavailable/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Thao tác thất bại');
      await loadPending();
      alert(status === 'approved' ? '✅ Đã duyệt!' : '❌ Đã từ chối!');
    } catch (err) {
      alert('Lỗi: ' + err.message);
    }
    setIsLoading(false);
  };

  // === Modal Đăng nhập ===
  const renderLoginModal = () => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
      <div style={{ width: '100%', maxWidth: 400, padding: 30, borderRadius: 8, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', background: '#fff', position: 'relative' }}>
        <button onClick={() => { setShowLoginModal(false); setLoginError(''); setLoginForm({ username: '', password: '' }); }} style={{ position: 'absolute', top: 10, right: 15, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#666' }}>×</button>
        <h2 style={{ textAlign: 'center', marginBottom: 24, color: '#202124' }}>🔐 Đăng nhập</h2>
        {loginError && <div style={{ padding: 10, marginBottom: 16, borderRadius: 4, background: '#fce8e6', color: '#d93025', fontSize: 14 }}>⚠️ {loginError}</div>}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Tên đăng nhập</label>
            <input type="text" value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #dadce0', borderRadius: 4, fontSize: 16, boxSizing: 'border-box' }} placeholder="Nhập tên đăng nhập" required />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Mật khẩu</label>
            <input type="password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #dadce0', borderRadius: 4, fontSize: 16, boxSizing: 'border-box' }} placeholder="Nhập mật khẩu" required />
          </div>
          <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px', background: isLoading ? '#ccc' : '#4285F4', color: 'white', border: 'none', borderRadius: 4, fontSize: 16, fontWeight: 500, cursor: isLoading ? 'not-allowed' : 'pointer' }}>{isLoading ? '⏳ Đang xử lý...' : 'Đăng nhập'}</button>
        </form>
        <p style={{ marginTop: 20, fontSize: 13, color: '#5f6368', textAlign: 'center' }}>
          🔑 Admin: <strong>admin / admin123</strong><br />
          🔑 User: <strong>tên_user / 123456</strong>
        </p>
      </div>
    </div>
  );

  if (!users.length || !schedule) return <div style={{ padding: 30 }}>Đang tải...</div>;

  return (
    <div style={{ padding: 16, fontFamily: 'Arial', fontSize: 13, opacity: isLoading ? 0.7 : 1 }}>
      {showLoginModal && renderLoginModal()}

      <h1 style={{ textAlign: 'center', marginBottom: 16 }}>📅 Lịch Trực Cảnh Báo</h1>

      {/* === Thanh trạng thái & Nút Đăng nhập/Đăng xuất === */}
      <div style={{ padding: '8px 12px', marginBottom: 16, borderRadius: 6, background: currentUser ? (currentUser.is_admin ? '#e6f4ea' : '#e8f0fe') : '#fef7e0', border: `1px solid ${currentUser ? (currentUser.is_admin ? '#34A853' : '#4285F4') : '#f9ab00'}`, color: currentUser ? (currentUser.is_admin ? '#137333' : '#1a73e8') : '#ea8600', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span>{currentUser ? `👤 ${currentUser.name} — ${currentUser.is_admin ? '🔧 Quản trị viên' : '👤 Người dùng'}` : '👁️ Chế độ xem khách — chỉ xem, không chỉnh sửa'}</span>
        {currentUser ? (
          <button onClick={handleLogout} style={{ padding: '5px 14px', background: '#d93025', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>Đăng xuất</button>
        ) : (
          <button onClick={() => setShowLoginModal(true)} style={{ padding: '5px 14px', background: '#4285F4', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13 }}>Đăng nhập</button>
        )}
      </div>

      {/* === Tab điều hướng — Chỉ hiện khi là Admin === */}
      {currentUser?.is_admin && (
        <div style={{ marginBottom: 16, borderBottom: '1px solid #ddd' }}>
          <button onClick={() => setActiveTab('schedule')} style={{ padding: '8px 16px', border: 'none', background: activeTab === 'schedule' ? '#e6f4ea' : 'transparent', borderBottom: activeTab === 'schedule' ? '2px solid #34A853' : '2px solid transparent', cursor: 'pointer', fontWeight: activeTab === 'schedule' ? 600 : 400 }}>📋 Bảng lịch trực</button>
          <button onClick={() => { setActiveTab('approval'); loadPending(); }} style={{ padding: '8px 16px', border: 'none', background: activeTab === 'approval' ? '#fce8e6' : 'transparent', borderBottom: activeTab === 'approval' ? '2px solid #d93025' : '2px solid transparent', cursor: 'pointer', fontWeight: activeTab === 'approval' ? 600 : 400, marginLeft: 8 }}>
            ✅ Duyệt đăng ký bận {pendingList.length > 0 && <span style={{ background: '#d93025', color: 'white', borderRadius: 10, padding: '1px 8px', marginLeft: 6, fontSize: 11 }}>{pendingList.length}</span>}
          </button>
        </div>
      )}

      {/* === TAB 1: BẢNG LỊCH TRỰC === */}
      {activeTab === 'schedule' && (
        <>
          <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <label>Năm: <input type="number" value={year} onChange={e => setYear(+e.target.value)} style={{ width: 70, marginLeft: 5 }} disabled={isLoading} /></label>
            <label>Tháng: <select value={month} onChange={e => setMonth(+e.target.value)} style={{ marginLeft: 5 }} disabled={isLoading}>{[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{m}</option>)}</select></label>
            <button onClick={loadSchedule} disabled={isLoading} style={{ padding: '6px 14px', background: isLoading ? '#ccc' : '#4285F4', color: 'white', border: 'none', borderRadius: 4, cursor: isLoading ? 'not-allowed' : 'pointer' }}>🔄 Tải lại</button>
          </div>

          <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f1f3f4' }}>
                <th style={{ minWidth: 50 }}>Ngày</th>
                <th style={{ width: 50 }}>Thứ</th>
                {users.map(u => <th key={u.id} style={{ whiteSpace: 'nowrap' }}>{u.name}<br /><small style={{ color: '#666' }}>{u.role_type}</small></th>)}
              </tr>
            </thead>
            <tbody>
              {schedule.days.map((dayStr, idx) => {
                const dayName = schedule.day_names[idx];
                return (
                  <tr key={dayStr}>
                    <td align="center" style={{ fontWeight: 'bold', background: '#f8f9fa' }}>{parseInt(dayStr.slice(8))}</td>
                    <td align="center">{dayName}</td>
                    {users.map(u => {
                      const key = `${dayStr}|${u.id}`;
                      const current = schedule.schedule[key] || '';
                      const isBusy = schedule.unavailable[key] || false;
                      const isOwnCell = currentUser && currentUser.user_id === u.id;
                      return (
                        <td key={u.id} style={{ padding: 0, textAlign: 'center', background: isBusy ? '#fce8e6' : (SHIFT_COLORS[current] || 'transparent'), color: isBusy ? '#d93025' : (current ? 'white' : 'inherit') }}>
                          {isBusy ? (
                            <div style={{ padding: 6, fontSize: 12 }}>⛔ Bận</div>
                          ) : currentUser?.is_admin ? (
                            <select value={current} onChange={e => handleShiftChange(dayStr, u.id, e.target.value)} disabled={isLoading} style={{ width: '100%', border: 'none', background: 'transparent', color: 'inherit', height: '100%', cursor: isLoading ? 'wait' : 'pointer', padding: '4px' }}>
                              <option value="">-- Chọn --</option>
                              {SHIFT_OPTIONS.map(s => <option key={s} value={s} style={{ color: 'black' }}>{s}</option>)}
                            </select>
                          ) : (
                            <div style={{ padding: '6px', fontSize: 12 }}>
                              {current || <span style={{ color: '#999' }}>—</span>}
                              {isOwnCell && currentUser && !current && (
                                <button onClick={() => handleRegisterBusy(dayStr, u.id)} style={{ display: 'block', marginTop: 4, padding: '2px 8px', background: '#f9ab00', color: 'white', border: 'none', borderRadius: 3, fontSize: 11, cursor: 'pointer', width: '100%' }}>📝 Đăng ký bận</button>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ marginTop: 20, fontSize: 12, paddingTop: 10, borderTop: '1px solid #eee' }}>
            <strong>Chú thích:</strong>
            {Object.entries(SHIFT_COLORS).map(([name, color]) => (
              <span key={name} style={{ display: 'inline-flex', alignItems: 'center', margin: '0 8px' }}>
                <span style={{ width: 16, height: 12, background: color, marginRight: 4, borderRadius: 2 }}></span>{name}
              </span>
            ))}
          </div>
        </>
      )}

      {/* === TAB 2: DUYỆT ĐĂNG KÝ BẬN — CHỈ ADMIN === */}
      {activeTab === 'approval' && currentUser?.is_admin && (
        <div>
          <h3 style={{ marginBottom: 16 }}>📋 Danh sách đăng ký bận chờ duyệt</h3>
          {pendingList.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: 8 }}>✅ Không có yêu cầu nào chờ duyệt</div>
          ) : (
            <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f3f4' }}>
                  <th>STT</th>
                  <th>Người đăng ký</th>
                  <th>Ngày bận</th>
                  <th>Lý do</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.map((item, idx) => (
                  <tr key={item.id}>
                    <td align="center">{idx + 1}</td>
                    <td>{item.user_id}</td>
                    <td align="center">{item.date}</td>
                    <td>{item.reason}</td>
                    <td align="center">
                      <button onClick={() => handleApprove(item.id, 'approved')} style={{ padding: '5px 12px', background: '#34A853', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 6 }}>✅ Duyệt</button>
                      <button onClick={() => handleApprove(item.id, 'rejected')} style={{ padding: '5px 12px', background: '#d93025', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>❌ Từ chối</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default App;