import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const CREDENTIALS_KEY = 'user_credentials';

/**
 * Verifica si el dispositivo tiene hardware de biometría disponible
 */
export const isBiometricAvailable = async () => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch (error) {
    console.error('Error verificando biometría:', error);
    return false;
  }
};

/**
 * Obtiene los tipos de biometría disponibles en el dispositivo
 */
export const getBiometricTypes = async () => {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return types;
  } catch (error) {
    console.error('Error obteniendo tipos de biometría:', error);
    return [];
  }
};

/**
 * Autentica al usuario con biometría
 */
export const authenticateWithBiometric = async () => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autenticarse con huella dactilar',
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false,
      fallbackLabel: 'Usar contraseña',
    });

    return result.success;
  } catch (error) {
    console.error('Error en autenticación biométrica:', error);
    return false;
  }
};

/**
 * Guarda las credenciales del usuario de forma segura
 */
export const saveCredentials = async (username, password, profile) => {
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
};

/**
 * Obtiene las credenciales guardadas
 */
export const getCredentials = async () => {
  try {
    const credentials = await SecureStore.getItemAsync(CREDENTIALS_KEY);
    
    if (credentials) {
      return JSON.parse(credentials);
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo credenciales:', error);
    return null;
  }
};

/**
 * Verifica si hay credenciales guardadas
 */
export const hasStoredCredentials = async () => {
  try {
    const credentials = await SecureStore.getItemAsync(CREDENTIALS_KEY);
    return credentials !== null;
  } catch (error) {
    console.error('Error verificando credenciales:', error);
    return false;
  }
};

/**
 * Elimina las credenciales guardadas
 */
export const deleteCredentials = async () => {
  try {
    await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
    console.log('Credenciales eliminadas exitosamente');
    return true;
  } catch (error) {
    console.error('Error eliminando credenciales:', error);
    return false;
  }
};
