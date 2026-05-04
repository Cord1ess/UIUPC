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
  const pageSize = 12;

  let query = supabase

    .from("exhibition_submissions")
    .select("*", { count: "exact" });

  if (category !== "all") query = query.eq("category", category);
  if (search) {
    query = query.or(`participant_name.ilike.%${search}%,institute.ilike.%${search}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) {
    console.error("Error fetching submissions:", {
      message: error.message,
      hint: error.hint,
      details: error.details,
      code: error.code
    });
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
