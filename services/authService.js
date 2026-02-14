import { Platform } from 'react-native';

// URL base de la API
const API_URL = 'https://www.comunidadvirtualcaa.co/controller/cont.php';

// Variable para almacenar la cookie PHPSESSID (para móvil)
let sessionCookie = null;

/**
 * Limpia la sesión y las cookies almacenadas
 */
export const clearSession = () => {
  console.log('=== Limpiando sesión y cookies ===');
  
  // Limpiar cookie almacenada en memoria
  sessionCookie = null;
  
  // En web, intentar limpiar cookies del navegador
  if (Platform.OS === 'web') {
    try {
      // Limpiar todas las cookies del dominio actual
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      
      // Intentar limpiar cookie específica del servidor
      document.cookie = "PHPSESSID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.comunidadvirtualcaa.co";
      document.cookie = "PHPSESSID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      console.log('Cookies del navegador limpiadas');
    } catch (error) {
      console.log('No se pudieron limpiar las cookies del navegador:', error.message);
    }
  } else {
    // En móvil (iOS/Android), limpiar cookies almacenadas en memoria
    // Nota: En Expo, las cookies HTTP no persisten entre sesiones por defecto
    console.log('Cookies en memoria limpiadas para móvil');
  }
  
  console.log('Sesión limpiada correctamente');
  console.log('===================================');
};

/**
 * Codifica una cadena a base64
 * @param {string} str - Cadena a codificar
 * @returns {string} Cadena codificada en base64
 */
const encodeBase64 = (str) => {
  try {
    // Convertir string a bytes UTF-8
    const utf8Bytes = [];
    for (let i = 0; i < str.length; i++) {
      let charCode = str.charCodeAt(i);
      if (charCode < 0x80) {
        utf8Bytes.push(charCode);
      } else if (charCode < 0x800) {
        utf8Bytes.push(0xc0 | (charCode >> 6));
        utf8Bytes.push(0x80 | (charCode & 0x3f));
      } else if (charCode < 0xd800 || charCode >= 0xe000) {
        utf8Bytes.push(0xe0 | (charCode >> 12));
        utf8Bytes.push(0x80 | ((charCode >> 6) & 0x3f));
        utf8Bytes.push(0x80 | (charCode & 0x3f));
      } else {
        // Surrogate pair
        i++;
        charCode = 0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
        utf8Bytes.push(0xf0 | (charCode >> 18));
        utf8Bytes.push(0x80 | ((charCode >> 12) & 0x3f));
        utf8Bytes.push(0x80 | ((charCode >> 6) & 0x3f));
        utf8Bytes.push(0x80 | (charCode & 0x3f));
      }
    }

    // Codificar bytes a base64
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let output = '';
    let i = 0;
    
    while (i < utf8Bytes.length) {
      // Leer hasta 3 bytes
      const a = utf8Bytes[i++];
      const hasB = i < utf8Bytes.length;
      const b = hasB ? utf8Bytes[i++] : 0;
      const hasC = i < utf8Bytes.length;
      const c = hasC ? utf8Bytes[i++] : 0;
      
      const bitmap = (a << 16) | (b << 8) | c;
      
      // Primer byte siempre está presente
      output += chars.charAt((bitmap >> 18) & 63);
      output += chars.charAt((bitmap >> 12) & 63);
      
      // Segundo byte: presente si hay al menos 2 bytes
      if (hasB) {
        output += chars.charAt((bitmap >> 6) & 63);
      } else {
        output += '=';
      }
      
      // Tercer byte: presente solo si hay 3 bytes
      if (hasC) {
        output += chars.charAt(bitmap & 63);
      } else {
        output += '=';
      }
    }
    
    return output;
  } catch (e) {
    console.error('Error encoding to base64:', e);
    throw e;
  }
};

