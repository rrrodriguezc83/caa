import { UserRepository } from '../../domain/repositories/UserRepository';
import { API_URLS } from '../../shared/constants/apiRoutes';

/**
 * Implementación concreta del repositorio de usuario
 */
export class UserRepositoryImpl extends UserRepository {
  constructor(apiClient) {
    super();
    this.apiClient = apiClient;
  }

  async getInfo() {
    console.log('=== getInfo ===');

    const data = await this.apiClient.post(API_URLS.MAIN, {
      base: 'caa',
      param: 'getInfo',
    });

    console.log('=== Respuesta getInfo ===');
    console.log('Status code:', data.code);

    return data;
  }

  async getMain() {
    console.log('=== getMain ===');

    const data = await this.apiClient.post(API_URLS.MAIN, {
      base: 'r',
      param: 'getMain',
    });

    return data;
  }
}
