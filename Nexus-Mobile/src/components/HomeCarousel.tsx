import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Hero from "./Hero";
import "./HomeCarousel.css";

export default function HomeCarousel() {
  const [images, setImages] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [interacting, setInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    if (supabase) void supabase.from("carrusel_inicio").select("images").eq("id", 1)
      .abortSignal(controller.signal).maybeSingle().then(({ data, error }) => {
        if (!cancelled && !error && Array.isArray(data?.images)) setImages(data.images);
      });
    return () => { cancelled = true; controller.abort(); };
  }, []);
  useEffect(() => {
    if (images.length < 2 || interacting || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((current) => (current + 1) % images.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [images.length, interacting, reducedMotion, index]);
  if (!images.length) return <Hero />;
  const move = (direction: number) => setIndex((current) => (current + direction + images.length) % images.length);
  return <section className="home-carousel" aria-label="Promociones de Nexus Mobile" aria-roledescription="carrusel"
    onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)}
    onFocusCapture={() => setInteracting(true)} onBlurCapture={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
    }} onKeyDown={(event) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
    }}>
    <div className="home-carousel-frame" aria-live={interacting ? "polite" : "off"}>
      <img key={images[index]} src={images[index]} alt={`Promoción de Nexus Mobile ${index + 1} de ${images.length}`} fetchPriority="high" />
    </div>
    {images.length > 1 && <>
      <button className="carousel-arrow carousel-prev" aria-label="Imagen anterior" onClick={() => move(-1)}>‹</button>
      <button className="carousel-arrow carousel-next" aria-label="Imagen siguiente" onClick={() => move(1)}>›</button>
      <div className="carousel-controls"><div className="carousel-dots">{images.map((image, i) =>
        <button key={`${image}-${i}`} aria-label={`Ver imagen ${i + 1}`} aria-current={i === index ? "true" : undefined}
          className={i === index ? "active" : ""} onClick={() => setIndex(i)} />)}</div>
      </div>
    </>}
  </section>;
}
