export default function Hero() {
  return (
    <section className="hero">
      <svg className="hero-net" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5B93FF" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#5B93FF" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <g stroke="url(#fade)" strokeWidth={1.2} fill="none">
          <path d="M60 380 Q 300 120 560 260" />
          <path d="M180 420 Q 420 200 720 320" />
          <path d="M120 300 Q 380 340 640 180" />
        </g>
        <g fill="#5B93FF" opacity={0.7}>
          <circle cx="60" cy="380" r="3" />
          <circle cx="560" cy="260" r="3" />
          <circle cx="180" cy="420" r="3" />
          <circle cx="720" cy="320" r="3" />
          <circle cx="640" cy="180" r="3" />
        </g>
        <g fill="rgba(255,255,255,0.06)">
          <rect x="500" y="260" width="18" height="140" />
          <rect x="530" y="200" width="18" height="200" />
          <rect x="560" y="240" width="18" height="160" />
          <rect x="600" y="150" width="22" height="250" />
          <rect x="640" y="220" width="18" height="180" />
          <rect x="680" y="180" width="20" height="220" />
          <rect x="720" y="250" width="18" height="150" />
        </g>
      </svg>

      <div className="wrap">
        <div className="hero-inner">
          <h1>
            Conectamos
            <br />
            lo que <span className="accent">te mueve</span>
          </h1>
          <p>Soluciones de conectividad móvil e internet para personas y empresas que exigen más.</p>
          <div className="hero-actions">
            <a href="#soluciones" className="btn btn-solid">
              Conoce más
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a href="#empresas" className="btn btn-line">
              Soluciones empresariales
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
