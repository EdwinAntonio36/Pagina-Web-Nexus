import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import CatalogImagePicker from "./CatalogImagePicker";

export default function AdminCarousel({ onBusyChange, onEditingChange }: {
  onBusyChange: (busy: boolean) => void; onEditingChange: (editing: boolean) => void;
}) {
  const [images, setImages] = useState<string[]>([]);
  const [savedImages, setSavedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [ready, setReady] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const lock = useRef(false);
  const busy = uploading || saving;
  const dirty = JSON.stringify(images) !== JSON.stringify(savedImages);
  useEffect(() => { onBusyChange(busy); return () => onBusyChange(false); }, [busy, onBusyChange]);
  useEffect(() => {
    onEditingChange(dirty);
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, onEditingChange]);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      try {
        if (!supabase) throw new Error();
        const { data, error: queryError } = await supabase.from("carrusel_inicio").select("images").eq("id", 1).single();
        if (queryError || !Array.isArray(data?.images)) throw new Error();
        if (!cancelled) { setImages(data.images); setSavedImages(data.images); setReady(true); setError(""); }
      } catch { if (!cancelled) setError("No se pudo cargar el carrusel. Comprueba la conexión y ejecuta 04-carrusel-inicio.sql en Supabase."); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [refresh]);
  async function save() {
    if (!supabase || busy || lock.current) return;
    if (images.length > 20) { setError("El carrusel admite hasta 20 imágenes. Quita las sobrantes antes de guardar."); return; }
    lock.current = true; setSaving(true); setError(""); setNotice("");
    try {
      const { data, error: saveError } = await supabase.from("carrusel_inicio").update({ images }).eq("id", 1).select("id").single();
      if (saveError || !data) throw new Error();
      setSavedImages([...images]); setNotice("Carrusel guardado. Recarga el inicio para verlo.");
    } catch { setError("No se pudo guardar. Tus imágenes siguen aquí para que vuelvas a intentar."); }
    finally { lock.current = false; setSaving(false); }
  }
  return <div className="admin-card"><h2>Carrusel del inicio</h2>
    <p>Agrega tus imágenes y usa las flechas de las miniaturas para cambiar su orden. Para reemplazar una, quítala y sube la nueva.</p>
    <p className="form-note">Recomendamos imágenes horizontales de 1800 × 600 píxeles. Máximo 20 imágenes. Si quitas todas, se mostrará la portada original.</p>
    {error && <p role="alert" className="admin-error">{error}</p>}{notice && <p role="status" className="catalog-notice">{notice}</p>}
    {loading ? <p role="status">Cargando carrusel…</p> : ready ? <>
      <CatalogImagePicker label="Imágenes del carrusel" multiple images={images} disabled={busy} onBusyChange={setUploading}
        onChange={(next) => { setImages(next); setNotice(""); }} savedLabel="Pulsa Guardar carrusel para publicarlas en el inicio." />
      <div className="admin-toolbar"><button className="btn btn-solid" disabled={busy || !dirty} onClick={() => void save()}>{saving ? "Guardando…" : "Guardar carrusel"}</button>
        <button className="btn btn-line" disabled={busy || !dirty} onClick={() => { if (window.confirm("¿Descartar los cambios del carrusel?")) { setImages([...savedImages]); setError(""); setNotice(""); } }}>Descartar cambios</button></div>
    </> : <button className="btn btn-line" onClick={() => setRefresh((value) => value + 1)}>Reintentar</button>}
  </div>;
}
