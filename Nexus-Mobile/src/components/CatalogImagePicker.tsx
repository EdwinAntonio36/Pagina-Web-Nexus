import { useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { CATALOG_BUCKET, IMAGE_ACCEPT, validateImage } from "../lib/catalogImages";

interface Props {
  label: string;
  images: string[];
  multiple?: boolean;
  disabled: boolean;
  onChange: (images: string[]) => void;
  onBusyChange: (busy: boolean) => void;
  savedLabel?: string;
}

export default function CatalogImagePicker({ label, images, multiple = false, disabled, onChange, onBusyChange, savedLabel = "Guarda el producto para aplicar los cambios." }: Props) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const lock = useRef(false);

  async function upload(files: File[]) {
    if (!files.length || !supabase || lock.current || disabled) return;
    lock.current = true; onBusyChange(true); setError("");
    let completed = 0;
    try {
      // Validar el lote antes de comenzar para no subir archivos rechazados.
      const selected = multiple ? files : files.slice(0, 1);
      const extensions = await Promise.all(selected.map(validateImage));
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (!user || authError) throw new Error("Tu sesión expiró. Vuelve a iniciar sesión antes de subir imágenes.");
      let next = multiple ? [...images] : [];
      for (const [index, file] of selected.entries()) {
        setStatus(`Subiendo ${index + 1} de ${selected.length}…`);
        const path = `${user.id}/${crypto.randomUUID()}.${extensions[index]}`;
        const { error: uploadError } = await supabase.storage.from(CATALOG_BUCKET).upload(path, file, {
          contentType: file.type, cacheControl: "3600", upsert: false,
        });
        if (uploadError) throw new Error("No se pudo subir la imagen. Comprueba tu conexión y que hayas ejecutado el SQL de Storage.");
        const { data } = supabase.storage.from(CATALOG_BUCKET).getPublicUrl(path);
        next = multiple ? [...next, data.publicUrl] : [data.publicUrl];
        onChange(next); completed++;
      }
      setStatus(`Imágenes subidas. ${savedLabel}`);
    } catch (uploadError) {
      setError((uploadError as Error).message);
      setStatus(completed ? `${completed} imagen(es) subidas. Puedes guardar lo subido o volver a intentar con los archivos restantes.` : "");
    } finally { lock.current = false; onBusyChange(false); }
  }

  return <div className="catalog-image-picker">
    <label className="field catalog-field"><span>{label}</span>
      <input type="file" accept={IMAGE_ACCEPT} multiple={multiple} disabled={disabled}
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          event.currentTarget.value = "";
          void upload(files);
        }} />
    </label>
    <p className="form-note">JPG, PNG o WebP · Hasta 5 MB por imagen.</p>
    {status && <p role="status">{status}</p>}
    {error && <p className="admin-error" role="alert">{error}</p>}
    <div className="catalog-image-grid">{images.filter(Boolean).map((image, index) => <div className="catalog-image-item" key={`${image}-${index}`}>
      <img src={image} alt={`${label}, imagen ${index + 1}`} />
      <div className="catalog-image-actions">
        {multiple && index > 0 && <button type="button" className="btn btn-line" disabled={disabled} aria-label={`Mover imagen ${index + 1} antes`} onClick={() => {
          const next = [...images]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; onChange(next);
        }}>←</button>}
        <button type="button" className="btn btn-line" disabled={disabled} onClick={() => { onChange(images.filter((_, i) => i !== index)); setStatus(""); }} aria-label={`Quitar imagen ${index + 1}`}>Quitar</button>
      </div>
    </div>)}</div>
  </div>;
}
