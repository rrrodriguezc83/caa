import { Platform } from 'react-native';

/**
 * Cliente HTTP centralizado que maneja sesiones y cookies
 */
class ApiClient {
  constructor() {
    this.sessionCookie = null;
  }

  /**
   * Limpia la sesión y las cookies almacenadas
   */
  clearSession() {
    console.log('=== Limpiando sesión y cookies ===');
    this.sessionCookie = null;

    if (Platform.OS === 'web') {
      try {
        document.cookie.split(';').forEach((c) => {
          document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
        });
        document.cookie = 'PHPSESSID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.comunidadvirtualcaa.co';
        document.cookie = 'PHPSESSID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        console.log('Cookies del navegador limpiadas');
      } catch (error) {
        console.log('No se pudieron limpiar las cookies del navegador:', error.message);
      }
    } else {
      console.log('Cookies en memoria limpiadas para móvil');
    }

    console.log('Sesión limpiada correctamente');
  }

  /**
   * Realiza una petición POST con FormData
   * @param {string} url - URL del endpoint
   * @param {Object} params - Parámetros a enviar como FormData
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Respuesta JSON del servidor
   */
  async post(url, params = {}, options = {}) {
    try {
      const formData = new FormData();
      Object.entries(params).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const fetchOptions = {
        method: 'POST',
        body: formData,
        credentials: 'include',
        ...(Platform.OS !== 'web' && {
          headers: {
            Accept: 'application/json',
            ...(this.sessionCookie && { Cookie: `PHPSESSID=${this.sessionCookie}` }),
          },
        }),
      };

      const response = await fetch(url, fetchOptions);

      // Capturar la cookie PHPSESSID de la respuesta (para móvil)
      if (Platform.OS !== 'web') {
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
          const phpSessionMatch = setCookie.match(/PHPSESSID=([^;]+)/);
          if (phpSessionMatch) {
            this.sessionCookie = phpSessionMatch[1];
            console.log('PHPSESSID capturado:', this.sessionCookie);
          }
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Manejo específico de errores CORS en web
      if (
        Platform.OS === 'web' &&
        (error.message.includes('Failed to fetch') || error.message.includes('CORS'))
      ) {
        const corsError = new Error(
          'Error de CORS: El servidor no permite peticiones desde este origen.'
        );
        corsError.name = 'CORSError';
        throw corsError;
      }
      throw error;
    }
  }
}

// Singleton: una única instancia compartida en toda la app
export const apiClient = new ApiClient();
