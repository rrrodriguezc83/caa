# Persistent Bottom Navigation Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move `BottomNavBar` from inside each screen's `AppScreenLayout` to the app root (`App.js`), so it no longer slides with screen transitions, while keeping the same visual result.

**Architecture:** `App.js` gains a `SafeAreaProvider`, a `navigationRef` (from `@react-navigation/native`), and a `currentRouteName` state updated via `NavigationContainer`'s `onStateChange`. `BottomNavBar` renders as a sibling below `NavigationContainer`, hidden on `Login`. `AppScreenLayout` is simplified back to just a `View` + `SafeAreaView` wrapper (no `BottomNavBar`, no `navigation`/`activeRoute` props). All 40 screens drop the now-unused `navigation`/`activeRoute` props passed to `AppScreenLayout`.

**Tech Stack:** React Native / Expo SDK 54, `@react-navigation/native` 6.x, `@react-navigation/native-stack` 6.x, `react-native-safe-area-context` ~5.6.

**No test/lint scripts are configured for this project** (per `CLAUDE.md`). Verification throughout this plan is via `grep` and a `@babel/parser`-based JSX syntax check (same approach used in the prior bottom-nav-bar feature).

---

### Task 1: Simplify `AppScreenLayout`

**Files:**
- Modify: `src/presentation/components/common/AppScreenLayout.js`

Current content (10 lines of logic):

```jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from './BottomNavBar';

const AppScreenLayout = ({ navigation, activeRoute, backgroundColor = '#f8f6f6', children }) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {children}
      </SafeAreaView>
      <BottomNavBar navigation={navigation} activeRoute={activeRoute} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
});

export default AppScreenLayout;
```

- [ ] **Step 1: Remove the `BottomNavBar` import**

Edit `src/presentation/components/common/AppScreenLayout.js`:

old_string:
```jsx
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNavBar from './BottomNavBar';
```

new_string:
```jsx
import { SafeAreaView } from 'react-native-safe-area-context';
```

- [ ] **Step 2: Drop `navigation`/`activeRoute` from the component signature**

old_string:
```jsx
const AppScreenLayout = ({ navigation, activeRoute, backgroundColor = '#f8f6f6', children }) => {
```

new_string:
```jsx
const AppScreenLayout = ({ backgroundColor = '#f8f6f6', children }) => {
```

- [ ] **Step 3: Remove the `BottomNavBar` render**

old_string:
```jsx
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {children}
      </SafeAreaView>
      <BottomNavBar navigation={navigation} activeRoute={activeRoute} />
    </View>
```

new_string:
```jsx
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {children}
      </SafeAreaView>
    </View>
```

- [ ] **Step 4: Verify the resulting file**

Run: `Read src/presentation/components/common/AppScreenLayout.js`

Expected: exactly this content:

```jsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AppScreenLayout = ({ backgroundColor = '#f8f6f6', children }) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {children}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
});

export default AppScreenLayout;
```

- [ ] **Step 5: Commit**

```bash
git add src/presentation/components/common/AppScreenLayout.js
git commit -m "Simplify AppScreenLayout: drop BottomNavBar (moves to app root)"
```

---

### Task 2: Move `BottomNavBar` to the app root in `App.js`

**Files:**
- Modify: `App.js`

**Current `App.js` (75 lines):**

```jsx
import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider, ActivityIndicator } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

// Clean Architecture imports
import { theme } from './src/presentation/theme';
import AppNavigator from './src/presentation/navigation/AppNavigator';
import { container } from './src/di/container';

// Mantener la splash screen visible mientras se cargan las fuentes
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Cargar las fuentes Inter
  let [fontsLoaded, fontError] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Limpiar sesión y cookies al cargar la aplicación
        console.log('Iniciando aplicación - Limpiando sesión...');
        container.authRepository.clearSession();

        // Esperar a que las fuentes se carguen
        if (fontsLoaded || fontError) {
          setAppIsReady(true);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, [fontsLoaded, fontError]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Ocultar la splash screen después de que las fuentes se hayan cargado
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </View>
  );
}
```

- [ ] **Step 1: Update imports**

old_string:
```jsx
import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider, ActivityIndicator } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

// Clean Architecture imports
import { theme } from './src/presentation/theme';
import AppNavigator from './src/presentation/navigation/AppNavigator';
import { container } from './src/di/container';
```

