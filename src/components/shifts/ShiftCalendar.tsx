import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { motion } from 'framer-motion';

export default function CalendarView({ shifts }: { shifts: any[] }) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="grid grid-cols-7 border-b border-gray-100">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-4 text-center text-xs font-black uppercase text-gray-400 tracking-widest">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayShifts = shifts.filter(s => isSameDay(new Date(s.startTime.toDate()), day));
          const isTodayDay = isSameDay(day, today);
          
          return (
            <div key={idx} className={`min-h-[120px] p-2 border-r border-b border-gray-50 last:border-r-0 relative hover:bg-gray-50/50 transition-colors ${!isSameDay(day, monthStart) && day < monthStart ? 'opacity-30' : ''}`}>
              <span className={`text-xs font-bold ${isTodayDay ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-gray-400'}`}>
                {format(day, 'd')}
              </span>
              <div className="mt-2 space-y-1">
                {dayShifts.map((s) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={s.id} 
                    className={`text-[10px] p-1.5 rounded-lg font-bold truncate border ${s.type === 'night' ? 'bg-indigo-900 text-white border-indigo-800' : 'bg-indigo-50 text-indigo-700 border-indigo-100'}`}
                  >
                    {format(s.startTime.toDate(), 'HH:mm')} {s.title}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
