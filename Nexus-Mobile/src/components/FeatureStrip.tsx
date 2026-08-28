import type { ReactNode } from "react";

interface Feature {
  title: string;
  description: string;
  icon: ReactNode;
}

const features: Feature[] = [
  {
    title: "Cobertura nacional",
    description: "Con la red más confiable de México.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M12 2v4M6 8l-2-2M18 8l2-2M4 14a8 8 0 0116 0M8 14a4 4 0 018 0M12 14v8" />
      </svg>
    ),
  },
  {
    title: "Velocidad que conecta",
    description: "Internet móvil e ilimitado para lo que necesites.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 13l4-4M12 5V3" />
      </svg>
    ),
  },
  {
    title: "Seguridad inteligente",
    description: "Protegemos tu información y tu conectividad.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Soporte 24/7 humano",
    description: "Estamos contigo, siempre.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path d="M4 15v-3a8 8 0 0116 0v3" />
        <rect x="2" y="15" width="5" height="6" rx="1.5" />
        <rect x="17" y="15" width="5" height="6" rx="1.5" />
      </svg>
    ),
  },
];

export default function FeatureStrip() {
  return (
    <section className="strip">
      <div className="wrap strip-grid">
        {features.map((f) => (
          <div className="strip-item" key={f.title}>
            <span className="ic">{f.icon}</span>
            <div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
