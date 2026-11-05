import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Faqs from "./pages/Faqs";
import Cotizacion from "./pages/Cotizacion";
import Equipos from "./pages/Equipos";
import Empresas from "./pages/Empresas";
import Nosotros from "./pages/Nosotros";
import ProductDetail from "./pages/ProductDetail";
import Admin from "./pages/Admin";
import ClientPortal from "./pages/ClientPortal";
import ClientPassword from "./pages/ClientPassword";
import StorageNotice from "./components/StorageNotice";
import LegalPage from "./pages/LegalPage";
import LegalFooter from "./components/LegalFooter";
import "./App.css";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/privacidad" element={<LegalPage type="privacy" />} />
        <Route path="/terminos" element={<LegalPage type="terms" />} />
        <Route path="/clientes" element={<ClientPortal />} />
        <Route path="/clientes/recuperar" element={<ClientPassword />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={<Home />} />
        <Route path="/faqs" element={<Faqs />} />
        <Route path="/cotizacion" element={<Cotizacion />} />
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/equipos/:id" element={<ProductDetail />} />
        <Route path="/empresas" element={<Empresas />} />
        <Route path="/nosotros" element={<Nosotros />} />
      </Routes>
      <LegalFooter />
      <StorageNotice />
    </>
  );
}

export default App;
