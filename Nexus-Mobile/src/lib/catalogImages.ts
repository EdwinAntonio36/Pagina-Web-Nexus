export const CATALOG_BUCKET = "catalogo";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

export async function validateImage(file: File): Promise<string> {
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) throw new Error(`${file.name}: elige una imagen de hasta 5 MB.`);
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const match = (offset: number, values: number[]) => values.every((value, i) => bytes[offset + i] === value);
  if (file.type === "image/jpeg" && match(0, [255, 216, 255])) return "jpg";
  if (file.type === "image/png" && match(0, [137, 80, 78, 71, 13, 10, 26, 10])) return "png";
  if (file.type === "image/webp" && match(0, [82, 73, 70, 70]) && match(8, [87, 69, 66, 80])) return "webp";
  throw new Error(`${file.name}: el archivo debe ser una imagen JPG, PNG o WebP válida.`);
}
