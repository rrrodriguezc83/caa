/**
 * Entidad de dominio: Reporte de Enfermería
 */
export class NursingReport {
  constructor({ reason, date, hourEntry, hourOut, procedure, observation, enfermera }) {
    this.reason = reason;
    this.date = date;
    this.hourEntry = hourEntry;
    this.hourOut = hourOut;
    this.procedure = procedure;
    this.observation = observation;
    this.enfermera = enfermera;
  }
}
