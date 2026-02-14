/**
 * Convierte texto a formato Capital Case (primera letra de cada palabra en mayúscula)
 * @param {string} text 
 * @returns {string}
 */
export const toCapitalCase = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Capitaliza solo la primera letra del texto
 * @param {string} text 
 * @returns {string}
 */
export const capitalizeFirst = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Transforma texto plano con saltos de línea a HTML
 * @param {string} text 
 * @returns {string}
 */
export const transformTextToHtml = (text) => {
  if (!text) return '<p>Sin descripción</p>';

  // Normalizar caracteres escapados
  let htmlText = text.replace(/\\"/g, '"');
  htmlText = htmlText.replace(/\\'/g, "'");

  // Eliminar estilos CSS no soportados en React Native
  htmlText = htmlText.replace(/border-collapse\s*:\s*collapse\s*;?/gi, '');

  // Reemplazar saltos de línea \n por <br>
  htmlText = htmlText.replace(/\n/g, '<br>');

  // Verificar si el texto ya contiene etiquetas HTML
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(htmlText);

  // Si no tiene etiquetas HTML, envolver en un párrafo
  if (!hasHtmlTags) {
    htmlText = `<p>${htmlText}</p>`;
  }

  return htmlText;
};

/**
 * Formatea una fecha a formato legible en español
 * @param {string} dateString 
 * @returns {string}
 */
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Convierte base64 a URI de imagen
 * @param {string} foto 
 * @returns {string|null}
 */
export const getImageUri = (foto) => {
  if (!foto) return null;
  if (foto.startsWith('data:image')) return foto;
  return `data:image/jpeg;base64,${foto}`;
};
