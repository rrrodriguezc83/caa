/**
 * Interfaz del repositorio de Fechas Diagnósticas
 */
export class FechasDiagnosticasRepository {
  /**
   * Obtiene las evaluaciones diagnósticas por periodo
   * @param {string} tipe - Tipo de consulta (ej: '2')
   * @returns {Promise<Object>} { code, response: { "2026-1": [{ descripcion, fecha }], ... } }
   */
  async getEvaluacionesDiagnosticas(tipe) {
    throw new Error('FechasDiagnosticasRepository.getEvaluacionesDiagnosticas() not implemented');
  }

  /**
   * Obtiene las evaluaciones diagnósticas (listado con materias, felicitación, fechas)
   * @returns {Promise<Object>} { code, response: [{ materia, felicitacion, fechadiagnostica, state, ... }] }
   */
  async getDiagnosticasEvaluaciones() {
    throw new Error('FechasDiagnosticasRepository.getDiagnosticasEvaluaciones() not implemented');
  }

  /**
   * Actualiza/registra consulta de diagnóstica
   * @param {Object} params - { date, period, matter }
   * @returns {Promise<Object>}
   */
  async upDiagnostic(params) {
    throw new Error('FechasDiagnosticasRepository.upDiagnostic() not implemented');
  }

  /**
   * Obtiene el detalle/alert de diagnóstica
   * @param {string} date - fechaenvio
   * @returns {Promise<Object>} { code, response: [{ felicitacion, nombre, curso, fechadiagnostica, ... }] }
   */
  async getDiagnosticAlert(date) {
    throw new Error('FechasDiagnosticasRepository.getDiagnosticAlert() not implemented');
  }
}
