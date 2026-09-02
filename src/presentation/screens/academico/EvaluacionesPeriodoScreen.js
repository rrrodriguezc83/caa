import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import { Text, FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenHeader from '../../components/common/ScreenHeader';
import { container } from '../../../di/container';

const { fechasDiagnosticasRepository } = container;

const MONTHS = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];

const ENGLISH_MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

/**
 * Convierte una fecha en formato texto (ej: " Tuesday 03 February 26") a objeto con day, month, year.
 * Soporta: "Tuesday 03 February 26", "03 February 26", "3 February 2026"
 */
const parseFecha = (fechaStr) => {
  if (!fechaStr || typeof fechaStr !== 'string') return null;

  const match = fechaStr.trim().match(
    /(?:(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+)?(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{2,4})/i
  );
  if (match) {
    const day = parseInt(match[1], 10);
    const monthIdx = ENGLISH_MONTHS.indexOf(match[2].toLowerCase());
    let year = parseInt(match[3], 10);
    if (year < 100) year += year < 50 ? 2000 : 1900;

    if (monthIdx >= 0 && day >= 1 && day <= 31) {
      return { day, month: monthIdx, year };
    }
  }

  const d = new Date(fechaStr);
  if (!isNaN(d.getTime())) {
    return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear() };
  }
  return null;
};

const groupByMonth = (evaluations) => {
  const groups = {};
  (evaluations || []).forEach((item, idx) => {
    const parsed = parseFecha(item.fecha);
    const key = parsed
      ? `${MONTHS[parsed.month]} ${parsed.year}`
      : `Sin fecha ${idx}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push({ ...item, parsed });
  });
  Object.keys(groups).forEach((k) => {
    groups[k].sort((a, b) => {
      if (!a.parsed) return 1;
      if (!b.parsed) return -1;
      const diff = (a.parsed.month * 100 + a.parsed.day) - (b.parsed.month * 100 + b.parsed.day);
      return diff !== 0 ? diff : String(a.descripcion || '').localeCompare(b.descripcion || '');
    });
  });
  return groups;
};

const sortMonthEntries = (entries) => {
  return entries.sort(([keyA], [keyB]) => {
    if (keyA.startsWith('Sin fecha')) return 1;
    if (keyB.startsWith('Sin fecha')) return -1;
    const matchA = keyA.match(/(\w+)\s+(\d+)/);
    const matchB = keyB.match(/(\w+)\s+(\d+)/);
    if (!matchA || !matchB) return String(keyA).localeCompare(keyB);
    const monthIdxA = MONTHS.indexOf(matchA[1]);
    const monthIdxB = MONTHS.indexOf(matchB[1]);
    const yearA = parseInt(matchA[2], 10);
    const yearB = parseInt(matchB[2], 10);
    if (yearA !== yearB) return yearA - yearB;
    return monthIdxA - monthIdxB;
  });
};

const EvaluacionesPeriodoScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fechasDiagnosticasRepository.getEvaluacionesDiagnosticas('1');

        if (result.code === 200 && result.response && typeof result.response === 'object') {
          setData(result.response);
          const periods = Object.keys(result.response).sort();
          setSelectedPeriod(periods.length > 0 ? periods[0] : null);
        } else {
          setData(null);
          setSelectedPeriod(null);
        }
      } catch (err) {
        console.error('Error al cargar evaluaciones de periodo:', err);
        setError(err.message || 'Error al cargar datos');
        setData(null);
        setSelectedPeriod(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const periods = data ? Object.keys(data).sort() : [];
  const evaluations = selectedPeriod && data ? (data[selectedPeriod] || []) : [];
  const groupedByMonth = useMemo(() => groupByMonth(evaluations), [evaluations]);

  if (loading) {
    return (
      <AppScreenLayout>
        <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
        <ScreenHeader title="Evaluaciones Periodo" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#002c5d" />
          <Text style={styles.loadingText}>Cargando evaluaciones de periodo...</Text>
        </View>
      </AppScreenLayout>
    );
  }

  if (error) {
    return (
      <AppScreenLayout>
        <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
        <ScreenHeader title="Evaluaciones Periodo" onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color="#94a3b8" />
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </AppScreenLayout>
    );
  }

  return (
    <AppScreenLayout>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Evaluaciones Periodo" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {periods.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            {periods.map((period) => (
              <TouchableOpacity
                key={period}
                style={[styles.tab, selectedPeriod === period && styles.tabActive]}
                onPress={() => setSelectedPeriod(period)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, selectedPeriod === period && styles.tabTextActive]}>
                  {period}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {evaluations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="calendar-blank-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Sin datos</Text>
            <Text style={styles.emptyText}>
              No hay evaluaciones de periodo para el periodo seleccionado.
            </Text>
          </View>
        ) : (
          sortMonthEntries(Object.entries(groupedByMonth)).map(([monthLabel, items]) => (
            <View key={monthLabel} style={styles.section}>
              <Text style={styles.sectionTitle}>{monthLabel}</Text>
              <View style={styles.timelineContainer}>
                <View style={styles.timelineLine} />
                {items.map((item, index) => (
                  <View key={`${item.descripcion}-${index}`} style={styles.timelineItem}>
                    <View style={styles.dayCircle}>
                      <Text style={styles.dayText}>
                        {item.parsed ? item.parsed.day : '—'}
                      </Text>
                    </View>
                    <View style={styles.card}>
                      <View style={styles.cardIconWrapper}>
                        <Icon name="book-open-variant" size={24} color="#002c5d" />
                      </View>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {(item.descripcion || 'Sin descripción').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <FAB
        icon="arrow-left"
        style={styles.fab}
        color="#FFFFFF"
        onPress={() => navigation.goBack()}
      />
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginTop: 12 },
  errorText: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  tabsContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#e4e4e7',
  },
  tabActive: { backgroundColor: '#002c5d' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#52525b' },
  tabTextActive: { color: '#FFFFFF' },
  section: { marginBottom: 40 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 2,
    color: '#002c5d',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  timelineContainer: { position: 'relative', paddingLeft: 8 },
  timelineLine: {
    position: 'absolute',
    left: 19,
    top: 20,
    bottom: 0,
    width: 2,
    backgroundColor: '#e5e7eb',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    zIndex: 1,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#002c5d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardIconWrapper: {
    backgroundColor: '#e6eaf0',
    padding: 8,
    borderRadius: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginTop: 12 },
  emptyText: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 8 },
  bottomSpacer: { height: 24 },
  fab: { position: 'absolute', left: 16, bottom: 16, backgroundColor: '#002c5d' },
});

export default EvaluacionesPeriodoScreen;
