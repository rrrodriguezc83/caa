import { NursingRepository } from '../../domain/repositories/NursingRepository';
import { API_URLS } from '../../shared/constants/apiRoutes';

/**
 * Implementación concreta del repositorio de enfermería
 */
export class NursingRepositoryImpl extends NursingRepository {
  constructor(apiClient) {
    super();
    this.apiClient = apiClient;
  }

  async getReports() {
    const data = await this.apiClient.post(API_URLS.ENFERMERIA, {
      base: 'caa',
      param: 'getReportAtt',
    });

    return data;
  }
}
