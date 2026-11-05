import { Link } from "react-router-dom";
import "./LegalFooter.css";

export default function LegalFooter() {
  return <footer className="legal-footer" aria-label="Información legal">
    <span>Nexus Mobile · Mi Plan Celular</span>
    <nav aria-label="Documentos legales"><Link to="/privacidad">Aviso de privacidad</Link><Link to="/terminos">Términos de uso</Link>
      <button type="button" onClick={() => window.dispatchEvent(new Event("nexus:storage-details"))}>Cookies y almacenamiento</button></nav>
  </footer>;
}
