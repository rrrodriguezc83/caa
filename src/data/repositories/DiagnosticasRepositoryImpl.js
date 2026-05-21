import { FechasDiagnosticasRepository } from '../../domain/repositories/FechasDiagnosticasRepository';
import { API_URLS } from '../../shared/constants/apiRoutes';

/**
 * Implementación del repositorio de Fechas Diagnósticas
 */
export class DiagnosticasRepositoryImpl extends FechasDiagnosticasRepository {
  constructor(apiClient) {
    super();
    this.apiClient = apiClient;
  }

  async getEvaluacionesDiagnosticas(tipe) {
    const data = await this.apiClient.post(API_URLS.ACADEMIC, {
      base: 'caa',
      param: 'getEvBi',
      tipe,
    });
    return data;
  }

  async getDiagnosticasEvaluaciones() {
    const data = await this.apiClient.post(API_URLS.ACADEMIC, {
      base: 'comunidad',
      param: 'Diagnostic',
    });
    return data;
  }

  async upDiagnostic({ date, period, matter }) {
    const data = await this.apiClient.post(API_URLS.ACADEMIC, {
      base: 'comunidad',
      param: 'UpDiagnostic',
      date,
      period,
      matter,
    });
    return data;
  }

  async getDiagnosticAlert(date) {
    const data = await this.apiClient.post(API_URLS.ACADEMIC, {
      base: 'comunidad',
      param: 'DiagnosticAlert',
      date,
    });
    return data;
  }

  async getHonorRoll(period) {
    const data = await this.apiClient.post(API_URLS.ACADEMIC, {
      param: 'getHr',
      base: 'comunidad',
      period,
    });
    return data;
  }

  async getBestCourse() {
    const data = await this.apiClient.post(API_URLS.ACADEMIC, {
      param: 'consultBetter_CourseStudt',
      base: 'caa',
    });
    return data;
  }
}
