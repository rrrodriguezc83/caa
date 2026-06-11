# Persistent Bottom Navigation Bar — Design

## Goal

The bottom navigation bar added in the previous feature (`docs/superpowers/specs/2026-06-10-bottom-nav-bar-design.md`) currently renders inside each screen's `AppScreenLayout`. Because React Navigation's stack transition animates the entire screen subtree — including the bar — the bar visually slides in/out with every screen change.

This change moves the bar to the app root, outside the `Stack.Navigator`'s animated screen tree, so it stays visually static across all navigation while screen content keeps its existing slide transition.

`LoginScreen` continues to have no bar.

## Architecture

```
<SafeAreaProvider>
  <PaperProvider>
    <View style={{ flex: 1 }}>
      <NavigationContainer ref={navigationRef} onStateChange={...}>
        <AppNavigator />
      </NavigationContainer>
      {currentRouteName && currentRouteName !== 'Login' && (
        <BottomNavBar navigation={navigationRef} activeRoute={currentRouteName} />
      )}
    </View>
  </PaperProvider>
</SafeAreaProvider>
```

## Component changes

### `App.js`

- Wrap the existing tree in `<SafeAreaProvider>` (from `react-native-safe-area-context`). This is required because `BottomNavBar` calls `useSafeAreaInsets()`; once it moves outside `NavigationContainer` it loses the safe-area context that `@react-navigation/native-stack` currently provides internally to screens.
- Create `const navigationRef = createNavigationContainerRef();` (from `@react-navigation/native`).
- Add state: `const [currentRouteName, setCurrentRouteName] = useState();`
- Pass `ref={navigationRef}` and `onStateChange={() => setCurrentRouteName(navigationRef.getCurrentRoute()?.name)}` to `<NavigationContainer>`.
- Render `<BottomNavBar navigation={navigationRef} activeRoute={currentRouteName} />` as a sibling below `<NavigationContainer>`, conditionally:
  ```jsx
  {currentRouteName && currentRouteName !== 'Login' && (
    <BottomNavBar navigation={navigationRef} activeRoute={currentRouteName} />
  )}
  ```
  Starting `currentRouteName` as `undefined` ensures the bar renders nothing until the first `onStateChange` fires (reporting `'Login'`), so there's no flash of the bar before it's hidden.

### `BottomNavBar.js`

No code changes.

- `navigationRef` exposes a `.navigate(routeName)` method, same shape as a screen's `navigation` prop, so `onPress={() => navigation.navigate(item.route)}` keeps working unchanged.
- Passing the raw `currentRouteName` as `activeRoute` is safe: the component only highlights an item when `activeRoute === item.route` for `'Welcome'`, `'AgendaVirtual'`, or `'Circulares'`. Any other route name (e.g. `'DetalleCircular'`, `'ReciboPago'`) simply doesn't match any item, producing the same "nothing highlighted" result as before.
- `useSafeAreaInsets()` continues to provide `insets.bottom` for `paddingBottom`, now sourced from the root `SafeAreaProvider` instead of the navigator-internal one.

### `AppScreenLayout.js`

Simplifies back to just the background `View` + `SafeAreaView` wrapper:

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

- `BottomNavBar` import and render removed.
- `navigation` and `activeRoute` props removed.
- `backgroundColor` prop and default unchanged.

## Per-screen changes

Across `src/presentation/screens/` (40 files, 57 `<AppScreenLayout>` opening tags):

- Remove `navigation={navigation}` from every `<AppScreenLayout navigation={navigation} ...>` (all 57 occurrences).
- Remove `activeRoute="Welcome"` from `home/HomeScreen.js`.
- Remove `activeRoute="AgendaVirtual"` from `agenda/AgendaVirtualScreen.js`.
- Remove `activeRoute="Circulares"` from both occurrences in `circular/CircularesScreen.js`.

After this pass, every usage is either `<AppScreenLayout>` (no props) or `<AppScreenLayout backgroundColor="...">` where a screen already specified a custom background. No other content changes.

## Safe-area handling

Same split as the previous design, just relocated:

- Screen content: `SafeAreaView edges={['top','left','right']}` (no bottom) — unchanged.
- `BottomNavBar`: handles its own bottom inset via `useSafeAreaInsets()` + `paddingBottom` — unchanged.
- Adding `SafeAreaProvider` at the root doesn't change these computed values, it just makes the safe-area context available to `BottomNavBar` now that it renders outside the navigator.

## Behavior changes

- Active-route highlighting becomes automatic and global: previously only `HomeScreen`, `AgendaVirtualScreen`, and `CircularesScreen` passed `activeRoute` explicitly. Now `currentRouteName` is always derived from navigation state, so the same three routes highlight automatically and all other routes show no highlight — same visible result, no per-screen wiring needed.
- Screen-to-screen slide transitions are preserved (no change to `AppNavigator.js` transition config). Only the bar stops moving with them.

## Out of scope / non-goals

- No changes to `AppNavigator.js`'s screen list or transition animations.
- `LoginScreen.js` untouched.
- No new navigation routes.
- No badge/notification indicators (unchanged from previous design).

## Acceptance criteria

- `BottomNavBar` renders once at the app root (in `App.js`), not inside any screen.
- The bar is visually static (does not slide/animate) during all screen-to-screen navigation.
- The bar is hidden on `LoginScreen` and not shown before the first navigation state is known.
- Tapping Inicio/Agenda Virtual/Circulares navigates to `Welcome`/`AgendaVirtual`/`Circulares` respectively, via `navigationRef`.
- On `Welcome`, `AgendaVirtual`, and `Circulares`, the corresponding bar item is highlighted automatically; no other screen highlights any item.
- No screen passes `navigation` or `activeRoute` to `AppScreenLayout`.
- `AppScreenLayout` no longer imports or renders `BottomNavBar`.
- No content is visually obscured by the bar on any screen (same flex-based layout as before).