new_string:
```jsx
import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider, ActivityIndicator } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

// Clean Architecture imports
import { theme } from './src/presentation/theme';
import AppNavigator from './src/presentation/navigation/AppNavigator';
import { container } from './src/di/container';
import BottomNavBar from './src/presentation/components/common/BottomNavBar';
```

- [ ] **Step 2: Create the navigation ref (module scope, before the component)**

old_string:
```jsx
// Mantener la splash screen visible mientras se cargan las fuentes
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
```

new_string:
```jsx
// Mantener la splash screen visible mientras se cargan las fuentes
SplashScreen.preventAutoHideAsync();

const navigationRef = createNavigationContainerRef();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [currentRouteName, setCurrentRouteName] = useState();
```

- [ ] **Step 3: Wrap the return value in `SafeAreaProvider`, wire up the ref, and render `BottomNavBar`**

old_string:
```jsx
  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </View>
  );
}
```

new_string:
```jsx
  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer
            ref={navigationRef}
            onStateChange={() => setCurrentRouteName(navigationRef.getCurrentRoute()?.name)}
          >
            <AppNavigator />
          </NavigationContainer>
          {currentRouteName && currentRouteName !== 'Login' && (
            <BottomNavBar navigation={navigationRef} activeRoute={currentRouteName} />
          )}
        </PaperProvider>
      </SafeAreaProvider>
    </View>
  );
}
```

- [ ] **Step 4: Verify the resulting file**

Run: `Read App.js`

Expected: full file matches the "Current `App.js`" block above except for the three edits — imports include `createNavigationContainerRef`, `SafeAreaProvider`, and `BottomNavBar`; `navigationRef` is created at module scope; `currentRouteName` state is added; the return statement wraps `PaperProvider` in `SafeAreaProvider`, passes `ref` and `onStateChange` to `NavigationContainer`, and conditionally renders `BottomNavBar` after it.

- [ ] **Step 5: Commit**

```bash
git add App.js
git commit -m "Render BottomNavBar at app root, outside the navigation stack"
```

---

### Task 3: Drop props in home/agenda/module/menuEscolar screens

**Files:**
- Modify: `src/presentation/screens/home/HomeScreen.js:373`
- Modify: `src/presentation/screens/agenda/AgendaVirtualScreen.js:313`
- Modify: `src/presentation/screens/module/ModuleScreen.js:12`
- Modify: `src/presentation/screens/menuEscolar/MenuEscolarScreen.js:40`

- [ ] **Step 1: `HomeScreen.js`**

Edit `src/presentation/screens/home/HomeScreen.js`:

old_string:
```jsx
    <AppScreenLayout navigation={navigation} activeRoute="Welcome">
```

new_string:
```jsx
    <AppScreenLayout>
```

- [ ] **Step 2: `AgendaVirtualScreen.js`**

Edit `src/presentation/screens/agenda/AgendaVirtualScreen.js`:

old_string:
```jsx
    <AppScreenLayout navigation={navigation} activeRoute="AgendaVirtual">
```

new_string:
```jsx
    <AppScreenLayout>
```

- [ ] **Step 3: `ModuleScreen.js`**

Edit `src/presentation/screens/module/ModuleScreen.js`:

old_string:
```jsx
    <AppScreenLayout navigation={navigation}>
```

new_string:
```jsx
    <AppScreenLayout>
```

- [ ] **Step 4: `MenuEscolarScreen.js`**

Edit `src/presentation/screens/menuEscolar/MenuEscolarScreen.js`:

old_string:
```jsx
    <AppScreenLayout navigation={navigation}>
```

new_string:
```jsx
    <AppScreenLayout>
```

- [ ] **Step 5: Verify**

Run: `grep -rn "AppScreenLayout navigation" src/presentation/screens/home src/presentation/screens/agenda src/presentation/screens/module src/presentation/screens/menuEscolar`

Expected: no matches.

- [ ] **Step 6: Commit**

```bash
git add src/presentation/screens/home/HomeScreen.js src/presentation/screens/agenda/AgendaVirtualScreen.js src/presentation/screens/module/ModuleScreen.js src/presentation/screens/menuEscolar/MenuEscolarScreen.js
git commit -m "Drop navigation/activeRoute props from AppScreenLayout (home/agenda/module/menuEscolar)"
```

