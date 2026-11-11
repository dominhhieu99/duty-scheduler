import React from 'react';
import { User, Clock } from 'lucide-react';

const SHIFT_COLORS = {
  'MIDDAY SHIFT': 'bg-blue-500 text-white shadow-blue-100',
  'OFFLINE': 'bg-emerald-500 text-white shadow-emerald-100',
  'UPCODE': 'bg-amber-500 text-white shadow-amber-100',
  'ONLINE': 'bg-orange-500 text-white shadow-orange-100',
  'OFFLINE (U)': 'bg-slate-400 text-white shadow-slate-100'
};

const WeeklyView = ({ schedule, users, currentUser, handleShiftChange, handleRegisterBusy, isLoading }) => {
  // Get current week (first 7 days for demo, or based on real current date)
  const today = new Date().toISOString().split('T')[0];
  let weekDays = schedule.days.slice(0, 7); // Default to first 7 days
  
  // Try to find current week
  const todayIdx = schedule.days.indexOf(today);
  if (todayIdx !== -1) {
    const start = Math.max(0, todayIdx - new Date().getDay());
    weekDays = schedule.days.slice(start, start + 7);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {weekDays.map((dayStr, idx) => {
        const isToday = today === dayStr;
        const dayName = schedule.day_names[schedule.days.indexOf(dayStr)];
        const dayNum = parseInt(dayStr.slice(8));
        
        return (
          <div key={dayStr} className={`flex flex-col gap-4 p-4 rounded-2xl border transition-all ${isToday ? 'bg-blue-50/50 border-blue-200 shadow-lg shadow-blue-50' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex flex-col items-center gap-1 border-b border-slate-100 pb-3">
              <span className={`text-xs font-bold uppercase tracking-widest ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>{dayName}</span>
              <span className={`text-2xl font-black ${isToday ? 'text-blue-700' : 'text-slate-900'}`}>{dayNum}</span>
            </div>
            
            <div className="space-y-3">
              {users.map(u => {
                const key = `${dayStr}|${u.id}`;
                const current = schedule.schedule[key] || '';
                const isBusy = schedule.unavailable[key] || false;
                
                return (
                  <div key={u.id} className="group/item relative">
                    <div className={`p-3 rounded-xl border transition-all ${current ? SHIFT_COLORS[current] : isBusy ? 'bg-red-50 border-red-100 text-red-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${current ? 'bg-white/20 border-white/20' : 'bg-white border-slate-200'}`}>
                          <User className={`w-3 h-3 ${current ? 'text-white' : 'text-slate-400'}`} />
                        </div>
                        <span className="text-[10px] font-bold truncate uppercase tracking-tight">{u.name.split(' ')[0]}</span>
                      </div>
                      <div className="text-[10px] font-black uppercase tracking-widest truncate">
                        {isBusy ? 'BUSY' : (current || 'NO SHIFT')}
                      </div>
                      
                      {/* Current Shift Indicator */}
                      {isToday && current && (
                        <div className="absolute -top-1 -right-1">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyView;
