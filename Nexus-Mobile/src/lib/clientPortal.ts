import { supabase } from "./supabase";

export interface ClientProfile { id: string; rfc: string; nombre: string; email: string; active: boolean; }
export const portalSections = {
  lineas: { table: "cliente_lineas", label: "Mis líneas" },
  adendas: { table: "cliente_adendas", label: "Mis adendas" },
  tramites: { table: "cliente_tramites", label: "Mis trámites" },
} as const;
export type PortalSection = keyof typeof portalSections;
export interface ClientRecord {
  id: string; cliente_id: string; numero?: string; plan?: string; titulo?: string;
  estado: string; fecha?: string | null; notas: string;
}

export async function portalFunction(name: string, body: Record<string, unknown>) {
  if (!supabase) throw new Error("Falta configurar la conexión.");
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (error) {
    let message = "No se pudo conectar con el portal. Comprueba que las funciones estén publicadas.";
    try { const details = await error.context?.json(); if (details?.error) message = details.error; } catch { /* Error sin respuesta JSON. */ }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function loadClientRecords(section: PortalSection, clientId: string, signal?: AbortSignal): Promise<ClientRecord[]> {
  if (!supabase) throw new Error("Sin conexión");
  const rows: ClientRecord[] = [];
  for (let offset = 0; ; offset += 500) {
    let query = supabase.from(portalSections[section].table).select("*").eq("cliente_id", clientId)
      .order("created_at", { ascending: false }).order("id").range(offset, offset + 499);
    if (signal) query = query.abortSignal(signal);
    const { data, error } = await query;
    if (error) throw error;
    rows.push(...(data ?? []) as ClientRecord[]);
    if (!data || data.length < 500) break;
  }
  return rows;
}
