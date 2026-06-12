import React from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import { Text } from 'react-native-paper';
import ScreenHeader from '../../components/common/ScreenHeader';
import costosData from '../../../data/datasources/local/CostosEducativos.json';
import serviciosData from '../../../data/datasources/local/CostosServicios.json';

const formatCOP = (value) => `$${value.toLocaleString('es-CO')}`;

const groupByService = (data) => {
  const groups = {};
  data.forEach((item) => {
    if (!groups[item.tipo_de_servicio]) groups[item.tipo_de_servicio] = [];
    groups[item.tipo_de_servicio].push(item);
  });
  return groups;
};

const CostosScreen = ({ navigation }) => {
  const serviciosGroups = groupByService(serviciosData);

  return (
    <AppScreenLayout>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Costos" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Costos Educativos */}
        <Text style={styles.sectionTitle}>Costos Educativos</Text>
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.gradeCol]}>Grado</Text>
            <Text style={[styles.headerCell, styles.valueCol]}>Matrícula</Text>
            <Text style={[styles.headerCell, styles.valueCol]}>Pensión</Text>
          </View>
          {costosData.map((item, index) => (
            <View
              key={item.grado}
              style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}
            >
              <Text style={[styles.cell, styles.gradeCol]}>{item.grado}</Text>
              <Text style={[styles.cell, styles.valueCol]}>{formatCOP(item.matricula)}</Text>
              <Text style={[styles.cell, styles.valueCol]}>{formatCOP(item.pension)}</Text>
            </View>
          ))}
        </View>

        {/* Costos en Servicios */}
        <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Costos en Servicios</Text>
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, styles.descCol]}>Descripción</Text>
            <Text style={[styles.headerCell, styles.valueCol]}>Valor</Text>
          </View>
          {Object.entries(serviciosGroups).map(([tipo, items]) => (
            <React.Fragment key={tipo}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupHeaderText}>{tipo}</Text>
              </View>
              {items.map((item, index) => (
                <View
                  key={`${tipo}-${index}`}
                  style={[styles.tableRow, index % 2 === 0 && styles.tableRowAlt]}
                >
                  <Text style={[styles.cell, styles.descCol]}>{item.descripcion}</Text>
                  <Text style={[styles.cell, styles.valueCol]}>{formatCOP(item.valor)}</Text>
                </View>
              ))}
            </React.Fragment>
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

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#27272a',
    marginBottom: 10,
  },
  sectionTitleSpaced: { marginTop: 20 },

  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#002c5d',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  headerCell: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

  groupHeader: {
    backgroundColor: '#e6eaf0',
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  groupHeaderText: { fontSize: 12, fontWeight: '700', color: '#002c5d', textTransform: 'uppercase', letterSpacing: 0.5 },

  tableRow: {
    flexDirection: 'row',
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  tableRowAlt: { backgroundColor: '#f4f6f9' },
  cell: { fontSize: 13, color: '#27272a' },
  gradeCol: { flex: 1.2 },
  descCol: { flex: 2 },
  valueCol: { flex: 1.4, textAlign: 'right' },

  bottomSpacer: { height: 24 },
});

export default CostosScreen;
