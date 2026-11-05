import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { cors, json } from "../_shared/http.ts";
import { clientInput } from "../_shared/portalValidation.ts";

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: cors });
  if (request.method !== "POST") return json({ error: "Método no permitido" }, 405);
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } });
    const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Inicia sesión como administrador." }, 401);
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user) return json({ error: "Sesión inválida." }, 401);
    const { data: permission, error: permissionError } = await admin.from("administradores").select("user_id").eq("user_id", user.id).maybeSingle();
    if (permissionError || !permission) return json({ error: "Acceso solo para administradores." }, 403);
    let input;
    try { input = clientInput(await request.json()); }
    catch (error) { return json({ error: error instanceof Error ? error.message : "Datos inválidos." }, 400); }
    const { data: existing, error: lookupError } = await admin.from("clientes").select("id").eq("rfc", input.rfc).maybeSingle();
    if (lookupError) return json({ error: "Falta configurar la base del portal." }, 500);
    if (existing) return json({ error: "Ya existe un cliente con ese RFC." }, 409);
    const { data, error: createError } = await admin.auth.admin.createUser({ email: input.email, password: input.password, email_confirm: true });
    if (createError || !data.user) return json({ error: "No se pudo crear la cuenta. Comprueba si el correo ya está registrado y la política de contraseñas." }, 409);
    const { error: profileError } = await admin.from("clientes").insert({ id: data.user.id, rfc: input.rfc, nombre: input.nombre, email: input.email });
    if (profileError) {
      const { error: cleanupError } = await admin.auth.admin.deleteUser(data.user.id);
      return json({ error: cleanupError ? "No se completó el alta. Revisa en Authentication la cuenta recién creada antes de reintentar." : "No se pudo guardar el cliente. No se creó el acceso; vuelve a intentar." }, 500);
    }
    return json({ id: data.user.id });
  } catch { return json({ error: "No se pudo completar el alta. Intenta de nuevo." }, 500); }
});
