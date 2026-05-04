'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { IconExclamationTriangle, IconSync } from '@/components/shared/Icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class Admin_ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Admin Error Boundary caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
            <IconExclamationTriangle size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white">Component Crash</h3>
            <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1 max-w-[200px] mx-auto">
              {this.state.error?.message || 'An unexpected error occurred in this module.'}
            </p>
          </div>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-2 px-6 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
          >
            <IconSync size={10} /> Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
