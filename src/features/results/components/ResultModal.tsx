"use client";
import React from "react";

interface Result {
  id: string;
  name: string;
  institute: string;
  category: string;
  photos: number;
  status: string;
  selected: boolean;
}

interface ResultModalProps {
  selectedResult: Result | null;
  newResult: Partial<Result>;
  onClose: () => void;
  onSave: (result: any) => void;
  onInputChange: (field: string, value: any) => void;
}

const ResultModal: React.FC<ResultModalProps> = ({
  selectedResult,
  newResult,
  onClose,
  onSave,
  onInputChange
}) => {
  const data = selectedResult || newResult;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/[0.02]">
          <h3 className="text-xl font-black uppercase tracking-tighter dark:text-white">{selectedResult ? "Edit Result" : "Add New Result"}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all text-xl">
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Name *</label>
              <input
                type="text"
                value={data.name || ""}
                onChange={(e) => onInputChange("name", e.target.value)}
                required
                className="w-full p-4 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl text-sm outline-none focus:border-uiupc-orange transition-all"
              />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Institute *</label>
              <input
                type="text"
                value={data.institute || ""}
                onChange={(e) => onInputChange("institute", e.target.value)}
                required
                className="w-full p-4 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl text-sm outline-none focus:border-uiupc-orange transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Category *</label>
              <select
                value={data.category || "single"}
                onChange={(e) => onInputChange("category", e.target.value)}
                className="w-full p-4 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl text-sm outline-none focus:border-uiupc-orange transition-all"
              >
                <option value="single">Single Photo</option>
                <option value="story">Photo Story</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Number of Photos</label>
              <input
                type="number"
                min="1"
                value={data.photos || 1}
                onChange={(e) => onInputChange("photos", parseInt(e.target.value) || 1)}
                className="w-full p-4 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl text-sm outline-none focus:border-uiupc-orange transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</label>
              <select
                value={data.status || "selected"}
                onChange={(e) => onInputChange("status", e.target.value)}
                className="w-full p-4 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl text-sm outline-none focus:border-uiupc-orange transition-all"
              >
                <option value="selected">Selected</option>
                <option value="not-selected">Not Selected</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Selected for Exhibition</label>
              <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-xl h-[54px]">
                <input
                  type="checkbox"
                  checked={data.selected || false}
                  onChange={(e) => onInputChange("selected", e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-uiupc-orange focus:ring-uiupc-orange"
                />
                <span className="text-sm dark:text-zinc-300">Mark as selected</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-black/5 dark:border-white/5 flex items-center justify-end gap-3 bg-zinc-50/50 dark:bg-white/[0.02]">
          <button onClick={onClose} className="px-6 h-12 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-white/10 transition-all">Cancel</button>
          <button onClick={() => onSave(data)} className="px-6 h-12 flex items-center justify-center rounded-xl bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-uiupc-orange/10">
            {selectedResult ? "Update Result" : "Add Result"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
