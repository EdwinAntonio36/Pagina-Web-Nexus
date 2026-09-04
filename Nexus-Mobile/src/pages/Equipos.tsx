interface Category {
  label: string;
  image: string; // ej. "/equipos/categoria-telefonos.png"
}

interface Product {
  name: string;
  brand: string;
  price: string;
  oldPrice?: string;
  image: string; // ej. "/equipos/producto-1.png"
}

// Contenido de ejemplo — se reemplaza cuando definamos el catálogo real
const categories: Category[] = [
  { label: "Teléfonos y Smartphones", image: "/equipos/cat-telefonos.png" },
  { label: "Paquetes y Recargas", image: "/equipos/cat-paquetes.png" },
  { label: "Promociones", image: "/equipos/cat-promociones.png" },
  { label: "Tabletas", image: "/equipos/cat-tabletas.png" },
  { label: "Vida Conectada", image: "/equipos/cat-vida-conectada.png" },
  { label: "Accesorios", image: "/equipos/cat-accesorios.png" },
];

const products: Product[] = [
  {
    name: "iPhone 15 256GB",
    brand: "Apple",
    price: "$14,999.00",
    oldPrice: "$17,499.00",
    image: "/equipos/producto-iphone15.png",
  },
  {
    name: "Pixel 9a 128GB",
    brand: "Google",
    price: "$8,399.00",
    oldPrice: "$11,999.00",
    image: "/equipos/producto-pixel9a.png",
  },
  {
    name: "Redmi Note 14 Pro 256GB",
    brand: "Xiaomi",
    price: "$5,249.00",
    oldPrice: "$7,999.00",
    image: "/equipos/producto-redminote14.png",
  },
];

export default function Equipos() {
  return (
    <section className="equipos-page">
      <div className="wrap">
        <div className="equipos-head">
          <div className="kicker">Equipos y planes</div>
          <h1>Encuentra tu próximo equipo</h1>
          <p>Explora teléfonos, planes y accesorios disponibles con Nexus Mobile.</p>
        </div>

        {/* Banner promocional — espacio para imagen/promo destacada */}
        <div className="equipos-banner" title="Coloca aquí tu banner promocional">
          <span>Banner promocional (por definir)</span>
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

        {/* Productos destacados */}
        <h2 className="equipos-section-title">Te recomendamos</h2>
        <div className="equipos-products">
          {products.map((product) => (
            <div className="equipos-product" key={product.name}>
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
                <a href="/cotizacion" className="btn btn-solid" style={{ width: "100%", justifyContent: "center" }}>
                  Ver detalles
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
