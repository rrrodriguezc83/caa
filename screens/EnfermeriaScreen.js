import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  List,
} from 'react-native-paper';

const EnfermeriaScreen = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [reportes, setReportes] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});

  // Función para consumir el servicio de reportes
  const fetchReportes = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('base', 'caa');
      formData.append('param', 'getReportAtt');

      const response = await fetch(
        'https://www.comunidadvirtualcaa.co/enfermeriaNewStudentV2/controller/cont.php',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      
      if (data.code === 200 && data.response) {
        console.log('Reportes de enfermería cargados:', data.response.length);
        setReportes(data.response);
      } else {
        console.log('No se recibieron reportes');
        setReportes([]);
      }
    } catch (error) {
      console.error('Error al cargar reportes de enfermería:', error);
      setReportes([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar reportes al montar el componente
  useEffect(() => {
    fetchReportes();
  }, []);

  // Función para alternar el estado expandido de un item
  const toggleItem = (index) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.mainContainer} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
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
          <Appbar.Content title="Enfermería" titleStyle={styles.appBarTitle} />
        </Appbar.Header>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Cargando reportes...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Appbar.Content title="Enfermería" titleStyle={styles.appBarTitle} />
      </Appbar.Header>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {reportes.length === 0 ? (
          <Card style={styles.card} elevation={3}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.noDataText}>
                No hay reportes de enfermería disponibles.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card} elevation={3}>
            <Card.Title 
              title="Historial de Asistencias" 
              titleStyle={styles.cardTitle}
            />
            <Card.Content>
              <List.Section>
                {reportes.map((reporte, index) => {
                  const isExpanded = expandedItems[index] || false;
                  
                  return (
                    <List.Accordion
                      key={index}
                      title={`Motivo: ${reporte.reason}`}
                      titleStyle={styles.accordionTitle}
                      titleNumberOfLines={2}
                      description={`Fecha: ${formatDate(reporte.date)}`}
                      descriptionStyle={styles.accordionDescription}
                      expanded={isExpanded}
                      onPress={() => toggleItem(index)}
                      style={styles.accordion}
                      left={props => <List.Icon {...props} icon="medical-bag" color="#1976D2" />}
                    >
                      <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                          <Text variant="labelLarge" style={styles.detailLabel}>
                            Hora de entrada:
                          </Text>
                          <Text variant="bodyMedium" style={styles.detailValue}>
                            {reporte.hour_entry}
                          </Text>
                        </View>

                        <View style={styles.detailRow}>
                          <Text variant="labelLarge" style={styles.detailLabel}>
                            Hora de salida:
                          </Text>
                          <Text variant="bodyMedium" style={styles.detailValue}>
                            {reporte.hour_out}
                          </Text>
                        </View>

                        <View style={styles.detailRow}>
                          <Text variant="labelLarge" style={styles.detailLabel}>
                            Procedimiento:
                          </Text>
                          <Text variant="bodyMedium" style={styles.detailValue}>
                            {reporte.procedure}
                          </Text>
                        </View>

                        <View style={styles.detailRow}>
                          <Text variant="labelLarge" style={styles.detailLabel}>
                            Observación:
                          </Text>
                          <Text variant="bodyMedium" style={styles.detailValue}>
                            {reporte.observation}
                          </Text>
                        </View>

                        <View style={styles.detailRow}>
                          <Text variant="labelLarge" style={styles.detailLabel}>
                            Enfermera:
                          </Text>
                          <Text variant="bodyMedium" style={styles.detailValue}>
                            {reporte.enfermera}
                          </Text>
                        </View>
                      </View>
                    </List.Accordion>
                  );
                })}
              </List.Section>
            </Card.Content>
          </Card>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#01579B',
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  cardTitle: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  noDataText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  accordion: {
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
    borderRadius: 8,
  },
  accordionTitle: {
    fontWeight: 'bold',
    color: '#01579B',
    fontSize: 14,
  },
  accordionDescription: {
    color: '#666',
    fontSize: 12,
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1976D2',
  },
  detailRow: {
    marginBottom: 12,
  },
  detailLabel: {
    color: '#1976D2',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detailValue: {
    color: '#01579B',
    lineHeight: 20,
  },
});

export default EnfermeriaScreen;
