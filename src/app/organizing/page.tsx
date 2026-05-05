import { supabase } from "@/lib/supabase";
import DepartmentView from "@/features/departments/components/DepartmentView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organizing Department | UIUPC Archive",
  description: "Explore the archive and updates from the Organizing department of UIU Photography Club.",
};

export default async function OrganizingPage() {
  const { data: posts } = await supabase
    .from("department_posts")
    .select("*")
    .eq("dept_id", "organizing")
    .order("created_at", { ascending: false });

  return (
    <DepartmentView 
      deptName="Organizing" 
      deptLabel="Organizing Department" 
      posts={posts || []} 
    />
  );
}
