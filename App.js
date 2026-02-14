import React, { useEffect, useState, useCallback } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PaperProvider, MD3LightTheme, ActivityIndicator } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ModuleScreen from './screens/ModuleScreen';
import AgendaVirtualScreen from './screens/AgendaVirtualScreen';
import EnfermeriaScreen from './screens/EnfermeriaScreen';
import CircularesScreen from './screens/CircularesScreen';
import DetalleCircularScreen from './screens/DetalleCircularScreen';
import { clearSession } from './services/authService';

// Mantener la splash screen visible mientras se cargan las fuentes
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

// Tema personalizado Material Design 3 - Tonos Azules con fuente Inter
const theme = {
  ...MD3LightTheme,
  fonts: {
    ...MD3LightTheme.fonts,
    default: {
      fontFamily: 'Inter_400Regular',
    },
    displayLarge: {
      ...MD3LightTheme.fonts.displayLarge,
      fontFamily: 'Inter_700Bold',
    },
    displayMedium: {
      ...MD3LightTheme.fonts.displayMedium,
      fontFamily: 'Inter_700Bold',
    },
    displaySmall: {
      ...MD3LightTheme.fonts.displaySmall,
      fontFamily: 'Inter_600SemiBold',
    },
    headlineLarge: {
      ...MD3LightTheme.fonts.headlineLarge,
      fontFamily: 'Inter_700Bold',
    },
    headlineMedium: {
      ...MD3LightTheme.fonts.headlineMedium,
      fontFamily: 'Inter_600SemiBold',
    },
    headlineSmall: {
      ...MD3LightTheme.fonts.headlineSmall,
      fontFamily: 'Inter_600SemiBold',
    },
    titleLarge: {
      ...MD3LightTheme.fonts.titleLarge,
      fontFamily: 'Inter_600SemiBold',
    },
    titleMedium: {
      ...MD3LightTheme.fonts.titleMedium,
      fontFamily: 'Inter_600SemiBold',
    },
    titleSmall: {
      ...MD3LightTheme.fonts.titleSmall,
      fontFamily: 'Inter_500Medium',
    },
    bodyLarge: {
      ...MD3LightTheme.fonts.bodyLarge,
      fontFamily: 'Inter_400Regular',
    },
    bodyMedium: {
      ...MD3LightTheme.fonts.bodyMedium,
      fontFamily: 'Inter_400Regular',
    },
    bodySmall: {
      ...MD3LightTheme.fonts.bodySmall,
      fontFamily: 'Inter_400Regular',
    },
    labelLarge: {
      ...MD3LightTheme.fonts.labelLarge,
      fontFamily: 'Inter_600SemiBold',
    },
    labelMedium: {
      ...MD3LightTheme.fonts.labelMedium,
      fontFamily: 'Inter_500Medium',
    },
    labelSmall: {
      ...MD3LightTheme.fonts.labelSmall,
      fontFamily: 'Inter_500Medium',
    },
  },
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
        await clearSession();
        
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
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Welcome" 
              component={HomeScreen}
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
    </View>
  );
}
