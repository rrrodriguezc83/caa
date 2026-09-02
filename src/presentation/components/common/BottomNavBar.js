import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { container } from '../../../di/container';
import { clearSession } from '../../../shared/session';

const { authRepository } = container;

const NAV_ITEMS = [
  { route: 'Welcome', label: 'Inicio', icon: 'home' },
  { route: 'AgendaVirtual', label: 'Agenda Virtual', icon: 'laptop' },
  { route: 'Circulares', label: 'Circulares', icon: 'email-newsletter' },
];

const ACTIVE_COLOR = '#002c5d';
const INACTIVE_COLOR = '#94a3b8';
const LOGOUT_COLOR = '#dc2626';

const BottomNavBar = ({ navigation, activeRoute }) => {
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    try {
      await authRepository.logout();
      clearSession();
      navigation.resetRoot({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

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
      <TouchableOpacity
        style={styles.item}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Icon name="logout" size={24} color={LOGOUT_COLOR} />
        <Text style={[styles.label, { color: LOGOUT_COLOR }]} numberOfLines={1}>Cerrar sesión</Text>
      </TouchableOpacity>
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
