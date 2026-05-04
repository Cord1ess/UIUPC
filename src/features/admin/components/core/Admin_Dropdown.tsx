"use client";

import React, { useState, useRef, useEffect } from 'react';
import { IconChevronDown } from '@/components/shared/Icons';

interface Admin_DropdownProps {
  value: string;
  options: string[] | { value: string; label: string }[];
  onChange: (value: string) => void;
  label?: string;
  sublabel?: string;
  className?: string;
  variant?: 'default' | 'minimal';
}

export const Admin_Dropdown: React.FC<Admin_DropdownProps> = ({ 
  value, 
  options, 
  onChange, 
  label,
  sublabel,
  className = "",
  variant = 'default'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const normalizedOptions = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value) || normalizedOptions[0];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && variant === 'default' && <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">{label}</p>}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={variant === 'minimal' 
          ? "w-full flex items-center justify-between gap-3 group outline-none"
          : "w-full flex items-center justify-between gap-3 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest hover:border-uiupc-orange transition-all outline-none"
        }
      >
        {variant === 'minimal' ? (
          <>
            <div className="flex flex-col items-start min-w-0 text-left">
              <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isOpen ? 'text-uiupc-orange' : 'text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white'}`}>
                {label || 'Select Option'}
              </span>
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest truncate max-w-[150px]">
                {sublabel || selectedOption.label}
              </span>
            </div>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isOpen ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}>
              <IconChevronDown size={10} className={`text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </>
        ) : (
          <>
            <span className="truncate dark:text-white">{selectedOption.label}</span>
            <IconChevronDown size={10} className={`text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      <div className={`absolute top-full left-0 right-0 mt-2 z-[100] border rounded-xl shadow-2xl transition-all origin-top overflow-hidden bg-white dark:bg-neutral-800 border-black/[0.06] dark:border-white/[0.06] ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="py-1.5 max-h-60 overflow-y-auto custom-scrollbar">
          {normalizedOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors
                ${value === opt.value
                  ? "text-uiupc-orange bg-uiupc-orange/[0.05] dark:bg-uiupc-orange/[0.12]" 
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
