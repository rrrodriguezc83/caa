import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/home/HomeScreen';
import ModuleScreen from '../screens/module/ModuleScreen';
import AgendaVirtualScreen from '../screens/agenda/AgendaVirtualScreen';
import EnfermeriaScreen from '../screens/enfermeria/EnfermeriaScreen';
import CircularesScreen from '../screens/circular/CircularesScreen';
import DetalleCircularScreen from '../screens/circular/DetalleCircularScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
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
  );
};

export default AppNavigator;
