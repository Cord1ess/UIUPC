"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import {
  IconTrophy,
  IconArrowLeft,
  IconCamera,
  IconImages,
  IconSearch,
  IconChevronRight,
} from "@/components/shared/Icons";
import GlobalLoader from "@/components/shared/GlobalLoader";
import ScrollRevealText from "@/components/motion/ScrollRevealText";

interface SinglePhoto {
  id: string;
  name: string;
  institute: string;
  photos: number | string;
  selected: boolean;
}

interface Story {
  id: string;
  name: string;
  institute: string;
  photos: number | string;
  selected: boolean;
}

interface ResultsData {
  success: boolean;
  title: string;
  singlePhotos: SinglePhoto[];
  stories: Story[];
  error?: string;
}

const ResultsView = () => {
  const params = useParams();
  const eventId = params.eventId as string;
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("single");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isToolVisible, setIsToolVisible] = useState(true);

  // Pagination & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const registrationEndDate = new Date("2025-12-19");
  const isRegistrationClosed = new Date() > registrationEndDate;

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 300) {
      setIsToolVisible(false);
    } else {
      setIsToolVisible(true);
    }
  });

  // Google Apps Script Web App URL
  const GOOGLE_SCRIPT_URL = process.env.NEXT_PUBLIC_GAS_RESULTS_PUBLIC || (process.env as any).REACT_APP_GAS_RESULTS_PUBLIC || "";

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    name: "",
    email: "",
    phone: "",
    institute: "",
    category: "single",
    photoCount: 1,
    tshirtSize: "M",
    address: "",
    paymentMethod: "bkash01",
    transactionId: "",
    eventId: eventId || "shutter-stories",
  });

  // Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      if (!GOOGLE_SCRIPT_URL) return;
      try {
        setLoading(true);
        const url = `${GOOGLE_SCRIPT_URL}?action=getResults&eventId=${
          eventId || "shutter-stories"
        }&_=${new Date().getTime()}`;

        const response = await fetch(url, {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error);

        setResults(data);
        setError(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("Error fetching results:", err);
        setError(errorMessage);
        if (!results) {
          setResults({ success: true, title: "Selected Participants", singlePhotos: [], stories: [] });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [eventId, GOOGLE_SCRIPT_URL]);

  const displayResults = useMemo(() => {
    if (!results) return [];
    const categoryResults = selectedCategory === "single" ? results.singlePhotos || [] : results.stories || [];
    const filtered = categoryResults.filter((item: SinglePhoto | Story) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.institute.toLowerCase().includes(query) ||
        item.photos.toString().includes(query)
      );
    });
    return filtered;
  }, [results, selectedCategory, searchQuery]);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return displayResults.slice(startIndex, startIndex + itemsPerPage);
  }, [displayResults, currentPage, itemsPerPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  if (loading) return <GlobalLoader />;

  return (
    <div className="min-h-screen bg-[#f9f5ea] dark:bg-[#0a0a0a] transition-colors duration-500 pb-32">
      {/* ── ZONE 1: HERO ───────────────────────────────────────────── */}
      <section className="pt-32 pb-12 px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-12">
            <div className="flex-1 space-y-8">
                <div className="flex items-center gap-3">
                    <IconTrophy size={24} className="text-uiupc-orange" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Award Recipients</span>
                </div>
                <ScrollRevealText 
                    text={results?.title || "Selected Participants"} 
                    className="text-[10vw] md:text-[5vw] font-black uppercase tracking-tighter leading-[0.85] text-zinc-900 dark:text-white"
                />
                <p className="max-w-xl text-zinc-500 dark:text-zinc-400 font-medium text-lg leading-relaxed italic font-serif">
                   "Your vision has been recognized as part of the collective narrative."
                </p>
                
                <button 
                  onClick={() => router.push("/events")}
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-uiupc-orange transition-colors"
                >
                  <IconArrowLeft size={12} /> Back to Events
                </button>
            </div>

            {/* Unified Tools (Sticky Search & Category) */}
            <motion.div 
                initial={{ y: 0, opacity: 1 }}
                animate={{ 
                  y: isToolVisible ? 0 : -100, 
                  opacity: isToolVisible ? 1 : 0 
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`
                  w-full md:w-[400px] bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 
                  rounded-3xl shadow-xl md:sticky md:top-24 z-50 overflow-hidden
                  ${!isToolVisible && 'pointer-events-none'}
                `}
            >
                <div className="relative group border-b border-black/5 dark:border-white/5">
                    <IconSearch size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300 dark:text-zinc-600 transition-colors group-focus-within:text-uiupc-orange" />
                    <input 
                        type="text"
                        placeholder="Search Name or Institute"
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full pl-14 pr-6 py-5 bg-transparent text-[11px] font-black uppercase tracking-[0.1em] outline-none dark:text-white"
                    />
                </div>

                <div className="flex items-center bg-[#f9f5ea]/30 dark:bg-white/[0.02] px-6 py-2">
                    <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-zinc-400 mr-6">Filter:</span>
                    <div className="flex gap-8 py-2">
                        {[
                            { id: 'single', name: 'Single', icon: IconCamera },
                            { id: 'stories', name: 'Stories', icon: IconImages }
                        ].map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
                                className="relative group shrink-0"
                            >
                                <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
                                    selectedCategory === cat.id 
                                        ? 'text-uiupc-orange' 
                                        : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                                }`}>
                                    <cat.icon size={12} />
                                    {cat.name}
                                </span>
                                {selectedCategory === cat.id && (
                                    <motion.div 
                                        layoutId="resultsCat"
                                        className="absolute -bottom-1 left-0 right-0 h-[1.5px] bg-uiupc-orange rounded-full"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
      </section>

      {/* ── ZONE 2: RESULTS LIST ─────────────────────────────────────── */}
      <section className="px-6">
        <div className="max-w-7xl mx-auto">
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {currentItems.map((item: SinglePhoto | Story, index: number) => (
                        <motion.div
                            key={item.id || index}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            className={`
                                group flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-8 
                                rounded-2xl border transition-all duration-300
                                ${item.selected 
                                    ? 'bg-white dark:bg-zinc-900 border-uiupc-orange/20 shadow-lg shadow-uiupc-orange/[0.03]' 
                                    : 'bg-white/40 dark:bg-zinc-950/40 border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-zinc-900'}
                            `}
                        >
                            <div className="flex items-center gap-6 mb-4 md:mb-0">
                                <div className={`
                                    w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black
                                    ${item.selected ? 'bg-uiupc-orange text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}
                                `}>
                                    {String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, '0')}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white leading-none">
                                        {item.name}
                                    </h3>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                                        {item.institute}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 w-full md:w-auto justify-between border-t md:border-t-0 border-black/5 dark:border-white/5 pt-4 md:pt-0">
                                <div className="space-y-1">
                                    <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-400">Submissions</span>
                                    <span className="block text-sm font-black text-zinc-900 dark:text-white">
                                        {item.photos} {selectedCategory === "single" ? "Fragments" : "Narratives"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`
                                        px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest
                                        ${item.selected 
                                            ? 'bg-uiupc-orange/10 text-uiupc-orange' 
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}
                                    `}>
                                        {item.selected ? "Selected" : "Archived"}
                                    </span>
                                    <IconChevronRight size={12} className="text-zinc-200 dark:text-zinc-800 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {displayResults.length === 0 && (
                    <div className="py-24 text-center space-y-4">
                         <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto">
                             <IconSearch size={24} className="text-zinc-400" />
                         </div>
                         <h4 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">No matches found</h4>
                         <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Global search of "{searchQuery}" returned zero entries.</p>
                    </div>
                )}
            </div>
        </div>
      </section>

      {/* ── ZONE 3: REGISTRATION CTA ─────────────────────────────────── */}
      <section className="mt-40 px-6">
        <div className="max-w-7xl mx-auto rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden bg-zinc-950">
            <div className="relative z-10 space-y-10">
                <ScrollRevealText 
                    text="Exhibition Portal" 
                    className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none"
                />
                <p className="text-zinc-400 font-medium text-lg max-w-lg mx-auto">
                    Selected participants are required to complete the exhibition registration and levy payment.
                </p>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <button 
                         onClick={() => isRegistrationClosed ? alert("Registration closed") : setShowPaymentForm(true)}
                         className="px-12 py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] rounded-full hover:bg-uiupc-orange hover:text-white transition-all transform hover:scale-110 active:scale-95 shadow-2xl"
                    >
                        Register for Exhibition
                    </button>
                </div>
            </div>
        </div>
      </section>
    </div>
  );
};

export default ResultsView;
