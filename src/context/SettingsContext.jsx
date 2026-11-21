import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { SITE } from "../data/site";
import { isValidSchedule } from "../utils/hours";

const SettingsContext = createContext(null);

const DEFAULTS = {
  whatsappNumber: SITE.whatsappNumber,
  businessHours: SITE.businessHours,
};

// Configuración editable desde el admin (tabla "settings", fila id = 1).
// Si la tabla no existe o está vacía, se usan los valores de data/site.js.
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    const { data, error } = await supabase
      .from("settings")
      .select("whatsapp_number, business_hours")
      .eq("id", 1)
      .maybeSingle();
    if (!error && data) {
      setSettings({
        whatsappNumber: data.whatsapp_number || DEFAULTS.whatsappNumber,
        businessHours: isValidSchedule(data.business_hours) ? data.business_hours : null,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <SettingsContext.Provider value={{ ...settings, loading, refetch }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings debe usarse dentro de <SettingsProvider>");
  return ctx;
}
