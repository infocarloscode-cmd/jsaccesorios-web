import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    // Límite de 15 s: si Supabase no responde (por ejemplo, proyecto pausado)
    // se muestra el error en vez de quedarse en "Cargando..." para siempre.
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: true })
      .abortSignal(AbortSignal.timeout(15000));

    if (error) {
      setError(error);
    } else {
      // Postgres devuelve las columnas "numeric" como texto (para no perder
      // precisión), así que hay que convertir price a number aquí una sola vez.
      setProducts(data.map((p) => ({ ...p, price: Number(p.price) })));
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { products, loading, error, refetch };
}
