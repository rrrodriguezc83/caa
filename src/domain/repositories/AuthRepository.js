/**
 * Interfaz del repositorio de autenticación
 * Define el contrato que debe implementar la capa de datos
 */
export class AuthRepository {
  /**
   * Realiza el login del usuario
   * @param {string} username
   * @param {string} password
   * @param {string} typeSession - "1" Comunidad, "2" Estudiante
   * @returns {Promise<Object>}
   */
  async login(username, password, typeSession) {
    throw new Error('AuthRepository.login() not implemented');
  }

  /**
   * Cierra la sesión del usuario
   * @returns {Promise<Object>}
   */
  async logout() {
    throw new Error('AuthRepository.logout() not implemented');
  }

  /**
   * Limpia la sesión y cookies almacenadas
   */
  clearSession() {
    throw new Error('AuthRepository.clearSession() not implemented');
  }
}
