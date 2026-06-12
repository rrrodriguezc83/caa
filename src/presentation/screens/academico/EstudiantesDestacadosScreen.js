import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenHeader from '../../components/common/ScreenHeader';
import { container } from '../../../di/container';

const { fechasDiagnosticasRepository } = container;

const YEAR = '2026';
const PERIODS = [
  { label: `${YEAR}-1`, value: '1' },
  { label: `${YEAR}-2`, value: '2' },
  { label: `${YEAR}-3`, value: '3' },
];

const StudentAvatar = ({ foto, size = 56 }) => {
  if (foto) {
    return (
      <Image
        source={{ uri: `data:image/jpeg;base64,${foto}` }}
        style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
      />
    );
  }
  return (
    <View style={[styles.avatarPlaceholder, { width: size, height: size, borderRadius: size / 2 }]}>
      <Icon name="account" size={size * 0.55} color="#94a3b8" />
    </View>
  );
};

const EstudiantesDestacadosScreen = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fechasDiagnosticasRepository.getHonorRoll(selectedPeriod.value);
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
  }, [selectedPeriod]);

  const bestStudent = data?.bestStudent?.[0] ?? null;
  const honorRoll = data?.honorRoll ?? [];

  const groupedHonorRoll = honorRoll.reduce((acc, item) => {
    const key = item.id_us;
    if (!acc[key]) acc[key] = { ...item, asignaturas: [] };
    if (item.asignatura) acc[key].asignaturas.push(item.asignatura);
    return acc;
  }, {});
  const honorRollList = Object.values(groupedHonorRoll);

  return (
    <AppScreenLayout>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Estudiantes Destacados" onBack={() => navigation.goBack()} />

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
            <Text style={styles.loadingText}>Cargando estudiantes...</Text>
          </View>
        )}

        {!loading && error && (
          <View style={styles.centerContainer}>
            <Icon name="alert-circle-outline" size={48} color="#94a3b8" />
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {!loading && !error && !data && (
          <View style={styles.centerContainer}>
            <Icon name="medal-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>Sin datos para este periodo.</Text>
          </View>
        )}

        {!loading && !error && data && (
          <>
            {/* Mejor Estudiante */}
            {bestStudent && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="trophy" size={18} color="#b45309" />
                  <Text style={styles.sectionTitle}>Mejor Estudiante</Text>
                </View>
                <View style={styles.bestStudentCard}>
                  <View style={styles.bestStudentGlow}>
                    <StudentAvatar foto={bestStudent.foto} size={80} />
                    <View style={styles.trophyBadge}>
                      <Icon name="trophy" size={14} color="#ffffff" />
                    </View>
                  </View>
                  <Text style={styles.bestStudentName}>
                    {bestStudent.nombre} {bestStudent.apellido}
                  </Text>
                  <Text style={styles.bestStudentId}>ID: {bestStudent.id_us}</Text>
                </View>
              </View>
            )}

            {/* Cuadro de Honor */}
            {honorRollList.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="medal" size={18} color="#002c5d" />
                  <Text style={styles.sectionTitle}>Cuadro de Honor</Text>
                </View>
                {honorRollList.map((student) => (
                  <View key={student.id_us} style={styles.honorCard}>
                    <StudentAvatar foto={student.foto} size={48} />
                    <View style={styles.honorCardInfo}>
                      <Text style={styles.honorName}>
                        {student.nombre} {student.apellido}
                      </Text>
                      <View style={styles.subjectTags}>
                        {student.asignaturas.map((asig, i) => (
                          <View key={i} style={styles.subjectTag}>
                            <Text style={styles.subjectTagText}>{asig}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {!bestStudent && honorRollList.length === 0 && (
              <View style={styles.centerContainer}>
                <Icon name="medal-outline" size={48} color="#94a3b8" />
                <Text style={styles.emptyText}>Sin estudiantes destacados para este periodo.</Text>
              </View>
            )}
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </AppScreenLayout>
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
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    color: '#374151',
    textTransform: 'uppercase',
  },
  bestStudentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  bestStudentGlow: {
    position: 'relative',
    padding: 4,
    borderRadius: 44,
    backgroundColor: '#fef3c7',
  },
  trophyBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#d97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bestStudentName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  bestStudentId: { fontSize: 12, color: '#94a3b8' },
  honorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#002c5d',
  },
  avatar: { backgroundColor: '#e2e8f0' },
  avatarPlaceholder: {
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  honorCardInfo: { flex: 1, gap: 6 },
  honorName: { fontSize: 14, fontWeight: 'bold', color: '#1f2937' },
  subjectTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  subjectTag: {
    backgroundColor: '#e6eaf0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  subjectTagText: { fontSize: 11, color: '#002c5d', fontWeight: '600' },
  bottomSpacer: { height: 24 },
});

export default EstudiantesDestacadosScreen;
