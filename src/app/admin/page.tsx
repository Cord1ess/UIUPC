import { createClient } from "@/lib/supabaseServer";
import { OverviewContainer } from "./OverviewContainer";
import { Member, ExhibitionSubmission } from "@/types/admin";

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { data: members },
    { data: photos },
    { count: eventsCount },
    { count: galleryCount },
    { count: blogCount },
    { data: auditLogs },
    { data: siteSettings }
  ] = await Promise.all([
    supabase.from("members").select("*"),
    supabase.from("exhibition_submissions").select("*"),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("gallery").select("*", { count: "exact", head: true }),
    supabase.from("blog_posts").select("*", { count: "exact", head: true }),
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(15),
    supabase.from("admin_settings").select("*")
  ]);

  // Parse site settings into a key-value map
  const settingsMap: Record<string, string> = {};
  if (Array.isArray(siteSettings)) {
    siteSettings.forEach((s: any) => {
      if (s.key && s.key !== 'admin_password') settingsMap[s.key] = s.value;
    });
  }

  return (
    <OverviewContainer 
      members={(members as Member[]) || []}
      submissions={(photos as ExhibitionSubmission[]) || []}
      eventsCount={eventsCount || 0}
      galleryCount={galleryCount || 0}
      blogCount={blogCount || 0}
      auditLogs={auditLogs || []}
      siteSettings={settingsMap}
    />
  );
}
