/**
 * Entidad de dominio: Notificación
 */
export class Notification {
  constructor({ id, tema, mensaje, respuesta, asunto, respuesta2, type, rawNotify }) {
    this.id = id;
    this.tema = tema;
    this.mensaje = mensaje;
    this.respuesta = respuesta;
    this.asunto = asunto;
    this.respuesta2 = respuesta2;
    this.type = type;
    this.rawNotify = rawNotify;
  }

  /**
   * Determina si la notificación requiere enviar confirmación al servidor
   */
  requiresServerConfirmation() {
    return this.asunto !== '2' && this.asunto !== '6';
  }
}
