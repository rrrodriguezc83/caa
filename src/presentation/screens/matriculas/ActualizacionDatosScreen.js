import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenHeader from '../../components/common/ScreenHeader';
import { apiClient } from '../../../data/datasources/remote/ApiClient';
import { API_URLS } from '../../../shared/constants/apiRoutes';

const ActualizacionDatosScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiClient.post(API_URLS.ADMISSIONS, {
          param: 'getSummaryData',
          base: 'caa',
        });
        if (result?.code === 200 && Array.isArray(result.response) && result.response[0]) {
          const parsed = Object.entries(result.response[0]).map(([key, value]) => ({ key, value }));
          setRows(parsed);
        } else {
          setError('No se pudieron cargar los datos.');
        }
      } catch (err) {
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <AppScreenLayout>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Actualización de Datos" onBack={() => navigation.goBack()} />

      {loading && (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#002c5d" />
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.centerContainer}>
          <Icon name="alert-circle-outline" size={48} color="#94a3b8" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && rows.length === 0 && (
        <View style={styles.centerContainer}>
          <Icon name="table-off" size={48} color="#94a3b8" />
          <Text style={styles.errorText}>Sin datos disponibles.</Text>
        </View>
      )}

      {!loading && !error && rows.length > 0 && (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tableCard}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.headerCell}>Resumen</Text>
            </View>

            {/* Rows */}
            {rows.map((row, index) => (
              <View
                key={index}
                style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}
              >
                <Text style={[styles.keyCell, styles.keyColumn]} numberOfLines={2}>
                  {row.key}
                </Text>
                <View style={styles.columnDivider} />
                <Text style={[styles.valueCell, styles.valueColumn]} numberOfLines={3}>
                  {row.value ?? '—'}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}
    </AppScreenLayout>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8f6f6' },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  loadingText: { fontSize: 14, color: '#64748b' },
  errorText: { fontSize: 14, color: '#64748b', textAlign: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 24 },

  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },

  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002c5d',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerCell: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    flex: 1,
  },

  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  rowEven: { backgroundColor: '#ffffff' },
  rowOdd: { backgroundColor: '#f8fafc' },

  keyColumn: { flex: 2 },
  valueColumn: { flex: 3 },

  columnDivider: { width: 1, alignSelf: 'stretch', backgroundColor: '#e4e4e7', marginHorizontal: 12 },

  keyCell: { fontSize: 13, fontWeight: '600', color: '#374151' },
  valueCell: { fontSize: 13, color: '#64748b' },

  bottomSpacer: { height: 24 },
});

export default ActualizacionDatosScreen;
