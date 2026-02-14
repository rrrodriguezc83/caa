import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Image,
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
              {/* Header / Logo Section */}
              <View style={styles.header}>
                <View style={styles.logoCircle}>
                  <Image
                    source={require('../assets/icon.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
                <Text variant="headlineMedium" style={styles.welcomeTitle}>
                  Bienvenido
                </Text>
                <Text variant="bodyMedium" style={styles.welcomeSubtitle}>
                  Ingresa a tu portal educativo
                </Text>
              </View>

              <Card.Content style={styles.cardContent}>
                {/* Profile Selector */}
                <View style={styles.profileSection}>
                  <Text variant="labelSmall" style={styles.profileSectionLabel}>
                    SELECCIONA TU PERFIL
                  </Text>
                  <View style={styles.segmentedButtonsContainer}>
                    <SegmentedButtons
                      value={selectedProfile}
                      onValueChange={setSelectedProfile}
                      buttons={[
                        { 
                          value: '1', 
                          label: 'Comunidad', 
                          icon: 'account-group',
                          style: styles.segmentButton,
                          labelStyle: selectedProfile === '1' ? styles.segmentLabelActive : styles.segmentLabelInactive,
                        },
                        { 
                          value: '2', 
                          label: 'Estudiante', 
                          icon: 'book-open-variant',
                          style: styles.segmentButton,
                          labelStyle: selectedProfile === '2' ? styles.segmentLabelActive : styles.segmentLabelInactive,
                        },
                      ]}
                      style={styles.segmentedButtons}
                      theme={{
                        colors: {
                          secondaryContainer: '#FFFFFF',
                          onSecondaryContainer: '#002c5d',
                          onSurface: 'rgba(34, 22, 16, 0.5)',
                        }
                      }}
                      disabled={loading}
                    />
                  </View>
                </View>

                {/* Input Fields */}
                <View style={styles.inputsContainer}>
                  <View style={styles.inputWrapper}>
                    <Text variant="labelMedium" style={styles.inputLabel}>
                      Usuario
                    </Text>
                    <TextInput
                      value={username}
                      onChangeText={setUsername}
                      mode="flat"
                      autoCapitalize="none"
                      autoCorrect={false}
                      disabled={loading}
                      style={styles.input}
                      underlineStyle={styles.inputUnderline}
                      left={<TextInput.Icon icon="account" iconColor="rgba(34, 22, 16, 0.4)" />}
                      placeholder="nombre.usuario"
                      placeholderTextColor="rgba(34, 22, 16, 0.3)"
                      theme={{
                        colors: {
                          primary: '#002c5d',
                          onSurface: '#221610',
                          onSurfaceVariant: 'rgba(34, 22, 16, 0.4)',
                        }
                      }}
                    />
                  </View>

                  <View style={styles.inputWrapper}>
                    <Text variant="labelMedium" style={styles.inputLabel}>
                      Contraseña
                    </Text>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      mode="flat"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      disabled={loading}
                      style={styles.input}
                      underlineStyle={styles.inputUnderline}
                      left={<TextInput.Icon icon="lock" iconColor="rgba(34, 22, 16, 0.4)" />}
                      right={
                        <TextInput.Icon 
                          icon={showPassword ? 'eye-off' : 'eye'} 
                          iconColor="rgba(34, 22, 16, 0.4)"
                          onPress={() => setShowPassword(!showPassword)}
                        />
                      }
                      placeholder="••••••••"
                      placeholderTextColor="rgba(34, 22, 16, 0.3)"
                      theme={{
                        colors: {
                          primary: '#002c5d',
                          onSurface: '#221610',
                          onSurfaceVariant: 'rgba(34, 22, 16, 0.4)',
                        }
                      }}
                    />
                  </View>
                </View>

                {/* Forgot password */}
                <View style={styles.forgotPasswordContainer}>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text variant="bodySmall" style={styles.forgotPasswordText}>
                      ¿Olvidaste tu contraseña?
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Main Button */}
                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  buttonColor="#002c5d"
                >
                  Iniciar Sesión
                </Button>

                {/* Biometric Section */}
                {biometricAvailable && hasCredentials && (
                  <View style={styles.biometricSection}>
                    <View style={styles.dividerContainer}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>O ENTRA CON</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity 
                      style={styles.biometricButton}
                      onPress={handleBiometricLogin}
                      disabled={loading}
                      activeOpacity={0.7}
                    >
                      <View style={styles.biometricIconCircle}>
                        <IconButton
                          icon="fingerprint"
                          size={32}
                          iconColor="#002c5d"
                          style={styles.biometricIcon}
                        />
                      </View>
                      <Text variant="bodySmall" style={styles.biometricLabel}>
                        Huella Digital
                      </Text>
                    </TouchableOpacity>
                  </View>
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
    backgroundColor: '#f8f6f6',
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
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 44, 93, 0.1)',
  },
  header: {
    height: 192,
    backgroundColor: '#002c5d',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  welcomeTitle: {
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  cardContent: {
    paddingTop: 24,
    paddingBottom: 24,
  },
  profileSection: {
    marginBottom: 24,
  },
  profileSectionLabel: {
    color: 'rgba(34, 22, 16, 0.4)',
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  segmentedButtonsContainer: {
    backgroundColor: '#f8f6f6',
    padding: 4,
    borderRadius: 16,
  },
  segmentedButtons: {
    backgroundColor: 'transparent',
  },
  segmentButton: {
    borderRadius: 12,
    borderWidth: 0,
  },
  segmentLabelActive: {
    fontWeight: '600',
    fontSize: 14,
    color: '#002c5d',
  },
  segmentLabelInactive: {
    fontWeight: '600',
    fontSize: 14,
    color: 'rgba(34, 22, 16, 0.5)',
  },
  inputsContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#221610',
    fontWeight: '500',
    marginBottom: 6,
    marginLeft: 4,
    opacity: 0.8,
  },
  input: {
    backgroundColor: '#f8f6f6',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 4,
    height: 56,
  },
  inputUnderline: {
    display: 'none',
  },
  forgotPasswordContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  forgotPasswordText: {
    color: '#002c5d',
    fontWeight: '600',
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    shadowColor: '#002c5d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  biometricSection: {
    paddingTop: 16,
    alignItems: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(34, 22, 16, 0.1)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(34, 22, 16, 0.4)',
    letterSpacing: 1.5,
  },
  biometricButton: {
    alignItems: 'center',
    marginTop: 8,
  },
  biometricIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(0, 44, 93, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  biometricIcon: {
    margin: 0,
  },
  biometricLabel: {
    color: 'rgba(34, 22, 16, 0.6)',
    fontWeight: '500',
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
