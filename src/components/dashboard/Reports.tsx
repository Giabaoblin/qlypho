import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

const data = Array.from({ length: 7 }).map((_, i) => ({
  name: format(subDays(new Date(), 6 - i), 'EEE'),
  completed: Math.floor(Math.random() * 20) + 10,
  late: Math.floor(Math.random() * 5),
}));

export default function Reports() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-8 flex items-center justify-between">
          Weekly Completion Rate
          <span className="text-xs text-indigo-500 font-bold bg-indigo-50 px-2 py-1 rounded">Last 7 Days</span>
        </h4>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontWeight: 700, fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="completed" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorComp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
        <h4 className="font-bold text-gray-900 mb-8 flex items-center justify-between">
          Punctuality by Shift Type
          <span className="text-xs text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded">Live Data</span>
        </h4>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: 'Day', punctuality: 98 },
              { name: 'Night', punctuality: 85 },
              { name: 'Special', punctuality: 92 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} unit="%" tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#F1F5F9' }}
              />
              <Bar dataKey="punctuality" radius={[10, 10, 10, 10]} barSize={40}>
                { [0, 1, 2].map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : index === 1 ? '#f59e0b' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
