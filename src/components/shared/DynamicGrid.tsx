"use client";

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface DynamicGridProps {
  isLens?: boolean;
}

const DynamicGrid: React.FC<DynamicGridProps> = ({ isLens }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  // Base configurations
  const size = isLens ? 440 : 400; // 10% optical scale for the central bulge
  const opacity = isLens ? 0.3 : 1; 

  // Line aesthetics
  const strokeOpacity = isDark ? 0.10 : 0.10;
  const strokeColor = isDark ? `rgba(255,255,255,${strokeOpacity})` : `rgba(0,0,0,${strokeOpacity})`;
  
  // Plus sign aesthetics
  const plusOpacity = 0.6;
  const plusColor = isDark ? `rgba(113, 113, 122, ${plusOpacity})` : `rgba(161, 161, 170, ${plusOpacity})`; 
  
  // Build raw SVG pattern
  const svgData = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
          <path d="M ${size} 0 L 0 0 0 ${size}" fill="none" stroke="${strokeColor}" stroke-width="1" />
          
          <path d="M -8 0 L 8 0 M 0 -8 L 0 8" fill="none" stroke="${plusColor}" stroke-width="1.5" />
          <path d="M ${size-8} 0 L ${size+8} 0 M ${size} -8 L ${size} 8" fill="none" stroke="${plusColor}" stroke-width="1.5" />
          <path d="M -8 ${size} L 8 ${size} M 0 ${size-8} L 0 ${size+8}" fill="none" stroke="${plusColor}" stroke-width="1.5" />
          <path d="M ${size-8} ${size} L ${size+8} ${size} M ${size} ${size-8} L ${size} ${size+8}" fill="none" stroke="${plusColor}" stroke-width="1.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  `.trim().replace(/\n/g, '').replace(/"/g, "'");

  const uri = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgData)}`;

  return (
    <div 
      className={`absolute inset-0 pointer-events-none overflow-hidden print:hidden ${isLens ? 'z-0' : 'z-[0]'}`}
      style={{
        backgroundImage: `url("${uri}")`,
        backgroundSize: `${size}px ${size}px`,
        // Both grids must anchor at the exact same screen center point to perfectly overlap!
        backgroundPosition: 'center 55vh',
        opacity: opacity,
        ...(isLens && {
           // Radially mask out the lens so it fades into the global grid
           maskImage: "radial-gradient(circle at center, black 0%, transparent 60%)",
           WebkitMaskImage: "radial-gradient(circle at center, black 0%, transparent 60%)"
        })
      }}
    />
  );
};

export default React.memo(DynamicGrid);
