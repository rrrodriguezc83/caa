import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Card,
  ActivityIndicator,
  Avatar,
} from 'react-native-paper';
import RenderHtml from 'react-native-render-html';
import { container } from '../../../di/container';
import ScreenHeader from '../../components/common/ScreenHeader';

const { circularRepository } = container;

/**
 * Convierte descripción de encuesta (puede traer \r\n) a HTML seguro para RenderHtml.
 */
const descripcionToHtml = (text) => {
  if (!text) return '<p>Sin descripción</p>';
  const escaped = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const withBreaks = escaped.replace(/\r\n/g, '<br/>').replace(/\r/g, '<br/>').replace(/\n/g, '<br/>');
  return `<div>${withBreaks}</div>`;
};

/**
 * Formatea fecha API "2026-01-01 00:00:00" para mostrar en card tipo circular.
 */
const formatFechaEncuesta = (fecha) => {
  if (!fecha) return '—';
  const s = String(fecha).trim();
  const part = s.split(' ')[0];
  if (!part) return s;
  const [y, m, d] = part.split('-');
  if (y && m && d) return `${d}/${m}/${y}`;
  return s;
};

const DetalleEncuestaScreen = ({ navigation, route }) => {
  const { width } = useWindowDimensions();
  const numSurvey = route.params?.num_survey ?? route.params?.circular?.circular;
  const [loading, setLoading] = useState(true);
  /** Respuesta completa del servicio getSurveyDefinitionForRender */
  const [surveyPayload, setSurveyPayload] = useState(null);
  /** Respuesta del servicio dataSurvey (array con Date_Start, Date_End, etc.) */
  const [dataSurveyPayload, setDataSurveyPayload] = useState(null);
  const encuesta = surveyPayload?.encuesta;
  /** Primer elemento de dataSurvey.response para fechas apertura/cierre */
  const dataSurveyRow = Array.isArray(dataSurveyPayload) ? dataSurveyPayload[0] : null;

  useEffect(() => {
    const load = async () => {
      if (!numSurvey) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [defRes, dataRes] = await Promise.all([
          circularRepository.getSurveyDefinitionForRender(numSurvey),
          circularRepository.dataSurvey(numSurvey),
        ]);

        if (defRes.code === 200 && defRes.response) {
          setSurveyPayload(defRes.response);
        } else {
          setSurveyPayload(null);
        }

        if (dataRes.code === 200 && Array.isArray(dataRes.response)) {
          setDataSurveyPayload(dataRes.response);
        } else {
          setDataSurveyPayload(null);
        }
      } catch (e) {
        console.error('Error al cargar encuesta:', e);
        setSurveyPayload(null);
        setDataSurveyPayload(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [numSurvey]);

  if (!numSurvey) {
    return (
      <SafeAreaView style={styles.mainContainer} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
        <ScreenHeader title="Detalle Encuesta" onBack={() => navigation.goBack()} />
        <View style={styles.content}>
          <Card style={styles.errorCard} elevation={1}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.errorText}>
                No se indicó la encuesta.
              </Text>
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
        <ScreenHeader title="Detalle Encuesta" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#002c5d" />
          <Text style={styles.loadingText}>Cargando encuesta...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!encuesta) {
    return (
      <SafeAreaView style={styles.mainContainer} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
        <ScreenHeader title="Detalle Encuesta" onBack={() => navigation.goBack()} />
        <View style={styles.content}>
          <Card style={styles.errorCard} elevation={1}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.errorText}>
                No se pudo cargar la información de la encuesta.
              </Text>
            </Card.Content>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  const bodyHtmlStyles = {
    body: { color: '#475569', fontSize: 16, lineHeight: 24, margin: 0, padding: 0 },
    div: { color: '#475569', fontSize: 16, lineHeight: 24 },
    p: { margin: 0, marginBottom: 12 },
    br: { height: 8 },
    strong: { fontWeight: 'bold', color: '#002c5d' },
    b: { fontWeight: 'bold', color: '#002c5d' },
  };

  // Fechas desde dataSurvey (Date_Start / Date_End); si no hay, fallback a encuesta
  const fechaInicio = dataSurveyRow?.Date_Start
    ? formatFechaEncuesta(dataSurveyRow.Date_Start)
    : formatFechaEncuesta(encuesta.fecha_inicio);
  const fechaFin = dataSurveyRow?.Date_End
    ? formatFechaEncuesta(dataSurveyRow.Date_End)
    : formatFechaEncuesta(encuesta.fecha_fin);

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Detalle Encuesta" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.card} elevation={1}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>{encuesta.nombre}</Text>
            <View style={styles.datesContainer}>
              <View style={styles.dateColumn}>
                <Text style={styles.dateLabel}>FECHA APERTURA</Text>
                <View style={styles.dateRow}>
                  <Avatar.Icon icon="calendar" size={20} style={styles.dateIconBlue} color="#002c5d" />
                  <Text style={styles.dateValue}>{fechaInicio}</Text>
                </View>
              </View>
              <View style={styles.dateColumn}>
                <Text style={styles.dateLabel}>FECHA CIERRE</Text>
                <View style={styles.dateRow}>
                  <Avatar.Icon icon="calendar-remove" size={20} style={styles.dateIconOrange} color="#ec5b13" />
                  <Text style={styles.dateValue}>{fechaFin}</Text>
                </View>
              </View>
            </View>
            <View style={styles.bodyContainer}>
              <RenderHtml
                contentWidth={width - 64}
                source={{ html: descripcionToHtml(encuesta.descripcion) }}
                tagsStyles={bodyHtmlStyles}
              />
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <View style={styles.footerFixed}>
        <TouchableOpacity
          style={styles.backButtonFixed}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: { padding: 20 },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 16,
  },
  errorText: { color: '#64748b', textAlign: 'center', lineHeight: 24, fontSize: 14 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#002c5d',
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  datesContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 16,
  },
  dateColumn: { flex: 1, gap: 4 },
  dateLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateIconOrange: { backgroundColor: 'transparent', width: 20, height: 20 },
  dateIconBlue: { backgroundColor: 'transparent', width: 20, height: 20 },
  dateValue: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  bodyContainer: { marginBottom: 0 },
  footerFixed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 16,
  },
  backButtonFixed: {
    backgroundColor: '#002c5d',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButtonIcon: { backgroundColor: 'transparent' },
  backButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});

export default DetalleEncuestaScreen;
