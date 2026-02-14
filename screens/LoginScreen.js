import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  TextInput, 
  Button, 
  Text, 
  Card, 
  Snackbar,
  SegmentedButtons,
  useTheme,
  IconButton,
  Divider,
  Dialog,
  Portal,
  Paragraph,
} from 'react-native-paper';
import { login } from '../services/authService';
import {
  isBiometricAvailable,
  authenticateWithBiometric,
  saveCredentials,
  getCredentials,
  hasStoredCredentials,
} from '../services/biometricService';

const LoginScreen = ({ navigation }) => {
  const theme = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('1'); // 1 = Comunidad, 2 = Estudiante
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [biometricDialogVisible, setBiometricDialogVisible] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState(null);

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Verificar disponibilidad de biometría al cargar
  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const available = await isBiometricAvailable();
      const stored = await hasStoredCredentials();
      
      setBiometricAvailable(available);
      setHasCredentials(stored);
      
      console.log('Biometría disponible:', available);
      console.log('Credenciales guardadas:', stored);
    } catch (error) {
      console.error('Error verificando biometría:', error);
    }
  };

  const handleEnableBiometric = async () => {
    setBiometricDialogVisible(false);
    
    if (pendingCredentials) {
      const saved = await saveCredentials(
        pendingCredentials.username,
        pendingCredentials.password,
        pendingCredentials.profile
      );
      
      if (saved) {
        console.log('Credenciales guardadas para uso biométrico');
        setHasCredentials(true);
        showSnackbar('Autenticación biométrica habilitada');
      }
    }
    
    setPendingCredentials(null);
    navigation.replace('Welcome');
  };

  const handleSkipBiometric = () => {
    setBiometricDialogVisible(false);
    setPendingCredentials(null);
    navigation.replace('Welcome');
  };

  const handleBiometricLogin = async () => {
    try {
      setLoading(true);
      
      // Autenticar con huella dactilar
      const authenticated = await authenticateWithBiometric();
      
      if (!authenticated) {
        showSnackbar('Autenticación biométrica cancelada');
        setLoading(false);
        return;
      }
      
      // Obtener credenciales guardadas
      const credentials = await getCredentials();
      
      if (!credentials) {
        showSnackbar('No se encontraron credenciales guardadas');
        setLoading(false);
        return;
      }
      
      // Realizar login con las credenciales guardadas
      const response = await login(
        credentials.username, 
        credentials.password, 
        credentials.profile
      );
      
      if (response.code === 200 && response.response) {
        const isLoginSuccessful = response.response.data && response.response.data !== false;
        
        if (isLoginSuccessful) {
          console.log('Login biométrico exitoso');
          navigation.replace('Welcome');
        } else {
          showSnackbar('Las credenciales guardadas ya no son válidas');
        }
      } else {
        showSnackbar('Error al iniciar sesión con credenciales guardadas');
      }
    } catch (error) {
      console.error('Error en login biométrico:', error);
      showSnackbar('Error al autenticar con huella dactilar');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    // Validar campos
    if (!username.trim()) {
      showSnackbar('Por favor ingrese su usuario');
      return;
    }

    if (!password.trim()) {
      showSnackbar('Por favor ingrese su contraseña');
      return;
    }

    setLoading(true);

    try {
      const response = await login(username, password, selectedProfile);
      
      if (response.code === 200 && response.response) {
        // Verificar si el login fue exitoso
        const isLoginSuccessful = response.response.data && response.response.data !== false;
        
        if (isLoginSuccessful) {
          // Credenciales válidas
          console.log('Login exitoso. Data recibida:', response.response.data);
          console.log('Perfil:', response.response.perfil);
          if (response.response.session) {
            console.log('Session:', response.response.session);
          }
          
          // Preguntar si desea habilitar biometría (solo si está disponible y no hay credenciales guardadas)
          if (biometricAvailable && !hasCredentials) {
            setPendingCredentials({
              username,
              password,
              profile: selectedProfile,
            });
            setBiometricDialogVisible(true);
          } else {
            // Si ya tiene credenciales o no hay biometría, navegar directamente
            navigation.replace('Welcome');
          }
        } else {
          // Credenciales inválidas
          showSnackbar('Credenciales inválidas. Verifique e intente nuevamente.');
        }
      } else {
        showSnackbar('Ocurrió un error al intentar iniciar sesión');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Mensaje específico para errores de CORS
      if (error.name === 'CORSError' || error.message.includes('CORS')) {
        showSnackbar('Error de CORS. Pruebe en Android o iOS.');
      } else {
        showSnackbar('No se pudo conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <Card style={styles.card} elevation={4}>
              <Card.Content>
                <Text variant="headlineMedium" style={styles.title}>
                  Iniciar Sesión
                </Text>

                <TextInput
                  label="Usuario"
                  value={username}
                  onChangeText={setUsername}
                  mode="outlined"
                  autoCapitalize="none"
                  autoCorrect={false}
                  disabled={loading}
                  style={styles.input}
                  left={<TextInput.Icon icon="account" />}
                />

                <TextInput
                  label="Contraseña"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  disabled={loading}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon 
                      icon={showPassword ? 'eye-off' : 'eye'} 
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                />

                <Text variant="labelLarge" style={styles.profileLabel}>
                  Perfil
                </Text>
                <SegmentedButtons
                  value={selectedProfile}
                  onValueChange={setSelectedProfile}
                  buttons={[
                    { value: '1', label: 'Comunidad', icon: 'account-group' },
                    { value: '2', label: 'Estudiante', icon: 'school' },
                  ]}
                  style={styles.segmentedButtons}
                  disabled={loading}
                />

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  icon="login"
                >
                  Iniciar Sesión
                </Button>

                {biometricAvailable && hasCredentials && (
                  <>
                    <View style={styles.dividerContainer}>
                      <Divider style={styles.divider} />
                      <Text style={styles.dividerText}>O</Text>
                      <Divider style={styles.divider} />
                    </View>

                    <View style={styles.biometricContainer}>
                      <Text variant="bodyMedium" style={styles.biometricLabel}>
                        Iniciar sesión con huella dactilar
                      </Text>
                      <IconButton
                        icon="fingerprint"
                        size={48}
                        iconColor={theme.colors.primary}
                        style={styles.biometricButton}
                        onPress={handleBiometricLogin}
                        disabled={loading}
                      />
                    </View>
                  </>
                )}
              </Card.Content>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        action={{
          label: 'Cerrar',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>

      <Portal>
        <Dialog 
          visible={biometricDialogVisible} 
          onDismiss={handleSkipBiometric}
          style={styles.dialog}
        >
          <Dialog.Icon icon="fingerprint" size={60} />
          <Dialog.Title style={styles.dialogTitle}>
            Habilitar Autenticación Biométrica
          </Dialog.Title>
          <Dialog.Content>
            <Paragraph style={styles.dialogText}>
              ¿Deseas habilitar el inicio de sesión con huella dactilar para acceder más rápidamente en el futuro?
            </Paragraph>
            <Paragraph style={styles.dialogSubtext}>
              Tus credenciales se guardarán de forma segura en tu dispositivo.
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleSkipBiometric}>
              Ahora no
            </Button>
            <Button 
              mode="contained" 
              onPress={handleEnableBiometric}
              style={styles.dialogButton}
            >
              Habilitar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  profileLabel: {
    marginTop: 8,
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 24,
  },
  button: {
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#666',
  },
  biometricContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  biometricLabel: {
    marginBottom: 8,
    color: '#666',
  },
  biometricButton: {
    margin: 0,
  },
  dialog: {
    borderRadius: 16,
  },
  dialogTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dialogText: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 8,
  },
  dialogSubtext: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
  },
  dialogButton: {
    marginLeft: 8,
  },
});

export default LoginScreen;
