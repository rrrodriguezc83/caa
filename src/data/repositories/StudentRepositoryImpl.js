import { StudentRepository } from '../../domain/repositories/StudentRepository';
import { API_URLS } from '../../shared/constants/apiRoutes';

/**
 * Implementación concreta del repositorio de estudiante
 */
export class StudentRepositoryImpl extends StudentRepository {
  constructor(apiClient) {
    super();
    this.apiClient = apiClient;
  }

  async getInfoStudent() {
    const data = await this.apiClient.post(API_URLS.WORK_CLASS, {
      base: 'caa',
      param: 'getInfoStudent',
    });

    return data;
  }

  async getListWorks(course) {
    const data = await this.apiClient.post(API_URLS.WORK_CLASS, {
      base: 'caa',
      param: 'getListWorks',
      course,
    });

    return data;
  }

  async getListReminders(course) {
    const data = await this.apiClient.post(API_URLS.WORK_CLASS, {
      base: 'caa',
      param: 'getListReminders',
      course,
    });

    return data;
  }
}
