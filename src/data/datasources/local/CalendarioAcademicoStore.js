import { CalendarioEvent } from '../../../domain/entities/CalendarioEvent';

/**
 * Seed del Calendario Académico (extraído de Calendario_Academico.xlsx).
 * Columnas: Actividad, Fecha Inicio, Fecha Fin, Ambito
 * Ámbitos: GEN (General), PRI (Primaria), PRE (Preescolar), BAC (Bachillerato), TRA (Transversal)
 */
const SEED = [
  { id: 'evt-1', actividad: 'Planeacion Institucional', fechaInicio: '2026-01-14', fechaFin: '2026-01-23', ambito: 'GEN' },
  { id: 'evt-2', actividad: 'Primer Trimestre Primaria y Preescolar', fechaInicio: '2026-01-26', fechaFin: '2026-04-23', ambito: 'PRI' },
  { id: 'evt-3', actividad: 'Primer Trimestre Primaria y Preescolar', fechaInicio: '2026-01-26', fechaFin: '2026-04-23', ambito: 'PRE' },
  { id: 'evt-4', actividad: 'Primer Trimestr Bachillerato', fechaInicio: '2026-01-20', fechaFin: '2026-04-23', ambito: 'BAC' },
  { id: 'evt-5', actividad: 'Segundo Trimestre', fechaInicio: '2026-04-26', fechaFin: '2026-08-13', ambito: 'GEN' },
  { id: 'evt-6', actividad: 'Tercer Trimestre', fechaInicio: '2026-08-17', fechaFin: '2026-11-18', ambito: 'GEN' },
  { id: 'evt-7', actividad: 'Seguimientos Académicos', fechaInicio: '2026-03-02', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-8', actividad: 'Seguimientos Académicos', fechaInicio: '2026-06-01', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-9', actividad: 'Seguimientos Académicos', fechaInicio: '2026-09-21', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-10', actividad: 'Evaluaciones Trimestrales', fechaInicio: '2026-04-06', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-11', actividad: 'Evaluaciones Trimestrales', fechaInicio: '2026-04-08', fechaFin: '2026-04-15', ambito: 'GEN' },
  { id: 'evt-12', actividad: 'Evaluaciones Trimestrales', fechaInicio: '2026-07-28', fechaFin: '2026-08-05', ambito: 'GEN' },
  { id: 'evt-13', actividad: 'Evaluaciones Trimestrales', fechaInicio: '2026-11-02', fechaFin: '2026-11-10', ambito: 'GEN' },
  { id: 'evt-14', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-02-03', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-15', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-02-10', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-16', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-02-17', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-17', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-02-24', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-18', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-03-10', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-19', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-03-17', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-20', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-03-24', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-21', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-04-07', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-22', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-05-05', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-23', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-05-12', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-24', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-05-19', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-25', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-05-26', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-26', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-06-09', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-27', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-07-07', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-28', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-07-14', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-29', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-07-21', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-30', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-08-25', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-31', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-09-01', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-32', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-09-08', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-33', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-09-15', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-34', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-09-29', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-35', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-10-13', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-36', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-10-20', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-37', actividad: 'Actividades Extracurriculares y estudio Dirigido', fechaInicio: '2026-10-27', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-38', actividad: 'Comisiones pedagógicas', fechaInicio: '2026-04-20', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-39', actividad: 'Comisiones pedagógicas', fechaInicio: '2026-08-11', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-40', actividad: 'Comisiones pedagógicas', fechaInicio: '2026-11-23', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-41', actividad: 'Reunión Padres', fechaInicio: '2026-04-24', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-42', actividad: 'Reunión Padres', fechaInicio: '2026-05-08', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-43', actividad: 'Reunión Padres', fechaInicio: '2026-08-21', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-44', actividad: 'Reunión Padres', fechaInicio: '2026-11-25', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-45', actividad: 'Conferencia de Padres Online', fechaInicio: '2026-01-26', fechaFin: '2026-01-27', ambito: 'GEN' },
  { id: 'evt-46', actividad: 'Conferencia de Padres Online', fechaInicio: '2026-05-12', fechaFin: '2026-05-13', ambito: 'GEN' },
  { id: 'evt-47', actividad: 'Asamblea de Padres', fechaInicio: '2026-01-23', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-48', actividad: 'Asamblea de Padres', fechaInicio: '2026-01-30', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-49', actividad: 'Asamblea de Padres', fechaInicio: '2026-07-10', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-50', actividad: 'Asamblea de Padres', fechaInicio: '2026-07-24', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-51', actividad: 'Asamblea de Padres', fechaInicio: '2026-08-21', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-52', actividad: 'Asamblea de Padres', fechaInicio: '2026-08-28', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-53', actividad: 'Vacaciones', fechaInicio: '2026-03-29', fechaFin: '2026-04-02', ambito: 'GEN' },
  { id: 'evt-54', actividad: 'Vacaciones', fechaInicio: '2026-06-14', fechaFin: '2026-07-02', ambito: 'GEN' },
  { id: 'evt-55', actividad: 'Vacaciones', fechaInicio: '2026-10-04', fechaFin: '2026-10-08', ambito: 'GEN' },
  { id: 'evt-56', actividad: 'Dia del maestro', fechaInicio: '2026-05-14', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-57', actividad: 'Días de refuerzo', fechaInicio: '2026-11-16', fechaFin: '2026-11-18', ambito: 'GEN' },
  { id: 'evt-58', actividad: 'Actividades de Superacion', fechaInicio: '2026-11-19', fechaFin: '2026-11-22', ambito: 'GEN' },
  { id: 'evt-59', actividad: 'Foro Angloamericanista', fechaInicio: '2026-05-06', fechaFin: '2026-05-07', ambito: 'GEN' },
  { id: 'evt-60', actividad: 'Modelo de la ONU', fechaInicio: '2026-10-21', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-61', actividad: 'Clausuras y finalización del año escolar', fechaInicio: '2026-11-24', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-62', actividad: 'Grados', fechaInicio: '2026-11-26', fechaFin: null, ambito: 'GEN' },
  { id: 'evt-63', actividad: 'Dia Deportivo', fechaInicio: '2026-02-26', fechaFin: null, ambito: 'BAC' },
  { id: 'evt-64', actividad: 'Dia Deportivo', fechaInicio: '2026-08-27', fechaFin: null, ambito: 'BAC' },
  { id: 'evt-65', actividad: 'Dia Deportivo', fechaInicio: '2026-10-29', fechaFin: null, ambito: 'BAC' },
  { id: 'evt-66', actividad: 'Dia Deportivo', fechaInicio: '2026-04-16', fechaFin: null, ambito: 'PRI' },
  { id: 'evt-67', actividad: 'Dia Deportivo', fechaInicio: '2026-07-23', fechaFin: null, ambito: 'PRI' },
  { id: 'evt-68', actividad: 'Dia Deportivo', fechaInicio: '2026-09-17', fechaFin: null, ambito: 'PRI' },
  { id: 'evt-69', actividad: 'Dia Deportivo', fechaInicio: '2026-02-26', fechaFin: null, ambito: 'PRE' },
  { id: 'evt-70', actividad: 'Dia Deportivo', fechaInicio: '2026-03-19', fechaFin: null, ambito: 'PRE' },
  { id: 'evt-71', actividad: 'Dia Deportivo', fechaInicio: '2026-06-11', fechaFin: null, ambito: 'PRE' },
  { id: 'evt-72', actividad: 'Dia Cultural - Matemáticas y Ciencias', fechaInicio: '2026-03-19', fechaFin: null, ambito: 'BAC' },
  { id: 'evt-73', actividad: 'Dia Cultural -  Día del Idioma', fechaInicio: '2026-04-16', fechaFin: null, ambito: 'BAC' },
  { id: 'evt-74', actividad: 'Dia Cultural - Día del Arte', fechaInicio: '2026-06-11', fechaFin: null, ambito: 'BAC' },
  { id: 'evt-75', actividad: 'Dia Cultural - Día del Estudiante', fechaInicio: '2026-07-23', fechaFin: null, ambito: 'BAC' },
  { id: 'evt-76', actividad: 'Dia Cultural - Día Física y Tecnoligía', fechaInicio: '2026-09-17', fechaFin: null, ambito: 'BAC' },
  { id: 'evt-77', actividad: 'Dia Cultural - Día Math y Tecnología', fechaInicio: '2026-02-26', fechaFin: null, ambito: 'PRI' },
  { id: 'evt-78', actividad: 'Dia Cultural - Día del Idioma', fechaInicio: '2026-03-19', fechaFin: null, ambito: 'PRI' },
  { id: 'evt-79', actividad: 'Dia Cultural - Día Sociociencias', fechaInicio: '2026-06-11', fechaFin: null, ambito: 'PRI' },
  { id: 'evt-80', actividad: 'Dia Cultural - Día Arte e Inglés', fechaInicio: '2026-08-27', fechaFin: null, ambito: 'PRI' },
  { id: 'evt-81', actividad: 'Dia Cultural - Día del Estudiante', fechaInicio: '2026-10-29', fechaFin: null, ambito: 'PRI' },
  { id: 'evt-82', actividad: 'Dia Cultural - Día Preescolar', fechaInicio: '2026-04-16', fechaFin: null, ambito: 'PRE' },
  { id: 'evt-83', actividad: 'Dia Cultural - Día Math y Tecnología', fechaInicio: '2026-07-23', fechaFin: null, ambito: 'PRE' },
  { id: 'evt-84', actividad: 'Dia Cultural - Día del Inglés', fechaInicio: '2026-08-27', fechaFin: null, ambito: 'PRE' },
  { id: 'evt-85', actividad: 'Dia Cultural - Día del Arte', fechaInicio: '2026-09-17', fechaFin: null, ambito: 'PRE' },
  { id: 'evt-86', actividad: 'Dia Cultural - Día del Estudiante', fechaInicio: '2026-10-29', fechaFin: null, ambito: 'PRE' },
  { id: 'evt-87', actividad: 'Show de talentos', fechaInicio: '2026-07-15', fechaFin: null, ambito: 'TRA' },
  { id: 'evt-88', actividad: 'Show de talentos', fechaInicio: '2026-10-19', fechaFin: null, ambito: 'GEN' },
];

/**
 * Base de datos en memoria para el Calendario Académico.
 * Almacena eventos con estructura: id, actividad, fechaInicio, fechaFin, ambito
 */
class CalendarioAcademicoStore {
  constructor() {
    this._events = new Map();
    SEED.forEach((row) => {
      const event = new CalendarioEvent(row);
      this._events.set(event.id, event);
    });
  }

  /**
   * Obtiene todos los eventos
   * @returns {CalendarioEvent[]}
   */
  getAll() {
    return Array.from(this._events.values());
  }

  /**
   * Busca un evento por id
   * @param {string} id
   * @returns {CalendarioEvent|null}
   */
  getById(id) {
    return this._events.get(id) ?? null;
  }

  /**
   * Filtra por ámbito (GEN, PRI, PRE, BAC, TRA)
   * @param {string} ambito
   * @returns {CalendarioEvent[]}
   */
  getByAmbito(ambito) {
    return this.getAll().filter((e) => e.ambito === ambito);
  }

  /**
   * Obtiene eventos que coinciden con una fecha (incluye rangos)
   * @param {string} dateISO - Fecha en formato YYYY-MM-DD
   * @returns {CalendarioEvent[]}
   */
  getByDate(dateISO) {
    return this.getAll().filter((e) => {
      if (e.fechaInicio === dateISO) return true;
      if (!e.fechaFin) return false;
      return dateISO >= e.fechaInicio && dateISO <= e.fechaFin;
    });
  }

  /**
   * Obtiene eventos en un rango de fechas
   * @param {string} startISO - Inicio (YYYY-MM-DD)
   * @param {string} endISO - Fin (YYYY-MM-DD)
   * @returns {CalendarioEvent[]}
   */
  getByDateRange(startISO, endISO) {
    return this.getAll().filter((e) => {
      if (!e.fechaFin) return e.fechaInicio >= startISO && e.fechaInicio <= endISO;
      return e.fechaInicio <= endISO && e.fechaFin >= startISO;
    });
  }

  /**
   * Agrega o actualiza un evento
   * @param {Object} data
   * @returns {CalendarioEvent}
   */
  upsert(data) {
    const id = data.id ?? `evt-${Date.now()}`;
    const event = new CalendarioEvent({ ...data, id });
    this._events.set(id, event);
    return event;
  }

  /**
   * Elimina un evento
   * @param {string} id
   * @returns {boolean}
   */
  remove(id) {
    return this._events.delete(id);
  }

  /**
   * Obtiene los ámbitos únicos
   * @returns {string[]}
   */
  getAmbitos() {
    const set = new Set(this.getAll().map((e) => e.ambito));
    return Array.from(set).sort();
  }
}

const instance = new CalendarioAcademicoStore();

export { CalendarioAcademicoStore, instance as calendarioAcademicoStore };
