import { useEffect, useState, type FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import "./Admin.css";
import AdminCatalog from "../components/AdminCatalog";
import AdminCarousel from "../components/AdminCarousel";
import AdminClients from "../components/AdminClients";
import { Link } from "react-router-dom";

const adminSections = [
  { key: "quotes", label: "Cotizaciones", detail: "Solicitudes y seguimiento", path: "M4 4h16v16H4z M8 8h8 M8 12h8 M8 16h4" },
  { key: "catalog", label: "Catálogo", detail: "Productos, precios e imágenes", path: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z" },
  { key: "carousel", label: "Carrusel de inicio", detail: "Imágenes de la portada", path: "M3 5h18v14H3z M3 16l6-6 5 5 3-3 4 4 M16 9h.01" },
  { key: "clients", label: "Clientes", detail: "Accesos, líneas y trámites", path: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M22 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" },
] as const;

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
  const [section, setSection] = useState<"quotes" | "catalog" | "carousel" | "clients">("quotes");
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
    <div className="admin-heading admin-topbar"><div><div className="kicker">Nexus Mobile / Panel de control</div><h1>Administración</h1><p>Gestiona las solicitudes, los productos y los clientes.</p></div>
      {session && <div className="admin-account"><span>{session.user.email}</span><button className="btn btn-line" disabled={busy || catalogBusy} onClick={() => void logout()}>Cerrar sesión</button></div>}
    </div>
    {error && <p className="admin-error" role="alert">{error}</p>}
    {!session ? <form className="admin-login" onSubmit={login}>
      <div className="admin-login-mark" aria-hidden="true">N</div>
      <h2>Bienvenido de nuevo</h2><p className="admin-login-subtitle">Ingresa para administrar Nexus Mobile.</p>
      <div className="field"><label htmlFor="admin-email">Correo electrónico</label>
        <input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
      <div className="field"><label htmlFor="admin-password">Contraseña</label>
        <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
      <button className="btn btn-solid" disabled={busy}>{busy ? "Ingresando…" : "Entrar"}</button>
    </form> : access === "checking" ? <p>Verificando permisos…</p>
      : access === "denied" ? <p>Tu cuenta no tiene acceso al panel. Comprueba que se haya asignado el permiso de administrador en Supabase.</p>
      : <div className="admin-layout">
        <nav className="admin-menu" aria-label="Secciones de administración">
          <span className="admin-menu-caption">Administrar</span>
          {adminSections.map((item) => <button key={item.key} disabled={catalogBusy} className={`admin-menu-item ${section === item.key ? "is-active" : ""}`}
            aria-pressed={section === item.key} onClick={() => {
              if (section === item.key) return;
              if (catalogEditing && !window.confirm("¿Descartar los cambios sin guardar y cambiar de sección?")) return;
              setCatalogEditing(false); setError(""); setSection(item.key);
            }}>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={item.path} /></svg>
            <span><strong>{item.label}</strong><small>{item.detail}</small></span>
          </button>)}
          <Link to="/" className="admin-public-link" onClick={(event) => {
            if (catalogBusy || (catalogEditing && !window.confirm("¿Descartar los cambios sin guardar y abrir el sitio?"))) event.preventDefault();
          }}>Ver sitio web <span aria-hidden="true">↗</span></Link>
        </nav>
        <main className="admin-workspace" key={section}>
        {section === "catalog" ? <AdminCatalog key={userId} onEditingChange={setCatalogEditing} onBusyChange={setCatalogBusy} /> : section === "carousel" ? <AdminCarousel key={userId} onEditingChange={setCatalogEditing} onBusyChange={setCatalogBusy} /> : section === "clients" ? <AdminClients key={userId} onEditingChange={setCatalogEditing} onBusyChange={setCatalogBusy} /> : <>
        <div className="admin-heading"><div><h2>Cotizaciones</h2><p>Consulta las solicitudes y actualiza su seguimiento.</p></div><span className="admin-count">{total} solicitudes</span></div>
        <div className="admin-toolbar admin-filters"><label htmlFor="admin-filter">Estado</label>
          <select id="admin-filter" value={filter} disabled={saving !== null} onChange={(e) => { setFilter(e.target.value); setPage(0); }}>
            <option value="">Todos</option>{estados.map((estado) => <option key={estado}>{estado}</option>)}
          </select>
          <button className="btn btn-line" disabled={loading || saving !== null} onClick={() => setRefresh((value) => value + 1)}>Actualizar</button>
        </div>
        {loading ? <p role="status">Cargando cotizaciones…</p> : rows.length === 0 ? <p>No hay solicitudes para mostrar.</p> :
          <div className="admin-list admin-quotes">{rows.map((row) => <article className="admin-card admin-quote" key={row.id}>
            <div className="admin-heading"><div><span className="admin-status" data-status={row.estado}>{row.estado}</span><h3>{row.nombre}</h3><time dateTime={row.created_at}>{new Date(row.created_at).toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}</time></div>
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
        <div className="admin-toolbar admin-pagination">
          <button className="btn btn-line" disabled={page === 0 || loading || saving !== null} onClick={() => setPage((value) => value - 1)}>Anterior</button>
          <span>Página {page + 1}</span>
          <button className="btn btn-line" disabled={(page + 1) * PAGE_SIZE >= total || loading || saving !== null} onClick={() => setPage((value) => value + 1)}>Siguiente</button>
        </div>
      </>}
        </main>
      </div>}
  </section>;
}
