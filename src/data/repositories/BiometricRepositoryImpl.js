import { BiometricRepository } from '../../domain/repositories/BiometricRepository';

/**
 * Implementación concreta del repositorio de biometría
 */
export class BiometricRepositoryImpl extends BiometricRepository {
  constructor(biometricAuth, secureStorage) {
    super();
    this.biometricAuth = biometricAuth;
    this.secureStorage = secureStorage;
  }

  async isAvailable() {
    return this.biometricAuth.isAvailable();
  }

  async authenticate() {
    return this.biometricAuth.authenticate();
  }

  async saveCredentials(username, password, profile) {
    return this.secureStorage.saveCredentials(username, password, profile);
  }

  async getCredentials() {
    return this.secureStorage.getCredentials();
  }

  async hasStoredCredentials() {
    return this.secureStorage.hasCredentials();
  }

  async deleteCredentials() {
    return this.secureStorage.deleteCredentials();
  }
}
