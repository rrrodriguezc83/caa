import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Card,
  useTheme,
  ActivityIndicator,
  Avatar,
  IconButton,
} from 'react-native-paper';
import RenderHtml from 'react-native-render-html';
import { container } from '../../../di/container';
import { transformTextToHtml } from '../../../shared/utils/textHelpers';
import ScreenHeader from '../../components/common/ScreenHeader';

const { userRepository, circularRepository } = container;

const DetalleCircularScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { circular, auth } = route.params || {};
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [circularContent, setCircularContent] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      await fetchUserInfo();
      if (circular && circular.circular) {
        await sendConsult();
        await fetchCircularContent();
      }
    };
    loadData();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const infoResponse = await userRepository.getInfo();
      if (infoResponse && infoResponse.response && infoResponse.response[0]) {
        setUserInfo(infoResponse.response[0]);
      }
    } catch (error) {
      console.error('Error al obtener información de usuario:', error);
    }
  };

  const sendConsult = async () => {
    try {
      const data = await circularRepository.sendConsult(circular.circular);
      if (data.code === 200 && Array.isArray(data.response) && data.response[0] === true) {
        console.log('Consulta de circular registrada exitosamente');
      }
    } catch (error) {
      console.error('Error al registrar consulta de circular:', error);
    }
  };

  // Variante local de transformTextToHtml sin <br> (para circulares)
  const transformCircularHtml = (text) => {
    if (!text) return '<p>Sin contenido</p>';
    let htmlText = text.replace(/\\"/g, '"');
    htmlText = htmlText.replace(/\\'/g, "'");
    htmlText = htmlText.replace(/border-collapse\s*:\s*collapse\s*;?/gi, '');
    htmlText = htmlText.replace(/\n/g, '');
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(htmlText);
    if (!hasHtmlTags) htmlText = `<p>${htmlText}</p>`;
    return htmlText;
  };

  const replaceFooterPlaceholders = (footerText) => {
    if (!footerText || !userInfo) return footerText;
    let processedFooter = footerText;
    if (userInfo.NOMBRE) processedFooter = processedFooter.replace(/\$nombrecompleto/g, userInfo.NOMBRE);
    if (userInfo.CURSO) processedFooter = processedFooter.replace(/\$curso/g, userInfo.CURSO);
    return processedFooter;
  };

  const getAuthMessage = () => {
    if (!auth || auth === '') return 'Pendiente Autorización';
    const lower = auth.toLowerCase();
    if (lower === 'si') return 'Autorizado';
    if (lower === 'no') return 'No Autorizado';
    if (lower === 'na') return 'No Requiere';
    return 'Pendiente Autorización';
  };

  const getAuthCardStyle = () => {
    const lower = (auth || '').toLowerCase();
    if (lower === 'si') return [styles.responseCard, styles.responseCardAutorizado];
    if (lower === 'no') return [styles.responseCard, styles.responseCardNoAutorizado];
    if (lower === 'na') return [styles.responseCard, styles.responseCardNoRequiere];
    return [styles.responseCard, styles.responseCardPendiente];
  };

  const getAuthMessageStyle = () => {
    const lower = (auth || '').toLowerCase();
    if (lower === 'si') return [styles.responseMessageText, styles.responseMessageAutorizado];
    if (lower === 'no') return [styles.responseMessageText, styles.responseMessageNoAutorizado];
    if (lower === 'na') return [styles.responseMessageText, styles.responseMessageNoRequiere];
    return [styles.responseMessageText, styles.responseMessagePendiente];
  };

  const getAuthIcon = () => {
    const lower = (auth || '').toLowerCase();
    if (lower === 'si') return 'check-circle-outline';
    if (lower === 'no') return 'close-circle-outline';
    if (lower === 'na') return 'minus-circle-outline';
    return 'clock-outline';
  };

  const getAuthIconStyle = () => {
    const lower = (auth || '').toLowerCase();
    if (lower === 'si') return styles.iconContainerAutorizado;
    if (lower === 'no') return styles.iconContainerNoAutorizado;
    if (lower === 'na') return styles.iconContainerNoRequiere;
    return styles.iconContainerPendiente;
  };

  const getAuthIconColor = () => {
    const lower = (auth || '').toLowerCase();
    if (lower === 'si') return '#10b981';
    if (lower === 'no') return '#ef4444';
    if (lower === 'na') return '#64748b';
    return '#f59e0b';
  };

  const fetchCircularContent = async () => {
    try {
      setLoading(true);
      const data = await circularRepository.getNoticeContent(circular.circular);
      if (data.code === 200 && data.response) {
        setCircularContent(data.response);
      } else {
        setCircularContent(null);
      }
    } catch (error) {
      console.error('Error al cargar contenido de circular:', error);
      setCircularContent(null);
    } finally {
      setLoading(false);
    }
  };

  if (!circular) {
    return (
      <SafeAreaView style={styles.mainContainer} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
        <ScreenHeader title="Detalle Circular" onBack={() => navigation.goBack()} />
        <View style={styles.content}>
          <Card style={styles.errorCard} elevation={1}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.errorText}>No se encontró información de la circular.</Text>
            </Card.Content>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.mainContainer} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
        <ScreenHeader title="Detalles Circular" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#002c5d" />
          <Text style={styles.loadingText}>Cargando contenido de la circular...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!circularContent) {
    return (
      <SafeAreaView style={styles.mainContainer} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
        <ScreenHeader title="Detalles Circular" onBack={() => navigation.goBack()} />
        <View style={styles.content}>
          <Card style={styles.errorCard} elevation={1}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.errorText}>No se pudo cargar el contenido de la circular.</Text>
            </Card.Content>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  const bodyHtmlStyles = {
    body: { color: '#475569', fontSize: 16, lineHeight: 24, margin: 0, padding: 0 },
    p: { margin: 0, marginBottom: 12 },
    strong: { fontWeight: 'bold', color: '#002c5d' },
    b: { fontWeight: 'bold', color: '#002c5d' },
    em: { fontStyle: 'italic' },
    i: { fontStyle: 'italic' },
    u: { textDecorationLine: 'underline', textDecorationColor: '#475569' },
    h1: { color: '#002c5d', fontSize: 20, marginBottom: 8, fontWeight: 'bold' },
    h2: { color: '#002c5d', fontSize: 18, marginBottom: 8, fontWeight: 'bold' },
    h3: { color: '#002c5d', fontSize: 16, marginBottom: 8, fontWeight: 'bold' },
    li: { marginBottom: 8, color: '#475569' },
    table: { borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'solid', marginBottom: 12 },
    th: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'solid', padding: 8, fontWeight: 'bold', color: '#002c5d', textAlign: 'center' },
    td: { borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'solid', padding: 8, color: '#475569' },
    tr: { borderWidth: 1, borderColor: '#e2e8f0', borderStyle: 'solid' },
    thead: { backgroundColor: '#f8fafc' },
    tbody: { backgroundColor: '#FFFFFF' },
  };

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Detalles Circular" onBack={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card} elevation={1}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>{circularContent.SUBJECT}</Text>
            <View style={styles.datesContainer}>
              <View style={styles.dateColumn}>
                <Text style={styles.dateLabel}>FECHA APERTURA</Text>
                <View style={styles.dateRow}>
                  <Avatar.Icon icon="calendar" size={20} style={styles.dateIconBlue} color="#002c5d" />
                  <Text style={styles.dateValue}>{circularContent.DATE_START}</Text>
                </View>
              </View>
              <View style={styles.dateColumn}>
                <Text style={styles.dateLabel}>FECHA CIERRE</Text>
                <View style={styles.dateRow}>
                  <Avatar.Icon icon="calendar-remove" size={20} style={styles.dateIconOrange} color="#ec5b13" />
                  <Text style={styles.dateValue}>{circularContent.DATE_END}</Text>
                </View>
              </View>
            </View>
            <View style={styles.bodyContainer}>
              <RenderHtml
                contentWidth={width - 64}
                source={{ html: '<p>Señores<br><b>Padres de Familia</b></p>' + transformCircularHtml(circularContent.BODY) }}
                ignoredDomTags={['input']}
                tagsStyles={bodyHtmlStyles}
              />
            </View>
          </Card.Content>
          <View style={styles.footerInterno}>
            <RenderHtml
              contentWidth={width - 64}
              source={{
                html: transformCircularHtml(
                  circularContent.FOOTER
                    ? replaceFooterPlaceholders(circularContent.FOOTER)
                    : `Nosotros los padres del estudiante ${userInfo?.NOMBRE || 'Usuario'} del curso ${userInfo?.CURSO || ''}, estamos enterados de la circular.`
                ),
              }}
              ignoredDomTags={['input']}
              tagsStyles={{
                body: { color: '#475569', fontSize: 14, lineHeight: 22, margin: 0, padding: 0, fontStyle: 'italic', textAlign: 'justify' },
                p: { margin: 0, marginBottom: 0, textAlign: 'justify' },
                strong: { fontWeight: 'bold', color: '#002c5d' },
                b: { fontWeight: 'bold', color: '#002c5d' },
              }}
            />
          </View>
        </Card>

        {circularContent.TYPE_NOT === '1' && (
          <Card style={getAuthCardStyle()} elevation={1}>
            <Card.Content style={styles.responseCardContent}>
              <View style={getAuthIconStyle()}>
                <Avatar.Icon icon={getAuthIcon()} size={28} style={styles.authIcon} color={getAuthIconColor()} />
              </View>
              <View style={styles.textContainer}>
                <Text style={getAuthMessageStyle()}>{getAuthMessage()}</Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <View style={styles.footerFixed}>
        <TouchableOpacity style={styles.backButtonFixed} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Avatar.Icon icon="arrow-left" size={24} style={styles.backButtonIcon} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8f6f6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f6f6' },
  loadingText: { marginTop: 16, color: '#64748b', fontSize: 14 },
  content: { flex: 1, backgroundColor: '#f8f6f6' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16, overflow: 'hidden' },
  cardContent: { padding: 20 },
  errorCard: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginTop: 16 },
  errorText: { color: '#64748b', textAlign: 'center', lineHeight: 24, fontSize: 14 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#002c5d', lineHeight: 32, letterSpacing: -0.5, marginBottom: 16 },
  datesContainer: { flexDirection: 'row', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f1f5f9', marginBottom: 16 },
  dateColumn: { flex: 1, gap: 4 },
  dateLabel: { fontSize: 10, fontWeight: '600', color: '#94a3b8', letterSpacing: 0.5, textTransform: 'uppercase' },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateIconOrange: { backgroundColor: 'transparent', width: 20, height: 20 },
  dateIconBlue: { backgroundColor: 'transparent', width: 20, height: 20 },
  dateValue: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  bodyContainer: { marginBottom: 0 },
  footerInterno: { paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'rgba(248, 246, 246, 0.5)', borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  responseCard: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  responseCardAutorizado: { backgroundColor: '#FFFFFF' },
  responseCardNoAutorizado: { backgroundColor: '#FFFFFF' },
  responseCardNoRequiere: { backgroundColor: '#FFFFFF' },
  responseCardPendiente: { backgroundColor: '#FFFFFF' },
  responseCardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 16 },
  iconContainerAutorizado: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#d1fae5', alignItems: 'center', justifyContent: 'center' },
  iconContainerNoAutorizado: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  iconContainerNoRequiere: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center' },
  iconContainerPendiente: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fed7aa', alignItems: 'center', justifyContent: 'center' },
  authIcon: { backgroundColor: 'transparent' },
  textContainer: { alignItems: 'center', justifyContent: 'center' },
  responseMessageText: { fontWeight: '700', textAlign: 'center', fontSize: 18, lineHeight: 24, letterSpacing: -0.45, textTransform: 'uppercase' },
  responseMessageAutorizado: { color: '#10b981' },
  responseMessageNoAutorizado: { color: '#ef4444' },
  responseMessageNoRequiere: { color: '#64748b' },
  responseMessagePendiente: { color: '#f59e0b' },
  footerFixed: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#e2e8f0', padding: 16 },
  backButtonFixed: { backgroundColor: '#002c5d', borderRadius: 12, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  backButtonIcon: { backgroundColor: 'transparent' },
  backButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default DetalleCircularScreen;
