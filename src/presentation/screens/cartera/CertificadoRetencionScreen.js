import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import { Text } from 'react-native-paper';
import ScreenHeader from '../../components/common/ScreenHeader';
import PdfViewer from '../../components/common/PdfViewer';
import { apiClient } from '../../../data/datasources/remote/ApiClient';
import { getSession } from '../../../shared/session';

const DOC_BASE_URL = 'https://www.comunidadvirtualcaa.co/documentos/PDF/generator/documento.php';

const CertificadoRetencionScreen = ({ navigation }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const sessionId = String(getSession()?.ID ?? '');
      const url = `${DOC_BASE_URL}?pag=Y3J0cGFnLnBocA==&id=${btoa(sessionId)}`;
      setPdfUrl(url);
    } catch (e) {
      setError(e?.message || 'Error al construir la URL del certificado');
    }
  }, []);

  return (
    <AppScreenLayout>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Certificado de Retención" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        {error ? (
          <View style={styles.card}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : pdfUrl ? (
          <PdfViewer uri={pdfUrl} cookie={apiClient.sessionCookie} />
        ) : (
          <View style={styles.card}>
            <ActivityIndicator size="large" color="#002c5d" />
            <Text style={styles.loadingText}>Preparando certificado...</Text>
          </View>
        )}
      </View>
    </AppScreenLayout>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8f6f6' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 14, color: '#71717a', textAlign: 'center' },
  errorText: { fontSize: 14, color: '#64748b', textAlign: 'center' },
});

export default CertificadoRetencionScreen;
