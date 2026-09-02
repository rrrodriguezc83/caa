import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import { Text, ActivityIndicator, FAB } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenHeader from '../../components/common/ScreenHeader';
import { apiClient } from '../../../data/datasources/remote/ApiClient';
import { toCapitalCase } from '../../../shared/utils/textHelpers';

const API_URL = 'https://www.comunidadvirtualcaa.co/Information/controller/cont.php';

const formatDateShort = (dateString) => {
  if (!dateString) return '—';
  const [year, month, day] = dateString.split('-');
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}`;
};

const AttentionCard = ({ item, index }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.iconCircle}>
        <Icon name="head-heart-outline" size={22} color="#002c5d" />
      </View>
      <View style={styles.cardHeaderInfo}>
        <Text style={styles.studentName}>{toCapitalCase(item.student)}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Icon name="calendar-check" size={12} color="#002c5d" />
            <Text style={styles.badgeText}>Atención: {formatDateShort(item.dateate)}</Text>
          </View>
        </View>
      </View>
      <View style={styles.indexBadge}>
        <Text style={styles.indexBadgeText}>#{index + 1}</Text>
      </View>
    </View>

    <View style={styles.divider} />

    <View style={styles.cardBody}>
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>FECHA REGISTRO</Text>
          <Text style={styles.infoValue}>{formatDateShort(item.datein)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>FECHA ATENCIÓN</Text>
          <Text style={styles.infoValue}>{formatDateShort(item.dateate)}</Text>
        </View>
      </View>
      <View style={styles.teacherRow}>
        <View style={styles.teacherAvatar}>
          <Icon name="account" size={14} color="#002c5d" />
        </View>
        <Text style={styles.teacherName}>{toCapitalCase(item.teacher)}</Text>
      </View>
    </View>
  </View>
);

const AtencionPsicologicaScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiClient.post(API_URL, {
          param: 'getattentionpsychology',
          base: 'comunidad',
        });
        if (data.code === 200 && Array.isArray(data.response)) {
          setRecords(data.response);
        } else {
          setRecords([]);
        }
      } catch (e) {
        setError('No se pudo cargar la información.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <AppScreenLayout>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Atención Psicológica" onBack={() => navigation.goBack()} />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#002c5d" />
          <Text style={styles.loadingText}>Cargando atenciones...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Icon name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>TOTAL ATENCIONES</Text>
              <Text style={styles.statValue}>{records.length}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>ÚLTIMA ATENCIÓN</Text>
              <Text style={styles.statValueSmall}>
                {records.length > 0 ? formatDateShort(records[records.length - 1].dateate) : '—'}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Historial de Atenciones</Text>

          {records.length === 0 ? (
            <View style={styles.emptyCard}>
              <Icon name="head-heart-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyTitle}>Sin registros</Text>
              <Text style={styles.emptyText}>No hay atenciones psicológicas registradas.</Text>
            </View>
          ) : (
            <View style={styles.cardsList}>
              {records.map((item, index) => (
                <AttentionCard key={index} item={item} index={index} />
              ))}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}

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
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#64748b' },
  errorText: { fontSize: 14, color: '#ef4444', textAlign: 'center', paddingHorizontal: 32 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 4,
  },
  statLabel: { fontSize: 10, fontWeight: '700', color: '#64748b', letterSpacing: 1 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  statValueSmall: { fontSize: 15, fontWeight: 'bold', color: '#0f172a' },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 12 },

  cardsList: { gap: 12 },
  card: {
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
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 44, 93, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderInfo: { flex: 1 },
  studentName: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  badgeRow: { flexDirection: 'row', marginTop: 4 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 44, 93, 0.08)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#002c5d' },
  indexBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  indexBadgeText: { fontSize: 11, fontWeight: '700', color: '#94a3b8' },

  divider: { height: 1, backgroundColor: '#f1f5f9' },

  cardBody: { padding: 14, gap: 12 },
  infoRow: { flexDirection: 'row', gap: 12 },
  infoItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 2,
  },
  infoLabel: { fontSize: 10, fontWeight: '700', color: '#64748b', letterSpacing: 0.5 },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#0f172a' },

  teacherRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  teacherAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 44, 93, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  teacherName: { fontSize: 13, fontWeight: '500', color: '#334155' },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 48,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginTop: 4 },
  emptyText: { fontSize: 14, color: '#64748b', textAlign: 'center' },

  bottomSpacer: { height: 24 },
  fab: { position: 'absolute', left: 16, bottom: 16, backgroundColor: '#002c5d' },
});

export default AtencionPsicologicaScreen;
