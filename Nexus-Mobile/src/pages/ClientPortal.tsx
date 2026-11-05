import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { loadClientRecords, portalFunction, portalSections, type ClientProfile, type ClientRecord, type PortalSection } from "../lib/clientPortal";
import { usePortalSession } from "../hooks/usePortalSession";
import "./ClientPortal.css";

export default function ClientPortal() {
  const { ready, session } = usePortalSession();
  const [rfc, setRfc] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [recover, setRecover] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !supabase) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const data = await portalFunction("portal-access", { action: recover ? "recover" : "login", rfc, password: recover ? undefined : password });
      if (recover) setNotice(data.message);
      else {
        const { error: sessionError } = await supabase.auth.setSession(data);
        if (sessionError) throw new Error("No se pudo abrir la sesión. Intenta de nuevo.");
        setPassword("");
      }
    } catch (requestError) { setError((requestError as Error).message); }
    finally { setBusy(false); }
  }
  if (!supabase) return <section className="client-page"><p>El portal no está configurado. Contacta a tu asesor.</p></section>;
  if (!ready) return <section className="client-page"><p role="status">Cargando acceso…</p></section>;
  if (session) return <ClientDashboard key={session.user.id} userId={session.user.id} />;
  return <section className="client-page">
    <form className="client-login" onSubmit={submit}>
      <img className="client-logo" src="/portal-logo-nexus.png" alt="Nexus" />
      <h1>{recover ? "Recuperar acceso" : "Acceso de clientes"}</h1>
      <p className="client-sub">Consulta tus líneas, adendas y trámites.</p>
      {error && <p className="client-error" role="alert">{error}</p>}
      {notice && <p className="client-notice" role="status">{notice}</p>}
      <fieldset disabled={busy}>
        <label className="client-field">RFC<input required value={rfc} onChange={(e) => setRfc(e.target.value.toUpperCase())} maxLength={13}
          autoComplete="username" autoCapitalize="characters" spellCheck={false} placeholder="Ej. ABC010101AB1" /></label>
        {!recover && <label className="client-field">Contraseña<div className="client-password">
          <input required type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" aria-pressed={show} onClick={() => setShow((value) => !value)}>{show ? "Ocultar" : "Mostrar"}</button>
        </div></label>}
        <button className="client-primary" type="submit">{busy ? "Procesando…" : recover ? "Enviar instrucciones" : "Entrar"}</button>
        <button className="client-link" type="button" onClick={() => { setRecover((value) => !value); setError(""); setNotice(""); setPassword(""); }}>{recover ? "Volver al inicio de sesión" : "Olvidé mi contraseña"}</button>
      </fieldset>
      <p className="client-help">¿No tienes acceso? Contacta a tu asesor de Mi Plan Celular. Las cuentas las proporciona tu asesor.</p>
    </form><p className="client-foot">Distribuidor autorizado Telcel</p>
  </section>;
}

function ClientDashboard({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [records, setRecords] = useState<Record<PortalSection, ClientRecord[]>>({ lineas: [], adendas: [], tramites: [] });
  const [section, setSection] = useState<PortalSection>("lineas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    void (async () => {
      setLoading(true); setProfile(null); setError("");
      try {
        const { data, error: profileError } = await supabase!.from("clientes").select("id,rfc,nombre,email,active").eq("id", userId).abortSignal(controller.signal).maybeSingle();
        if (profileError) throw new Error("No se pudo cargar tu información. Intenta actualizar o contacta a tu asesor.");
        if (!data) throw new Error("Tu cuenta no tiene un acceso de cliente activo. Contacta a tu asesor.");
        const [lineas, adendas, tramites] = await Promise.all([
          loadClientRecords("lineas", userId, controller.signal), loadClientRecords("adendas", userId, controller.signal), loadClientRecords("tramites", userId, controller.signal),
        ]);
        if (!cancelled) { setProfile(data); setRecords({ lineas, adendas, tramites }); }
      } catch (loadError) { if (!cancelled) setError(loadError instanceof Error ? loadError.message : "No se pudieron cargar tus datos. Intenta actualizar."); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; controller.abort(); };
  }, [userId, refresh]);
  async function logout() {
    setBusy(true);
    try {
      const { error: logoutError } = await supabase!.auth.signOut({ scope: "local" });
      if (logoutError) setError("No se pudo cerrar sesión. Intenta de nuevo.");
    } finally { setBusy(false); }
  }
  return <section className="client-dashboard wrap">
    <div className="client-heading"><div><p className="kicker">Portal de clientes</p><h1>{profile ? `Hola, ${profile.nombre}` : "Mi cuenta"}</h1>
      {profile && <p>{profile.rfc}</p>}</div><div className="client-actions">
        <button className="btn btn-line" disabled={loading} onClick={() => setRefresh((value) => value + 1)}>Actualizar</button>
        <Link className="btn btn-line" to="/clientes/recuperar">Cambiar contraseña</Link>
        <button className="btn btn-line" disabled={busy} onClick={() => void logout()}>Cerrar sesión</button>
      </div></div>
    {loading ? <p role="status">Cargando tu información…</p> : error ? <p role="alert" className="client-error">{error}</p> : <>
      <nav className="client-tabs" aria-label="Mi información">{(Object.keys(portalSections) as PortalSection[]).map((key) =>
        <button key={key} className={`btn ${key === section ? "btn-solid" : "btn-line"}`} aria-pressed={section === key} onClick={() => setSection(key)}>{portalSections[key].label} ({records[key].length})</button>)}</nav>
      <div className="client-records">{records[section].length === 0 ? <div className="client-record"><h2>{portalSections[section].label}</h2><p>Aún no tienes información disponible en esta sección. Tu asesor la cargará cuando esté disponible.</p></div>
        : records[section].map((record) => <article className="client-record" key={record.id}>
          <div className="client-heading"><h2>{record.numero || record.titulo}</h2><span className="client-badge">{record.estado}</span></div>
          {record.plan && <p><b>Plan:</b> {record.plan}</p>}
          {record.fecha && <p><b>Fecha:</b> {new Date(`${record.fecha}T12:00:00`).toLocaleDateString("es-MX")}</p>}
          {record.notas && <p className="client-notes">{record.notas}</p>}
        </article>)}</div>
    </>}
  </section>;
}
