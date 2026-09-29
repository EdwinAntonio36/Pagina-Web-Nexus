import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../hooks/useProducts";
import type { Product } from "../data/products";

interface Category {
  label: string;
  image: string; // ej. "/equipos/categoria-telefonos.png"
}

// Contenido de ejemplo — se reemplaza cuando definamos el catálogo real
const categories: Category[] = [
  { label: "AMIGOS SIN LIMITE", image: "/Amigos.png" },
  { label: "ESIM", image: "/eSIM.png" },
  { label: "PAQUETES SIN INTERNET", image: "/Nowifi.png" },
  { label: "REGISTRA TU LINEA", image: "/Linea.png" },
];

const PRICE_RANGES = [
  { label: "Todos los precios", min: 0, max: Infinity },
  { label: "Menos de $10,000", min: 0, max: 10000 },
  { label: "$10,000 – $20,000", min: 10000, max: 20000 },
  { label: "$20,000 – $30,000", min: 20000, max: 30000 },
  { label: "Más de $30,000", min: 30000, max: Infinity },
];

// Marcas que siempre aparecen como opción de filtro, aunque todavía no tengas
// productos cargados de ellas en el catálogo.
const EXTRA_BRANDS = ["Honor", "Realme"];

function parsePrice(price: string): number {
  const num = parseFloat(price.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 0 : num;
}

function getNetwork(product: Product): "5G" | "4G" | null {
  const redSpec = product.specs.find((s) => s.icon === "signal");
  if (!redSpec) return null;
  return redSpec.value.includes("5G") ? "5G" : redSpec.value.includes("4G") ? "4G" : null;
}

function getCapacities(products: Product[]): string[] {
  const all = products.flatMap((p) => p.capacities.map((c) => c.label));
  return Array.from(new Set(all)).sort((a, b) => parseFloat(a) - parseFloat(b));
}

export default function Equipos() {
  const { products, loading, usingFallback } = useProducts();

  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [priceRangeIndex, setPriceRangeIndex] = useState(0);
  const [selectedNetwork, setSelectedNetwork] = useState<"Todas" | "5G" | "4G">("Todas");
  const [selectedCapacities, setSelectedCapacities] = useState<Set<string>>(new Set());

  const brands = useMemo(() => {
    const fromProducts = products.map((p) => p.brand).filter(Boolean);
    return Array.from(new Set([...fromProducts, ...EXTRA_BRANDS])).sort();
  }, [products]);

  const capacities = useMemo(() => getCapacities(products), [products]);

  function toggleBrand(brand: string) {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand);
      else next.add(brand);
      return next;
    });
  }

  function toggleCapacity(capacity: string) {
    setSelectedCapacities((prev) => {
      const next = new Set(prev);
      if (next.has(capacity)) next.delete(capacity);
      else next.add(capacity);
      return next;
    });
  }

  function clearFilters() {
    setSelectedBrands(new Set());
    setPriceRangeIndex(0);
    setSelectedNetwork("Todas");
    setSelectedCapacities(new Set());
  }

  const activeRange = PRICE_RANGES[priceRangeIndex];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedBrands.size > 0 && !selectedBrands.has(p.brand)) return false;

      const priceNum = parsePrice(p.price);
      if (priceNum < activeRange.min || priceNum > activeRange.max) return false;

      if (selectedNetwork !== "Todas" && getNetwork(p) !== selectedNetwork) return false;

      if (selectedCapacities.size > 0 && !p.capacities.some((c) => selectedCapacities.has(c.label))) return false;

      return true;
    });
  }, [products, selectedBrands, activeRange, selectedNetwork, selectedCapacities]);

  const filtersActive =
    selectedBrands.size > 0 || priceRangeIndex !== 0 || selectedNetwork !== "Todas" || selectedCapacities.size > 0;

  return (
    <section className="equipos-page">
      <div className="wrap">
        <div className="equipos-head">
          <h1>Encuentra tu próximo equipo</h1>
        </div>

        {usingFallback && (
          <p style={{ textAlign: "center", color: "#93A3C2", fontSize: 13, marginBottom: 24 }}>
            Mostrando catálogo de ejemplo (aún no se configuró la hoja de Google Sheets).
          </p>
        )}

        <div className="equipos-layout">
          {/* Filtros — barra lateral */}
          <aside className="equipos-sidebar">
            <div className="filter-group">
              <span className="filter-label">Marca</span>
              <div className="filter-values filter-values-vertical">
                {brands.map((brand) => (
                  <button
                    key={brand}
                    className={`chip ${selectedBrands.has(brand) ? "active" : ""}`}
                    onClick={() => toggleBrand(brand)}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-label">Precio</span>
              <div className="filter-values filter-values-vertical">
                {PRICE_RANGES.map((range, i) => (
                  <button
                    key={range.label}
                    className={`chip ${priceRangeIndex === i ? "active" : ""}`}
                    onClick={() => setPriceRangeIndex(i)}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-label">Red</span>
              <div className="filter-values filter-values-vertical">
                {(["Todas", "5G", "4G"] as const).map((net) => (
                  <button
                    key={net}
                    className={`chip ${selectedNetwork === net ? "active" : ""}`}
                    onClick={() => setSelectedNetwork(net)}
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <span className="filter-label">Almacenamiento</span>
              <div className="filter-values filter-values-vertical">
                {capacities.map((cap) => (
                  <button
                    key={cap}
                    className={`chip ${selectedCapacities.has(cap) ? "active" : ""}`}
                    onClick={() => toggleCapacity(cap)}
                  >
                    {cap}
                  </button>
                ))}
              </div>
            </div>

            {filtersActive && (
              <button className="filters-clear" onClick={clearFilters}>
                Limpiar filtros
              </button>
            )}
          </aside>

          {/* Productos destacados */}
          <div className="equipos-main">
            {loading ? (
              <p style={{ textAlign: "center", color: "#93A3C2" }}>Cargando productos...</p>
            ) : filteredProducts.length === 0 ? (
              <p style={{ textAlign: "center", color: "#93A3C2" }}>
                No hay productos que coincidan con estos filtros.
              </p>
            ) : (
              <div className="equipos-products">
                {filteredProducts.map((product) => (
                  <div className="equipos-product" key={product.id}>
                    <div className="equipos-product-thumb">
                      <img src={product.image} alt="" />
                    </div>
                    <div className="equipos-product-body">
                      <span className="equipos-product-brand">{product.brand}</span>
                      <h3>{product.name}</h3>
                      <div className="equipos-product-price">
                        <b>{product.price}</b>
                        {product.oldPrice && <s>{product.oldPrice}</s>}
                      </div>
                      <Link
                        to={`/equipos/${product.id}`}
                        className="btn btn-solid"
                        style={{ width: "100%", justifyContent: "center" }}
                      >
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Categorías */}
        <div className="equipos-categories">
          {categories.map((cat) => (
            <div className="equipos-cat" key={cat.label}>
              <div className="equipos-cat-thumb">
                <img src={cat.image} alt="" />
              </div>
              <span>{cat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}