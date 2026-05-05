import { supabase } from "@/lib/supabase";
import PortfolioDetail from "@/features/departments/components/PortfolioDetail";
import { notFound } from "next/navigation";

export default async function DesignPortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. Fetch the member profile
  const { data: person } = await supabase
    .from("portfolios")
    .select("*")
    .eq("slug", slug)
    .eq("team_id", "design")
    .single();

  if (!person) {
    notFound();
  }

  // 2. Fetch the member's work gallery
  const { data: works } = await supabase
    .from("portfolio_works")
    .select("*")
    .eq("portfolio_id", person.id)
    .order("created_at", { ascending: false });

  return (
    <PortfolioDetail 
      person={person} 
      works={works || []} 
      teamType="design" 
    />
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: person } = await supabase
    .from("portfolios")
    .select("full_name, bio")
    .eq("slug", slug)
    .single();

  if (!person) return { title: "Portfolio Not Found" };

  return {
    title: `${person.full_name} | Design Team Portfolio | UIUPC`,
    description: person.bio || `View the design work of ${person.full_name} for UIU Photography Club.`,
  };
}
