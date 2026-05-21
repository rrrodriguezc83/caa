import React from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenHeader from '../../components/common/ScreenHeader';

const ExtraEscolaresScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Extra Escolares" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.placeholderContainer}>
          <View style={styles.iconCircle}>
            <Icon name="star" size={48} color="#002c5d" />
          </View>
          <Text style={styles.placeholderTitle}>Extra Escolares</Text>
          <Text style={styles.placeholderText}>
            Consulta las actividades extracurriculares disponibles, horarios e inscripciones.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8f6f6' },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingBottom: 24 },
  placeholderContainer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(0, 44, 93, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  placeholderTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  placeholderText: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22 },
});

export default ExtraEscolaresScreen;
