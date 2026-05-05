import { supabase } from "@/lib/supabase";
import AchievementsView from "@/features/achievements/components/AchievementsView";

export const metadata = {
  title: "Achievements | The UIUPC Legacy",
  description: "Explore the chronological journey of awards, recognition, and milestones of the UIU Photography Club.",
};

export const revalidate = 3600; // 1 hour ISR

export default async function AchievementsPage() {
  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .order("created_at", { ascending: false });

  return <AchievementsView achievements={achievements || []} />;
}
