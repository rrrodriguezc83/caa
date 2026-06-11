# Bottom Navigation Bar — Design

## Goal

Add a persistent bottom navigation bar with three items — **Inicio** (Home), **Agenda Virtual**, and **Circulares** — visible on every authenticated screen of the app. The bar never hides, regardless of navigation depth (including detail screens like `DetalleCircular`, `ReciboPago`, etc.).

`LoginScreen` is excluded (pre-authentication).

## Components

### 1. `BottomNavBar`

Location: `src/presentation/components/common/BottomNavBar.js`

Props:
- `navigation` — the screen's navigation prop, used to call `navigation.navigate(routeName)`.
- `activeRoute` (optional) — one of `'Welcome' | 'AgendaVirtual' | 'Circulares'`. When omitted/null, no item is highlighted.

Renders three items, each a `TouchableOpacity` column with a MaterialCommunityIcons icon + label:

| Label | Icon | Route |
|---|---|---|
| Inicio | `home` | `Welcome` |
| Agenda Virtual | `laptop` | `AgendaVirtual` |
| Circulares | `email-newsletter` | `Circulares` |

Styling:
- White background, top border `rgba(0, 44, 93, 0.1)`.
- Active item color `#002c5d` (navy), inactive `#94a3b8` (gray) — consistent with existing drawer colors.
- Bottom inset handled internally via `useSafeAreaInsets()` (from `react-native-safe-area-context`) so it sits correctly above the home indicator / nav bar on devices with no bottom safe-area edge from the parent `SafeAreaView`.
- Fixed height row + safe-area padding; not absolutely positioned — it's a flex sibling so content above it shrinks naturally.

Tapping an item calls `navigation.navigate(routeName)`. Per React Navigation stack semantics, this pops back to an existing instance of that screen if present in the stack, or pushes a new one otherwise — giving tab-like behavior without restructuring `AppNavigator`. `AgendaVirtualScreen` already tolerates being opened without the `calendarData` param (it fetches it itself when absent).

### 2. `AppScreenLayout`

Location: `src/presentation/components/common/AppScreenLayout.js`

A layout wrapper that replaces each screen's outer `SafeAreaView`:

```jsx
<View style={{ flex: 1, backgroundColor }}>
  <SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
    {children}
  </SafeAreaView>
  <BottomNavBar navigation={navigation} activeRoute={activeRoute} />
</View>
```

Props:
- `navigation` — forwarded to `BottomNavBar`.
- `activeRoute` (optional) — forwarded to `BottomNavBar`.
- `backgroundColor` (optional, default `'#f8f6f6'`) — background of the outer `View`, matching the screen's existing `mainContainer`/equivalent background.
- `children` — the screen's existing content (StatusBar, header, ScrollView, etc.), unchanged.

Because each screen's main content area already uses `flex: 1`, it shrinks naturally above the fixed-height `BottomNavBar`. **No per-screen content padding changes are required.**

## Per-screen integration

Every screen file under `src/presentation/screens/` except `auth/LoginScreen.js` (41 files have `SafeAreaView`, 40 to migrate) replaces its outer `SafeAreaView` usage with `AppScreenLayout`:

```jsx
// Before
<SafeAreaView style={styles.mainContainer} edges={['top']}>
  ...
</SafeAreaView>

// After
<AppScreenLayout navigation={navigation} activeRoute={...} backgroundColor={...}>
  ...
</AppScreenLayout>
```

- `activeRoute` is `'Welcome'` for `HomeScreen`, `'AgendaVirtual'` for `AgendaVirtualScreen`, `'Circulares'` for `CircularesScreen`. All other screens omit it (bar shows, nothing highlighted).
- `backgroundColor` is taken from the screen's existing `mainContainer` (or equivalent root) style background color, so the area behind/around the bar matches the screen.
- Screens with multiple early returns (loading/error states each wrapped in their own `SafeAreaView`, e.g. `DetalleCircularScreen`, `DetalleEncuestaScreen`, `ComunicadoDiagnosticaScreen`, `FechasDiagnosticasScreen`, `EvaluacionesPeriodoScreen`, `EnfermeriaScreen`, `EncuestasScreen`, `CircularesScreen`, `EvaluacionesDiagnosticasScreen`) need **every** `SafeAreaView` instance replaced, so the bar is present during loading/error states too.
- The `SafeAreaView` import from `react-native-safe-area-context` is removed from each screen file once no longer used directly (replaced by the import of `AppScreenLayout`).
- `edges` props passed to the old `SafeAreaView` (e.g. `['top']`, `['top','left','right']`) are dropped — `AppScreenLayout` always uses `['top','left','right']`, since the bottom edge is now handled by `BottomNavBar`'s own safe-area inset.

## Out of scope / non-goals

- No changes to `AppNavigator.js` — the flat `Stack.Navigator` structure is preserved.
- No new navigation routes.
- `LoginScreen` is not touched.
- No badge/notification indicators on the bar items (matches current drawer, which has its own notification badge elsewhere).

## Acceptance criteria

- All 40 authenticated screens render the bottom nav bar, including loading/error states.
- Tapping Inicio/Agenda Virtual/Circulares from any screen navigates to `Welcome`/`AgendaVirtual`/`Circulares` respectively.
- On `HomeScreen`, `AgendaVirtualScreen`, and `CircularesScreen`, the corresponding bar item is visually highlighted.
- No content is visually obscured by the bar on any screen (verified by checking flex layout, since `AppScreenLayout` relies on existing `flex: 1` content areas).
