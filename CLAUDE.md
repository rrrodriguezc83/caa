# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web (note: CORS issues with the backend API on web platform)
npm run web
```

There are no lint or test scripts configured. The project uses Expo SDK 54 with React Native 0.81.4.

## Architecture

This is a **Clean Architecture** React Native/Expo app for the CAA school community. The layers are:

- **`src/domain/`** — Abstract interfaces (`repositories/`) and entities (`entities/`). No dependencies on outer layers.
- **`src/data/`** — Implementations of domain repositories (`repositories/`), plus datasources (`datasources/remote/` for API/Firebase, `datasources/local/` for secure storage and biometrics).
- **`src/presentation/`** — Screens, navigation, shared components, and theme.
- **`src/di/container.js`** — Single file that wires up all repository implementations to their datasource dependencies. Screens import from this container.
- **`src/shared/`** — API route constants (`constants/apiRoutes.js`) and utilities.

### Data Flow

All HTTP calls go through `ApiClient` (`src/data/datasources/remote/ApiClient.js`), which:
- Sends POST requests as `FormData` to PHP backend endpoints
- Manages `PHPSESSID` session cookies across requests (platform-aware: different handling for web vs native)
- Credentials are Base64-encoded before transmission

The backend base URL is `https://www.comunidadvirtualcaa.co/controller/cont.php`. Different features use different sub-application endpoints defined in `src/shared/constants/apiRoutes.js`.

Firebase Firestore is used for schedule data (`horarios` collection), configured in `src/shared/constants/firebaseConfig.js`.

### Navigation

`AppNavigator.js` uses a single `NativeStack` starting at `Login`. All screens set `headerShown: false` and use the shared `ScreenHeader` component (`src/presentation/components/common/ScreenHeader.js`) for custom headers. `HomeScreen` ("Welcome" route) is the main dashboard and implements a custom animated drawer overlay.

### UI

Material Design 3 via `react-native-paper`. Theme is defined in `src/presentation/theme/index.js` (blue palette, Inter fonts). Icons use `@expo/vector-icons` (MaterialCommunityIcons).

### Authentication

1. User logs in with username/password (Base64-encoded POST to backend)
2. After successful login, user is prompted to enable biometric auth
3. Credentials are stored in `expo-secure-store` if enabled
4. On subsequent launches, `expo-local-authentication` retrieves stored credentials for fingerprint login
