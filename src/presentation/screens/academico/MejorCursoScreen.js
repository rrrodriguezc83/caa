import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenHeader from '../../components/common/ScreenHeader';
import { container } from '../../../di/container';

const { fechasDiagnosticasRepository } = container;

const YEAR = '2026';
const PERIODS = [
  { label: `${YEAR}-1`, value: '1', key: 'Primer' },
  { label: `${YEAR}-2`, value: '2', key: 'Segundo' },
  { label: `${YEAR}-3`, value: '3', key: 'Tercer' },
];

const getAlphabetLetter = (num) => {
  const n = parseInt(num, 10);
  if (isNaN(n) || n < 1) return '?';
  return String.fromCharCode(64 + n);
};

const CourseAvatar = ({ label, color, caption }) => (
  <View style={styles.avatarWrapper}>
    <View style={[styles.avatarCircle, { backgroundColor: color }]}>
      <Text style={styles.avatarText}>{label}</Text>
    </View>
    <Text style={styles.avatarCaption}>{caption}</Text>
  </View>
);

const GradeCard = ({ item }) => {
  const valoresLabel = `${item.abrevGrad}${getAlphabetLetter(item.cursvalores)}`;
  const academicoLabel = `${item.abrevGrad}${getAlphabetLetter(item.cursacademico)}`;

  return (
    <View style={styles.gradeCard}>
      <View style={styles.gradeCardLeft}>
        <View style={styles.gradeBadge}>
          <Text style={styles.gradeBadgeText}>{item.abrevGrad}</Text>
        </View>
        <Text style={styles.gradeLabel}>Grado {item.abrevGrad}</Text>
      </View>
      <View style={styles.gradeCardRight}>
        <CourseAvatar label={valoresLabel} color="#002c5d" caption="Valores" />
        <View style={styles.avatarDivider} />
        <CourseAvatar label={academicoLabel} color="#b22335" caption="Académico" />
      </View>
    </View>
  );
};

const MejorCursoScreen = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fechasDiagnosticasRepository.getBestCourse();
        if (result?.code === 200 && result?.response) {
          setData(result.response);
        } else {
          setData(null);
        }
      } catch (err) {
        setError(err.message || 'Error al cargar datos');
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentList = data?.[selectedPeriod.key] ?? [];

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Mejor Curso Valores y Acad." onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Filter Tabs */}
        <View style={styles.tabsRow}>
          {PERIODS.map((period) => (
            <TouchableOpacity
              key={period.value}
              style={[styles.tab, selectedPeriod.value === period.value && styles.tabActive]}
              onPress={() => setSelectedPeriod(period)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, selectedPeriod.value === period.value && styles.tabTextActive]}>
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#002c5d" />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.centerContainer}>
            <Icon name="alert-circle-outline" size={48} color="#94a3b8" />
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && currentList.length === 0 && (
          <View style={styles.centerContainer}>
            <Icon name="account-group-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>Sin datos para este periodo.</Text>
          </View>
        )}

        {!loading && !error && currentList.length > 0 && (
          <View style={styles.cardList}>
            {currentList.map((item) => (
              <GradeCard key={item.id_grado} item={item} />
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8f6f6' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  tabsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: '#e4e4e7',
    alignItems: 'center',
  },
  tabActive: { backgroundColor: '#002c5d' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#52525b' },
  tabTextActive: { color: '#ffffff' },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    gap: 10,
  },
  loadingText: { color: '#64748b', fontSize: 14 },
  errorTitle: { fontSize: 17, fontWeight: 'bold', color: '#0f172a' },
  errorText: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  emptyText: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  cardList: { gap: 12 },
  gradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#002c5d',
  },
  gradeCardLeft: {
    alignItems: 'center',
    gap: 4,
    minWidth: 64,
  },
  gradeBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e6eaf0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002c5d',
  },
  gradeLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  gradeCardRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#f1f5f9',
    marginLeft: 12,
  },
  avatarDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#f1f5f9',
  },
  avatarWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  avatarCaption: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  bottomSpacer: { height: 24 },
});

export default MejorCursoScreen;
