import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, MessageCircle, RefreshCw, Calendar } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';

export default function RequestLeaveModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    type: 'leave',
    reason: '',
    shiftId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'requests'), {
        ...formData,
        userId: profile?.uid,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      alert("Request transmitted successfully.");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Transmission failed.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white"
      >
        <div className="bg-amber-500 p-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Calendar size={24} />
            </div>
            <h3 className="text-2xl font-black tracking-tight">Modification Request</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Request Category</label>
              <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'leave' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${formData.type === 'leave' ? 'bg-white shadow-md text-amber-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <MessageCircle size={18} />
                  Leave
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'swap' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${formData.type === 'swap' ? 'bg-white shadow-md text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  <RefreshCw size={18} />
                  Swap
                </button>
              </div>
            </div>

            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Related Shift ID</label>
              <input 
                type="text" 
                required
                placeholder="ID of the shift you want to modify"
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-3.5 px-4 font-bold text-gray-900 focus:bg-white focus:border-amber-500 outline-none transition-all font-mono"
                value={formData.shiftId}
                onChange={e => setFormData({ ...formData, shiftId: e.target.value })}
              />
            </div>

            <div className="relative">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-1 block">Justification</label>
              <textarea 
                required
                rows={4}
                placeholder="Briefly explain the reason for this request..."
                className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl py-3.5 px-4 font-bold text-gray-900 focus:bg-white focus:border-amber-500 outline-none transition-all resize-none"
                value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="w-full bg-amber-500 text-white py-4 rounded-2xl font-black text-lg hover:bg-amber-600 transition-all shadow-xl shadow-amber-100 active:scale-[0.98] flex items-center justify-center gap-3">
            <Send size={20} />
            Transmit Request
          </button>
        </form>
      </motion.div>
    </div>
  );
}