/**
 * Realiza el login del usuario
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @param {string} typeSession - Tipo de sesión: "1" para Comunidad, "2" para Estudiante
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const login = async (username, password, typeSession) => {
  try {
    // Codificar usuario y contraseña en base64
    const encodedUser = encodeBase64(username);
    const encodedPass = encodeBase64(password);

    // Crear FormData
    const formData = new FormData();
    formData.append('base', 'comunidad');
    formData.append('param', 'login');
    formData.append('user', encodedUser);
    formData.append('pass', encodedPass);
    formData.append('type_session', typeSession);

    // Log de parámetros enviados al servicio
    console.log('=== Parámetros enviados al servicio de login ===');
    console.log('URL:', API_URL);
    console.log('Método: POST');
    console.log('Parámetros:');
    console.log('  - base: comunidad');
    console.log('  - param: login');
    console.log('  - user (original):', username);
    console.log('  - user (base64):', encodedUser);
    console.log('  - pass (original):', '*'.repeat(password.length)); // No mostrar contraseña en texto plano
    console.log('  - pass (base64):', encodedPass);
    console.log('  - type_session:', typeSession, `(${typeSession === '1' ? 'Comunidad' : 'Estudiante'})`);
    console.log('===============================================');

    // Realizar la petición POST
    // Para web, necesitamos manejar CORS de manera diferente
    const fetchOptions = {
      method: 'POST',
      body: formData,
      credentials: 'include', // Incluir cookies en la petición
      // No establecemos headers para FormData en web
      // El navegador establecerá automáticamente Content-Type con boundary
      // Esto evita preflight CORS innecesario
      ...(Platform.OS !== 'web' && {
        headers: {
          'Accept': 'application/json',
        },
      }),
    };

    const response = await fetch(API_URL, fetchOptions);
    
    // Capturar la cookie PHPSESSID de la respuesta (para móvil)
    if (Platform.OS !== 'web') {
      const setCookie = response.headers.get('set-cookie');
      if (setCookie) {
        const phpSessionMatch = setCookie.match(/PHPSESSID=([^;]+)/);
        if (phpSessionMatch) {
          sessionCookie = phpSessionMatch[1];
          console.log('PHPSESSID capturado:', sessionCookie);
        }
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Log de respuesta del servicio
    console.log('=== Respuesta del servicio ===');
    console.log('Status:', response.status, response.statusText);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('============================');
    
    return data;
  } catch (error) {
    console.error('Error en login:', error);
    
    // Manejo específico de errores CORS en web
    if (Platform.OS === 'web' && (error.message.includes('Failed to fetch') || error.message.includes('CORS'))) {
      const corsError = new Error(
        'Error de CORS: El servidor no permite peticiones desde este origen. ' +
        'Para desarrollo web, puedes usar una extensión del navegador para deshabilitar CORS ' +
        'o probar la aplicación en Android/iOS donde no hay restricciones CORS.'
      );
      corsError.name = 'CORSError';
      throw corsError;
    }
    
    throw error;
  }
};

/**
 * Obtiene la información del usuario después del login
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const getInfo = async () => {
  try {
    // Crear FormData
    const formData = new FormData();
    formData.append('base', 'caa');
    formData.append('param', 'getInfo');

    // Log de parámetros enviados al servicio
    console.log('=== Parámetros enviados al servicio getInfo ===');
    console.log('URL:', API_URL);
    console.log('Método: POST');
    console.log('Parámetros:');
    console.log('  - base: caa');
    console.log('  - param: getInfo');
    if (sessionCookie) {
      console.log('  - Cookie PHPSESSID:', sessionCookie);
    }
    console.log('===============================================');

    // Configurar opciones de fetch
    const fetchOptions = {
      method: 'POST',
      body: formData,
      credentials: 'include', // Incluir cookies automáticamente en web
      ...(Platform.OS !== 'web' && {
        headers: {
          'Accept': 'application/json',
          // En móvil, agregar manualmente la cookie si está disponible
          ...(sessionCookie && { 'Cookie': `PHPSESSID=${sessionCookie}` }),
        },
      }),
    };

    const response = await fetch(API_URL, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Log de respuesta del servicio
    console.log('=== Respuesta del servicio getInfo ===');
    console.log('Status:', response.status, response.statusText);
    console.log('====================================');
    
    return data;
  } catch (error) {
    console.error('Error en getInfo:', error);
    
    // Manejo específico de errores CORS en web
    if (Platform.OS === 'web' && (error.message.includes('Failed to fetch') || error.message.includes('CORS'))) {
      const corsError = new Error(
        'Error de CORS: El servidor no permite peticiones desde este origen.'
      );
      corsError.name = 'CORSError';
      throw corsError;
    }
    
    throw error;
  }
};

/**
 * Obtiene el contenido principal del usuario
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const getMain = async () => {
  try {
    // Crear FormData
    const formData = new FormData();
    formData.append('base', 'r');
    formData.append('param', 'getMain');

    // Log de parámetros enviados al servicio
    console.log('=== Parámetros enviados al servicio getMain ===');
    console.log('URL:', API_URL);
    console.log('Método: POST');
    console.log('Parámetros:');
    console.log('  - base: r');
    console.log('  - param: getMain');
    if (sessionCookie) {
      console.log('  - Cookie PHPSESSID:', sessionCookie);
    }
    console.log('===============================================');

    // Configurar opciones de fetch
    const fetchOptions = {
      method: 'POST',
      body: formData,
      credentials: 'include', // Incluir cookies automáticamente en web
      ...(Platform.OS !== 'web' && {
        headers: {
          'Accept': 'application/json',
          // En móvil, agregar manualmente la cookie si está disponible
          ...(sessionCookie && { 'Cookie': `PHPSESSID=${sessionCookie}` }),
        },
      }),
    };

    const response = await fetch(API_URL, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error en getMain:', error);
    
    // Manejo específico de errores CORS en web
    if (Platform.OS === 'web' && (error.message.includes('Failed to fetch') || error.message.includes('CORS'))) {
      const corsError = new Error(
        'Error de CORS: El servidor no permite peticiones desde este origen.'
      );
      corsError.name = 'CORSError';
      throw corsError;
    }
    
    throw error;
  }
};

// URL para servicios de Work_classV1
const WORK_CLASS_API_URL = 'https://www.comunidadvirtualcaa.co/Work_classV1/controller/cont.php';

/**
 * Obtiene la información del estudiante (curso)
 * @returns {Promise<Object>} Respuesta del servidor con id_course y course
 */
