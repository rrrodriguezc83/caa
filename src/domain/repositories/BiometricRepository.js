/**
 * Interfaz del repositorio de biometría
 */
export class BiometricRepository {
  /**
   * Verifica si la biometría está disponible
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    throw new Error('BiometricRepository.isAvailable() not implemented');
  }

  /**
   * Autentica al usuario con biometría
   * @returns {Promise<boolean>}
   */
  async authenticate() {
    throw new Error('BiometricRepository.authenticate() not implemented');
  }

  /**
   * Guarda las credenciales del usuario de forma segura
   * @param {string} username
   * @param {string} password
   * @param {string} profile
   * @returns {Promise<boolean>}
   */
  async saveCredentials(username, password, profile) {
    throw new Error('BiometricRepository.saveCredentials() not implemented');
  }

  /**
   * Obtiene las credenciales guardadas
   * @returns {Promise<Object|null>}
   */
  async getCredentials() {
    throw new Error('BiometricRepository.getCredentials() not implemented');
  }

  /**
   * Verifica si hay credenciales guardadas
   * @returns {Promise<boolean>}
   */
  async hasStoredCredentials() {
    throw new Error('BiometricRepository.hasStoredCredentials() not implemented');
  }

  /**
   * Elimina las credenciales guardadas
   * @returns {Promise<boolean>}
   */
  async deleteCredentials() {
    throw new Error('BiometricRepository.deleteCredentials() not implemented');
  }
}
