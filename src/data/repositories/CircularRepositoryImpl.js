import { CircularRepository } from '../../domain/repositories/CircularRepository';
import { API_URLS } from '../../shared/constants/apiRoutes';

/**
 * Implementación concreta del repositorio de circulares
 */
export class CircularRepositoryImpl extends CircularRepository {
  constructor(apiClient) {
    super();
    this.apiClient = apiClient;
  }

  async getNotices() {
    const data = await this.apiClient.post(API_URLS.NOTICES, {
      base: 'comunidad',
      param: 'getNotices',
      surveys: 'false',
    });

    return data;
  }

  async getNoticesSurveys() {
    const data = await this.apiClient.post(API_URLS.NOTICES, {
      base: 'comunidad',
      param: 'getNotices',
      surveys: 'true',
    });
    return data;
  }

  async getNoticeContent(circularNumber) {
    // Codificar el número de circular en base64
    const noticeBase64 = typeof btoa !== 'undefined'
      ? btoa(circularNumber)
      : Buffer.from(circularNumber).toString('base64');

    const data = await this.apiClient.post(API_URLS.NOTICES, {
      base: 'comunidad',
      param: 'getNoticeContent',
      notice: noticeBase64,
    });

    return data;
  }

  async sendConsult(circularNumber) {
    const data = await this.apiClient.post(API_URLS.NOTICES, {
      base: 'comunidad',
      param: 'sendConsult',
      num_notice: circularNumber,
    });

    return data;
  }

  /**
   * Encuestas: getSurveyDefinitionForRender (base encuestas, form-data).
   * Guarda/retorna JSON con encuesta, secciones, preguntas, opciones, logica.
   */
  async getSurveyDefinitionForRender(num_survey) {
    const data = await this.apiClient.post(API_URLS.NOTICES, {
      base: 'encuestas',
      param: 'getSurveyDefinitionForRender',
      num_survey: String(num_survey),
    });
    return data;
  }

  /**
   * Encuestas: dataSurvey (base comunidad) — Date_Start, Date_End, Answer, Course, Names...
   */
  async dataSurvey(num_survey) {
    const data = await this.apiClient.post(API_URLS.NOTICES, {
      base: 'comunidad',
      param: 'dataSurvey',
      num_survey: String(num_survey),
    });
    return data;
  }
}
