export function normalizeRfc(value: unknown): string {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}
export function validRfc(value: string): boolean {
  return /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/.test(value);
}
export function clientInput(input: Record<string, unknown>) {
  const rfc = normalizeRfc(input.rfc);
  const nombre = typeof input.nombre === "string" ? input.nombre.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";
  if (!validRfc(rfc)) throw new Error("Escribe un RFC de 12 o 13 caracteres válido.");
  if (nombre.length < 2 || nombre.length > 200) throw new Error("El nombre debe tener entre 2 y 200 caracteres.");
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Escribe un correo válido.");
  if (password.length < 12 || password.length > 128) throw new Error("La contraseña inicial debe tener entre 12 y 128 caracteres.");
  return { rfc, nombre, email, password };
}
