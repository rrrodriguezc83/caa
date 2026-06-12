import React from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Text } from 'react-native-paper';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ScreenHeader from '../../components/common/ScreenHeader';

const EntrevistaScreen = ({ navigation }) => {
  return (
    <AppScreenLayout>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Entrevista" onBack={() => navigation.goBack()} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.placeholderContainer}>
          <View style={styles.iconCircle}>
            <Icon name="chat" size={48} color="#002c5d" />
          </View>
          <Text style={styles.placeholderTitle}>Entrevista</Text>
          <Text style={styles.placeholderText}>
            Agenda y consulta entrevistas con docentes, coordinadores y personal administrativo.
          </Text>
        </View>
      </ScrollView>
    </AppScreenLayout>
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

export default EntrevistaScreen;
