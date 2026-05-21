/**
 * Convierte un número serial de Excel a fecha ISO (YYYY-MM-DD).
 * Excel usa 1 = 1900-01-01, 25569 ≈ 1970-01-01
 *
 * @param {number} serial - Número serial de Excel
 * @returns {string|null} Fecha en formato YYYY-MM-DD o null si inválido
 */
export function excelSerialToISO(serial) {
  if (serial == null || serial === '' || isNaN(Number(serial))) return null;
  const n = Number(serial);
  // Excel epoch: 25569 = 1970-01-01 en días Unix
  const unixMs = (n - 25569) * 86400 * 1000;
  const d = new Date(unixMs);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
