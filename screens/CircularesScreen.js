import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Appbar, 
  Text, 
  Card,
  useTheme,
  ActivityIndicator,
  List,
  Chip,
} from 'react-native-paper';

const CircularesScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { notification } = route.params || {};
  const [circulares, setCirculares] = useState([]);
  const [loading, setLoading] = useState(true);

  // Recargar circulares cada vez que la pantalla reciba el foco
  useFocusEffect(
    useCallback(() => {
      fetchCirculares();
    }, [])
  );

  const fetchCirculares = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('base', 'comunidad');
      formData.append('param', 'getNotices');
      formData.append('surveys', 'false');

      const response = await fetch(
        'https://www.comunidadvirtualcaa.co/Notices/controller/cont.php',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      console.log('Circulares recibidas:', data);

      if (data.code === 200 && data.response) {
        // Convertir el objeto de respuesta en un array
        const circularesArray = Object.keys(data.response)
          .filter(key => key !== 'keys') // Excluir el campo 'keys'
          .map(key => data.response[key]);
        
        setCirculares(circularesArray);
        console.log('Circulares procesadas:', circularesArray.length);
      } else {
        setCirculares([]);
      }
    } catch (error) {
      console.error('Error al cargar circulares:', error);
      setCirculares([]);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.mainContainer} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
        <Appbar.Header elevated style={styles.appBar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
          <Appbar.Content title="Circulares" titleStyle={styles.appBarTitle} />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando circulares...</Text>
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
        <Appbar.Content title="Circulares" titleStyle={styles.appBarTitle} />
      </Appbar.Header>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {circulares.length === 0 ? (
          <Card style={styles.card} elevation={3}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.noCircularesText}>
                No hay circulares disponibles en este momento.
              </Text>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card} elevation={3}>
            <Card.Content style={styles.cardContent}>
              {circulares.map((circular, index) => (
                <List.Item
                  key={`circular-${index}-${circular.circular}`}
                  title={`Circular ${circular.circular}`}
                  description={circular.subject}
                  style={styles.listItem}
                  titleStyle={styles.listItemTitle}
                  descriptionStyle={styles.listItemDescription}
                  descriptionNumberOfLines={2}
                  onPress={() => navigation.navigate('DetalleCircular', { 
                    circular,
                    auth: circular.auth || ''
                  })}
                  left={props => <List.Icon {...props} icon="file-document" color="#1976D2" />}
                  right={props => {
                    const isVista = circular.state === '1';
                    const iconColor = isVista ? '#2E7D32' : '#F57F17';
                    
                    // Determinar el estado de autorización
                    const showAuthChip = circular.type === '1';
                    let authChipStyle, authChipText, authChipTextStyle, authIconColor;
                    
                    if (showAuthChip) {
                      const authValue = (circular.auth || '').toLowerCase().trim();
                      
                      if (authValue === 'si') {
                        authChipStyle = styles.chipAutorizado;
                        authChipText = 'Autorizado';
                        authChipTextStyle = styles.chipTextAutorizado;
                        authIconColor = '#1B5E20';
                      } else if (authValue === 'no') {
                        authChipStyle = styles.chipNoAutorizado;
                        authChipText = 'No autorizado';
                        authChipTextStyle = styles.chipTextNoAutorizado;
                        authIconColor = '#B71C1C';
                      } else {
                        authChipStyle = styles.chipPendiente;
                        authChipText = 'Pendiente por autorizar';
                        authChipTextStyle = styles.chipTextPendiente;
                        authIconColor = '#E65100';
                      }
                    }
                    
                    return (
                      <View style={styles.chipContainer}>
                        <Chip 
                          icon={() => <List.Icon icon="check" color={iconColor} size={16} />}
                          style={[isVista ? styles.chipVista : styles.chipNueva, styles.chipMargin]}
                          textStyle={isVista ? styles.chipTextVista : styles.chipTextNueva}
                        >
                          {isVista ? 'Vista' : 'Nueva'}
                        </Chip>
                        {showAuthChip && (
                          <Chip 
                            icon={() => <List.Icon icon="shield-check" color={authIconColor} size={16} />}
                            style={authChipStyle}
                            textStyle={authChipTextStyle}
                          >
                            {authChipText}
                          </Chip>
                        )}
                      </View>
                    );
                  }}
                />
              ))}
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
    backgroundColor: '#FFFFFF',
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
  cardContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  noCircularesText: {
    color: '#01579B',
    textAlign: 'center',
    lineHeight: 24,
  },
  listItem: {
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
    borderRadius: 8,
    paddingVertical: 8,
  },
  listItemTitle: {
    fontWeight: 'bold',
    color: '#1976D2',
    fontSize: 16,
  },
  listItemDescription: {
    color: '#666',
    fontSize: 14,
  },
  chipContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 2,
    gap: 4,
  },
  chipMargin: {
    marginBottom: 4,
  },
  chipNueva: {
    backgroundColor: '#FFF9C4',
    height: 28,
    borderRadius: 20,
  },
  chipTextNueva: {
    color: '#F57F17',
    fontSize: 12,
  },
  chipVista: {
    backgroundColor: '#E8F5E9',
    height: 28,
    borderRadius: 20,
  },
  chipTextVista: {
    color: '#2E7D32',
    fontSize: 12,
  },
  chipAutorizado: {
    backgroundColor: '#C8E6C9',
    height: 28,
    borderRadius: 20,
  },
  chipTextAutorizado: {
    color: '#1B5E20',
    fontSize: 12,
  },
  chipNoAutorizado: {
    backgroundColor: '#FFCDD2',
    height: 28,
    borderRadius: 20,
  },
  chipTextNoAutorizado: {
    color: '#B71C1C',
    fontSize: 12,
  },
  chipPendiente: {
    backgroundColor: '#FFE0B2',
    height: 28,
    borderRadius: 20,
  },
  chipTextPendiente: {
    color: '#E65100',
    fontSize: 12,
  },
});

export default CircularesScreen;
