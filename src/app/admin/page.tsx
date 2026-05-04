import { createClient } from "@/lib/supabaseServer";
import { OverviewContainer } from "./OverviewContainer";
import { Member, ExhibitionSubmission } from "@/types/admin";

export default async function AdminPage() {
  const supabase = await createClient();

  // Fetch key metrics on the server for instant dashboard load
  const [
    { data: members },
    { data: photos },
    { count: eventsCount },
    { data: auditLogs }
  ] = await Promise.all([
    supabase.from("members").select("*"),
    supabase.from("exhibition_submissions").select("*"),
    supabase.from("events").select("*", { count: "exact", head: true }),
    supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(10)
  ]);


  return (
    <OverviewContainer 
      members={(members as Member[]) || []}
      submissions={(photos as ExhibitionSubmission[]) || []}
      eventsCount={eventsCount || 0}
      auditLogs={auditLogs || []}
    />
  );
}
