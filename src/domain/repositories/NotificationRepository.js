/**
 * Interfaz del repositorio de notificaciones
 */
export class NotificationRepository {
  /**
   * Obtiene las notificaciones del usuario
   * @returns {Promise<Object>}
   */
  async getNotifications() {
    throw new Error('NotificationRepository.getNotifications() not implemented');
  }

  /**
   * Marca una notificación como leída (Enterado)
   * @param {string} codigo - ID de la notificación
   * @returns {Promise<Object>}
   */
  async markAsRead(codigo) {
    throw new Error('NotificationRepository.markAsRead() not implemented');
  }
}
