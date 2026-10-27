

import {
  products as fallbackProducts,
  type Product,
  type ProductColor,
  type ProductCapacity,
  type ProductSpec,
} from "../src/data/products.ts";

// Pega aquí la URL que te da Google Sheets al publicar como CSV
// (Archivo → Compartir → Publicar en la Web → formato CSV).
// Ver GOOGLE_SHEET_TEMPLATE.md para la guía completa de columnas y formatos.
export const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRvUfOqdPs9JvhDPtsdrxocZa-R8qs92Fa1DVOCImRYIj3DEa6vdJryjANd1_djbknlgTtwth_PQq77/pub?gid=168472726&single=true&output=csv";

const SPEC_CATEGORIES: { icon: ProductSpec["icon"]; label: string; column: string }[] = [
  { icon: "signal", label: "Red", column: "spec_red" },
  { icon: "display", label: "Pantalla", column: "spec_pantalla" },
  { icon: "memory", label: "Memoria (RAM y ROM)", column: "spec_memoria" },
  { icon: "camera", label: "Cámara", column: "spec_camara" },
  { icon: "cpu", label: "Procesador", column: "spec_procesador" },
  { icon: "os", label: "Sistema Operativo", column: "spec_so" },
  { icon: "wireless", label: "Conexiones Inalámbricas", column: "spec_conexiones" },
  { icon: "battery", label: "Batería", column: "spec_bateria" },
];

// Respaldo tomado de data/products.ts — solo se usa si el cliente deja una celda
// vacía en el Sheet (ej. un producto nuevo sin specs todavía).
const fallbackById = new Map(fallbackProducts.map((p) => [p.id, p]));
const fallbackSpecsById = new Map<string, Map<ProductSpec["icon"], string>>(
  fallbackProducts.map((p) => [p.id, new Map(p.specs.map((s) => [s.icon, s.value]))])
);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Formato: "256 GB:$27,999.00:$32,999.00:13 pagos de $2,153.77; 512 GB:$29,999.00; 1 TB"
// Solo el nombre es obligatorio — precio, precio anterior y mensualidad son opcionales.
function parseCapacities(raw: string | undefined, id: string): ProductCapacity[] {
  const fallback = fallbackById.get(id)?.capacities ?? [];
  if (!raw?.trim()) return fallback;

  return raw
    .split(";")
    .map((entry) => {
      const [label, price, oldPrice, monthlyPayment] = entry.split(":").map((s) => s.trim());
      return {
        label: label ?? "",
        price: price || undefined,
        oldPrice: oldPrice || undefined,
        monthlyPayment: monthlyPayment || undefined,
      };
    })
    .filter((c) => c.label);
}

// Formato: "Negro Titanio:#1A1A1D:https://img1.jpg|https://img2.jpg; Azul Titanio:#4A6B96"
// Solo se separan por los DOS PRIMEROS ":" — así los links con "https://" no rompen el formato,
// aunque también tengan dos puntos dentro.
function parseColors(raw: string | undefined, id: string): ProductColor[] {
  const fallback = fallbackById.get(id)?.colors ?? [];
  if (!raw?.trim()) return fallback;

  return raw
    .split(";")
    .map((entry) => {
      const trimmed = entry.trim();
      const firstColon = trimmed.indexOf(":");
      if (firstColon === -1) return { name: trimmed, hex: "#888888" };

      const name = trimmed.slice(0, firstColon).trim();
      const rest = trimmed.slice(firstColon + 1);
      const secondColon = rest.indexOf(":");

      if (secondColon === -1) {
        return { name, hex: rest.trim() || "#888888" };
      }

      const hex = rest.slice(0, secondColon).trim() || "#888888";
      const imagesRaw = rest.slice(secondColon + 1).trim();
      const images = imagesRaw ? imagesRaw.split("|").map((s) => s.trim()).filter(Boolean) : undefined;

      return { name, hex, images };
    })
    .filter((c) => c.name);
}

function buildSpecs(row: Record<string, string>, id: string): ProductSpec[] {
  const fallback = fallbackSpecsById.get(id);
  const specs: ProductSpec[] = [];

  for (const cat of SPEC_CATEGORIES) {
    const fromSheet = row[cat.column]?.trim();
    const value = fromSheet || fallback?.get(cat.icon);
    if (value) {
      specs.push({ icon: cat.icon, label: cat.label, value });
    }
  }

  return specs;
}

export function rowToProduct(row: Record<string, string>): Product {
  const name = row.name?.trim() ?? "";
  const image = row.image?.trim() ?? "";
  const galleryRaw = row.gallery?.trim();
  const gallery = galleryRaw
    ? galleryRaw.split("|").map((s) => s.trim()).filter(Boolean)
    : image
      ? [image]
      : [];

  const id = row.id?.trim() || slugify(name);

  return {
    id,
    brand: row.brand?.trim() ?? "",
    model: row.model?.trim() ?? "",
    name,
    tag: row.tag?.trim() || undefined,
    description: row.description?.trim() ?? "",
    price: row.price?.trim() ?? "",
    oldPrice: row.oldPrice?.trim() || undefined,
    monthlyPayment: row.monthlyPayment?.trim() || undefined,
    image,
    gallery,
    capacities: parseCapacities(row.capacities, id),
    colors: parseColors(row.colors, id),
    simTypes: parseList(row.simTypes),
    specs: buildSpecs(row, id),
  };
}


