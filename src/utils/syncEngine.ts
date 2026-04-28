// src/utils/syncEngine.ts

/**
 * UIUPC Sync Engine (Website -> Sheets)
 * 
 * This utility handles the automatic synchronization of website actions 
 * to the Master Google Spreadsheet via the Unified GAS Web App.
 */

const GAS_URL = process.env.NEXT_PUBLIC_GAS_MASTER;
const SYNC_SECRET = process.env.SYNC_SECRET || "uiupc_sync_secure_2026";

export const syncToSheets = async (target_table: string, action: string, data: any) => {
  if (!GAS_URL) {
    console.warn("Sync Engine: NEXT_PUBLIC_GAS_MASTER is not defined. Skipping Sheets sync.");
    return;
  }

  try {
    // We use a background fetch to not block the UI
    fetch(GAS_URL, {
      method: "POST",
      mode: "no-cors", // Required for Google Apps Script Web Apps without complex preflight
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        secret: SYNC_SECRET,
        table: target_table,
        action: action,
        data: data,
        timestamp: new Date().toISOString(),
        source: 'website_admin'
      }),
    }).catch(err => console.error("Sync Engine Background Error:", err));

    return { success: true };
  } catch (error) {
    console.error("Sync Engine Execution Error:", error);
    return { success: false, error };
  }
};