---

### Task 4: Drop props in circular screens

**Files:**
- Modify: `src/presentation/screens/circular/CircularesScreen.js:60,84` (2 occurrences, `replace_all`)
- Modify: `src/presentation/screens/circular/ModuloCircularesScreen.js:25`
- Modify: `src/presentation/screens/circular/EncuestasScreen.js:57,81` (2 occurrences, `replace_all`)
- Modify: `src/presentation/screens/circular/DetalleEncuestaScreen.js:98,116,129,163` (4 occurrences, `replace_all`)
- Modify: `src/presentation/screens/circular/DetalleCircularScreen.js:156,172,185,220` (4 occurrences, `replace_all`)

- [ ] **Step 1: `CircularesScreen.js`**

Edit `src/presentation/screens/circular/CircularesScreen.js` with `replace_all: true`:

old_string:
```jsx
<AppScreenLayout navigation={navigation} activeRoute="Circulares">
```

new_string:
```jsx
<AppScreenLayout>
```

- [ ] **Step 2: `ModuloCircularesScreen.js`**

Edit `src/presentation/screens/circular/ModuloCircularesScreen.js`:

old_string:
```jsx
    <AppScreenLayout navigation={navigation}>
```

new_string:
```jsx
    <AppScreenLayout>
```

- [ ] **Step 3: `EncuestasScreen.js`**

Edit `src/presentation/screens/circular/EncuestasScreen.js` with `replace_all: true`:

old_string:
```jsx
<AppScreenLayout navigation={navigation}>
```

new_string:
```jsx
<AppScreenLayout>
```

- [ ] **Step 4: `DetalleEncuestaScreen.js`**

Edit `src/presentation/screens/circular/DetalleEncuestaScreen.js` with `replace_all: true`:

old_string:
```jsx
<AppScreenLayout navigation={navigation}>
```

new_string:
```jsx
<AppScreenLayout>
```

- [ ] **Step 5: `DetalleCircularScreen.js`**

Edit `src/presentation/screens/circular/DetalleCircularScreen.js` with `replace_all: true`:

old_string:
```jsx
<AppScreenLayout navigation={navigation}>
```

new_string:
```jsx
<AppScreenLayout>
```

- [ ] **Step 6: Verify**

Run: `grep -rn "AppScreenLayout navigation\|AppScreenLayout.*activeRoute" src/presentation/screens/circular`

Expected: no matches.

Run: `grep -c "<AppScreenLayout>" src/presentation/screens/circular/CircularesScreen.js src/presentation/screens/circular/ModuloCircularesScreen.js src/presentation/screens/circular/EncuestasScreen.js src/presentation/screens/circular/DetalleEncuestaScreen.js src/presentation/screens/circular/DetalleCircularScreen.js`

Expected counts: `CircularesScreen.js:2`, `ModuloCircularesScreen.js:1`, `EncuestasScreen.js:2`, `DetalleEncuestaScreen.js:4`, `DetalleCircularScreen.js:4`.

- [ ] **Step 7: Commit**

```bash
git add src/presentation/screens/circular
git commit -m "Drop navigation/activeRoute props from AppScreenLayout (circular screens)"
```

---

### Task 5: Drop props in academico screens

**Files:**
- Modify: `src/presentation/screens/academico/AcademicoScreen.js:33`
- Modify: `src/presentation/screens/academico/BoletinAcademicoScreen.js:81`
- Modify: `src/presentation/screens/academico/EstudiantesDestacadosScreen.js:81`
- Modify: `src/presentation/screens/academico/MejorCursoScreen.js:91`
- Modify: `src/presentation/screens/academico/ComunicadoDiagnosticaScreen.js:153,171,184,201` (4 occurrences, `replace_all`)
- Modify: `src/presentation/screens/academico/EvaluacionesDiagnosticasScreen.js:75,87` (2 occurrences, `replace_all`)
- Modify: `src/presentation/screens/academico/EvaluacionesPeriodoScreen.js:133,146,159` (3 occurrences, `replace_all`)
- Modify: `src/presentation/screens/academico/FechasDiagnosticasScreen.js:135,148,161` (3 occurrences, `replace_all`)

