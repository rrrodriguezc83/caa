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
  Appbar, Text, ActivityIndicator, Card, Drawer, Snackbar, useTheme,
  Avatar, Divider, Button, List, Badge, IconButton,
} from 'react-native-paper';
import RenderHTML from 'react-native-render-html';
import { container } from '../../../di/container';
import { toCapitalCase, capitalizeFirst, transformTextToHtml, getImageUri } from '../../../shared/utils/textHelpers';

const {
  authRepository, userRepository, studentRepository,
  circularRepository, notificationRepository,
} = container;

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
  const [studentInfo, setStudentInfo] = useState(null);
  const [worksList, setWorksList] = useState(null);
  const [remindersList, setRemindersList] = useState(null);
  const [expandedTodayItems, setExpandedTodayItems] = useState({});
  const [otrosExpanded, setOtrosExpanded] = useState(false);

  const slideAnim = useRef(new Animated.Value(-300)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const badgePingAnim = useRef(new Animated.Value(1)).current;

  const showSnackbar = (message) => { setSnackbarMessage(message); setSnackbarVisible(true); };

  const processNotification = (notifyText) => {
    try {
      let sanitized = notifyText.replace(/\n/g, '').replace(/\t/g, '');
      const tokens = sanitized.split('/');
      let tema = (tokens[1] || '').replace(/^\s*tema:\s*/i, '').trim();
      let mensaje = (tokens[2] || '').replace(/^\s*mensaje\s*/i, '').trim();
      let respuesta = (tokens[3] || '').replace(/^\s*respuesta:\s*/i, '').trim();
      return { id: tokens[0] || '', tema, mensaje, respuesta, asunto: tokens[4] || '', respuesta2: tokens[5] || '' };
    } catch (error) {
      console.error('Error al procesar notificación:', error);
      return null;
    }
  };

  const getTodayItems = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate() - 1).padStart(2, '0');
    const items = [];
    if (worksList && worksList[month] && worksList[month][day]) {
      let todayWorks = worksList[month][day];
      todayWorks = todayWorks.concat(worksList[month][day - 3]);
      todayWorks.forEach(work => {
        items.push({ type: 'work', subject: work.subject, description: work.description, teacher: work.name_teacher, id: work.id_work });
      });
    }
    if (remindersList && remindersList[month] && remindersList[month][day]) {
      remindersList[month][day].forEach(reminder => {
        items.push({ type: 'reminder', description: reminder.description, id: reminder.id_reminder });
      });
    }
    return items;
  };

  const toggleTodayItem = (itemKey) => {
    setExpandedTodayItems(prev => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  const fetchNotifications = async () => {
    try {
      const data = await notificationRepository.getNotifications();
      if (data.code === 200 && data.response) {
        if (Array.isArray(data.response) && data.response.length === 1 && data.response[0] === false) {
          setNotifications([]); return;
        }
        const processedNotifications = data.response
          .filter(item => item && item.notify)
          .map(item => { const processed = processNotification(item.notify); if (processed) { processed.type = item.type || ''; processed.rawNotify = item.notify || ''; } return processed; })
          .filter(n => n !== null);
        setNotifications(processedNotifications);
      } else { setNotifications([]); }
    } catch (error) { console.error('Error al cargar notificaciones:', error); }
  };

  const fetchCirculares = async () => {
    try {
      const data = await circularRepository.getNotices();
      if (data.code === 200 && data.response) {
        const circularesArray = Object.keys(data.response).filter(key => key !== 'keys').map(key => data.response[key]);
        setCirculares(circularesArray);
        const pendingNotifysArray = circularesArray.filter(circular => {
          const { type: t, state: s, auth: a } = circular;
          const authTrim = (a || '').trim();
          return (t === '2' && s === '0') || (t === '1' && s === '0') || (t === '1' && s === '1' && authTrim === '');
        });
        setPendingNotifys(pendingNotifysArray);
      } else { setCirculares([]); setPendingNotifys([]); }
    } catch (error) { console.error('Error al cargar circulares:', error); setCirculares([]); setPendingNotifys([]); }
  };

  const toggleNotification = (index) => { setExpandedNotifications(prev => ({ ...prev, [index]: !prev[index] })); };

  const handleEnterado = async (notification, index) => {
    try {
      if (notification.requiresServerConfirmation ? notification.requiresServerConfirmation() : (notification.asunto !== '2' && notification.asunto !== '6')) {
        const data = await notificationRepository.markAsRead(notification.id);
        if (data.code !== 200) { showSnackbar('Error al enviar confirmación'); return; }
      }
      setNotifications(prev => prev.filter((_, i) => i !== index));
      setExpandedNotifications(prev => { const s = { ...prev }; delete s[index]; return s; });
      showSnackbar('Notificación marcada como leída');
    } catch (error) { console.error('Error al procesar enterado:', error); showSnackbar('Error al procesar la notificación'); }
  };

  const openDrawer = () => { setModalVisible(true); setDrawerVisible(true); };
  const closeDrawer = () => { setDrawerVisible(false); };

  useEffect(() => {
    const pingAnimation = Animated.loop(Animated.sequence([
      Animated.timing(badgePingAnim, { toValue: 2, duration: 1000, useNativeDriver: true }),
      Animated.timing(badgePingAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
    ]));
    if (pendingNotifys.length > 0) pingAnimation.start();
    return () => pingAnimation.stop();
  }, [pendingNotifys.length, badgePingAnim]);

  useEffect(() => {
    if (drawerVisible) {
      slideAnim.setValue(-300); overlayOpacity.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -300, duration: 200, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setModalVisible(false));
    }
  }, [drawerVisible, modalVisible, slideAnim, overlayOpacity]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const infoResponse = await userRepository.getInfo();
        if (infoResponse.code === 200 && infoResponse.response?.[0]) setUserInfo(infoResponse.response[0]);
        const mainResponse = await userRepository.getMain();
        if (mainResponse.code === 200) setMainContent(mainResponse.response);
        await fetchNotifications();
        await fetchCirculares();
        const studentResponse = await studentRepository.getInfoStudent();
        if (studentResponse.code === 200 && studentResponse.response) {
          setStudentInfo(studentResponse.response);
          const idCourse = studentResponse.response.id_course;
          const worksResponse = await studentRepository.getListWorks(idCourse);
          if (worksResponse.code === 200 && worksResponse.response) setWorksList(worksResponse.response);
          const remindersResponse = await studentRepository.getListReminders(idCourse);
          if (remindersResponse.code === 200 && remindersResponse.response) setRemindersList(remindersResponse.response);
        }
      } catch (error) { console.error('Error al cargar datos:', error); showSnackbar('No se pudo cargar la información'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  useFocusEffect(useCallback(() => { setActiveDrawerItem('home'); }, []));

  const handleMenuPress = (item, label) => {
    setActiveDrawerItem(item); closeDrawer();
    if (item === 'home') { showSnackbar('Estás en Home'); return; }
    const labelLower = (label || '').toLowerCase();
    if (labelLower === 'agenda virtual') { navigation.navigate('AgendaVirtual'); return; }
    if (labelLower === 'enfermería') { navigation.navigate('Enfermeria'); return; }
    if (labelLower === 'circulares') { navigation.navigate('Circulares'); return; }
    navigation.navigate('Module', { moduleName: label, moduleId: item });
  };

  const handleLogout = async () => {
    try {
      closeDrawer(); setLoading(true);
      await authRepository.logout();
      navigation.replace('Login');
    } catch (error) { console.error('Error al cerrar sesión:', error); showSnackbar('Error al cerrar sesión'); setLoading(false); }
  };

  const getModuleIcon = (module) => {
    const iconMap = {
      'deportes': 'basketball', 'inicio': 'home', 'extra escolares': 'star',
      'circulares': 'email-newsletter', 'académico': 'book-open-variant',
      'cartera': 'wallet', 'matrículas': 'file-document-edit',
      'información': 'information', 'enfermería': 'stethoscope',
      'cambio de clave': 'key-variant', 'camdio de clave': 'key-variant',
      'agenda virtual': 'laptop', 'planeación ': 'clipboard-list',
      'comunicaciones': 'forum', 'calendario curricular': 'calendar-month',
      'menú escolar': 'food', 'entrevista': 'chat', 'ayuda': 'help-circle',
    };
    return iconMap[(module || '').toLowerCase()] || 'circle-medium';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyLarge" style={styles.loadingText}>Cargando información...</Text>
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
              <Image source={{ uri: getImageUri(userInfo.FOTO) }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <Text style={styles.headerAvatarText}>{userInfo?.NOMBRE ? userInfo.NOMBRE.substring(0, 2).toUpperCase() : 'US'}</Text>
              </View>
            )}
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerWelcome}>BIENVENIDO</Text>
              <Text style={styles.headerName}>¡Hola, {toCapitalCase(userInfo?.NOMBRE?.split(' ')[2] || 'Usuario')}!</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card de Notificaciones */}
        {pendingNotifys.length > 0 && (
          <Card style={styles.notificationsCard} elevation={1}>
            <View style={styles.notificationsHeader}>
              <View style={styles.notificationsHeaderLeft}>
                <View style={styles.notificationIconContainer}>
                  <Avatar.Icon icon="bell" size={40} style={styles.notificationIcon} color="#002c5d" />
                  <View style={styles.badgeContainer}>
                    <Animated.View style={[styles.badgePing, { transform: [{ scale: badgePingAnim }], opacity: badgePingAnim.interpolate({ inputRange: [1, 2], outputRange: [0.75, 0] }) }]} />
                    <View style={styles.badge}><Text style={styles.badgeText}>{pendingNotifys.length}</Text></View>
                  </View>
                </View>
                <Text style={styles.notificationsTitle}>Notificaciones</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Circulares')}>
                <Text style={styles.verTodoButtonText}>Ver todo</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.notificationsItemsContainer}>
              {pendingNotifys.map((circular, index) => (
                <TouchableOpacity
                  key={`circular-${index}-${circular.circular}`}
                  style={[styles.notificationItem, index < pendingNotifys.length - 1 && styles.notificationItemBorder]}
                  onPress={() => navigation.navigate('DetalleCircular', { circular, auth: circular.auth || '' })}
                  activeOpacity={0.7}
                >
                  <View style={styles.notificationIconWrapper}>
                    <Avatar.Icon icon="email" size={24} style={styles.notificationItemIcon} color="rgba(0, 44, 93, 0.6)" />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationItemTitle}>Circular {circular.circular}</Text>
                    <Text style={styles.notificationItemDescription} numberOfLines={2}>{circular.subject}</Text>
                    <Text style={styles.notificationItemTimestamp}>{circular.date_send}</Text>
                  </View>
                  <Avatar.Icon icon="chevron-right" size={20} style={styles.notificationChevron} color="#94a3b8" />
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
                return <Text variant="bodyMedium" style={styles.cardText}>No hay actividades programadas para hoy.</Text>;
              }
              const works = todayItems.filter(item => item.type === 'work');
              const reminders = todayItems.filter(item => item.type === 'reminder');
              return (
                <View style={styles.timelineContainer}>
                  <View style={styles.timelineLine} />
                  {works.map((work, index) => {
                    const itemKey = `work-${work.id}-${index}`;
                    const isExpanded = expandedTodayItems[itemKey] || false;
                    return (
                      <View key={itemKey} style={styles.todayScheduleItem}>
                        <View style={styles.timelineDotContainer}><View style={styles.timelineDot}><View style={styles.timelineDotInner} /></View></View>
                        <TouchableOpacity style={styles.todayScheduleItemCard} onPress={() => toggleTodayItem(itemKey)} activeOpacity={0.7}>
                          <View style={styles.todayScheduleItemHeader}>
                            <View style={styles.todayScheduleItemLeft}>
                              <Text style={styles.todayScheduleItemTitle}>{work.subject}</Text>
                              <View style={styles.todayScheduleItemLocation}>
                                <Avatar.Icon icon="account" size={16} style={styles.locationIcon} color="#64748b" />
                                <Text style={styles.todayScheduleItemTeacher} numberOfLines={1}>{work.teacher}</Text>
                              </View>
                            </View>
                            <IconButton icon={isExpanded ? "chevron-up" : "chevron-down"} size={20} iconColor="#002c5d" style={styles.todayScheduleItemChevron} />
                          </View>
                          {isExpanded && (
                            <View style={styles.todayScheduleItemDescription}>
                              <RenderHTML contentWidth={windowWidth - 96} source={{ html: transformTextToHtml(work.description) }}
                                tagsStyles={{ body: { color: '#64748b', fontSize: 12, lineHeight: 18, margin: 0, padding: 0 }, p: { margin: 0, marginBottom: 4 } }} />
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                  {reminders.map((reminder, index) => {
                    const itemKey = `reminder-${reminder.id}-${index}`;
                    const isExpanded = expandedTodayItems[itemKey] || false;
                    return (
                      <View key={itemKey} style={styles.todayScheduleItem}>
                        <View style={styles.timelineDotContainer}><View style={styles.timelineDotReminder}><View style={styles.timelineDotInnerReminder} /></View></View>
                        <TouchableOpacity style={styles.todayScheduleReminderCard} onPress={() => toggleTodayItem(itemKey)} activeOpacity={0.7}>
                          <View style={styles.todayScheduleItemHeader}>
                            <View style={styles.todayScheduleItemLeft}>
                              <Text style={styles.todayScheduleReminderTitle}>Recordatorio</Text>
                              <View style={!isExpanded && styles.todayItemCollapsed}>
                                <RenderHTML contentWidth={windowWidth - 96} source={{ html: transformTextToHtml(reminder.description) }}
                                  tagsStyles={{ body: { color: '#64748b', fontSize: 12, lineHeight: 18, margin: 0, padding: 0 }, p: { margin: 0, marginBottom: 4 } }} />
                              </View>
                            </View>
                            <IconButton icon={isExpanded ? "chevron-up" : "chevron-down"} size={20} iconColor="#64748b" style={styles.todayScheduleItemChevron} />
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              );
            })()}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Navigation Drawer */}
      <Modal animationType="none" transparent={true} visible={modalVisible} onRequestClose={closeDrawer}>
        <View style={styles.modalContainer}>
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <Animated.View style={[styles.drawerOverlay, { opacity: overlayOpacity }]} />
          </TouchableWithoutFeedback>
          <Animated.View style={[styles.drawerContainer, { transform: [{ translateX: slideAnim }] }]}>
            <View style={styles.profileSection}>
              <View style={styles.profileHeader}>
                {userInfo?.FOTO && getImageUri(userInfo.FOTO) ? (
                  <Avatar.Image size={64} source={{ uri: getImageUri(userInfo.FOTO) }} style={styles.avatar} />
                ) : (
                  <Avatar.Text size={64} label={userInfo?.NOMBRE ? userInfo.NOMBRE.substring(0, 2).toUpperCase() : 'US'} style={styles.avatar} />
                )}
                <View style={styles.profileInfo}>
                  <Text variant="titleMedium" style={styles.profileName} numberOfLines={2}>{userInfo?.NOMBRE?.replace('\n', ' ') || 'Usuario'}</Text>
                  <Text variant="bodySmall" style={styles.profileRole}>{userInfo?.PERFIL || 'Estudiante'}</Text>
                  {userInfo?.CURSO && <Text variant="bodySmall" style={styles.profileCourse}>{userInfo.CURSO.replace('\n', ' ')}</Text>}
                </View>
              </View>
            </View>
            <Divider />
            <ScrollView style={styles.menuScrollView} showsVerticalScrollIndicator={true} bounces={false}>
              <Drawer.Section style={styles.drawerSection}>
                <Drawer.Item icon="home" label="Home" active={activeDrawerItem === 'home'} onPress={() => handleMenuPress('home', 'Home')}
                  style={activeDrawerItem === 'home' ? styles.activeDrawerItem : styles.inactiveDrawerItem}
                  labelStyle={activeDrawerItem === 'home' ? styles.activeDrawerLabel : styles.inactiveDrawerLabel}
                  theme={{ colors: { onSurfaceVariant: activeDrawerItem === 'home' ? '#002c5d' : '#94a3b8', onSecondaryContainer: activeDrawerItem === 'home' ? '#002c5d' : '#94a3b8', primary: '#002c5d' } }} />
                {mainContent && Array.isArray(mainContent) && mainContent.map((item, index) => {
                  const itemId = item.id || item.ID || `item-${index}`;
                  const isActive = activeDrawerItem === itemId;
                  return (
                    <Drawer.Item key={itemId} icon={getModuleIcon(item.module)} label={item.module || 'Sin nombre'} active={isActive}
                      onPress={() => handleMenuPress(itemId, item.module)}
                      style={isActive ? styles.activeDrawerItem : styles.inactiveDrawerItem}
                      labelStyle={isActive ? styles.activeDrawerLabel : styles.inactiveDrawerLabel}
                      theme={{ colors: { onSurfaceVariant: isActive ? '#002c5d' : '#94a3b8', onSecondaryContainer: isActive ? '#002c5d' : '#94a3b8', primary: '#002c5d' } }} />
                  );
                })}
              </Drawer.Section>
            </ScrollView>
            <Divider />
            <View style={styles.logoutSection}>
              <Drawer.Item icon="logout" label="Cerrar sesión" onPress={handleLogout}
                style={styles.logoutItem} labelStyle={styles.logoutLabel}
                theme={{ colors: { onSurfaceVariant: '#dc2626', onSecondaryContainer: '#dc2626', primary: '#dc2626' } }} />
            </View>
          </Animated.View>
        </View>
      </Modal>

      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}
        action={{ label: 'OK', onPress: () => setSnackbarVisible(false) }}>{snackbarMessage}</Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8f6f6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(248, 246, 246, 0.95)', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0, 44, 93, 0.1)' },
  headerLeft: { flex: 1 },
  profileContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: 'rgba(0, 44, 93, 0.2)' },
  headerAvatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#002c5d', borderWidth: 2, borderColor: 'rgba(0, 44, 93, 0.2)', alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: 'bold' },
  headerTextContainer: { marginLeft: 0 },
  headerWelcome: { fontSize: 12, fontFamily: 'Inter_700Bold', fontWeight: '700', color: '#002c5d', letterSpacing: 1.5, marginBottom: 4 },
  headerName: { fontSize: 20, fontFamily: 'Inter_700Bold', fontWeight: 'bold', color: '#221610', lineHeight: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f6f6' },
  loadingText: { marginTop: 16, color: '#002c5d' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24, backgroundColor: '#f8f6f6' },
  notificationsCard: { marginBottom: 24, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 44, 93, 0.05)', overflow: 'hidden' },
  notificationsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0, 44, 93, 0.05)' },
  notificationsHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  notificationIconContainer: { width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(0, 44, 93, 0.1)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notificationIcon: { backgroundColor: 'transparent', width: 40, height: 40 },
  badgeContainer: { position: 'absolute', top: -4, right: -4, width: 16, height: 16 },
  badgePing: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.75)' },
  badge: { position: 'relative', width: 16, height: 16, borderRadius: 8, backgroundColor: '#ef4444', alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#FFFFFF', fontSize: 10, fontFamily: 'Inter_700Bold', fontWeight: 'bold' },
  notificationsTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', fontWeight: 'bold', color: '#221610' },
  verTodoButtonText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', fontWeight: '600', color: '#002c5d' },
  notificationsItemsContainer: { backgroundColor: '#FFFFFF' },
  notificationItem: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, gap: 16, backgroundColor: '#FFFFFF' },
  notificationItemBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(0, 44, 93, 0.05)' },
  notificationIconWrapper: { marginTop: 4 },
  notificationItemIcon: { backgroundColor: 'transparent', width: 20, height: 20 },
  notificationContent: { flex: 1 },
  notificationItemTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', fontWeight: 'bold', color: '#221610', marginBottom: 4 },
  notificationItemDescription: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748b', marginTop: 4, lineHeight: 18 },
  notificationItemTimestamp: { fontSize: 10, fontFamily: 'Inter_400Regular', color: '#94a3b8', marginTop: 4 },
  notificationChevron: { backgroundColor: 'transparent', width: 20, height: 20, alignSelf: 'center' },
  cardText: { color: '#64748b', fontFamily: 'Inter_400Regular', lineHeight: 22, fontSize: 14 },
  modalContainer: { flex: 1, flexDirection: 'row' },
  drawerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  drawerContainer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: width * 0.80, maxWidth: 320, backgroundColor: '#f8f6f6', shadowColor: '#000', shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 8 },
  profileSection: { paddingVertical: 24, paddingHorizontal: 16, backgroundColor: '#f8f6f6' },
  profileHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { backgroundColor: '#002c5d', borderWidth: 2, borderColor: 'rgba(0, 44, 93, 0.2)' },
  profileInfo: { marginLeft: 16, flex: 1 },
  profileName: { fontFamily: 'Inter_700Bold', fontWeight: 'bold', color: '#221610', marginBottom: 4, fontSize: 16 },
  profileRole: { fontFamily: 'Inter_400Regular', color: '#64748b', marginBottom: 2, fontSize: 14 },
  profileCourse: { fontFamily: 'Inter_400Regular', color: '#64748b', fontSize: 14 },
  menuScrollView: { flex: 1 },
  drawerSection: { paddingTop: 8, paddingBottom: 8, paddingHorizontal: 8 },
  activeDrawerItem: { backgroundColor: '#e6ebf1', borderRadius: 12, marginHorizontal: 8, height: 48 },
  activeDrawerLabel: { color: '#002c5d', fontWeight: '600', fontSize: 16 },
  inactiveDrawerItem: { borderRadius: 12, marginHorizontal: 8, height: 48, backgroundColor: 'transparent' },
  inactiveDrawerLabel: { color: '#64748b', fontWeight: '500', fontSize: 16 },
  logoutSection: { paddingVertical: 8, paddingBottom: 16, backgroundColor: '#f8f6f6', paddingHorizontal: 8 },
  logoutItem: { borderRadius: 12, height: 56, backgroundColor: 'transparent' },
  logoutLabel: { color: '#dc2626', fontWeight: '700', fontSize: 16 },
  todayScheduleCard: { marginBottom: 24, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 44, 93, 0.05)', overflow: 'hidden' },
  todayScheduleHeader: { padding: 16 },
  todayScheduleHeaderContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  todayScheduleIconContainer: { width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(0, 44, 93, 0.1)', alignItems: 'center', justifyContent: 'center' },
  todayScheduleIcon: { backgroundColor: 'transparent', width: 40, height: 40 },
  todayScheduleTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', fontWeight: 'bold', color: '#221610', marginBottom: 2 },
  todayScheduleSubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748b', textTransform: 'capitalize' },
  todayScheduleContent: { paddingTop: 8 },
  timelineContainer: { position: 'relative' },
  timelineLine: { position: 'absolute', left: 19, top: 8, bottom: 8, width: 2, backgroundColor: 'rgba(0, 44, 93, 0.1)' },
  todayScheduleItem: { position: 'relative', paddingLeft: 48, marginBottom: 24 },
  timelineDotContainer: { position: 'absolute', left: 0, top: 4, width: 40, alignItems: 'center', justifyContent: 'center' },
  timelineDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(0, 44, 93, 0.2)', alignItems: 'center', justifyContent: 'center' },
  timelineDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#002c5d' },
  timelineDotReminder: { width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(148, 163, 184, 0.2)', alignItems: 'center', justifyContent: 'center' },
  timelineDotInnerReminder: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#94a3b8' },
  todayScheduleItemCard: { backgroundColor: 'rgba(0, 44, 93, 0.05)', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: 'rgba(0, 44, 93, 0.1)' },
  todayScheduleReminderCard: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  todayScheduleItemHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  todayScheduleItemLeft: { flex: 1, marginRight: 8 },
  todayScheduleItemTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', fontWeight: 'bold', color: '#221610', marginBottom: 6 },
  todayScheduleReminderTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', fontWeight: 'bold', color: '#64748b', marginBottom: 6 },
  todayScheduleItemLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationIcon: { backgroundColor: 'transparent', width: 16, height: 16 },
  todayScheduleItemTeacher: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748b', flex: 1 },
  todayScheduleItemChevron: { margin: 0, marginTop: -8, marginRight: -8 },
  todayScheduleItemDescription: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(0, 44, 93, 0.1)' },
  todayItemCollapsed: { maxHeight: 18, overflow: 'hidden' },
});

export default HomeScreen;
