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
import { getInfo, getInfoStudent, getListWorks, getListReminders } from '../services/authService';

// Componente memoizado para Card de Trabajo
const WorkCard = memo(({ work, workId, isExpanded, onToggle }) => {
  console.log(`WorkCard ${workId} rendering, isExpanded: ${isExpanded}`);
  const { width } = useWindowDimensions();
  
  // Configuración de estilos para RenderHtml
  const htmlStyles = {
    body: {
      color: '#64748b',
      fontSize: 14,
      lineHeight: 20,
    },
    p: {
      marginTop: 0,
      marginBottom: 8,
    },
    a: {
      color: '#002c5d',
      textDecorationLine: 'underline',
    },
  };
  
  return (
    <Card style={styles.workCard} elevation={1}>
      <TouchableOpacity
        onPress={() => {
          console.log('Work card clicked:', workId);
          onToggle(workId);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.workCardHeader}>
          <View style={styles.workIconContainer}>
            <Avatar.Icon 
              icon="file-document-edit" 
              size={48} 
              style={styles.workIcon}
              color="#002c5d"
            />
          </View>
          
          <View style={styles.workCardHeaderContent}>
            <Text style={styles.workTitle} numberOfLines={isExpanded ? 0 : 1}>
              {work.subject || 'Sin título'}
            </Text>
            <Text style={styles.workSubtitle} numberOfLines={1}>
              {work.name_teacher || 'Sin profesor'}
            </Text>
          </View>
          
          <View style={styles.chevronContainer}>
            <Avatar.Icon 
              icon={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={32}
              style={styles.chevronIcon}
              color="#002c5d"
            />
          </View>
        </View>

        {isExpanded && (
          <View style={styles.workCardExpandedContent}>
            <Divider style={styles.workDivider} />
            
            {work.description && (
              <View style={styles.workDescriptionContainer}>
                <RenderHtml
                  contentWidth={width - 64}
                  source={{ html: work.description }}
                  tagsStyles={htmlStyles}
                />
              </View>
            )}
            
            {work.date_creation && (
              <View style={styles.workFooter}>
                <Text style={styles.workFooterText}>
                  Creado: {work.date_creation}
                </Text>
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
  console.log(`ReminderCard ${reminderId} rendering, isExpanded: ${isExpanded}`);
  const { width } = useWindowDimensions();
  
  // Configuración de estilos para RenderHtml
  const htmlStyles = {
    body: {
      color: '#64748b',
      fontSize: 14,
      lineHeight: 20,
    },
    p: {
      marginTop: 0,
      marginBottom: 8,
    },
    a: {
      color: '#002c5d',
      textDecorationLine: 'underline',
    },
  };
  
  return (
    <Card style={styles.workCard} elevation={1}>
      <TouchableOpacity
        onPress={() => {
          console.log('Reminder card clicked:', reminderId);
          onToggle(reminderId);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.workCardHeader}>
          <View style={styles.reminderIconContainer}>
            <Avatar.Icon 
              icon="bell-ring" 
              size={48} 
              style={styles.reminderIcon}
              color="#002c5d"
            />
          </View>
          
          <View style={styles.workCardHeaderContent}>
            <Text style={styles.workTitle} numberOfLines={isExpanded ? 0 : 1}>
              RECORDATORIO
            </Text>
            <Text style={styles.workSubtitle} numberOfLines={1}>
              Otros
            </Text>
          </View>
          
          <View style={styles.chevronContainer}>
            <Avatar.Icon 
              icon={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={32}
              style={styles.chevronIcon}
              color="#002c5d"
            />
          </View>
        </View>

        {isExpanded && (
          <View style={styles.workCardExpandedContent}>
            <Divider style={styles.workDivider} />
            
            {reminder.description && (
              <View style={styles.workDescriptionContainer}>
                <RenderHtml
                  contentWidth={width - 64}
                  source={{ html: reminder.description }}
                  tagsStyles={htmlStyles}
                />
              </View>
            )}
            
            {reminder.date_creation && (
              <View style={styles.workFooter}>
                <Text style={styles.workFooterText}>
                  Creado: {reminder.date_creation}
                </Text>
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
  monthNames: [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ],
  monthNamesShort: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mié.', 'Jue.', 'Vie.', 'Sáb.'],
  today: 'Hoy'
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
  
  // Estados para datos de agenda virtual
  const [userInfo, setUserInfo] = useState(null); // Información del usuario
  const [studentInfo, setStudentInfo] = useState(null); // {id_course, course}
  const [worksList, setWorksList] = useState(null); // Lista de trabajos por mes/día
  const [remindersList, setRemindersList] = useState(null); // Lista de recordatorios por mes/día
  
  // Estados para eventos del día seleccionado
  const [selectedDayWorks, setSelectedDayWorks] = useState([]); // Trabajos del día seleccionado
  const [selectedDayReminders, setSelectedDayReminders] = useState([]); // Recordatorios del día seleccionado
  const [expandedCards, setExpandedCards] = useState({}); // Control de cards expandidos/colapsados

  // Debug: ver cambios en expandedCards
  useEffect(() => {
    console.log('===== Estado de expandedCards =====');
    console.log(JSON.stringify(expandedCards, null, 2));
    console.log('===================================');
  }, [expandedCards]);

  // Recargar datos cuando selectedDate, worksList, remindersList o calendarData cambien
  useEffect(() => {
    if (selectedDate) {
      console.log('Recargando datos para fecha seleccionada:', selectedDate);
      
      // Obtener trabajos del día seleccionado
      const worksForDay = getWorksForDate(selectedDate);
      console.log('Trabajos encontrados:', worksForDay.length);
      
      // Obtener recordatorios del día seleccionado
      const remindersForDay = getRemindersForDate(selectedDate);
      console.log('Recordatorios encontrados:', remindersForDay.length);
      
      setSelectedDayWorks(worksForDay);
      setSelectedDayReminders(remindersForDay);
      
      // Actualizar day_school si calendarData está disponible
      if (calendarData) {
        const daySchool = findDaySchool(selectedDate);
        setSelectedDaySchool(daySchool);
        console.log('Day school actualizado:', daySchool);
      }
      
      // Actualizar información de revisión si checkDaysData está disponible
      if (checkDaysData) {
        const isChecked = isDateChecked(selectedDate);
        setSwitchValue(isChecked);
        
        const checkDayData = getCheckDayData(selectedDate);
        if (checkDayData && checkDayData.date_check) {
          setDateCheck(checkDayData.date_check);
          console.log('Date check actualizado:', checkDayData.date_check);
        } else {
          setDateCheck(null);
        }
      }
    }
  }, [selectedDate, worksList, remindersList, calendarData, checkDaysData]);

  // Obtener fecha actual en zona horaria local
  const getTodayLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Verificar si una fecha es fin de semana
  const isWeekend = (dateString) => {
    const [year, month, day] = dateString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado
    return dayOfWeek === 0 || dayOfWeek === 6;
  };
  
  // Obtener el siguiente día hábil si la fecha cae en fin de semana
  const getNextBusinessDay = (dateString) => {
    const [year, month, day] = dateString.split('-');
    let date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayOfWeek = date.getDay();
    
    if (dayOfWeek === 6) {
      // Si es sábado, avanzar 2 días (al lunes)
      date.setDate(date.getDate() + 2);
    } else if (dayOfWeek === 0) {
      // Si es domingo, avanzar 1 día (al lunes)
      date.setDate(date.getDate() + 1);
    }
    
    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    const newDay = String(date.getDate()).padStart(2, '0');
    return `${newYear}-${newMonth}-${newDay}`;
  };
  
  const today = getTodayLocal();

  // Función para consumir el servicio de calendario
  const fetchCalendarData = async () => {
    try {
      const formData = new FormData();
      formData.append('base', 'caa');
      formData.append('param', 'getCalendar');
      formData.append('mod_check', 'false');

      const response = await fetch(
        'https://www.comunidadvirtualcaa.co/Work_classV1/controller/cont.php',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      
      if (data.code === 200) {
        setCalendarData(data.response);
        console.log('Calendario cargado');
      } else {
        console.error('Error en la respuesta del servidor (getCalendar):', data);
      }
    } catch (error) {
      console.error('Error al cargar el calendario:', error);
    }
  };

  // Función para consumir el servicio de días marcados
  const fetchCheckDaysData = async () => {
    try {
      const formData = new FormData();
      formData.append('base', 'caa');
      formData.append('param', 'getCheckDays');
      formData.append('id_student', 'false');

      const response = await fetch(
        'https://www.comunidadvirtualcaa.co/Work_classV1/controller/cont.php',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      
      if (data.code === 200) {
        setCheckDaysData(data.response);
        console.log('Días marcados cargados');
      } else {
        console.error('Error en la respuesta del servidor (getCheckDays):', data);
      }
    } catch (error) {
      console.error('Error al cargar los días marcados:', error);
    }
  };

  // Cargar datos al iniciar la pantalla
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Cargar calendario y días marcados
        await Promise.all([
          fetchCalendarData(),
          fetchCheckDaysData()
        ]);
        
        // Obtener información del usuario
        console.log('Cargando información del usuario...');
        const infoResponse = await getInfo();
        
        if (infoResponse.code === 200 && infoResponse.response) {
          const userData = infoResponse.response[0];
          
          if (userData) {
            setUserInfo(userData);
            console.log('=== Información del usuario cargada ===');
            console.log('ID:', userData.ID);
            console.log('NOMBRE:', userData.NOMBRE);
            console.log('CURSO:', userData.CURSO);
            console.log('=====================================');
          }
        }
        
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
      } finally {
        setLoading(false);
        
        // Cargar automáticamente la información del día actual
        // Si es fin de semana, seleccionar el siguiente día hábil
        const dateToSelect = isWeekend(today) ? getNextBusinessDay(today) : today;
        console.log('Fecha a seleccionar:', dateToSelect, isWeekend(today) ? '(siguiente día hábil)' : '(día actual)');
        
        // Establecer la fecha seleccionada primero
        setSelectedDate(dateToSelect);
        
        // Luego llamar a onDayPress para cargar la información adicional
        onDayPress({ dateString: dateToSelect });
      }
    };
    
    loadData();
  }, []);

  // Función para buscar el day_school de una fecha específica
  const findDaySchool = (dateString) => {
    if (!calendarData) return null;

    // Convertir la fecha seleccionada (YYYY-MM-DD) a componentes
    const [year, month, day] = dateString.split('-');
    const monthNum = parseInt(month, 10); // Número del mes (1-12)
    const dayNum = parseInt(day, 10); // Número del día

    // Buscar en la estructura del calendario
    if (calendarData[monthNum]) {
      const monthData = calendarData[monthNum];
      
      // Buscar en todas las semanas del mes
      if (monthData.data_days) {
        for (const weekNum in monthData.data_days) {
          const weekData = monthData.data_days[weekNum];
          
          // Buscar en todos los días de la semana
          for (const dayKey in weekData) {
            const dayData = weekData[dayKey];
            
            // Comparar el día
            if (parseInt(dayData.day, 10) === dayNum) {
              return dayData.day_school;
            }
          }
        }
      }
    }
    
    return null;
  };

  // Función para verificar si una fecha existe en checkDaysData
  const isDateChecked = (dateString) => {
    console.log('Verificando si la fecha está marcada:', dateString);
    //console.log('Días marcados:', checkDaysData);
    if (!checkDaysData) return false;

    // Extraer día y mes de la fecha (YYYY-MM-DD)
    const [year, month, day] = dateString.split('-');
    // day y month ya están en formato con ceros a la izquierda (ej: "01", "02")
    
    console.log('Buscando día:', day, 'mes:', month);

    // Estructura: checkDaysData[mes][dia]
    // Ejemplo: checkDaysData["01"]["12"] para el 12 de enero
    if (checkDaysData[month] && checkDaysData[month][day]) {
      console.log('Fecha encontrada:', checkDaysData[month][day]);
      return true;
    }

    console.log('Fecha no encontrada');
    return false;
  };

  // Función para obtener los datos de checkDaysData para una fecha
  const getCheckDayData = (dateString) => {
    if (!checkDaysData) return null;

    // Extraer día y mes de la fecha (YYYY-MM-DD)
    const [year, month, day] = dateString.split('-');
    
    // Verificar si existe en checkDaysData
    if (checkDaysData[month] && checkDaysData[month][day]) {
      return checkDaysData[month][day];
    }

    return null;
  };

  // Función para obtener los trabajos de una fecha específica
  const getWorksForDate = (dateString) => {
    if (!worksList) return [];

    // Extraer día y mes de la fecha (YYYY-MM-DD)
    const [year, month, day] = dateString.split('-');
    
    console.log('Buscando trabajos para:', { month, day });
    
    // Verificar si existe el mes en worksList
    if (worksList[month]) {
      // Verificar si existe el día en ese mes
      if (worksList[month][day]) {
        const works = worksList[month][day];
        console.log('Trabajos encontrados:', works);
        return Array.isArray(works) ? works : [works];
      }
    }

    console.log('No se encontraron trabajos para esta fecha');
    return [];
  };

  // Función para obtener los recordatorios de una fecha específica
  const getRemindersForDate = (dateString) => {
    if (!remindersList) return [];

    // Extraer día y mes de la fecha (YYYY-MM-DD)
    const [year, month, day] = dateString.split('-');
    
    console.log('Buscando recordatorios para:', { month, day });
    
    // Verificar si existe el mes en remindersList
    if (remindersList[month]) {
      // Verificar si existe el día en ese mes
      if (remindersList[month][day]) {
        const reminders = remindersList[month][day];
        console.log('Recordatorios encontrados:', reminders);
        return Array.isArray(reminders) ? reminders : [reminders];
      }
    }

    console.log('No se encontraron recordatorios para esta fecha');
    return [];
  };

  // Función para alternar la expansión de un card
  const toggleCardExpansion = useCallback((cardId) => {
    console.log('Toggling card:', cardId);
    setExpandedCards(prev => {
      const newState = { ...prev };
      newState[cardId] = !newState[cardId];
      console.log('New expanded state:', newState);
      return newState;
    });
  }, []);

  // Días marcados (puedes agregar eventos aquí)
  const markedDates = {
    [today]: { 
      selected: true, 
      marked: true, 
      selectedColor: '#002c5d' 
    },
    ...(selectedDate && selectedDate !== today ? {
      [selectedDate]: { 
        selected: true, 
        selectedColor: '#cbd5e1',
        selectedTextColor: '#002c5d',
      }
    } : {})
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    const daySchool = findDaySchool(day.dateString);
    setSelectedDaySchool(daySchool);
    
    // Verificar si la fecha está marcada y actualizar el switch
    const isChecked = isDateChecked(day.dateString);
    setSwitchValue(isChecked);
    
    // Obtener datos del día marcado (incluyendo date_check)
    const checkDayData = getCheckDayData(day.dateString);
    if (checkDayData && checkDayData.date_check) {
      setDateCheck(checkDayData.date_check);
    } else {
      setDateCheck(null);
    }
    
    // Obtener trabajos del día seleccionado
    const worksForDay = getWorksForDate(day.dateString);
    console.log('===== TRABAJOS DEL DÍA =====');
    worksForDay.forEach((work, idx) => {
      console.log(`Work ${idx}:`, { id_work: work.id_work, subject: work.subject });
    });
    setSelectedDayWorks(worksForDay);
    
    // Obtener recordatorios del día seleccionado
    const remindersForDay = getRemindersForDate(day.dateString);
    console.log('===== RECORDATORIOS DEL DÍA =====');
    remindersForDay.forEach((reminder, idx) => {
      console.log(`Reminder ${idx}:`, { id_reminder: reminder.id_reminder, description: reminder.description });
    });
    setSelectedDayReminders(remindersForDay);
    
    // Limpiar estado de cards expandidos al cambiar de día
    setExpandedCards({});
  };

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Avatar.Icon icon="arrow-left" size={40} style={styles.backIcon} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agenda Virtual</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Indicador de carga */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#002c5d" />
            <Text style={styles.loadingText}>Cargando calendario...</Text>
          </View>
        )}

        {/* Card del Calendario */}
        <Card style={styles.calendarCard} elevation={3}>
          <Card.Content>
            <Calendar
              current={today}
              onDayPress={onDayPress}
              markedDates={markedDates}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#94a3b8',
                selectedDayBackgroundColor: '#002c5d',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#002c5d',
                dayTextColor: '#0f172a',
                textDisabledColor: '#e2e8f0',
                dotColor: '#002c5d',
                selectedDotColor: '#ffffff',
                arrowColor: '#002c5d',
                monthTextColor: '#002c5d',
                indicatorColor: '#002c5d',
                textDayFontFamily: 'System',
                textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 14,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 11
              }}
              hideExtraDays={true}
              firstDay={1}
              enableSwipeMonths={true}
            />
          </Card.Content>
        </Card>

        {/* Eventos del día seleccionado */}
        {selectedDate && (
          <View style={styles.eventsSection}>
            {/* Header con título y badge de conteo */}
            <View style={styles.eventsSectionHeader}>
              <Text style={styles.eventsSectionTitle}>Eventos del día</Text>
              <Badge style={styles.activityBadge} size={20}>
                {selectedDayWorks.length + selectedDayReminders.length} eventos
              </Badge>
            </View>
            <View style={styles.dateSubtitleContainer}>
              <Text style={styles.dateSubtitle}>
                {(() => {
                  const [year, month, day] = selectedDate.split('-');
                  const dateText = new Date(
                    parseInt(year), 
                    parseInt(month) - 1, 
                    parseInt(day)
                  ).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long'
                  });
                  
                  if (selectedDaySchool) {
                    return `${dateText} - Día ${selectedDaySchool}`;
                  }
                  return dateText;
                })()}
              </Text>
            </View>

            {/* Lista de eventos */}
            <View style={styles.eventsList}>
              {/* Mensaje cuando no hay eventos */}
              {selectedDayWorks.length === 0 && selectedDayReminders.length === 0 ? (
                <Card style={styles.emptyStateCard} elevation={1}>
                  <Card.Content style={styles.emptyStateContent}>
                    <Text variant="bodyMedium" style={styles.noEventsText}>
                      No hay eventos programados para este día.
                    </Text>
                  </Card.Content>
                </Card>
              ) : (
                <>
                  {/* Renderizar trabajos del día */}
                  {selectedDayWorks.map((work, index) => {
                    const workId = work.id_work ? `work-${work.id_work}` : `work-${selectedDate}-${index}`;
                    const isExpanded = !!expandedCards[workId];
                    
                    return (
                      <WorkCard
                        key={workId}
                        work={work}
                        workId={workId}
                        isExpanded={isExpanded}
                        onToggle={toggleCardExpansion}
                      />
                    );
                  })}

                  {/* Renderizar recordatorios del día */}
                  {selectedDayReminders.map((reminder, index) => {
                    const reminderId = reminder.id_reminder ? `reminder-${reminder.id_reminder}` : `reminder-${selectedDate}-${index}`;
                    const isExpanded = !!expandedCards[reminderId];
                    
                    return (
                      <ReminderCard
                        key={reminderId}
                        reminder={reminder}
                        reminderId={reminderId}
                        isExpanded={isExpanded}
                        onToggle={toggleCardExpansion}
                      />
                    );
                  })}
                </>
              )}
            </View>

            {/* Footer con switch de revisión */}
            <View style={styles.eventsFooter}>
              <View style={styles.footerContainer}>
                <Text variant="bodyMedium" style={styles.dateCheckText}>
                  {dateCheck ? `Revisado el ${dateCheck}` : 'Sin revisión'}
                </Text>
                <Switch
                  value={switchValue}
                  onValueChange={(value) => {
                    // Solo permitir encender el switch, no apagarlo
                    if (value === true) {
                      setSwitchValue(value);
                    }
                  }}
                  color="#002c5d"
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f6f6',
  },
  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#002c5d',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#002c5d',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    backgroundColor: 'transparent',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'left',
    letterSpacing: -0.5,
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f6f6',
  },
  calendarCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  // Events Section (nuevo formato)
  eventsSection: {
    marginBottom: 24,
  },
  eventsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  eventsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  activityBadge: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
    fontSize: 10,
    fontWeight: '600',
  },
  dateSubtitleContainer: {
    marginBottom: 12,
  },
  dateSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textTransform: 'capitalize',
  },
  eventsList: {
    gap: 12,
  },
  // Empty state
  emptyStateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 12,
  },
  emptyStateContent: {
    paddingVertical: 8,
  },
  // Work Card (Tarjeta de trabajo)
  workCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  workCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 12,
  },
  workIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 44, 93, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workIcon: {
    backgroundColor: 'transparent',
  },
  reminderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 44, 93, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderIcon: {
    backgroundColor: 'transparent',
  },
  workCardHeaderContent: {
    flex: 1,
  },
  workTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  workSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  chevronContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronIcon: {
    backgroundColor: 'transparent',
  },
  workCardExpandedContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  workDivider: {
    marginBottom: 12,
    backgroundColor: '#f1f5f9',
  },
  workDescriptionContainer: {
    marginBottom: 12,
  },
  workDescriptionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  workDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  workFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  workFooterText: {
    fontSize: 12,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  // Footer
  eventsFooter: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  noEventsText: {
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 14,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  dateCheckText: {
    color: '#64748b',
    fontSize: 14,
    flex: 1,
    marginRight: 8,
    fontStyle: 'italic',
  },
});

export default AgendaVirtualScreen;
