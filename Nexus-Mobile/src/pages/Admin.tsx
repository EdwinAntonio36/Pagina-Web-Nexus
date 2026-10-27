import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import "./Admin.css";
import AdminCatalog from "../components/AdminCatalog";
import AdminCarousel from "../components/AdminCarousel";

const estados = ["pendiente", "contactada", "atendida", "cancelada"] as const;
type Estado = typeof estados[number];
interface Cotizacion {
  id: string;
  created_at: string;
  nombre: string;
  telefono: string;
  email: string;
  interes: string;
  mensaje: string | null;
  producto_nombre: string | null;
  capacidad: string | null;
  color: string | null;
  tipo_sim: string | null;
  estado: Estado;
}
const PAGE_SIZE = 20;

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [access, setAccess] = useState<"checking" | "allowed" | "denied">("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<Cotizacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState("");
  const [total, setTotal] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [section, setSection] = useState<"quotes" | "catalog" | "carousel">("quotes");
  const [catalogEditing, setCatalogEditing] = useState(false);
  const [catalogBusy, setCatalogBusy] = useState(false);
  const userId = session?.user.id;

  useEffect(() => {
    if (!supabase) return;
    // INITIAL_SESSION restores the existing login; subsequent events track logout/expiry.
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!supabase || !userId) return;
    setAccess("checking");
    setRows([]);
    setPage(0);
    setError("");
    void (async () => {
      const { data, error: permissionError } = await supabase!.from("administradores")
        .select("user_id").eq("user_id", userId).maybeSingle();
      if (cancelled) return;
      setAccess(data && !permissionError ? "allowed" : "denied");
      if (permissionError) setError("No se pudieron verificar los permisos. Revisa la configuración de Supabase.");
    })();
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    if (!supabase || !userId || access !== "allowed" || section !== "quotes") return;
    let cancelled = false;
    setLoading(true);
    setRows([]);
    setError("");
    void (async () => {
      let query = supabase!.from("cotizaciones").select("*", { count: "exact" });
      if (filter) query = query.eq("estado", filter);
      const { data, error: queryError, count } = await query
        .order("created_at", { ascending: false }).order("id")
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
      if (cancelled) return;
      if (queryError) setError("No se pudieron cargar las cotizaciones. Intenta actualizar.");
      else { setRows((data ?? []) as Cotizacion[]); setTotal(count ?? 0); }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [userId, access, page, filter, refresh, section]);

  async function login(event: FormEvent) {
    event.preventDefault();
    if (!supabase || busy) return;
    setBusy(true);
    setError("");
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (loginError) setError("No se pudo iniciar sesión. Revisa tus credenciales y la confirmación de tu correo.");
      else setPassword("");
    } catch { setError("No se pudo conectar. Intenta de nuevo."); }
    finally { setBusy(false); }
  }

  async function logout() {
    if (!supabase) return;
    if (catalogEditing && !window.confirm("¿Cerrar sesión y descartar los cambios sin guardar?")) return;
    setBusy(true);
    const { error: logoutError } = await supabase.auth.signOut({ scope: "local" });
    if (logoutError) setError("No se pudo cerrar la sesión. Intenta de nuevo.");
    else { setRows([]); setAccess("checking"); setError(""); }
    setBusy(false);
  }

  async function updateStatus(id: string, estado: Estado) {
    if (!supabase || saving) return;
    setSaving(id);
    setError("");
    try {
      const { data, error: updateError } = await supabase.from("cotizaciones")
        .update({ estado }).eq("id", id).select("id").maybeSingle();
      if (updateError || !data) throw new Error("No se actualizó la solicitud");
      setRefresh((value) => value + 1);
    } catch { setError("No se pudo guardar el estado. Actualiza e intenta de nuevo."); }
    finally { setSaving(null); }
  }

  if (!supabase) return <section className="wrap admin-page"><h1>Administración</h1><p>Falta configurar Supabase.</p></section>;
  if (!ready) return <section className="wrap admin-page"><p>Cargando sesión…</p></section>;

  return <section className="wrap admin-page">
    <div className="admin-heading"><div><div className="kicker">Nexus Mobile</div><h1>Administración</h1></div>
      {session && <button className="btn btn-line" disabled={busy || catalogBusy} onClick={() => void logout()}>Cerrar sesión</button>}
    </div>
    {error && <p className="admin-error" role="alert">{error}</p>}
    {!session ? <form className="admin-login" onSubmit={login}>
      <h2>Iniciar sesión</h2>
      <div className="field"><label htmlFor="admin-email">Correo electrónico</label>
        <input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="field"><label htmlFor="admin-password">Contraseña</label>
        <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      <button className="btn btn-solid" disabled={busy}>{busy ? "Ingresando…" : "Entrar"}</button>
    </form> : access === "checking" ? <p>Verificando permisos…</p>
      : access === "denied" ? <p>Tu cuenta no tiene acceso al panel. Comprueba que se haya asignado el permiso de administrador en Supabase.</p>
      : <>
        <nav className="admin-toolbar" aria-label="Secciones de administración">
          <button disabled={catalogBusy} className={`btn ${section === "quotes" ? "btn-solid" : "btn-line"}`} aria-pressed={section === "quotes"} onClick={() => {
            if (catalogEditing && !window.confirm("¿Descartar los cambios sin guardar y abrir cotizaciones?")) return;
            setCatalogEditing(false); setSection("quotes");
          }}>Cotizaciones</button>
          <button disabled={catalogBusy} className={`btn ${section === "catalog" ? "btn-solid" : "btn-line"}`} aria-pressed={section === "catalog"} onClick={() => {
            if (section === "catalog") return;
            if (catalogEditing && !window.confirm("¿Descartar los cambios sin guardar y abrir catálogo?")) return;
            setCatalogEditing(false); setSection("catalog");
          }}>Catálogo</button>
          <button disabled={catalogBusy} className={`btn ${section === "carousel" ? "btn-solid" : "btn-line"}`} aria-pressed={section === "carousel"} onClick={() => {
            if (section === "carousel") return;
            if (catalogEditing && !window.confirm("¿Descartar los cambios sin guardar y abrir carrusel?")) return;
            setCatalogEditing(false); setSection("carousel");
          }}>Carrusel de inicio</button>
        </nav>
        {section === "catalog" ? <AdminCatalog key={userId} onEditingChange={setCatalogEditing} onBusyChange={setCatalogBusy} /> : section === "carousel" ? <AdminCarousel key={userId} onEditingChange={setCatalogEditing} onBusyChange={setCatalogBusy} /> : <>
        <div className="admin-toolbar"><label htmlFor="admin-filter">Estado</label>
          <select id="admin-filter" value={filter} disabled={saving !== null} onChange={(e) => { setFilter(e.target.value); setPage(0); }}>
            <option value="">Todos</option>{estados.map((estado) => <option key={estado}>{estado}</option>)}
          </select>
          <button className="btn btn-line" disabled={loading || saving !== null} onClick={() => setRefresh((value) => value + 1)}>Actualizar</button>
          <span>{total} solicitudes</span>
        </div>
        {loading ? <p role="status">Cargando cotizaciones…</p> : rows.length === 0 ? <p>No hay solicitudes para mostrar.</p> :
          <div className="admin-list">{rows.map((row) => <article className="admin-card" key={row.id}>
            <div className="admin-heading"><div><h2>{row.nombre}</h2><time dateTime={row.created_at}>{new Date(row.created_at).toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}</time></div>
              <div><label htmlFor={`estado-${row.id}`}>Estado </label><select id={`estado-${row.id}`} value={row.estado} disabled={saving !== null} onChange={(e) => void updateStatus(row.id, e.target.value as Estado)}>
                {estados.map((estado) => <option key={estado}>{estado}</option>)}
              </select></div>
            </div>
            <dl><dt>Teléfono</dt><dd>{row.telefono}</dd><dt>Correo</dt><dd>{row.email}</dd><dt>Interés</dt><dd>{row.interes}</dd>
              {row.producto_nombre && <><dt>Equipo</dt><dd>{row.producto_nombre}</dd></>}
              {row.capacidad && <><dt>Capacidad</dt><dd>{row.capacidad}</dd></>}
              {row.color && <><dt>Color</dt><dd>{row.color}</dd></>}
              {row.tipo_sim && <><dt>SIM</dt><dd>{row.tipo_sim}</dd></>}
            </dl>
            {row.mensaje && <div className="admin-message"><b>Mensaje</b><p>{row.mensaje}</p></div>}
            {saving === row.id && <p role="status">Guardando…</p>}
          </article>)}</div>}
        <div className="admin-toolbar">
          <button className="btn btn-line" disabled={page === 0 || loading || saving !== null} onClick={() => setPage((value) => value - 1)}>Anterior</button>
          <span>Página {page + 1}</span>
          <button className="btn btn-line" disabled={(page + 1) * PAGE_SIZE >= total || loading || saving !== null} onClick={() => setPage((value) => value + 1)}>Siguiente</button>
        </div>
      </>}
      </>}
  </section>;
}
