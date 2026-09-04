import { useState } from "react";

interface BannerSlide {
  kicker: string;
  title: string;
  ctaLabel: string;
  image: string; // ej. "/empresas/banner-seguridad.jpg"
}

interface BusinessSolution {
  title: string;
  description: string;
  image: string; // ej. "/empresas/sol-conectividad.jpg"
}

// Contenido de ejemplo — se reemplaza cuando definamos el catálogo real
const slides: BannerSlide[] = [
  {
    kicker: "Seguridad",
    title: "Protege tus dispositivos con seguridad digital empresarial",
    ctaLabel: "Conoce más",
    image: "/empresas/banner-seguridad.jpg",
  },
  {
    kicker: "Conectividad",
    title: "Mantén a tu equipo conectado desde cualquier lugar",
    ctaLabel: "Conoce más",
    image: "/empresas/banner-conectividad.jpg",
  },
  {
    kicker: "Flotillas",
    title: "Localiza y administra tus vehículos en tiempo real",
    ctaLabel: "Conoce más",
    image: "/empresas/banner-flotillas.jpg",
  },
];

const solutions: BusinessSolution[] = [
  {
    title: "Conectividad Nexus",
    description: "Facilita la colaboración y flujo de información de tu equipo laboral.",
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
  const [current, setCurrent] = useState(0);

  function prevSlide() {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }

  function nextSlide() {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }

  const slide = slides[current];

  return (
    <section className="empresas-page">
      <div className="wrap">
        <div className="kicker">Empresas</div>

        {/* Banner / carrusel */}
        <div className="empresas-banner">
          <div className="empresas-banner-thumb" title="Coloca aquí tu imagen de banner">
            <img src={slide.image} alt="" />
          </div>
          <div className="empresas-banner-overlay">
            <span className="empresas-banner-kicker">{slide.kicker}</span>
            <h2>{slide.title}</h2>
            <a href="/cotizacion" className="btn btn-solid">
              {slide.ctaLabel}
            </a>
          </div>

          <button className="empresas-banner-arrow left" onClick={prevSlide} aria-label="Anterior">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button className="empresas-banner-arrow right" onClick={nextSlide} aria-label="Siguiente">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        <div className="empresas-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`empresas-dot ${i === current ? "active" : ""}`}
              onClick={() => setCurrent(i)}
              aria-label={`Ir al slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Soluciones para empresas */}
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
    </section>
  );
}
