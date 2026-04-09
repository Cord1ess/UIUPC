import { useState, useEffect } from "react";

/**
 * Custom hook to check the status of a submission form (enabled/disabled)
 * @param {string} scriptUrl - The GAS URL for the specific submission type
 * @param {string} actionName - The action name to send as a query parameter (e.g., "getJoinPageStatus")
 * @returns {Object} { status, loading, error, refetch }
 */
export const useSubmissionStatus = (scriptUrl, actionName) => {
  const [status, setStatus] = useState("enabled");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    if (!scriptUrl) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${scriptUrl}?action=${actionName}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Handle multiple possible response structures
      if (result.status === "success" && result.data) {
        // Format: { status: "success", data: { status: "enabled" } }
        setStatus(result.data.status || (result.data.enabled !== false ? "enabled" : "disabled"));
      } else if (result.success !== undefined) {
        // Format: { success: true, enabled: true }
        setStatus(result.enabled !== false ? "enabled" : "disabled");
      } else {
        throw new Error(result.message || "Invalid status format");
      }
    } catch (err) {
      console.error(`Error fetching submission status for ${actionName}:`, err);
      setError(err.message);
      // Default to enabled if fetch fails, to avoid locking users out unexpectedly
      setStatus("enabled");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [scriptUrl, actionName]);

  return { status, loading, error, refetch: fetchStatus };
};
