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
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { container } from '../../../di/container';
import ScreenHeader from '../../components/common/ScreenHeader';

const { circularRepository } = container;

const CircularesScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { notification } = route.params || {};
  const [circulares, setCirculares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('Todas');

  useFocusEffect(
    useCallback(() => {
      fetchCirculares();
    }, [])
  );

  const fetchCirculares = async () => {
    try {
      setLoading(true);
      const data = await circularRepository.getNotices();

      if (data.code === 200 && data.response) {
        const circularesArray = Object.keys(data.response)
          .filter(key => key !== 'keys')
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
        <ScreenHeader title="Circulares" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#002c5d" />
          <Text style={styles.loadingText}>Cargando circulares...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getFilteredCirculares = () => {
    switch (filterTab) {
      case 'Vista': return circulares.filter(c => c.state === '1');
      case 'Pendiente': return circulares.filter(c => c.state !== '1');
      case 'Autorizado': return circulares.filter(c => c.type === '1' && (c.auth || '').toLowerCase().trim() === 'si');
      case 'No autorizado': return circulares.filter(c => c.type === '1' && (c.auth || '').toLowerCase().trim() === 'no');
      default: return circulares;
    }
  };

  const filteredCirculares = getFilteredCirculares();

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Circulares" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.filterTabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterTabs}>
              {['Todas', 'Vista', 'Pendiente', 'Autorizado', 'No autorizado'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterTab, filterTab === tab && styles.filterTabActive]}
                  onPress={() => setFilterTab(tab)}
                >
                  <Text style={[styles.filterTabText, filterTab === tab && styles.filterTabTextActive]}>{tab}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.cardsContainer}>
          {filteredCirculares.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="file-document-outline" size={64} color="#cbd5e1" />
              <Text style={styles.noCircularesText}>No hay circulares disponibles en este momento.</Text>
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
                  onPress={() => navigation.navigate('DetalleCircular', { circular, auth: circular.auth || '' })}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <Icon name="file-document" size={28} color="#002c5d" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.circularNumber}>Circular {circular.circular}</Text>
                    <Text style={styles.circularTitle} numberOfLines={1}>{circular.subject}</Text>
                    <Text style={styles.circularDescription} numberOfLines={1}>{circular.description || 'Sin descripción'}</Text>
                  </View>
                  <View style={styles.badgesContainer}>
                    <View style={[styles.badge, isVista ? styles.badgeConsultationDone : styles.badgeConsultationPending]}>
                      <Text style={[styles.badgeText, isVista ? styles.badgeTextConsultationDone : styles.badgeTextConsultationPending]}>
                        {isVista ? 'CONSULTADA' : 'PENDIENTE'}
                      </Text>
                    </View>
                    {showAuthChip && (
                      <View style={[styles.badge, authValue === 'si' ? styles.badgeAuthYes : authValue === 'no' ? styles.badgeAuthNo : styles.badgeAuthNone]}>
                        <Text style={[styles.badgeText, authValue === 'si' ? styles.badgeTextAuthYes : authValue === 'no' ? styles.badgeTextAuthNo : styles.badgeTextAuthNone]}>
                          {authValue === 'si' ? 'AUTORIZADO' : authValue === 'no' ? 'NO AUTORIZADO' : 'NO REQUIERE'}
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
  mainContainer: { flex: 1, backgroundColor: '#f8f6f6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f6f6' },
  loadingText: { marginTop: 16, color: '#64748b', fontSize: 14 },
  content: { flex: 1, backgroundColor: '#f8f6f6' },
  filterTabsContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  filterTabs: { flexDirection: 'row', gap: 8 },
  filterTab: { backgroundColor: '#e2e8f0', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, marginRight: 8 },
  filterTabActive: { backgroundColor: '#002c5d' },
  filterTabText: { color: '#64748b', fontSize: 14, fontWeight: '500' },
  filterTabTextActive: { color: '#FFFFFF' },
  cardsContainer: { padding: 16, gap: 12 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  noCircularesText: { color: '#64748b', textAlign: 'center', fontSize: 16, marginTop: 16 },
  circularCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2, borderWidth: 1, borderColor: '#e2e8f0' },
  iconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: 'rgba(0, 44, 93, 0.1)', justifyContent: 'center', alignItems: 'center' },
  cardContent: { flex: 1, gap: 4 },
  circularNumber: { fontSize: 11, fontWeight: '600', color: '#002c5d', textTransform: 'uppercase', letterSpacing: 0.5 },
  circularTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  circularDescription: { fontSize: 14, color: '#64748b' },
  badgesContainer: { gap: 4, alignItems: 'flex-end' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: -0.3 },
  badgeConsultationDone: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  badgeTextConsultationDone: { color: '#10b981' },
  badgeConsultationPending: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  badgeTextConsultationPending: { color: '#f59e0b' },
  badgeAuthYes: { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  badgeTextAuthYes: { color: '#3b82f6' },
  badgeAuthNo: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  badgeTextAuthNo: { color: '#ef4444' },
  badgeAuthNone: { backgroundColor: 'rgba(100, 116, 139, 0.1)' },
  badgeTextAuthNone: { color: '#64748b' },
});

export default CircularesScreen;
