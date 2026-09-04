export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-bg" style={{ backgroundImage: "url('/Fondo.png')" }} />
      <div className="hero-overlay" />

      <div className="wrap">
        <div className="hero-inner">
          <h1>
            Conectamos
            <br />
            lo que <span className="accent">te mueve</span>
          </h1>
          <p>Soluciones de conectividad móvil e internet para personas y empresas que exigen más.</p>
          
          {/* <div className="hero-actions">
            <a href="/cotizacion" className="btn btn-solid">
              Conoce más
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a href="#empresas" className="btn btn-line">
              Soluciones empresariales
            </a>
          </div>  */}

        </div>
      </div>
    </section>
  );
}