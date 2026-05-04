"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLoaderStore } from "@/store/useLoaderStore";
import { IconSun, IconMoon, IconUsers, IconLayerGroup, IconTrophy, IconBookOpen, IconPaintBrush, IconEnvelope, IconArrowRight, IconBars, IconClose } from "@/components/shared/Icons";
import myLogo from "@/assets/UIUPC Logo.svg";
import { motion, AnimatePresence } from "motion/react";

// ─── Types ────────────────────────────────────────────────
interface NavItem {
  path: string;
  label: string;
}

const PRIMARY_LINKS: NavItem[] = [
  { path: "/events", label: "Events" },
  { path: "/gallery", label: "Gallery" },
];

const EXPLORE_SUBMENU = [
  { path: "/members", label: "Members", icon: IconUsers },
  { path: "/departments", label: "Departments", icon: IconLayerGroup },
  { path: "/achievements", label: "Achievements", icon: IconTrophy },
  { path: "/blog", label: "Blog", icon: IconBookOpen },
  { path: "/studio", label: "Studio", icon: IconPaintBrush },
  { path: "/contact", label: "Contact", icon: IconEnvelope },
];

const ALL_EXPLORE_PATHS = EXPLORE_SUBMENU.map((i) => i.path);

// ─── Component ────────────────────────────────────────────
const Header: React.FC = memo(() => {
  const pathname = usePathname();
  const { user: supabaseUser, signOut: supabaseSignOut } = useSupabaseAuth();
  const { theme, toggleTheme, isSwitching } = useTheme();
  const { isAnimationComplete } = useLoaderStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  
  const exploreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMobileOpen(false);
    setExploreOpen(false);
  }, [pathname]);

  const isActive = useCallback((path: string) => pathname === path, [pathname]);
  const isExploreActive = ALL_EXPLORE_PATHS.includes(pathname);

  const openExplore = useCallback(() => {
    if (exploreTimeoutRef.current) clearTimeout(exploreTimeoutRef.current);
    setExploreOpen(true);
  }, []);

  const closeExplore = useCallback(() => {
    exploreTimeoutRef.current = setTimeout(() => setExploreOpen(false), 200);
  }, []);

  const itemDelay = (i: number) => ({
    animation: isAnimationComplete
      ? `header-item-in 0.4s cubic-bezier(0.16,1,0.3,1) ${0.4 + i * 0.06}s both`
      : "none",
    opacity: isAnimationComplete ? undefined : 0,
  });

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className={`fixed top-4 left-4 right-4 mx-auto z-[1000] flex items-center justify-between
                   w-auto max-w-3xl border transition-all duration-300 ease-in-out
                   rounded-xl px-5 py-2.5 shadow-lg
                   ${theme === "light" ? "bg-white border-black/5 text-black" : "bg-[#171717] border-white/5 text-white"}`}
        style={{
          animation: isAnimationComplete ? "header-expand 0.8s cubic-bezier(0.16,1,0.3,1) both" : "none",
          opacity: isAnimationComplete ? undefined : 0,
        }}
      >
        {/* ── Left: Logo ── */}
        <div className="flex-1 flex items-center" style={itemDelay(0)}>
          <Link 
            href="/" 
            onClick={handleLogoClick}
            className="flex items-center gap-3 shrink-0"
          >
            <img src={myLogo.src} alt="UIUPC Logo" className="w-10 h-10 object-contain" />
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-black uppercase tracking-tighter">UIUPC</span>
              <span className="text-uiupc-orange text-[8px] font-bold uppercase tracking-[0.12em]">UIU PHOTOGRAPHY CLUB</span>
            </div>
          </Link>
        </div>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-1">
          {PRIMARY_LINKS.map((item, i) => (
            <Link
              key={item.path}
              href={item.path}
              className={`px-3.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all
                ${isActive(item.path) ? "text-uiupc-orange bg-uiupc-orange/5" : "text-zinc-500 hover:text-uiupc-orange hover:bg-zinc-50 dark:hover:bg-white/5"}`}
              style={itemDelay(i + 1)}
            >
              {item.label}
            </Link>
          ))}

          <div onMouseEnter={openExplore} onMouseLeave={closeExplore} style={itemDelay(PRIMARY_LINKS.length + 1)}>
            <button
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-all
                ${isExploreActive ? "text-uiupc-orange bg-uiupc-orange/5" : "text-zinc-500 hover:text-uiupc-orange hover:bg-zinc-50 dark:hover:bg-white/5"}`}
            >
              Explore
              <svg className={`w-3 h-3 transition-transform ${exploreOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </nav>

        {/* ── Right: CTA / Theme ── */}
        <div className="flex-1 flex items-center justify-end gap-2" style={itemDelay(PRIMARY_LINKS.length + 3)}>
          <button
            onClick={(e) => toggleTheme(e)}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${theme === 'light' ? 'bg-zinc-100 hover:bg-zinc-200' : 'bg-white/5 hover:bg-white/10'}`}
          >
            {theme === "light" ? <IconMoon className="text-black" /> : <IconSun className="text-white" />}
          </button>

          <div className="hidden lg:block">
            {supabaseUser ? (
              <Link href="/admin" className="h-9 px-5 flex items-center justify-center rounded-lg bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg">
                Admin Panel
              </Link>
            ) : (
              <Link href="/join" className="h-9 px-5 flex items-center justify-center rounded-lg bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all">
                Join us
              </Link>
            )}
          </div>

          <button className="lg:hidden flex flex-col justify-center items-center w-10 h-10" onClick={() => setMobileOpen((p) => !p)}>
            {mobileOpen ? <IconClose size={24} /> : <IconBars size={24} />}
          </button>
        </div>

        {/* ── Desktop Submenu (Direct Child of Header) ── */}
        <AnimatePresence>
          {exploreOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              onMouseEnter={openExplore}
              onMouseLeave={closeExplore}
              className={`absolute top-full left-0 right-0 mt-3 p-3 rounded-2xl shadow-2xl border grid grid-cols-6 gap-2 z-[2000]
                ${theme === 'light' ? 'bg-white border-black/5' : 'bg-[#171717] border-white/5'}`}
            >
              {EXPLORE_SUBMENU.map((sub) => {
                const Icon = sub.icon;
                const isSubActive = isActive(sub.path);
                return (
                  <Link
                    key={sub.path}
                    href={sub.path}
                    className={`flex flex-col items-center justify-center min-h-[80px] p-3 rounded-xl transition-all group border text-center
                      ${theme === 'light' 
                        ? (isSubActive ? 'bg-zinc-100 border-uiupc-orange text-uiupc-orange' : 'bg-zinc-50 border-black/5 text-zinc-500 hover:border-uiupc-orange/30 hover:text-uiupc-orange') 
                        : (isSubActive ? 'bg-white/10 border-uiupc-orange text-uiupc-orange' : 'bg-white/[0.03] border-white/5 text-zinc-400 hover:border-uiupc-orange/30 hover:text-uiupc-orange')
                      }`}
                  >
                    <Icon className={`text-xl mb-2 transition-all duration-300 group-hover:scale-110 ${isSubActive ? 'text-uiupc-orange' : 'text-zinc-400 group-hover:text-uiupc-orange'}`} />
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-tight">{sub.label}</span>
                  </Link>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile Dropdown ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`absolute top-[calc(100%+8px)] left-0 right-0 z-[999] border rounded-xl shadow-2xl overflow-hidden lg:hidden
                ${theme === 'light' ? 'bg-white border-black/5' : 'bg-[#171717] border-white/5'}`}
            >
              <div className="p-4 flex flex-col gap-1">
                {[...PRIMARY_LINKS, ...EXPLORE_SUBMENU].map((item) => (
                  <Link 
                    key={item.path} 
                    href={item.path} 
                    className={`w-full py-3.5 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-all
                      ${isActive(item.path) ? "text-uiupc-orange bg-uiupc-orange/5" : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-white/5"}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
});

Header.displayName = "Header";
export default Header;
