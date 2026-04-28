"use client";

import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

interface Admin_DropdownProps {
  value: string;
  options: string[] | { value: string; label: string }[];
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

export const Admin_Dropdown: React.FC<Admin_DropdownProps> = ({ 
  value, 
  options, 
  onChange, 
  label,
  className = "" 
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
      {label && <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">{label}</p>}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-widest hover:border-uiupc-orange transition-all outline-none"
      >
        <span className="truncate dark:text-white">{selectedOption.label}</span>
        <FaChevronDown className={`text-[10px] text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
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
