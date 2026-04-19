import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Calendar, Clock, User, Bell, LayoutDashboard, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { profile, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Clock className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">ShiftSync AI</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active />
          <NavItem icon={<Calendar size={18} />} label="Schedule" />
          <NavItem icon={<Clock size={18} />} label="Attendance" />
          {profile?.role !== 'staff' && <NavItem icon={<MapPin size={18} />} label="Locations" />}
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-500 hover:text-gray-900 relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          
          <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900 leading-none">{profile?.displayName}</p>
              <p className="text-xs text-gray-500 uppercase mt-1 tracking-wider">{profile?.role}</p>
            </div>
            <img 
              src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName}`} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full ring-2 ring-indigo-50 hover:ring-indigo-100 transition-all cursor-pointer shadow-sm"
              referrerPolicy="no-referrer"
            />
            <button 
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <motion.button 
      whileHover={{ y: -2 }}
      className={`flex items-center gap-2 text-sm font-medium transition-colors ${active ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
    >
      {icon}
      {label}
    </motion.button>
  );
}