All edits use the same old/new pair. For the 4 single-occurrence files, use a plain `Edit`. For the 4 multi-occurrence files, use `Edit` with `replace_all: true`.

old_string (all files):
```jsx
<AppScreenLayout navigation={navigation}>
```

new_string (all files):
```jsx
<AppScreenLayout>
```

- [ ] **Step 1:** Edit `src/presentation/screens/academico/AcademicoScreen.js` (single occurrence)
- [ ] **Step 2:** Edit `src/presentation/screens/academico/BoletinAcademicoScreen.js` (single occurrence)
- [ ] **Step 3:** Edit `src/presentation/screens/academico/EstudiantesDestacadosScreen.js` (single occurrence)
- [ ] **Step 4:** Edit `src/presentation/screens/academico/MejorCursoScreen.js` (single occurrence)
- [ ] **Step 5:** Edit `src/presentation/screens/academico/ComunicadoDiagnosticaScreen.js` with `replace_all: true` (4 occurrences)
- [ ] **Step 6:** Edit `src/presentation/screens/academico/EvaluacionesDiagnosticasScreen.js` with `replace_all: true` (2 occurrences)
- [ ] **Step 7:** Edit `src/presentation/screens/academico/EvaluacionesPeriodoScreen.js` with `replace_all: true` (3 occurrences)
- [ ] **Step 8:** Edit `src/presentation/screens/academico/FechasDiagnosticasScreen.js` with `replace_all: true` (3 occurrences)

- [ ] **Step 9: Verify**

Run: `grep -rn "AppScreenLayout navigation" src/presentation/screens/academico`

Expected: no matches.

Run: `grep -c "<AppScreenLayout>" src/presentation/screens/academico/*.js`

Expected counts: `AcademicoScreen.js:1`, `BoletinAcademicoScreen.js:1`, `ComunicadoDiagnosticaScreen.js:4`, `EstudiantesDestacadosScreen.js:1`, `EvaluacionesDiagnosticasScreen.js:2`, `EvaluacionesPeriodoScreen.js:3`, `FechasDiagnosticasScreen.js:3`, `MejorCursoScreen.js:1`.

- [ ] **Step 10: Commit**

```bash
git add src/presentation/screens/academico
git commit -m "Drop navigation/activeRoute props from AppScreenLayout (academico screens)"
```

---

### Task 6: Drop props in misc single-occurrence screens

**Files:**
- Modify: `src/presentation/screens/ayuda/AyudaScreen.js:10`
- Modify: `src/presentation/screens/calendario/CalendarioCurricularScreen.js:10`
- Modify: `src/presentation/screens/cambioClave/CambioClaveScreen.js:10`
- Modify: `src/presentation/screens/comunicaciones/ComunicacionesScreen.js:10`
- Modify: `src/presentation/screens/deportes/DeportesScreen.js:10`
- Modify: `src/presentation/screens/entrevista/EntrevistaScreen.js:10`
- Modify: `src/presentation/screens/extraEscolares/ExtraEscolaresScreen.js:10`
- Modify: `src/presentation/screens/planeacion/PlaneacionScreen.js:10`

All 8 files have exactly one occurrence of:

old_string:
```jsx
    <AppScreenLayout navigation={navigation}>
```

new_string:
```jsx
    <AppScreenLayout>
```

- [ ] **Step 1:** Edit `src/presentation/screens/ayuda/AyudaScreen.js`
- [ ] **Step 2:** Edit `src/presentation/screens/calendario/CalendarioCurricularScreen.js`
- [ ] **Step 3:** Edit `src/presentation/screens/cambioClave/CambioClaveScreen.js`
- [ ] **Step 4:** Edit `src/presentation/screens/comunicaciones/ComunicacionesScreen.js`
- [ ] **Step 5:** Edit `src/presentation/screens/deportes/DeportesScreen.js`
- [ ] **Step 6:** Edit `src/presentation/screens/entrevista/EntrevistaScreen.js`
- [ ] **Step 7:** Edit `src/presentation/screens/extraEscolares/ExtraEscolaresScreen.js`
- [ ] **Step 8:** Edit `src/presentation/screens/planeacion/PlaneacionScreen.js`

- [ ] **Step 9: Verify**

