"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";
import { UIUPCEvent } from "@/types";
import { IconMapMarker, IconSave, IconSearch, IconClose, IconMousePointer, IconLayerGroup, IconGlobe, IconCheck, IconSpinner } from "@/components/shared/Icons";
import { motion, AnimatePresence } from "motion/react";
import dynamic from "next/dynamic";
import { Admin_ModuleHeader, Admin_StatCard, Admin_ErrorBoundary } from "@/features/admin/components";

// Dynamic import for the Map to avoid SSR issues with Leaflet
const InteractiveEventMap = dynamic(
  () => import("./InteractiveEventMap").then((mod) => mod.InteractiveEventMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 rounded-3xl flex items-center justify-center border border-zinc-200 dark:border-zinc-800 animate-pulse"><IconMapMarker size={40} className="text-zinc-300 dark:text-zinc-700" /></div> }
);

export const Admin_EventMap = () => {
  const { data: events, refetch } = useSupabaseData("events");
  const [selectedEvent, setSelectedEvent] = useState<UIUPCEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [tempCoords, setTempCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [tempIconType, setTempIconType] = useState<string>("workshop");
  const [tempColor, setTempColor] = useState<string>("#f58920");
  const [tempLinkUrl, setTempLinkUrl] = useState<string>("");

  // Sync temp state when an event is selected
  useEffect(() => {
    if (selectedEvent) {
      if (selectedEvent.latitude && selectedEvent.longitude) {
        setTempCoords({ lat: selectedEvent.latitude, lng: selectedEvent.longitude });
      } else {
        setTempCoords(null);
      }
      setTempIconType(selectedEvent.map_icon_type || "workshop");
      setTempColor(selectedEvent.marker_color || "#f58920");
      setTempLinkUrl(selectedEvent.marker_link_url || `/events/${selectedEvent.id}`);
    } else {
      setTempCoords(null);
    }
  }, [selectedEvent]);

  const filteredEvents = useMemo(() => {
    return events?.filter((e: any) => 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.location.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  }, [events, searchQuery]);

  const handleMapClick = useCallback((latlng: { lat: number; lng: number }) => {
    if (!selectedEvent) return;
    setTempCoords(latlng);
  }, [selectedEvent]);

  const handleSave = async () => {
    if (!selectedEvent || !tempCoords) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("events")
        .update({
          latitude: tempCoords.lat,
          longitude: tempCoords.lng,
          map_icon_type: tempIconType,
          marker_color: tempColor,
          marker_link_url: tempLinkUrl,
          is_mapped: true
        })
        .eq("id", selectedEvent.id);
      
      if (error) throw error;
      
      await refetch();
      alert("Location saved successfully!");
      
      // Update selected event in local state
      setSelectedEvent(prev => prev ? { ...prev, latitude: tempCoords.lat, longitude: tempCoords.lng, map_icon_type: tempIconType, is_mapped: true } : null);
    } catch (err: any) {
      alert("Error saving location: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const iconTypes = [
    { value: "workshop", label: "Workshop" },
    { value: "photowalk", label: "Photowalk" },
    { value: "exhibition", label: "Exhibition" },
    { value: "visit", label: "Visit" },
    { value: "uiu", label: "UIU" }
  ];

  const markerColors = [
    { value: "#f58920", label: "Orange" },
    { value: "#3b82f6", label: "Blue" },
    { value: "#22c55e", label: "Green" },
    { value: "#ef4444", label: "Red" },
    { value: "#a855f7", label: "Purple" },
    { value: "#18181b", label: "Dark" }
  ];

  return (
    <div className="w-full space-y-6 min-w-0 relative z-10 isolate">
      <Admin_ModuleHeader 
        title="Event Map"
        description="Pin events to the interactive world map."
      >
        <Admin_StatCard label="Total Events" value={events?.length || 0} icon={<IconGlobe size={20} />} />
        <Admin_StatCard label="Pinned Events" value={events?.filter((e: any) => e.is_mapped).length || 0} icon={<IconMapMarker size={20} />} color="text-blue-500" />
        <Admin_StatCard label="System Status" value="Online" icon={<IconCheck size={20} />} color="text-green-500" />
      </Admin_ModuleHeader>

      <div className="w-full flex flex-col lg:flex-row gap-8 h-[calc(100vh-20rem)] min-h-[700px]">
        
        {/* LEFT PANEL: Event List */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 h-full">
          <div className="p-8 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black uppercase tracking-tight dark:text-white flex items-center gap-3">
                <IconLayerGroup size={16} className="text-uiupc-orange" /> Map Directory
              </h2>
            </div>

            <div className="relative mb-8 group">
              <IconSearch size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-uiupc-orange transition-colors" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent focus:border-uiupc-orange/30 rounded-2xl text-sm font-bold outline-none transition-all dark:text-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-3">
              {filteredEvents.map((event: UIUPCEvent) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-300 relative group overflow-hidden ${
                    selectedEvent?.id === event.id 
                      ? "bg-uiupc-orange/10 border-uiupc-orange/40" 
                      : "bg-transparent border-zinc-100 dark:border-zinc-800/50 hover:border-uiupc-orange/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${event.is_mapped ? 'bg-uiupc-orange/20 text-uiupc-orange' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                        <IconMapMarker size={14} />
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-[11px] font-black uppercase tracking-tight truncate ${selectedEvent?.id === event.id ? "text-uiupc-orange" : "text-zinc-900 dark:text-white"}`}>
                          {event.title}
                        </h3>
                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest truncate">{event.location}</p>
                      </div>
                    </div>
                    {event.is_mapped && (
                      <div className="w-1.5 h-1.5 rounded-full bg-uiupc-orange shadow-[0_0_8px_rgba(245,137,32,0.5)]" />
                    )}
                  </div>
                </button>
              ))}
              {filteredEvents.length === 0 && (
                <div className="text-center py-20 flex flex-col items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-[#1a1a1a] flex items-center justify-center text-zinc-300"><IconSearch size={16} /></div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No events found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Map & Editor */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6 h-full">
          <AnimatePresence mode="wait">
            {selectedEvent ? (
              <motion.div 
                key={selectedEvent.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-8 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-sm flex flex-col gap-8 shrink-0 relative isolate"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase tracking-tighter dark:text-white leading-none">{selectedEvent.title}</h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mt-2">
                      <IconMousePointer size={10} className="text-uiupc-orange" /> Click on the map to place the pin
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedEvent(null)}
                    className="w-12 h-12 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-zinc-500 hover:text-red-500 transition-all border border-transparent hover:border-red-500/10 shadow-sm"
                  >
                    <IconClose size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                  <div className="col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pin Category</label>
                    <select 
                      value={tempIconType}
                      onChange={(e) => setTempIconType(e.target.value)}
                      className="w-full px-5 py-4 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent rounded-2xl text-xs font-bold outline-none focus:border-uiupc-orange/30 transition-all dark:text-white appearance-none"
                    >
                      {iconTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Pin Color</label>
                    <div className="flex items-center gap-2 p-2 bg-zinc-100 dark:bg-[#1a1a1a] rounded-2xl h-[52px]">
                      {markerColors.map(color => (
                        <button 
                          key={color.value}
                          onClick={() => setTempColor(color.value)}
                          className={`w-8 h-8 rounded-full border-4 transition-all ${tempColor === color.value ? 'border-white dark:border-zinc-800 scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'}`}
                          style={{ backgroundColor: color.value }}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="col-span-1 space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Latitude</label>
                    <div className="px-4 py-4 bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/50 rounded-2xl text-[10px] font-black text-zinc-400 font-mono">
                      {tempCoords?.lat?.toFixed(5) || "??.????"}
                    </div>
                  </div>
                  <div className="col-span-1 space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Longitude</label>
                    <div className="px-4 py-4 bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800/50 rounded-2xl text-[10px] font-black text-zinc-400 font-mono">
                      {tempCoords?.lng?.toFixed(5) || "??.????"}
                    </div>
                  </div>
                  <div className="col-span-6 space-y-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Marker Link URL</label>
                    <input 
                      type="text" 
                      value={tempLinkUrl} 
                      onChange={(e) => setTempLinkUrl(e.target.value)} 
                      className="w-full px-5 py-4 bg-zinc-100 dark:bg-[#1a1a1a] border border-transparent rounded-2xl text-xs font-bold outline-none focus:border-uiupc-orange/30 transition-all dark:text-white"
                      placeholder="/events/event-id"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !tempCoords}
                    className={`px-10 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all ${
                      isSaving || !tempCoords ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed" : "bg-uiupc-orange text-white hover:brightness-110 shadow-xl shadow-uiupc-orange/20"
                    }`}
                  >
                    {isSaving ? <IconSpinner size={14} className="animate-spin" /> : <IconSave size={14} />}
                    {isSaving ? "Saving..." : "Apply Pin"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-12 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-sm flex flex-col items-center justify-center gap-4 text-center shrink-0"
              >
                <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-300"><IconMapMarker size={24} /></div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] max-w-[200px]">Select an event from the directory to edit its location</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-zinc-800 rounded-[3rem] overflow-hidden relative shadow-sm z-0">
            <Admin_ErrorBoundary>
              <InteractiveEventMap 
                events={events || []} 
                selectedEventId={selectedEvent?.id}
                tempCoords={tempCoords}
                onMapClick={handleMapClick}
                isAdminMode={true}
              />
            </Admin_ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};
