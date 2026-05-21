import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenHeader from '../../components/common/ScreenHeader';
import PdfViewer from '../../components/common/PdfViewer';
import { Buffer } from 'buffer';
import { getSession } from '../../../shared/session';

const BOLETIN_URL = 'https://www.comunidadvirtualcaa.co/documentos/PDF/generator/documento.php';
const PAG_PARAM = 'c2hvd0JvbGV0aW5Fc3QyNS5waHA=';
const YEAR = '2026';

const PERIODS = [
  { label: `${YEAR}-1`, value: `${YEAR}-1` },
  { label: `${YEAR}-2`, value: `${YEAR}-2` },
  { label: `${YEAR}-3`, value: `${YEAR}-3` },
];

const BoletinAcademicoScreen = ({ navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfBase64, setPdfBase64] = useState(null);

  const fetchBoletin = async (period) => {
    try {
      setLoading(true);
      setError(null);
      setPdfBase64(null);

      const sessionId = String(getSession()?.ID ?? '');
      const body = new URLSearchParams({
        per: btoa(period),
        pag: PAG_PARAM,
        id: btoa(sessionId),
        anio: btoa(YEAR),
        db: btoa(`caa${YEAR}`),
      }).toString();

      const response = await fetch(BOLETIN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const arrayBuffer = await response.arrayBuffer();
      if (!arrayBuffer || arrayBuffer.byteLength === 0) throw new Error('El servidor no devolvió contenido');

      const firstBytes = String.fromCharCode(...new Uint8Array(arrayBuffer.slice(0, 5)));
      if (firstBytes !== '%PDF-') {
        const text = new TextDecoder().decode(arrayBuffer);
        const message = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        throw new Error(message || 'Boletín no disponible');
      }

      const base64 = Buffer.from(arrayBuffer).toString('base64');
      setPdfBase64(base64);
    } catch (err) {
      setError(err.message || 'Error al cargar el boletín');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
    fetchBoletin(period.value);
  };

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Boletín Académico" onBack={() => navigation.goBack()} />

      {/* Period Filter Tabs */}
      <View style={styles.tabsRow}>
        {PERIODS.map((period) => (
          <TouchableOpacity
            key={period.value}
            style={[styles.tab, selectedPeriod?.value === period.value && styles.tabActive]}
            onPress={() => handlePeriodSelect(period)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, selectedPeriod?.value === period.value && styles.tabTextActive]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {!selectedPeriod && (
          <View style={styles.centerContainer}>
            <Icon name="chart-box-outline" size={48} color="#94a3b8" />
            <Text style={styles.hintText}>Selecciona un periodo para ver el boletín.</Text>
          </View>
        )}

        {selectedPeriod && loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#002c5d" />
            <Text style={styles.loadingText}>Cargando boletín...</Text>
          </View>
        )}

        {selectedPeriod && !loading && error && (
          <View style={styles.centerContainer}>
            <Icon name="alert-circle-outline" size={48} color="#94a3b8" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {selectedPeriod && !loading && !error && pdfBase64 && (
          <PdfViewer key={selectedPeriod.value} base64={pdfBase64} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8f6f6' },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
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
  content: { flex: 1 },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  hintText: { fontSize: 14, color: '#94a3b8', textAlign: 'center' },
  loadingText: { color: '#64748b', fontSize: 14 },
  errorText: { fontSize: 14, color: '#64748b', textAlign: 'center' },
});

export default BoletinAcademicoScreen;
