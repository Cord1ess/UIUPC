import { createClient } from "@/lib/supabaseServer";
import { SubmissionsContainer } from "./SubmissionsContainer";
import { ExhibitionSubmission } from "@/types/admin";

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const page = Number(params.page) || 0;
  const search = (params.search as string) || "";
  const category = (params.category as string) || "all";
  const status = (params.status as string) || "all";
  const payment = (params.payment as string) || "all";
  const pageSize = 12;

  let query = supabase

    .from("exhibition_submissions")
    .select("*", { count: "exact" });

  if (category !== "all") query = query.eq("category", category);
  if (status !== "all") query = query.eq("status", status);
  if (payment !== "all") query = query.eq("payment_status", payment);

  if (search) {
    query = query.or(`participant_name.ilike.%${search}%,institute.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, count, error } = await query
    .order("submitted_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) {
    console.error("Error fetching submissions:", JSON.stringify(error, null, 2));
  }

  return (
    <SubmissionsContainer 
      initialData={(data as ExhibitionSubmission[]) || []}
      totalCount={count || 0}
      currentPage={page}
      searchTerm={search}
      filterCategory={category}
    />
  );
}
