import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { loadClientRecords, portalFunction, portalSections, type ClientProfile, type ClientRecord, type PortalSection } from "../lib/clientPortal";
import { clientInput } from "../../supabase/functions/_shared/portalValidation";

interface Props { onEditingChange: (editing: boolean) => void; onBusyChange: (busy: boolean) => void; }
const blankClient = { nombre: "", rfc: "", email: "", password: "" };
const blankRecord = { id: "", numero: "", plan: "", titulo: "", estado: "", fecha: "", notas: "" };

export default function AdminClients({ onEditingChange, onBusyChange }: Props) {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const [section, setSection] = useState<PortalSection>("lineas");
  const [records, setRecords] = useState<ClientRecord[]>([]);
  const [record, setRecord] = useState<typeof blankRecord | null>(null);
  const [newClient, setNewClient] = useState<typeof blankClient | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [refresh, setRefresh] = useState(0);
  const editing = newClient !== null || record !== null;
  useEffect(() => { onBusyChange(busy); return () => onBusyChange(false); }, [busy, onBusyChange]);
  useEffect(() => {
    onEditingChange(editing);
    if (!editing) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [editing, onEditingChange]);
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    void (async () => {
      setLoading(true);
      try {
        const result: ClientProfile[] = [];
        for (let offset = 0; ; offset += 500) {
          const { data, error: queryError } = await supabase!.from("clientes").select("id,rfc,nombre,email,active")
            .order("nombre").order("id").range(offset, offset + 499).abortSignal(controller.signal);
          if (queryError) throw queryError;
          result.push(...(data ?? [])); if (!data || data.length < 500) break;
        }
        if (!cancelled) setClients(result);
      } catch { if (!cancelled) setError("No se pudieron cargar los clientes. Ejecuta primero 05-portal-clientes.sql y comprueba tu conexión."); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; controller.abort(); };
  }, [refresh]);
  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController();
    let cancelled = false;
    void (async () => {
      setRecordsLoading(true); setRecords([]);
      try {
        const result = await loadClientRecords(section, selected, controller.signal);
        if (!cancelled) setRecords(result);
      } catch { if (!cancelled) setError("No se pudo cargar la información del cliente."); }
      finally { if (!cancelled) setRecordsLoading(false); }
    })();
    return () => { cancelled = true; controller.abort(); };
  }, [selected, section, refresh]);

  async function create(event: FormEvent) {
    event.preventDefault(); if (!newClient || busy) return;
    setError(""); setNotice("");
    try {
      const input = clientInput(newClient);
      setBusy(true);
      const data = await portalFunction("admin-create-client", input);
      setNotice("Cliente creado. Comunícale su RFC y contraseña inicial por un canal privado. La contraseña no se guarda en el panel ni se envía automáticamente.");
      setNewClient(null); setSelected(data.id); setRefresh((value) => value + 1);
    } catch (createError) { setError((createError as Error).message); }
    finally { setBusy(false); }
  }
  async function toggle(client: ClientProfile) {
    if (!supabase || busy || !window.confirm(`¿${client.active ? "Desactivar" : "Activar"} el acceso de ${client.nombre}?`)) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const { data, error: updateError } = await supabase.from("clientes").update({ active: !client.active }).eq("id", client.id).select("id").single();
      if (updateError || !data) throw new Error();
      setRefresh((value) => value + 1); setNotice("Acceso actualizado.");
    } catch { setError("No se pudo actualizar el acceso."); }
    finally { setBusy(false); }
  }
  async function saveRecord(event: FormEvent) {
    event.preventDefault(); if (!record || !supabase || busy || !selected) return;
    setBusy(true); setError(""); setNotice("");
    const payload: Record<string, string | null> = { cliente_id: selected, estado: record.estado.trim(), notas: record.notas.trim(),
      ...(section === "lineas" ? { numero: record.numero.trim(), plan: record.plan.trim() }
        : { titulo: record.titulo.trim(), fecha: record.fecha || null }) };
    try {
      const table = portalSections[section].table;
      const query = record.id ? supabase.from(table).update(payload).eq("id", record.id).eq("cliente_id", selected) : supabase.from(table).insert(payload);
      const { data, error: saveError } = await query.select("id").single();
      if (saveError || !data) throw new Error();
      setRecord(null); setRefresh((value) => value + 1); setNotice("Información guardada.");
    } catch { setError("No se pudo guardar la información. El formulario conserva tus cambios."); }
    finally { setBusy(false); }
  }
  async function deleteRecord(row: ClientRecord) {
    if (!supabase || busy || !window.confirm("¿Eliminar este registro del cliente? Esta acción no se puede deshacer.")) return;
    setBusy(true); setError("");
    try {
      const { data, error: deleteError } = await supabase.from(portalSections[section].table).delete().eq("id", row.id).eq("cliente_id", selected).select("id").single();
      if (deleteError || !data) throw new Error();
      setRefresh((value) => value + 1); setNotice("Registro eliminado.");
    } catch { setError("No se pudo eliminar el registro."); }
    finally { setBusy(false); }
  }
  function cancel() { if (window.confirm("¿Descartar los cambios sin guardar?")) { setRecord(null); setNewClient(null); setError(""); } }
  const selectedClient = clients.find((client) => client.id === selected);
  return <div className="admin-clients">
    <div className="admin-heading"><div><h2>Clientes</h2><p>Administra accesos y la información que verá cada cliente.</p></div>
      <button className="btn btn-solid" disabled={busy || editing} onClick={() => { setNewClient({ ...blankClient }); setNotice(""); setError(""); }}>Dar de alta cliente</button></div>
    {error && <p className="admin-error" role="alert">{error}</p>}{notice && <p className="catalog-notice" role="status">{notice}</p>}
    {newClient && <form className="admin-card" onSubmit={create}><h3>Nuevo acceso</h3><fieldset className="client-admin-fields" disabled={busy}>
      <div className="catalog-grid">{([['nombre', 'Nombre o razón social'], ['rfc', 'RFC'], ['email', 'Correo del cliente'], ['password', 'Contraseña inicial (mínimo 12 caracteres)']] as const).map(([key, label]) =>
        <label className="field catalog-field" key={key}><span>{label}</span><input required type={key === "password" ? "password" : key === "email" ? "email" : "text"}
          maxLength={key === "rfc" ? 13 : key === "password" ? 128 : key === "nombre" ? 200 : 254} minLength={key === "password" ? 12 : undefined}
          autoComplete={key === "password" ? "new-password" : "off"} value={newClient[key]} onChange={(e) => setNewClient({ ...newClient, [key]: key === "rfc" ? e.target.value.toUpperCase() : e.target.value })} /></label>)}</div>
      <p className="form-note">El correo debe ser propio del cliente para recuperar el acceso. No se permite el autorregistro.</p>
      <div className="admin-toolbar"><button className="btn btn-solid">{busy ? "Creando…" : "Crear acceso"}</button><button type="button" className="btn btn-line" onClick={cancel}>Cancelar</button></div>
    </fieldset></form>}
    <div className="admin-toolbar"><label className="field catalog-field"><span>Buscar cliente</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nombre o RFC" /></label>
      <button className="btn btn-line" disabled={busy || loading || editing} onClick={() => { setError(""); setRefresh((value) => value + 1); }}>Actualizar</button></div>
    {loading ? <p>Cargando clientes…</p> : <label className="field catalog-field"><span>Cliente</span><select value={selected} disabled={busy || editing} onChange={(e) => { setSelected(e.target.value); setNotice(""); setError(""); }}>
      <option value="">Selecciona un cliente</option>{clients.filter((client) => client.id === selected || `${client.nombre} ${client.rfc}`.toLowerCase().includes(search.toLowerCase())).map((client) =>
        <option value={client.id} key={client.id}>{client.nombre} · {client.rfc} {client.active ? "" : "(Inactivo)"}</option>)}</select></label>}
    {!loading && clients.length === 0 && <p>Aún no hay clientes dados de alta.</p>}
    {selectedClient && <>
      <div className="admin-card"><h3>{selectedClient.nombre}</h3><p>{selectedClient.rfc} · {selectedClient.email}</p><p>Acceso {selectedClient.active ? "activo" : "inactivo"}</p>
        <button className="btn btn-line" disabled={busy || editing} onClick={() => void toggle(selectedClient)}>{selectedClient.active ? "Desactivar acceso" : "Activar acceso"}</button></div>
      <div className="admin-toolbar">{(Object.keys(portalSections) as PortalSection[]).map((key) =>
        <button className={`btn ${key === section ? "btn-solid" : "btn-line"}`} disabled={busy || editing} key={key} onClick={() => setSection(key)}>{portalSections[key].label.replace("Mis ", "")}</button>)}
        <button className="btn btn-solid" disabled={busy || editing || recordsLoading} onClick={() => { setRecord({ ...blankRecord, estado: section === "lineas" ? "Activa" : section === "adendas" ? "Vigente" : "Pendiente" }); setError(""); setNotice(""); }}>Agregar registro</button></div>
      {record && <form className="admin-card" onSubmit={saveRecord}><h3>{record.id ? "Editar" : "Agregar"} registro</h3><fieldset className="client-admin-fields" disabled={busy}>
        <div className="catalog-grid">{(section === "lineas" ? [["numero", "Número de línea"], ["plan", "Plan"]] : [["titulo", "Título"], ["fecha", "Fecha"]]).map(([key, label]) =>
          <label className="field catalog-field" key={key}><span>{label}</span><input required={key === "numero" || key === "titulo"} maxLength={key === "numero" ? 30 : 200} type={key === "fecha" ? "date" : "text"}
            value={record[key as keyof typeof blankRecord]} onChange={(e) => setRecord({ ...record, [key]: e.target.value })} /></label>)}
          <label className="field catalog-field"><span>Estado</span><input required maxLength={100} value={record.estado} onChange={(e) => setRecord({ ...record, estado: e.target.value })} /></label></div>
        <label className="field catalog-field"><span>Detalle visible para el cliente</span><textarea maxLength={10000} value={record.notas} onChange={(e) => setRecord({ ...record, notas: e.target.value })} /></label>
        <div className="admin-toolbar"><button className="btn btn-solid">{busy ? "Guardando…" : "Guardar"}</button><button className="btn btn-line" type="button" onClick={cancel}>Cancelar</button></div>
      </fieldset></form>}
      {recordsLoading ? <p>Cargando información…</p> : records.length === 0 ? <p>No hay registros en esta sección.</p> : <div className="admin-list">{records.map((row) => <article className="admin-card" key={row.id}>
        <h3>{row.numero || row.titulo}</h3><p>{row.plan} · {row.estado} {row.fecha || ""}</p><p className="client-notes">{row.notas}</p>
        <div className="admin-toolbar"><button className="btn btn-line" disabled={busy || editing} onClick={() => setRecord({ ...blankRecord, ...row, numero: row.numero ?? "", plan: row.plan ?? "", titulo: row.titulo ?? "", fecha: row.fecha ?? "" })}>Editar</button>
          <button className="btn btn-line admin-delete-action" disabled={busy || editing} onClick={() => void deleteRecord(row)}>Eliminar</button></div>
      </article>)}</div>}
    </>}
  </div>;
}
