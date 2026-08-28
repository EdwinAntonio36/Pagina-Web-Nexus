import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Faqs from "./pages/Faqs";
import Cotizacion from "./pages/Cotizacion";
import "./App.css";

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/faqs" element={<Faqs />} />
        <Route path="/cotizacion" element={<Cotizacion />} />
      </Routes>
    </>
  );
}

export default App;