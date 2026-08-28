import { useState } from "react";

interface FaqItem {
  question: string;
  answer: string;
}

// Para agregar una pregunta nueva, copia y pega un bloque { question: "...", answer: "..." },
// entre llaves { } y con coma al final, dentro del arreglo de abajo.
const faqItems: FaqItem[] = [
  {
    question: "¿Qué necesito para contratar una línea nueva?",
    answer:
      "Identificación oficial vigente y comprobante de domicilio no mayor a 3 meses.",
  },
  {
    question: "¿Puedo cambiar de plan una vez contratado?",
    answer:
      "Sí, puedes subir o bajar de plan cuando lo necesites. El cambio suele aplicar a partir de tu siguiente ciclo de facturación.",
  },
  {
    question: "¿Cuánto tarda el proceso de portabilidad?",
    answer:
      "El proceso oficial puede tomar hasta 24 horas hábiles una vez que se valida tu solicitud ante el operador de origen.",
  },
  {
    question: "¿Cómo sé si hay cobertura en mi zona?",
    answer:
      "Contáctanos con tu ubicación o código postal y un asesor te confirma la cobertura disponible antes de que contrates cualquier plan.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Tarjeta de crédito o débito, transferencia y pago en efectivo en los puntos autorizados que te indicará tu asesor.",
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      style={{
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform .2s ease",
        flexShrink: 0,
      }}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function FaqAccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`faq-item ${open ? "open" : ""}`}>
      <button className="faq-question" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{item.question}</span>
        <ChevronIcon open={open} />
      </button>
      {open && <p className="faq-answer">{item.answer}</p>}
    </div>
  );
}

export default function Faqs() {
  return (
    <section className="faqs">
      <div className="wrap">
        <div className="faqs-head">
          <div className="kicker">Ayuda</div>
          <h1>Preguntas frecuentes</h1>
          <p>Resolvemos las dudas más comunes. Si no encuentras lo que buscas, escríbenos directamente.</p>
        </div>

        <div className="faq-list faqs-list-standalone">
          {faqItems.map((item) => (
            <FaqAccordionItem item={item} key={item.question} />
          ))}
        </div>

        <div className="faqs-cta">
          <div>
            <h3>¿No encontraste tu respuesta?</h3>
            <p>Un asesor de Nexus Mobile puede ayudarte directamente.</p>
          </div>
          <a href="/cotizacion" className="btn btn-solid">
            Contactar a un asesor
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}