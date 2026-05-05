"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconFilter, 
  IconChevronDown,
  IconChevronRight, 
  IconUniversity, 
  IconIdCard, 
  IconSortAlphaDown, 
  IconCheckCircle,
  IconArrowUp,
  IconArrowDown
} from '@/components/shared/Icons';

interface Admin_MembersFilterMenuProps {
  currentDept: string;
  currentStatus: string;
  currentSort: "asc" | "desc";
  departments: string[];
  onDeptChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onSortChange: (val: "asc" | "desc") => void;
}

export const Admin_MembersFilterMenu: React.FC<Admin_MembersFilterMenuProps> = ({
  currentDept,
  currentStatus,
  currentSort,
  departments,
  onDeptChange,
  onStatusChange,
  onSortChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const submenus = [
    { 
      id: 'dept', 
      label: 'University Department', 
      icon: <IconUniversity size={14} />, 
      active: currentDept !== 'all',
      options: [{ value: 'all', label: 'All Departments' }, ...departments.map(d => ({ value: d, label: d }))] 
    },
    { 
      id: 'status', 
      label: 'Application Status', 
      icon: <IconIdCard size={14} />, 
      active: currentStatus !== 'all',
      options: statusOptions 
    },
    { 
      id: 'sort', 
      label: 'Date Sort', 
      icon: <IconSortAlphaDown size={14} />, 
      active: true,
      options: [
        { value: 'desc', label: 'Newest First', icon: <IconArrowDown size={10} /> },
        { value: 'asc', label: 'Oldest First', icon: <IconArrowUp size={10} /> }
      ]
    }
  ];

  const handleOptionClick = (menuId: string, val: string) => {
    if (menuId === 'dept') onDeptChange(val);
    if (menuId === 'status') onStatusChange(val);
    if (menuId === 'sort') onSortChange(val as "asc" | "desc");
    setIsOpen(false);
    setActiveSubmenu(null);
  };

  const getActiveLabel = () => {
    let parts = [];
    if (currentDept !== 'all') parts.push(currentDept);
    if (currentStatus !== 'all') parts.push(currentStatus.toUpperCase());
    return parts.length > 0 ? parts.join(' • ') : 'No Filters Active';
  };

  const partsActive = currentDept !== 'all' || currentStatus !== 'all';

  return (
    <div className="relative w-full" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 group outline-none"
      >
        <div className="flex flex-col items-start min-w-0 text-left">
          <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${partsActive ? 'text-uiupc-orange' : 'text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white'}`}>
            Filter Options
          </span>
          <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest truncate max-w-[150px]">
            {getActiveLabel()}
          </span>
        </div>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${isOpen ? 'bg-zinc-100 dark:bg-zinc-800' : ''}`}>
          <IconChevronDown size={10} className={`text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 mt-3 w-72 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-xl shadow-2xl z-[300] overflow-visible backdrop-blur-xl"
          >
            <div className="p-3">
              {submenus.map((menu) => (
                <div key={menu.id} className="relative group/item">
                  <button
                    onClick={() => setActiveSubmenu(activeSubmenu === menu.id ? null : menu.id)}
                    onMouseEnter={() => setActiveSubmenu(menu.id)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-xl transition-all ${activeSubmenu === menu.id ? 'bg-zinc-50 dark:bg-zinc-900/50 text-uiupc-orange' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-[12px] ${menu.active && menu.id !== 'sort' ? 'text-uiupc-orange' : 'text-zinc-400'}`}>
                        {menu.icon}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest">{menu.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {menu.active && menu.id !== 'sort' && <div className="w-1.5 h-1.5 rounded-full bg-uiupc-orange shadow-sm" />}
                      <IconChevronRight size={8} className="text-zinc-300" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {activeSubmenu === menu.id && (
                      <motion.div
                        initial={{ opacity: 0, x: -10, y: 10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: -10, y: 10 }}
                        className="absolute left-0 sm:left-full top-full sm:top-0 mt-2 sm:mt-0 sm:ml-2 w-full sm:w-64 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-[301] p-3 max-h-[400px] overflow-y-auto no-scrollbar backdrop-blur-xl"
                      >
                        {menu.options.map((opt: any) => {
                          const isSelected = 
                            (menu.id === 'dept' && currentDept === opt.value) ||
                            (menu.id === 'status' && currentStatus === opt.value) ||
                            (menu.id === 'sort' && currentSort === opt.value);

                          return (
                            <button
                              key={opt.value}
                              onClick={() => handleOptionClick(menu.id, opt.value)}
                              className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl transition-all mb-1 last:mb-0 ${isSelected ? 'bg-uiupc-orange text-white shadow-lg shadow-uiupc-orange/20' : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-white'}`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {opt.icon && <span className="text-[10px] opacity-70">{opt.icon}</span>}
                                <span className="text-[9px] font-black uppercase tracking-widest truncate">{opt.label}</span>
                              </div>
                              {isSelected && <IconCheckCircle size={10} className="shrink-0" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
            
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/30 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
              <button 
                onClick={() => {
                  onDeptChange('all');
                  onStatusChange('all');
                  setIsOpen(false);
                }}
                className="text-[8px] font-black uppercase tracking-widest text-zinc-400 hover:text-uiupc-orange transition-colors"
              >
                Reset All
              </button>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Filters</span>
                <div className="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg text-[7px] font-bold text-zinc-400">
                  {submenus.filter(m => m.active && m.id !== 'sort').length}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
