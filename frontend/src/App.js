import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import ScheduleView from './components/ScheduleView';
import ApprovalView from './components/ApprovalView';
import { LayoutDashboard, CheckSquare, Loader2 } from 'lucide-react';

const API = '';

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
  const [activeView, setActiveView] = useState('monthly');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // === Initial Load ===
  useEffect(() => {
    const saved = localStorage.getItem('shift_user');
    if (saved) {
      try { setCurrentUser(JSON.parse(saved)); } catch (e) { localStorage.removeItem('shift_user'); }
    }
    
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/api/users`);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('❌ Error loading users:', err);
    }
  };

  // === Authentication ===
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
        setLoginError(data.detail || 'Login failed');
      }
    } catch (err) {
      setLoginError('Server connection error');
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('shift_user');
    setCurrentUser(null);
    setPendingList([]);
    setActiveTab('schedule');
  };

  // === Schedule Data ===
  const loadSchedule = async () => {
    if (!users.length) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/schedule/${year}/${month}`);
      const data = await res.json();
      setSchedule(data);
    } catch (err) {
      console.error('Error loading schedule:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadSchedule(); }, [users, year, month]);

  // === Admin Tasks ===
  const loadPending = async () => {
    if (!currentUser?.is_admin) return;
    try {
      const res = await fetch(`${API}/api/unavailable/pending`);
      const data = await res.json();
      setPendingList(data);
    } catch (err) {
      console.error('❌ Error loading pending:', err);
    }
  };

  useEffect(() => {
    if (currentUser?.is_admin && activeTab === 'approval') loadPending();
  }, [currentUser, activeTab]);

  const handleShiftChange = async (work_date, user_id, shift_type) => {
    if (!currentUser?.is_admin) return;
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
      alert('Error saving: ' + err.message);
    }
    setIsLoading(false);
  };

  const handleRegisterBusy = async (work_date, user_id) => {
    if (!currentUser) { setShowLoginModal(true); return; }
    if (user_id !== currentUser.user_id) { alert('You can only register busy for yourself!'); return; }
    const reason = prompt('Enter reason:');
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

  const handleApprove = async (id, status) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/unavailable/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Action failed');
      await loadPending();
    } catch (err) {
      alert('Error: ' + err.message);
    }
    setIsLoading(false);
  };

  if (!users.length || !schedule) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">Initializing DutyScheduler...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <Header 
        currentUser={currentUser} 
        onLoginClick={() => setShowLoginModal(true)} 
        onLogout={handleLogout} 
      />

      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        loginError={loginError}
        isLoading={isLoading}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation (only for admin) */}
        {currentUser?.is_admin && (
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-sm border border-slate-200 mb-8 w-fit">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'schedule' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Schedule Board
            </button>
            <button
              onClick={() => setActiveTab('approval')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all relative ${activeTab === 'approval' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <CheckSquare className="w-4 h-4" />
              Approval
              {pendingList.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white ring-2 ring-white">
                  {pendingList.length}
                </span>
              )}
            </button>
          </div>
        )}

        {activeTab === 'schedule' ? (
          <ScheduleView 
            schedule={schedule}
            users={users}
            year={year}
            month={month}
            setYear={setYear}
            setMonth={setMonth}
            isLoading={isLoading}
            loadSchedule={loadSchedule}
            currentUser={currentUser}
            handleShiftChange={handleShiftChange}
            handleRegisterBusy={handleRegisterBusy}
            activeView={activeView}
            setActiveView={setActiveView}
          />
        ) : (
          <ApprovalView 
            pendingList={pendingList}
            handleApprove={handleApprove}
            isLoading={isLoading}
          />
        )}
      </main>
      
      {/* Visual Feedback for Loading */}
      {isLoading && activeTab === 'schedule' && (
        <div className="fixed bottom-8 right-8 bg-white px-6 py-3 rounded-2xl shadow-2xl border border-slate-200 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">Syncing Data...</span>
        </div>
      )}
    </div>
  );
}

export default App;
