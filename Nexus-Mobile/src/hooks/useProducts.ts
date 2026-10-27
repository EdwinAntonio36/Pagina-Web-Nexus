import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Product } from "../data/products";

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export function useProducts(): UseProductsResult {
  const [result, setResult] = useState<UseProductsResult>({ products: [], loading: true, error: null });
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20000);
    void (async () => {
      try {
        if (!supabase) throw new Error("Supabase no está configurado");
        const products: Product[] = [];
        const batchSize = 500;
        for (let offset = 0; ; offset += batchSize) {
          const { data, error } = await supabase.from("productos")
            .select("id,brand,model,name,tag,description,price,oldPrice,monthlyPayment,image,gallery,capacities,colors,simTypes,specs")
            .eq("active", true).order("sort_order").order("id")
            .range(offset, offset + batchSize - 1).abortSignal(controller.signal);
          if (error) throw error;
          products.push(...(data ?? []) as Product[]);
          if (!data || data.length < batchSize) break;
        }
        if (!cancelled) setResult({ products, loading: false, error: null });
      } catch {
        if (!cancelled) setResult({ products: [], loading: false,
          error: "No pudimos cargar el catálogo. Intenta recargar la página en unos momentos." });
      } finally { window.clearTimeout(timeout); }
    })();
    return () => { cancelled = true; controller.abort(); window.clearTimeout(timeout); };
  }, []);
  return result;
}
