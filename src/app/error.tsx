'use client'

import { useEffect } from 'react'
import { motion } from 'motion/react'
import { IconExclamationTriangle, IconSync } from '@/components/shared/Icons'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Root Error Boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9f5ea] dark:bg-[#0a0a0a] px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-[2rem] p-12 text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <IconExclamationTriangle size={32} className="text-red-500" />
        </div>
        
        <h2 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white mb-4 leading-none">
          Something went wrong
        </h2>
        
        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm mb-10 leading-relaxed italic font-serif">
          "Even the most precise lens can occasionally lose focus. We're working to recalibrate the view."
        </p>

        <div className="space-y-4">
          <button
            onClick={() => reset()}
            className="w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.4em] rounded-full hover:bg-uiupc-orange dark:hover:bg-uiupc-orange hover:text-white transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <IconSync size={12} className="animate-spin-slow" />
            Retry Connection
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-5 border border-black/10 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.4em] rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all text-zinc-500"
          >
            Return to Base
          </button>
        </div>
        
        <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5">
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-300 dark:text-zinc-700">
            Error Digest: {error.digest || 'Internal Flux Error'}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
