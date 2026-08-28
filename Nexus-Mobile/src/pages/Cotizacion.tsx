import ContactForm from "../components/ContactForm";

export default function Cotizacion() {
  return (
    <section className="quote-page">
      <div className="wrap quote-grid">
        <div className="quote-info">
          <div className="kicker">Cotización</div>
          <h1>Cuéntanos qué necesitas y te cotizamos hoy</h1>
          <p>
            Deja tus datos y un asesor de Nexus Mobile te contacta el mismo día hábil para armar tu plan, equipo o
            portabilidad.
          </p>

          <div className="info-row">
            <span className="ic">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </span>
            <div>
              <b>Correo</b>
              <span>contacto@nexusmobile.mx</span>
            </div>
          </div>

          <div className="info-row">
            <span className="ic">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.7a2 2 0 01-.5 2.1L8 9.7a16 16 0 006 6l1.2-1.2a2 2 0 012.1-.5c.9.3 1.8.5 2.7.6a2 2 0 011.7 2z" />
              </svg>
            </span>
            <div>
              <b>Teléfono / WhatsApp</b>
              <span>Lo definimos con tu número real de contacto</span>
            </div>
          </div>

          <div className="info-row">
            <span className="ic">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path d="M21 10c0 6-9 12-9 12s-9-6-9-12a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <div>
              <b>Sucursal</b>
              <span>Dirección de tu punto de atención</span>
            </div>
          </div>
        </div>

        <div className="contact-form-wrap">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
