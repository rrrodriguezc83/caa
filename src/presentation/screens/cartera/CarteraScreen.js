import React from 'react';
import { View, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenHeader from '../../components/common/ScreenHeader';

const MODULES = [
  {
    id: 'recibo-pension',
    icon: 'receipt',
    title: 'Recibo de pago - Pensión',
    subtitle: 'Consulta y descarga tu recibo',
  },
  {
    id: 'pagos-online',
    icon: 'credit-card-multiple',
    title: 'Pagos en línea',
    subtitle: 'Realiza pagos de forma segura',
  },
  {
    id: 'certificados-retencion',
    icon: 'file-document-outline',
    title: 'Certificados de retención',
    subtitle: 'Solicita e imprime tu certificado',
  },
];

const CarteraScreen = ({ navigation }) => {
  const handleModulePress = (module) => {
    if (module.id === 'recibo-pension') {
      navigation.navigate('ReciboPago');
      return;
    }
    if (module.id === 'pagos-online') {
      navigation.navigate('PagosOnline');
      return;
    }
    if (module.id === 'certificados-retencion') {
      navigation.navigate('CertificadoRetencion');
      return;
    }

    // No existen pantallas específicas todavía para estas opciones; usamos `Module`
    // como fallback para mantener la UX consistente.
    navigation.navigate('Module', { moduleName: module.title, moduleId: module.id });
  };

  return (
    <AppScreenLayout navigation={navigation}>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Cartera" onBack={() => navigation.goBack()} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Context Card */}
        <View style={styles.contextCard}>
          <Text style={styles.contextSubtitle}>Gestión de Pagos</Text>
          <Text style={styles.contextTitle}>Recibos, pagos y certificados</Text>
        </View>

        {/* Module List */}
        <View style={styles.modulesList}>
          {MODULES.map((module) => (
            <TouchableOpacity
              key={module.id}
              style={styles.moduleCard}
              onPress={() => handleModulePress(module)}
              activeOpacity={0.7}
            >
              <View style={styles.moduleIconContainer}>
                <Icon name={module.icon} size={24} color="#002c5d" />
              </View>
              <View style={styles.moduleContent}>
                <Text style={styles.moduleTitle} numberOfLines={1}>
                  {module.title}
                </Text>
                <Text style={styles.moduleSubtitle} numberOfLines={1}>
                  {module.subtitle}
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color="#a1a1aa" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </AppScreenLayout>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8f6f6' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

  contextCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  contextSubtitle: { fontSize: 14, color: '#71717a', fontWeight: '500', marginBottom: 4 },
  contextTitle: { fontSize: 18, fontWeight: 'bold', color: '#27272a' },

  modulesList: { gap: 12 },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  moduleIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#e6eaf0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  moduleContent: { flex: 1, minWidth: 0 },
  moduleTitle: { fontSize: 16, fontWeight: '600', color: '#27272a' },
  moduleSubtitle: { fontSize: 12, color: '#71717a', marginTop: 2 },
  bottomSpacer: { height: 24 },
});

export default CarteraScreen;
