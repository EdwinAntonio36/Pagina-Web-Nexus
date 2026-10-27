import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { emptyProduct, prepareProduct, productPayload, specIcons, type CatalogProduct } from "../lib/catalogAdmin";
import CatalogImagePicker from "./CatalogImagePicker";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="field catalog-field"><span>{label}</span>{children}</label>;
}
const splitLines = (text: string) => text.split("\n");

export default function AdminCatalog({ onEditingChange, onBusyChange }: { onEditingChange: (editing: boolean) => void; onBusyChange: (busy: boolean) => void }) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [draft, setDraft] = useState<CatalogProduct | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const busy = saving || uploading;
  const [pendingDelete, setPendingDelete] = useState<CatalogProduct | null>(null);
  const lock = useRef(false);
  const editor = useRef<HTMLFormElement>(null);
  const hasDraft = draft !== null;
  useEffect(() => { onBusyChange(busy); return () => onBusyChange(false); }, [busy, onBusyChange]);

  useEffect(() => {
    onEditingChange(hasDraft);
    if (!hasDraft) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasDraft, onEditingChange]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    void (async () => {
      setLoading(true);
      try {
        if (!supabase) throw new Error("Sin conexión configurada");
        const rows: CatalogProduct[] = [];
        for (let offset = 0; ; offset += 500) {
          const { data, error: queryError } = await supabase.from("productos").select("*")
            .order("sort_order").order("id").range(offset, offset + 499).abortSignal(controller.signal);
          if (queryError) throw queryError;
          rows.push(...(data ?? []) as CatalogProduct[]);
          if (!data || data.length < 500) break;
        }
        if (!cancelled) { setProducts(rows); setError(""); }
      } catch { if (!cancelled) setError("No se pudo cargar el catálogo. Pulsa Actualizar para volver a intentar."); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; controller.abort(); };
  }, [refresh]);

  useEffect(() => { if (hasDraft) editor.current?.scrollIntoView({ behavior: "smooth", block: "start" }); }, [editingId, hasDraft]);

  function openEditor(product?: CatalogProduct) {
    if (draft && !window.confirm("¿Descartar los cambios del formulario actual?")) return;
    setDraft(product ? structuredClone(product) : emptyProduct());
    setEditingId(product?.id ?? null);
    setPendingDelete(null); setError(""); setNotice("");
  }
  function cancelEditor() {
    if (!window.confirm("¿Cerrar el formulario y descartar los cambios?")) return;
    setDraft(null); setEditingId(null); setError("");
  }
  function change<K extends keyof CatalogProduct>(key: K, value: CatalogProduct[K]) {
    setDraft((previous) => previous ? { ...previous, [key]: value } : previous);
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!draft || !supabase || lock.current || uploading) return;
    setError(""); setNotice("");
    let product: CatalogProduct;
    try { product = prepareProduct(draft); }
    catch (validationError) { setError((validationError as Error).message); return; }
    lock.current = true; setSaving(true);
    try {
      const payload = productPayload(product);
      const query = editingId
        ? supabase.from("productos").update(payload).eq("id", editingId)
        : supabase.from("productos").insert(payload);
      const { data, error: saveError } = await query.select("id").maybeSingle();
      if (saveError) {
        if (saveError.code === "23505") throw new Error("Ya existe un producto con ese identificador. Elige uno distinto.");
        throw new Error("No se pudo guardar. Comprueba tu conexión y los permisos de administrador.");
      }
      if (!data) throw new Error("El producto ya no existe o tu cuenta no tiene permiso para modificarlo.");
      setNotice(editingId ? "Producto actualizado." : "Producto creado.");
      setDraft(null); setEditingId(null); setRefresh((value) => value + 1);
    } catch (saveError) { setError((saveError as Error).message || "No se pudo guardar el producto."); }
    finally { lock.current = false; setSaving(false); }
  }
  async function remove() {
    if (!pendingDelete || !supabase || lock.current) return;
    lock.current = true; setSaving(true); setError(""); setNotice("");
    try {
      const { data, error: deleteError } = await supabase.from("productos").delete()
        .eq("id", pendingDelete.id).select("id").maybeSingle();
      if (deleteError || !data) throw new Error("No se pudo eliminar. Comprueba tus permisos o actualiza el catálogo.");
      setPendingDelete(null); setNotice("Producto eliminado."); setRefresh((value) => value + 1);
    } catch (deleteError) { setError((deleteError as Error).message); }
    finally { lock.current = false; setSaving(false); }
  }

  const filtered = products.filter((p) => `${p.name} ${p.brand} ${p.model} ${p.id}`.toLowerCase().includes(search.toLowerCase())
    && (visibility === "all" || p.active === (visibility === "active")));

  return <div className="admin-catalog">
    <div className="admin-heading"><div><h2>Catálogo de productos</h2><p>Los cambios se reflejan al volver a cargar el catálogo público.</p></div>
      <button className="btn btn-solid" disabled={busy} onClick={() => openEditor()}>Crear producto</button></div>
    {error && <p className="admin-error" role="alert">{error}</p>}
    {notice && <p className="catalog-notice" role="status">{notice}</p>}
    {draft && <form ref={editor} className="catalog-editor admin-card" onSubmit={save}>
      <h2>{editingId ? "Editar producto" : "Nuevo producto"}</h2>
      <fieldset disabled={busy}>
        <legend>Información general</legend>
        <div className="catalog-grid">
          <Field label="Identificador *"><input required readOnly={editingId !== null} value={draft.id} onChange={(e) => change("id", e.target.value)} placeholder="iphone-17-pro" /></Field>
          <Field label="Nombre *"><input required value={draft.name} onChange={(e) => change("name", e.target.value)} /></Field>
          <Field label="Marca *"><input required value={draft.brand} onChange={(e) => change("brand", e.target.value)} /></Field>
          <Field label="Modelo"><input value={draft.model} onChange={(e) => change("model", e.target.value)} /></Field>
          <Field label="Etiqueta"><input value={draft.tag ?? ""} onChange={(e) => change("tag", e.target.value)} placeholder="Promoción" /></Field>
          <Field label="Orden en el catálogo"><input type="number" min="0" step="1" required value={draft.sort_order} onChange={(e) => change("sort_order", Number(e.target.value))} /></Field>
        </div>
        <Field label="Descripción"><textarea value={draft.description} onChange={(e) => change("description", e.target.value)} /></Field>
        <label className="catalog-checkbox"><input type="checkbox" checked={draft.active} onChange={(e) => change("active", e.target.checked)} /> Visible en el catálogo público</label>
        <p className="form-note">El identificador forma parte del enlace del producto y se conserva al editarlo. Los productos nuevos comienzan ocultos.</p>
      </fieldset>
      <fieldset disabled={busy}><legend>Precio</legend><div className="catalog-grid">
        <Field label="Precio *"><input required value={draft.price} onChange={(e) => change("price", e.target.value)} placeholder="$12,999.00" /></Field>
        <Field label="Precio anterior"><input value={draft.oldPrice ?? ""} onChange={(e) => change("oldPrice", e.target.value)} /></Field>
        <Field label="Mensualidad"><input value={draft.monthlyPayment ?? ""} onChange={(e) => change("monthlyPayment", e.target.value)} placeholder="13 pagos de $999.92" /></Field>
      </div></fieldset>
      <fieldset disabled={busy}><legend>Imágenes</legend>
        <CatalogImagePicker label="Imagen principal *" images={draft.image ? [draft.image] : []} disabled={busy} onBusyChange={setUploading}
          onChange={(images) => setDraft((previous) => {
            if (!previous) return previous;
            const image = images[0] ?? "";
            const gallery = previous.gallery.length === 1 && previous.gallery[0] === previous.image
              ? image ? [image] : [] : previous.gallery;
            return { ...previous, image, gallery };
          })} />
        <CatalogImagePicker label="Galería" images={draft.gallery} multiple disabled={busy} onBusyChange={setUploading}
          onChange={(images) => change("gallery", images)} />
      </fieldset>
      <fieldset disabled={busy}><legend>Capacidades</legend>
        {draft.capacities.map((capacity, index) => <div className="catalog-option" key={index}><div className="catalog-grid">
          <Field label="Capacidad *"><input required value={capacity.label} onChange={(e) => change("capacities", draft.capacities.map((c, i) => i === index ? { ...c, label: e.target.value } : c))} placeholder="256 GB" /></Field>
          <Field label="Precio"><input value={capacity.price ?? ""} onChange={(e) => change("capacities", draft.capacities.map((c, i) => i === index ? { ...c, price: e.target.value } : c))} /></Field>
          <Field label="Precio anterior"><input value={capacity.oldPrice ?? ""} onChange={(e) => change("capacities", draft.capacities.map((c, i) => i === index ? { ...c, oldPrice: e.target.value } : c))} /></Field>
          <Field label="Mensualidad"><input value={capacity.monthlyPayment ?? ""} onChange={(e) => change("capacities", draft.capacities.map((c, i) => i === index ? { ...c, monthlyPayment: e.target.value } : c))} /></Field>
        </div><button type="button" className="btn btn-line" onClick={() => change("capacities", draft.capacities.filter((_, i) => i !== index))}>Quitar capacidad {index + 1}</button></div>)}
        <button type="button" className="btn btn-line" onClick={() => change("capacities", [...draft.capacities, { label: "" }])}>Agregar capacidad</button>
      </fieldset>
      <fieldset disabled={busy}><legend>Colores</legend>
        {draft.colors.map((color, index) => <div className="catalog-option" key={index}><div className="catalog-grid">
          <Field label="Nombre del color *"><input required value={color.name} onChange={(e) => change("colors", draft.colors.map((c, i) => i === index ? { ...c, name: e.target.value } : c))} /></Field>
          <Field label="Color"><input type="color" value={color.hex} onChange={(e) => change("colors", draft.colors.map((c, i) => i === index ? { ...c, hex: e.target.value } : c))} /></Field>
        </div><CatalogImagePicker label={`Imágenes de ${color.name || "este color"}`} images={color.images ?? []} multiple disabled={busy} onBusyChange={setUploading}
          onChange={(images) => setDraft((previous) => previous ? { ...previous, colors: previous.colors.map((c, i) => i === index ? { ...c, images } : c) } : previous)} />
        <button type="button" className="btn btn-line" onClick={() => change("colors", draft.colors.filter((_, i) => i !== index))}>Quitar color {index + 1}</button></div>)}
        <button type="button" className="btn btn-line" onClick={() => change("colors", [...draft.colors, { name: "", hex: "#888888" }])}>Agregar color</button>
      </fieldset>
      <fieldset disabled={busy}><legend>Tipos de SIM</legend>
        <Field label="Un tipo por línea"><textarea value={draft.simTypes.join("\n")} onChange={(e) => change("simTypes", splitLines(e.target.value))} placeholder={"SIM física\neSIM"} /></Field>
      </fieldset>
      <fieldset disabled={busy}><legend>Características</legend>
        {draft.specs.map((spec, index) => <div className="catalog-option" key={index}><div className="catalog-grid">
          <Field label="Categoría"><select value={spec.icon} onChange={(e) => change("specs", draft.specs.map((s, i) => i === index ? { ...s, icon: e.target.value as typeof spec.icon } : s))}>
            {specIcons.map((icon, i) => <option key={icon} value={icon}>{["Red", "Pantalla", "Memoria", "Cámara", "Procesador", "Sistema operativo", "Conexiones", "Batería"][i]}</option>)}
          </select></Field>
          <Field label="Título *"><input required value={spec.label} onChange={(e) => change("specs", draft.specs.map((s, i) => i === index ? { ...s, label: e.target.value } : s))} /></Field>
        </div><Field label="Detalle *"><textarea required value={spec.value} onChange={(e) => change("specs", draft.specs.map((s, i) => i === index ? { ...s, value: e.target.value } : s))} /></Field>
        <button type="button" className="btn btn-line" onClick={() => change("specs", draft.specs.filter((_, i) => i !== index))}>Quitar característica {index + 1}</button></div>)}
        <button type="button" className="btn btn-line" onClick={() => change("specs", [...draft.specs, { icon: "signal", label: "", value: "" }])}>Agregar característica</button>
      </fieldset>
      <div className="admin-toolbar"><button type="submit" className="btn btn-solid" disabled={busy}>{saving ? "Guardando…" : "Guardar producto"}</button>
        <button type="button" className="btn btn-line" disabled={busy} onClick={cancelEditor}>Cancelar</button></div>
    </form>}
    {pendingDelete && <div className="admin-card catalog-delete" role="alertdialog" aria-label="Confirmar eliminación">
      <h3>¿Eliminar {pendingDelete.name}?</h3><p>Se eliminará permanentemente. También puedes cancelar y ocultarlo desde Editar.</p>
      <div className="admin-toolbar"><button className="btn catalog-danger" disabled={busy} onClick={() => void remove()}>{saving ? "Eliminando…" : "Eliminar definitivamente"}</button>
        <button className="btn btn-line" disabled={busy} onClick={() => setPendingDelete(null)}>Cancelar</button></div>
    </div>}
    <div className="admin-toolbar catalog-filters">
      <Field label="Buscar producto"><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nombre, marca o identificador" /></Field>
      <Field label="Visibilidad"><select value={visibility} onChange={(e) => setVisibility(e.target.value)}><option value="all">Todos</option><option value="active">Visibles</option><option value="hidden">Ocultos</option></select></Field>
      <button className="btn btn-line" disabled={loading || busy} onClick={() => setRefresh((value) => value + 1)}>Actualizar</button>
      <span>{filtered.length} productos</span>
    </div>
    {loading ? <p role="status">Cargando productos…</p> : filtered.length === 0 ? <p>No hay productos que mostrar.</p> :
      <div className="catalog-list">{filtered.map((product) => <article key={product.id} className="admin-card catalog-card">
        <img src={product.image} alt={product.name} /><div><span>{product.brand} · {product.active ? "Visible" : "Oculto"}</span>
          <h3>{product.name}</h3><p>{product.price}</p><small>{product.id}</small>
          <div className="admin-toolbar"><button className="btn btn-line" disabled={busy} onClick={() => openEditor(product)}>Ver / Editar</button>
            <button className="btn btn-line" disabled={busy || draft !== null} onClick={() => { setPendingDelete(product); setError(""); setNotice(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Eliminar</button>
          </div></div>
      </article>)}</div>}
  </div>;
}

