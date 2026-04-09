"use client";
import useSWR from "swr";

const fetcher = async ([url, dataType]) => {
  if (!url) return [];
  
  const action = dataType === "membership" ? "getApplications" : "getSubmissions";
  const response = await fetch(`${url}?action=${action}`);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const result = await response.json();
  
  if (result.status === "success" || result.success) {
    const dataArray = result.data || result.submissions || [];
    return dataArray.sort(
      (a, b) =>
        new Date(b.Timestamp || b.timestamp || b["Timestamp"]) -
        new Date(a.Timestamp || a.timestamp || a["Timestamp"])
    );
  } else {
    throw new Error(result.message || "Failed to fetch data");
  }
};

export const useAdminData = (dataType, scriptUrl) => {
  const shouldFetch = dataType === "membership" || dataType === "photos";
  
  const { data, error, isLoading, mutate } = useSWR(
    shouldFetch && scriptUrl ? [scriptUrl, dataType] : null,
    fetcher,
    {
      revalidateOnFocus: false, // Don't fetch every time the tab is focused
      dedupingInterval: 30000,  // Cache data for 30s before re-fetching
    }
  );

  return {
    data: data || [],
    error: error?.message || null,
    isLoading: isLoading,
    refetch: mutate
  };
};
