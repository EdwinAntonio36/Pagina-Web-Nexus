import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import { cors, json } from "../_shared/http.ts";
import { normalizeRfc, validRfc } from "../_shared/portalValidation.ts";

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: cors });
  if (request.method !== "POST") return json({ error: "Método no permitido." }, 405);
  try {
    const input = await request.json();
    const rfc = normalizeRfc(input.rfc);
    if (!validRfc(rfc) || !["login", "recover"].includes(input.action)) return json({ error: "Revisa el RFC ingresado." }, 400);
    const password = typeof input.password === "string" ? input.password : "";
    if (input.action === "login" && (!password || password.length > 128)) return json({ error: "Revisa el RFC y la contraseña." }, 400);
    const url = Deno.env.get("SUPABASE_URL")!;
    const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
    // No exponer el correo ni el directorio de RFC a usuarios sin sesión.
    const hash = async (text: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret + text))))
      .map((byte) => byte.toString(16).padStart(2, "0")).join("");
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    for (const [key, max] of [[`ip:${ip}`, 60], [`rfc:${rfc}`, 10]] as const) {
      const { data: admitted, error } = await admin.rpc("portal_admitir_intento", { p_clave: await hash(`${input.action}:${key}`), p_max: max, p_segundos: 900 });
      if (error) return json({ error: "El acceso no está disponible. Contacta a tu asesor." }, 503);
      if (!admitted) return json({ error: "Demasiados intentos. Espera 15 minutos antes de volver a intentar." }, 429);
    }
    const { data: profile, error: profileError } = await admin.from("clientes").select("id,email,active").eq("rfc", rfc).maybeSingle();
    if (profileError) return json({ error: "El portal no está disponible en este momento." }, 503);
    const auth = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });
    if (input.action === "recover") {
      const site = Deno.env.get("PORTAL_SITE_URL");
      if (!site) return json({ error: "La recuperación no está configurada. Contacta a tu asesor." }, 503);
      if (profile?.active) await auth.auth.resetPasswordForEmail(profile.email, { redirectTo: `${site.replace(/\/$/, "")}/clientes/recuperar` });
      return json({ message: "Si el RFC tiene un acceso activo, recibirás instrucciones en el correo registrado. Si no llegan, contacta a tu asesor." });
    }
    // También ejecutar Auth para RFC desconocidos: misma respuesta ante credenciales inválidas.
    const { data, error: loginError } = await auth.auth.signInWithPassword({ email: profile?.active ? profile.email : "sin-acceso@invalid.example", password });
    if (loginError || !data.session || !profile?.active || data.user?.id !== profile.id) return json({ error: "RFC o contraseña incorrectos, o acceso desactivado. Contacta a tu asesor si necesitas ayuda." }, 401);
    return json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token });
  } catch { return json({ error: "No se pudo completar la solicitud. Intenta de nuevo." }, 500); }
});
