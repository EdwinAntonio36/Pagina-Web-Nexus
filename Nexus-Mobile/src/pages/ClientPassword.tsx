import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { usePortalSession } from "../hooks/usePortalSession";
import "./ClientPortal.css";

export default function ClientPassword() {
  const { ready, session } = usePortalSession();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !supabase) return;
    if (password.length < 12 || password.length > 128 || password !== confirmation) { setMessage("Usa entre 12 y 128 caracteres y confirma la misma contraseña."); return; }
    setBusy(true); setMessage("");
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true); setPassword(""); setConfirmation("");
    } catch { setMessage("No se pudo cambiar la contraseña. Solicita un nuevo enlace o revisa la política de contraseñas."); }
    finally { setBusy(false); }
  }
  return <section className="client-page"><div className="client-login"><h1>Cambiar contraseña</h1>
    {!supabase ? <p>El portal no está configurado.</p> : !ready ? <p>Cargando sesión…</p> : !session ? <p>El enlace expiró o no tienes una sesión activa. Solicita otro desde “Olvidé mi contraseña”.</p>
      : done ? <p role="status">Contraseña actualizada correctamente.</p> : <form onSubmit={submit}>
        {message && <p className="client-error" role="alert">{message}</p>}
        <fieldset disabled={busy}>
          <label className="client-field">Nueva contraseña<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          <label className="client-field">Confirmar contraseña<input required type="password" minLength={12} maxLength={128} autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} /></label>
          <button className="client-primary">{busy ? "Guardando…" : "Guardar contraseña"}</button>
        </fieldset>
      </form>}
    <Link className="client-link" to="/clientes">Volver al portal</Link>
  </div></section>;
}
