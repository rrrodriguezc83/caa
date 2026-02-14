import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Servicio de autenticación biométrica usando expo-local-authentication
 */
export class BiometricAuth {
  /**
   * Verifica si el dispositivo tiene hardware de biometría disponible y registrado
   */
  async isAvailable() {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      console.error('Error verificando biometría:', error);
      return false;
    }
  }

  /**
   * Obtiene los tipos de biometría disponibles en el dispositivo
   */
  async getSupportedTypes() {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error obteniendo tipos de biometría:', error);
      return [];
    }
  }

  /**
   * Autentica al usuario con biometría
   */
  async authenticate() {
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
  }
}
