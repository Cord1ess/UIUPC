"use client";

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { FaEnvelope, FaLock, FaSpinner, FaArrowLeft, FaShieldAlt, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollRevealText from '@/components/home/ScrollRevealText';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin'); 
    } catch (error: any) {
      console.error('Login error:', error);
      setError('Invalid email or password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] transition-colors duration-500 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Cinematic Flare */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-uiupc-orange/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-uiupc-orange/10 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-xl relative z-10">
        <div className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-uiupc-orange/10 border border-uiupc-orange/20 text-uiupc-orange text-[10px] font-black uppercase tracking-[0.3em] mb-8"
            >
              <FaShieldAlt /> Restricted Access
            </motion.div>
            
            <ScrollRevealText 
              text="UIUPC Login" 
              className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none text-zinc-900 dark:text-white"
            />
            <p className="mt-8 text-zinc-500 dark:text-zinc-400 font-medium text-sm uppercase tracking-widest">
              Authorized Personnel Only
            </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#ffffff] dark:bg-[#050505] p-8 md:p-14 rounded-2xl border border-black/5 dark:border-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.05)]"
        >
          <form className="space-y-10" onSubmit={handleLogin}>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   exit={{ opacity: 0, height: 0 }}
                   className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 overflow-hidden"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-8">
              <div className="space-y-3 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <FaEnvelope className="text-xs" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@uiupc.com"
                  className="w-full bg-transparent border-b-2 border-black/10 dark:border-white/10 py-4 outline-none focus:border-uiupc-orange transition-colors text-zinc-900 dark:text-white font-bold"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-3 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <FaLock className="text-xs" /> Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b-2 border-black/10 dark:border-white/10 py-4 outline-none focus:border-uiupc-orange transition-colors text-zinc-900 dark:text-white font-bold"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full h-20 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center gap-4 group transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-2xl overflow-hidden relative"
              disabled={loading}
            >
              <div className="relative z-10 flex items-center gap-4">
                <span className="text-[11px] font-black uppercase tracking-[0.4em]">
                  {loading ? 'Authenticating...' : 'Enter Panel'}
                </span>
                {loading ? <FaSpinner className="animate-spin" /> : <FaArrowRight className="text-xs group-hover:translate-x-2 transition-transform" /> }
              </div>
            </button>
          </form>
        </motion.div>

        <div className="mt-12 text-center">
            <Link href="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-uiupc-orange transition-colors">
              <FaArrowLeft className="text-xs" /> Return to Base
            </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
