import type { Product } from "../data/products";

export interface CatalogProduct extends Product {
  active: boolean;
  sort_order: number;
}

export function emptyProduct(): CatalogProduct {
  return {
    id: "", name: "", brand: "", model: "", description: "", price: "", image: "",
    gallery: [], capacities: [], colors: [], simTypes: [], specs: [], active: false, sort_order: 0,
  };
}

export const specIcons = ["signal", "display", "memory", "camera", "cpu", "os", "wireless", "battery"] as const;

export function imagePathIsValid(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

export function prepareProduct(input: CatalogProduct): CatalogProduct {
  const trim = (value: string | null | undefined) => value?.trim() || "";
  const optional = (value: string | null | undefined) => trim(value) || undefined;
  const product: CatalogProduct = {
    active: input.active, sort_order: input.sort_order,
    id: trim(input.id), name: trim(input.name), brand: trim(input.brand), model: trim(input.model),
    description: trim(input.description), price: trim(input.price), image: trim(input.image),
    tag: optional(input.tag), oldPrice: optional(input.oldPrice), monthlyPayment: optional(input.monthlyPayment),
    gallery: input.gallery.map(trim).filter(Boolean),
    capacities: input.capacities.map((c) => ({ label: trim(c.label), price: optional(c.price),
      oldPrice: optional(c.oldPrice), monthlyPayment: optional(c.monthlyPayment) })),
    colors: input.colors.map((c) => ({ name: trim(c.name), hex: trim(c.hex), images: c.images?.map(trim).filter(Boolean) })),
    simTypes: input.simTypes.map(trim).filter(Boolean),
    specs: input.specs.map((s) => ({ ...s, label: trim(s.label), value: trim(s.value) })),
  };
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(product.id)) throw new Error("El identificador debe usar letras minúsculas, números y guiones, por ejemplo iphone-17-pro.");
  if (!product.name || !product.brand) throw new Error("Escribe el nombre y la marca.");
  const money = /^(?:\$\s*)?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/;
  const checkPrice = (value: string | undefined, label: string) => {
    if (value && !money.test(value)) throw new Error(`${label}: usa un importe como $12,999.00 o 12999.`);
  };
  if (!product.price) throw new Error("El precio es obligatorio.");
  checkPrice(product.price, "Precio"); checkPrice(product.oldPrice, "Precio anterior");
  if (!Number.isSafeInteger(product.sort_order) || product.sort_order < 0) throw new Error("El orden debe ser un entero mayor o igual a cero.");
  if (!imagePathIsValid(product.image)) throw new Error("La imagen principal debe ser una URL https:// o una ruta como /equipo.png.");
  if (!product.gallery.length) product.gallery = [product.image];
  const unique = (values: string[], label: string) => {
    if (values.some((v) => !v) || new Set(values.map((v) => v.toLowerCase())).size !== values.length) {
      throw new Error(`${label}: completa los nombres y evita duplicados.`);
    }
  };
  unique(product.capacities.map((c) => c.label), "Capacidades");
  unique(product.colors.map((c) => c.name), "Colores");
  unique(product.simTypes, "Tipos de SIM");
  unique(product.specs.map((s) => s.label), "Características");
  for (const c of product.capacities) { checkPrice(c.price, "Precio de capacidad"); checkPrice(c.oldPrice, "Precio anterior de capacidad"); }
  for (const c of product.colors) if (!/^#[0-9a-f]{6}$/i.test(c.hex)) throw new Error("Cada color debe tener un código de seis dígitos, por ejemplo #1A1A1D.");
  if (product.specs.some((s) => !s.value || !specIcons.includes(s.icon))) throw new Error("Completa el valor de cada característica.");
  if ([...product.gallery, ...product.colors.flatMap((c) => c.images ?? [])].some((image) => !imagePathIsValid(image))) {
    throw new Error("Las imágenes deben usar URLs https:// o rutas que comiencen con /.");
  }
  return product;
}

// Enviar null explícito permite borrar campos opcionales ya existentes.
export function productPayload(product: CatalogProduct) {
  return { ...product, tag: product.tag || null, oldPrice: product.oldPrice || null,
    monthlyPayment: product.monthlyPayment || null };
}
