import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/common/ScreenHeader';
import PdfViewer from '../../components/common/PdfViewer';

const PDF_URL = 'https://www.comunidadvirtualcaa.co/Information/views/Politica_de_seguridad_de_la_informacion.pdf';

const PoliticasSeguridadScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Políticas de Seguridad" onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <PdfViewer uri={PDF_URL} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8f6f6' },
  content: { flex: 1 },
});

export default PoliticasSeguridadScreen;
