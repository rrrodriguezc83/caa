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
    const data = await this.apiClient.post(API_URLS.MAIN, {
      base: 'caa',
      param: 'getNotifys',
    });

    return data;
  }

  async markAsRead(codigo) {
    const data = await this.apiClient.post(API_URLS.COMUNICACIONES, {
      param: 'submit_nivel_satisfactorio',
      base: 'caa',
      codigo,
      nivel: '0',
      coment: 'null',
    });

    return data;
  }
}
