"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMinus, FaSearch, FaMapMarkerAlt, FaCompass, FaTimes, FaExternalLinkAlt, FaCalendarAlt, FaMountain } from 'react-icons/fa';
import { useTheme } from '@/contexts/ThemeContext';
import { UIUPCEvent } from '@/types';
import { getImageUrl } from '@/utils/imageUrl';
import Link from 'next/link';

const iconColors: Record<string, string> = {
  workshop: '#eab308', // Yellow
  photowalk: '#22c55e', // Green
  exhibition: '#3b82f6', // Blue
  visit: '#ef4444', // Red
  uiu: '#f58920', // Orange
  institution: '#f58920', // Sync with UIU Orange
  default: '#64748b', // Slate
};

interface InteractiveEventMapProps {
  events: UIUPCEvent[];
  selectedEventId?: string;
  tempCoords?: { lat: number; lng: number } | null;
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
  onReady?: () => void;
  isAdminMode?: boolean;
}

export const InteractiveEventMap: React.FC<InteractiveEventMapProps> = ({ 
  events, 
  selectedEventId,
  tempCoords,
  onMapClick,
  onReady,
  isAdminMode = false
}) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUI, setShowUI] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [is3D, setIs3D] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const uiuMarkerRef = useRef<maplibregl.Marker | null>(null);

  const defaultCenter: [number, number] = [90.449860, 23.797445]; // [lng, lat] for MapLibre

  // Mock Events around UIU for testing
  const mockEvents: UIUPCEvent[] = useMemo(() => [
    { id: 'm1', title: 'Street Photography Workshop', location: 'UIU Front Gate', latitude: 23.7985, longitude: 90.4495, map_icon_type: 'workshop', is_mapped: true, date: '2026-06-15', description: 'Mastering the art of street frames.', image: '', link: '' },
    { id: 'm2', title: 'Lakeside Photowalk', location: 'UIU Lake Side', latitude: 23.7965, longitude: 90.4510, map_icon_type: 'photowalk', is_mapped: true, date: '2026-06-20', description: 'Golden hour walk around the lake.', image: '', link: '' },
    { id: 'm3', title: 'Shutter Stories Exhibition', location: 'UIU Auditorium', latitude: 23.7970, longitude: 90.4485, map_icon_type: 'exhibition', is_mapped: true, date: '2026-07-05', description: 'Our flagship annual exhibition.', image: '', link: '' },
    { id: 'm4', title: 'Visit to National Museum', location: 'Shahbagh', latitude: 23.7375, longitude: 90.3945, map_icon_type: 'visit', is_mapped: true, date: '2026-06-25', description: 'Exploring heritage through lenses.', image: '', link: '' },
    { id: 'm5', title: 'Mobile Photography Session', location: 'UIU Field', latitude: 23.7978, longitude: 90.4505, map_icon_type: 'workshop', is_mapped: true, date: '2026-06-10', description: 'Phone to pro in 2 hours.', image: '', link: '' },
    { id: 'm6', title: 'Macro World Hunt', location: 'UIU Garden', latitude: 23.7968, longitude: 90.4500, map_icon_type: 'photowalk', is_mapped: true, date: '2026-07-12', description: 'Finding beauty in small things.', image: '', link: '' },
    { id: 'm7', title: 'Architecture Walk', location: 'UIU Main Building', latitude: 23.7976, longitude: 90.4490, map_icon_type: 'photowalk', is_mapped: true, date: '2026-07-20', description: 'Geometric perspectives.', image: '', link: '' }
  ], []);

  const allEvents = useMemo(() => [...events, ...mockEvents], [events, mockEvents]);

  // Filtered list
  const filteredEvents = useMemo(() => {
    return allEvents.filter(e => 
      e.is_mapped && 
      e.latitude && 
      e.longitude && 
      (!filterType || e.map_icon_type === filterType) &&
      (e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       e.location.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [allEvents, searchQuery, filterType]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const styleUrl = theme === 'dark' 
      ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
      : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: styleUrl,
      center: defaultCenter,
      zoom: 14,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
    });

    mapRef.current = map;

    map.on('load', () => {
      onReady?.();
      setTimeout(() => setShowUI(true), 600);

      // Add Clustering Source
      map.addSource('events-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: filteredEvents.map(e => ({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [e.longitude!, e.latitude!] },
            properties: { ...e }
          }))
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Cluster Layer (Circles)
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'events-source',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#f58920',
          'circle-radius': 18,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        }
      });

      // Cluster Count Text
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'events-source',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count}',
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff'
        }
      });

      // Unclustered Point Layer (The dots)
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'events-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'map_icon_type'],
            'workshop', iconColors.workshop,
            'photowalk', iconColors.photowalk,
            'exhibition', iconColors.exhibition,
            'visit', iconColors.visit,
            'uiu', iconColors.uiu,
            iconColors.default
          ],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-blur': 0.1
        }
      });

      // Interaction: Click on cluster
      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        const clusterId = features[0].properties.cluster_id;
        (map.getSource('events-source') as maplibregl.GeoJSONSource).getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.flyTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom || 15,
            duration: 1500
          });
        });
      });

      // Interaction: Click on unclustered point (Popup)
      map.on('click', 'unclustered-point', (e) => {
        const feature = e.features![0];
        const props = feature.properties;
        const coords = (feature.geometry as any).coordinates.slice();

        new maplibregl.Popup({ offset: 10, className: 'custom-popup' })
          .setLngLat(coords)
          .setHTML(`
            <div class="p-1 font-sans">
              ${props.image ? `<div class="w-full h-24 mb-3 rounded-lg overflow-hidden bg-zinc-100"><img src="${getImageUrl(props.image, 400)}" class="w-full h-full object-cover" /></div>` : ''}
              <h3 class="font-black text-sm uppercase tracking-tight mb-1" style="color: #18181b;">${props.title}</h3>
              <div class="flex items-center gap-2 text-[9px] text-zinc-500 font-bold mb-3 uppercase tracking-widest">📅 ${props.date}</div>
              <a href="/events/${props.id}" class="block w-full py-2.5 bg-[#f58920] text-white text-[9px] font-black uppercase tracking-widest text-center rounded-lg shadow-md">View Event Details</a>
            </div>
          `)
          .addTo(map);
      });

      // Change cursor on hover
      map.on('mouseenter', 'clusters', () => map.getCanvas().style.cursor = 'pointer');
      map.on('mouseleave', 'clusters', () => map.getCanvas().style.cursor = '');
      map.on('mouseenter', 'unclustered-point', () => map.getCanvas().style.cursor = 'pointer');
      map.on('mouseleave', 'unclustered-point', () => map.getCanvas().style.cursor = '');
    });

    map.on('click', (e) => {
      // Only trigger if we didn't click a cluster or point
      const features = map.queryRenderedFeatures(e.point, { layers: ['clusters', 'unclustered-point'] });
      if (features.length === 0 && isAdminMode && onMapClick) {
        onMapClick({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      }
    });

    // Add UIU Marker separately (Always visible)
    const el = document.createElement('div');
    el.className = 'uiu-marker-container';
    el.innerHTML = `
      <div class="uiu-glow-container" style="position: relative; width: 32px; height: 32px;">
        <div class="uiu-pulse" style="position: absolute; inset: -6px; background: rgba(245, 137, 32, 0.4); border-radius: 50%; animation: uiu-pulse-animation 2s infinite;"></div>
        <div style="position: relative; background-color: #f58920; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; color: white; box-shadow: 0 0 15px rgba(245, 137, 32, 0.5);">
          <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M185.7 268.1h76.2l12 170.2c.2 4.7-3.5 8.7-8.2 8.7H181.9c-4.7 0-8.5-4-8.2-8.7l12-170.2zm160.1 1.3l-28.7-27.1c-1.3-1.3-3.1-2-5-2h-36.2l-1.3-17.7h60.4c4.4 0 8-3.6 8-8v-32c0-4.4-3.6-8-8-8H273l-4.5-62.8h21.4c4.4 0 8-3.6 8-8V72c0-4.4-3.6-8-8-8H201.7l1.3-17.7c.3-4.7-3.5-8.7-8.2-8.7h-36.4c-4.3 0-7.9 3.3-8.2 7.6l-13.6 189.1H101c-4.4 0-8 3.6-8 8v32c0 4.4 3.6 8 8 8h31.9l-13.7 190.5c-.3 4.7 3.5 8.7-8.2 8.7h83.3c4.7 0 8.5-4 8.2-8.7L205.2 287h37.5l13.7 190.5c.3 4.7-3.5 8.7-8.2 8.7h83.3c4.7 0 8.5-4 8.2-8.7L320.1 287.4h37.5c4.4 0 8-3.6 8-8v-32c0-4.4-3.6-8.7-19.8-8zm84.5-166.5h-21.4L404.4 39.3c-.3-4.3-3.9-7.6-8.2-7.6h-36.4c-4.7 0-8.5 4-8.2 8.7l1.3 17.7h-88.1l-1.3-17.7c-.3-4.7-3.5-8.7-8.2-8.7h-36.4c-4.3 0-7.9 3.3-8.2 7.6l-13.6 189.1h35.2c4.4 0 8-3.6 8-8v-32c0-4.4-3.6-8-8-8h-26.6l12-167.1h60.4c4.4 0 8-3.6 8-8v-32c0-4.4-3.6-8-8-8h-88.1L239 238.4h35.2c4.4 0 8-3.6 8-8v-32c0-4.4-3.6-8-8-8h-26.6L259.6 24h35.2c4.4 0 8-3.6 8-8V0h-32v16h-35.2L227.1 16h-35.2L183.4 16h-35.2L139.7 16h-35.2L96 16H60.8V0H28.8v16H0v32h28.8v40h32V48H96v40h32V48h35.2v40h35.2V48H234v40h32V48h35.2v40h35.2V48h35.2v40h32V48H448V16h-17.7zM12.8 192.4l13.6 189.1c.3 4.7 4.1 8.7 8.8 8.7h83.3c4.7 0 8.5-4 8.2-8.7L113.1 192c-1.3-1.3-3.1-2-5-2H71.9l-1.3-17.7H131c4.4 0 8-3.6 8-8v-32c0-4.4-3.6-8-8-8H66.1l-4.5-62.8h21.4c4.4 0 8-3.6 8-8V72c0-4.4-3.6-8-8-8H12.8v32h21.4l1.3 17.7H8c-4.4 0-8 3.6-8 8v32c0 4.4 3.6 8 8 8h31.9l-1.3 17.7H12.8v114.7z"></path></svg>
        </div>
      </div>
    `;
    
    uiuMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat(defaultCenter)
      .addTo(map);

    return () => {
      map.remove();
    };
  }, [theme]); // Re-init on theme change for style

  // Update Data Source when filteredEvents changes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const source = map.getSource('events-source') as maplibregl.GeoJSONSource;
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: filteredEvents.map(e => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [e.longitude!, e.latitude!] },
          properties: { ...e }
        }))
      });
    }
  }, [filteredEvents]);

  // View Controls
  const handleZoom = (delta: number) => {
    mapRef.current?.zoomTo(mapRef.current.getZoom() + delta);
  };

  const handleRecenter = () => {
    mapRef.current?.flyTo({ center: defaultCenter, zoom: 15, pitch: is3D ? 60 : 0, bearing: is3D ? -20 : 0 });
  };

  const toggle3D = () => {
    const newState = !is3D;
    setIs3D(newState);
    mapRef.current?.easeTo({
      pitch: newState ? 60 : 0,
      bearing: newState ? -20 : 0,
      duration: 1000
    });
  };

  return (
    <div className="relative w-full h-full group/map bg-zinc-100 dark:bg-zinc-950 rounded-[2rem] overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* ── UI OVERLAYS ────────────────────────────────────────────── */}
      
      {/* Search Bar Overlay - Stagger 1 */}
      <AnimatePresence>
        {showUI && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-[400] w-[90%] max-w-md"
          >
            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-2 rounded-2xl border border-black/10 dark:border-white/10 shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center text-zinc-400">
                <FaSearch />
              </div>
              <input 
                type="text" 
                placeholder="Search events or locations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-widest placeholder:text-zinc-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-[#f58920] transition-colors">
                  <FaTimes />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Controls - Stagger 2 */}
      <AnimatePresence>
        {showUI && (
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute bottom-10 right-6 z-[400] flex flex-col gap-3"
          >
            {/* 3D TOGGLE BUTTON */}
            <button 
              onClick={toggle3D} 
              className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shadow-xl transition-all active:scale-95 border border-black/10 dark:border-white/10 backdrop-blur-md ${is3D ? 'bg-[#f58920] text-white' : 'bg-white/90 dark:bg-zinc-900/90 text-zinc-900 dark:text-white hover:bg-[#f58920]/10'}`}
              title="Toggle 3D Perspective"
            >
              <FaMountain className="text-lg" />
              <span className="text-[7px] font-black uppercase mt-1">3D</span>
            </button>

            <button onClick={() => handleZoom(1)} className="w-12 h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-xl flex items-center justify-center text-zinc-900 dark:text-white shadow-xl hover:bg-[#f58920] hover:text-white transition-all active:scale-95">
              <FaPlus />
            </button>
            <button onClick={() => handleZoom(-1)} className="w-12 h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-black/10 dark:border-white/10 rounded-xl flex items-center justify-center text-zinc-900 dark:text-white shadow-xl hover:bg-[#f58920] hover:text-white transition-all active:scale-95">
              <FaMinus />
            </button>
            <button onClick={handleRecenter} className="w-12 h-12 bg-[#f58920] text-white rounded-xl flex items-center justify-center shadow-xl hover:brightness-110 transition-all active:scale-95">
              <FaCompass />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend - Stagger 3 */}
      <AnimatePresence>
        {showUI && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="absolute bottom-10 left-6 z-[400] hidden md:block"
          >
            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-4 rounded-2xl border border-black/10 dark:border-white/10 shadow-xl space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Event Legend</p>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(iconColors).filter(([key]) => ['workshop', 'photowalk', 'exhibition', 'visit', 'uiu'].includes(key)).map(([type, color]) => (
                  <button 
                    key={type} 
                    onClick={() => setFilterType(filterType === type ? null : type)}
                    className={`flex items-center gap-3 transition-all ${filterType && filterType !== type ? 'opacity-30' : 'opacity-100'}`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest hover:text-[#f58920]">{type}</span>
                  </button>
                ))}
              </div>
              {filterType && (
                <button onClick={() => setFilterType(null)} className="text-[8px] font-black uppercase tracking-widest text-[#f58920] hover:underline pt-2 border-t border-black/5 block w-full text-left">
                  Reset Filter
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-popup .maplibregl-popup-content {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(16px);
          border-radius: 16px;
          padding: 12px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .dark .custom-popup .maplibregl-popup-content {
          background: rgba(24, 24, 27, 0.95);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .custom-popup .maplibregl-popup-tip {
          border-top-color: rgba(255, 255, 255, 0.95);
        }
        .dark .custom-popup .maplibregl-popup-tip {
          border-top-color: rgba(24, 24, 27, 0.95);
        }
        .uiu-pulse {
          pointer-events: none;
        }
        @keyframes uiu-pulse-animation {
          0% { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
