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
    console.log('=== getInfoStudent ===');

    const data = await this.apiClient.post(API_URLS.WORK_CLASS, {
      base: 'caa',
      param: 'getInfoStudent',
    });

    console.log('=== Respuesta getInfoStudent ===');
    console.log('Response:', JSON.stringify(data, null, 2));

    return data;
  }

  async getListWorks(course) {
    console.log('=== getListWorks ===');
    console.log('  - course:', course);

    const data = await this.apiClient.post(API_URLS.WORK_CLASS, {
      base: 'caa',
      param: 'getListWorks',
      course,
    });

    console.log('=== Respuesta getListWorks ===');
    console.log('Total de meses:', data.response ? Object.keys(data.response).length : 0);

    return data;
  }

  async getListReminders(course) {
    console.log('=== getListReminders ===');
    console.log('  - course:', course);

    const data = await this.apiClient.post(API_URLS.WORK_CLASS, {
      base: 'caa',
      param: 'getListReminders',
      course,
    });

    console.log('=== Respuesta getListReminders ===');
    console.log('Total de meses:', data.response ? Object.keys(data.response).length : 0);

    return data;
  }
}
