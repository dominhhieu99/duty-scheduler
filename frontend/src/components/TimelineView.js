import React from 'react';
import { User, Info } from 'lucide-react';

const SHIFT_COLORS = {
  'MIDDAY SHIFT': 'bg-blue-500 shadow-blue-200',
  'OFFLINE': 'bg-emerald-500 shadow-emerald-200',
  'UPCODE': 'bg-amber-500 shadow-amber-200',
  'ONLINE': 'bg-orange-500 shadow-orange-200',
  'OFFLINE (U)': 'bg-slate-400 shadow-slate-200'
};

const TimelineView = ({ schedule, users, currentUser }) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Timeline Header */}
          <div className="flex border-b border-slate-200">
            <div className="w-64 sticky left-0 bg-white border-r border-slate-200 p-4 z-20">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Team Members</span>
            </div>
            <div className="flex">
              {schedule.days.map((dayStr, idx) => {
                const dayNum = parseInt(dayStr.slice(8));
                const dayName = schedule.day_names[idx];
                const isToday = today === dayStr;
                return (
                  <div key={dayStr} className={`w-16 flex flex-col items-center py-3 border-r border-slate-100 ${isToday ? 'bg-blue-50' : ''}`}>
                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>{dayName}</span>
                    <span className={`text-sm font-black ${isToday ? 'text-blue-700' : 'text-slate-900'}`}>{dayNum}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline Rows */}
          <div className="divide-y divide-slate-100">
            {users.map(u => (
              <div key={u.id} className="flex group hover:bg-slate-50/50 transition-colors">
                <div className="w-64 sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-200 p-4 z-10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                    <User className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{u.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{u.role_type}</p>
                  </div>
                </div>
                <div className="flex relative">
                  {/* Today Highlight Line */}
                  {schedule.days.includes(today) && (
                    <div 
                      className="absolute top-0 bottom-0 w-px bg-blue-500 z-10 opacity-50"
                      style={{ left: `${schedule.days.indexOf(today) * 64 + 32}px` }}
                    ></div>
                  )}

                  {schedule.days.map(dayStr => {
                    const key = `${dayStr}|${u.id}`;
                    const current = schedule.schedule[key] || '';
                    const isBusy = schedule.unavailable[key] || false;
                    const isToday = today === dayStr;

                    return (
                      <div key={dayStr} className={`w-16 h-16 border-r border-slate-100/50 p-1.5 flex items-center justify-center relative ${isToday ? 'bg-blue-50/20' : ''}`}>
                        {isBusy ? (
                          <div className="w-full h-8 bg-red-100 border border-red-200 rounded-md flex items-center justify-center shadow-sm" title="Busy">
                            <span className="text-[8px] font-black text-red-600">BUSY</span>
                          </div>
                        ) : current ? (
                          <div 
                            className={`w-full h-8 rounded-md shadow-sm border border-black/5 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer z-10 ${SHIFT_COLORS[current]}`}
                            title={current}
                          >
                            <span className="text-[8px] font-black text-white truncate px-1">
                              {current.split(' ')[0]}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
        <Info className="w-4 h-4 text-slate-400" />
        <p className="text-xs text-slate-500 font-medium">Timeline view provides a horizontal overview of team coverage and availability gaps.</p>
      </div>
    </div>
  );
};

export default TimelineView;
