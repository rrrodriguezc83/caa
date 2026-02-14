import * as SecureStore from 'expo-secure-store';

const CREDENTIALS_KEY = 'user_credentials';

/**
 * Almacenamiento seguro local usando expo-secure-store
 */
export class SecureStorage {
  /**
   * Guarda las credenciales del usuario
   */
  async saveCredentials(username, password, profile) {
    try {
      const credentials = JSON.stringify({
        username,
        password,
        profile,
        timestamp: new Date().toISOString(),
      });
      await SecureStore.setItemAsync(CREDENTIALS_KEY, credentials);
      console.log('Credenciales guardadas exitosamente');
      return true;
    } catch (error) {
      console.error('Error guardando credenciales:', error);
      return false;
    }
  }

  /**
   * Obtiene las credenciales guardadas
   */
  async getCredentials() {
    try {
      const credentials = await SecureStore.getItemAsync(CREDENTIALS_KEY);
      return credentials ? JSON.parse(credentials) : null;
    } catch (error) {
      console.error('Error obteniendo credenciales:', error);
      return null;
    }
  }

  /**
   * Verifica si hay credenciales guardadas
   */
  async hasCredentials() {
    try {
      const credentials = await SecureStore.getItemAsync(CREDENTIALS_KEY);
      return credentials !== null;
    } catch (error) {
      console.error('Error verificando credenciales:', error);
      return false;
    }
  }

  /**
   * Elimina las credenciales guardadas
   */
  async deleteCredentials() {
    try {
      await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
      console.log('Credenciales eliminadas exitosamente');
      return true;
    } catch (error) {
      console.error('Error eliminando credenciales:', error);
      return false;
    }
  }
}
