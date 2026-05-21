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
   * Obtiene la lista de encuestas (mismo endpoint getNotices con surveys true)
   * @returns {Promise<Object>}
   */
  async getNoticesSurveys() {
    throw new Error('CircularRepository.getNoticesSurveys() not implemented');
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

  /**
   * Obtiene la definición de una encuesta para renderizar (secciones, preguntas, opciones).
   * @param {string|number} num_survey - Identificador de la encuesta
   * @returns {Promise<Object>}
   */
  async getSurveyDefinitionForRender(num_survey) {
    throw new Error('CircularRepository.getSurveyDefinitionForRender() not implemented');
  }

  /**
   * Datos de encuesta del usuario (Date_Start, Date_End, Answer, Course, Names, etc.)
   * @param {string|number} num_survey - Número de circular/encuesta
   * @returns {Promise<Object>}
   */
  async dataSurvey(num_survey) {
    throw new Error('CircularRepository.dataSurvey() not implemented');
  }
}
