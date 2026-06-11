# Bottom Navigation Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent bottom navigation bar (Inicio / Agenda Virtual / Circulares) to every authenticated screen of the app.

**Architecture:** Two new shared components — `BottomNavBar` (the bar itself) and `AppScreenLayout` (a wrapper that renders a screen's existing content inside a `SafeAreaView` plus the `BottomNavBar` below it). Every authenticated screen (40 files, all except `LoginScreen`) replaces its outer `SafeAreaView` with `AppScreenLayout`.

**Tech Stack:** React Native, `react-native-safe-area-context`, `react-native-vector-icons/MaterialCommunityIcons`, `react-native-paper`.

**Spec:** `docs/superpowers/specs/2026-06-10-bottom-nav-bar-design.md`

---

## Important notes for every task in this plan

- This project has **no automated test/lint scripts** (per `CLAUDE.md`). "Verification" steps use `grep`-based structural checks instead of a test runner. The final task (Task 16) does a manual run-through.
- Every screen's `mainContainer` style is `{ flex: 1, backgroundColor: '#f8f6f6' }` (verified across all 40 files), which matches `AppScreenLayout`'s default `backgroundColor`. **Never pass a `backgroundColor` prop** — always omit it.
- Every screen component receives `navigation` as a prop (verified across all 40 files) — `<AppScreenLayout navigation={navigation}>` is always valid.
- Leave the now-unused `mainContainer` style object definitions in place. Removing them is out of scope (they're harmless dead style objects, removing them across 40 files is unrelated busywork).

### The standard per-file migration recipe

Every screen file (except the 3 special ones in Tasks 3-5) follows this exact recipe. Tasks 6-15 reference it by name ("apply the standard recipe").

**1. Replace the safe-area-context import.**

Find (exact, appears once per file):
```js
import { SafeAreaView } from 'react-native-safe-area-context';
```
Replace with:
```js
import AppScreenLayout from '../../components/common/AppScreenLayout';
```

**2. Replace every opening `SafeAreaView` tag.**

Find (exact, may appear 1-4 times in a file — use `replace_all: true`):
```js
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
```
Replace with:
```js
    <AppScreenLayout navigation={navigation}>
```

**3. Replace every closing `SafeAreaView` tag.**

Find (exact, may appear 1-4 times in a file — use `replace_all: true`):
```js
    </SafeAreaView>
```
Replace with:
```js
    </AppScreenLayout>
```

**4. Verify.**

Run (from repo root):
```bash
grep -c "SafeAreaView" src/presentation/screens/<path>/<File>.js
grep -c "<AppScreenLayout" src/presentation/screens/<path>/<File>.js
grep -c "</AppScreenLayout>" src/presentation/screens/<path>/<File>.js
```
Expected: first command outputs `0`; second and third commands output the same number (matching the occurrence count noted for that file in the task).

---

## Task 1: Create `BottomNavBar` component

**Files:**
- Create: `src/presentation/components/common/BottomNavBar.js`

- [ ] **Step 1: Create the component**

```jsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const NAV_ITEMS = [
  { route: 'Welcome', label: 'Inicio', icon: 'home' },
  { route: 'AgendaVirtual', label: 'Agenda Virtual', icon: 'laptop' },
  { route: 'Circulares', label: 'Circulares', icon: 'email-newsletter' },
];

const ACTIVE_COLOR = '#002c5d';
const INACTIVE_COLOR = '#94a3b8';

const BottomNavBar = ({ navigation, activeRoute }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {NAV_ITEMS.map((item) => {
        const isActive = activeRoute === item.route;
        const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;
        return (
          <TouchableOpacity
            key={item.route}
            style={styles.item}
            onPress={() => navigation.navigate(item.route)}
            activeOpacity={0.7}
          >
            <Icon name={item.icon} size={24} color={color} />
            <Text style={[styles.label, { color }]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 44, 93, 0.1)',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  label: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    marginTop: 2,
  },
});

export default BottomNavBar;
```

- [ ] **Step 2: Verify the file was created correctly**

```bash
grep -c "export default BottomNavBar" src/presentation/components/common/BottomNavBar.js
```
Expected: `1`. Full syntax validation happens when the app is built in Task 16 (no test/lint runner is configured for this project).

- [ ] **Step 3: Commit**

```bash
git add src/presentation/components/common/BottomNavBar.js
git commit -m "Add BottomNavBar component"
```

---

## Task 2: Create `AppScreenLayout` component

**Files:**
- Create: `src/presentation/components/common/AppScreenLayout.js`

- [ ] **Step 1: Create the component**

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

- [ ] **Step 2: Verify the file was created correctly**

```bash
grep -c "export default AppScreenLayout" src/presentation/components/common/AppScreenLayout.js
```
Expected: `1`. Full syntax validation happens when the app is built in Task 16 (no test/lint runner is configured for this project).

- [ ] **Step 3: Commit**

```bash
git add src/presentation/components/common/AppScreenLayout.js
git commit -m "Add AppScreenLayout wrapper component"
```

---

## Task 3: Migrate `HomeScreen.js` (activeRoute="Welcome")

**Files:**
- Modify: `src/presentation/screens/home/HomeScreen.js`

This file has **1** `SafeAreaView` occurrence, with `edges={['top', 'left', 'right']}` (not just `['top']`).

- [ ] **Step 1: Replace the import**

Find:
```js
import { SafeAreaView } from 'react-native-safe-area-context';
```
Replace with:
```js
import AppScreenLayout from '../../components/common/AppScreenLayout';
```

- [ ] **Step 2: Replace the opening tag**

Find:
```js
    <SafeAreaView style={styles.mainContainer} edges={['top', 'left', 'right']}>
```
Replace with:
```js
    <AppScreenLayout navigation={navigation} activeRoute="Welcome">
```

- [ ] **Step 3: Replace the closing tag**

Find:
```js
    </SafeAreaView>
```
Replace with:
```js
    </AppScreenLayout>
```

- [ ] **Step 4: Verify**

```bash
grep -c "SafeAreaView" src/presentation/screens/home/HomeScreen.js
grep -c "<AppScreenLayout" src/presentation/screens/home/HomeScreen.js
grep -c "</AppScreenLayout>" src/presentation/screens/home/HomeScreen.js
```
Expected: `0`, `1`, `1`.

- [ ] **Step 5: Commit**

```bash
git add src/presentation/screens/home/HomeScreen.js
git commit -m "Migrate HomeScreen to AppScreenLayout with bottom nav bar"
```

---

## Task 4: Migrate `AgendaVirtualScreen.js` (activeRoute="AgendaVirtual")

**Files:**
- Modify: `src/presentation/screens/agenda/AgendaVirtualScreen.js`

This file has **1** `SafeAreaView` occurrence, using `agendaStyles.mainContainer` (not `styles.mainContainer`).

- [ ] **Step 1: Replace the import**

Find:
```js
import { SafeAreaView } from 'react-native-safe-area-context';
```
Replace with:
```js
import AppScreenLayout from '../../components/common/AppScreenLayout';
```

- [ ] **Step 2: Replace the opening tag**

Find:
```js
    <SafeAreaView style={agendaStyles.mainContainer} edges={['top']}>
```
Replace with:
```js
    <AppScreenLayout navigation={navigation} activeRoute="AgendaVirtual">
```

- [ ] **Step 3: Replace the closing tag**

Find:
```js
    </SafeAreaView>
```
Replace with:
```js
    </AppScreenLayout>
```

- [ ] **Step 4: Verify**

```bash
grep -c "SafeAreaView" src/presentation/screens/agenda/AgendaVirtualScreen.js
grep -c "<AppScreenLayout" src/presentation/screens/agenda/AgendaVirtualScreen.js
grep -c "</AppScreenLayout>" src/presentation/screens/agenda/AgendaVirtualScreen.js
```
Expected: `0`, `1`, `1`.

- [ ] **Step 5: Commit**

```bash
git add src/presentation/screens/agenda/AgendaVirtualScreen.js
git commit -m "Migrate AgendaVirtualScreen to AppScreenLayout with bottom nav bar"
```

---

## Task 5: Migrate `CircularesScreen.js` (activeRoute="Circulares")

**Files:**
- Modify: `src/presentation/screens/circular/CircularesScreen.js`

This file has **2** `SafeAreaView` occurrences (one in the loading-state early return, one in the main return). Both get `activeRoute="Circulares"`.

- [ ] **Step 1: Replace the import**

Find:
```js
import { SafeAreaView } from 'react-native-safe-area-context';
```
Replace with:
```js
import AppScreenLayout from '../../components/common/AppScreenLayout';
```

- [ ] **Step 2: Replace both opening tags**

Find (use `replace_all: true` — appears twice, identical):
```js
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
```
Replace with:
```js
    <AppScreenLayout navigation={navigation} activeRoute="Circulares">
```

- [ ] **Step 3: Replace both closing tags**

Find (use `replace_all: true` — appears twice, identical):
```js
    </SafeAreaView>
```
Replace with:
```js
    </AppScreenLayout>
```

- [ ] **Step 4: Verify**

```bash
grep -c "SafeAreaView" src/presentation/screens/circular/CircularesScreen.js
grep -c "<AppScreenLayout" src/presentation/screens/circular/CircularesScreen.js
grep -c "</AppScreenLayout>" src/presentation/screens/circular/CircularesScreen.js
```
Expected: `0`, `2`, `2`.

- [ ] **Step 5: Commit**

```bash
git add src/presentation/screens/circular/CircularesScreen.js
git commit -m "Migrate CircularesScreen to AppScreenLayout with bottom nav bar"
```

---

## Task 6: Migrate academico screens, part 1 (single-occurrence files)

**Files:**
- Modify: `src/presentation/screens/academico/AcademicoScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/academico/BoletinAcademicoScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/academico/EstudiantesDestacadosScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/academico/MejorCursoScreen.js` (1 occurrence)

- [ ] **Step 1:** Apply the standard recipe (see "The standard per-file migration recipe" above) to `AcademicoScreen.js`. No `activeRoute` prop. Verify expects `0`, `1`, `1`.

- [ ] **Step 2:** Apply the standard recipe to `BoletinAcademicoScreen.js`. No `activeRoute` prop. Verify expects `0`, `1`, `1`.

- [ ] **Step 3:** Apply the standard recipe to `EstudiantesDestacadosScreen.js`. No `activeRoute` prop. Verify expects `0`, `1`, `1`.

- [ ] **Step 4:** Apply the standard recipe to `MejorCursoScreen.js`. No `activeRoute` prop. Verify expects `0`, `1`, `1`.

- [ ] **Step 5: Commit**

```bash
git add src/presentation/screens/academico/AcademicoScreen.js src/presentation/screens/academico/BoletinAcademicoScreen.js src/presentation/screens/academico/EstudiantesDestacadosScreen.js src/presentation/screens/academico/MejorCursoScreen.js
git commit -m "Migrate academico screens (part 1) to AppScreenLayout"
```

---

## Task 7: Migrate academico screens, part 2 (multi-occurrence files)

**Files:**
- Modify: `src/presentation/screens/academico/ComunicadoDiagnosticaScreen.js` (4 occurrences)
- Modify: `src/presentation/screens/academico/EvaluacionesDiagnosticasScreen.js` (2 occurrences)
- Modify: `src/presentation/screens/academico/EvaluacionesPeriodoScreen.js` (3 occurrences)
- Modify: `src/presentation/screens/academico/FechasDiagnosticasScreen.js` (3 occurrences)

All four files have multiple early-return states (loading/error/empty), each wrapped in its own `SafeAreaView` with the exact same `<SafeAreaView style={styles.mainContainer} edges={['top']}>` / `</SafeAreaView>` pair. No `activeRoute` prop on any of them.

- [ ] **Step 1:** Apply the standard recipe to `ComunicadoDiagnosticaScreen.js`, using `replace_all: true` for steps 2 and 3. Verify expects `0`, `4`, `4`.

- [ ] **Step 2:** Apply the standard recipe to `EvaluacionesDiagnosticasScreen.js`, using `replace_all: true` for steps 2 and 3. Verify expects `0`, `2`, `2`.

- [ ] **Step 3:** Apply the standard recipe to `EvaluacionesPeriodoScreen.js`, using `replace_all: true` for steps 2 and 3. Verify expects `0`, `3`, `3`.

- [ ] **Step 4:** Apply the standard recipe to `FechasDiagnosticasScreen.js`, using `replace_all: true` for steps 2 and 3. Verify expects `0`, `3`, `3`.

- [ ] **Step 5: Commit**

```bash
git add src/presentation/screens/academico/ComunicadoDiagnosticaScreen.js src/presentation/screens/academico/EvaluacionesDiagnosticasScreen.js src/presentation/screens/academico/EvaluacionesPeriodoScreen.js src/presentation/screens/academico/FechasDiagnosticasScreen.js
git commit -m "Migrate academico screens (part 2) to AppScreenLayout"
```

---

## Task 8: Migrate top-level single-screen modules (ayuda, calendario, cambioClave, comunicaciones, deportes, entrevista, extraEscolares, planeacion)

**Files:**
- Modify: `src/presentation/screens/ayuda/AyudaScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/calendario/CalendarioCurricularScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/cambioClave/CambioClaveScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/comunicaciones/ComunicacionesScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/deportes/DeportesScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/entrevista/EntrevistaScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/extraEscolares/ExtraEscolaresScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/planeacion/PlaneacionScreen.js` (1 occurrence)

- [ ] **Step 1:** Apply the standard recipe to `AyudaScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 2:** Apply the standard recipe to `CalendarioCurricularScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 3:** Apply the standard recipe to `CambioClaveScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 4:** Apply the standard recipe to `ComunicacionesScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 5:** Apply the standard recipe to `DeportesScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 6:** Apply the standard recipe to `EntrevistaScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 7:** Apply the standard recipe to `ExtraEscolaresScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 8:** Apply the standard recipe to `PlaneacionScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 9: Commit**

```bash
git add src/presentation/screens/ayuda/AyudaScreen.js src/presentation/screens/calendario/CalendarioCurricularScreen.js src/presentation/screens/cambioClave/CambioClaveScreen.js src/presentation/screens/comunicaciones/ComunicacionesScreen.js src/presentation/screens/deportes/DeportesScreen.js src/presentation/screens/entrevista/EntrevistaScreen.js src/presentation/screens/extraEscolares/ExtraEscolaresScreen.js src/presentation/screens/planeacion/PlaneacionScreen.js
git commit -m "Migrate top-level module screens to AppScreenLayout"
```

---

## Task 9: Migrate cartera screens

**Files:**
- Modify: `src/presentation/screens/cartera/CarteraScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/cartera/CertificadoRetencionScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/cartera/PagosOnlineScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/cartera/ReciboPagoScreen.js` (1 occurrence)

- [ ] **Step 1:** Apply the standard recipe to `CarteraScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 2:** Apply the standard recipe to `CertificadoRetencionScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 3:** Apply the standard recipe to `PagosOnlineScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 4:** Apply the standard recipe to `ReciboPagoScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 5: Commit**

```bash
git add src/presentation/screens/cartera/CarteraScreen.js src/presentation/screens/cartera/CertificadoRetencionScreen.js src/presentation/screens/cartera/PagosOnlineScreen.js src/presentation/screens/cartera/ReciboPagoScreen.js
git commit -m "Migrate cartera screens to AppScreenLayout"
```

---

## Task 10: Migrate circular screens, part 1 (DetalleCircularScreen, ModuloCircularesScreen)

**Files:**
- Modify: `src/presentation/screens/circular/DetalleCircularScreen.js` (4 occurrences)
- Modify: `src/presentation/screens/circular/ModuloCircularesScreen.js` (1 occurrence)

- [ ] **Step 1:** Apply the standard recipe to `DetalleCircularScreen.js`, using `replace_all: true` for steps 2 and 3. No `activeRoute`. Verify expects `0`, `4`, `4`.

- [ ] **Step 2:** Apply the standard recipe to `ModuloCircularesScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 3: Commit**

```bash
git add src/presentation/screens/circular/DetalleCircularScreen.js src/presentation/screens/circular/ModuloCircularesScreen.js
git commit -m "Migrate DetalleCircularScreen and ModuloCircularesScreen to AppScreenLayout"
```

---

## Task 11: Migrate circular screens, part 2 (DetalleEncuestaScreen, EncuestasScreen)

**Files:**
- Modify: `src/presentation/screens/circular/DetalleEncuestaScreen.js` (4 occurrences)
- Modify: `src/presentation/screens/circular/EncuestasScreen.js` (2 occurrences)

- [ ] **Step 1:** Apply the standard recipe to `DetalleEncuestaScreen.js`, using `replace_all: true` for steps 2 and 3. No `activeRoute`. Verify expects `0`, `4`, `4`.

- [ ] **Step 2:** Apply the standard recipe to `EncuestasScreen.js`, using `replace_all: true` for steps 2 and 3. No `activeRoute`. Verify expects `0`, `2`, `2`.

- [ ] **Step 3: Commit**

```bash
git add src/presentation/screens/circular/DetalleEncuestaScreen.js src/presentation/screens/circular/EncuestasScreen.js
git commit -m "Migrate DetalleEncuestaScreen and EncuestasScreen to AppScreenLayout"
```

---

## Task 12: Migrate `EnfermeriaScreen.js`

**Files:**
- Modify: `src/presentation/screens/enfermeria/EnfermeriaScreen.js` (2 occurrences)

- [ ] **Step 1:** Apply the standard recipe to `EnfermeriaScreen.js`, using `replace_all: true` for steps 2 and 3. No `activeRoute`. Verify expects `0`, `2`, `2`.

- [ ] **Step 2: Commit**

```bash
git add src/presentation/screens/enfermeria/EnfermeriaScreen.js
git commit -m "Migrate EnfermeriaScreen to AppScreenLayout"
```

---

## Task 13: Migrate informacion screens

**Files:**
- Modify: `src/presentation/screens/informacion/AtencionPsicologicaScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/informacion/CostosScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/informacion/InformacionScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/informacion/ManualConvivenciaScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/informacion/PoliticasSeguridadScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/informacion/PolizaSeguroScreen.js` (1 occurrence)

- [ ] **Step 1:** Apply the standard recipe to `AtencionPsicologicaScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 2:** Apply the standard recipe to `CostosScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 3:** Apply the standard recipe to `InformacionScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 4:** Apply the standard recipe to `ManualConvivenciaScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 5:** Apply the standard recipe to `PoliticasSeguridadScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 6:** Apply the standard recipe to `PolizaSeguroScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 7: Commit**

```bash
git add src/presentation/screens/informacion/AtencionPsicologicaScreen.js src/presentation/screens/informacion/CostosScreen.js src/presentation/screens/informacion/InformacionScreen.js src/presentation/screens/informacion/ManualConvivenciaScreen.js src/presentation/screens/informacion/PoliticasSeguridadScreen.js src/presentation/screens/informacion/PolizaSeguroScreen.js
git commit -m "Migrate informacion screens to AppScreenLayout"
```

---

## Task 14: Migrate matriculas screens

**Files:**
- Modify: `src/presentation/screens/matriculas/ActualizacionDatosScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/matriculas/FirmaElectronicaScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/matriculas/InformacionServiciosScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/matriculas/MatriculasScreen.js` (1 occurrence)

- [ ] **Step 1:** Apply the standard recipe to `ActualizacionDatosScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 2:** Apply the standard recipe to `FirmaElectronicaScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 3:** Apply the standard recipe to `InformacionServiciosScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 4:** Apply the standard recipe to `MatriculasScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 5: Commit**

```bash
git add src/presentation/screens/matriculas/ActualizacionDatosScreen.js src/presentation/screens/matriculas/FirmaElectronicaScreen.js src/presentation/screens/matriculas/InformacionServiciosScreen.js src/presentation/screens/matriculas/MatriculasScreen.js
git commit -m "Migrate matriculas screens to AppScreenLayout"
```

---

## Task 15: Migrate `MenuEscolarScreen.js` and `ModuleScreen.js`

**Files:**
- Modify: `src/presentation/screens/menuEscolar/MenuEscolarScreen.js` (1 occurrence)
- Modify: `src/presentation/screens/module/ModuleScreen.js` (1 occurrence)

- [ ] **Step 1:** Apply the standard recipe to `MenuEscolarScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 2:** Apply the standard recipe to `ModuleScreen.js`. No `activeRoute`. Verify expects `0`, `1`, `1`.

- [ ] **Step 3: Commit**

```bash
git add src/presentation/screens/menuEscolar/MenuEscolarScreen.js src/presentation/screens/module/ModuleScreen.js
git commit -m "Migrate MenuEscolarScreen and ModuleScreen to AppScreenLayout"
```

---

## Task 16: Final verification — run the app and check the bar end-to-end

**Files:** none (verification only)

- [ ] **Step 1: Repo-wide sanity check**

```bash
grep -rl "SafeAreaView" src/presentation/screens
```
Expected: only `src/presentation/screens/auth/LoginScreen.js` is listed (every other screen has been migrated).

- [ ] **Step 2: Start the app**

Use the project's `run` skill (or `npm start`) to launch the Expo dev server, then open the app on a device/emulator/web.

- [ ] **Step 3: Visual checks**

- Log in and confirm the bottom bar (Inicio / Agenda Virtual / Circulares) is visible on the Home screen, with **Inicio** highlighted in navy.
- Tap **Agenda Virtual**: confirm navigation works, the bar is still visible, and **Agenda Virtual** is highlighted.
- Tap **Circulares**: confirm navigation works, the bar is still visible, and **Circulares** is highlighted.
- From Circulares, open a circular detail (`DetalleCircular`): confirm the bar is still visible (no item highlighted) and content is not obscured by the bar.
- From the drawer (hamburger menu on Home), open at least 2-3 other modules (e.g., Cartera, Académico, Información): confirm the bar is visible on each, with no item highlighted, and tapping **Inicio** returns to Home.
- Confirm the bar respects the bottom safe-area inset on a device with a home indicator (or in the simulator with one enabled).

- [ ] **Step 4: Fix any issues found**

If any screen shows a layout issue (e.g., content cut off, double safe-area padding, bar missing), fix it in the relevant screen file and re-run the relevant verification step.

- [ ] **Step 5: Final commit (if fixes were needed)**

```bash
git add -A
git commit -m "Fix layout issues found during bottom nav bar verification"
```
