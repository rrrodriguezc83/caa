import React from 'react';
import { View, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenHeader from '../../components/common/ScreenHeader';

const ROUTE_MAP = {
  'fechas-diagnosticas': 'FechasDiagnosticas',
  'evaluaciones-diagnosticas': 'EvaluacionesDiagnosticas',
  'evaluaciones-periodo': 'EvaluacionesPeriodo',
  'estudiantes-destacados': 'EstudiantesDestacados',
  'mejor-curso': 'MejorCurso',
  'boletin': 'BoletinAcademico',
};

const MODULES = [
  { id: 'estudiantes-destacados', icon: 'medal', title: 'Estudiantes Destacados', subtitle: 'Cuadro de honor y méritos' },
  { id: 'fechas-diagnosticas', icon: 'calendar-month', title: 'Fechas Diagnósticas', subtitle: 'Cronograma de actividades iniciales' },
  { id: 'evaluaciones-periodo', icon: 'file-document', title: 'Evaluaciones Trimestrales', subtitle: 'Programación evaluaciones' },
    { id: 'evaluaciones-diagnosticas', icon: 'clipboard-check', title: 'Evaluaciones Diagnósticas', subtitle: 'Resultados de nivelación' },
  { id: 'mejor-curso', icon: 'account-group', title: 'Mejor Curso Valores y Acad.', subtitle: 'Ranking de convivencia y notas' },
  { id: 'boletin', icon: 'chart-box', title: 'Boletín Académico', subtitle: 'Descarga de reporte final' },
];

const AcademicoScreen = ({ navigation }) => {
  const handleModulePress = (module) => {
    const route = ROUTE_MAP[module.id];
    if (route) navigation.navigate(route);
  };

  return (
    <AppScreenLayout>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Académico" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Context Card */}
        <View style={styles.contextCard}>
          <Text style={styles.contextSubtitle}>Gestión Escolar</Text>
          <Text style={styles.contextTitle}>Módulos de Seguimiento</Text>
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
                <Text style={styles.moduleTitle} numberOfLines={1}>{module.title}</Text>
                <Text style={styles.moduleSubtitle} numberOfLines={1}>{module.subtitle}</Text>
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

export default AcademicoScreen;
