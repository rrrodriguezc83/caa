import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import { Text, Card, ActivityIndicator, Avatar, FAB } from 'react-native-paper';
import RenderHtml from 'react-native-render-html';
import { container } from '../../../di/container';
import ScreenHeader from '../../components/common/ScreenHeader';

const { fechasDiagnosticasRepository } = container;

const ASUNTO_BY_FELICITACION = {
  '0': 'Presentación evaluación diagnóstica por necesidad',
  '1': 'Felicitación resultado evaluación diagnóstica',
  '2': 'Evaluación diagnóstica',
  '3': 'Evaluación diagnóstica no aprobada',
  '4': 'Evaluación diagnóstica por necesidad no aprobada',
};

const DETALLE_BY_FELICITACION = {
  '0': `Deseamos recordarles que la evaluación diagnóstica que hace el jefe de departamento dos (2) veces en el semestre, nos permite conocer el nivel de aprendizaje de los estudiantes en cada asignatura.

En caso de que los resultados no sean satisfactorios, el profesor elabora con el jefe un taller con los temas que necesitan refuerzo y lo trabaja con los estudiantes, preparándolos para la evaluación que llamamos  "por necesidad".  El estudiante conoce la fecha y los temas que serán evaluados por segunda vez y tiene la oportunidad de recibir del profesor todas las explicaciones necesarias.

Con el propósito de motivar a los estudiantes para que den suficiente importancia a la preparación de la diagnóstica, el valor correspondiente de la evaluación es del 25%.  El valor de la evaluación por necesidad hace parte del 55% de la nota.

Les informamos que #nombre_estudiante# no aprobó la diagnóstica de del día #fechadiagnostica#. Por consiguiente, deberá presentar evaluación por necesidad un día asignado en la semana del #fechanecesidad# al #datePost#. Consideramos importante su colaboración para hacer seguimiento al repaso de la asignatura.`,
  '1': `Nos es grato comunicarles que su hijo(a) #nombre_estudiante# presentó la mejor evaluación diagnóstica aplicada el en el grado #curso#.

Esperamos que su hijo(a) continue destacándose en la obtención de logros.`,
  '2': 'Informe Inexistente',
  '3': `Deseamos recordarles que la evaluación diagnóstica que hace el jefe de departamento dos (2) veces en el semestre, nos permite conocer el nivel de aprendizaje de los estudiantes en cada asignatura.

Con el propósito de motivar a los estudiantes para que den suficiente importancia a la preparación de la diagnóstica, el valor correspondiente de la evaluación es el 25% del total de la nota.

Les informamos que #nombre_estudiante# no aprobó la diagnóstica de #materia# del día #fechadiagnostica#. Consideramos importante su colaboración para hacer seguimiento al repaso de la asignatura

Adicionalmente solicítele  a su hijo presentarle la evaluación para conocer los resultados.`,
  '4': `Les informamos que, a pesar del taller de repaso realizado con el docente de la asignatura, el estudiante #nombre_estudiante# no aprobó la diagnóstica por necesidad de #materia#. presentada en la semana del #fechanecesidad# al #datePost#. Consideramos importante hacer seguimiento al repaso de la asignatura para las actividades evaluativas restantes del periodo.`,
};

const DETALLE_FOOTER_BY_FELICITACION = {
  '0': 'Nosotros padres del estudiante #nombre_estudiante# del curso #curso#, hacemos constar que recibimos la información sobre el resultado de la diagnóstica y la presentación de la diagnóstica por necesidad.',
  '4': 'Nosotros padres del estudiante #nombre_estudiante# del curso #curso#, hacemos constar que recibimos la información sobre el resultado de la diagnóstica por necesidad.',
  default: 'Nosotros padres del estudiante #nombre_estudiante# del curso #curso#, hacemos constar que recibimos la información sobre el resultado de la diagnóstica.',
};

