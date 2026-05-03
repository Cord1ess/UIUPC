import { supabase } from "@/lib/supabase";
import { CommitteeContainer } from "./CommitteeContainer";
import { CommitteeMember } from "@/types/admin";

export default async function CommitteePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 0;
  const search = (params.search as string) || "";
  const year = (params.year as string) || "all";
  const dept = (params.dept as string) || "all";
  const category = (params.category as string) || "all";
  const link = (params.link as string) || "all";
  const sort = (params.sort as string) || "asc";
  const pageSize = 12;

  // 1. Fetch filtered data from Supabase (Server Side)
  let query = supabase
    .from("committees")
    .select("*", { count: "exact" });

  if (year !== "all") query = query.eq("year", year);
  if (dept !== "all") query = query.eq("department", dept);
  
  if (category !== "all") {
    if (category === 'core') query = query.ilike('designation', '%President%').or('designation.ilike.%Secretary%,designation.ilike.%Treasurer%');
    else if (category === 'head') query = query.ilike('designation', '%Head%').not('designation', 'ilike', '%Asst%');
    else if (category === 'asst_head') query = query.ilike('designation', '%Asst. Head%');
    else if (category === 'executive') query = query.eq('designation', 'Executive');
  }

  if (link === 'linked') query = query.not('student_id', 'is', null);
  else if (link === 'unlinked') query = query.is('student_id', null);

  if (search) {
    query = query.or(`member_name.ilike.%${search}%,designation.ilike.%${search}%`);
  }

  const { data, count, error } = await query
    .order("order_index", { ascending: true })
    .order("member_name", { ascending: sort === "asc" })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) {
    console.error("Error fetching committee:", error.message || error);
  }

  // 2. Fetch unique years for the filter dropdown
  const { data: yearData } = await supabase
    .from("committees")
    .select("year")
    .not("year", "is", null);
  
  const availableYears = Array.from(new Set((yearData || []).map(d => d.year))).sort((a, b) => b.localeCompare(a));

  return (
    <CommitteeContainer 
      initialData={(data as CommitteeMember[]) || []}
      totalCount={count || 0}
      currentPage={page}
      searchTerm={search}
      filterYear={year}
      filterDept={dept}
      filterCategory={category}
      filterLink={link}
      sortOrder={sort as "asc" | "desc"}
      availableYears={availableYears}
    />
  );
}
