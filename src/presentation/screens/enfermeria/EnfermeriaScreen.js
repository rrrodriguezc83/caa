import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  useTheme,
  ActivityIndicator,
  Avatar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { container } from '../../../di/container';
import { formatDate } from '../../../shared/utils/textHelpers';
import ScreenHeader from '../../components/common/ScreenHeader';

const { nursingRepository } = container;

const VisitCard = ({ reporte, isExpanded, onToggle }) => {
  return (
    <View style={styles.visitCard}>
      <TouchableOpacity
        style={styles.visitCardHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.visitCardLeft}>
          <View style={styles.visitIconContainer}>
            <Icon name="medical-bag" size={22} color="#002c5d" />
          </View>
          <View style={styles.visitCardInfo}>
            <Text style={styles.visitReason} numberOfLines={2}>{reporte.reason}</Text>
            <View style={styles.visitMeta}>
              <View style={styles.visitMetaItem}>
                <Icon name="calendar" size={13} color="#64748b" />
                <Text style={styles.visitMetaText}>{formatDate(reporte.date)}</Text>
              </View>
              <View style={styles.visitMetaItem}>
                <Icon name="clock-outline" size={13} color="#64748b" />
                <Text style={styles.visitMetaText}>{reporte.hour_entry}</Text>
              </View>
            </View>
          </View>
        </View>
        <Icon
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#94a3b8"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.visitCardBody}>
          <View style={styles.divider} />

          {/* Times Grid */}
          <View style={styles.timesGrid}>
            <View style={styles.timeCard}>
              <Text style={styles.timeLabel}>ENTRADA</Text>
              <Text style={styles.timeValue}>{reporte.hour_entry}</Text>
            </View>
            <View style={styles.timeCard}>
              <Text style={styles.timeLabel}>SALIDA</Text>
              <Text style={styles.timeValue}>{reporte.hour_out}</Text>
            </View>
          </View>

          {/* Procedure */}
          {reporte.procedure ? (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionLabel}>PROCEDIMIENTO</Text>
              <Text style={styles.observationText}>{reporte.procedure}</Text>
            </View>
          ) : null}

          {/* Observation */}
          {reporte.observation ? (
            <View style={styles.detailSection}>
              <Text style={styles.detailSectionLabel}>OBSERVACIONES</Text>
              <Text style={styles.observationText}>{reporte.observation}</Text>
            </View>
          ) : null}

          {/* Nurse */}
          {reporte.enfermera ? (
            <View style={styles.nurseRow}>
              <View style={styles.nurseAvatar}>
                <Icon name="account" size={14} color="#002c5d" />
              </View>
              <Text style={styles.nurseName}>{reporte.enfermera}</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

const EnfermeriaScreen = ({ navigation }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [reportes, setReportes] = useState([]);
  const [expandedItems, setExpandedItems] = useState({});

  const fetchReportes = async () => {
    try {
      setLoading(true);
      const data = await nursingRepository.getReports();

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

  useEffect(() => {
    fetchReportes();
  }, []);

  const toggleItem = (index) => {
    setExpandedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const getLastVisitDate = () => {
    if (reportes.length === 0) return '—';
    const last = reportes[0];
    return formatDate(last.date);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.mainContainer} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
        <ScreenHeader title="Enfermería" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#002c5d" />
          <Text style={styles.loadingText}>Cargando reportes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Enfermería" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>TOTAL VISITAS</Text>
            <Text style={styles.statValueLarge}>{reportes.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>ÚLTIMA VISITA</Text>
            <Text style={styles.statValueSmall}>{getLastVisitDate()}</Text>
          </View>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Historial Médico</Text>
        </View>

        {/* Visit Cards */}
        {reportes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Icon name="clipboard-text-off-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Sin reportes</Text>
            <Text style={styles.emptyText}>
              No hay reportes de enfermería disponibles.
            </Text>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {reportes.map((reporte, index) => (
              <VisitCard
                key={index}
                reporte={reporte}
                isExpanded={expandedItems[index] || false}
                onToggle={() => toggleItem(index)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f6f6',
  },
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    gap: 4,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1,
  },
  statValueLarge: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  statValueSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: -0.5,
  },

  // Cards
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },

  // Visit Card
  visitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  visitCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  visitCardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  visitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 44, 93, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  visitCardInfo: {
    flex: 1,
  },
  visitReason: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0f172a',
    lineHeight: 20,
  },
  visitMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  visitMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  visitMetaText: {
    fontSize: 12,
    color: '#64748b',
  },

  // Expanded body
  visitCardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },

  // Times grid
  timesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  timeCard: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },

  // Detail sections
  detailSection: {
    gap: 6,
  },
  detailSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },

  // Observation
  observationText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },

  // Nurse
  nurseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  nurseAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 44, 93, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nurseName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#334155',
  },

  // Empty state
  emptyCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

export default EnfermeriaScreen;
