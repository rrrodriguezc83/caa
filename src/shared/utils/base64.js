/**
 * Codifica una cadena a base64 (compatible con React Native)
 * @param {string} str - Cadena a codificar
 * @returns {string} Cadena codificada en base64
 */
export const encodeBase64 = (str) => {
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
      const a = utf8Bytes[i++];
      const hasB = i < utf8Bytes.length;
      const b = hasB ? utf8Bytes[i++] : 0;
      const hasC = i < utf8Bytes.length;
      const c = hasC ? utf8Bytes[i++] : 0;

      const bitmap = (a << 16) | (b << 8) | c;

      output += chars.charAt((bitmap >> 18) & 63);
      output += chars.charAt((bitmap >> 12) & 63);
      output += hasB ? chars.charAt((bitmap >> 6) & 63) : '=';
      output += hasC ? chars.charAt(bitmap & 63) : '=';
    }

    return output;
  } catch (e) {
    console.error('Error encoding to base64:', e);
    throw e;
  }
};
