import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { API_URLS } from '../../shared/constants/apiRoutes';
import { encodeBase64 } from '../../shared/utils/base64';

/**
 * Implementación concreta del repositorio de autenticación
 */
export class AuthRepositoryImpl extends AuthRepository {
  constructor(apiClient) {
    super();
    this.apiClient = apiClient;
  }

  async login(username, password, typeSession) {
    const encodedUser = encodeBase64(username);
    const encodedPass = encodeBase64(password);

    console.log('=== Login ===');
    console.log('  - user (original):', username);
    console.log('  - type_session:', typeSession, `(${typeSession === '1' ? 'Comunidad' : 'Estudiante'})`);

    const data = await this.apiClient.post(API_URLS.MAIN, {
      base: 'comunidad',
      param: 'login',
      user: encodedUser,
      pass: encodedPass,
      type_session: typeSession,
    });

    console.log('=== Respuesta login ===');
    console.log('Response:', JSON.stringify(data, null, 2));

    return data;
  }

  async logout() {
    const falseBase64 = encodeBase64('false');

    console.log('Cerrando sesión...');

    const data = await this.apiClient.post(API_URLS.MAIN, {
      base: 'comunidad',
      param: 'login',
      user: falseBase64,
      pass: falseBase64,
      type_session: 'false',
    });

    console.log('Respuesta de logout:', data);

    // Limpiar sesión después de logout
    this.apiClient.clearSession();

    return data;
  }

  clearSession() {
    this.apiClient.clearSession();
  }
}
