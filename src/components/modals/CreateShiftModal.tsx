import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, MapPin, Type, FileText } from 'lucide-react';
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function CreateShiftModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    type: 'day',
    description: '',
    assignedTo: '', // For MVP, we'll just put a UID string
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'shifts'), {
        ...formData,
        startTime: Timestamp.fromDate(new Date(formData.startTime)),
        endTime: Timestamp.fromDate(new Date(formData.endTime)),
        assignedTo: formData.assignedTo.split(',').map(s => s.trim()),
        status: 'published',
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to create shift");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white"
      >
        <div className="bg-indigo-600 p-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <PlusIcon size={24} />
            </div>
            <h3 className="text-2xl font-black tracking-tight">Set New Shift</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Shift Title</label>
              <div className="relative flex items-center">
                <Type className="absolute left-4 text-gray-400" size={18} />
                <input 
                  type="text" 
                  required
                  placeholder="Morning Patrol / Late Watch"
                  className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-3.5 pl-12 pr-4 font-bold text-gray-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Start Time</label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-4 text-gray-400" size={18} />
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-3.5 pl-12 pr-4 font-bold text-gray-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                    value={formData.startTime}
                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="relative">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">End Time</label>
                <div className="relative flex items-center">
                  <Clock className="absolute left-4 text-gray-400" size={18} />
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-3.5 pl-12 pr-4 font-bold text-gray-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                    value={formData.endTime}
                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Assigned UIDs (Comma separated)</label>
              <input 
                type="text" 
                required
                placeholder="UID1, UID2"
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-3.5 px-4 font-bold text-gray-900 focus:bg-white focus:border-indigo-600 outline-none transition-all font-mono text-sm"
                value={formData.assignedTo}
                onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
              />
            </div>

            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Shift Strategy</label>
              <select 
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-3.5 px-4 font-bold text-gray-900 focus:bg-white focus:border-indigo-600 outline-none transition-all"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="day">Standard Day</option>
                <option value="night">Strategic Night</option>
                <option value="activity">Special Activity</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]">
            Transmit Schedule
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function PlusIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14m-7-7v14" />
    </svg>
  );
}
