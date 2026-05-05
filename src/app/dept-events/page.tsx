import { supabase } from "@/lib/supabase";
import DepartmentView from "@/features/departments/components/DepartmentView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Events Department | UIUPC Archive",
  description: "Explore the internal archive and updates from the Events Management department of UIU Photography Club.",
};

export default async function EventsDeptPage() {
  const { data: posts } = await supabase
    .from("department_posts")
    .select("*")
    .eq("dept_id", "events")
    .order("created_at", { ascending: false });

  return (
    <DepartmentView 
      deptName="Events Dept" 
      deptLabel="Event Management Department" 
      posts={posts || []} 
    />
  );
}
