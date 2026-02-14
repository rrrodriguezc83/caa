import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import LoginScreen from './screens/LoginScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import ModuleScreen from './screens/ModuleScreen';
import AgendaVirtualScreen from './screens/AgendaVirtualScreen';
import EnfermeriaScreen from './screens/EnfermeriaScreen';
import CircularesScreen from './screens/CircularesScreen';
import DetalleCircularScreen from './screens/DetalleCircularScreen';
import { clearSession } from './services/authService';

const Stack = createNativeStackNavigator();

// Tema personalizado Material Design 3 - Tonos Azules
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1976D2',              // Azul principal (Blue 700)
    primaryContainer: '#BBDEFB',     // Azul claro para contenedores (Blue 100)
    secondary: '#0288D1',            // Azul secundario (Light Blue 700)
    secondaryContainer: '#B3E5FC',   // Azul muy claro (Light Blue 100)
    tertiary: '#0097A7',             // Cyan oscuro (Cyan 700)
    tertiaryContainer: '#B2EBF2',    // Cyan claro (Cyan 100)
    error: '#D32F2F',                // Rojo para errores
    errorContainer: '#FFCDD2',       // Rojo claro
    background: '#E3F2FD',           // Fondo azul muy suave (Blue 50)
    surface: '#FFFFFF',              // Superficie blanca
    surfaceVariant: '#E1F5FE',       // Variante de superficie azul claro
    outline: '#1976D2',              // Bordes azules
    onPrimary: '#FFFFFF',            // Texto sobre primary
    onPrimaryContainer: '#0D47A1',   // Texto sobre primary container
    onSecondary: '#FFFFFF',          // Texto sobre secondary
    onSecondaryContainer: '#01579B', // Texto sobre secondary container
    onTertiary: '#FFFFFF',           // Texto sobre tertiary
    onTertiaryContainer: '#006064',  // Texto sobre tertiary container
    onBackground: '#0D47A1',         // Texto sobre background (azul oscuro)
    onSurface: '#01579B',            // Texto sobre surface (azul oscuro)
    onSurfaceVariant: '#1565C0',     // Texto sobre surface variant
    onError: '#FFFFFF',              // Texto sobre error
    onErrorContainer: '#B71C1C',     // Texto sobre error container
  },
};

export default function App() {
  useEffect(() => {
    // Limpiar sesión y cookies al cargar la aplicación
    console.log('Iniciando aplicación - Limpiando sesión...');
    clearSession();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Module" 
            component={ModuleScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AgendaVirtual" 
            component={AgendaVirtualScreen}
            options={{ headerShown: false }}
          />
        <Stack.Screen 
          name="Enfermeria" 
          component={EnfermeriaScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Circulares" 
          component={CircularesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="DetalleCircular" 
          component={DetalleCircularScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </PaperProvider>
  );
}
