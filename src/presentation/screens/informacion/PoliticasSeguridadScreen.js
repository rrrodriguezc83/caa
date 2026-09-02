import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import { FAB } from 'react-native-paper';
import ScreenHeader from '../../components/common/ScreenHeader';
import PdfViewer from '../../components/common/PdfViewer';

const PDF_URL = 'https://www.comunidadvirtualcaa.co/Information/views/Politica_de_seguridad_de_la_informacion.pdf';

const PoliticasSeguridadScreen = ({ navigation }) => {
  return (
    <AppScreenLayout>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Políticas de Seguridad" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <PdfViewer uri={PDF_URL} />
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
  content: { flex: 1 },
  fab: { position: 'absolute', left: 16, bottom: 16, backgroundColor: '#002c5d' },
});

export default PoliticasSeguridadScreen;
