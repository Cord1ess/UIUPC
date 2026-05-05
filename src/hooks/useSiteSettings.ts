import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('admin_settings')
        .select('key, value');

      if (fetchError) throw fetchError;

      const settingsMap = (data || []).reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);

      setSettings(settingsMap);
    } catch (err: any) {
      console.error("Error fetching site settings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const getSettingBool = (key: string, defaultValue: boolean = true) => {
    if (settings[key] === undefined) return defaultValue;
    return settings[key] === 'true';
  };

  return { settings, loading, error, getSettingBool, refetch: fetchSettings };
};
