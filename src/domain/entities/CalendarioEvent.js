/**
 * Entidad de dominio: Evento del Calendario Académico
 *
 * @property {string} id - Identificador único
 * @property {string} actividad - Nombre de la actividad
 * @property {string} fechaInicio - Fecha de inicio (ISO YYYY-MM-DD)
 * @property {string|null} fechaFin - Fecha fin (ISO YYYY-MM-DD) o null si es día único
 * @property {string} ambito - GEN|PRI|PRE|BAC|TRA (General, Primaria, Preescolar, Bachillerato, Transversal)
 */
export class CalendarioEvent {
  constructor({ id, actividad, fechaInicio, fechaFin, ambito }) {
    this.id = id;
    this.actividad = actividad;
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin ?? null;
    this.ambito = ambito;
  }

  /** Indica si el evento es de varios días */
  get esRango() {
    return Boolean(this.fechaFin);
  }

  /** Descripción legible del ámbito */
  get ambitoLabel() {
    const labels = { GEN: 'General', PRI: 'Primaria', PRE: 'Preescolar', BAC: 'Bachillerato', TRA: 'Transversal' };
    return labels[this.ambito] ?? this.ambito;
  }
}
