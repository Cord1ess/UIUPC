"use client";

import React from "react";
import { FaUser, FaEnvelope, FaPhone, FaUniversity, FaImage, FaTshirt, FaHome, FaCalendar, FaCheck, FaTimes } from "react-icons/fa";
import { Payment } from "@/types";

interface PaymentModalProps {
  payment: Payment | null;
  onClose: () => void;
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
  onSendEmail: (id: string, data: Payment) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  payment,
  onClose,
  onVerify,
  onReject,
  onSendEmail
}) => {
  if (!payment) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-zinc-50/50 dark:bg-white/[0.02]">
          <h3 className="text-xl font-black uppercase tracking-tighter dark:text-white">Payment Details</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-500 hover:bg-uiupc-orange hover:text-white transition-all text-xl">
            ×
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><FaUser /> Name:</div>
              <div className="text-sm font-bold dark:text-white break-words">{payment.name}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><FaEnvelope /> Email:</div>
              <div className="text-sm font-bold dark:text-white break-words">{payment.email}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><FaPhone /> Phone:</div>
              <div className="text-sm font-bold dark:text-white break-words">{payment.phone}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><FaUniversity /> Institute:</div>
              <div className="text-sm font-bold dark:text-white break-words">{payment.institute}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><FaImage /> Category:</div>
              <div className="text-sm font-bold dark:text-white break-words">{payment.category === "single" ? "Single Photo" : "Photo Story"}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Quantity:</div>
              <div className="text-sm font-bold dark:text-white break-words">{payment.photoCount}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><FaTshirt /> T-Shirt Size:</div>
              <div className="text-sm font-bold dark:text-white break-words">{payment.tshirtSize}</div>
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><FaHome /> Address:</div>
              <div className="text-sm font-bold dark:text-white break-words">{payment.address}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Transaction ID:</div>
              <div className="text-sm font-bold font-mono text-uiupc-orange bg-uiupc-orange/10 px-2 py-1 rounded w-fit">{payment.transactionId}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Amount:</div>
              <div className="text-sm font-black text-green-500">{payment.totalAmount?.toLocaleString()} BDT</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><FaCalendar /> Submitted:</div>
              <div className="text-sm font-bold dark:text-white break-words">{new Date(payment.timestamp).toLocaleString()}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Status:</div>
              <div>
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  (payment.status || 'pending').toLowerCase() === 'verified' || (payment.status || '').toLowerCase() === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                  (payment.status || 'pending').toLowerCase() === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'
                }`}>
                  {payment.status || "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-end gap-3 bg-zinc-50/50 dark:bg-white/[0.02]">
          <button onClick={onClose} className="px-6 h-12 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 dark:hover:bg-white/10 transition-all">Close</button>
          
          {payment.status?.toLowerCase() === "pending" && (
            <>
              <button onClick={() => onSendEmail(payment.id, payment)} className="px-4 h-12 flex items-center gap-2 rounded-xl bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">
                <FaEnvelope /> Send Email
              </button>
              <button onClick={() => onVerify(payment.id)} className="px-6 h-12 flex items-center gap-2 rounded-xl bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest hover:bg-green-500 hover:text-white transition-all">
                <FaCheck /> Verify
              </button>
              <button onClick={() => onReject(payment.id)} className="px-6 h-12 flex items-center gap-2 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                <FaTimes /> Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
