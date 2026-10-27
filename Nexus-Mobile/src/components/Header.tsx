import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Equipos", href: "/equipos" },
  { label: "Empresas", href: "/empresas" },
  { label: "FAQs", href: "/faqs" },
  { label: "Nosotros", href: "/nosotros" },
];

export default function Header() {
  const location = useLocation();

  return (
    <header>
      <div className="wrap nav">
        <Link to="/" className="logo-slot" title="Nexus Mobile">
          <img src="/logov2.png" alt="Nexus Mobile" />
        </Link>

        <nav className="navlinks">
          {navLinks.map((link) => {
            const isRoute = !link.href.includes("#");
            const isActive = isRoute && location.pathname === link.href;

            return isRoute ? (
              <Link key={link.label} to={link.href} className={isActive ? "active" : ""}>
                {link.label}
              </Link>
            ) : (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            );
          })}
        </nav>

        <Link to="/cotizacion" className="btn-outline">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
          </svg>
          Cotizar ahora
        </Link>
      </div>
    </header>
  );
}