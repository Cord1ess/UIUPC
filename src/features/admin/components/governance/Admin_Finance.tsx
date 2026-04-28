"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPlus, 
  FaArrowUp, 
  FaArrowDown, 
  FaWallet, 
  FaFileInvoiceDollar, 
  FaSearch,
  FaReceipt,
  FaCalendarAlt,
  FaChevronRight,
  FaHistory,
  FaSync,
  FaTimes,
  FaMoneyBillWave,
  FaChartPie,
  FaChevronLeft
} from 'react-icons/fa';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";

export const Admin_Finance: React.FC = () => {
  const { adminProfile, isCore } = useSupabaseAuth();
  
  const [isAdding, setIsAdding] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 12;

  // ── DATA FETCHING ────────────────────────────────────────────
  // We fetch a larger set for the stats calculation (or we could use RPC)
  // For now, let's fetch the paginated list and a separate hook for counts/stats
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

  // For global stats, we fetch all (limited to 1000 for safety)
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
    return transactions.filter(t => {
      const term = searchTerm.toLowerCase();
      return t.description?.toLowerCase().includes(term) || 
             t.category?.toLowerCase().includes(term);
    });
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
      alert("Error: " + err.message);
      return { success: false };
    }
  };

  const totalPages = Math.ceil((count || 0) / pageSize);

  if (!isCore) {
    return (
      <div className="py-32 text-center bg-red-500/5 rounded-[3rem] border border-red-500/10">
        <FaWallet className="text-4xl text-red-500/20 mx-auto mb-6" />
        <h3 className="text-xl font-black uppercase tracking-tighter text-red-500 mb-2">Access Restricted</h3>
        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Core Admins Only</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-24">
      {/* ── OVERVIEW BENTO ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 p-12 bg-uiupc-orange/5 border border-uiupc-orange/15 rounded-[3rem] relative overflow-hidden group shadow-sm"
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-uiupc-orange/10 blur-[150px] rounded-full group-hover:scale-110 transition-transform duration-1000" />
          </div>
          
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-16">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-uiupc-orange/10 rounded-2xl flex items-center justify-center text-uiupc-orange text-2xl border border-uiupc-orange/20">
                  <FaWallet />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-uiupc-orange/60">Balance</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Active</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={refetch}
                  className="w-14 h-14 bg-uiupc-orange/10 rounded-2xl flex items-center justify-center text-uiupc-orange/40 hover:text-uiupc-orange transition-all border border-uiupc-orange/20"
                >
                  <FaSync className={isLoading ? 'animate-spin' : ''} />
                </button>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="px-8 py-4 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:brightness-110 hover:translate-y-[-2px] transition-all shadow-2xl shadow-uiupc-orange/20 flex items-center gap-3"
                >
                  <FaPlus /> New Entry
                </button>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Total</p>
                <p className="text-[12vw] md:text-[8vw] font-black text-zinc-900 dark:text-white tracking-tighter leading-none flex items-baseline gap-4">
                  <span className="text-[4vw] opacity-40">৳</span>
                  {stats.balance.toLocaleString()}
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-black/5 dark:border-white/5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FaArrowUp className="text-green-500 text-[8px]" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Income</p>
                  </div>
                  <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">৳{stats.income.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FaArrowDown className="text-red-500 text-[8px]" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Expense</p>
                  </div>
                  <p className="text-2xl font-black text-zinc-900 dark:text-white tracking-tighter">৳{stats.expense.toLocaleString()}</p>
                </div>
                <div className="hidden md:block space-y-2">
                  <div className="flex items-center gap-2">
                    <FaChartPie className="text-blue-500 text-[8px]" />
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Main Category</p>
                  </div>
                  <p className="text-xl font-black text-zinc-900 dark:text-white tracking-tighter uppercase">{stats.topCategory}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action History Bento */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="p-10 bg-white dark:bg-[#0a0a0a] rounded-[3rem] border border-black/5 dark:border-white/5 flex flex-col h-full shadow-sm"
        >
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-uiupc-orange border border-black/5 dark:border-white/5">
                <FaHistory />
              </div>
              <span className="px-4 py-1.5 bg-uiupc-orange/5 text-uiupc-orange text-[8px] font-black uppercase tracking-widest rounded-full border border-uiupc-orange/10">Recent</span>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-xl font-black uppercase tracking-tighter dark:text-white">Recent Activity</h4>
              <div className="space-y-4">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 bg-zinc-50 dark:bg-zinc-900 rounded-xl animate-pulse" />
                  ))
                ) : (Array.isArray(transactions) ? transactions : []).slice(0, 4).map((t) => (
                  <div key={t.id} className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 last:border-0 group/feed">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-tighter dark:text-white group-hover/feed:text-uiupc-orange transition-colors line-clamp-1">{(t.category || 'other').replace(/_/g, ' ')}</span>
                        <span className="text-[8px] text-zinc-400 uppercase font-bold tracking-widest">{new Date(t.transaction_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-black tracking-tight ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'}৳{t.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <button className="w-full mt-10 py-5 bg-zinc-50 dark:bg-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-uiupc-orange hover:bg-uiupc-orange/5 transition-all flex items-center justify-center gap-3 group">
            View All <FaChevronRight className="group-hover:translate-x-2 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* ── FILTERS & LIST ───────────────────────────────────── */}
      <div className="space-y-8">
        <div className="flex flex-col xl:flex-row items-center justify-between gap-8">
          <div className="flex items-center p-2 bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm">
            {[
              { id: 'all', label: 'All' },
              { id: 'income', label: 'Income' },
              { id: 'expense', label: 'Expense' }
            ].map((type) => (
              <button 
                key={type.id}
                onClick={() => { setFilterType(type.id as any); setPage(0); }}
                className={`px-8 py-3.5 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all ${filterType === type.id ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg' : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-white'}`}
              >
                {type.label}
              </button>
            ))}
          </div>

          <div className="w-full xl:max-w-xl relative group">
            <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text" 
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-8 py-5 bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-black/5 dark:border-white/5 outline-none focus:border-uiupc-orange/30 text-sm font-bold tracking-tight text-zinc-900 dark:text-white shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Responsive Entry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {isLoading && page === 0 ? (
               [...Array(6)].map((_, i) => (
                 <div key={i} className="h-48 bg-zinc-50 dark:bg-zinc-900 rounded-[2.5rem] animate-pulse" />
               ))
            ) : filteredTransactions.map((t, index) => (
              <motion.div 
                key={t.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.03 }}
                className="group bg-white dark:bg-[#0a0a0a] rounded-[2.5rem] border border-black/5 dark:border-white/5 p-8 hover:border-uiupc-orange/30 transition-all duration-500 hover:shadow-2xl hover:shadow-black/5"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {t.type === 'income' ? <FaArrowUp /> : <FaArrowDown />}
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Date</p>
                    <p className="text-[10px] font-black dark:text-white uppercase tracking-tighter">{new Date(t.transaction_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-8">
                  <span className="px-3 py-1 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-[8px] font-black uppercase tracking-widest text-zinc-500 border border-black/5 dark:border-white/5">
                    {(t.category || 'other').replace(/_/g, ' ')}
                  </span>
                  <h4 className="text-lg font-black uppercase tracking-tighter text-zinc-900 dark:text-white line-clamp-1 group-hover:text-uiupc-orange transition-colors">
                    {t.description}
                  </h4>
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-black/5 dark:border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Amount</span>
                    <span className={`text-xl font-black tracking-tighter ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {t.type === 'income' ? '+' : '-'}৳{Number(t.amount).toLocaleString()}
                    </span>
                  </div>
                  {t.receipt_url && (
                    <button 
                      onClick={() => window.open(t.receipt_url, '_blank')}
                      className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-uiupc-orange hover:text-white transition-all shadow-sm group/btn"
                    >
                      <FaReceipt className="text-lg group-hover/btn:scale-110 transition-transform" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTransactions.length === 0 && !isLoading && (
            <div className="lg:col-span-3 py-32 text-center bg-zinc-50 dark:bg-white/5 rounded-[3rem] border border-black/5 dark:border-white/5">
              <FaMoneyBillWave className="text-4xl text-zinc-200 mx-auto mb-6" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">No transactions found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-10 border-t border-black/5 dark:border-white/5">
            <div className="flex flex-col">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Page</p>
              <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page {page + 1} of {totalPages} | Total {count} Entries</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                disabled={page === 0} 
                onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"
              >
                <FaChevronLeft className="text-xs" />
              </button>
              <button 
                disabled={page >= totalPages - 1} 
                onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/5 text-zinc-400 disabled:opacity-20 hover:border-uiupc-orange hover:text-uiupc-orange transition-all shadow-sm"
              >
                <FaChevronRight className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── ADD TRANSACTION MODAL ───────────────────────────── */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
              onClick={() => setIsAdding(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative w-full max-w-4xl bg-white dark:bg-[#0a0a0a] rounded-[3rem] border border-black/10 dark:border-white/10 shadow-3xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
            >
              {/* Identity Side */}
              <div className="hidden md:flex md:w-2/5 bg-zinc-50 dark:bg-zinc-900/50 border-r border-black/5 dark:border-white/5 items-center justify-center p-12 overflow-hidden relative">
                 <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-80 h-80 bg-uiupc-orange/20 blur-[100px] rounded-full" />
                 </div>
                 <div className="relative z-10 text-center space-y-6">
                    <div className="w-32 h-32 bg-white/10 rounded-[2rem] shadow-2xl flex items-center justify-center text-5xl text-white mx-auto">
                      <FaMoneyBillWave />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black uppercase tracking-tighter text-white">New Entry</h4>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 mt-2">Add a new record</p>
                    </div>
                 </div>
              </div>

              {/* Form Side */}
              <div className="flex-1 p-8 md:p-14 overflow-y-auto custom-scrollbar">
                <div className="mb-12 flex items-center justify-between">
                  <div>
                    <span className="text-uiupc-orange text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">New Entry</span>
                    <h3 className="text-4xl font-black uppercase tracking-tighter dark:text-white">Add Entry</h3>
                  </div>
                  <button onClick={() => setIsAdding(false)} className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-400 hover:text-red-500 transition-all flex items-center justify-center group">
                    <FaTimes className="group-hover:rotate-90 transition-transform" />
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
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button" onClick={() => setFormData({...formData, type: 'income'})}
              className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.type === 'income' ? 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/20' : 'bg-transparent border-black/5 dark:border-white/5 text-zinc-400 hover:border-green-500/30'}`}
            >
              Income (+)
            </button>
            <button 
              type="button" onClick={() => setFormData({...formData, type: 'expense'})}
              className={`py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${formData.type === 'expense' ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20' : 'bg-transparent border-black/5 dark:border-white/5 text-zinc-400 hover:border-red-500/30'}`}
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
            className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-4 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all h-[58px]"
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
          className="w-full bg-transparent border-b-2 border-black/5 dark:border-white/5 py-5 outline-none focus:border-uiupc-orange dark:text-white text-5xl font-black transition-all"
        />
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Description</label>
        <input 
          type="text" required value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="What was this for?"
          className="w-full bg-transparent border-b-2 border-black/5 dark:border-white/5 py-5 outline-none focus:border-uiupc-orange dark:text-white text-xl font-bold transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Date</label>
          <input 
            type="date" required value={formData.transaction_date}
            onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
            className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all"
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Receipt Link</label>
          <input 
            type="text" value={formData.receipt_url}
            onChange={(e) => setFormData({...formData, receipt_url: e.target.value})}
            placeholder="Google Drive / CDN Link"
            className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 p-5 rounded-2xl outline-none focus:border-uiupc-orange dark:text-white font-bold transition-all"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-black/5 dark:border-white/5">
        <button 
          type="button" onClick={onCancel}
          className="flex-1 py-6 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-[10px] font-black uppercase tracking-widest rounded-3xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
        >
          Cancel
        </button>
        <button 
          type="submit" disabled={loading}
          className="flex-[2] py-6 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl shadow-2xl shadow-uiupc-orange/20 hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </form>
  );
};
