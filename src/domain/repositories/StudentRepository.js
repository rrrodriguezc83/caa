/**
 * Interfaz del repositorio de estudiante
 */
export class StudentRepository {
  /**
   * Obtiene la información del estudiante (curso)
   * @returns {Promise<Object>}
   */
  async getInfoStudent() {
    throw new Error('StudentRepository.getInfoStudent() not implemented');
  }

  /**
   * Obtiene la lista de trabajos del estudiante
   * @param {string} course - Código del curso
   * @returns {Promise<Object>}
   */
  async getListWorks(course) {
    throw new Error('StudentRepository.getListWorks() not implemented');
  }

  /**
   * Obtiene la lista de recordatorios del estudiante
   * @param {string} course - Código del curso
   * @returns {Promise<Object>}
   */
  async getListReminders(course) {
    throw new Error('StudentRepository.getListReminders() not implemented');
  }
}
