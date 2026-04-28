import AchievementTimeline from "@/features/achievements/components/AchievementTimeline";
import ScrollRevealText from "@/components/motion/ScrollRevealText";

export const metadata = {
  title: "Achievements | UIUPC",
  description: "A chronological journey through the awards, recognition, and milestones of the UIU Photography Club.",
};

export default function AchievementsPage() {
  return (
    <main className="min-h-screen bg-[#f9f5ea] dark:bg-[#121212] transition-colors duration-500 pt-32 pb-20 px-6 overflow-x-hidden relative">
      {/* Background Decor (Architecture Rule 3) */}
      <div className="absolute inset-0 bg-grid-giant opacity-[0.4] dark:opacity-[0.1] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-32">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] w-12 bg-uiupc-orange" />
            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500">The Awards Hall</span>
            <div className="h-[1px] w-12 bg-uiupc-orange" />
          </div>
          
          <ScrollRevealText 
            text="Excellence Over Time"
            as="h1"
            className="text-6xl md:text-[10rem] font-black text-zinc-900 dark:text-white mb-8 uppercase tracking-tighter leading-[0.85]"
          />
          
          <p className="max-w-2xl text-zinc-600 dark:text-zinc-400 text-sm md:text-lg font-medium leading-relaxed font-sans">
            Capturing prestige in every frame. From local recognitions to international 
            milestones, this is our chronological story of visual impact and community growth.
          </p>
        </div>

        {/* Timeline Visualization */}
        <AchievementTimeline />
      </div>
    </main>
  );
}
