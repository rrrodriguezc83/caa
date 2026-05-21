import { getApps, initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { FIREBASE_CONFIG } from '../../../shared/constants/firebaseConfig';

let firestoreInstance = null;

const getFirestoreInstance = () => {
  if (firestoreInstance) return firestoreInstance;

  if (!getApps().length) {
    initializeApp(FIREBASE_CONFIG);
  }

  firestoreInstance = getFirestore();
  return firestoreInstance;
};

/**
 * Estructura del documento de horario en Firestore (colección "horarios"):
 * {
 *   id_curso: string,     // ej. "9-9"
 *   curso: string,        // ej. "609"
 *   horario: Array<{ ... }>
 * }
 *
 * El ID del documento debe coincidir con el identificador que envía la app
 * (p. ej. id_course del estudiante: "609" o "9-9" según backend).
 */

/**
 * Obtiene la información de horario desde Firestore para un curso dado.
 *
 * @param {string|number} courseId Identificador del curso (id_course o curso; debe coincidir con el ID del documento en Firestore).
 * @returns {Promise<{ id: string, id_curso: string, curso: string, horario: Array }|null>}
 */
export const getScheduleForCourse = async (cursoId) => {
  if (!cursoId) return null;

  const db = getFirestoreInstance();
  const ref = doc(db, 'caa_horario_clases', String(cursoId));
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  const document = { id: snapshot.id, ...snapshot.data() };
  console.log('Horario encontrado en Firestore:', JSON.stringify(document, null, 2));
  return document;
};

