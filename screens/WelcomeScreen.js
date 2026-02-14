import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Dimensions,
  StatusBar,
  Animated,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Appbar, 
  Text, 
  ActivityIndicator, 
  Card, 
  Drawer,
  Snackbar,
  useTheme,
  Avatar,
  Divider,
  Button,
  List,
  Badge,
  IconButton,
} from 'react-native-paper';
import RenderHTML from 'react-native-render-html';
import { getInfo, getMain, clearSession, getInfoStudent, getListWorks, getListReminders } from '../services/authService';

const { width } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [mainContent, setMainContent] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [expandedNotifications, setExpandedNotifications] = useState({});
  const [notificationsCardExpanded, setNotificationsCardExpanded] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [activeDrawerItem, setActiveDrawerItem] = useState('home');
  
  // Estados para datos de agenda virtual
  const [studentInfo, setStudentInfo] = useState(null); // {id_course, course}
  const [worksList, setWorksList] = useState(null); // Lista de trabajos por mes/día
  const [remindersList, setRemindersList] = useState(null); // Lista de recordatorios por mes/día
  const [expandedTodayItems, setExpandedTodayItems] = useState({}); // Items expandidos en "Para hoy"
  const [otrosExpanded, setOtrosExpanded] = useState(false); // Controla si la sección "Otros" está expandida
  
  // Animación para el drawer
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Función para transformar texto plano con saltos de línea a HTML
  const transformTextToHtml = (text) => {
    if (!text) return '<p>Sin descripción</p>';
    
    // Normalizar caracteres escapados
    let htmlText = text.replace(/\\"/g, '"');  // Reemplazar \" por "
    htmlText = htmlText.replace(/\\'/g, "'");  // Reemplazar \' por '
    
    // Eliminar estilos CSS no soportados en React Native
    htmlText = htmlText.replace(/border-collapse\s*:\s*collapse\s*;?/gi, '');
    
    // Reemplazar saltos de línea \n por <br>
    htmlText = htmlText.replace(/\n/g, '<br>');
    
    // Verificar si el texto ya contiene etiquetas HTML
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(htmlText);
    
    // Si no tiene etiquetas HTML, envolver en un párrafo
    if (!hasHtmlTags) {
      htmlText = `<p>${htmlText}</p>`;
    }
    
    return htmlText;
  };

  // Función para obtener actividades y recordatorios de hoy
  const getTodayItems = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Mes con formato 01, 02, etc.
    const day = String(today.getDate()-1).padStart(2, '0'); // Día con formato 01, 02, etc.
    
    const items = [];
    
    // Buscar actividades en worksList
    if (worksList && worksList[month] && worksList[month][day]) {
      const todayWorks = worksList[month][day];
      todayWorks.forEach(work => {
        items.push({
          type: 'work',
          subject: work.subject,
          description: work.description,
          teacher: work.name_teacher,
          id: work.id_work,
        });
      });
    }
    
    // Buscar recordatorios en remindersList
    if (remindersList && remindersList[month] && remindersList[month][day]) {
      const todayReminders = remindersList[month][day];
      todayReminders.forEach(reminder => {
        items.push({
          type: 'reminder',
          description: reminder.description,
          id: reminder.id_reminder,
        });
      });
    }
    
    return items;
  };

  // Función para alternar el estado expandido de un item de hoy
  const toggleTodayItem = (itemKey) => {
    setExpandedTodayItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  // Función para procesar el texto de notificación
  const processNotification = (notifyText) => {
    try {
      // Sanitizar: eliminar \n y \t
      let sanitized = notifyText.replace(/\n/g, '').replace(/\t/g, '');
      
      // Tokenizar por /
      const tokens = sanitized.split('/');
      
      // Limpiar tema: eliminar la palabra "Tema:" (case insensitive)
      let tema = tokens[1] || '';
      tema = tema.replace(/^\s*tema:\s*/i, '').trim();
      
      // Limpiar mensaje: eliminar la palabra "Mensaje" (case insensitive)
      let mensaje = tokens[2] || '';
      mensaje = mensaje.replace(/^\s*mensaje\s*/i, '').trim();
      
      // Limpiar respuesta: eliminar la palabra "Respuesta:" (case insensitive)
      let respuesta = tokens[3] || '';
      respuesta = respuesta.replace(/^\s*respuesta:\s*/i, '').trim();
      
      // Extraer componentes según las reglas
      return {
        id: tokens[0] || '',
        tema: tema,
        mensaje: mensaje,
        respuesta: respuesta,
        asunto: tokens[4] || '',
        respuesta2: tokens[5] || '',
      };
    } catch (error) {
      console.error('Error al procesar notificación:', error);
      return null;
    }
  };

  // Función para consumir el servicio de notificaciones
  const fetchNotifications = async () => {
    try {
      const formData = new FormData();
      formData.append('base', 'caa');
      formData.append('param', 'getNotifys');

      const response = await fetch(
        'https://www.comunidadvirtualcaa.co/controller/cont.php',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      
      if (data.code === 200 && data.response) {
        // Validar si la respuesta es [false] (sin notificaciones)
        if (Array.isArray(data.response) && data.response.length === 1 && data.response[0] === false) {
          console.log('No hay notificaciones disponibles');
          setNotifications([]);
          return;
        }
        
        console.log('Notificaciones recibidas:', data.response.length);
        
        // Procesar cada notificación
        const processedNotifications = data.response
          .filter(item => item && item.notify) // Filtrar items inválidos
          .map(item => {
            const processed = processNotification(item.notify);
            if (processed) {
              // Agregar el tipo de notificación
              processed.type = item.type || '';
              processed.rawNotify = item.notify || '';
            }
            return processed;
          })
          .filter(notification => notification !== null);
        
        setNotifications(processedNotifications);
        console.log('Notificaciones procesadas:', processedNotifications.length);
      } else {
        console.log('No se recibieron notificaciones');
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  };

  // Función para alternar el estado expandido de una notificación
  const toggleNotification = (index) => {
    setExpandedNotifications(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Función para manejar el botón "Enterado"
  const handleEnterado = async (notification, index) => {
    try {
      const asuntoValue = notification.asunto;
      
      // Verificar si asunto es diferente de 2 o 6
      if (asuntoValue !== '2' && asuntoValue !== '6') {
        console.log('Enviando confirmación al servidor...');
        
        const formData = new FormData();
        formData.append('param', 'submit_nivel_satisfactorio');
        formData.append('base', 'caa');
        formData.append('codigo', notification.id);
        formData.append('nivel', '0');
        formData.append('coment', 'null');

        const response = await fetch(
          'https://www.comunidadvirtualcaa.co/Comunicaciones/controller/cont.php',
          {
            method: 'POST',
            body: formData,
          }
        );

        const data = await response.json();
        console.log('Respuesta del servidor:', data);
        
        if (data.code !== 200) {
          showSnackbar('Error al enviar confirmación');
          return;
        }
      }
      
      // Eliminar la notificación del estado (en ambos casos)
      setNotifications(prev => prev.filter((_, i) => i !== index));
      
      // Limpiar el estado expandido de esta notificación
      setExpandedNotifications(prev => {
        const newState = { ...prev };
        delete newState[index];
        return newState;
      });
      
      showSnackbar('Notificación marcada como leída');
    } catch (error) {
      console.error('Error al procesar enterado:', error);
      showSnackbar('Error al procesar la notificación');
    }
  };

  // Función para convertir base64 a URI de imagen
  const getImageUri = (foto) => {
    if (!foto) return null;
    
    // Si ya tiene el prefijo data:image, retornarlo tal cual
    if (foto.startsWith('data:image')) {
      return foto;
    }
    
    // Si es base64 sin prefijo, agregar el prefijo
    // Asumimos que es JPEG por defecto, pero podría ser PNG
    return `data:image/jpeg;base64,${foto}`;
  };

  // Función para abrir el drawer con animación
  const openDrawer = () => {
    setModalVisible(true);
    setDrawerVisible(true);
  };

  // Función para cerrar el drawer con animación
  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  // Efecto para animar el drawer
  useEffect(() => {
    if (drawerVisible) {
      // Resetear posición inicial antes de animar
      slideAnim.setValue(-300);
      overlayOpacity.setValue(0);
      
      // Animar entrada
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      // Animar salida
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Ocultar el modal después de que termine la animación
        setModalVisible(false);
      });
    }
  }, [drawerVisible, modalVisible, slideAnim, overlayOpacity]);

  useEffect(() => {
    // Llamar a los servicios al cargar la pantalla
    const fetchData = async () => {
      try {
        // Primero obtener información del usuario
        console.log('Cargando información del usuario...');
        const infoResponse = await getInfo();
        
        if (infoResponse.code === 200 && infoResponse.response) {
          const userData = infoResponse.response[0];
          
          if (userData) {
            setUserInfo(userData);
            
            // Log de la información del usuario
            console.log('=== Información del usuario cargada ===');
            console.log('ID:', userData.ID);
            console.log('NOMBRE:', userData.NOMBRE);
            console.log('PERFIL:', userData.PERFIL);
            console.log('TIPO_USUARIO:', userData.TIPO_USUARIO);
            console.log('CURSO:', userData.CURSO);
            console.log('GRADO:', userData.GRADO);
            console.log('última fecha ingreso:', userData.ultima_fecha_ing);
            if (userData.FOTO) {
              console.log('FOTO (primeros 100 caracteres):', userData.FOTO.substring(0, 10));
              console.log('FOTO inicia con data:image?', userData.FOTO.startsWith('data:image'));
            } else {
              console.log('FOTO: No disponible');
            }
            console.log('=====================================');
          } else {
            showSnackbar('No se recibió información del usuario');
          }
        } else {
          showSnackbar('No se pudo obtener la información del usuario');
        }

        // Después obtener contenido principal
        console.log('Cargando contenido principal...');
        const mainResponse = await getMain();
        
        if (mainResponse.code === 200) {
          setMainContent(mainResponse.response);
          console.log('Contenido principal cargado exitosamente');
          
          // Log de módulos (solo id y module)
          if (Array.isArray(mainResponse.response)) {
            console.log('=== Módulos disponibles ===');
            mainResponse.response.forEach((item, index) => {
              console.log(`[${index}] id: ${item.id || item.ID}, module: ${item.module}`);
            });
            console.log('==========================');
          }
        } else {
          console.log('No se pudo obtener el contenido principal');
        }

        // Cargar notificaciones
        await fetchNotifications();

        // Cargar información del estudiante y agenda virtual
        console.log('Cargando información del estudiante...');
        const studentResponse = await getInfoStudent();
        
        if (studentResponse.code === 200 && studentResponse.response) {
          const studentData = studentResponse.response;
          setStudentInfo(studentData);
          
          console.log('=== Información del estudiante ===');
          console.log('id_course:', studentData.id_course);
          console.log('course:', studentData.course);
          console.log('==================================');
          
          // Con el id_course, cargar trabajos y recordatorios
          const idCourse = studentData.id_course;
          
          // Cargar lista de trabajos
          console.log('Cargando lista de trabajos...');
          const worksResponse = await getListWorks(idCourse);
          
          if (worksResponse.code === 200 && worksResponse.response) {
            setWorksList(worksResponse.response);
            console.log('Lista de trabajos cargada exitosamente');
          } else {
            console.log('No se pudo obtener la lista de trabajos');
          }
          
          // Cargar lista de recordatorios
          console.log('Cargando lista de recordatorios...');
          const remindersResponse = await getListReminders(idCourse);
          
          if (remindersResponse.code === 200 && remindersResponse.response) {
            setRemindersList(remindersResponse.response);
            console.log('Lista de recordatorios cargada exitosamente');
          } else {
            console.log('No se pudo obtener la lista de recordatorios');
          }
        } else {
          console.log('No se pudo obtener información del estudiante');
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        showSnackbar('No se pudo cargar la información');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Resetear el item activo a "home" cada vez que se vuelva a esta pantalla
  useFocusEffect(
    useCallback(() => {
      setActiveDrawerItem('home');
    }, [])
  );

  const handleMenuPress = (item, label) => {
    setActiveDrawerItem(item);
    closeDrawer();
    
    // Si es "home", no navegar, solo quedarse en la pantalla actual
    if (item === 'home') {
      showSnackbar('Estás en Home');
      return;
    }
    
    // Navegación específica según el módulo
    const labelLower = (label || '').toLowerCase();
    
    if (labelLower === 'agenda virtual') {
      navigation.navigate('AgendaVirtual');
      return;
    }
    
    if (labelLower === 'enfermería') {
      navigation.navigate('Enfermeria');
      return;
    }
    
    if (labelLower === 'circulares') {
      navigation.navigate('Circulares');
      return;
    }
    
    // Navegar a la pantalla genérica del módulo
    navigation.navigate('Module', {
      moduleName: label,
      moduleId: item,
    });
  };

  // Función para codificar en base64 (compatible con React Native)
  const encodeBase64 = (str) => {
    // En React Native/Expo, btoa está disponible globalmente
    if (typeof btoa !== 'undefined') {
      return btoa(str);
    }
    // Fallback manual si btoa no está disponible
    return Buffer.from(str).toString('base64');
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      closeDrawer();
      setLoading(true);
      
      console.log('Cerrando sesión...');
      
      // Codificar "false" en base64
      const falseBase64 = encodeBase64('false');
      
      // Preparar parámetros
      const formData = new FormData();
      formData.append('base', 'comunidad');
      formData.append('param', 'login');
      formData.append('user', falseBase64);
      formData.append('pass', falseBase64);
      formData.append('type_session', 'false');
      
      // Consumir servicio de logout
      const response = await fetch(
        'https://www.comunidadvirtualcaa.co/controller/cont.php',
        {
          method: 'POST',
          body: formData,
        }
      );
      
      const data = await response.json();
      console.log('Respuesta de logout:', data);
      
      // Limpiar sesión y cookies
      clearSession();
      
      // Navegar al login
      navigation.replace('Login');
      
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      showSnackbar('Error al cerrar sesión');
      setLoading(false);
    }
  };

  // Función para obtener el ícono según el módulo
  const getModuleIcon = (module) => {
    const iconMap = {
      'deportes': 'basketball',                    // ✓ Existe en Material Design Icons
      'inicio': 'home',                            // ✓ Existe
      'extra escolares': 'star',                   // ✓ Existe
      'circulares': 'email-newsletter',            // ✓ Existe
      'académico': 'book-open-variant',            // ✓ Existe
      'cartera': 'wallet',                         // ✓ Existe
      'matrículas': 'file-document-edit',          // ✓ Corregido (document-edit no existe)
      'información': 'information',                // ✓ Existe
      'enfermería': 'stethoscope',                 // ✓ Existe
      'cambio de clave': 'key-variant',            // ✓ Existe
      'camdio de clave': 'key-variant',            // ✓ Mantenido por si viene con typo del servidor
      'agenda virtual': 'laptop',                  // ✓ Existe
      'planeación ': 'clipboard-list',              // ✓ Existe
      'comunicaciones': 'forum',                   // ✓ Existe
      'calendario curricular': 'calendar-month',   // ✓ Existe
      'menú escolar': 'food',                      // ✓ Existe
      'entrevista': 'chat',                        // ✓ Existe
      'ayuda': 'help-circle',                      // ✓ Existe
    };
    
    const moduleLower = (module || '').toLowerCase();
    return iconMap[moduleLower] || 'circle-medium';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyLarge" style={styles.loadingText}>
          Cargando información...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      {/* App Bar Material Design */}
      <Appbar.Header 
        elevated 
        style={styles.appBar}
        theme={{
          colors: {
            onSurface: '#FFFFFF',
            onSurfaceVariant: '#FFFFFF',
          }
        }}
      >
        <Appbar.Action icon="menu" onPress={openDrawer} color="#FFFFFF" />
        <Appbar.Content title="Comunidad Virtual" titleStyle={styles.appBarTitle} />
      </Appbar.Header>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card único de Notificaciones */}
        {notifications.length > 0 && (
          <Card style={styles.contentCard} elevation={3}>
            <Card.Title 
              title="Notificaciones" 
              titleStyle={styles.cardTitle}
              left={(props) => (
                <View style={styles.iconBadgeContainer}>
                  <Avatar.Icon {...props} icon="bell" size={40} style={styles.cardIcon} />
                  <Badge style={styles.notificationBadge} size={24}>
                    {notifications.length}
                  </Badge>
                </View>
              )}
              right={(props) => (
                <IconButton
                  {...props}
                  icon={notificationsCardExpanded ? "chevron-up" : "chevron-down"}
                  onPress={() => setNotificationsCardExpanded(!notificationsCardExpanded)}
                />
              )}
            />
            {notificationsCardExpanded && (
              <Card.Content>
                <List.Section>
                  {notifications.map((notification, index) => {
                    const isExpanded = expandedNotifications[index] || false;
                    
                    // Si el tipo es "Notice" o "Diagnostic", mostrar todo el contenido directamente
                    if (notification.type === 'Notice' || notification.type === 'Diagnostic') {
                      // Preparar el texto con prefijo si es Diagnostic
                      const displayText = notification.type === 'Diagnostic' 
                        ? `Diagnóstica el día: ${notification.rawNotify || 'Sin contenido disponible'}`
                        : (notification.rawNotify || 'Sin contenido disponible');
                      
                      return (
                        <View key={`notification-${index}`} style={styles.noticeContainer}>
                          <View style={styles.noticeHeader}>
                            <List.Icon icon="information" color="#1976D2" />
                            <Text variant="bodyMedium" style={styles.noticeText}>
                              {displayText}
                            </Text>
                          </View>
                        </View>
                      );
                    }
                    
                    // Para otros tipos, mostrar el acordeón expandible
                    return (
                      <List.Accordion
                        key={`notification-${index}`}
                        title={notification.tema}
                        titleStyle={styles.accordionTitle}
                        titleNumberOfLines={2}
                        expanded={isExpanded}
                        onPress={() => toggleNotification(index)}
                        style={styles.accordion}
                        left={props => <List.Icon {...props} icon="email" color="#1976D2" />}
                      >
                        <View style={styles.notificationDetails}>
                          <Text variant="bodyMedium" style={styles.notificationLabel}>
                            Tema:
                          </Text>
                          <Text variant="bodyMedium" style={styles.cardText}>
                            {notification.tema}
                          </Text>
                          
                          <Divider style={styles.notificationDivider} />
                          
                          <Text variant="bodyMedium" style={styles.notificationLabel}>
                            Mensaje:
                          </Text>
                          <Text variant="bodyMedium" style={styles.cardText}>
                            {notification.mensaje}
                          </Text>
                          
                          <Divider style={styles.notificationDivider} />
                          
                          <Text variant="bodyMedium" style={styles.notificationLabel}>
                            Respuesta:
                          </Text>
                          <Text variant="bodyMedium" style={styles.cardText}>
                            {notification.respuesta}
                          </Text>
                          
                          <Divider style={styles.footerDivider} />
                          
                          <View style={styles.buttonContainer}>
                            <Button 
                              mode="contained" 
                              icon="check"
                              onPress={() => handleEnterado(notification, index)}
                              style={styles.enteradoButton}
                            >
                              Enterado
                            </Button>
                          </View>
                        </View>
                      </List.Accordion>
                    );
                  })}
                </List.Section>
              </Card.Content>
            )}
            {notificationsCardExpanded && (
              <>
                <Divider style={styles.cardFooterDivider} />
                <Card.Actions style={styles.cardFooterActions}>
                  <Button 
                    mode="contained" 
                    onPress={() => navigation.navigate('Circulares')}
                    style={styles.verTodoButton}
                    icon="eye"
                  >
                    Ver
                  </Button>
                </Card.Actions>
              </>
            )}
          </Card>
        )}

        {/* Card Para mañana... */}
        <Card style={styles.contentCard} elevation={3}>
          <Card.Title 
            title="Para hoy..." 
            titleStyle={styles.cardTitle}
            left={(props) => <Avatar.Icon {...props} icon="calendar-clock" size={40} style={styles.cardIcon} />}
          />
          <Card.Content>
            {(() => {
              const todayItems = getTodayItems();
              
              if (todayItems.length === 0) {
                return (
                  <Text variant="bodyMedium" style={styles.cardText}>
                    No hay actividades programadas para hoy.
                  </Text>
                );
              }
              
              // Separar trabajos y recordatorios
              const works = todayItems.filter(item => item.type === 'work');
              const reminders = todayItems.filter(item => item.type === 'reminder');
              
              return (
                <View>
                  {/* Mostrar trabajos primero */}
                  {works.map((work, index) => {
                    const itemKey = `work-${work.id}-${index}`;
                    const isExpanded = expandedTodayItems[itemKey] || false;
                    
                    return (
                      <TouchableOpacity 
                        key={itemKey} 
                        style={styles.todayItemContainer}
                        onPress={() => toggleTodayItem(itemKey)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.todayItemHeader}>
                          <Text variant="titleSmall" style={styles.todayItemSubject}>
                            {work.subject}
                          </Text>
                          <IconButton
                            icon={isExpanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            iconColor="#1976D2"
                            style={styles.todayItemChevron}
                          />
                        </View>
                        <View style={!isExpanded && styles.todayItemCollapsed}>
                          <RenderHTML
                            contentWidth={windowWidth - 64}
                            source={{ html: transformTextToHtml(work.description) }}
                            tagsStyles={{
                              body: {
                                color: '#01579B',
                                fontSize: 14,
                                lineHeight: 22,
                                margin: 0,
                                padding: 0,
                              },
                              p: {
                                margin: 0,
                                marginBottom: 4,
                              },
                              h1: { color: '#1976D2', fontSize: 18, marginBottom: 8 },
                              h2: { color: '#1976D2', fontSize: 16, marginBottom: 8 },
                              h3: { color: '#1976D2', fontSize: 14, marginBottom: 8 },
                              li: { marginBottom: 4 },
                              strong: { fontWeight: 'bold' },
                              em: { fontStyle: 'italic' },
                            }}
                          />
                          {isExpanded && (
                            <Text variant="bodySmall" style={styles.todayItemTeacher}>
                              {work.teacher}
                            </Text>
                          )}
                        </View>
                        {index < works.length - 1 || reminders.length > 0 ? (
                          <Divider style={styles.todayItemDivider} />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                  
                  {/* Mostrar recordatorios con título "Otros" */}
                  {reminders.length > 0 && (
                    <View>
                      <TouchableOpacity 
                        style={styles.todayOtrosHeader}
                        onPress={() => setOtrosExpanded(!otrosExpanded)}
                        activeOpacity={0.7}
                      >
                        <Text variant="titleMedium" style={styles.todayOtrosTitle}>
                          Otros
                        </Text>
                        <IconButton
                          icon={otrosExpanded ? "chevron-up" : "chevron-down"}
                          size={20}
                          iconColor="#1976D2"
                          style={styles.todayItemChevron}
                        />
                      </TouchableOpacity>
                      {reminders.map((reminder, index) => {
                        const itemKey = `reminder-${reminder.id}-${index}`;
                        
                        return (
                          <View 
                            key={itemKey} 
                            style={styles.todayReminderContainer}
                          >
                            <View style={!otrosExpanded && styles.todayItemCollapsed}>
                              <RenderHTML
                                contentWidth={windowWidth - 64}
                                source={{ html: transformTextToHtml(reminder.description) }}
                                tagsStyles={{
                                  body: {
                                    color: '#01579B',
                                    fontSize: 14,
                                    lineHeight: 22,
                                    margin: 0,
                                    padding: 0,
                                  },
                                  p: {
                                    margin: 0,
                                    marginBottom: 8,
                                  },
                                  h1: { color: '#1976D2', fontSize: 18, marginBottom: 8 },
                                  h2: { color: '#1976D2', fontSize: 16, marginBottom: 8 },
                                  h3: { color: '#1976D2', fontSize: 14, marginBottom: 8 },
                                  li: { marginBottom: 4 },
                                  strong: { fontWeight: 'bold' },
                                  em: { fontStyle: 'italic' },
                                }}
                              />
                            </View>
                            {index < reminders.length - 1 ? (
                              <Divider style={styles.todayItemDivider} />
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })()}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Navigation Drawer Material Design */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <Animated.View 
              style={[
                styles.drawerOverlay,
                { opacity: overlayOpacity }
              ]}
            />
          </TouchableWithoutFeedback>
          
          <Animated.View 
            style={[
              styles.drawerContainer,
              { transform: [{ translateX: slideAnim }] }
            ]}
          >
            {/* Sección de perfil - FIJA */}
            <View style={styles.profileSection}>
              <View style={styles.profileHeader}>
                {userInfo?.FOTO && getImageUri(userInfo.FOTO) ? (
                  <Avatar.Image 
                    size={64} 
                    source={{ uri: getImageUri(userInfo.FOTO) }}
                    style={styles.avatar}
                  />
                ) : (
                  <Avatar.Text 
                    size={64} 
                    label={userInfo?.NOMBRE ? userInfo.NOMBRE.substring(0, 2).toUpperCase() : 'US'}
                    style={styles.avatar}
                  />
                )}
                <View style={styles.profileInfo}>
                  <Text variant="titleMedium" style={styles.profileName} numberOfLines={2}>
                    {userInfo?.NOMBRE?.replace('\n', ' ') || 'Usuario'}
                  </Text>
                  <Text variant="bodySmall" style={styles.profileRole}>
                    {userInfo?.PERFIL || 'Estudiante'}
                  </Text>
                  {userInfo?.CURSO && (
                    <Text variant="bodySmall" style={styles.profileCourse}>
                      {userInfo.CURSO.replace('\n', ' ')}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            <Divider />

            {/* Items del menú - SCROLLABLE */}
            <ScrollView 
              style={styles.menuScrollView}
              showsVerticalScrollIndicator={true}
              bounces={false}
            >
              <Drawer.Section style={styles.drawerSection}>
                {/* Item fijo de Home */}
                <Drawer.Item
                  icon="home"
                  label="Home"
                  active={activeDrawerItem === 'home'}
                  onPress={() => handleMenuPress('home', 'Home')}
                  style={activeDrawerItem === 'home' ? styles.activeDrawerItem : null}
                  labelStyle={activeDrawerItem === 'home' ? styles.activeDrawerLabel : null}
                  theme={activeDrawerItem === 'home' ? {
                    colors: {
                      onSurfaceVariant: '#FFFFFF',
                      onSecondaryContainer: '#FFFFFF',
                      onSurface: '#FFFFFF',
                      text: '#FFFFFF',
                    }
                  } : undefined}
                />

                {/* Items dinámicos del menú */}
                {mainContent && Array.isArray(mainContent) && (
                  mainContent.map((item, index) => {
                    const itemId = item.id || item.ID || `item-${index}`;
                    const isActive = activeDrawerItem === itemId;
                    
                    return (
                      <Drawer.Item
                        key={itemId}
                        icon={getModuleIcon(item.module)}
                        label={item.module || 'Sin nombre'}
                        active={isActive}
                        onPress={() => handleMenuPress(itemId, item.module)}
                        style={isActive ? styles.activeDrawerItem : null}
                        labelStyle={isActive ? styles.activeDrawerLabel : null}
                        theme={isActive ? {
                          colors: {
                            onSurfaceVariant: '#FFFFFF',
                            onSecondaryContainer: '#FFFFFF',
                            onSurface: '#FFFFFF',
                            text: '#FFFFFF',
                          }
                        } : undefined}
                      />
                    );
                  })
                )}
              </Drawer.Section>
            </ScrollView>

            <Divider />

            {/* Botón de cerrar sesión - FIJO */}
            <View style={styles.logoutSection}>
              <Drawer.Item
                icon="logout"
                label="Cerrar sesión"
                onPress={handleLogout}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',  // Fondo blanco
  },
  appBar: {
    backgroundColor: '#1976D2',  // Azul principal
  },
  appBarTitle: {
    color: '#FFFFFF',  // Texto blanco
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',  // Fondo blanco
  },
  loadingText: {
    marginTop: 16,
    color: '#01579B',  // Texto azul oscuro
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',  // Fondo blanco
  },
  contentCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',  // Card blanca
    borderRadius: 12,
  },
  cardTitle: {
    color: '#1976D2',  // Título en azul principal
    fontWeight: 'bold',
  },
  cardIcon: {
    backgroundColor: '#BBDEFB',  // Fondo azul claro para el ícono
  },
  chevronIcon: {
    backgroundColor: 'transparent',  // Sin fondo para el chevron
  },
  iconBadgeContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#F44336',
  },
  cardFooterDivider: {
    backgroundColor: '#BBDEFB',
    marginTop: 8,
  },
  cardFooterActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  verTodoButton: {
    backgroundColor: '#1976D2',
  },
  cardText: {
    color: '#01579B',  // Texto azul oscuro
    lineHeight: 22,
  },
  cardSubtitle: {
    color: '#666',
    fontSize: 14,
  },
  notificationLabel: {
    color: '#1976D2',
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  notificationDivider: {
    marginVertical: 12,
    backgroundColor: '#BBDEFB',
  },
  footerDivider: {
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: '#BBDEFB',
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  enteradoButton: {
    backgroundColor: '#1976D2',
  },
  accordion: {
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
    borderRadius: 8,
  },
  noticeContainer: {
    backgroundColor: '#E3F2FD',
    marginBottom: 8,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1976D2',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  noticeText: {
    flex: 1,
    color: '#01579B',
    lineHeight: 22,
    paddingLeft: 8,
  },
  accordionTitle: {
    fontWeight: 'bold',
    color: '#01579B',
    fontSize: 14,
  },
  notificationDetails: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1976D2',
  },
  buttonContainer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  // Drawer styles
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.80,
    maxWidth: 320,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 8,
  },
  // Profile section styles
  profileSection: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#1976D2',
    borderWidth: 3,
    borderColor: '#BBDEFB',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontWeight: 'bold',
    color: '#01579B',
    marginBottom: 4,
  },
  profileRole: {
    color: '#666',
    marginBottom: 2,
  },
  profileCourse: {
    color: '#666',
  },
  // Drawer items styles
  menuScrollView: {
    flex: 1,
  },
  drawerSection: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  activeDrawerItem: {
    backgroundColor: '#1976D2',
    borderRadius: 24,
    marginHorizontal: 12,
  },
  activeDrawerLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  logoutSection: {
    paddingVertical: 8,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  // Estilos para items de hoy
  todayItemContainer: {
    marginBottom: 12,
  },
  todayItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  todayItemChevron: {
    margin: 0,
    marginTop: -8,
  },
  todayItemSubject: {
    color: '#1976D2',
    fontWeight: 'bold',
    marginBottom: 4,
    flex: 1,
  },
  todayItemTeacher: {
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  todayItemDescription: {
    color: '#01579B',
    lineHeight: 22,
  },
  todayItemCollapsed: {
    maxHeight: 22,
    overflow: 'hidden',
  },
  todayItemDivider: {
    backgroundColor: '#BBDEFB',
    marginTop: 12,
  },
  todayOtrosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  todayOtrosTitle: {
    color: '#1976D2',
    fontWeight: 'bold',
    flex: 1,
  },
  todayReminderContainer: {
    marginBottom: 12,
  },
});

export default WelcomeScreen;
