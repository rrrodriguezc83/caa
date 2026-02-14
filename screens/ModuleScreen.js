import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Appbar, 
  Text, 
  Card,
  useTheme,
} from 'react-native-paper';

const ModuleScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { moduleName, moduleId } = route.params || {};

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      {/* App Bar */}
      <Appbar.Header 
        elevated 
        style={styles.appBar}
        theme={{
          colors: {
            onSurface: '#FFFFFF',
            onSurfaceVariant: '#FFFFFF',
          }
        }}
      >
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Appbar.Content title={moduleName || 'Módulo'} titleStyle={styles.appBarTitle} />
      </Appbar.Header>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.contentCard} elevation={3}>
          <Card.Title 
            title={moduleName || 'Contenido del módulo'} 
            titleStyle={styles.cardTitle}
          />
          <Card.Content>
            <Text variant="bodyLarge" style={styles.cardText}>
              Bienvenido a {moduleName || 'este módulo'}.
            </Text>
            <Text variant="bodyMedium" style={styles.cardSubtext}>
              El contenido específico de este módulo se cargará aquí.
            </Text>
            {moduleId && (
              <Text variant="bodySmall" style={styles.moduleId}>
                ID del módulo: {moduleId}
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Placeholder para contenido adicional */}
        <Card style={styles.contentCard} elevation={3}>
          <Card.Title 
            title="Información adicional" 
            titleStyle={styles.cardTitle}
          />
          <Card.Content>
            <Text variant="bodyMedium" style={styles.cardText}>
              Este espacio puede ser utilizado para mostrar información específica del módulo seleccionado.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  appBar: {
    backgroundColor: '#1976D2',
  },
  appBarTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  contentCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  cardTitle: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  cardText: {
    color: '#01579B',
    lineHeight: 22,
    marginBottom: 12,
  },
  cardSubtext: {
    color: '#666',
    lineHeight: 20,
  },
  moduleId: {
    color: '#999',
    marginTop: 12,
    fontStyle: 'italic',
  },
});

export default ModuleScreen;
