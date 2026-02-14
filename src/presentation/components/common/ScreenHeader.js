import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';

/**
 * Header reutilizable para pantallas con botón de retroceso.
 * 
 * @param {Object} props
 * @param {string} props.title - Título a mostrar en el header
 * @param {Function} props.onBack - Función al presionar el botón de retroceso
 */
const ScreenHeader = ({ title, onBack }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Avatar.Icon icon="arrow-left" size={40} style={styles.backIcon} color="#FFFFFF" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerPlaceholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002c5d',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#002c5d',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    backgroundColor: 'transparent',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'left',
    letterSpacing: -0.5,
  },
  headerPlaceholder: {
    width: 40,
  },
});

export default ScreenHeader;
