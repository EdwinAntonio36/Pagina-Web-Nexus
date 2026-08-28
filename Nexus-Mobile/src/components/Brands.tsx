const brands = ["Telcel", "Motorola", "Samsung", "Apple", "Xiaomi", "ZTE", "Oppo"];

export default function Brands() {
  return (
    <section className="brands">
      <div className="wrap brands-inner">
        <div className="brands-label">TRABAJAMOS CON LAS MEJORES MARCAS</div>
        <div className="brand-list">
          {brands.map((brand) => (
            <span key={brand}>{brand}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