Run: `grep -rln "AppScreenLayout navigation" src/presentation/screens/ayuda src/presentation/screens/calendario src/presentation/screens/cambioClave src/presentation/screens/comunicaciones src/presentation/screens/deportes src/presentation/screens/entrevista src/presentation/screens/extraEscolares src/presentation/screens/planeacion`

Expected: no matches.

- [ ] **Step 10: Commit**

```bash
git add src/presentation/screens/ayuda src/presentation/screens/calendario src/presentation/screens/cambioClave src/presentation/screens/comunicaciones src/presentation/screens/deportes src/presentation/screens/entrevista src/presentation/screens/extraEscolares src/presentation/screens/planeacion
git commit -m "Drop navigation prop from AppScreenLayout (misc single screens)"
```

---

### Task 7: Drop props in cartera and enfermeria screens

**Files:**
- Modify: `src/presentation/screens/cartera/CarteraScreen.js:50`
- Modify: `src/presentation/screens/cartera/CertificadoRetencionScreen.js:27`
- Modify: `src/presentation/screens/cartera/PagosOnlineScreen.js:50`
- Modify: `src/presentation/screens/cartera/ReciboPagoScreen.js:64`
- Modify: `src/presentation/screens/enfermeria/EnfermeriaScreen.js:146,158` (2 occurrences, `replace_all`)

old_string:
```jsx
<AppScreenLayout navigation={navigation}>
```

new_string:
```jsx
<AppScreenLayout>
```

- [ ] **Step 1:** Edit `src/presentation/screens/cartera/CarteraScreen.js` (single occurrence)
- [ ] **Step 2:** Edit `src/presentation/screens/cartera/CertificadoRetencionScreen.js` (single occurrence)
- [ ] **Step 3:** Edit `src/presentation/screens/cartera/PagosOnlineScreen.js` (single occurrence)
- [ ] **Step 4:** Edit `src/presentation/screens/cartera/ReciboPagoScreen.js` (single occurrence)
- [ ] **Step 5:** Edit `src/presentation/screens/enfermeria/EnfermeriaScreen.js` with `replace_all: true` (2 occurrences)

- [ ] **Step 6: Verify**

Run: `grep -rn "AppScreenLayout navigation" src/presentation/screens/cartera src/presentation/screens/enfermeria`

Expected: no matches.

Run: `grep -c "<AppScreenLayout>" src/presentation/screens/enfermeria/EnfermeriaScreen.js`

Expected: `2`.

- [ ] **Step 7: Commit**

```bash
git add src/presentation/screens/cartera src/presentation/screens/enfermeria
git commit -m "Drop navigation prop from AppScreenLayout (cartera, enfermeria)"
```

---

### Task 8: Drop props in informacion and matriculas screens

**Files:**
- Modify: `src/presentation/screens/informacion/AtencionPsicologicaScreen.js:90`
- Modify: `src/presentation/screens/informacion/CostosScreen.js:24`
- Modify: `src/presentation/screens/informacion/InformacionScreen.js:31`
- Modify: `src/presentation/screens/informacion/ManualConvivenciaScreen.js:11`
- Modify: `src/presentation/screens/informacion/PoliticasSeguridadScreen.js:11`
- Modify: `src/presentation/screens/informacion/PolizaSeguroScreen.js:11`
- Modify: `src/presentation/screens/matriculas/ActualizacionDatosScreen.js:44`
- Modify: `src/presentation/screens/matriculas/FirmaElectronicaScreen.js:10`
- Modify: `src/presentation/screens/matriculas/InformacionServiciosScreen.js:11`
- Modify: `src/presentation/screens/matriculas/MatriculasScreen.js:27`

All 10 files have exactly one occurrence of:

old_string:
```jsx
    <AppScreenLayout navigation={navigation}>
```

new_string:
```jsx
    <AppScreenLayout>
```

