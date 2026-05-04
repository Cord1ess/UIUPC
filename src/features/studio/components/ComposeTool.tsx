"use client";

import React, { useState } from "react";
import { IconObjectGroup, IconTh, IconLayerGroup, IconBorderAll } from "@/components/shared/Icons";
import dynamic from "next/dynamic";
import StudioLoader from "./StudioLoader";

const SplitterTool = dynamic(() => import("./SplitterTool"), { ssr: false, loading: () => <StudioLoader /> });
const StitcherTool = dynamic(() => import("./StitcherTool"), { ssr: false, loading: () => <StudioLoader /> });
const CollageTool = dynamic(() => import("./CollageTool"), { ssr: false, loading: () => <StudioLoader /> });

const TABS = [
  { id: "split", label: "Split", icon: IconTh },
  { id: "stitch", label: "Stitch", icon: IconLayerGroup },
  { id: "collage", label: "Collage", icon: IconBorderAll },
] as const;

type TabId = typeof TABS[number]["id"];

const ComposeTool: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("split");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-zinc-400">
         <IconObjectGroup size={16} className="text-uiupc-orange" />
         <span className="text-[10px] font-black uppercase tracking-[0.2em]">Compose Studio</span>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all
              ${activeTab === tab.id 
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg' 
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <tab.icon size={12} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div className="pt-2">
        {activeTab === "split" && <SplitterTool />}
        {activeTab === "stitch" && <StitcherTool />}
        {activeTab === "collage" && <CollageTool />}
      </div>
    </div>
  );
};

export default ComposeTool;
