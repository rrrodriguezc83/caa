import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import { useFocusEffect } from '@react-navigation/native';
import { Text, ActivityIndicator } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { container } from '../../../di/container';
import ScreenHeader from '../../components/common/ScreenHeader';

const { fechasDiagnosticasRepository } = container;

const FELICITACION_LABELS = {
  '0': 'Diagnóstica',
  '1': 'Felicitación',
  '2': 'Informe inexistente',
  '3': 'Diagnóstica Docente',
  '4': 'Perdió Necesidad',
};

const getFelicitacionLabel = (value) => {
  const key = String(value ?? '');
  return FELICITACION_LABELS[key] ?? 'Desconocido';
};

const EvaluacionesDiagnosticasScreen = ({ navigation }) => {
  const [diagnosticas, setDiagnosticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('Todas');

  useFocusEffect(
    useCallback(() => {
      fetchDiagnosticas();
    }, [])
  );

  const fetchDiagnosticas = async () => {
    try {
      setLoading(true);
      const data = await fechasDiagnosticasRepository.getDiagnosticasEvaluaciones();

      if (data.code === 200 && Array.isArray(data.response)) {
        setDiagnosticas(data.response);
      } else {
        setDiagnosticas([]);
      }
    } catch (error) {
      console.error('Error al cargar evaluaciones diagnósticas:', error);
      setDiagnosticas([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDiagnosticas = () => {
    switch (filterTab) {
      case 'Pendiente':
        return diagnosticas.filter((d) => !d.state || String(d.state).trim() === '');
      case 'Consultado':
        return diagnosticas.filter((d) => d.state && String(d.state).trim() !== '');
      default:
        return diagnosticas;
    }
  };

  const filteredDiagnosticas = getFilteredDiagnosticas();

  if (loading) {
    return (
      <AppScreenLayout>
        <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
        <ScreenHeader title="Evaluaciones Diagnósticas" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#002c5d" />
          <Text style={styles.loadingText}>Cargando evaluaciones diagnósticas...</Text>
        </View>
      </AppScreenLayout>
    );
  }

  return (
    <AppScreenLayout>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Evaluaciones Diagnósticas" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.filterTabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterTabs}>
              {['Todas', 'Pendiente', 'Consultado'].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.filterTab, filterTab === tab && styles.filterTabActive]}
                  onPress={() => setFilterTab(tab)}
                >
                  <Text style={[styles.filterTabText, filterTab === tab && styles.filterTabTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.cardsContainer}>
          {filteredDiagnosticas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="clipboard-check-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyText}>
                No hay evaluaciones diagnósticas disponibles en este momento.
              </Text>
            </View>
          ) : (
            filteredDiagnosticas.map((item, index) => {
              const isConsultado = item.state && String(item.state).trim() !== '';

              return (
                <TouchableOpacity
                  key={`diagnostica-${index}-${item.materia}-${item.fechadiagnostica}`}
                  style={styles.diagnosticaCard}
                  onPress={() => navigation.navigate('ComunicadoDiagnostica', { diagnostica: item })}
                  activeOpacity={0.7}
                >
                  <View style={styles.iconContainer}>
                    <Icon name="clipboard-check" size={28} color="#002c5d" />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.materia || 'Sin materia'}
                    </Text>
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                      {getFelicitacionLabel(item.felicitacion)}
                    </Text>
                    <Text style={styles.cardFooter}>{item.fechadiagnostica || '—'}</Text>
                  </View>
                  <View style={styles.badgesContainer}>
                    <View
                      style={[
                        styles.badge,
                        isConsultado ? styles.badgeConsultationDone : styles.badgeConsultationPending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          isConsultado ? styles.badgeTextConsultationDone : styles.badgeTextConsultationPending,
                        ]}
                      >
                        {isConsultado ? 'CONSULTADO' : 'PENDIENTE'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </AppScreenLayout>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8f6f6' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f6f6',
  },
  loadingText: { marginTop: 16, color: '#64748b', fontSize: 14 },
  content: { flex: 1, backgroundColor: '#f8f6f6' },
  filterTabsContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  filterTabs: { flexDirection: 'row', gap: 8 },
  filterTab: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 8,
  },
  filterTabActive: { backgroundColor: '#002c5d' },
  filterTabText: { color: '#64748b', fontSize: 14, fontWeight: '500' },
  filterTabTextActive: { color: '#FFFFFF' },
  cardsContainer: { padding: 16, gap: 12 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { color: '#64748b', textAlign: 'center', fontSize: 16, marginTop: 16 },
  diagnosticaCard: {
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
  cardContent: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  cardSubtitle: { fontSize: 14, color: '#64748b' },
  cardFooter: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  badgesContainer: { gap: 4, alignItems: 'flex-end' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: -0.3 },
  badgeConsultationDone: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  badgeTextConsultationDone: { color: '#10b981' },
  badgeConsultationPending: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  badgeTextConsultationPending: { color: '#f59e0b' },
});

export default EvaluacionesDiagnosticasScreen;
