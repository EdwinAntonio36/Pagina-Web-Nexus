import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import type { ProductSpec } from "../data/products";

function SpecIcon({ type }: { type: ProductSpec["icon"] }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7 };
  switch (type) {
    case "signal":
      return (
        <svg {...common}>
          <path d="M3 20h2v-4H3v4zM8 20h2v-8H8v8zM13 20h2v-12h-2v12zM18 20h2v-16h-2v16z" />
        </svg>
      );
    case "display":
      return (
        <svg {...common}>
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M11 18h2" />
        </svg>
      );
    case "memory":
      return (
        <svg {...common}>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M9 3v4M15 3v4M9 21v-4M15 21v-4" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <circle cx="12" cy="13.5" r="3.5" />
          <path d="M8 7l1.5-3h5L16 7" />
        </svg>
      );
    case "cpu":
      return (
        <svg {...common}>
          <rect x="7" y="7" width="10" height="10" rx="1.5" />
          <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
        </svg>
      );
    case "os":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
        </svg>
      );
    case "wireless":
      return (
        <svg {...common}>
          <path d="M5 12a11 11 0 0114 0M8 15.5a6.5 6.5 0 018 0" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      );
    case "battery":
      return (
        <svg {...common}>
          <rect x="2" y="7" width="18" height="10" rx="2" />
          <path d="M22 10v4" />
          <path d="M6 10v4" />
        </svg>
      );
  }
}

export default function ProductDetail() {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const product = products.find((p) => p.id === id);

  const [activeImage, setActiveImage] = useState(0);
  const [capacityLabel, setCapacityLabel] = useState<string>("");
  const [colorName, setColorName] = useState<string>("");
  const [simType, setSimType] = useState<string>("");

  if (loading) {
    return (
      <section className="product-detail">
        <div className="wrap">
          <p style={{ color: "#93A3C2" }}>Cargando producto...</p>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="product-detail">
        <div className="wrap">
          <p>No encontramos este producto.</p>
          <Link to="/equipos" className="link-arrow">
            Volver a Equipos
          </Link>
        </div>
      </section>
    );
  }

  const currentCapacityLabel = capacityLabel || product.capacities[0]?.label || "";
  const currentCapacity = product.capacities.find((c) => c.label === currentCapacityLabel);

  const currentColorName = colorName || product.colors[0]?.name || "";
  const currentColor = product.colors.find((c) => c.name === currentColorName);

  const currentSim = simType || product.simTypes[0] || "";

  // El color, si trae sus propias fotos, manda sobre la galería general del producto.
  const activeGallery = currentColor?.images?.length ? currentColor.images : product.gallery;

  // La capacidad, si trae su propio precio, manda sobre el precio general del producto.
  const displayPrice = currentCapacity?.price ?? product.price;
  const displayOldPrice = currentCapacity?.oldPrice ?? product.oldPrice;
  const displayMonthlyPayment = currentCapacity?.monthlyPayment ?? product.monthlyPayment;

  function handleColorChange(name: string) {
    setColorName(name);
    setActiveImage(0); // vuelve a la primera foto del set de ese color
  }

  return (
    <section className="product-detail">
      <div className="wrap">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Inicio</Link>
          <span>/</span>
          <Link to="/equipos">Equipos</Link>
          <span>/</span>
          <span className="current">{product.name}</span>
        </div>

        <div className="product-detail-grid">
          {/* Galería */}
          <div className="product-gallery">
            <div className="product-gallery-thumbs">
              {activeGallery.map((img, i) => (
                <button
                  key={img + i}
                  className={`product-gallery-thumb ${i === activeImage ? "active" : ""}`}
                  onClick={() => setActiveImage(i)}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
            <div className="product-gallery-main">
              <img src={activeGallery[activeImage] ?? activeGallery[0]} alt={product.name} />
            </div>
          </div>

          {/* Info */}
          <div className="product-info">
            {product.tag && <span className="product-tag">{product.tag}</span>}
            <span className="product-brand-model">
              {product.brand} {product.model && `| ${product.model}`}
            </span>
            <h1>{product.name}</h1>
            {product.description && <p className="product-description">{product.description}</p>}

            <div className="product-price-block">
              {displayOldPrice && <s>{displayOldPrice}</s>}
              <b>{displayPrice}</b>
              {displayMonthlyPayment && <span className="product-installments">o en hasta {displayMonthlyPayment}</span>}
            </div>

            {product.capacities.length > 0 && (
              <div className="product-option">
                <span className="product-option-label">Capacidad:</span>
                <div className="product-option-values">
                  {product.capacities.map((cap) => (
                    <button
                      key={cap.label}
                      className={`chip ${cap.label === currentCapacityLabel ? "active" : ""}`}
                      onClick={() => setCapacityLabel(cap.label)}
                    >
                      {cap.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors.length > 0 && (
              <div className="product-option">
                <span className="product-option-label">Color: {currentColorName}</span>
                <div className="product-option-values">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      className={`color-dot ${c.name === currentColorName ? "active" : ""}`}
                      style={{ backgroundColor: c.hex }}
                      onClick={() => handleColorChange(c.name)}
                      aria-label={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {product.simTypes.length > 0 && (
              <div className="product-option">
                <span className="product-option-label">Tipo de SIM:</span>
                <div className="product-option-values">
                  {product.simTypes.map((sim) => (
                    <button
                      key={sim}
                      className={`chip ${sim === currentSim ? "active" : ""}`}
                      onClick={() => setSimType(sim)}
                    >
                      {sim}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="product-actions">
              <Link to="/cotizacion" className="btn btn-solid product-cta">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6" />
                </svg>
                Cotizar este equipo
              </Link>
              <a href="#" className="btn btn-line product-cta">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M3 7h13l4 4v6a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z" />
                  <circle cx="7.5" cy="18.5" r="1.5" />
                  <circle cx="16.5" cy="18.5" r="1.5" />
                </svg>
                Envío gratis
              </a>
            </div>

            {product.specs.length > 0 && (
              <div className="product-specs">
                <h2>Características principales</h2>
                <div className="product-specs-grid">
                  {product.specs.map((spec) => (
                    <div className="product-spec" key={spec.label}>
                      <span className="product-spec-icon">
                        <SpecIcon type={spec.icon} />
                      </span>
                      <div>
                        <b>{spec.label}</b>
                        <p>{spec.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="product-trust">
              <span>Compra segura</span>
              <span>Envío gratis</span>
              <span>Soporte Nexus</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}