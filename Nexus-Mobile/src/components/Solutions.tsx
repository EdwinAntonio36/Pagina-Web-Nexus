import type { ReactNode } from "react";

interface SolutionCard {
  title: string;
  description: string;
  linkLabel: string;
  icon: ReactNode;
}

const cards: SolutionCard[] = [
  {
    title: "Planes móviles",
    description: "Conéctate con libertad y sin límites.",
    linkLabel: "Ver planes",
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
    linkLabel: "Ver planes",
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
    linkLabel: "Conoce más",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
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
    <section className="soluciones" id="soluciones">
      <div className="wrap sol-grid">
        <div className="sol-intro">
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

        <div className="cards">
          {cards.map((card) => (
            <div className="card" key={card.title}>
              <div className="thumb">{card.icon}</div>
              <div className="body">
                <div className="row">{card.icon}</div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <a href="#" className="link-arrow">
                  {card.linkLabel} <ArrowIcon />
                </a>
              </div>
            </div>
          ))}

          <div className="card highlight">
            <div className="body">
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
