import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenHeader from '../../components/common/ScreenHeader';
import PdfViewer from '../../components/common/PdfViewer';
import { apiClient } from '../../../data/datasources/remote/ApiClient';

const MENU_API_URL = 'https://www.comunidadvirtualcaa.co/menuEscolarV3/controller/cont.php';
const MENU_BASE_URL = 'https://www.comunidadvirtualcaa.co/subirMenuC/documentoMenu';

const MenuEscolarScreen = ({ navigation }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.post(MENU_API_URL, { param: 'getMenu', base: 'comunidad' });
        if (data?.code === 200 && data?.response?.length > 0) {
          const { id, nombre_archivo } = data.response[0];
          setPdfUrl(`${MENU_BASE_URL}/${id}/${nombre_archivo}`);
        } else {
          setError('No se encontró el menú escolar.');
        }
      } catch (e) {
        setError(e?.message || 'Error al cargar el menú escolar.');
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  return (
    <AppScreenLayout>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Menú Escolar" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#002c5d" />
            <Text style={styles.loadingText}>Cargando menú escolar...</Text>
          </View>
        )}
        {!loading && error && (
          <View style={styles.centerContainer}>
            <Icon name="alert-circle-outline" size={48} color="#94a3b8" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {!loading && !error && pdfUrl && (
          <PdfViewer uri={pdfUrl} cookie={apiClient.sessionCookie} />
        )}
      </View>
    </AppScreenLayout>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8f6f6' },
  content: { flex: 1 },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  loadingText: { fontSize: 14, color: '#64748b' },
  errorText: { fontSize: 14, color: '#64748b', textAlign: 'center' },
});

export default MenuEscolarScreen;
