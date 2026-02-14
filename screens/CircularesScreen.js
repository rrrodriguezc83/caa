import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { 
  Text, 
  useTheme,
  ActivityIndicator,
  IconButton,
  Avatar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const CircularesScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { notification } = route.params || {};
  const [circulares, setCirculares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('Todas');

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
      <SafeAreaView style={styles.mainContainer} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Avatar.Icon icon="arrow-left" size={40} style={styles.backIcon} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Circulares</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#002c5d" />
          <Text style={styles.loadingText}>Cargando circulares...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Filtrar circulares según el tab seleccionado
  const getFilteredCirculares = () => {
    switch (filterTab) {
      case 'Vista':
        return circulares.filter(c => c.state === '1');
      case 'Pendiente':
        return circulares.filter(c => c.state !== '1');
      case 'Autorizado':
        return circulares.filter(c => c.type === '1' && (c.auth || '').toLowerCase().trim() === 'si');
      case 'No autorizado':
        return circulares.filter(c => c.type === '1' && (c.auth || '').toLowerCase().trim() === 'no');
      default:
        return circulares;
    }
  };

  const filteredCirculares = getFilteredCirculares();

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Avatar.Icon icon="arrow-left" size={40} style={styles.backIcon} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Circulares</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filter Tabs */}
        <View style={styles.filterTabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterTabs}>
              {['Todas', 'Vista', 'Pendiente', 'Autorizado', 'No autorizado'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.filterTab,
                    filterTab === tab && styles.filterTabActive
                  ]}
                  onPress={() => setFilterTab(tab)}
                >
                  <Text style={[
                    styles.filterTabText,
                    filterTab === tab && styles.filterTabTextActive
                  ]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Circulares Cards */}
        <View style={styles.cardsContainer}>
          {filteredCirculares.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="file-document-outline" size={64} color="#cbd5e1" />
              <Text style={styles.noCircularesText}>
                No hay circulares disponibles en este momento.
              </Text>
            </View>
          ) : (
            filteredCirculares.map((circular, index) => {
              const isVista = circular.state === '1';
              const showAuthChip = circular.type === '1';
              const authValue = (circular.auth || '').toLowerCase().trim();

              return (
                <TouchableOpacity
                  key={`circular-${index}-${circular.circular}`}
                  style={styles.circularCard}
                  onPress={() => navigation.navigate('DetalleCircular', { 
                    circular,
                    auth: circular.auth || ''
                  })}
                  activeOpacity={0.7}
                >
                  {/* Icon Container */}
                  <View style={styles.iconContainer}>
                    <Icon name="file-document" size={28} color="#002c5d" />
                  </View>

                  {/* Content */}
                  <View style={styles.cardContent}>
                    <Text style={styles.circularNumber}>Circular {circular.circular}</Text>
                    <Text style={styles.circularTitle} numberOfLines={1}>
                      {circular.subject}
                    </Text>
                    <Text style={styles.circularDescription} numberOfLines={1}>
                      {circular.description || 'Sin descripción'}
                    </Text>
                  </View>

                  {/* Badges */}
                  <View style={styles.badgesContainer}>
                    {/* Badge de consulta */}
                    <View style={[
                      styles.badge,
                      isVista ? styles.badgeConsultationDone : styles.badgeConsultationPending
                    ]}>
                      <Text style={[
                        styles.badgeText,
                        isVista ? styles.badgeTextConsultationDone : styles.badgeTextConsultationPending
                      ]}>
                        {isVista ? 'CONSULTADA' : 'PENDIENTE'}
                      </Text>
                    </View>

                    {/* Badge de autorización */}
                    {showAuthChip && (
                      <View style={[
                        styles.badge,
                        authValue === 'si' ? styles.badgeAuthYes :
                        authValue === 'no' ? styles.badgeAuthNo :
                        styles.badgeAuthNone
                      ]}>
                        <Text style={[
                          styles.badgeText,
                          authValue === 'si' ? styles.badgeTextAuthYes :
                          authValue === 'no' ? styles.badgeTextAuthNo :
                          styles.badgeTextAuthNone
                        ]}>
                          {authValue === 'si' ? 'AUTORIZADO' :
                           authValue === 'no' ? 'NO AUTORIZADO' :
                           'NO REQUIERE'}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f6f6',
  },
  // Header styles
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
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f6f6',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 14,
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f6f6',
  },
  filterTabsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#002c5d',
  },
  filterTabText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },
  cardsContainer: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noCircularesText: {
    color: '#64748b',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 16,
  },
  circularCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 44, 93, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 4,
  },
  circularNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: '#002c5d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  circularTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  circularDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  badgesContainer: {
    gap: 4,
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: -0.3,
  },
  // Badge Consultation Done
  badgeConsultationDone: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  badgeTextConsultationDone: {
    color: '#10b981',
  },
  // Badge Consultation Pending
  badgeConsultationPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  badgeTextConsultationPending: {
    color: '#f59e0b',
  },
  // Badge Auth Yes
  badgeAuthYes: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  badgeTextAuthYes: {
    color: '#3b82f6',
  },
  // Badge Auth No
  badgeAuthNo: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  badgeTextAuthNo: {
    color: '#ef4444',
  },
  // Badge Auth None
  badgeAuthNone: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  badgeTextAuthNone: {
    color: '#64748b',
  },
});

export default CircularesScreen;
