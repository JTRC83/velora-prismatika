/**
 * Convierte un texto con espacios y tildes en un "slug" lowercase,
 * sin acentos y con guiones en lugar de espacios.
 * Ejemplo: "Cábala Mística" → "cabala-mistica"
 */
export function slugify(str) {
  return str
    // descompone acentos en caracteres base + diacríticos
    .normalize("NFD")
    // elimina los diacríticos
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    // sustituye espacios y caracteres no alfanuméricos por guiones
    .replace(/[^a-z0-9]+/g, "-")
    // quita guiones al principio o final
    .replace(/(^-|-$)/g, "");
}