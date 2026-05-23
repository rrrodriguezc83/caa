import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../../components/common/ScreenHeader';
import PdfViewer from '../../components/common/PdfViewer';

const PDF_URL = 'https://www.comunidadvirtualcaa.co/Information/views/Manual_de_Convivencia_2026.pdf';

const ManualConvivenciaScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Manual de Convivencia" onBack={() => navigation.goBack()} />
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

export default ManualConvivenciaScreen;
