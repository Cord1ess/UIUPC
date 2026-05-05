import { supabase } from "@/lib/supabase";
import DepartmentView from "@/features/departments/components/DepartmentView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PR Department | UIUPC Archive",
  description: "Explore the archive and updates from the Public Relations department of UIU Photography Club.",
};

export default async function PRPage() {
  const { data: posts } = await supabase
    .from("department_posts")
    .select("*")
    .eq("dept_id", "pr")
    .order("created_at", { ascending: false });

  return (
    <DepartmentView 
      deptName="PR" 
      deptLabel="Public Relations Department" 
      posts={posts || []} 
    />
  );
}
