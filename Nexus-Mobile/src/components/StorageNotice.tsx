import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./StorageNotice.css";

const NOTICE_KEY = "nexus-storage-notice-v1";
function acknowledged() {
  try { return window.localStorage.getItem(NOTICE_KEY) === "acknowledged"; }
  catch { return false; }
}

export default function StorageNotice() {
  const [visible, setVisible] = useState(() => !acknowledged());
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const open = () => { if (!dialog.current?.open) dialog.current?.showModal(); };
    window.addEventListener("nexus:storage-details", open);
    return () => window.removeEventListener("nexus:storage-details", open);
  }, []);
  function dismiss() {
    try { window.localStorage.setItem(NOTICE_KEY, "acknowledged"); }
    catch { /* La página sigue funcionando si el navegador bloquea el almacenamiento. */ }
    setVisible(false);
    dialog.current?.close();
  }
  return <>
    {visible ? <aside className="storage-notice" aria-label="Aviso de cookies y almacenamiento">
      <div className="storage-notice-copy"><strong>Tu privacidad</strong>
        <p>Usamos almacenamiento necesario para mantener tu sesión cuando ingresas y recordar este aviso. No hemos incorporado analítica ni publicidad.</p>
      </div>
      <div className="storage-notice-actions"><button type="button" className="storage-secondary" onClick={() => dialog.current?.showModal()}>Más información</button>
        <button type="button" className="storage-primary" onClick={dismiss}>Entendido</button></div>
    </aside> : null}
    <dialog ref={dialog} className="storage-dialog" aria-labelledby={titleId}>
      <div className="storage-dialog-heading"><h2 id={titleId}>Cookies y almacenamiento</h2><button type="button" className="storage-close" aria-label="Cerrar información" onClick={() => dialog.current?.close()}>×</button></div>
      <p>El sitio utiliza almacenamiento del navegador, como localStorage, para estas funciones:</p>
      <dl><dt>Sesión de acceso</dt><dd>Supabase guarda la sesión al iniciar sesión como cliente o administrador. No guardamos tu contraseña en localStorage. Puedes cerrar la sesión desde tu cuenta.</dd>
        <dt>Este aviso</dt><dd>Recordamos que lo leíste para no mostrarlo en cada visita. Puedes volver a abrir esta información con el botón “Privacidad”.</dd>
        <dt>Analítica y publicidad</dt><dd>No se han incorporado herramientas de medición ni publicidad en esta versión del sitio.</dd>
      </dl>
      <p>También cargamos recursos de proveedores externos: alojamiento en Netlify, servicios de Supabase, fuentes de Google e imágenes de las direcciones configuradas por el administrador.</p>
      <p>Puedes borrar los datos del sitio desde la configuración de tu navegador. Esto puede cerrar tu sesión y volver a mostrar este aviso.</p>
      <p><Link to="/privacidad" onClick={() => dialog.current?.close()}>Consultar el aviso de privacidad</Link></p>
      <button type="button" className="storage-primary" onClick={dismiss}>Entendido</button>
    </dialog>
  </>;
}
