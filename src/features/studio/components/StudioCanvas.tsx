"use client";

import React, { useMemo, useRef, useCallback, useEffect } from "react";
import Cropper from "react-easy-crop";
import { useStudioStore } from "@/store/useStudioStore";
import { motion, AnimatePresence } from "motion/react";
import { getSmartScale } from "@/lib/imageUtils";

const StudioCanvas: React.FC = () => {
  const { images, activeImageId, activeToolId, updateImageEdits } = useStudioStore();
  const activeImage = images.find((img) => img.id === activeImageId);
  const { transformer } = activeImage?.edits || {};
  const watermark = transformer?.watermark || { enabled: false, type: 'text', text: 'UIUPC' };

  const containerRef = useRef<HTMLDivElement>(null);
  const imgElRef = useRef<HTMLImageElement>(null);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const originRef = useRef({ x: 50, y: 50 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });


  const rafRef = useRef<number | null>(null);

  const applyTransform = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    
    rafRef.current = requestAnimationFrame(() => {
      if (!imgElRef.current) return;
      const z = zoomRef.current;
      const p = panRef.current;
      const o = originRef.current;
      imgElRef.current.style.transform = `translate(${p.x}px, ${p.y}px) scale(${z})`;
      imgElRef.current.style.transformOrigin = `${o.x}% ${o.y}%`;
      rafRef.current = null;
    });
  }, []);

  const resetView = useCallback(() => {
    zoomRef.current = 1;
    panRef.current = { x: 0, y: 0 };
    originRef.current = { x: 50, y: 50 };
    applyTransform();
  }, [applyTransform]);


  const syncMaskSize = useCallback(() => {
  }, []);


  // Sync mask canvas size and reset when switching images or tools
  useEffect(() => {
    resetView();
    syncMaskSize();
  }, [activeImage?.workingUrl, activeToolId, resetView, syncMaskSize]);


  // Editorial CSS filters for real-time preview
  const previewStyle = useMemo(() => {
    if (!activeImage?.edits?.editorial) return {};
    const { 
      exposure, brightness, contrast, saturation, sepia, invert, hueRotate, blur,
      temperature, vibrance, sharpen
    } = activeImage.edits.editorial;
    return {
      filter: `
        brightness(${100 + exposure + brightness}%)
        contrast(${100 + contrast}%)
        saturate(${saturation + (vibrance || 0)}%)
        sepia(${sepia || 0}%)
        invert(${invert || 0}%)
        hue-rotate(${hueRotate || 0}deg)
        blur(${blur || 0}px)
        ${sharpen > 0 ? 'url(#sharpen-preview)' : ''}
      `.trim().replace(/\s+/g, ' '),
    };
  }, [activeImage?.edits?.editorial]);

  // --- Wheel zoom ---
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    // Mouse position as percentage within the container
    const mx = ((e.clientX - rect.left) / rect.width) * 100;
    const my = ((e.clientY - rect.top) / rect.height) * 100;

    // Lock origin at the start of a zoom gesture
    if (zoomRef.current <= 1.05) {
      originRef.current = { x: mx, y: my };
      panRef.current = { x: 0, y: 0 };
    }

    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(Math.max(zoomRef.current * factor, 1), 12);

    if (newZoom <= 1) {
      resetView();
      return;
    }

    zoomRef.current = newZoom;
    applyTransform();
  }, [applyTransform, resetView]);

  // --- Mouse handlers for panning and drawing ---
  const getMappedCoordinates = (e: React.MouseEvent | MouseEvent, targetElement: HTMLElement) => {
    const rect = targetElement.getBoundingClientRect();
    const scaleX = (imgElRef.current?.naturalWidth || 800) / rect.width;
    const scaleY = (imgElRef.current?.naturalHeight || 600) / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();


    if (zoomRef.current <= 1) return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...panRef.current };
    if (containerRef.current) containerRef.current.style.cursor = "grabbing";
  }, [activeToolId]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {


    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    panRef.current = { x: panStart.current.x + dx, y: panStart.current.y + dy };
    applyTransform();
  }, [applyTransform]);

  const handleMouseUp = useCallback(() => {


    isDragging.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = zoomRef.current > 1 ? "grab" : "zoom-in";
    }
  }, []);

  // Double-click to reset
  const handleDoubleClick = useCallback(() => {
    resetView();
  }, [resetView]);

  // Attach passive:false wheel listener
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel, activeToolId]);

  if (!activeImage) return null;

  return (
    <div className="relative w-full flex items-center justify-center overflow-hidden" style={{ height: "calc(100vh - 120px)" }}>
      <AnimatePresence mode="wait">
        {activeToolId === "cropper" ? (
          <motion.div 
            key={`${activeImage.id}-cropper`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-900/50"
          >
            <Cropper
              image={activeImage.workingUrl}
              crop={activeImage.edits.crop?.crop || { x: 0, y: 0 }}
              zoom={(activeImage.edits.crop?.zoom || 1) * getSmartScale(activeImage.edits.crop?.rotation || 0)}
              rotation={activeImage.edits.crop?.rotation || 0}
              aspect={activeImage.edits.crop?.aspect}
              onCropChange={(c) => updateImageEdits(activeImage.id, { crop: { ...activeImage.edits.crop, crop: c } })}
              onCropComplete={(_, pixels) => updateImageEdits(activeImage.id, { crop: { ...activeImage.edits.crop, croppedAreaPixels: pixels } })}
              onZoomChange={(z) => {
                const s = getSmartScale(activeImage.edits.crop?.rotation || 0);
                updateImageEdits(activeImage.id, { crop: { ...activeImage.edits.crop, zoom: z / s } });
              }}
              onRotationChange={(r) => updateImageEdits(activeImage.id, { crop: { ...activeImage.edits.crop, rotation: r } })}
              classes={{ containerClassName: "cursor-crosshair" }}
            />
          </motion.div>
        ) : (
          <motion.div 
            key={`${activeImage.id}-preview`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 p-2 md:p-6 flex items-center justify-center w-full h-full"
          >
             <div 
               ref={containerRef}
               className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-sm cursor-zoom-in select-none"
               style={{ containerType: 'inline-size' }}
               onMouseDown={handleMouseDown}
               onMouseMove={handleMouseMove}
               onMouseUp={handleMouseUp}
               onMouseLeave={() => {
                 handleMouseUp();
                 // Don't reset on leave — let user keep their zoom
               }}
               onDoubleClick={handleDoubleClick}
             >
                <img 
                  ref={imgElRef}
                  src={activeImage.workingUrl} 
                  className="max-h-full w-auto max-w-full ring-1 ring-black/10 dark:ring-white/10 select-none will-change-transform pointer-events-none"
                  style={previewStyle}
                  draggable={false}
                  onLoad={syncMaskSize}
                />
                

                {/* Real-time Vignette Preview */}
                {(activeImage.edits.editorial?.vignette ?? 0) > 0 && (
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, transparent 20%, rgba(0,0,0,${(activeImage.edits.editorial?.vignette ?? 0) / 100}) 100%)`
                    }}
                  />
                )}

                {/* Real-time Temperature Preview Overlay */}
                {(activeImage.edits.editorial?.temperature ?? 0) !== 0 && (
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundColor: (activeImage.edits.editorial?.temperature ?? 0) > 0 
                        ? `rgba(255, 140, 0, ${Math.abs(activeImage.edits.editorial?.temperature ?? 0) / 300})`
                        : `rgba(0, 100, 255, ${Math.abs(activeImage.edits.editorial?.temperature ?? 0) / 300})`,
                      mixBlendMode: 'overlay'
                    }}
                  />
                )}

                {/* Real-time Watermark Preview Overlay */}
                {watermark?.enabled && (watermark.text || watermark.imageUri || watermark.type === 'text') && (
                   <div 
                      className={`absolute inset-0 pointer-events-none flex
                        ${watermark.position?.includes('top') ? 'items-start' : watermark.position?.includes('bottom') ? 'items-end' : 'items-center'}
                        ${watermark.position?.includes('left') ? 'justify-start' : watermark.position?.includes('right') ? 'justify-end' : 'justify-center'}
                      `}
                      style={{ 
                        opacity: watermark.opacity,
                        padding: `${(watermark.inset || 0.05) * 100}%`
                      }}
                   >
                     {watermark.tiled ? (
                        <div 
                          className="absolute inset-0"
                          style={{
                            backgroundImage: watermark.type === 'image' ? `url(${watermark.imageUri})` : 'none',
                            backgroundRepeat: 'repeat',
                            backgroundSize: watermark.type === 'image' ? `${watermark.scale * 100}cqw` : 'auto',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '2cqw'
                          }}
                        >
                           {watermark.type === 'text' && Array.from({ length: 20 }).map((_, i) => (
                             <span key={i} className="text-white font-black opacity-30 select-none whitespace-nowrap rotate-[-45deg]" style={{ fontSize: `${watermark.scale * 100}cqw` }}>
                               {watermark.text || "UIUPC"}
                             </span>
                           ))}
                        </div>
                     ) : (
                        watermark.type === 'image' ? (
                          <img 
                            src={watermark.imageUri} 
                            style={{ width: `${watermark.scale * 100}cqw` }}
                            className="object-contain"
                          />
                        ) : (
                          <span 
                            className="text-white font-black select-none whitespace-nowrap leading-none"
                            style={{ 
                              fontSize: `${watermark.scale * 100}cqw`,
                              textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.3)'
                            }}
                          >
                            {watermark.text || "UIUPC"}
                          </span>
                        )
                     )}
                   </div>
                 )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG Filters for Previews */}
      <svg className="hidden">
        <defs>
          <filter id="sharpen-preview">
            <feConvolveMatrix 
              order="3" 
              preserveAlpha="true" 
              kernelMatrix={
                activeImage.edits.editorial?.sharpen ? `
                  0 ${-activeImage.edits.editorial.sharpen / 300} 0
                  ${-activeImage.edits.editorial.sharpen / 300} ${1 + (4 * (activeImage.edits.editorial.sharpen / 300))} ${-activeImage.edits.editorial.sharpen / 300}
                  0 ${-activeImage.edits.editorial.sharpen / 300} 0
                ` : '0 0 0 0 1 0 0 0 0'
              } 
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default StudioCanvas;
