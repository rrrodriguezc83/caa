# App Mobile Escolar - CAA

Aplicación móvil desarrollada en React Native para Android e iOS con funcionalidad de login.

## Características

- Pantalla de login con campos de usuario y contraseña
- Selector de perfil (Comunidad o Estudiante)
- Integración con API de autenticación
- Manejo de errores y validaciones
- Navegación entre pantallas

## Instalación

1. Instalar las dependencias:
```bash
npm install
```

2. Para ejecutar en Android:
```bash
npm run android
```

3. Para ejecutar en iOS:
```bash
npm run ios
```

4. Para iniciar el servidor de desarrollo:
```bash
npm start
```

## Estructura del Proyecto

```
caa/
├── App.js                 # Componente principal con navegación
├── screens/
│   ├── LoginScreen.js     # Pantalla de login
│   └── WelcomeScreen.js   # Pantalla de bienvenida
├── services/
│   └── authService.js     # Servicio de autenticación
├── package.json
└── app.json
```

## Requisitos

- Node.js 14 o superior
- Expo CLI
- Android Studio (para Android) o Xcode (para iOS)

## Nota sobre CORS (Solo para desarrollo web)

Si estás probando la aplicación en la plataforma web y encuentras errores de CORS, esto es normal porque el servidor API no está configurado para permitir peticiones desde el navegador.

**Soluciones:**

1. **Recomendado**: Prueba la aplicación en Android o iOS donde no hay restricciones CORS
2. **Para desarrollo web**: Instala una extensión del navegador para deshabilitar CORS (solo para desarrollo):
   - Chrome: "CORS Unblock" o "Allow CORS"
   - Firefox: "CORS Everywhere"
3. **Producción**: El servidor debe configurar headers CORS apropiados para permitir peticiones desde tu dominio

## API

La aplicación consume el siguiente endpoint:

- **URL**: `https://www.comunidadvirtualcaa.co/controller/cont.php`
- **Método**: POST
- **Formato**: form-data
- **Parámetros**:
  - `base`: "comunidad"
  - `param`: "login"
  - `user`: Usuario codificado en base64
  - `pass`: Contraseña codificada en base64
  - `type_session`: "1" para Comunidad, "2" para Estudiante