const replacePlaceholders = (text, data) => {
  if (!text) return '';
  return text
    .replace(/#nombre_estudiante#/g, data.nombre || '')
    .replace(/#curso#/g, data.curso || '')
    .replace(/#fechadiagnostica#/g, data.fechadiagnostica || '')
    .replace(/#fechanecesidad#/g, data.fechanecesidad || '')
    .replace(/#datePost#/g, data.datePost || '')
    .replace(/#materia#/g, data.materia || '');
};

const formatFechaEnvio = (fechaenvio) => {
  if (!fechaenvio) return '';
  const str = String(fechaenvio).trim();
  if (str.length >= 10 && str.includes('-')) {
    const parts = str.substring(0, 10).split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  if (str.match(/^\d{2}\/\d{2}\/\d{4}/)) return str.substring(0, 10);
  return str;
};

const buildContentHtml = (data) => {
  const felicitacion = String(data.felicitacion ?? '');
  const asunto = ASUNTO_BY_FELICITACION[felicitacion] ?? 'Evaluación diagnóstica';
  let detalle = DETALLE_BY_FELICITACION[felicitacion] ?? DETALLE_BY_FELICITACION['2'];
  detalle = replacePlaceholders(detalle, data);
  detalle = detalle.replace(/\n/g, '<br>');

  return `<p>Señores<br><b>Padres de Familia</b></p>
<p><b>ASUNTO: ${asunto}</b></p>
<p>${detalle}</p>
<p>COLEGIO ANGLO AMERICANO</p>`;
};

const buildFooterHtml = (data) => {
  const felicitacion = String(data.felicitacion ?? '');
  const fechaEnvio = formatFechaEnvio(data.fechaenvio) || data.fechaenvio || '';
  let detalleFooter = DETALLE_FOOTER_BY_FELICITACION[felicitacion] ?? DETALLE_FOOTER_BY_FELICITACION.default;
  detalleFooter = replacePlaceholders(detalleFooter, data);
  detalleFooter = detalleFooter.replace(/\n/g, '<br>');

  return `<p><b>Respuesta al Comunicado</b></p>
<p><b>Bogotá D.C. ${fechaEnvio}</b></p>
<p>Señores<br><b>COLEGIO ANGLO AMERICANO</b></p>
<p>${detalleFooter}</p>`;
};

const ComunicadoDiagnosticaScreen = ({ navigation, route }) => {
  const { diagnostica } = route.params || {};
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [alertData, setAlertData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const runFlow = async () => {
      if (!diagnostica?.fechaenvio) {
        setError('No hay información de diagnóstica.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        await fechasDiagnosticasRepository.upDiagnostic({
          date: diagnostica.fechaenvio,
          period: String(diagnostica.periodo ?? ''),
          matter: String(diagnostica.materia ?? ''),
        });

        const alertResponse = await fechasDiagnosticasRepository.getDiagnosticAlert(diagnostica.fechaenvio);
        if (alertResponse.code === 200 && Array.isArray(alertResponse.response) && alertResponse.response[0]) {
          setAlertData(alertResponse.response[0]);
        } else {
          setError('No se pudo cargar el detalle del comunicado.');
        }
      } catch (err) {
        console.error('Error en flujo diagnóstica:', err);
        setError(err.message || 'Error al cargar el comunicado.');
      } finally {
        setLoading(false);
      }
    };
    runFlow();
  }, [diagnostica]);

  const bodyHtmlStyles = {
    body: { color: '#475569', fontSize: 16, lineHeight: 24, margin: 0, padding: 0 },
    p: { margin: 0, marginBottom: 12 },
    strong: { fontWeight: 'bold', color: '#002c5d' },
    b: { fontWeight: 'bold', color: '#002c5d' },
    em: { fontStyle: 'italic' },
    i: { fontStyle: 'italic' },
  };

  if (!diagnostica) {
    return (
      <AppScreenLayout>
        <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
        <ScreenHeader title="Comunicado Diagnóstica" onBack={() => navigation.goBack()} />
        <View style={styles.content}>
          <Card style={styles.errorCard} elevation={1}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.errorText}>
                No se encontró información de la diagnóstica.
              </Text>
            </Card.Content>
          </Card>
        </View>
      </AppScreenLayout>
    );
  }

  if (loading) {
    return (
      <AppScreenLayout>
        <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
        <ScreenHeader title="Comunicado Diagnóstica" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#002c5d" />
          <Text style={styles.loadingText}>Cargando comunicado...</Text>
        </View>
      </AppScreenLayout>
    );
  }

  if (error || !alertData) {
    return (
      <AppScreenLayout>
        <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
        <ScreenHeader title="Comunicado Diagnóstica" onBack={() => navigation.goBack()} />
        <View style={styles.content}>
          <Card style={styles.errorCard} elevation={1}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.errorText}>
                {error || 'No se pudo cargar el contenido del comunicado.'}
              </Text>
            </Card.Content>
          </Card>
        </View>
      </AppScreenLayout>
    );
  }

  return (
    <AppScreenLayout>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Comunicado Diagnóstica" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Card style={styles.card} elevation={1}>
          <Card.Content style={styles.cardContent}>
            <Text style={styles.title}>COLEGIO ANGLO AMERICANO{'\n'}Bogotá D.C.</Text>
            <View style={styles.datesContainer}>
              <View style={styles.dateColumn}>
                <Text style={styles.dateLabel}>FECHA DIAGNÓSTICA</Text>
                <View style={styles.dateRow}>
                  <Avatar.Icon icon="calendar" size={20} style={styles.dateIconBlue} color="#002c5d" />
                  <Text style={styles.dateValue}>{alertData.fechadiagnostica || '—'}</Text>
                </View>
              </View>
              <View style={styles.dateColumn}>
                <Text style={styles.dateLabel}>FECHA ENVÍO</Text>
                <View style={styles.dateRow}>
                  <Avatar.Icon icon="calendar-check" size={20} style={styles.dateIconOrange} color="#ec5b13" />
                  <Text style={styles.dateValue}>{formatFechaEnvio(alertData.fechaenvio) || alertData.fechaenvio || '—'}</Text>
                </View>
              </View>
            </View>
            <View style={styles.bodyContainer}>
              <RenderHtml
                contentWidth={width - 64}
                source={{ html: buildContentHtml(alertData) }}
                ignoredDomTags={['input']}
                tagsStyles={bodyHtmlStyles}
              />
            </View>
          </Card.Content>
          <View style={styles.footerInterno}>
            <RenderHtml
              contentWidth={width - 64}
              source={{ html: buildFooterHtml(alertData) }}
              ignoredDomTags={['input']}
              tagsStyles={{
                body: {
                  color: '#475569',
                  fontSize: 14,
                  lineHeight: 22,
                  margin: 0,
                  padding: 0,
                  fontStyle: 'italic',
                  textAlign: 'justify',
                },
                p: { margin: 0, marginBottom: 0, textAlign: 'justify' },
                strong: { fontWeight: 'bold', color: '#002c5d' },
                b: { fontWeight: 'bold', color: '#002c5d' },
              }}
            />
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footerFixed}>
        <TouchableOpacity style={styles.backButtonFixed} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Avatar.Icon icon="arrow-left" size={24} style={styles.backButtonIcon} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f6f6',
  },
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
  footerInterno: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(248, 246, 246, 0.5)',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
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
  fab: { position: 'absolute', left: 16, bottom: 16, backgroundColor: '#002c5d' },
});

export default ComunicadoDiagnosticaScreen;
