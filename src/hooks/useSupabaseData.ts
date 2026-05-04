"use client";
import useSWR, { SWRConfiguration } from "swr";
import { supabase } from "@/lib/supabase";

interface SupabaseDataOptions {
  limit?: number;
  orderBy?: string;
  orderDesc?: boolean;
  enabled?: boolean;
  filters?: Record<string, string | number | boolean | string[] | number[] | null>;
  search?: { columns: string[]; term: string };
  page?: number;
  pageSize?: number;
  countOnly?: boolean;
}

interface FetcherResult<T> {
  data: T[];
  count: number | null;
}

/**
 * Enhanced fetcher with built-in retry logic (exponential backoff)
 */
const fetcherWithRetry = async <T>(
  [table, optionsStr]: [string, string], 
  retryCount = 0
): Promise<FetcherResult<T>> => {
  const options: SupabaseDataOptions = JSON.parse(optionsStr);
  try {
    let query = supabase
      .from(table)
      .select("*", { count: options.countOnly ? 'exact' : 'exact', head: options.countOnly });

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

    if (options.search && options.search.term.trim()) {
      const searchFilter = options.search.columns
        .map(col => `${col}.ilike.%${options.search!.term.trim()}%`)
        .join(',');
      query = query.or(searchFilter);
    }

    const orderBy = options.orderBy || (table === 'exhibition_submissions' ? 'submitted_at' : 'created_at');
    query = query.order(orderBy, { ascending: !options.orderDesc });

    if (options.page !== undefined && options.pageSize !== undefined) {
      const from = options.page * options.pageSize;
      const to = from + options.pageSize - 1;
      query = query.range(from, to);
    } else if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error, count } = await query;

    if (error) {
      // Handle transient errors or network failures
      const status = (error as any).status;
      if ((status && status >= 500) || error.message.includes("fetch")) {
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetcherWithRetry([table, optionsStr], retryCount + 1);
        }
      }
      throw error;
    }

    return {
      data: (data as T[]) || [],
      count: count
    };
  } catch (error: any) {
    console.error(`[Supabase Error] ${table}:`, error.message);
    throw error;
  }
};

const EMPTY_ARRAY: any[] = [];

/**
 * Generic hook to fetch data from Supabase tables with SWR caching.
 * Enhanced with automatic retries and network-aware revalidation.
 */
export const useSupabaseData = <T = any>(
  table: string, 
  options: SupabaseDataOptions = { orderDesc: true },
  swrConfig: SWRConfiguration = {}
) => {
  const isEnabled = options.enabled !== false;
  
  const { data: result, error, isLoading, isValidating, mutate } = useSWR<FetcherResult<T>>(
    (table && isEnabled) ? [table, JSON.stringify(options)] : null,
    fetcherWithRetry,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      dedupingInterval: 2000, // Dedup requests within 2 seconds
      ...swrConfig
    }
  );

  return {
    data: result?.data || EMPTY_ARRAY,
    count: result?.count ?? 0,
    error: (error as Error)?.message || null,
    isLoading,
    isRefreshing: isValidating,
    refetch: mutate
  };
};