export const getInfoStudent = async () => {
  try {
    // Crear FormData
    const formData = new FormData();
    formData.append('base', 'caa');
    formData.append('param', 'getInfoStudent');

    // Log de parámetros enviados al servicio
    console.log('=== Parámetros enviados al servicio getInfoStudent ===');
    console.log('URL:', WORK_CLASS_API_URL);
    console.log('Método: POST');
    console.log('Parámetros:');
    console.log('  - base: caa');
    console.log('  - param: getInfoStudent');
    if (sessionCookie) {
      console.log('  - Cookie PHPSESSID:', sessionCookie);
    }
    console.log('======================================================');

    // Configurar opciones de fetch
    const fetchOptions = {
      method: 'POST',
      body: formData,
      credentials: 'include', // Incluir cookies automáticamente en web
      ...(Platform.OS !== 'web' && {
        headers: {
          'Accept': 'application/json',
          // En móvil, agregar manualmente la cookie si está disponible
          ...(sessionCookie && { 'Cookie': `PHPSESSID=${sessionCookie}` }),
        },
      }),
    };

    const response = await fetch(WORK_CLASS_API_URL, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Log de respuesta del servicio
    console.log('=== Respuesta del servicio getInfoStudent ===');
    console.log('Status:', response.status, response.statusText);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('=============================================');
    
    return data;
  } catch (error) {
    console.error('Error en getInfoStudent:', error);
    
    // Manejo específico de errores CORS en web
    if (Platform.OS === 'web' && (error.message.includes('Failed to fetch') || error.message.includes('CORS'))) {
      const corsError = new Error(
        'Error de CORS: El servidor no permite peticiones desde este origen.'
      );
      corsError.name = 'CORSError';
      throw corsError;
    }
    
    throw error;
  }
};

/**
 * Obtiene la lista de trabajos del estudiante
 * @param {string} course - El código del curso (id_course) obtenido de getInfoStudent
 * @returns {Promise<Object>} Respuesta del servidor con la lista de trabajos
 */
export const getListWorks = async (course) => {
  try {
    // Crear FormData
    const formData = new FormData();
    formData.append('base', 'caa');
    formData.append('param', 'getListWorks');
    formData.append('course', course);

    // Log de parámetros enviados al servicio
    console.log('=== Parámetros enviados al servicio getListWorks ===');
    console.log('URL:', WORK_CLASS_API_URL);
    console.log('Método: POST');
    console.log('Parámetros:');
    console.log('  - base: caa');
    console.log('  - param: getListWorks');
    console.log('  - course:', course);
    if (sessionCookie) {
      console.log('  - Cookie PHPSESSID:', sessionCookie);
    }
    console.log('====================================================');

    // Configurar opciones de fetch
    const fetchOptions = {
      method: 'POST',
      body: formData,
      credentials: 'include', // Incluir cookies automáticamente en web
      ...(Platform.OS !== 'web' && {
        headers: {
          'Accept': 'application/json',
          // En móvil, agregar manualmente la cookie si está disponible
          ...(sessionCookie && { 'Cookie': `PHPSESSID=${sessionCookie}` }),
        },
      }),
    };

    const response = await fetch(WORK_CLASS_API_URL, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Log de respuesta del servicio
    console.log('=== Respuesta del servicio getListWorks ===');
    console.log('Status:', response.status, response.statusText);
    console.log('Total de meses:', data.response ? Object.keys(data.response).length : 0);
    console.log('===========================================');
    
    return data;
  } catch (error) {
    console.error('Error en getListWorks:', error);
    
    // Manejo específico de errores CORS en web
    if (Platform.OS === 'web' && (error.message.includes('Failed to fetch') || error.message.includes('CORS'))) {
      const corsError = new Error(
        'Error de CORS: El servidor no permite peticiones desde este origen.'
      );
      corsError.name = 'CORSError';
      throw corsError;
    }
    
    throw error;
  }
};

/**
 * Obtiene la lista de recordatorios del estudiante
 * @param {string} course - El código del curso (id_course) obtenido de getInfoStudent
 * @returns {Promise<Object>} Respuesta del servidor con la lista de recordatorios
 */
export const getListReminders = async (course) => {
  try {
    // Crear FormData
    const formData = new FormData();
    formData.append('base', 'caa');
    formData.append('param', 'getListReminders');
    formData.append('course', course);

    // Log de parámetros enviados al servicio
    console.log('=== Parámetros enviados al servicio getListReminders ===');
    console.log('URL:', WORK_CLASS_API_URL);
    console.log('Método: POST');
    console.log('Parámetros:');
    console.log('  - base: caa');
    console.log('  - param: getListReminders');
    console.log('  - course:', course);
    if (sessionCookie) {
      console.log('  - Cookie PHPSESSID:', sessionCookie);
    }
    console.log('========================================================');

    // Configurar opciones de fetch
    const fetchOptions = {
      method: 'POST',
      body: formData,
      credentials: 'include', // Incluir cookies automáticamente en web
      ...(Platform.OS !== 'web' && {
        headers: {
          'Accept': 'application/json',
          // En móvil, agregar manualmente la cookie si está disponible
          ...(sessionCookie && { 'Cookie': `PHPSESSID=${sessionCookie}` }),
        },
      }),
    };

    const response = await fetch(WORK_CLASS_API_URL, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Log de respuesta del servicio
    console.log('=== Respuesta del servicio getListReminders ===');
    console.log('Status:', response.status, response.statusText);
    console.log('Total de meses:', data.response ? Object.keys(data.response).length : 0);
    console.log('===============================================');
    
    return data;
  } catch (error) {
    console.error('Error en getListReminders:', error);
    
    // Manejo específico de errores CORS en web
    if (Platform.OS === 'web' && (error.message.includes('Failed to fetch') || error.message.includes('CORS'))) {
      const corsError = new Error(
        'Error de CORS: El servidor no permite peticiones desde este origen.'
      );
      corsError.name = 'CORSError';
      throw corsError;
    }
    
    throw error;
  }
};
