import { NotificationRepository } from '../../domain/repositories/NotificationRepository';
import { API_URLS } from '../../shared/constants/apiRoutes';

/**
 * Implementación concreta del repositorio de notificaciones
 */
export class NotificationRepositoryImpl extends NotificationRepository {
  constructor(apiClient) {
    super();
    this.apiClient = apiClient;
  }

  async getNotifications() {
    console.log('=== getNotifys ===');

    const data = await this.apiClient.post(API_URLS.MAIN, {
      base: 'caa',
      param: 'getNotifys',
    });

    console.log('Notificaciones recibidas');
    return data;
  }

  async markAsRead(codigo) {
    console.log('=== markAsRead (submit_nivel_satisfactorio) ===');
    console.log('  - codigo:', codigo);

    const data = await this.apiClient.post(API_URLS.COMUNICACIONES, {
      param: 'submit_nivel_satisfactorio',
      base: 'caa',
      codigo,
      nivel: '0',
      coment: 'null',
    });

    console.log('Respuesta markAsRead:', data);
    return data;
  }
}
