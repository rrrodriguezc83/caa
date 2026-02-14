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
    console.log('=== getNotices ===');

    const data = await this.apiClient.post(API_URLS.NOTICES, {
      base: 'comunidad',
      param: 'getNotices',
      surveys: 'false',
    });

    console.log('Circulares recibidas:', data);
    return data;
  }

  async getNoticeContent(circularNumber) {
    console.log('=== getNoticeContent ===');
    console.log('  - circular:', circularNumber);

    // Codificar el número de circular en base64
    const noticeBase64 = typeof btoa !== 'undefined'
      ? btoa(circularNumber)
      : Buffer.from(circularNumber).toString('base64');

    const data = await this.apiClient.post(API_URLS.NOTICES, {
      base: 'comunidad',
      param: 'getNoticeContent',
      notice: noticeBase64,
    });

    console.log('Contenido de circular recibido:', data);
    return data;
  }

  async sendConsult(circularNumber) {
    console.log('=== sendConsult ===');
    console.log('  - num_notice:', circularNumber);

    const data = await this.apiClient.post(API_URLS.NOTICES, {
      base: 'comunidad',
      param: 'sendConsult',
      num_notice: circularNumber,
    });

    console.log('Respuesta sendConsult:', data);
    return data;
  }
}
