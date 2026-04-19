import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { LogIn, Clock, ShieldCheck, Zap } from 'lucide-react';

export default function Login() {
  const { signInWithGoogle } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center bg-indigo-600 p-4 rounded-2xl shadow-xl shadow-indigo-100 mb-6"
          >
            <Clock className="text-white w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            ShiftSync <span className="text-indigo-600">AI</span>
          </h1>
          <p className="mt-4 text-gray-500 text-lg">
            Effortless scheduling and attendance management powered by intelligence.
          </p>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200 border border-gray-100"
        >
          <div className="space-y-6">
            <FeatureItem 
              icon={<ShieldCheck className="text-emerald-500" size={20} />} 
              label="Secure authentication" 
            />
            <FeatureItem 
              icon={<Zap className="text-amber-500" size={20} />} 
              label="Real-time shift updates" 
            />
            <FeatureItem 
              icon={<Clock className="text-indigo-500" size={20} />} 
              label="One-tap check-in/out" 
            />
          </div>

          <div className="mt-10">
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 py-4 px-6 rounded-2xl font-semibold text-gray-900 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm active:scale-[0.98]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-gray-50 p-2 rounded-lg">
        {icon}
      </div>
      <span className="text-gray-600 font-medium">{label}</span>
    </div>
  );
}
