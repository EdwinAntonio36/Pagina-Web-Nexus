import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Faqs from "./pages/Faqs";
import Cotizacion from "./pages/Cotizacion";
import Equipos from "./pages/Equipos";
import Empresas from "./pages/Empresas";
import ProductDetail from "./pages/ProductDetail";
import "./App.css";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/faqs" element={<Faqs />} />
        <Route path="/cotizacion" element={<Cotizacion />} />
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/equipos/:id" element={<ProductDetail />} />
        <Route path="/empresas" element={<Empresas />} />
      </Routes>
    </>
  );
}

export default App;