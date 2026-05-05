import { createClient } from "@/lib/supabaseServer";
import { MembersContainer } from "./MembersContainer";
import { Member } from "@/types/admin";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const page = Number(params.page) || 0;
  const search = (params.search as string) || "";
  const status = (params.status as string) || "all";
  const dept = (params.dept as string) || "all";
  const year = (params.year as string) || "all";
  const sort = (params.sort as string) || "desc";
  const pageSize = 12;

  // 1. Fetch unique sessions (years) for the filter dropdown
  const { data: sessionData } = await supabase
    .from("members")
    .select("session")
    .not("session", "is", null);
  
  const availableYears = Array.from(new Set((sessionData || []).map(d => d.session))).sort((a, b) => b.localeCompare(a));

  // 2. Fetch filtered data from Supabase (Server Side)
  let query = supabase
    .from("members")
    .select("*", { count: "exact" });

  if (status !== "all") query = query.eq("status", status);
  if (dept !== "all") query = query.eq("department", dept);
  if (year !== "all") query = query.eq("session", year);
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,student_id.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: sort === "asc" })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) {
    console.error("Error fetching members:", error);
  }

  // 3. Fetch unique departments for the filter dropdown
  const { data: deptData } = await supabase
    .from("members")
    .select("department")
    .not("department", "is", null);
  
  const departments = Array.from(new Set((deptData || []).map(d => d.department))).sort();

  return (
    <MembersContainer 
      initialData={(data as Member[]) || []}
      totalCount={count || 0}
      currentPage={page}
      searchTerm={search}
      filterStatus={status}
      filterDept={dept}
      filterYear={year}
      sortOrder={sort as "asc" | "desc"}
      departments={departments}
      availableYears={availableYears}
    />
  );
}
