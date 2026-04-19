import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, onSnapshot, orderBy, limit, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, AlertCircle, CheckCircle2, TrendingUp, Sparkles, Plus, Users, UserCheck, LayoutGrid, BarChart3, MapPin } from 'lucide-react';
import { format, isToday, isFuture, isPast } from 'date-fns';
import { analyzeShifts } from '../../services/aiService';
import ShiftCalendar from '../shifts/ShiftCalendar';
import Reports from './Reports';
import CreateShiftModal from '../modals/CreateShiftModal';
import RequestLeaveModal from '../modals/RequestLeaveModal';

export default function Dashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'reports'>('overview');
  const [myShifts, setMyShifts] = useState<any[]>([]);
  const [allShifts, setAllShifts] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  useEffect(() => {
    if (!profile) return;

    const qMyShifts = query(collection(db, 'shifts'), where('assignedTo', 'array-contains', profile.uid), orderBy('startTime', 'asc'));
    const unsubscribeMyShifts = onSnapshot(qMyShifts, (snapshot) => {
      setMyShifts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    let unsubscribeAllShifts = () => {};
    if (profile.role !== 'staff') {
      const qAllShifts = query(collection(db, 'shifts'), orderBy('startTime', 'desc'), limit(50));
      unsubscribeAllShifts = onSnapshot(qAllShifts, (snapshot) => {
        setAllShifts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
    }

    const qRequests = profile.role === 'staff' 
      ? query(collection(db, 'requests'), where('userId', '==', profile.uid), limit(10))
      : query(collection(db, 'requests'), where('status', '==', 'pending'), limit(10));
    
    const unsubscribeRequests = onSnapshot(qRequests, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribeMyShifts();
      unsubscribeAllShifts();
      unsubscribeRequests();
    };
  }, [profile]);

  const handleCheckIn = async (shift: any) => {
    setIsCheckingIn(true);
    try {
      if (!navigator.geolocation) throw new Error("Geolocation not supported");
      
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await addDoc(collection(db, 'attendance'), {
          shiftId: shift.id,
          userId: profile?.uid,
          checkInTime: serverTimestamp(),
          status: 'in-progress',
          location: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          }
        });
        alert("Checked in successfully!");
        setIsCheckingIn(false);
      });
    } catch (error) {
      console.error(error);
      setIsCheckingIn(false);
    }
  };

  const runAiAnalysis = async () => {
    setAnalyzing(true);
    const insights = await analyzeShifts(allShifts, attendance);
    setAiInsights(insights);
    setAnalyzing(false);
  };

  const todayShifts = myShifts.filter(s => isToday(new Date(s.startTime.toDate())));
  const currentShift = todayShifts.find(s => isPast(new Date(s.startTime.toDate())) && isFuture(new Date(s.endTime.toDate())));

  return (
    <div className="space-y-8 pb-10">
      {/* Header section with tabs */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Workplace <span className="text-indigo-600 font-extrabold underline decoration-indigo-200 underline-offset-4">Control</span>
          </h2>
          <div className="mt-6 flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit transition-all">
            <TabButton icon={<LayoutGrid size={16} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <TabButton icon={<Calendar size={16} />} label="Calendar" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
            {profile?.role !== 'staff' && <TabButton icon={<BarChart3 size={16} />} label="Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none">Status</p>
             <p className="text-sm font-bold text-emerald-500 flex items-center gap-1.5 mt-1 justify-end">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               System Online
             </p>
          </div>
          {profile?.role !== 'staff' ? (
            <button 
              onClick={() => setIsShiftModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
            >
              <Plus size={20} />
              Set Shift
            </button>
          ) : (
            <button 
              onClick={() => setIsLeaveModalOpen(true)}
              className="flex items-center gap-2 bg-white border-2 border-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-all active:scale-95"
            >
              <AlertCircle size={20} className="text-amber-500" />
              Request Leave
            </button>
          )}
        </div>
      </section>

      <CreateShiftModal isOpen={isShiftModalOpen} onClose={() => setIsShiftModalOpen(false)} />
      <RequestLeaveModal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} />

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={<Calendar className="text-blue-500" />} label="Scheduled" value={todayShifts.length.toString()} bgColor="bg-blue-50" />
              <StatCard icon={<Clock className="text-amber-500" />} label="Pending" value={requests.length.toString()} bgColor="bg-amber-50" />
              <StatCard icon={<UserCheck className="text-emerald-500" />} label="Attendance" value="94%" bgColor="bg-emerald-50" />
              <StatCard icon={<Users className="text-purple-500" />} label="Active Staff" value="18" bgColor="bg-purple-50" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {currentShift ? (
                  <div className="relative overflow-hidden bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform rotate-12">
                      <Clock size={160} />
                    </div>
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                        On Duty Now
                      </div>
                      <h3 className="text-3xl font-black mb-1">{currentShift.title}</h3>
                      <p className="text-indigo-100 mb-8 flex items-center gap-3 font-medium text-lg">
                        <Clock size={20} />
                        {format(currentShift.startTime.toDate(), 'HH:mm')} - {format(currentShift.endTime.toDate(), 'HH:mm')} 
                        <span className="opacity-40">|</span> 
                        {currentShift.type} Shift
                      </p>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleCheckIn(currentShift)}
                          disabled={isCheckingIn}
                          className="bg-white text-indigo-600 px-8 py-3.5 rounded-2xl font-black hover:shadow-2xl transition-all active:scale-95 shadow-lg disabled:opacity-50"
                        >
                          {isCheckingIn ? 'Locating...' : 'Register Check-In'}
                        </button>
                        <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3.5 rounded-2xl font-black transition-all border border-white/20 backdrop-blur-sm">
                          View Rules
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-100 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
                    <div className="bg-indigo-50 p-6 rounded-full mb-6">
                      <Clock className="text-indigo-300" size={48} />
                    </div>
                    <h3 className="text-gray-900 font-black text-2xl tracking-tight">Enjoy your downtime</h3>
                    <p className="text-gray-400 mt-2 max-w-sm font-medium leading-relaxed">
                      You are not currently assigned to any active shift. Take a rest and check your upcoming schedule below.
                    </p>
                  </div>
                )}

                {profile?.role !== 'staff' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-3 rounded-2xl">
                          <Sparkles className="text-indigo-600" size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 text-lg">AI Performance Engine</h4>
                          <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.2em] mt-0.5">Strategic Analysis</p>
                        </div>
                      </div>
                      <button onClick={runAiAnalysis} disabled={analyzing} className="bg-gray-50 hover:bg-gray-100 text-gray-900 px-4 py-2 rounded-xl text-xs font-bold border border-gray-100 flex items-center gap-2 group transition-all">
                        <TrendingUp size={14} className="group-hover:translate-x-1 duration-500" />
                        {analyzing ? 'Processing...' : 'Generate Insights'}
                      </button>
                    </div>

                    {aiInsights ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Summary</label>
                            <p className="text-gray-700 font-medium leading-relaxed bg-gray-50 p-5 rounded-2xl border border-gray-100 italic">
                              "{aiInsights.summary}"
                            </p>
                         </div>
                         <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Strategic Suggestions</label>
                            <div className="space-y-3">
                              {aiInsights.suggestions?.map((s: string, i: number) => (
                                <div key={i} className="flex gap-4 items-start bg-indigo-50/30 p-4 rounded-xl border border-indigo-50/50">
                                  <div className="w-2 h-2 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                  <p className="text-gray-600 font-semibold text-sm">{s}</p>
                                </div>
                              ))}
                            </div>
                         </div>
                      </div>
                    ) : (
                      <div className="py-12 flex flex-col items-center gap-4 border-2 border-dashed border-gray-100 rounded-3xl">
                        <Sparkles size={32} className="text-gray-200" />
                        <p className="text-gray-400 font-bold text-sm">Awaiting Strategic Signal...</p>
                      </div>
                    )}
                  </motion.div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-gray-900 text-xl tracking-tight">Today's Roster</h4>
                    <button className="text-indigo-600 text-xs font-black uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">Full List</button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {myShifts.slice(0, 3).map((shift) => (
                      <div key={shift.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer border-l-4 border-l-transparent hover:border-l-indigo-600">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex flex-col items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-sm">
                            <span className="text-[10px] font-black uppercase tracking-tighter opacity-50">{format(shift.startTime.toDate(), 'MMM')}</span>
                            <span className="text-xl font-black mt-0.5">{format(shift.startTime.toDate(), 'dd')}</span>
                          </div>
                          <div>
                            <h5 className="font-black text-gray-900 text-lg">{shift.title}</h5>
                            <p className="text-xs text-gray-400 font-bold flex items-center gap-4 mt-2 uppercase tracking-widest">
                              <span className="flex items-center gap-2 text-indigo-500"><Clock size={14} /> {format(shift.startTime.toDate(), 'HH:mm')} - {format(shift.endTime.toDate(), 'HH:mm')}</span>
                              <span className="flex items-center gap-2"><MapPin size={14} className="text-gray-300" /> Floor 2</span>
                              <span className={`px-2 py-0.5 rounded ${shift.type === 'night' ? 'bg-indigo-900 text-white' : 'bg-amber-100 text-amber-700'}`}>{shift.type}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex -space-x-3">
                           {[1,2,3].map(i => (
                             <img key={i} src={`https://picsum.photos/seed/user${i}/100/100`} className="w-10 h-10 rounded-full border-4 border-white object-cover" referrerPolicy="no-referrer" />
                           ))}
                           <div className="w-10 h-10 rounded-full bg-gray-100 border-4 border-white flex items-center justify-center text-[10px] font-black text-gray-500 font-mono">+2</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative group overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -translate-y-12 translate-x-12 blur-2xl"></div>
                   <h4 className="font-black text-gray-900 text-lg mb-8 flex items-center justify-between relative z-10">
                    Active Signals
                    <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-lg animate-bounce">
                      {requests.length} NEW
                    </span>
                  </h4>
                  <div className="space-y-6 relative z-10">
                    {requests.length > 0 ? requests.map((req) => (
                      <div key={req.id} className="group/item pb-6 border-b border-gray-50 last:border-0 last:pb-0 hover:bg-gray-50/50 p-2 rounded-2xl transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-indigo-400 tracking-[0.2em]">REQ#{req.id.slice(0, 5).toUpperCase()}</span>
                          <StatusBadge status={req.status} />
                        </div>
                        <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-relaxed">{req.reason || 'Urgent schedule modification request.'}</p>
                        <div className="flex items-center justify-between mt-4">
                           <div className="flex items-center gap-2">
                             <img src={`https://picsum.photos/seed/${req.userId}/50/50`} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                             <span className="text-[10px] font-black text-gray-400 capitalize">{req.type} Type</span>
                           </div>
                           <span className="text-[10px] font-bold text-gray-300">2H AGO</span>
                        </div>
                      </div>
                    )) : (
                      <div className="py-12 text-center">
                        <AlertCircle className="text-gray-100 mx-auto mb-4" size={48} />
                        <p className="text-gray-300 font-black text-xs uppercase tracking-widest">No signals detected</p>
                      </div>
                    )}
                  </div>
                  <button className="w-full mt-8 py-3.5 rounded-2xl bg-gray-900 text-white font-black text-sm hover:bg-indigo-600 transition-all shadow-lg active:scale-95">
                    Process All Signals
                  </button>
                </section>

                <section className="bg-indigo-900 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                     <TrendingUp size={120} />
                   </div>
                   <div className="relative z-10">
                     <div className="bg-white/10 p-2.5 rounded-xl w-fit mb-6">
                       <TrendingUp size={24} className="text-indigo-400" />
                     </div>
                     <h4 className="font-black text-2xl mb-2 tracking-tight">Trust Index</h4>
                     <p className="text-indigo-200 text-sm font-medium leading-relaxed mb-8">
                       Your punctuality score <span className="text-white font-black underline decoration-indigo-400 underline-offset-4">98.4%</span> surpasses the team average.
                     </p>
                     <div className="h-2 bg-indigo-950/50 rounded-full overflow-hidden mb-2">
                       <motion.div initial={{ width: 0 }} animate={{ width: '98.4%' }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-indigo-500 to-indigo-300" />
                     </div>
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest text-right">98.4% Reliability</p>
                   </div>
                </section>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'calendar' && (
          <motion.div key="calendar" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
            <ShiftCalendar shifts={allShifts} />
          </motion.div>
        )}

        {activeTab === 'reports' && (
          <motion.div key="reports" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <Reports />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, bgColor }: { icon: React.ReactNode, label: string, value: string, bgColor: string }) {
  return (
    <div className="bg-white p-7 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden">
      <div className={`${bgColor} w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-indigo-600 transition-colors duration-500`}>
        <div className="group-hover:text-white transition-colors duration-500">
          {React.cloneElement(icon as React.ReactElement, { size: 28 })}
        </div>
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mb-2">{label}</p>
      <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{value}</h3>
      <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-gray-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
    </div>
  );
}

function TabButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2.5 px-6 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest ${active ? 'bg-white text-indigo-600 shadow-md ring-1 ring-gray-200/50' : 'text-gray-500 hover:text-gray-800'}`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rejected: 'bg-red-50 text-red-600 border-red-100',
  };
  return (
    <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase border tracking-widest ${styles[status]}`}>
      {status}
    </span>
  );
}



