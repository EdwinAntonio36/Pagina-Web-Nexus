import { useState, type FormEvent } from "react";

interface FormData {
  nombre: string;
  telefono: string;
  email: string;
  interes: string;
  mensaje: string;
}

interface FormErrors {
  nombre?: string;
  telefono?: string;
  email?: string;
  interes?: string;
}

type Status = "idle" | "submitting" | "success" | "error";

const initialData: FormData = {
  nombre: "",
  telefono: "",
  email: "",
  interes: "",
  mensaje: "",
};

function esTextoRepetitivo(valor: string): boolean {
  const limpio = valor.trim().toLowerCase();
  if (limpio.length < 3) return false;
  const soloUnCaracter = /^(.)\1+$/.test(limpio);
  const patronRepetido = /^(.{1,4})\1{2,}$/.test(limpio);
  return soloUnCaracter || patronRepetido;
}

function validar(data: FormData): FormErrors {
  const errors: FormErrors = {};

  if (data.nombre.trim().length < 2 || esTextoRepetitivo(data.nombre)) {
    errors.nombre = "Escribe tu nombre completo.";
  }

  const telDigits = data.telefono.replace(/\D/g, "");
  if (telDigits.length !== 10 || esTextoRepetitivo(telDigits)) {
    errors.telefono = "Ingresa un teléfono válido a 10 dígitos.";
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim());
  if (!emailOk) {
    errors.email = "Ingresa un correo válido.";
  }

  if (!data.interes) {
    errors.interes = "Selecciona una opción.";
  }

  return errors;
}

export default function ContactForm() {
  const [data, setData] = useState<FormData>(initialData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>("idle");

  function updateField<K extends keyof FormData>(field: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const validationErrors = validar(data);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus("submitting");

    try {
      const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz7YqXsDBO1TWSX1GEd1lV0nUXqDkl1Q6R9D1aTHSigBJ2FcXYKvtcbeu4EdnF5Ozh_/exec";

      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // Apps Script no soporta CORS normal — necesario para que funcione
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      setStatus("success");
      setData(initialData);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="form-success">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <circle cx="12" cy="12" r="10" />
          <path d="M8 12l3 3 5-6" />
        </svg>
        <h3>¡Listo, recibimos tu solicitud!</h3>
        <p>Un asesor de Nexus Mobile te contactará en breve.</p>
        <button className="btn btn-line" onClick={() => setStatus("idle")}>
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="row2">
        <div className={`field ${errors.nombre ? "invalid" : ""}`}>
          <label htmlFor="nombre">Nombre completo</label>
          <input
            id="nombre"
            type="text"
            placeholder="Tu nombre"
            value={data.nombre}
            onChange={(e) => updateField("nombre", e.target.value)}
          />
          {errors.nombre && <span className="err">{errors.nombre}</span>}
        </div>

        <div className={`field ${errors.telefono ? "invalid" : ""}`}>
          <label htmlFor="telefono">Teléfono</label>
          <input
            id="telefono"
            type="tel"
            placeholder="10 dígitos"
            value={data.telefono}
            onChange={(e) => updateField("telefono", e.target.value)}
          />
          {errors.telefono && <span className="err">{errors.telefono}</span>}
        </div>
      </div>

      <div className={`field ${errors.email ? "invalid" : ""}`}>
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          placeholder="tucorreo@ejemplo.com"
          value={data.email}
          onChange={(e) => updateField("email", e.target.value)}
        />
        {errors.email && <span className="err">{errors.email}</span>}
      </div>

      <div className={`field ${errors.interes ? "invalid" : ""}`}>
        <label htmlFor="interes">¿Qué te interesa?</label>
        <select
          id="interes"
          value={data.interes}
          onChange={(e) => updateField("interes", e.target.value)}
        >
          <option value="">Selecciona una opción</option>
          <option value="linea-nueva">Línea nueva</option>
          <option value="portabilidad">Portabilidad</option>
          <option value="equipo">Compra de equipo</option>
          <option value="empresarial">Plan empresarial</option>
        </select>
        {errors.interes && <span className="err">{errors.interes}</span>}
      </div>

      <div className="field">
        <label htmlFor="mensaje">Mensaje (opcional)</label>
        <textarea
          id="mensaje"
          placeholder="Cuéntanos algo más, por ejemplo tu compañía actual o el equipo que buscas"
          value={data.mensaje}
          onChange={(e) => updateField("mensaje", e.target.value)}
        />
      </div>

      <button type="submit" className="btn btn-solid" style={{ width: "100%", justifyContent: "center" }} disabled={status === "submitting"}>
        {status === "submitting" ? "Enviando..." : "Solicitar cotización"}
      </button>

      {status === "error" && (
        <p className="form-note" style={{ color: "#FF7A7A" }}>
          Algo falló al enviar tu solicitud. Intenta de nuevo en unos minutos.
        </p>
      )}
      <p className="form-note">Al enviar aceptas que te contactemos para darte seguimiento a tu solicitud.</p>
    </form>
  );
}