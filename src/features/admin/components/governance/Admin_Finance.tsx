"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IconPlus, IconArrowUp, IconArrowDown, IconWallet, 
  IconSearch, IconReceipt, IconChevronRight, 
  IconSync, IconTrash, IconCheck, IconLock, 
  IconCalendar, IconSpinner, IconWarning, IconClose, IconEdit
} from '@/components/shared/Icons';
import { 
  Admin_ErrorBoundary, Admin_ModuleHeader, Admin_StatCard,
  Admin_DeleteConfirmModal, Admin_ModalPortal, Admin_Dropdown, Admin_DriveDropzone
} from "@/features/admin/components";
import { uploadToDrive } from '@/utils/driveUpload';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";
import { initAdminPassword, executeAdminMutation } from "@/features/admin/actions";

type FeedbackState = { type: 'idle' } | { type: 'saving' } | { type: 'success'; message: string } | { type: 'error'; message: string };

export const Admin_Finance: React.FC = () => {
  const { adminProfile, isCore } = useSupabaseAuth();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [feedback, setFeedback] = useState<FeedbackState>({ type: 'idle' });
  
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 12;

  useEffect(() => { initAdminPassword(); }, []);

  const { data: transactions, count, isLoading, refetch } = useSupabaseData("finances", {
    page,
    pageSize,
    filters: filterType !== "all" ? { type: filterType } : {},
    orderBy: 'transaction_date',
    orderDesc: true,
  });

  const { data: allTransactions } = useSupabaseData("finances", { limit: 2000 });
  const { data: events } = useSupabaseData("events", { orderBy: 'date', orderDesc: true });

  const stats = useMemo(() => {
    if (!Array.isArray(allTransactions)) return { balance: 0, income: 0, expense: 0 };
    const income = allTransactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const expense = allTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
    return { balance: income - expense, income, expense };
  }, [allTransactions]);

  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    const term = searchTerm.toLowerCase();
    return transactions.filter(t => 
      t.description?.toLowerCase().includes(term) || 
      t.category?.toLowerCase().includes(term)
    );
  }, [transactions, searchTerm]);

  const totalPages = Math.ceil((count || 0) / pageSize);

  const handleUpsert = async (data: any, file?: File) => {
    try {
      setFeedback({ type: 'saving' });
      const payload = { ...data, recorded_by: adminProfile?.id };
      
      const { success, message, data: record } = editingItem 
        ? await executeAdminMutation("finances", "update", payload, editingItem.id)
        : await executeAdminMutation("finances", "create", payload);

      if (!success) throw new Error(message);
      
      if (file && record) {
        try {
          const fileName = `Receipt-${record.id}-${Date.now()}`;
          const { error: uploadErr } = await supabase.storage
            .from('receipts')
            .upload(fileName, file);

          if (uploadErr) throw uploadErr;

          const { data: { publicUrl } } = supabase.storage
            .from('receipts')
            .getPublicUrl(fileName);

          await executeAdminMutation("finances", "update", { receipt_url: publicUrl }, record.id);
            
          setFeedback({ type: 'success', message: "Record saved & Receipt uploaded" });
        } catch (uploadErr: any) {
          setFeedback({ type: 'error', message: "DB saved, but Storage failed: " + uploadErr.message });
        }
      } else {
        setFeedback({ type: 'success', message: `Record ${editingItem ? 'updated' : 'added'} successfully` });
      }

      refetch();
      setTimeout(() => {
        setIsAdding(false);
        setEditingItem(null);
        setFeedback({ type: 'idle' });
      }, 1500);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message });
      setTimeout(() => setFeedback({ type: 'idle' }), 3000);
    }
  };

  if (!isCore) {
    return (
      <div className="w-full space-y-6 min-w-0">
        <div className="h-[60vh] flex flex-col items-center justify-center p-10 text-center bg-white dark:bg-zinc-900 rounded-[3rem] border border-black/5">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400 mb-6"><IconLock size={32} /></div>
          <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white">Access Governance Restricted</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 min-w-0 relative z-10 isolate">
      <Admin_ModuleHeader title="Fiscal Integrity" description="Secure ledger for tracking all club income, event spendings, and treasury balance." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-zinc-100 dark:text-zinc-800"><IconWallet size={64} /></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Available Budget</span>
          <div className="text-4xl font-black tracking-tighter mt-2 text-zinc-900 dark:text-white">৳{stats.balance.toLocaleString()}</div>
        </div>
        <Admin_StatCard label="Total Income" value={`৳${stats.income.toLocaleString()}`} icon={<IconArrowUp className="text-green-500" />} />
        <Admin_StatCard label="Total Expense" value={`৳${stats.expense.toLocaleString()}`} icon={<IconArrowDown className="text-red-500" />} />
      </div>

      <div className="w-full bg-white dark:bg-[#0d0d0d] p-3 sm:p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative z-10">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 group min-w-[200px]">
            <IconSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
            <input 
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-4 pl-14 pr-8 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent focus:border-uiupc-orange/30 rounded-xl text-sm outline-none transition-all placeholder:text-zinc-400 font-medium" 
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-zinc-100 dark:bg-[#1a1a1a] p-1 rounded-xl border border-transparent">
              {(['all', 'income', 'expense'] as const).map((type) => (
                <button 
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 sm:px-6 h-10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-white dark:bg-zinc-800 text-uiupc-orange shadow-sm' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
                >
                  {type}
                </button>
              ))}
            </div>
            <button 
              onClick={() => { setEditingItem(null); setIsAdding(true); }}
              className="px-6 sm:px-8 h-12 bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-uiupc-orange/20 hover:brightness-110 transition-all flex items-center gap-2"
            >
              <IconPlus size={14} /> <span className="hidden sm:inline">Log Entry</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {isLoading ? (
           Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-48 bg-white dark:bg-[#0d0d0d] rounded-2xl animate-pulse border border-zinc-200 dark:border-zinc-800" />)
        ) : filteredTransactions.map((t) => (
          <motion.div 
            key={t.id}
            className="group bg-white dark:bg-[#0d0d0d] p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-uiupc-orange/30 transition-all flex flex-col justify-between min-h-[180px]"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${t.type === 'income' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                  {t.category.replace(/_/g, ' ')}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingItem(t); setIsAdding(true); }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all"><IconEdit size={10} /></button>
                  <button onClick={() => setDeleteTarget(t)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-red-500 hover:text-white transition-all"><IconTrash size={10} /></button>
                </div>
              </div>
              <h4 className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white line-clamp-2">{t.description}</h4>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between">
              <span className="text-lg font-black tracking-tight">{t.type === 'income' ? '+' : '-'}৳{Number(t.amount).toLocaleString()}</span>
              {t.receipt_url && <button onClick={() => window.open(t.receipt_url, '_blank')} className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-uiupc-orange rounded-lg flex items-center justify-center transition-colors"><IconReceipt size={14} /></button>}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {(isAdding || editingItem) && (
          <Admin_ModalPortal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={() => { setIsAdding(false); setEditingItem(null); }}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 max-h-[90vh] flex flex-col"
              >
                <div className="p-8 md:p-10 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0">
                  <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white">
                    {editingItem ? 'Review Transaction' : 'New Transaction'}
                  </h3>
                  <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-red-500 flex items-center justify-center transition-all">
                    <IconClose size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-10">
                  <AddTransactionForm 
                    initialData={editingItem}
                    events={events || []}
                    onCancel={() => { setIsAdding(false); setEditingItem(null); }}
                    onSave={handleUpsert}
                    feedback={feedback}
                  />
                </div>
              </motion.div>
            </div>
          </Admin_ModalPortal>
        )}
      </AnimatePresence>

      <Admin_DeleteConfirmModal 
        isOpen={!!deleteTarget} 
        onClose={() => setDeleteTarget(null)} 
        itemId={deleteTarget?.id} 
        itemName={deleteTarget?.description} 
        onSuccess={() => { setDeleteTarget(null); refetch(); }}
        onConfirm={async () => {
          return await executeAdminMutation("finances", "delete", null, deleteTarget?.id);
        }}
      />
    </div>
  );
};

const AddTransactionForm: React.FC<{ 
  initialData?: any; 
  events: any[]; 
  onCancel: () => void; 
  onSave: (data: any, file?: File) => void;
  feedback: FeedbackState;
}> = ({ initialData, events, onCancel, onSave, feedback }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    type: initialData?.type || 'expense',
    category: initialData?.category || 'event_expense',
    amount: initialData?.amount || '',
    description: initialData?.description || '',
    transaction_date: initialData?.transaction_date || new Date().toISOString().split('T')[0],
    receipt_url: initialData?.receipt_url || '',
    event_id: initialData?.event_id || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return alert("Required fields missing");
    await onSave(formData, selectedFile || undefined);
  };

  const isLoading = feedback.type === 'saving';

  return (
    <div className="relative">
      <AnimatePresence>
        {feedback.type !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-[2rem]"
          >
            <div className="text-center">
              {feedback.type === 'saving' && (
                <div className="flex flex-col items-center">
                  <IconSpinner className="animate-spin text-uiupc-orange mb-4" size={40} />
                  <p className="text-xs font-black uppercase tracking-widest dark:text-white">Recording to ledger...</p>
                </div>
              )}
              {feedback.type === 'success' && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4">
                    <IconCheck size={32} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-green-500">{feedback.message}</p>
                </div>
              )}
              {feedback.type === 'error' && (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white mb-4">
                    <IconWarning size={32} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-red-500">{feedback.message}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className={`space-y-8 ${feedback.type !== 'idle' ? 'opacity-20 blur-sm pointer-events-none' : ''}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Flow Type</label>
            <div className="grid grid-cols-2 gap-3">
              {(['income', 'expense'] as const).map(t => (
                <button 
                  key={t} type="button" onClick={() => setFormData({...formData, type: t})}
                  disabled={isLoading}
                  className={`py-4 rounded-2xl text-[9px] font-black uppercase border transition-all ${formData.type === t ? (t === 'income' ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 'bg-zinc-100 dark:bg-zinc-800'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Admin_Dropdown 
              label="Category"
              value={formData.category}
              onChange={val => setFormData({...formData, category: val})}
              options={[
                { value: "membership_fee", label: "Membership Fee" },
                { value: "sponsor", label: "Sponsor" },
                { value: "merchandise", label: "Merchandise" },
                { value: "university_support", label: "University Support" },
                { value: "event_expense", label: "Event Expense" },
                { value: "equipment", label: "Equipment" },
                { value: "transport", label: "Transport" },
                { value: "food", label: "Food" },
                { value: "marketing", label: "Marketing" },
                { value: "printing", label: "Printing" },
                { value: "prizes", label: "Prizes" },
                { value: "other", label: "Other" }
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Amount (BDT)</label>
            <input 
              type="number" value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00" required
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-uiupc-orange/20 transition-all h-14"
            />
          </div>
          <div className="space-y-3">
            <Admin_Dropdown 
              label="Linked Event (Optional)"
              value={formData.event_id}
              onChange={val => setFormData({...formData, event_id: val})}
              options={[
                { value: "", label: "General Club Fund" },
                ...events.map(ev => ({ value: ev.id, label: ev.title }))
              ]}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Description / Memo</label>
          <textarea 
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="What was this transaction for?" required rows={3}
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 rounded-3xl px-6 py-4 text-sm font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-uiupc-orange/20 transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Date of Transaction</label>
            <input 
              type="date" value={formData.transaction_date}
              onChange={e => setFormData({...formData, transaction_date: e.target.value})}
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-black/5 dark:border-white/5 rounded-2xl px-6 py-4 text-sm font-bold dark:text-white focus:outline-none focus:ring-2 focus:ring-uiupc-orange/20 transition-all h-14"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Receipt Evidence (Deferred)</label>
            <Admin_DriveDropzone 
              mode="deferred"
              onFilesSelected={(files) => setSelectedFile(files[0] || null)}
              maxFiles={1}
            />
            {formData.receipt_url && !selectedFile && (
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter">Current Receipt ID: {formData.receipt_url}</p>
            )}
          </div>
        </div>

        <div className="pt-8 flex gap-4">
          <button 
            type="submit" disabled={isLoading}
            className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-black py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : (initialData ? 'Update Record' : 'Post Transaction')}
          </button>
          <button 
            type="button" onClick={onCancel} disabled={isLoading}
            className="px-8 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 py-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
