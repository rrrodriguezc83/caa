/**
 * Interfaz del repositorio de circulares
 */
export class CircularRepository {
  /**
   * Obtiene la lista de circulares
   * @returns {Promise<Object>}
   */
  async getNotices() {
    throw new Error('CircularRepository.getNotices() not implemented');
  }

  /**
   * Obtiene el contenido de una circular específica
   * @param {string} circularNumber - Número de la circular
   * @returns {Promise<Object>}
   */
  async getNoticeContent(circularNumber) {
    throw new Error('CircularRepository.getNoticeContent() not implemented');
  }

  /**
   * Registra la consulta de una circular
   * @param {string} circularNumber - Número de la circular
   * @returns {Promise<Object>}
   */
  async sendConsult(circularNumber) {
    throw new Error('CircularRepository.sendConsult() not implemented');
  }
}
