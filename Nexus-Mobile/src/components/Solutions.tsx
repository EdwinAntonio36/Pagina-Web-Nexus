import type { ReactNode } from "react";

interface SolutionCard {
  title: string;
  description: string;
  icon: ReactNode;
  thumbImage: string; // imagen del ícono/foto, ej. "/solutions/planes-moviles-thumb.jpg"
}

const cards: SolutionCard[] = [
  {
    title: "Planes móviles",
    description: "Conéctate con libertad y sin límites.",
    thumbImage: "stock1.png",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M11 18h2" />
      </svg>
    ),
  },
  {
    title: "Internet en casa",
    description: "Estabilidad y velocidad para lo que más importa.",
    thumbImage: "stock2.png",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M3 10l9-6 9 6" />
        <path d="M5 9v10h14V9" />
      </svg>
    ),
  },
  {
    title: "Soluciones empresariales",
    description: "Conectividad, IoT y datos para impulsar tu empresa.",
    thumbImage: "stock3.png",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
      </svg>
    ),
  },
  {
    title: "Planes móviles",
    description: "Conéctate con libertad y sin límites.",
    thumbImage: "stock4.png",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M11 18h2" />
      </svg>
    ),
  },
];

function ArrowIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function Solutions() {
  return (
    <section className="soluciones-float" id="soluciones">
      <div className="wrap">
        <div className="sol-panel" tabIndex={0} role="region" aria-label="Soluciones; desplaza horizontalmente para ver más">
          <div className="sol-intro-mini">
            <div className="kicker">Nuestras soluciones</div>
            <h2>Conectividad para cada necesidad</h2>
            <p>
              Planes móviles, internet en casa y soluciones empresariales diseñadas para tu estilo de vida o el
              crecimiento de tu negocio.
            </p>
            <a href="#" className="link-arrow">
              Ver todas las soluciones <ArrowIcon size={13} />
            </a>
          </div>

          {cards.map((card) => (
            <div className="sol-item" key={card.thumbImage}>
              {/* Imagen — coloca tu archivo en public/ y ajusta "thumbImage" arriba */}
              <div className="sol-item-thumb" title="Coloca aquí tu imagen">
                <img src={card.thumbImage} alt="" />
              </div>
              <div className="sol-item-body">
                <div className="sol-item-head">
                  <span className="row">{card.icon}</span>
                  <h3>{card.title}</h3>
                </div>
                <p>{card.description}</p>
              </div>
            </div>
          ))}

          <div className="sol-item highlight">
            <div className="sol-item-body">
              <h3>
                Tecnología que transforma <span className="accent">conexiones</span>
              </h3>
              <p>En Nexus Mobile, la tecnología no solo comunica, transforma.</p>
              <a href="#" className="link-arrow">
                Somos Nexus <ArrowIcon />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
