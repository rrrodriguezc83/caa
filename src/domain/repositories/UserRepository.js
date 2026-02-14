/**
 * Interfaz del repositorio de usuario
 */
export class UserRepository {
  /**
   * Obtiene la información del usuario autenticado
   * @returns {Promise<Object>}
   */
  async getInfo() {
    throw new Error('UserRepository.getInfo() not implemented');
  }

  /**
   * Obtiene el contenido principal (módulos)
   * @returns {Promise<Object>}
   */
  async getMain() {
    throw new Error('UserRepository.getMain() not implemented');
  }
}
