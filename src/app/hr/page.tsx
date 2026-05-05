import { supabase } from "@/lib/supabase";
import DepartmentView from "@/features/departments/components/DepartmentView";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "HR Department | UIUPC Archive",
  description: "Explore the archive and updates from the Human Resources department of UIU Photography Club.",
};

export default async function HRPage() {
  const { data: posts } = await supabase
    .from("department_posts")
    .select("*")
    .eq("dept_id", "hr")
    .order("created_at", { ascending: false });

  return (
    <DepartmentView 
      deptName="HR" 
      deptLabel="Human Resources Department" 
      posts={posts || []} 
    />
  );
}
