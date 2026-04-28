"use client";
import useSWR from "swr";
import { supabase } from "@/lib/supabase";

interface SupabaseDataOptions {
  limit?: number;
  orderBy?: string;
  orderDesc?: boolean;
  enabled?: boolean;
  filters?: Record<string, any>;
  page?: number;
  pageSize?: number;
  countOnly?: boolean;
}

interface FetcherResult {
  data: any[];
  count: number | null;
}

const fetcher = async ([table, options]: [string, SupabaseDataOptions]): Promise<FetcherResult> => {
  let query = supabase
    .from(table)
    .select("*", { count: options.countOnly ? 'exact' : 'exact', head: options.countOnly });

  // Apply filters if provided
  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }
    });
  }

  // Ordering logic: 
  // 1. Use options.orderBy if explicitly provided
  // 2. Fallback to 'submitted_at' for exhibition_submissions
  // 3. Default to 'created_at' for all other tables
  const orderBy = options.orderBy || (table === 'exhibition_submissions' ? 'submitted_at' : 'created_at');
  query = query.order(orderBy, { ascending: !options.orderDesc });

  // Pagination / Range
  if (options.page !== undefined && options.pageSize !== undefined) {
    const from = options.page * options.pageSize;
    const to = from + options.pageSize - 1;
    query = query.range(from, to);
  } else if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error(`Supabase fetch failed for ${table}:`, error.message, error.details, error.hint);
    throw error;
  }

  return {
    data: data || [],
    count: count
  };
};

export const useSupabaseData = (table: string, options: SupabaseDataOptions = { orderDesc: true }) => {
  const isEnabled = options.enabled !== false;
  
  const { data: result, error, isLoading, isValidating, mutate } = useSWR(
    (table && isEnabled) ? [table, options] : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 0,
    }
  );

  return {
    data: result?.data || [],
    count: result?.count ?? 0,
    error: error?.message || null,
    isLoading,
    isRefreshing: isValidating,
    refetch: mutate
  };
};
