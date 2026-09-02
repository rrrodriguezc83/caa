import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Animated,
  TouchableOpacity,
  Image,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import AppScreenLayout from '../../components/common/AppScreenLayout';
import {
  Text, ActivityIndicator, Card, Snackbar, useTheme,
  Avatar, IconButton,
} from 'react-native-paper';
import RenderHTML from 'react-native-render-html';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { container } from '../../../di/container';
import { setSession } from '../../../shared/session';
import { apiClient } from '../../../data/datasources/remote/ApiClient';
import { API_URLS } from '../../../shared/constants/apiRoutes';
import { capitalizeFirst, transformTextToHtml, getImageUri } from '../../../shared/utils/textHelpers';
import {
  getTodayLocal,
  getNextSchoolDayDate,
  findDaySchool,
  getWeekdayDiaForSchedule,
  uniformeLabelFromCodigo,
} from '../../../shared/utils/schoolCalendar';
import { getScheduleForCourse } from '../../../data/datasources/remote/firebaseScheduleService';

const {
  userRepository, studentRepository,
  circularRepository, notificationRepository,
} = container;

const inactiveMain = ['1', '5', '13'];

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
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [studentInfo, setStudentInfo] = useState(null);
  const [worksList, setWorksList] = useState(null);
  const [remindersList, setRemindersList] = useState(null);
  const [schedule, setSchedule] = useState(null);
  /** Respuesta de getCalendar (compartida con Agenda Virtual vía params) */
  const [calendarData, setCalendarData] = useState(null);
  const [expandedTomorrowItems, setExpandedTomorrowItems] = useState({});
  const [otrosExpanded, setOtrosExpanded] = useState(false);

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

  const getTomorrowItems = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const items = [];
    if (worksList && worksList[month]) {
      const tomorrowWorks = Array.isArray(worksList[month][day]) ? worksList[month][day] : [];
      tomorrowWorks.forEach(work => {
        if (work && work.subject != null) {
          items.push({ type: 'work', subject: work.subject, description: work.description, teacher: work.name_teacher, id: work.id_work });
        }
      });
    }
    if (remindersList && remindersList[month] && remindersList[month][day]) {
      const tomorrowReminders = Array.isArray(remindersList[month][day]) ? remindersList[month][day] : [];
      tomorrowReminders.forEach(reminder => {
        if (reminder && reminder.description != null) {
          items.push({ type: 'reminder', description: reminder.description, id: reminder.id_reminder });
        }
      });
    }
    return items;
  };

  const toggleTomorrowItem = (itemKey) => {
    setExpandedTomorrowItems(prev => ({ ...prev, [itemKey]: !prev[itemKey] }));
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

  const fetchCalendarData = async () => {
    try {
      const data = await apiClient.post(API_URLS.WORK_CLASS, {
        base: 'caa',
        param: 'getCalendar',
        mod_check: 'false',
      });
      if (data.code === 200) setCalendarData(data.response);
    } catch (error) {
      console.error('Error al cargar el calendario escolar:', error);
    }
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

  useEffect(() => {
    const pingAnimation = Animated.loop(Animated.sequence([
      Animated.timing(badgePingAnim, { toValue: 2, duration: 1000, useNativeDriver: true }),
      Animated.timing(badgePingAnim, { toValue: 1, duration: 0, useNativeDriver: true }),
    ]));
    if (pendingNotifys.length > 0) pingAnimation.start();
    return () => pingAnimation.stop();
  }, [pendingNotifys.length, badgePingAnim]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const infoResponse = await userRepository.getInfo();
        if (infoResponse.code === 200 && infoResponse.response?.[0]) {
          setUserInfo(infoResponse.response[0]);
          setSession(infoResponse.response[0]);
        }
        const mainResponse = await userRepository.getMain();
        if (mainResponse.code === 200) setMainContent(mainResponse.response);
        await Promise.all([fetchNotifications(), fetchCirculares(), fetchCalendarData()]);
        const studentResponse = await studentRepository.getInfoStudent();
        if (studentResponse.code === 200 && studentResponse.response) {
          setStudentInfo(studentResponse.response);
          const idCourse = studentResponse.response.id_course;

          const worksResponse = await studentRepository.getListWorks(idCourse);
          if (worksResponse.code === 200 && worksResponse.response) setWorksList(worksResponse.response);

          const remindersResponse = await studentRepository.getListReminders(idCourse);
          if (remindersResponse.code === 200 && remindersResponse.response) setRemindersList(remindersResponse.response);

          // Horario desde Firestore (colección "horarios", doc = id_course)
          try {
            const scheduleData = await getScheduleForCourse(idCourse);
            if (scheduleData) {
              setSchedule(scheduleData);
            } else {
              setSchedule(null);
            }
          } catch (scheduleError) {
            console.error('Error al cargar horario desde Firestore:', scheduleError);
          }
        }
      } catch (error) { console.error('Error al cargar datos:', error); showSnackbar('No se pudo cargar la información'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleMenuPress = (item, label) => {
    const labelLower = (label || '').toLowerCase().trim();
    const screenMap = {
      'agenda virtual': 'AgendaVirtual',
      'enfermería': 'Enfermeria',
      'circulares': 'ModuloCirculares',
      'deportes': 'Deportes',
      'extra escolares': 'ExtraEscolares',
      'académico': 'Academico',
      'cartera': 'Cartera',
      'matrículas': 'Matriculas',
      'información': 'Informacion',
      'cambio de clave': 'CambioClave',
      'camdio de clave': 'CambioClave',
      'planeación': 'Planeacion',
      'planeación ': 'Planeacion',
      'comunicaciones': 'Comunicaciones',
      'calendario curricular': 'CalendarioCurricular',
      'menú escolar': 'MenuEscolar',
      'entrevista': 'Entrevista',
      'ayuda': 'Ayuda',
    };
    const screenName = screenMap[labelLower];
    if (screenName) {
      if (screenName === 'AgendaVirtual') {
        navigation.navigate('AgendaVirtual', { calendarData });
      } else {
        navigation.navigate(screenName);
      }
      return;
    }
    navigation.navigate('Module', { moduleName: label, moduleId: item });
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

  /** Siguiente día lectivo: mar→mié, vie→lun. Horario Firestore: dia 1=lun … 6=sáb. */
  const todayLocal = getTodayLocal();
  const nextSchoolDate = getNextSchoolDayDate(todayLocal);
  const daySchoolFromCalendar = findDaySchool(calendarData, nextSchoolDate);
  const weekdayDia = getWeekdayDiaForSchedule(nextSchoolDate);

  let horarioNext = null;
  if (Array.isArray(schedule?.horario) && schedule.horario.length > 0) {
    if (daySchoolFromCalendar != null) {
      horarioNext = schedule.horario.find(
        (h) => Number(h.dia) === Number(daySchoolFromCalendar)
      );
    }
  }

  const diaLabel =
    daySchoolFromCalendar ?? horarioNext?.dia ?? null;

  const uniformeNext =
    horarioNext != null
      ? uniformeLabelFromCodigo(horarioNext.codigo_uniforme) ||
        (horarioNext.desc_uniforme
          ? `Uniforme: ${horarioNext.desc_uniforme}`
          : 'Uniforme: —')
      : 'Uniforme: Sudadera';

  const showSchoolDayCard =  diaLabel != null;

  /** Icono según codigo_uniforme: 1 camisa formal, 2 camiseta */
  const uniformDecorIcon = (() => {
    const n = Number(horarioNext?.codigo_uniforme);
    if (n === 1) return 'hail';
    if (n === 2) return 'gymnastics';
    //if (uniformeNext && /Diario/i.test(uniformeNext)) return 'hail';
    //if (uniformeNext && /Sudadera/i.test(uniformeNext)) return 'gymnastics';
    return 'gymnastics';
  })();

  const nextSchoolDateFormatted = capitalizeFirst(
    new Date(
      parseInt(nextSchoolDate.split('-')[0], 10),
      parseInt(nextSchoolDate.split('-')[1], 10) - 1,
      parseInt(nextSchoolDate.split('-')[2], 10)
    ).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="bodyLarge" style={styles.loadingText}>Cargando información...</Text>
      </View>
    );
  }

  return (
    <AppScreenLayout>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f6f6" />

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          {userInfo?.FOTO && getImageUri(userInfo.FOTO) ? (
            <Image source={{ uri: getImageUri(userInfo.FOTO) }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Text style={styles.headerAvatarText}>{userInfo?.NOMBRE ? userInfo.NOMBRE.substring(0, 2).toUpperCase() : 'US'}</Text>
            </View>
          )}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerName} numberOfLines={2}>{userInfo?.NOMBRE?.replace('\n', ' ') || 'Usuario'}</Text>
            <Text style={styles.headerRole}>{userInfo?.PERFIL || 'Estudiante'}</Text>
            {userInfo?.CURSO && <Text style={styles.headerCourse}>{userInfo.CURSO.replace('\n', ' ')}</Text>}
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {showSchoolDayCard && (
          <View style={styles.schoolDayCardWrap}>
            <View style={styles.schoolDayBlobTop} pointerEvents="none" />
            <View style={styles.schoolDayBlobBottom} pointerEvents="none" />
            <View style={styles.schoolDayCardInner}>
              <View style={styles.schoolDayCardRow}>
                <View style={styles.schoolDayCardLeft}>
                  <View style={styles.schoolDayBadgeRow}>
                    <Icon name="calendar-today" size={18} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.schoolDayBadgeLabel}>
                      {`SIGUIENTE: DÍA ${diaLabel}`}
                    </Text>
                  </View>
                  <Text style={styles.schoolDayDateLine}>{nextSchoolDateFormatted}</Text>
                  <Text style={styles.schoolDayUniformTitle}>{uniformeNext}</Text>
                </View>
                <View style={styles.schoolDayDecorIconWrap} pointerEvents="none">
                  <Icon name={uniformDecorIcon} size={70} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </View>
        )}

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
        <Card style={styles.tomorrowScheduleCard} elevation={1}>
          <View style={styles.tomorrowScheduleHeader}>
            <View style={styles.tomorrowScheduleHeaderContent}>
              <View style={styles.tomorrowScheduleIconContainer}>
                <Avatar.Icon icon="calendar-arrow-right" size={40} style={styles.tomorrowScheduleIcon} color="#002c5d" />
              </View>
              <View>
                <Text style={styles.tomorrowScheduleTitle}>Para mañana...</Text>
                <Text style={styles.tomorrowScheduleSubtitle}>
                  {(() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    return capitalizeFirst(tomorrow.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));
                  })()}
                </Text>
              </View>
            </View>
          </View>
          <Card.Content style={styles.tomorrowScheduleContent}>
            {(() => {
              const tomorrowItems = getTomorrowItems();
              if (tomorrowItems.length === 0) {
                return <Text variant="bodyMedium" style={styles.cardText}>No hay actividades programadas para mañana.</Text>;
              }
              const works = tomorrowItems.filter(item => item.type === 'work');
              const reminders = tomorrowItems.filter(item => item.type === 'reminder');
              return (
                <View style={styles.timelineContainer}>
                  <View style={styles.timelineLine} />
                  {works.map((work, index) => {
                    const itemKey = `work-${work.id}-${index}`;
                    const isExpanded = expandedTomorrowItems[itemKey] || false;
                    return (
                      <View key={itemKey} style={styles.tomorrowScheduleItem}>
                        <View style={styles.timelineDotContainer}><View style={styles.timelineDot}><View style={styles.timelineDotInner} /></View></View>
                        <TouchableOpacity style={styles.tomorrowScheduleItemCard} onPress={() => toggleTomorrowItem(itemKey)} activeOpacity={0.7}>
                          <View style={styles.tomorrowScheduleItemHeader}>
                            <View style={styles.tomorrowScheduleItemLeft}>
                              <Text style={styles.tomorrowScheduleItemTitle}>{work.subject}</Text>
                              <View style={styles.tomorrowScheduleItemLocation}>
                                <Avatar.Icon icon="account" size={16} style={styles.locationIcon} color="#64748b" />
                                <Text style={styles.tomorrowScheduleItemTeacher} numberOfLines={1}>{work.teacher}</Text>
                              </View>
                            </View>
                            <IconButton icon={isExpanded ? "chevron-up" : "chevron-down"} size={20} iconColor="#002c5d" style={styles.tomorrowScheduleItemChevron} />
                          </View>
                          {isExpanded && (
                            <View style={styles.tomorrowScheduleItemDescription}>
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
                    const isExpanded = expandedTomorrowItems[itemKey] || false;
                    return (
                      <View key={itemKey} style={styles.tomorrowScheduleItem}>
                        <View style={styles.timelineDotContainer}><View style={styles.timelineDotReminder}><View style={styles.timelineDotInnerReminder} /></View></View>
                        <TouchableOpacity style={styles.tomorrowScheduleReminderCard} onPress={() => toggleTomorrowItem(itemKey)} activeOpacity={0.7}>
                          <View style={styles.tomorrowScheduleItemHeader}>
                            <View style={styles.tomorrowScheduleItemLeft}>
                              <Text style={styles.tomorrowScheduleReminderTitle}>Recordatorio</Text>
                              <View style={!isExpanded && styles.tomorrowItemCollapsed}>
                                <RenderHTML contentWidth={windowWidth - 96} source={{ html: transformTextToHtml(reminder.description) }}
                                  tagsStyles={{ body: { color: '#64748b', fontSize: 12, lineHeight: 18, margin: 0, padding: 0 }, p: { margin: 0, marginBottom: 4 } }} />
                              </View>
                            </View>
                            <IconButton icon={isExpanded ? "chevron-up" : "chevron-down"} size={20} iconColor="#64748b" style={styles.tomorrowScheduleItemChevron} />
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

      {/* Carrusel de opciones del menú */}
      <View style={styles.quickAccessSection}>
        <Text style={styles.quickAccessTitle}>Módulos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickAccessCarousel}>
          {mainContent && Array.isArray(mainContent) && mainContent.filter((item) => !inactiveMain.includes(item.id)).map((item, index) => {
            const itemId = item.id || item.ID || `item-${index}`;
            return (
              <TouchableOpacity
                key={itemId}
                style={styles.quickAccessItem}
                onPress={() => handleMenuPress(itemId, item.module)}
                activeOpacity={0.7}
              >
                <View style={styles.quickAccessIconContainer}>
                  <Icon name={getModuleIcon(item.module)} size={24} color="#002c5d" />
                </View>
                <Text style={styles.quickAccessLabel} numberOfLines={2}>{item.module || 'Sin nombre'}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <Snackbar visible={snackbarVisible} onDismiss={() => setSnackbarVisible(false)} duration={3000}
        action={{ label: 'OK', onPress: () => setSnackbarVisible(false) }}>{snackbarMessage}</Snackbar>
    </AppScreenLayout>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8f6f6' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#002c5d', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0, 44, 93, 0.1)' },
  profileContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerAvatar: { width: 73, height: 73, borderRadius: 36.5, borderWidth: 2, borderColor: 'rgba(0, 44, 93, 0.2)' },
  headerAvatarPlaceholder: { width: 73, height: 73, borderRadius: 36.5, backgroundColor: '#002c5d', borderWidth: 2, borderColor: 'rgba(0, 44, 93, 0.2)', alignItems: 'center', justifyContent: 'center' },
  headerAvatarText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: 'bold' },
  headerTextContainer: { marginLeft: 0 },
  headerName: { fontSize: 16, fontFamily: 'Inter_700Bold', fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2 },
  headerRole: { fontSize: 13, fontFamily: 'Inter_400Regular', color: 'rgba(255, 255, 255, 0.8)', marginBottom: 2 },
  headerCourse: { fontSize: 13, fontFamily: 'Inter_400Regular', color: 'rgba(255, 255, 255, 0.8)' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f6f6' },
  loadingText: { marginTop: 16, color: '#002c5d' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24, backgroundColor: '#f8f6f6' },
  notificationsCard: { marginBottom: 24, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 44, 93, 0.05)', overflow: 'hidden' },
  /* Tarjeta "Upcoming events / Event Card 1" (Stitch AgendaVirtual-uniforme) */
  schoolDayCardWrap: {
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#002c5d',
    overflow: 'hidden',
    shadowColor: '#002c5d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  schoolDayBlobTop: {
    position: 'absolute',
    top: -64,
    right: -64,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  schoolDayBlobBottom: {
    position: 'absolute',
    bottom: -48,
    left: -48,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  schoolDayCardInner: { padding: 20, zIndex: 10 },
  schoolDayCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  schoolDayCardLeft: { flex: 1, paddingRight: 8 },
  schoolDayBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  schoolDayBadgeLabel: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  schoolDayDateLine: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  schoolDayUniformTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  schoolDayDecorIconWrap: {
    opacity: 0.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  tomorrowScheduleCard: { marginBottom: 24, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0, 44, 93, 0.05)', overflow: 'hidden' },
  tomorrowScheduleHeader: { padding: 16 },
  tomorrowScheduleHeaderContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tomorrowScheduleIconContainer: { width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(0, 44, 93, 0.1)', alignItems: 'center', justifyContent: 'center' },
  tomorrowScheduleIcon: { backgroundColor: 'transparent', width: 40, height: 40 },
  tomorrowScheduleTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', fontWeight: 'bold', color: '#221610', marginBottom: 2 },
  tomorrowScheduleSubtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748b', textTransform: 'capitalize' },
  tomorrowScheduleContent: { paddingTop: 8 },
  timelineContainer: { position: 'relative' },
  timelineLine: { position: 'absolute', left: 19, top: 8, bottom: 8, width: 2, backgroundColor: 'rgba(0, 44, 93, 0.1)' },
  tomorrowScheduleItem: { position: 'relative', paddingLeft: 48, marginBottom: 24 },
  timelineDotContainer: { position: 'absolute', left: 0, top: 4, width: 40, alignItems: 'center', justifyContent: 'center' },
  timelineDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(0, 44, 93, 0.2)', alignItems: 'center', justifyContent: 'center' },
  timelineDotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#002c5d' },
  timelineDotReminder: { width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(148, 163, 184, 0.2)', alignItems: 'center', justifyContent: 'center' },
  timelineDotInnerReminder: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#94a3b8' },
  tomorrowScheduleItemCard: { backgroundColor: 'rgba(0, 44, 93, 0.05)', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: 'rgba(0, 44, 93, 0.1)' },
  tomorrowScheduleReminderCard: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  tomorrowScheduleItemHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  tomorrowScheduleItemLeft: { flex: 1, marginRight: 8 },
  tomorrowScheduleItemTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', fontWeight: 'bold', color: '#221610', marginBottom: 6 },
  tomorrowScheduleReminderTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', fontWeight: 'bold', color: '#64748b', marginBottom: 6 },
  tomorrowScheduleItemLocation: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationIcon: { backgroundColor: 'transparent', width: 16, height: 16 },
  tomorrowScheduleItemTeacher: { fontSize: 12, fontFamily: 'Inter_400Regular', color: '#64748b', flex: 1 },
  tomorrowScheduleItemChevron: { margin: 0, marginTop: -8, marginRight: -8 },
  tomorrowScheduleItemDescription: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(0, 44, 93, 0.1)' },
  tomorrowItemCollapsed: { maxHeight: 18, overflow: 'hidden' },
  quickAccessSection: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: 'rgba(0, 44, 93, 0.1)', paddingTop: 12, paddingBottom: 12, paddingLeft: 16 },
  quickAccessTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', fontWeight: 'bold', color: '#221610', marginBottom: 10 },
  quickAccessCarousel: { gap: 12, paddingRight: 16 },
  quickAccessItem: { width: 76, alignItems: 'center' },
  quickAccessIconContainer: { width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(0, 44, 93, 0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  quickAccessLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', fontWeight: '600', color: '#221610', textAlign: 'center', lineHeight: 14 },
});

export default HomeScreen;
