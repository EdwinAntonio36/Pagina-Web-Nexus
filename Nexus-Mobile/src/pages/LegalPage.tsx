import { useEffect } from "react";
import { Link } from "react-router-dom";
import { legalBusiness, legalIsDraft, legalUpdated } from "../data/legal";
import "./LegalPage.css";

export default function LegalPage({ type }: { type: "privacy" | "terms" }) {
  const privacy = type === "privacy";
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!legalIsDraft) return;
    const meta = document.createElement("meta");
    meta.name = "robots"; meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, [type]);
  return <main className="legal-page">
    <Link className="legal-back" to="/">← Volver al inicio</Link>
    <p className="kicker">Nexus Mobile / Mi Plan Celular</p>
    <h1>{privacy ? "Aviso de privacidad" : "Términos de uso del sitio"}</h1>
    <p className="legal-date">Versión preparada el {legalUpdated}</p>
    {legalIsDraft && <aside className="legal-draft" role="note"><b>Versión para revisión del responsable</b><p>Antes de adoptar estos documentos como definitivos, el negocio debe confirmar sus prácticas de conservación de datos, comunicación a terceros y condiciones comerciales.</p></aside>}
    <section><h2>{privacy ? "1. Responsable y contacto" : "1. Operador del sitio"}</h2>
      <dl><dt>Nombre o razón social</dt><dd>{legalBusiness.name || "Pendiente de confirmar por el negocio"}</dd>
        <dt>Domicilio</dt><dd>{legalBusiness.address || "Pendiente de confirmar por el negocio"}</dd>
        <dt>Correo de privacidad</dt><dd>{legalBusiness.privacyEmail ? <a href={`mailto:${legalBusiness.privacyEmail}`}>{legalBusiness.privacyEmail}</a> : "Pendiente de confirmar por el negocio"}</dd>
        {!privacy && <><dt>Atención a clientes</dt><dd>{legalBusiness.supportEmail || <Link to="/cotizacion">Contactar a un asesor mediante el formulario</Link>}</dd></>}
      </dl>
    </section>
    {privacy ? <>
      <section><h2>2. Información que utiliza el sitio</h2><ul>
        <li>Cotizaciones: nombre, teléfono, correo, interés y mensaje que envías.</li>
        <li>Portal: nombre o razón social, RFC, correo, cuenta de acceso e información de líneas, adendas y trámites que el administrador asocia a tu cuenta.</li>
        <li>Datos técnicos: información de conexión, dirección IP y datos de sesión necesarios para operar y proteger los servicios. Los identificadores utilizados para limitar intentos se almacenan como hashes temporales.</li>
      </ul><p>Las contraseñas se gestionan mediante Supabase Auth; el panel no permite consultarlas. La página no tiene una pasarela de pagos ni solicita datos de tarjeta. No incluyas información médica, financiera ni documentos de identidad en el mensaje libre de cotización.</p></section>
      <section><h2>3. Finalidades</h2><p>La configuración actual permite atender solicitudes de cotización, contactar al solicitante para darles seguimiento, crear y administrar el acceso al portal, mostrar la información del cliente y recuperar su contraseña. También permite proteger las cuentas y atender incidencias.</p>
        <p>No se ha incorporado una herramienta de publicidad ni un registro a campañas de marketing. Cualquier finalidad adicional debe definirse e informarse antes de activarla.</p></section>
      <section><h2>4. Servicios externos y comunicación de datos</h2><p>El sitio utiliza Netlify para alojamiento y Supabase para base de datos, autenticación, almacenamiento y funciones del servidor. Las fuentes se solicitan a Google Fonts y ciertas imágenes pueden provenir de los proveedores configurados por el administrador. Estas solicitudes transmiten datos técnicos de conexión a sus servidores.</p>
        <p>La relación con operadores de telecomunicaciones, las posibles transferencias a terceros y los países de tratamiento deben ser confirmados por el responsable e incorporados a la versión final. Este borrador no presume autorización para transferir datos.</p></section>
      <section><h2>5. Conservación y seguridad</h2><p>Los registros no se borran automáticamente por el simple hecho de cerrar sesión. El responsable debe definir y aplicar periodos de conservación según el servicio, sus obligaciones y las solicitudes de las personas titulares. Los plazos y el procedimiento de eliminación, incluidos respaldos, están pendientes de validación.</p>
        <p>El código implementa controles de acceso por cuenta y funciones administrativas restringidas. Estas medidas requieren una configuración correcta y mantenimiento. Ningún sistema garantiza ausencia absoluta de incidentes.</p></section>
      <section><h2>6. Derechos y solicitudes</h2><p>Puedes solicitar acceso, rectificación, cancelación u oposición al tratamiento de tus datos; también revocar el consentimiento cuando proceda o limitar usos y divulgaciones. Dirige la solicitud al correo de privacidad indicado arriba, describiendo lo que solicitas y un medio para recibir respuesta.</p>
        <p>Incluye tu nombre, el derecho que deseas ejercer y los datos o registros relacionados. Se verificará tu identidad o representación por un canal seguro. No envíes identificaciones por formularios públicos. La respuesta y su ejecución se sujetarán a los plazos y excepciones legales aplicables.</p></section>
      <section><h2>7. Cookies y almacenamiento</h2><p>La sesión de acceso y la confirmación del aviso se conservan en el navegador. La configuración actual no incorpora analítica ni publicidad. Puedes consultar los detalles en <button className="legal-inline-button" onClick={() => window.dispatchEvent(new Event("nexus:storage-details"))}>Cookies y almacenamiento</button>. Borrar datos del navegador puede cerrar tu sesión; no elimina tu cuenta ni la información de la base de datos.</p></section>
      <section><h2>8. Cambios y atención de menores</h2><p>Las modificaciones se comunicarán en esta página con su fecha. Si cambian las finalidades o se requiere un nuevo consentimiento, deberá recabarse según corresponda. El alta de cuentas la realiza el administrador; no hay autorregistro. La atención de menores requiere definir un procedimiento con sus representantes antes de recabar sus datos.</p></section>
      <section className="legal-related"><h2>Referencia normativa</h2><p>Este borrador toma como referencia la <a href="https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf" target="_blank" rel="noopener noreferrer">Ley Federal de Protección de Datos Personales en Posesión de los Particulares</a>. Debe revisarse contra las prácticas reales del responsable.</p></section>
    </> : <>
      <section><h2>2. Alcance de la página</h2><p>El sitio presenta un catálogo de equipos y servicios, recibe solicitudes de cotización y ofrece un portal de consulta para clientes dados de alta por el administrador. Actualmente no permite completar compras, efectuar pagos ni contratar planes de forma automática.</p><p>Enviar una cotización no confirma una compra, reserva, entrega ni activación. Las condiciones de una operación deben comunicarse y aceptarse mediante el proceso comercial correspondiente.</p></section>
      <section><h2>3. Precios, promociones y condiciones comerciales</h2><p>Los precios, capacidades y promociones se muestran según el catálogo configurado por el negocio. Antes de contratar, el asesor deberá informar el importe total, impuestos, vigencia, disponibilidad y cualquier cargo o condición aplicable.</p><p>Las mensualidades anunciadas no constituyen una aprobación de crédito. Deben aclararse el plazo, costo total y requisitos antes de cualquier acuerdo. El negocio debe mantener actualizadas sus ofertas y atender posibles discrepancias respetando los derechos del consumidor.</p></section>
      <section><h2>4. Acceso al portal</h2><p>El administrador proporciona el acceso asociado a un RFC y a un correo del cliente. Cada persona debe usar únicamente su cuenta o una para la que esté autorizada, proteger su contraseña y cerrar sesión en equipos compartidos.</p><p>El portal permite consultar información cargada por el administrador. Si encuentras errores en líneas, adendas o trámites, solicita su revisión a tu asesor. La sincronización automática con Google Sheets y las descargas de documentos no están habilitadas en esta versión.</p></section>
      <section><h2>5. Uso permitido</h2><p>No debes intentar acceder a cuentas ajenas, eludir controles, extraer datos privados, introducir archivos maliciosos, suplantar identidades ni enviar solicitudes automatizadas abusivas. El negocio podrá restringir accesos por razones justificadas de seguridad o uso indebido, respetando las obligaciones derivadas de servicios contratados.</p></section>
      <section><h2>6. Materiales y marcas</h2><p>Los logotipos, fotografías y marcas de fabricantes u operadores pertenecen a sus respectivos titulares. Su presencia no concede derechos de uso al visitante. El negocio debe verificar las licencias de sus materiales y las autorizaciones que sustenten sus afirmaciones comerciales.</p></section>
      <section><h2>7. Soporte, garantías y reclamaciones</h2><p>Las condiciones de entrega, cancelación, devolución, garantía o prestación del servicio deben establecerse para cada operación antes de su aceptación. Este sitio no sustituye contratos, comprobantes ni pólizas. El negocio debe completar su canal de atención y sus procedimientos comerciales antes de ofrecer contratación en línea.</p><p>Estos términos no excluyen ni limitan derechos irrenunciables del consumidor. Los contratos y obligaciones vigentes no desaparecen por cambios en la página. Para información y orientación puedes consultar a <a href="https://www.gob.mx/profeco" target="_blank" rel="noopener noreferrer">PROFECO</a>.</p></section>
      <section><h2>8. Privacidad y disponibilidad</h2><p>El tratamiento de datos se describe en el <Link to="/privacidad">aviso de privacidad</Link>. El sitio depende de servicios de alojamiento y puede tener interrupciones por mantenimiento o incidencias. El negocio deberá ofrecer un medio alternativo para atender asuntos de sus clientes.</p></section>
      <section><h2>9. Cambios y marco aplicable</h2><p>Las actualizaciones se publicarán aquí con fecha. No modificarán retroactivamente derechos o acuerdos existentes sin el procedimiento que corresponda. Se observarán las disposiciones mexicanas aplicables y las vías de protección de las personas consumidoras.</p><p>Referencia: <a href="https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPC.pdf" target="_blank" rel="noopener noreferrer">Ley Federal de Protección al Consumidor</a>.</p></section>
    </>}
    <nav className="legal-crosslinks" aria-label="Otros documentos"><Link to={privacy ? "/terminos" : "/privacidad"}>{privacy ? "Consultar términos de uso" : "Consultar aviso de privacidad"}</Link><Link to="/cotizacion">Contactar a un asesor</Link></nav>
  </main>;
}
