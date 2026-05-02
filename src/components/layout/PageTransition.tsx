"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

import { usePageStore } from "@/store/usePageStore";

const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const markAsVisited = usePageStore((state) => state.markAsVisited);
  const alreadyVisited = usePageStore((state) => state.visitedPaths.has(pathname));

  React.useEffect(() => {
    // We mark the page as visited AFTER the animation or initial load
    const timer = setTimeout(() => {
      markAsVisited(pathname);
    }, 1000);
    return () => clearTimeout(timer);
  }, [pathname, markAsVisited]);

  return (
    <AnimatePresence>
      <motion.div
        key={pathname}
        initial={alreadyVisited ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: alreadyVisited ? 0 : -10 }}
        transition={{ 
          duration: alreadyVisited ? 0.2 : 0.35, 
          ease: [0.16, 1, 0.3, 1] 
        }}
        className="flex-1 flex flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
