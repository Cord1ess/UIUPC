"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useLoaderStore } from "../../store/useLoaderStore";
import { FiSun, FiMoon } from "react-icons/fi";
import myLogo from "../../assets/UIUPC Logo.svg";

// ─── Types ────────────────────────────────────────────────
interface NavItem {
  path: string;
  label: string;
}

interface SubMenuItem {
  path: string;
  label: string;
}

// ─── Nav Structure ────────────────────────────────────────
const PRIMARY_LINKS: NavItem[] = [
  { path: "/events", label: "Events" },
  { path: "/gallery", label: "Gallery" },
];

const ABOUT_SUBMENU: SubMenuItem[] = [
  { path: "/members", label: "Members" },
  { path: "/blog", label: "Blog" },
  { path: "/contact", label: "Contact" },
];

// All navigable paths for active detection
const ALL_ABOUT_PATHS = ABOUT_SUBMENU.map((i) => i.path);

// ─── Component ────────────────────────────────────────────
const Header: React.FC = memo(() => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isAnimationComplete } = useLoaderStore();

  // ── State ──
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

  // ── Refs ──
  const headerRef = useRef<HTMLElement>(null);
  const aboutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Close menus on route change ──
  useEffect(() => {
    setMobileOpen(false);
    setAboutOpen(false);
    setMobileAboutOpen(false);
  }, [pathname]);

  const isActive = useCallback((path: string) => pathname === path, [pathname]);
  const isAboutActive = ALL_ABOUT_PATHS.includes(pathname);
  const isAdminPage = pathname.startsWith('/admin');


  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      setMobileOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, []);

  const openAbout = useCallback(() => {
    if (aboutTimeoutRef.current) clearTimeout(aboutTimeoutRef.current);
    setAboutOpen(true);
  }, []);

  const closeAbout = useCallback(() => {
    aboutTimeoutRef.current = setTimeout(() => setAboutOpen(false), 200);
  }, []);

  // ── Staggered animation delay helper ──
  const itemDelay = (i: number) => ({
    animation: isAnimationComplete
      ? `header-item-in 0.4s cubic-bezier(0.16,1,0.3,1) ${0.4 + i * 0.06}s both`
      : "none",
    opacity: isAnimationComplete ? undefined : 0,
  });

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-4 left-4 right-4 mx-auto z-[1000] flex items-center justify-between
                   w-auto max-w-3xl border transition-all duration-300 ease-in-out
                   rounded-xl px-5 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.1)]
                   ${theme === "light"
            ? "bg-white border-black/[0.08] text-black"
            : "bg-[#171717] border-white/[0.08] text-white"}
                   `}
        style={{
          animation: isAnimationComplete
            ? "header-expand 0.8s cubic-bezier(0.16,1,0.3,1) both"
            : "none",
          opacity: isAnimationComplete ? undefined : 0,
          transformOrigin: "center",
        }}
      >
        {/* ── Left: Logo Section ── */}
        <div className="flex-1 flex items-center" style={itemDelay(0)}>
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0"
            onClick={() => setMobileOpen(false)}
          >
            <img src={myLogo.src} alt="UIUPC Logo" className="w-10 h-10 object-contain" />
            <div className="flex flex-col leading-none relative -top-[1px]">
              <span className={`text-2xl font-black uppercase tracking-tighter transition-colors duration-300 ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
                UIUPC
              </span>
              <span className="text-uiupc-orange text-[8px] font-bold uppercase tracking-[0.12em] whitespace-nowrap">
                UIU PHOTOGRAPHY CLUB
              </span>
            </div>
          </Link>
        </div>

        {/* ── Desktop Nav ── */}
        <nav className="hidden lg:flex items-center gap-1">
          {PRIMARY_LINKS.map((item, i) => (
            <Link
              key={item.path}
              href={item.path}
              className={`px-3.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-colors duration-200
                ${theme === 'light'
                  ? (isActive(item.path) ? "text-uiupc-orange bg-uiupc-orange/[0.07]" : "text-black/50 hover:text-black hover:bg-black/[0.03]")
                  : (isActive(item.path) ? "text-uiupc-orange bg-uiupc-orange/[0.15]" : "text-white/50 hover:text-white hover:bg-white/[0.05]")
                }`}
              style={itemDelay(i + 1)}
            >
              {item.label}
            </Link>
          ))}

          <div
            className="relative"
            onMouseEnter={openAbout}
            onMouseLeave={closeAbout}
            style={itemDelay(PRIMARY_LINKS.length + 1)}
          >
            <button
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-widest transition-colors duration-200
                ${theme === 'light'
                  ? (isAboutActive ? "text-uiupc-orange bg-uiupc-orange/[0.07]" : "text-black/50 hover:text-black hover:bg-black/[0.03]")
                  : (isAboutActive ? "text-uiupc-orange bg-uiupc-orange/[0.15]" : "text-white/50 hover:text-white hover:bg-white/[0.05]")
                }`}
              onClick={() => setAboutOpen((p) => !p)}
            >
              About
              <svg className={`w-3 h-3 transition-transform ${aboutOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Desktop Submenu */}
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 border rounded-xl shadow-xl transition-all origin-top
              ${theme === 'light' ? 'bg-white border-black/[0.06]' : 'bg-neutral-800 border-white/[0.06]'}
              ${aboutOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
            >
              <div className="py-1.5">
                {ABOUT_SUBMENU.map((sub) => (
                  <Link
                    key={sub.path}
                    href={sub.path}
                    className={`block px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-colors
                      ${theme === 'light'
                        ? (isActive(sub.path) ? "text-uiupc-orange bg-uiupc-orange/[0.05]" : "text-black/50 hover:text-black hover:bg-black/[0.03]")
                        : (isActive(sub.path) ? "text-uiupc-orange bg-uiupc-orange/[0.12]" : "text-white/50 hover:text-white hover:bg-white/[0.05]")
                      }`}
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* ── Right: CTA / Theme ── */}
        <div className="flex-1 flex items-center justify-end gap-2" style={itemDelay(PRIMARY_LINKS.length + 3)}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300
              ${theme === 'light' ? 'bg-black/[0.04] hover:bg-black/[0.08]' : 'bg-white/[0.04] hover:bg-white/[0.08]'}`}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <FiMoon className="w-4 h-4 text-black" />
            ) : (
              <FiSun className="w-4 h-4 text-white" />
            )}
          </button>

          <div className="hidden lg:block">
            {user ? (
              isAdminPage ? (
                <button
                  onClick={handleSignOut}
                  className={`h-9 px-5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                    ${theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'}`}
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/admin"
                  className="h-9 px-5 flex items-center justify-center rounded-lg bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg"
                >
                  Admin Panel
                </Link>
              )
            ) : (
              <Link
                href="/join"
                className="h-9 px-5 flex items-center justify-center rounded-lg bg-uiupc-orange text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all"
              >
                Join Us
              </Link>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button className="lg:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px]" onClick={() => setMobileOpen((p) => !p)}>
            <span className={`block w-5 h-[1.5px] rounded-full transition-all ${mobileOpen ? "rotate-45 translate-y-[6.5px]" : ""} ${theme === 'dark' ? 'bg-white' : 'bg-black'}`} />
            <span className={`block w-5 h-[1.5px] rounded-full transition-all ${mobileOpen ? "opacity-0" : ""} ${theme === 'dark' ? 'bg-white' : 'bg-black'}`} />
            <span className={`block w-5 h-[1.5px] rounded-full transition-all ${mobileOpen ? "-rotate-45 -translate-y-[6.5px]" : ""} ${theme === 'dark' ? 'bg-white' : 'bg-black'}`} />
          </button>
        </div>

        {/* ── Mobile Dropdown ── */}
        <div className={`absolute top-[calc(100%+8px)] left-0 right-0 z-[999] border rounded-xl shadow-2xl transition-all origin-top lg:hidden
          ${theme === 'light' ? 'bg-white border-black/[0.06]' : 'bg-neutral-800 border-white/[0.06]'}
          ${mobileOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
          <div className="p-4 flex flex-col gap-1">
            {[...PRIMARY_LINKS, ...ABOUT_SUBMENU].map((item) => (
              <Link 
                key={item.path} 
                href={item.path} 
                className={`w-full py-3.5 px-4 rounded-lg text-xs font-black uppercase tracking-widest transition-colors
                  ${isActive(item.path) 
                    ? "text-uiupc-orange bg-uiupc-orange/5" 
                    : theme === 'light' ? "text-black/60 hover:bg-black/5" : "text-white/60 hover:bg-white/5"}`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 flex flex-col gap-2">
              {user ? (
                isAdminPage ? (
                  <button 
                    onClick={handleSignOut} 
                    className={`w-full py-4 px-4 rounded-lg text-xs font-black uppercase tracking-widest text-left
                      ${theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'}`}
                  >
                    Sign Out
                  </button>
                ) : (
                  <Link 
                    href="/admin" 
                    className="block w-full text-center py-4 rounded-lg bg-uiupc-orange text-white text-xs font-black uppercase tracking-widest" 
                    onClick={() => setMobileOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )
              ) : (
                <Link 
                  href="/join" 
                  className="block w-full text-center py-4 rounded-lg bg-uiupc-orange text-white text-xs font-black uppercase tracking-widest" 
                  onClick={() => setMobileOpen(false)}
                >
                  Join Us
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
});

Header.displayName = "Header";
export default Header;
