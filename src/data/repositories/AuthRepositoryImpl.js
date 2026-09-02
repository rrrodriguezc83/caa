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

    const data = await this.apiClient.post(API_URLS.MAIN, {
      base: 'comunidad',
      param: 'login',
      user: encodedUser,
      pass: encodedPass,
      type_session: typeSession,
    });

    return data;
  }

  async logout() {
    const falseBase64 = encodeBase64('false');

    const data = await this.apiClient.post(API_URLS.MAIN, {
      base: 'comunidad',
      param: 'login',
      user: falseBase64,
      pass: falseBase64,
      type_session: 'false',
    });

    // Limpiar sesión después de logout
    this.apiClient.clearSession();

    return data;
  }

  clearSession() {
    this.apiClient.clearSession();
  }
}
