import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import { Text, FAB } from 'react-native-paper';
import { apiClient } from '../../../data/datasources/remote/ApiClient';
import { API_URLS } from '../../../shared/constants/apiRoutes';
import ScreenHeader from '../../components/common/ScreenHeader';
import PdfViewer from '../../components/common/PdfViewer';

const PORTFOLIO_CONTROLLER_BASE_URL = 'https://www.comunidadvirtualcaa.co/Portfolio/controller/';

const ReciboPagoScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        const data = await apiClient.post(API_URLS.PORTFOLIO, {
          base: 'comunidad',
          param: 'getBill',
        });

        if (!isMounted) return;

        if (data?.code === 200 && Array.isArray(data?.response) && data.response.length > 0) {
          const relativePdfPath = data.response[0];
          const normalizedRelativePath = String(relativePdfPath).replace(/^\/+/, '');
          const absolutePdfUrl = `${PORTFOLIO_CONTROLLER_BASE_URL}${normalizedRelativePath}`;
          setPdfUrl(absolutePdfUrl);
          setError(null);
        } else {
          const msg = data?.error || 'Respuesta inválida del servicio (getBill)';
          setError(msg);
          setPdfUrl(null);
        }
      } catch (e) {
        console.error('Error consumiendo getBill:', e);
        if (isMounted) setError(e?.message || String(e));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppScreenLayout>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Recibo de pago - Pensión" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        {loading ? (
          <View style={styles.card}>
            <ActivityIndicator size="large" color="#002c5d" />
            <Text style={styles.loadingText}>Consultando recibo...</Text>
          </View>
        ) : error ? (
          <View style={styles.card}>
            <Text style={styles.errorText}>Ocurrió un error al consultar el recibo.</Text>
            <Text style={styles.errorDetails}>{error}</Text>
          </View>
        ) : pdfUrl ? (
          <PdfViewer uri={pdfUrl} cookie={apiClient.sessionCookie} />
        ) : (
          <View style={styles.card}>
            <Text style={styles.errorText}>No se encontró el recibo.</Text>
          </View>
        )}
      </View>

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
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 12 },

  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  loadingText: { marginTop: 12, fontSize: 14, color: '#71717a', textAlign: 'center' },
  errorText: { fontSize: 16, color: '#ef4444', fontWeight: '600', textAlign: 'center' },
  errorDetails: { marginTop: 8, fontSize: 12, color: '#991b1b' },
  fab: { position: 'absolute', left: 16, bottom: 16, backgroundColor: '#002c5d' },
});

export default ReciboPagoScreen;

