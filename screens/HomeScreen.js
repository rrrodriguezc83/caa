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
import TestNotifyData from './TestNotify.json';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [mainContent, setMainContent] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [expandedNotifications, setExpandedNotifications] = useState({});
  const [notificationsCardExpanded, setNotificationsCardExpanded] = useState(false);
  const [circulares, setCirculares] = useState([]);
  const [pendingNotifys, setPendingNotifys] = useState([]);
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
  
  // Animación para el badge ping
  const badgePingAnim = useRef(new Animated.Value(1)).current;

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Función para convertir texto a formato capital (primera letra de cada palabra en mayúscula)
  const toCapitalCase = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Función para capitalizar solo la primera letra
  const capitalizeFirst = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
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
      let todayWorks = worksList[month][day];
      todayWorks = todayWorks.concat(worksList[month][day-3]);
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

  // Función para consumir el servicio de circulares
  const fetchCirculares = async () => {
    try {
      const formData = new FormData();
      formData.append('base', 'comunidad');
      formData.append('param', 'getNotices');
      formData.append('surveys', 'false');

      const response = await fetch(
        'https://www.comunidadvirtualcaa.co/Notices/controller/cont.php',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      console.log('Circulares recibidas:', data);

      if (data.code === 200 && data.response) {
        // Convertir el objeto de respuesta en un array
        const circularesArray = Object.keys(data.response)
          .filter(key => key !== 'keys') // Excluir el campo 'keys'
          .map(key => data.response[key]);
        
        setCirculares(circularesArray);
        console.log('Circulares procesadas:', circularesArray.length);
        
        // Test notify - Usar datos de TestNotify.json
        const testCircularesArray = Object.keys(TestNotifyData.response)
          .filter(key => key !== 'keys')
          .map(key => TestNotifyData.response[key]);
        
        // Filtrar circulares pendientes según criterios:
        // - type 2 - state 0
        // - type 1 - state 0
        // - type 1 - state 1 - auth vacío
        //const pendingNotifysArray = circularesArray.filter(circular => {
        const pendingNotifysArray = testCircularesArray.filter(circular => {
          const type = circular.type;
          const state = circular.state;
          const auth = (circular.auth || '').trim();
          
          // type 2 - state 0
          if (type === '2' && state === '0') {
            return true;
          }
          
          // type 1 - state 0
          if (type === '1' && state === '0') {
            return true;
          }
          
          // type 1 - state 1 - auth vacío
          if (type === '1' && state === '1' && auth === '') {
            return true;
          }
          
          return false;
        });

        setPendingNotifys(pendingNotifysArray);
        console.log('Circulares pendientes (pendingNotifys):', pendingNotifysArray.length);
      } else {
        setCirculares([]);
        setPendingNotifys([]);
      }
    } catch (error) {
      console.error('Error al cargar circulares:', error);
      setCirculares([]);
      setPendingNotifys([]);
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

  // Animación del badge ping
  useEffect(() => {
    const pingAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(badgePingAnim, {
          toValue: 2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(badgePingAnim, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    
    if (pendingNotifys.length > 0) {
      pingAnimation.start();
    }
    
    return () => {
      pingAnimation.stop();
    };
  }, [pendingNotifys.length, badgePingAnim]);

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
        
        // Cargar circulares
        await fetchCirculares();

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
      <StatusBar barStyle="dark-content" backgroundColor="#f8f6f6" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer} style={styles.headerLeft}>
          <View style={styles.profileContainer}>
            {userInfo?.FOTO && getImageUri(userInfo.FOTO) ? (
              <Image 
                source={{ uri: getImageUri(userInfo.FOTO) }}
                style={styles.headerAvatar}
              />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <Text style={styles.headerAvatarText}>
                  {userInfo?.NOMBRE ? userInfo.NOMBRE.substring(0, 2).toUpperCase() : 'US'}
                </Text>
              </View>
            )}
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerWelcome}>BIENVENIDO</Text>
              <Text style={styles.headerName}>
                ¡Hola, {toCapitalCase(userInfo?.NOMBRE?.split(' ')[2] || 'Usuario')}!
              </Text>
            </View>
          </View>
        </TouchableOpacity>

      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card único de Notificaciones */}
        {pendingNotifys.length > 0 && (
          <Card style={styles.notificationsCard} elevation={1}>
            {/* Header de Notificaciones */}
            <View style={styles.notificationsHeader}>
              <View style={styles.notificationsHeaderLeft}>
                <View style={styles.notificationIconContainer}>
                  <Avatar.Icon icon="bell" size={40} style={styles.notificationIcon} color="#002c5d" />
                  {/* Badge animado */}
                  <View style={styles.badgeContainer}>
                    <Animated.View 
                      style={[
                        styles.badgePing,
                        {
                          transform: [{ scale: badgePingAnim }],
                          opacity: badgePingAnim.interpolate({
                            inputRange: [1, 2],
                            outputRange: [0.75, 0],
                          }),
                        }
                      ]} 
                    />
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{pendingNotifys.length}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.notificationsTitle}>Notificaciones</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Circulares')}>
                <Text style={styles.verTodoButtonText}>Ver todo</Text>
              </TouchableOpacity>
            </View>
            
            {/* Items de Notificaciones - Circulares Pendientes */}
            <View style={styles.notificationsItemsContainer}>
              {pendingNotifys.map((circular, index) => (
                <TouchableOpacity
                  key={`circular-${index}-${circular.circular}`}
                  style={[
                    styles.notificationItem,
                    index < pendingNotifys.length - 1 && styles.notificationItemBorder
                  ]}
                  onPress={() => navigation.navigate('DetalleCircular', { 
                    circular,
                    auth: circular.auth || ''
                  })}
                  activeOpacity={0.7}
                >
                  <View style={styles.notificationIconWrapper}>
                    <Avatar.Icon icon="email" size={24} style={styles.notificationItemIcon} color="rgba(0, 44, 93, 0.6)" />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationItemTitle}>
                      Circular {circular.circular}
                    </Text>
                    <Text style={styles.notificationItemDescription} numberOfLines={2}>
                      {circular.subject}
                    </Text>
                    <Text style={styles.notificationItemTimestamp}>
                      {circular.date_send}
                    </Text>
                  </View>
                  <Avatar.Icon 
                    icon="chevron-right" 
                    size={20} 
                    style={styles.notificationChevron}
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Card Works and Reminders */}
        <Card style={styles.todayScheduleCard} elevation={1}>
          <View style={styles.todayScheduleHeader}>
            <View style={styles.todayScheduleHeaderContent}>
              <View style={styles.todayScheduleIconContainer}>
                <Avatar.Icon icon="calendar-today" size={40} style={styles.todayScheduleIcon} color="#002c5d" />
              </View>
              <View>
                <Text style={styles.todayScheduleTitle}>Para hoy...</Text>
                <Text style={styles.todayScheduleSubtitle}>
                  {capitalizeFirst(new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }))}
                </Text>
              </View>
            </View>
          </View>
          <Card.Content style={styles.todayScheduleContent}>
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
                <View style={styles.timelineContainer}>
                  {/* Línea vertical del timeline */}
                  <View style={styles.timelineLine} />
                  
                  {/* Mostrar trabajos primero */}
                  {works.map((work, index) => {
                    const itemKey = `work-${work.id}-${index}`;
                    const isExpanded = expandedTodayItems[itemKey] || false;
                    
                    return (
                      <View key={itemKey} style={styles.todayScheduleItem}>
                        {/* Punto circular del timeline */}
                        <View style={styles.timelineDotContainer}>
                          <View style={styles.timelineDot}>
                            <View style={styles.timelineDotInner} />
                          </View>
                        </View>
                        
                        {/* Contenido del item */}
                        <TouchableOpacity 
                          style={styles.todayScheduleItemCard}
                          onPress={() => toggleTodayItem(itemKey)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.todayScheduleItemHeader}>
                            <View style={styles.todayScheduleItemLeft}>
                              <Text style={styles.todayScheduleItemTitle}>
                                {work.subject}
                              </Text>
                              <View style={styles.todayScheduleItemLocation}>
                                <Avatar.Icon icon="account" size={16} style={styles.locationIcon} color="#64748b" />
                                <Text style={styles.todayScheduleItemTeacher} numberOfLines={1}>
                                  {work.teacher}
                                </Text>
                              </View>
                            </View>
                            <IconButton
                              icon={isExpanded ? "chevron-up" : "chevron-down"}
                              size={20}
                              iconColor="#002c5d"
                              style={styles.todayScheduleItemChevron}
                            />
                          </View>
                          {isExpanded && (
                            <View style={styles.todayScheduleItemDescription}>
                              <RenderHTML
                                contentWidth={windowWidth - 96}
                                source={{ html: transformTextToHtml(work.description) }}
                                tagsStyles={{
                                  body: {
                                    color: '#64748b',
                                    fontSize: 12,
                                    lineHeight: 18,
                                    margin: 0,
                                    padding: 0,
                                  },
                                  p: {
                                    margin: 0,
                                    marginBottom: 4,
                                  },
                                  h1: { color: '#002c5d', fontSize: 14, marginBottom: 6 },
                                  h2: { color: '#002c5d', fontSize: 13, marginBottom: 6 },
                                  h3: { color: '#002c5d', fontSize: 12, marginBottom: 6 },
                                  li: { marginBottom: 3 },
                                  strong: { fontWeight: 'bold' },
                                  em: { fontStyle: 'italic' },
                                }}
                              />
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                  
                  {/* Mostrar recordatorios */}
                  {reminders.length > 0 && (
                    <>
                      {reminders.map((reminder, index) => {
                        const itemKey = `reminder-${reminder.id}-${index}`;
                        const isExpanded = expandedTodayItems[itemKey] || false;
                        
                        return (
                          <View key={itemKey} style={styles.todayScheduleItem}>
                            {/* Punto circular del timeline para recordatorios */}
                            <View style={styles.timelineDotContainer}>
                              <View style={styles.timelineDotReminder}>
                                <View style={styles.timelineDotInnerReminder} />
                              </View>
                            </View>
                            
                            {/* Contenido del recordatorio */}
                            <TouchableOpacity 
                              style={styles.todayScheduleReminderCard}
                              onPress={() => toggleTodayItem(itemKey)}
                              activeOpacity={0.7}
                            >
                              <View style={styles.todayScheduleItemHeader}>
                                <View style={styles.todayScheduleItemLeft}>
                                  <Text style={styles.todayScheduleReminderTitle}>
                                    Recordatorio
                                  </Text>
                                  <View style={!isExpanded && styles.todayItemCollapsed}>
                                    <RenderHTML
                                      contentWidth={windowWidth - 96}
                                      source={{ html: transformTextToHtml(reminder.description) }}
                                      tagsStyles={{
                                        body: {
                                          color: '#64748b',
                                          fontSize: 12,
                                          lineHeight: 18,
                                          margin: 0,
                                          padding: 0,
                                        },
                                        p: {
                                          margin: 0,
                                          marginBottom: 4,
                                        },
                                        h1: { color: '#002c5d', fontSize: 14, marginBottom: 6 },
                                        h2: { color: '#002c5d', fontSize: 13, marginBottom: 6 },
                                        h3: { color: '#002c5d', fontSize: 12, marginBottom: 6 },
                                        li: { marginBottom: 3 },
                                        strong: { fontWeight: 'bold' },
                                        em: { fontStyle: 'italic' },
                                      }}
                                    />
                                  </View>
                                </View>
                                <IconButton
                                  icon={isExpanded ? "chevron-up" : "chevron-down"}
                                  size={20}
                                  iconColor="#64748b"
                                  style={styles.todayScheduleItemChevron}
                                />
                              </View>
                            </TouchableOpacity>
                          </View>
                        );
                      })}
                    </>
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
                  style={activeDrawerItem === 'home' ? styles.activeDrawerItem : styles.inactiveDrawerItem}
                  labelStyle={activeDrawerItem === 'home' ? styles.activeDrawerLabel : styles.inactiveDrawerLabel}
                  theme={{
                    colors: {
                      onSurfaceVariant: activeDrawerItem === 'home' ? '#002c5d' : '#94a3b8',
                      onSecondaryContainer: activeDrawerItem === 'home' ? '#002c5d' : '#94a3b8',
                      primary: '#002c5d',
                    },
                  }}
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
                        style={isActive ? styles.activeDrawerItem : styles.inactiveDrawerItem}
                        labelStyle={isActive ? styles.activeDrawerLabel : styles.inactiveDrawerLabel}
                        theme={{
                          colors: {
                            onSurfaceVariant: isActive ? '#002c5d' : '#94a3b8',
                            onSecondaryContainer: isActive ? '#002c5d' : '#94a3b8',
                            primary: '#002c5d',
                          },
                        }}
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
                style={styles.logoutItem}
                labelStyle={styles.logoutLabel}
                theme={{
                  colors: {
                    onSurfaceVariant: '#dc2626',
                    onSecondaryContainer: '#dc2626',
                    primary: '#dc2626',
                  },
                }}
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
    backgroundColor: '#f8f6f6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(248, 246, 246, 0.95)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 44, 93, 0.1)',
  },
  headerLeft: {
    flex: 1,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(0, 44, 93, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#002c5d',
    borderWidth: 2,
    borderColor: 'rgba(0, 44, 93, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    fontWeight: 'bold',
  },
  headerTextContainer: {
    marginLeft: 0,
  },
  headerWelcome: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    color: '#002c5d',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerName: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    fontWeight: 'bold',
    color: '#221610',
    lineHeight: 24,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'rgba(0, 44, 93, 0.05)',
  },
  searchIcon: {
    backgroundColor: 'transparent',
    width: 24,
    height: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f6f6',
  },
  loadingText: {
    marginTop: 16,
    color: '#002c5d',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: '#f8f6f6',
  },
  contentCard: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 44, 93, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  // Estilos específicos para el card de notificaciones
  notificationsCard: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 44, 93, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  notificationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 44, 93, 0.05)',
  },
  notificationsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 44, 93, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationIcon: {
    backgroundColor: 'transparent',
    width: 40,
    height: 40,
  },
  badgeContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
  },
  badgePing: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.75)',
    opacity: 0.75,
  },
  badge: {
    position: 'relative',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    fontWeight: 'bold',
  },
  notificationsTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    fontWeight: 'bold',
    color: '#221610',
  },
  verTodoButtonText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    color: '#002c5d',
  },
  notificationsItemsContainer: {
    backgroundColor: '#FFFFFF',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 16,
    backgroundColor: '#FFFFFF',
  },
  notificationItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 44, 93, 0.05)',
  },
  notificationIconWrapper: {
    marginTop: 4,
  },
  notificationItemIcon: {
    backgroundColor: 'transparent',
    width: 20,
    height: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationItemTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    fontWeight: 'bold',
    color: '#221610',
    marginBottom: 4,
  },
  notificationItemDescription: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    marginTop: 4,
    lineHeight: 18,
  },
  notificationItemTimestamp: {
    fontSize: 10,
    fontFamily: 'Inter_400Regular',
    color: '#94a3b8',
    marginTop: 4,
  },
  notificationItemText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    lineHeight: 20,
  },
  notificationChevron: {
    backgroundColor: 'transparent',
    width: 20,
    height: 20,
    alignSelf: 'center',
  },
  notificationButtonContainer: {
    alignItems: 'flex-end',
    marginTop: 12,
  },
  notificationEnteradoButton: {
    backgroundColor: '#002c5d',
    borderRadius: 6,
  },
  cardTitle: {
    color: '#221610',
    fontFamily: 'Inter_700Bold',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cardIcon: {
    backgroundColor: 'rgba(0, 44, 93, 0.1)',
  },
  chevronIcon: {
    backgroundColor: 'transparent',
  },
  iconBadgeContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#dc2626',
    minWidth: 24,
    height: 24,
    borderRadius: 12,
  },
  cardFooterDivider: {
    backgroundColor: 'rgba(0, 44, 93, 0.05)',
    marginTop: 16,
    height: 1,
  },
  cardFooterActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  verTodoButton: {
    backgroundColor: '#002c5d',
    borderRadius: 8,
  },
  cardText: {
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    fontSize: 14,
  },
  cardSubtitle: {
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
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
    backgroundColor: '#f8f6f6',
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
    backgroundColor: '#f8f6f6',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    backgroundColor: '#002c5d',
    borderWidth: 2,
    borderColor: 'rgba(0, 44, 93, 0.2)',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontFamily: 'Inter_700Bold',
    fontWeight: 'bold',
    color: '#221610',
    marginBottom: 4,
    fontSize: 16,
  },
  profileRole: {
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    marginBottom: 2,
    fontSize: 14,
  },
  profileCourse: {
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    fontSize: 14,
  },
  // Drawer items styles
  menuScrollView: {
    flex: 1,
  },
  drawerSection: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  activeDrawerItem: {
    backgroundColor: '#e6ebf1',
    borderRadius: 12,
    marginHorizontal: 8,
    height: 48,
  },
  activeDrawerLabel: {
    color: '#002c5d',
    fontWeight: '600',
    fontSize: 16,
  },
  inactiveDrawerItem: {
    borderRadius: 12,
    marginHorizontal: 8,
    height: 48,
    backgroundColor: 'transparent',
  },
  inactiveDrawerLabel: {
    color: '#64748b',
    fontWeight: '500',
    fontSize: 16,
  },
  logoutSection: {
    paddingVertical: 8,
    paddingBottom: 16,
    backgroundColor: '#f8f6f6',
    paddingHorizontal: 8,
  },
  logoutItem: {
    borderRadius: 12,
    height: 56,
    backgroundColor: 'transparent',
  },
  logoutLabel: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 16,
  },
  // Estilos para "Para hoy..." card
  todayScheduleCard: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 44, 93, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  todayScheduleHeader: {
    padding: 16,
  },
  todayScheduleHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  todayScheduleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 44, 93, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayScheduleIcon: {
    backgroundColor: 'transparent',
    width: 40,
    height: 40,
  },
  todayScheduleTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    fontWeight: 'bold',
    color: '#221610',
    marginBottom: 2,
  },
  todayScheduleSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    textTransform: 'capitalize',
  },
  todayScheduleContent: {
    paddingTop: 8,
  },
  // Timeline styles
  timelineContainer: {
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 19,
    top: 8,
    bottom: 8,
    width: 2,
    backgroundColor: 'rgba(0, 44, 93, 0.1)',
  },
  todayScheduleItem: {
    position: 'relative',
    paddingLeft: 48,
    marginBottom: 24,
  },
  timelineDotContainer: {
    position: 'absolute',
    left: 0,
    top: 4,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 44, 93, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#002c5d',
  },
  timelineDotReminder: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotInnerReminder: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#94a3b8',
  },
  todayScheduleItemCard: {
    backgroundColor: 'rgba(0, 44, 93, 0.05)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 44, 93, 0.1)',
  },
  todayScheduleReminderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  todayScheduleItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  todayScheduleItemLeft: {
    flex: 1,
    marginRight: 8,
  },
  todayScheduleItemTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    fontWeight: 'bold',
    color: '#221610',
    marginBottom: 6,
  },
  todayScheduleReminderTitle: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    fontWeight: 'bold',
    color: '#64748b',
    marginBottom: 6,
  },
  todayScheduleItemLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  locationIcon: {
    backgroundColor: 'transparent',
    width: 16,
    height: 16,
  },
  todayScheduleItemTeacher: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
    flex: 1,
  },
  todayScheduleItemChevron: {
    margin: 0,
    marginTop: -8,
    marginRight: -8,
  },
  todayScheduleItemDescription: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 44, 93, 0.1)',
  },
  todayItemCollapsed: {
    maxHeight: 18,
    overflow: 'hidden',
  },
});

export default HomeScreen;