- [ ] **Step 1:** Edit `src/presentation/screens/informacion/AtencionPsicologicaScreen.js`
- [ ] **Step 2:** Edit `src/presentation/screens/informacion/CostosScreen.js`
- [ ] **Step 3:** Edit `src/presentation/screens/informacion/InformacionScreen.js`
- [ ] **Step 4:** Edit `src/presentation/screens/informacion/ManualConvivenciaScreen.js`
- [ ] **Step 5:** Edit `src/presentation/screens/informacion/PoliticasSeguridadScreen.js`
- [ ] **Step 6:** Edit `src/presentation/screens/informacion/PolizaSeguroScreen.js`
- [ ] **Step 7:** Edit `src/presentation/screens/matriculas/ActualizacionDatosScreen.js`
- [ ] **Step 8:** Edit `src/presentation/screens/matriculas/FirmaElectronicaScreen.js`
- [ ] **Step 9:** Edit `src/presentation/screens/matriculas/InformacionServiciosScreen.js`
- [ ] **Step 10:** Edit `src/presentation/screens/matriculas/MatriculasScreen.js`

- [ ] **Step 11: Verify**

Run: `grep -rln "AppScreenLayout navigation" src/presentation/screens/informacion src/presentation/screens/matriculas`

Expected: no matches.

- [ ] **Step 12: Commit**

```bash
git add src/presentation/screens/informacion src/presentation/screens/matriculas
git commit -m "Drop navigation prop from AppScreenLayout (informacion, matriculas)"
```

---

### Task 9: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Confirm no screen passes `navigation` or `activeRoute` to `AppScreenLayout`**

Run: `grep -rn "AppScreenLayout navigation\|AppScreenLayout.*activeRoute" src/presentation/screens`

Expected: no matches.

- [ ] **Step 2: Confirm every `<AppScreenLayout>` opening tag is prop-less**

Run: `grep -rn "<AppScreenLayout " src/presentation/screens`

Expected: no matches (a trailing space before `>` would indicate leftover props).

Run: `grep -rc "<AppScreenLayout>" src/presentation/screens --include=*.js | awk -F: '{s+=$2} END {print s}'`

Expected: `57`.

- [ ] **Step 3: Confirm `AppScreenLayout.js` no longer imports or renders `BottomNavBar`**

Run: `grep -n "BottomNavBar" src/presentation/components/common/AppScreenLayout.js`

Expected: no matches.

- [ ] **Step 4: Confirm `App.js` wires up the root nav bar correctly**

Run: `grep -n "SafeAreaProvider\|createNavigationContainerRef\|BottomNavBar\|currentRouteName\|onStateChange" App.js`

Expected: matches for all five terms.

- [ ] **Step 5: Confirm `BottomNavBar.js` is unchanged**

Run: `git diff HEAD~8..HEAD -- src/presentation/components/common/BottomNavBar.js` (adjust range to cover this plan's commits)

Expected: no output (file untouched by this plan).

- [ ] **Step 6: JSX syntax check on all modified files**

Write and run a small Node script using the project's local `node_modules/@babel/parser` (with `jsx`, `classProperties`, `optionalChaining`, `nullishCoalescingOperator` plugins) to parse:
- `App.js`
- `src/presentation/components/common/AppScreenLayout.js`
- all 40 screen files modified in Tasks 3-8

Expected: "Checked 42 files, 0 failures".

- [ ] **Step 7: Report**

Summarize: all 57 `<AppScreenLayout>` usages are prop-less, `AppScreenLayout` is a plain layout wrapper, `App.js` renders `BottomNavBar` once at the root with `navigationRef`/`currentRouteName`, and all files parse successfully. Note (as in the prior feature) that full runtime/visual verification requires a device/emulator not available in this environment.

---

## Self-Review Notes

- **Spec coverage:** All acceptance criteria from `docs/superpowers/specs/2026-06-11-persistent-bottom-navbar-design.md` map to tasks: root rendering (Task 2), bar hidden on Login + no pre-render flash (Task 2 Step 3), `navigationRef.navigate` compatibility (Task 2, no `BottomNavBar.js` changes needed), automatic active-route highlighting (Task 2 Step 3, `activeRoute={currentRouteName}`), prop removal from all screens (Tasks 3-8), `AppScreenLayout` simplification (Task 1), final checks (Task 9).
- **Placeholder scan:** No TBD/TODO; every edit step shows exact old/new strings.
- **Type/signature consistency:** `AppScreenLayout` signature (`{ backgroundColor, children }`) matches its only remaining caller pattern (`<AppScreenLayout>` with no props, since no screen passes `backgroundColor`). `BottomNavBar`'s `navigation`/`activeRoute` props are unchanged and match what `App.js` now passes (`navigationRef`, `currentRouteName`).
