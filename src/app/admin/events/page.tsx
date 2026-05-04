import { createClient } from "@/lib/supabaseServer";
import EventsContainer from "./EventsContainer";

export const metadata = {
  title: "Events Management | Admin Dashboard",
};

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();

  const params = await searchParams;
  const status = params.status as string || "all";
  const category = params.category as string || "all";
  const search = params.search as string || "";
  const page = parseInt(params.page as string || "0");
  const pageSize = 12;

  // 1. Fetch Events with filtering
  let query = supabase

    .from("events")
    .select("*", { count: "exact" });

  if (status !== "all") {
    query = query.eq("status", status);
  }

  if (category !== "all") {
    query = query.eq("event_type", category);
  }

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, count, error } = await query
    .order("date", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) {
    console.error("Error fetching events:", error);
  }

  return (
    <EventsContainer 
      initialData={data || []} 
      count={count || 0} 
    />
  );
}
