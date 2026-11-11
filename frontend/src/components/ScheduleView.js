import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, RefreshCcw, User } from 'lucide-react';
import WeeklyView from './WeeklyView';
import TimelineView from './TimelineView';

const SHIFT_OPTIONS = ['MIDDAY SHIFT', 'OFFLINE', 'UPCODE', 'ONLINE', 'OFFLINE (U)'];
const SHIFT_COLORS = {
  'MIDDAY SHIFT': 'bg-blue-500 text-white',
  'OFFLINE': 'bg-emerald-500 text-white',
  'UPCODE': 'bg-amber-500 text-white',
  'ONLINE': 'bg-orange-500 text-white',
  'OFFLINE (U)': 'bg-slate-400 text-white'
};

const ScheduleView = ({ 
  schedule, 
  users, 
  year, 
  month, 
  setYear, 
  setMonth, 
  isLoading, 
  loadSchedule, 
  currentUser, 
  handleShiftChange, 
  handleRegisterBusy,
  activeView,
  setActiveView
}) => {
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'weekly':
        return (
          <WeeklyView 
            schedule={schedule}
            users={users}
            currentUser={currentUser}
            handleShiftChange={handleShiftChange}
            handleRegisterBusy={handleRegisterBusy}
            isLoading={isLoading}
          />
        );
      case 'timeline':
        return (
          <TimelineView 
            schedule={schedule}
            users={users}
            currentUser={currentUser}
          />
        );
      default:
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-20 sticky left-0 bg-slate-50/50 backdrop-blur z-10">Date</th>
                    <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-16">Day</th>
                    {users.map(u => (
                      <th key={u.id} className="p-4 text-center min-w-[150px]">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                            <User className="w-4 h-4 text-slate-500" />
                          </div>
                          <span className="text-sm font-bold text-slate-900">{u.name}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-tight">{u.role_type}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedule.days.map((dayStr, idx) => {
                    const dayName = schedule.day_names[idx];
                    const dayNum = parseInt(dayStr.slice(8));
                    const isToday = new Date().toISOString().split('T')[0] === dayStr;
                    
                    return (
                      <tr key={dayStr} className={`group hover:bg-slate-50/50 transition-colors ${isToday ? 'bg-blue-50/30' : ''}`}>
                        <td className={`p-4 font-bold text-sm sticky left-0 z-10 ${isToday ? 'bg-blue-50 text-blue-600' : 'bg-white group-hover:bg-slate-50 text-slate-900'}`}>
                          {dayNum}
                        </td>
                        <td className={`p-4 text-xs font-medium ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                          {dayName}
                        </td>
                        {users.map(u => {
                          const key = `${dayStr}|${u.id}`;
                          const current = schedule.schedule[key] || '';
                          const isBusy = schedule.unavailable[key] || false;
                          const isOwnCell = currentUser && currentUser.user_id === u.id;
                          
                          return (
                            <td key={u.id} className="p-2 h-16">
                              <div className="h-full flex items-center justify-center">
                                {isBusy ? (
                                  <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
                                    BUSY
                                  </div>
                                ) : currentUser?.is_admin ? (
                                  <div className="w-full h-full relative group/cell">
                                    <select 
                                      value={current} 
                                      onChange={e => handleShiftChange(dayStr, u.id, e.target.value)}
                                      disabled={isLoading}
                                      className={`w-full h-full appearance-none px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center outline-none border border-transparent hover:border-slate-300 focus:ring-2 focus:ring-blue-500/20 ${current ? SHIFT_COLORS[current] : 'bg-slate-50 text-slate-400'}`}
                                    >
                                      <option value="">-- Shift --</option>
                                      {SHIFT_OPTIONS.map(s => <option key={s} value={s} className="bg-white text-slate-900">{s}</option>)}
                                    </select>
                                  </div>
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 group/cell">
                                    {current ? (
                                      <div className={`w-full h-full flex items-center justify-center px-3 py-2 rounded-xl text-xs font-bold ${SHIFT_COLORS[current]} shadow-sm`}>
                                        {current}
                                      </div>
                                    ) : (
                                      <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                                        <span className="text-slate-300">—</span>
                                        {isOwnCell && (
                                          <button 
                                            onClick={() => handleRegisterBusy(dayStr, u.id)}
                                            className="opacity-0 group-hover/cell:opacity-100 px-3 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm shadow-amber-200"
                                          >
                                            Register Busy
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* View & Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveView('monthly')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'monthly' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setActiveView('weekly')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'weekly' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Weekly
          </button>
          <button 
            onClick={() => setActiveView('timeline')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'timeline' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            Timeline
          </button>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 min-w-[160px] justify-center">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-900 text-lg">{months[month-1]} {year}</span>
          </div>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={loadSchedule}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors font-semibold text-sm border border-slate-200"
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {renderContent()}

      {/* Legend */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Shift Legend</h4>
        <div className="flex flex-wrap gap-4">
          {Object.entries(SHIFT_COLORS).map(([name, colorClass]) => (
            <div key={name} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${colorClass.split(' ')[0]}`}></div>
              <span className="text-sm font-medium text-slate-600">{name}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium text-slate-600">Unavailable / Busy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
