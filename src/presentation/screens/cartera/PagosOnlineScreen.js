import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenHeader from '../../components/common/ScreenHeader';

const PAYMENT_OPTIONS = [
  {
    id: 'pse',
    label: 'Pago PSE',
    description: 'Débito desde tu cuenta bancaria',
    icon: 'bank-transfer',
    color: '#1a4f8a',
    url: 'https://colombia.recaudoexpress.com/sitesws/anglo-pensiones',
  },
  {
    id: 'credit-card',
    label: 'Tarjeta de Crédito',
    description: 'Visa, Mastercard',
    icon: 'credit-card-outline',
    color: '#1a4f8a',
    url: 'https://colombia.recaudoexpress.com/sitesws/anglo-pensionestc',
  },
];

const openUrl = async (url) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'No se puede abrir este enlace en tu dispositivo.');
    }
  } catch {
    Alert.alert('Error', 'Ocurrió un error al abrir el enlace.');
  }
};

const PagosOnlineScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Pagos en Línea" onBack={() => navigation.goBack()} />

      <View style={styles.content}>
        <View style={styles.pensionCard}>
          <View style={styles.pensionCardHeader}>
            <View style={styles.pensionIconWrap}>
              <Icon name="school" size={22} color="#002c5d" />
            </View>
            <View>
              <Text style={styles.pensionCardLabel}>Concepto de pago</Text>
              <Text style={styles.pensionCardTitle}>Pensión</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.chooseLabel}>Selecciona tu método de pago</Text>

          <View style={styles.optionsContainer}>
            {PAYMENT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionButton}
                onPress={() => openUrl(option.url)}
                activeOpacity={0.75}
              >
                <View style={[styles.optionIconWrap, { backgroundColor: option.color }]}>
                  <Icon name={option.icon} size={26} color="#ffffff" />
                </View>
                <View style={styles.optionTextWrap}>
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <Icon name="open-in-new" size={18} color="#a1a1aa" />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.secureRow}>
            <Icon name="shield-check" size={14} color="#64748b" />
            <Text style={styles.secureText}>Pago seguro procesado por Recaudo Express</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Icon name="information-outline" size={20} color="#1a4f8a" />
          <Text style={styles.infoText}>
            Para pagos anticipados y otros pagos, por favor dirigirse al portal web.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8f6f6' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
  pensionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  pensionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  pensionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#e6eaf0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pensionCardLabel: { fontSize: 12, color: '#71717a', fontWeight: '500' },
  pensionCardTitle: { fontSize: 20, fontWeight: 'bold', color: '#27272a' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 16 },
  chooseLabel: { fontSize: 13, color: '#64748b', marginBottom: 12, fontWeight: '500' },
  optionsContainer: { gap: 10 },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  optionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextWrap: { flex: 1 },
  optionLabel: { fontSize: 15, fontWeight: '700', color: '#27272a' },
  optionDescription: { fontSize: 12, color: '#71717a', marginTop: 2 },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    justifyContent: 'center',
  },
  secureText: { fontSize: 11, color: '#64748b' },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 12,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoText: { flex: 1, fontSize: 13, color: '#1a4f8a', lineHeight: 19 },
});

export default PagosOnlineScreen;
