/**
 * Contenedor de Inyección de Dependencias
 * 
 * Aquí se crea e inyectan todas las dependencias de la aplicación.
 * La regla de dependencia se respeta: domain no conoce data ni presentation.
 */

// Datasources
import { apiClient } from '../data/datasources/remote/ApiClient';
import { SecureStorage } from '../data/datasources/local/SecureStorage';
import { BiometricAuth } from '../data/datasources/local/BiometricAuth';

// Repository implementations
import { AuthRepositoryImpl } from '../data/repositories/AuthRepositoryImpl';
import { UserRepositoryImpl } from '../data/repositories/UserRepositoryImpl';
import { StudentRepositoryImpl } from '../data/repositories/StudentRepositoryImpl';
import { CircularRepositoryImpl } from '../data/repositories/CircularRepositoryImpl';
import { NotificationRepositoryImpl } from '../data/repositories/NotificationRepositoryImpl';
import { NursingRepositoryImpl } from '../data/repositories/NursingRepositoryImpl';
import { BiometricRepositoryImpl } from '../data/repositories/BiometricRepositoryImpl';

// --- Datasources ---
const secureStorage = new SecureStorage();
const biometricAuth = new BiometricAuth();

// --- Repositories ---
const authRepository = new AuthRepositoryImpl(apiClient);
const userRepository = new UserRepositoryImpl(apiClient);
const studentRepository = new StudentRepositoryImpl(apiClient);
const circularRepository = new CircularRepositoryImpl(apiClient);
const notificationRepository = new NotificationRepositoryImpl(apiClient);
const nursingRepository = new NursingRepositoryImpl(apiClient);
const biometricRepository = new BiometricRepositoryImpl(biometricAuth, secureStorage);

// --- Container Export ---
export const container = {
  // Repositories (las pantallas usan estos directamente)
  authRepository,
  userRepository,
  studentRepository,
  circularRepository,
  notificationRepository,
  nursingRepository,
  biometricRepository,
};
