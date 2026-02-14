import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Text,
  Card,
  useTheme,
  List,
  Switch,
  Divider,
  Avatar,
  Badge,
  IconButton,
} from 'react-native-paper';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import RenderHtml from 'react-native-render-html';
import { container } from '../../../di/container';
import { apiClient } from '../../../data/datasources/remote/ApiClient';
import { API_URLS } from '../../../shared/constants/apiRoutes';
import ScreenHeader from '../../components/common/ScreenHeader';

const { userRepository, studentRepository } = container;

// Componente memoizado para Card de Trabajo
const WorkCard = memo(({ work, workId, isExpanded, onToggle }) => {
  const { width } = useWindowDimensions();
  const htmlStyles = {
    body: { color: '#64748b', fontSize: 14, lineHeight: 20 },
    p: { marginTop: 0, marginBottom: 8 },
    a: { color: '#002c5d', textDecorationLine: 'underline' },
  };

  return (
    <Card style={agendaStyles.workCard} elevation={1}>
      <TouchableOpacity onPress={() => onToggle(workId)} activeOpacity={0.7}>
        <View style={agendaStyles.workCardHeader}>
          <View style={agendaStyles.workIconContainer}>
            <Avatar.Icon icon="file-document-edit" size={48} style={agendaStyles.workIcon} color="#002c5d" />
          </View>
          <View style={agendaStyles.workCardHeaderContent}>
            <Text style={agendaStyles.workTitle} numberOfLines={isExpanded ? 0 : 1}>{work.subject || 'Sin título'}</Text>
            <Text style={agendaStyles.workSubtitle} numberOfLines={1}>{work.name_teacher || 'Sin profesor'}</Text>
          </View>
          <View style={agendaStyles.chevronContainer}>
            <Avatar.Icon icon={isExpanded ? 'chevron-up' : 'chevron-down'} size={32} style={agendaStyles.chevronIcon} color="#002c5d" />
          </View>
        </View>
        {isExpanded && (
          <View style={agendaStyles.workCardExpandedContent}>
            <Divider style={agendaStyles.workDivider} />
            {work.description && (
              <View style={agendaStyles.workDescriptionContainer}>
                <RenderHtml contentWidth={width - 64} source={{ html: work.description }} tagsStyles={htmlStyles} />
              </View>
            )}
            {work.date_creation && (
              <View style={agendaStyles.workFooter}>
                <Text style={agendaStyles.workFooterText}>Creado: {work.date_creation}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );
});
WorkCard.displayName = 'WorkCard';

// Componente memoizado para Card de Recordatorio
const ReminderCard = memo(({ reminder, reminderId, isExpanded, onToggle }) => {
  const { width } = useWindowDimensions();
  const htmlStyles = {
    body: { color: '#64748b', fontSize: 14, lineHeight: 20 },
    p: { marginTop: 0, marginBottom: 8 },
    a: { color: '#002c5d', textDecorationLine: 'underline' },
  };

  return (
    <Card style={agendaStyles.workCard} elevation={1}>
      <TouchableOpacity onPress={() => onToggle(reminderId)} activeOpacity={0.7}>
        <View style={agendaStyles.workCardHeader}>
          <View style={agendaStyles.reminderIconContainer}>
            <Avatar.Icon icon="bell-ring" size={48} style={agendaStyles.reminderIcon} color="#002c5d" />
          </View>
          <View style={agendaStyles.workCardHeaderContent}>
            <Text style={agendaStyles.workTitle} numberOfLines={isExpanded ? 0 : 1}>RECORDATORIO</Text>
            <Text style={agendaStyles.workSubtitle} numberOfLines={1}>Otros</Text>
          </View>
          <View style={agendaStyles.chevronContainer}>
            <Avatar.Icon icon={isExpanded ? 'chevron-up' : 'chevron-down'} size={32} style={agendaStyles.chevronIcon} color="#002c5d" />
          </View>
        </View>
        {isExpanded && (
          <View style={agendaStyles.workCardExpandedContent}>
            <Divider style={agendaStyles.workDivider} />
            {reminder.description && (
              <View style={agendaStyles.workDescriptionContainer}>
                <RenderHtml contentWidth={width - 64} source={{ html: reminder.description }} tagsStyles={htmlStyles} />
              </View>
            )}
            {reminder.date_creation && (
              <View style={agendaStyles.workFooter}>
                <Text style={agendaStyles.workFooterText}>Creado: {reminder.date_creation}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );
});
ReminderCard.displayName = 'ReminderCard';

// Configurar el calendario en español
LocaleConfig.locales['es'] = {
  monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  monthNamesShort: ['Ene.','Feb.','Mar.','Abr.','May.','Jun.','Jul.','Ago.','Sep.','Oct.','Nov.','Dic.'],
  dayNames: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
  dayNamesShort: ['Dom.','Lun.','Mar.','Mié.','Jue.','Vie.','Sáb.'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

const AgendaVirtualScreen = ({ navigation }) => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState('');
  const [calendarData, setCalendarData] = useState(null);
  const [checkDaysData, setCheckDaysData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDaySchool, setSelectedDaySchool] = useState(null);
  const [switchValue, setSwitchValue] = useState(false);
  const [dateCheck, setDateCheck] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [worksList, setWorksList] = useState(null);
  const [remindersList, setRemindersList] = useState(null);
  const [selectedDayWorks, setSelectedDayWorks] = useState([]);
  const [selectedDayReminders, setSelectedDayReminders] = useState([]);
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    if (selectedDate) {
      const worksForDay = getWorksForDate(selectedDate);
      const remindersForDay = getRemindersForDate(selectedDate);
      setSelectedDayWorks(worksForDay);
      setSelectedDayReminders(remindersForDay);
      if (calendarData) setSelectedDaySchool(findDaySchool(selectedDate));
      if (checkDaysData) {
        setSwitchValue(isDateChecked(selectedDate));
        const checkDayData = getCheckDayData(selectedDate);
        setDateCheck(checkDayData?.date_check || null);
      }
    }
  }, [selectedDate, worksList, remindersList, calendarData, checkDaysData]);

  const getTodayLocal = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const isWeekend = (dateString) => {
    const [year, month, day] = dateString.split('-');
    const dayOfWeek = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  const getNextBusinessDay = (dateString) => {
    const [year, month, day] = dateString.split('-');
    let date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 6) date.setDate(date.getDate() + 2);
    else if (dayOfWeek === 0) date.setDate(date.getDate() + 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const today = getTodayLocal();

  const fetchCalendarData = async () => {
    try {
      const data = await apiClient.post(API_URLS.WORK_CLASS, { base: 'caa', param: 'getCalendar', mod_check: 'false' });
      if (data.code === 200) setCalendarData(data.response);
    } catch (error) {
      console.error('Error al cargar el calendario:', error);
    }
  };

  const fetchCheckDaysData = async () => {
    try {
      const data = await apiClient.post(API_URLS.WORK_CLASS, { base: 'caa', param: 'getCheckDays', id_student: 'false' });
      if (data.code === 200) setCheckDaysData(data.response);
    } catch (error) {
      console.error('Error al cargar los días marcados:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchCalendarData(), fetchCheckDaysData()]);
        const infoResponse = await userRepository.getInfo();
        if (infoResponse.code === 200 && infoResponse.response?.[0]) {
          setUserInfo(infoResponse.response[0]);
        }
        const studentResponse = await studentRepository.getInfoStudent();
        if (studentResponse.code === 200 && studentResponse.response) {
          setStudentInfo(studentResponse.response);
          const idCourse = studentResponse.response.id_course;
          const worksResponse = await studentRepository.getListWorks(idCourse);
          if (worksResponse.code === 200 && worksResponse.response) setWorksList(worksResponse.response);
          const remindersResponse = await studentRepository.getListReminders(idCourse);
          if (remindersResponse.code === 200 && remindersResponse.response) setRemindersList(remindersResponse.response);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
        const dateToSelect = isWeekend(today) ? getNextBusinessDay(today) : today;
        setSelectedDate(dateToSelect);
        onDayPress({ dateString: dateToSelect });
      }
    };
    loadData();
  }, []);

  const findDaySchool = (dateString) => {
    if (!calendarData) return null;
    const [, month, day] = dateString.split('-');
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);
    if (calendarData[monthNum]?.data_days) {
      for (const weekNum in calendarData[monthNum].data_days) {
        const weekData = calendarData[monthNum].data_days[weekNum];
        for (const dayKey in weekData) {
          if (parseInt(weekData[dayKey].day, 10) === dayNum) return weekData[dayKey].day_school;
        }
      }
    }
    return null;
  };

  const isDateChecked = (dateString) => {
    if (!checkDaysData) return false;
    const [, month, day] = dateString.split('-');
    return !!(checkDaysData[month] && checkDaysData[month][day]);
  };

  const getCheckDayData = (dateString) => {
    if (!checkDaysData) return null;
    const [, month, day] = dateString.split('-');
    return checkDaysData[month]?.[day] || null;
  };

  const getWorksForDate = (dateString) => {
    if (!worksList) return [];
    const [, month, day] = dateString.split('-');
    if (worksList[month]?.[day]) {
      const works = worksList[month][day];
      return Array.isArray(works) ? works : [works];
    }
    return [];
  };

  const getRemindersForDate = (dateString) => {
    if (!remindersList) return [];
    const [, month, day] = dateString.split('-');
    if (remindersList[month]?.[day]) {
      const reminders = remindersList[month][day];
      return Array.isArray(reminders) ? reminders : [reminders];
    }
    return [];
  };

  const toggleCardExpansion = useCallback((cardId) => {
    setExpandedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  }, []);

  const markedDates = {
    [today]: { selected: true, marked: true, selectedColor: '#002c5d' },
    ...(selectedDate && selectedDate !== today ? {
      [selectedDate]: { selected: true, selectedColor: '#cbd5e1', selectedTextColor: '#002c5d' },
    } : {}),
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    setSelectedDaySchool(findDaySchool(day.dateString));
    setSwitchValue(isDateChecked(day.dateString));
    const checkDayData = getCheckDayData(day.dateString);
    setDateCheck(checkDayData?.date_check || null);
    setSelectedDayWorks(getWorksForDate(day.dateString));
    setSelectedDayReminders(getRemindersForDate(day.dateString));
    setExpandedCards({});
  };

  return (
    <SafeAreaView style={agendaStyles.mainContainer} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      <ScreenHeader title="Agenda Virtual" onBack={() => navigation.goBack()} />

      <ScrollView style={agendaStyles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={agendaStyles.loadingContainer}>
            <ActivityIndicator size="large" color="#002c5d" />
            <Text style={agendaStyles.loadingText}>Cargando calendario...</Text>
          </View>
        )}

        <Card style={agendaStyles.calendarCard} elevation={3}>
          <Card.Content>
            <Calendar
              current={today}
              onDayPress={onDayPress}
              markedDates={markedDates}
              theme={{
                backgroundColor: '#ffffff', calendarBackground: '#ffffff',
                textSectionTitleColor: '#94a3b8', selectedDayBackgroundColor: '#002c5d',
                selectedDayTextColor: '#ffffff', todayTextColor: '#002c5d',
                dayTextColor: '#0f172a', textDisabledColor: '#e2e8f0',
                dotColor: '#002c5d', selectedDotColor: '#ffffff',
                arrowColor: '#002c5d', monthTextColor: '#002c5d',
                textDayFontWeight: '500', textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600', textDayFontSize: 14,
                textMonthFontSize: 18, textDayHeaderFontSize: 11,
              }}
              hideExtraDays={true}
              firstDay={1}
              enableSwipeMonths={true}
            />
          </Card.Content>
        </Card>

        {selectedDate && (
          <View style={agendaStyles.eventsSection}>
            <View style={agendaStyles.eventsSectionHeader}>
              <Text style={agendaStyles.eventsSectionTitle}>Eventos del día</Text>
              <Badge style={agendaStyles.activityBadge} size={20}>
                {selectedDayWorks.length + selectedDayReminders.length} eventos
              </Badge>
            </View>
            <View style={agendaStyles.dateSubtitleContainer}>
              <Text style={agendaStyles.dateSubtitle}>
                {(() => {
                  const [year, month, day] = selectedDate.split('-');
                  const dateText = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
                    .toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
                  return selectedDaySchool ? `${dateText} - Día ${selectedDaySchool}` : dateText;
                })()}
              </Text>
            </View>

            <View style={agendaStyles.eventsList}>
              {selectedDayWorks.length === 0 && selectedDayReminders.length === 0 ? (
                <Card style={agendaStyles.emptyStateCard} elevation={1}>
                  <Card.Content style={agendaStyles.emptyStateContent}>
                    <Text variant="bodyMedium" style={agendaStyles.noEventsText}>No hay eventos programados para este día.</Text>
                  </Card.Content>
                </Card>
              ) : (
                <>
                  {selectedDayWorks.map((work, index) => {
                    const workId = work.id_work ? `work-${work.id_work}` : `work-${selectedDate}-${index}`;
                    return <WorkCard key={workId} work={work} workId={workId} isExpanded={!!expandedCards[workId]} onToggle={toggleCardExpansion} />;
                  })}
                  {selectedDayReminders.map((reminder, index) => {
                    const reminderId = reminder.id_reminder ? `reminder-${reminder.id_reminder}` : `reminder-${selectedDate}-${index}`;
                    return <ReminderCard key={reminderId} reminder={reminder} reminderId={reminderId} isExpanded={!!expandedCards[reminderId]} onToggle={toggleCardExpansion} />;
                  })}
                </>
              )}
            </View>

            <View style={agendaStyles.eventsFooter}>
              <View style={agendaStyles.footerContainer}>
                <Text variant="bodyMedium" style={agendaStyles.dateCheckText}>
                  {dateCheck ? `Revisado el ${dateCheck}` : 'Sin revisión'}
                </Text>
                <Switch value={switchValue} onValueChange={(value) => { if (value === true) setSwitchValue(value); }} color="#002c5d" />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const agendaStyles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#f8f6f6' },
  content: { flex: 1, padding: 16, backgroundColor: '#f8f6f6' },
  calendarCard: { marginBottom: 16, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  eventsSection: { marginBottom: 24 },
  eventsSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  eventsSectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', letterSpacing: -0.5 },
  activityBadge: { backgroundColor: '#f1f5f9', color: '#64748b', fontSize: 10, fontWeight: '600' },
  dateSubtitleContainer: { marginBottom: 12 },
  dateSubtitle: { fontSize: 12, color: '#64748b', textTransform: 'capitalize' },
  eventsList: { gap: 12 },
  emptyStateCard: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 12 },
  emptyStateContent: { paddingVertical: 8 },
  workCard: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1, marginBottom: 10, overflow: 'hidden' },
  workCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingLeft: 16, paddingRight: 4, paddingVertical: 12 },
  workIconContainer: { width: 48, height: 48, borderRadius: 8, backgroundColor: 'rgba(0, 44, 93, 0.1)', alignItems: 'center', justifyContent: 'center' },
  workIcon: { backgroundColor: 'transparent' },
  reminderIconContainer: { width: 48, height: 48, borderRadius: 8, backgroundColor: 'rgba(0, 44, 93, 0.1)', alignItems: 'center', justifyContent: 'center' },
  reminderIcon: { backgroundColor: 'transparent' },
  workCardHeaderContent: { flex: 1 },
  workTitle: { fontSize: 16, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  workSubtitle: { fontSize: 14, color: '#64748b' },
  chevronContainer: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  chevronIcon: { backgroundColor: 'transparent' },
  workCardExpandedContent: { paddingHorizontal: 16, paddingBottom: 16 },
  workDivider: { marginBottom: 12, backgroundColor: '#f1f5f9' },
  workDescriptionContainer: { marginBottom: 12 },
  workFooter: { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  workFooterText: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic' },
  eventsFooter: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 16, paddingVertical: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  noEventsText: { color: '#64748b', fontStyle: 'italic', textAlign: 'center' },
  loadingContainer: { padding: 20, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 16, color: '#64748b', fontSize: 14 },
  footerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flex: 1 },
  dateCheckText: { color: '#64748b', fontSize: 14, flex: 1, marginRight: 8, fontStyle: 'italic' },
});

export default AgendaVirtualScreen;
