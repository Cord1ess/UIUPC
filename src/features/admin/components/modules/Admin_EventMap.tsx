"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { supabase } from "@/lib/supabase";
import { UIUPCEvent } from "@/types";
import { FaMapMarkerAlt, FaSave, FaSearch, FaTimes, FaMousePointer } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamic import for the Map to avoid SSR issues with Leaflet
const InteractiveEventMap = dynamic(
  () => import("./InteractiveEventMap").then((mod) => mod.InteractiveEventMap),
  { ssr: false, loading: () => <div className="w-full h-full bg-zinc-100 dark:bg-zinc-900 rounded-3xl flex items-center justify-center border border-black/5 dark:border-white/5 animate-pulse"><FaMapMarkerAlt className="text-4xl text-zinc-300 dark:text-zinc-700" /></div> }
);

export const Admin_EventMap = () => {
  const { data: events, refetch } = useSupabaseData("events");
  const [selectedEvent, setSelectedEvent] = useState<UIUPCEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [tempCoords, setTempCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [tempIconType, setTempIconType] = useState<string>("workshop");

  // Sync temp state when an event is selected
  useEffect(() => {
    if (selectedEvent) {
      if (selectedEvent.latitude && selectedEvent.longitude) {
        setTempCoords({ lat: selectedEvent.latitude, lng: selectedEvent.longitude });
      } else {
        setTempCoords(null);
      }
      setTempIconType(selectedEvent.map_icon_type || "workshop");
    } else {
      setTempCoords(null);
    }
  }, [selectedEvent]);

  const filteredEvents = events?.filter((e: any) => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.location.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleMapClick = (latlng: { lat: number; lng: number }) => {
    if (!selectedEvent) return;
    setTempCoords(latlng);
  };

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

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
      
      {/* LEFT PANEL: Event List */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <div className="p-6 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-[2rem] shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black uppercase tracking-tight dark:text-white flex items-center gap-2">
              <FaMapMarkerAlt className="text-uiupc-orange" /> Event Pins
            </h2>
            <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full">
              {events?.filter((e: any) => e.is_mapped).length || 0} / {events?.length || 0} Mapped
            </div>
          </div>

          <div className="relative mb-6">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="SEARCH EVENTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-uiupc-orange/20 dark:text-white"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
            {filteredEvents.map((event: UIUPCEvent) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                  selectedEvent?.id === event.id 
                    ? "bg-uiupc-orange/5 border-uiupc-orange/30 shadow-sm" 
                    : "bg-transparent border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-bold truncate ${selectedEvent?.id === event.id ? "text-uiupc-orange" : "dark:text-white"}`}>
                      {event.title}
                    </h3>
                    <p className="text-[10px] text-zinc-500 truncate mt-1">{event.location}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${event.is_mapped ? "bg-green-500" : "bg-red-500/50"}`} />
                </div>
              </button>
            ))}
            {filteredEvents.length === 0 && (
              <div className="text-center py-10 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                No events found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Map & Editor */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4">
        {selectedEvent ? (
          <div className="p-6 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-[2rem] shadow-sm flex flex-col gap-4 z-10 relative">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black dark:text-white">{selectedEvent.title}</h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                  <FaMousePointer /> Click on the map below to set pin location
                </p>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="w-8 h-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-full text-zinc-500 hover:text-red-500 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Map Icon Type</label>
                <select 
                  value={tempIconType}
                  onChange={(e) => setTempIconType(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-xl text-sm font-bold focus:outline-none dark:text-white"
                >
                  {iconTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Latitude</label>
                <input 
                  type="text" 
                  readOnly 
                  value={tempCoords?.lat?.toFixed(6) || "---"} 
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-xl text-sm font-bold text-zinc-500"
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Longitude</label>
                <input 
                  type="text" 
                  readOnly 
                  value={tempCoords?.lng?.toFixed(6) || "---"} 
                  className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-xl text-sm font-bold text-zinc-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving || !tempCoords}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                  isSaving || !tempCoords ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed" : "bg-uiupc-orange text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20"
                }`}
              >
                {isSaving ? "Saving..." : <><FaSave /> Save Coordinates</>}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-[2rem] shadow-sm flex items-center justify-center">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Select an event to edit its map location</p>
          </div>
        )}

        <div className="flex-1 min-h-[400px] bg-white dark:bg-[#080808] border border-black/5 dark:border-white/5 rounded-[2rem] overflow-hidden relative shadow-sm z-0">
          <InteractiveEventMap 
            events={events || []} 
            selectedEventId={selectedEvent?.id}
            tempCoords={tempCoords}
            onMapClick={handleMapClick}
            isAdminMode={true}
          />
        </div>
      </div>

    </div>
  );
};
