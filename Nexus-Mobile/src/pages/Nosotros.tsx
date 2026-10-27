import { Link } from "react-router-dom";

const values = [
  {
    title: "Confianza",
    text: "Somos claros y honestos en cada recomendación, porque tu confianza es nuestro mayor compromiso.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Atención personalizada",
    text: "Escuchamos tus necesidades para encontrar el equipo y el plan ideal para tu estilo de vida.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
        <circle cx="12" cy="8" r="3" />
        <path d="M5 20a7 7 0 0114 0M19 11a3 3 0 010 6M5 11a3 3 0 000 6" />
      </svg>
    ),
  },
  {
    title: "Respaldo oficial",
    text: "Como distribuidor oficial de Telcel, te ofrecemos soluciones con el respaldo que mereces.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7}>
        <path d="M4 12h16M12 4v16" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
  },
];

export default function Nosotros() {
  return (
    <section className="nosotros-page">
      <div className="nosotros-hero">
        <div className="nosotros-hero-bg" />
        <div className="nosotros-hero-overlay" />
        <div className="wrap nosotros-hero-content">
          <div className="nosotros-hero-copy">
            <div className="kicker">Conoce Nexus Mobile</div>
            <h1>
              Conectamos
              <br />
              lo que <span className="accent">te mueve</span>
            </h1>
            <p>
              Somos distribuidores oficiales de Telcel. Te ayudamos a encontrar la tecnología, el plan y la atención
              que necesitas para mantenerte siempre conectado.
            </p>
            <a href="#nuestra-historia" className="btn btn-solid">
              Nuestra historia
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                <path d="M12 5v14M6 13l6 6 6-6" />
              </svg>
            </a>
          </div>

          <div className="nosotros-hero-card">
            <div className="nosotros-mark">N</div>
            <span className="nosotros-card-label">Nexus Mobile</span>
            <h2>Tu conexión, nuestra prioridad.</h2>
            <p>Atención cercana, equipos confiables y soluciones móviles para cada etapa de tu vida.</p>
          </div>
        </div>
      </div>

      <div className="wrap">
        <section className="nosotros-story" id="nuestra-historia">
          <div>
            <div className="kicker">Nuestra historia</div>
            <h2>Tecnología que se siente cercana</h2>
          </div>
          <div className="nosotros-story-copy">
            <p>
              En Nexus Mobile creemos que elegir un equipo o un plan debe ser sencillo, transparente y pensado para
              ti. Por eso acercamos las mejores soluciones de conectividad a familias, profesionales y negocios.
            </p>
            <p>
              Nuestro equipo combina experiencia, asesoría personalizada y un servicio honesto para que tomes la
              mejor decisión. No solo vendemos celulares: construimos relaciones que permanecen conectadas.
            </p>
          </div>
        </section>

        <section className="nosotros-values">
          <div className="nosotros-section-head">
            <div className="kicker">Lo que nos mueve</div>
            <h2>Más que conectividad</h2>
            <p>Cada interacción es una oportunidad para ofrecerte una mejor experiencia.</p>
          </div>
          <div className="nosotros-values-grid">
            {values.map((value) => (
              <article className="nosotros-value" key={value.title}>
                <span className="nosotros-value-icon">{value.icon}</span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="nosotros-cta">
          <div>
            <div className="kicker">Estamos para ayudarte</div>
            <h2>¿Listo para conectar con Nexus?</h2>
            <p>Cuéntanos qué necesitas y un asesor te ayudará a encontrar la mejor solución.</p>
          </div>
          <Link to="/cotizacion" className="btn btn-solid">
            Contáctanos
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </section>
      </div>
    </section>
  );
}
