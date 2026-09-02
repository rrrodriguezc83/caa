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
    const data = await this.apiClient.post(API_URLS.MAIN, {
      base: 'caa',
      param: 'getInfo',
    });

    return data;
  }

  async getMain() {
    const data = await this.apiClient.post(API_URLS.MAIN, {
      base: 'r',
      param: 'getMain',
    });

    return data;
  }
}
