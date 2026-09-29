import { useState } from "react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";

interface EmpresaFeature {
  label: string;
  description: string;
  icon: ReactNode; // ícono chico usado en la fila de categorías
  image: string; // imagen grande del popup — ej. "/empresas/feature-telefonia.jpg"
}

interface BusinessSolution {
  title: string;
  description: string;
  image: string; // ej. "/empresas/sol-conectividad.jpg"
}

const features: EmpresaFeature[] = [
  {
    label: "Telefonía",
    description: "Líneas empresariales con planes flexibles y atención dedicada para tu equipo de trabajo. Líneas empresariales con planes flexibles y atención dedicada para tu equipo de trabajo.",
    image: "/stock1.png",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M11 18h2" />
      </svg>
    ),
  },
  {
    label: "Datos",
    description: "Bolsas de datos compartidas entre tu organización, pensadas para el uso diario de tu negocio.",
    image: "/stock2.png",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
        <path d="M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
      </svg>
    ),
  },
  {
    label: "Localización Vehicular",
    description: "Monitorea en tiempo real la ubicación de tu flotilla y mejora la seguridad de tus unidades.",
    image: "/stock3.png",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path d="M5 17h14l-1.5-5.5a2 2 0 00-1.9-1.5H8.4a2 2 0 00-1.9 1.5L5 17z" />
        <circle cx="8" cy="17" r="1.5" />
        <circle cx="16" cy="17" r="1.5" />
        <path d="M12 3v5" />
        <circle cx="12" cy="3" r="1.5" />
      </svg>
    ),
  },
  {
    label: "Internet Fijo",
    description: "Conexión estable de alta velocidad para tu oficina, sin cortes ni intermitencias.",
    image: "/stock4.png",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
        <path d="M5 12a11 11 0 0114 0M8 15.5a6.5 6.5 0 018 0" />
        <circle cx="12" cy="19" r="1" />
      </svg>
    ),
  },
];

// Contenido de ejemplo — se reemplaza cuando definamos el catálogo real
const solutions: BusinessSolution[] = [
  {
    title: "Conectividad Nexus",
    description: "Facilita la colaboración y flujo de información de tu equipo laboral. Facilita la colaboración y flujo de información de tu equipo laboral.",
    image: "/empresas/sol-conectividad.jpg",
  },
  {
    title: "Comunicación Empresarial",
    description: "Soluciones confiables y seguras de comunicación que eficientan procesos.",
    image: "/empresas/sol-comunicacion.jpg",
  },
  {
    title: "Localización y Rastreo",
    description: "Servicios de localización para aumentar la eficiencia y seguridad.",
    image: "/empresas/sol-localizacion.jpg",
  },
  {
    title: "Seguridad",
    description: "Protege la información, los dispositivos e infraestructura de tu empresa.",
    image: "/empresas/sol-seguridad.jpg",
  },
];

export default function Empresas() {
  const [activeFeature, setActiveFeature] = useState<EmpresaFeature | null>(null);

  return (
    <section className="empresas-page">
      {/* Hero — coloca tu imagen de fondo en public/ y ajusta la ruta abajo */}
      <div className="empresas-hero">
        <div className="empresas-hero-bg" style={{ backgroundImage: "url('/Empresasbackg.png')" }} />
        <div className="empresas-hero-overlay" />

        <div className="wrap empresas-hero-content">
          <span className="empresas-hero-kicker">Servicios Empresariales</span>

          <h1 className="empresas-hero-title">
            Todo lo que necesitas desde la comodidad
            <br />
            de <span className="accent">tu oficina</span>
          </h1>

          <Link to="/cotizacion" className="btn btn-solid empresas-hero-cta">
            Contáctanos
          </Link>

          <div className="empresas-features-row">
            {features.map((f) => (
              <button className="empresas-feature" key={f.label} onClick={() => setActiveFeature(f)}>
                <span className="empresas-feature-icon">{f.icon}</span>
                <span className="empresas-feature-label">{f.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Soluciones para empresas */}
      <div className="wrap">
        <h2 className="empresas-section-title">Las mejores soluciones</h2>
        <div className="empresas-solutions">
          {solutions.map((sol) => (
            <div className="empresas-solution" key={sol.title}>
              <div className="empresas-solution-thumb">
                <img src={sol.image} alt="" />
              </div>
              <div className="empresas-solution-body">
                <h3>{sol.title}</h3>
                <p>{sol.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popup de información de cada categoría */}
      {activeFeature && (
        <div className="feature-modal-overlay" onClick={() => setActiveFeature(null)}>
          <div className="feature-modal" onClick={(e) => e.stopPropagation()}>
            <button className="feature-modal-close" onClick={() => setActiveFeature(null)} aria-label="Cerrar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            {/* Imagen — coloca tu archivo en public/ y ajusta "image" en el arreglo features */}
            <div className="feature-modal-thumb" title="Coloca aquí tu imagen">
              <img src={activeFeature.image} alt="" />
              <div className="feature-modal-thumb-overlay">
                <h3>{activeFeature.label}</h3>
              </div>
            </div>

            <div className="feature-modal-body">
              <p>{activeFeature.description}</p>
              <Link to="/cotizacion" className="btn btn-solid" onClick={() => setActiveFeature(null)}>
                Cotizar este servicio
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}