"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconPlus, IconArrowUp, IconArrowDown, IconWallet, IconFileInvoiceDollar, 
  IconSearch, IconReceipt, IconCalendarAlt, IconChevronRight, IconHistory, 
  IconSync, IconClose, IconMoneyBillWave, IconChartPie, IconChevronLeft, IconCheck, IconLock 
} from '@/components/shared/Icons';
import { 
  Admin_ErrorBoundary, Admin_ModuleHeader, Admin_StatCard 
} from "@/features/admin/components";
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";
import { initAdminPassword } from "@/features/admin/actions";

export const Admin_Finance: React.FC = () => {
  const { adminProfile, isCore } = useSupabaseAuth();
  
  const [isAdding, setIsAdding] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 12;

  useEffect(() => { initAdminPassword(); }, []);

  const filters = useMemo(() => {
    const f: Record<string, any> = {};
    if (filterType !== "all") f.type = filterType;
    return f;
  }, [filterType]);

  const { data: transactions, count, isLoading, refetch } = useSupabaseData("finances", {
    page,
    pageSize,
    filters,
    orderBy: 'transaction_date',
    orderDesc: true,
  });

  const { data: allTransactions } = useSupabaseData("finances", { limit: 1000 });

  const stats = useMemo(() => {
    if (!Array.isArray(allTransactions)) return { balance: 0, income: 0, expense: 0, topCategory: 'N/A' };
    
    const totalIncome = allTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const totalExpense = allTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const categories: Record<string, number> = {};
    allTransactions.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + Number(t.amount);
    });
    const topCat = Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    
    return {
      balance: totalIncome - totalExpense,
      income: totalIncome,
      expense: totalExpense,
      topCategory: topCat.replace(/_/g, ' ')
    };
  }, [allTransactions]);

  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    const term = searchTerm.toLowerCase();
    if (!term) return transactions;
    return transactions.filter(t => 
      t.description?.toLowerCase().includes(term) || 
      t.category?.toLowerCase().includes(term)
    );
  }, [transactions, searchTerm]);

  const handleUpsert = async (formData: any) => {
    try {
      const { error } = await supabase.from("finances").insert([formData]);
      if (error) throw error;
      
      if (adminProfile) {
        await supabase.from('audit_logs').insert({
          admin_id: adminProfile.id,
          action: 'finance_entry_created',
          target_table: 'finances',
          target_id: 'new',
          new_data: formData,
          source: 'website'
        });
      }
      return { success: true };
    } catch (err: any) {
      alert("Action failed: " + err.message);
      return { success: false };
    }
  };

  const totalPages = Math.ceil((count || 0) / pageSize);

  if (!isCore) {
    return (
      <div className="py-32 text-center bg-white dark:bg-[#0d0d0d] rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto mb-8 border border-red-500/20 shadow-inner">
          <IconLock size={32} />
        </div>
        <h3 className="text-2xl font-black uppercase tracking-tighter dark:text-white mb-2">Access Restricted</h3>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em]">Core Administration Only</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-10 min-w-0 relative z-10 isolate">
      <Admin_ModuleHeader 
        title="Finance"
        description="Monitor treasury, expenditures, and fiscal health."
      >
        <Admin_StatCard label="Available Balance" value={`৳${stats.balance.toLocaleString()}`} icon={<IconWallet size={16} />} color="text-green-500" />
        <Admin_StatCard label="Primary Sector" value={stats.topCategory} icon={<IconChartPie size={16} />} />
        <Admin_StatCard label="System Status" value="Secure" icon={<IconCheck size={16} />} color="text-green-500" />
      </Admin_ModuleHeader>

      {/* ── FINANCIAL SUMMARY ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 p-10 md:p-14 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-[3rem] relative overflow-hidden group shadow-sm flex flex-col justify-between min-h-[400px]"
        >
          <div className="relative z-10 flex flex-col justify-between h-full space-y-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-zinc-50 dark:bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-uiupc-orange text-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
                  <IconWallet size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Net Treasury</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Real-time Data</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => refetch()}
                  className="w-14 h-14 bg-zinc-50 dark:bg-[#1a1a1a] rounded-2xl flex items-center justify-center text-zinc-400 hover:text-uiupc-orange transition-all border border-zinc-200 dark:border-zinc-800 shadow-sm"
                >
                  <IconSync size={14} className={isLoading ? 'animate-spin' : ''} />
                </button>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="px-10 h-14 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 shadow-xl shadow-uiupc-orange/20 flex items-center gap-3"
                >
                  <IconPlus size={10} /> Log Transaction
                </button>
              </div>
            </div>
            
            <div className="space-y-10">
              <div>
                <p className="text-[12vw] md:text-[6vw] font-black text-zinc-900 dark:text-white tracking-tighter leading-none flex items-baseline gap-4">
                  <span className="text-[3vw] opacity-20 font-bold">৳</span>
                  {stats.balance.toLocaleString()}
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-10 pt-10 border-t border-zinc-100 dark:border-zinc-800/50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <IconArrowUp size={8} className="text-green-500" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Total Income</p>
                  </div>
                  <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">৳{stats.income.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <IconArrowDown size={8} className="text-red-500" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Total Expenditure</p>
                  </div>
                  <p className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">৳{stats.expense.toLocaleString()}</p>
                </div>
                <div className="hidden md:block space-y-2">
                  <div className="flex items-center gap-2">
                    <IconChartPie size={8} className="text-blue-500" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Primary Sector</p>
                  </div>
                  <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">{stats.topCategory}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-10 bg-white dark:bg-[#0d0d0d] rounded-[3rem] border border-zinc-200 dark:border-zinc-800 flex flex-col h-full shadow-sm"
        >
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-[#1a1a1a] flex items-center justify-center text-uiupc-orange border border-zinc-200 dark:border-zinc-800 shadow-inner">
                <IconHistory size={24} />
              </div>
              <span className="px-4 py-1.5 bg-uiupc-orange/10 text-uiupc-orange text-[9px] font-black uppercase tracking-widest rounded-xl border border-uiupc-orange/20">Ledger Activity</span>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-xl font-black uppercase tracking-tighter dark:text-white">Recent Transactions</h4>
              <div className="space-y-6">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-zinc-50 dark:bg-zinc-900 rounded-xl animate-pulse" />
                  ))
                ) : (Array.isArray(transactions) ? transactions : []).slice(0, 4).map((t) => (
                  <div key={t.id} className="flex items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-800/50 last:border-0 group/feed">
                    <div className="flex items-center gap-4">
                      <div className={`w-2.5 h-2.5 rounded-full shadow-inner ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-tighter dark:text-white group-hover/feed:text-uiupc-orange transition-colors line-clamp-1">{(t.category || 'other').replace(/_/g, ' ')}</span>
                        <span className="text-[8px] text-zinc-400 uppercase font-bold tracking-[0.2em] mt-0.5">{new Date(t.transaction_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`text-[11px] font-black tracking-tight ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'}৳{t.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <button className="w-full mt-10 h-14 bg-zinc-50 dark:bg-[#1a1a1a] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-uiupc-orange transition-all flex items-center justify-center gap-3 border border-transparent hover:border-uiupc-orange/20 shadow-sm">
            Full History <IconChevronRight size={8} />
          </button>
        </motion.div>
      </div>

      {/* ── TRANSACTION LEDGER ─────────────────────────────────── */}
      <div className="space-y-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex items-center p-2 bg-white dark:bg-[#0d0d0d] rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm w-full lg:w-fit">
            {[
              { id: 'all', label: 'All Records' },
              { id: 'income', label: 'Income' },
              { id: 'expense', label: 'Expenditures' }
            ].map((type) => (
              <button 
                key={type.id}
                onClick={() => { setFilterType(type.id as any); setPage(0); }}
                className={`flex-1 lg:flex-none px-8 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterType === type.id ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="w-full lg:max-w-xl relative group">
            <IconSearch size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search ledger..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-8 py-4 bg-white dark:bg-[#0d0d0d] rounded-2xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-uiupc-orange/30 text-sm font-bold tracking-tight text-zinc-900 dark:text-white shadow-sm transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {isLoading && page === 0 ? (
               [...Array(6)].map((_, i) => (
                 <div key={i} className="h-56 bg-white dark:bg-[#0d0d0d] rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 animate-pulse" />
               ))
            ) : filteredTransactions.map((t, index) => (
              <motion.div 
                key={t.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
                className="group bg-white dark:bg-[#0d0d0d] rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 hover:border-uiupc-orange/30 transition-all duration-500 hover:shadow-2xl shadow-sm flex flex-col justify-between min-h-[240px]"
              >
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-inner ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {t.type === 'income' ? <IconArrowUp size={16} /> : <IconArrowDown size={16} />}
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Fiscal Date</p>
                    <p className="text-[10px] font-black dark:text-white uppercase tracking-tighter">{new Date(t.transaction_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="space-y-2 py-6">
                  <span className="px-3 py-1 bg-zinc-50 dark:bg-[#1a1a1a] rounded-lg text-[8px] font-black uppercase tracking-widest text-zinc-500 border border-zinc-100 dark:border-zinc-800/50">
                    {(t.category || 'other').replace(/_/g, ' ')}
                  </span>
                  <h4 className="text-lg font-black uppercase tracking-tighter text-zinc-900 dark:text-white line-clamp-1 group-hover:text-uiupc-orange transition-colors">
                    {t.description}
                  </h4>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Amount (BDT)</span>
                    <span className={`text-2xl font-black tracking-tighter ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'}৳{Number(t.amount).toLocaleString()}
                    </span>
                  </div>
                  {t.receipt_url && (
                    <button 
                      onClick={() => window.open(t.receipt_url, '_blank')}
                      className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-[#1a1a1a] flex items-center justify-center text-zinc-400 hover:bg-uiupc-orange hover:text-white transition-all shadow-sm border border-zinc-200 dark:border-zinc-800/50 group/btn"
                    >
                      <IconReceipt size={18} className="group-hover/btn:scale-110 transition-transform" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTransactions.length === 0 && !isLoading && (
            <div className="lg:col-span-3 py-32 text-center bg-white dark:bg-[#0d0d0d] rounded-[3rem] border border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-300"><IconMoneyBillWave size={24} /></div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">No records found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-zinc-100 dark:border-zinc-800/50">
            <div className="text-center sm:text-left">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Ledger Index</p>
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {page + 1} of {totalPages} | Total {count} Entries</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                disabled={page === 0} 
                onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"
              >
                <IconChevronLeft size={12} />
              </button>
              <button 
                disabled={page >= totalPages - 1} 
                onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"
              >
                <IconChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── LOG TRANSACTION MODAL ───────────────────────────── */}
      <Admin_ErrorBoundary>
        <AnimatePresence>
          {isAdding && (
            <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 md:p-10">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                onClick={() => setIsAdding(false)}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
                className="relative w-full max-w-4xl bg-white dark:bg-[#0d0d0d] rounded-[3rem] border border-zinc-200 dark:border-zinc-800 shadow-3xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
              >
                <div className="hidden md:flex md:w-2/5 bg-zinc-50 dark:bg-[#0a0a0a] border-r border-zinc-100 dark:border-zinc-800 items-center justify-center p-12 relative overflow-hidden">
                  <div className="relative z-10 text-center space-y-8">
                      <div className="w-36 h-36 bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] shadow-2xl flex items-center justify-center text-6xl text-uiupc-orange mx-auto border border-zinc-100 dark:border-zinc-800 shadow-inner">
                        <IconMoneyBillWave size={60} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-3xl font-black uppercase tracking-tighter dark:text-white">New Record</h4>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Fiscal Entry</p>
                      </div>
                  </div>
                </div>

                <div className="flex-1 p-8 md:p-14 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0d0d0d]">
                  <div className="mb-12 flex items-center justify-between">
                    <div>
                      <span className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Treasurer Hub</span>
                      <h3 className="text-4xl font-black uppercase tracking-tighter dark:text-white leading-none">Log Entry</h3>
                    </div>
                    <button onClick={() => setIsAdding(false)} className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-all border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center">
                      <IconClose size={18} />
                    </button>
                  </div>
                  
                  <AddTransactionForm 
                    onSuccess={() => { setIsAdding(false); refetch(); }} 
                    onCancel={() => setIsAdding(false)} 
                    adminId={adminProfile?.id || ''}
                    onSave={handleUpsert}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </Admin_ErrorBoundary>
    </div>
  );
};

const AddTransactionForm: React.FC<{ onSuccess: () => void; onCancel: () => void; adminId: string; onSave: (data: any) => Promise<any> }> = ({ onSuccess, onCancel, adminId, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: 'event_expense',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    receipt_url: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await onSave({
      ...formData,
      amount: parseFloat(formData.amount),
      recorded_by: adminId
    });
    if (result?.success) onSuccess();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Flow Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button" onClick={() => setFormData({...formData, type: 'income'})}
              className={`h-14 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.type === 'income' ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20' : 'bg-transparent border-zinc-100 dark:border-zinc-800 text-zinc-400'}`}
            >
              Income (+)
            </button>
            <button 
              type="button" onClick={() => setFormData({...formData, type: 'expense'})}
              className={`h-14 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.type === 'expense' ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20' : 'bg-transparent border-zinc-100 dark:border-zinc-800 text-zinc-400'}`}
            >
              Expense (-)
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Category</label>
          <select 
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent p-4 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all h-14"
          >
            <option value="membership_fee">Membership Fee</option>
            <option value="sponsor">Sponsor</option>
            <option value="event_expense">Event Expense</option>
            <option value="equipment">Equipment</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Amount (BDT)</label>
        <input 
          type="number" required value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
          placeholder="0.00"
          className="w-full bg-transparent border-b-2 border-zinc-100 dark:border-zinc-800 py-6 outline-none focus:border-uiupc-orange dark:text-white text-6xl font-black transition-all"
        />
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Detailed Description</label>
        <input 
          type="text" required value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Purpose of transaction..."
          className="w-full bg-transparent border-b-2 border-zinc-100 dark:border-zinc-800 py-4 outline-none focus:border-uiupc-orange dark:text-white text-xl font-bold transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Transaction Date</label>
          <input 
            type="date" required value={formData.transaction_date}
            onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
            className="w-full bg-zinc-100 dark:bg-[#1a1a1a] p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all"
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Supporting Document Link</label>
          <input 
            type="text" value={formData.receipt_url}
            onChange={(e) => setFormData({...formData, receipt_url: e.target.value})}
            placeholder="Google Drive / Media Link"
            className="w-full bg-zinc-100 dark:bg-[#1a1a1a] p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-zinc-100 dark:border-zinc-800">
        <button 
          type="button" onClick={onCancel}
          className="flex-1 h-14 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
        >
          Discard
        </button>
        <button 
          type="submit" disabled={loading}
          className="flex-[2] h-14 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-uiupc-orange/20 hover:translate-y-[-2px] transition-all disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Secure Entry'}
        </button>
      </div>
    </form>
  );
};
