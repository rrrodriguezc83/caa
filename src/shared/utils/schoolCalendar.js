/**
 * Utilidades del calendario escolar (getCalendar API) para day_school por fecha.
 */

export const getTodayLocal = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const isWeekend = (dateString) => {
  const [year, month, day] = dateString.split('-');
  const dayOfWeek = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10)).getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
};

export const getNextBusinessDay = (dateString) => {
  const [year, month, day] = dateString.split('-');
  let date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 6) date.setDate(date.getDate() + 2);
  else if (dayOfWeek === 0) date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Siguiente día lectivo (lun–vie) a partir de mañana respecto a dateString.
 * Ej.: martes → miércoles; viernes → lunes; sábado → lunes.
 * @param {string} dateString YYYY-MM-DD (típicamente hoy)
 */
export const getNextSchoolDayDate = (dateString) => {
  const [y, m, d] = dateString.split('-').map(Number);
  let date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + 1);
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/**
 * Obtiene day_school para una fecha YYYY-MM-DD desde la respuesta de getCalendar.
 * @param {Object|null} calendarData
 * @param {string} dateString
 * @returns {number|string|null}
 */
/**
 * Mes en calendario API puede venir como número o string ("3", "03").
 */
const getMonthBucket = (calendarData, monthStr) => {
  const n = parseInt(monthStr, 10);
  const padded = String(n).padStart(2, '0');
  return (
    calendarData[n] ||
    calendarData[String(n)] ||
    calendarData[padded] ||
    null
  );
};

export const findDaySchool = (calendarData, dateString) => {
  if (!calendarData || !dateString) return null;
  const [, month, day] = dateString.split('-');
  const dayNum = parseInt(day, 10);
  const bucket = getMonthBucket(calendarData, month);
  if (!bucket?.data_days) return null;
  for (const weekNum in bucket.data_days) {
    const weekData = bucket.data_days[weekNum];
    if (!weekData || typeof weekData !== 'object') continue;
    for (const dayKey in weekData) {
      const cell = weekData[dayKey];
      if (!cell) continue;
      if (parseInt(cell.day, 10) === dayNum) return cell.day_school;
    }
  }
  return null;
};

/**
 * Día de la semana alineado con Firestore horario[].dia: lun=1 … sáb=6 (Date.getDay).
 * Domingo = 0 (no lectivo típico en este modelo).
 */
export const getWeekdayDiaForSchedule = (dateString) => {
  const [y, m, d] = dateString.split('-').map(Number);
  if (!y || !m || !d) return null;
  const dow = new Date(y, m - 1, d).getDay();
  if (dow >= 1 && dow <= 6) return dow;
  return null;
};

/**
 * @param {number|string} codigo_uniforme
 * @returns {string|null}
 */
export const uniformeLabelFromCodigo = (codigo) => {
  const n = Number(codigo);
  if (n === 1) return 'Uniforme: Diario';
  if (n === 2) return 'Uniforme: Sudadera';
  return null;
};
