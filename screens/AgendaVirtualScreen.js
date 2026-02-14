import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Appbar, 
  Text, 
  Card,
  useTheme,
  List,
  Switch,
  Divider,
} from 'react-native-paper';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { getInfo, getInfoStudent, getListWorks, getListReminders } from '../services/authService';

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

  // Obtener fecha actual en zona horaria local
  const getTodayLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  // Días marcados (puedes agregar eventos aquí)
  const markedDates = {
    [today]: { 
      selected: true, 
      marked: true, 
      selectedColor: '#1976D2' 
    },
    ...(selectedDate && selectedDate !== today ? {
      [selectedDate]: { 
        selected: true, 
        selectedColor: '#BBDEFB',
        selectedTextColor: '#01579B',
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
  };

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      
      {/* App Bar */}
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
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Appbar.Content title="Agenda Virtual" titleStyle={styles.appBarTitle} />
      </Appbar.Header>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Indicador de carga */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1976D2" />
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
                textSectionTitleColor: '#01579B',
                selectedDayBackgroundColor: '#1976D2',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#1976D2',
                dayTextColor: '#01579B',
                textDisabledColor: '#d9e1e8',
                dotColor: '#1976D2',
                selectedDotColor: '#ffffff',
                arrowColor: '#1976D2',
                monthTextColor: '#1976D2',
                indicatorColor: '#1976D2',
                textDayFontFamily: 'System',
                textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
                textDayFontWeight: '400',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 14,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 12
              }}
              hideExtraDays={true}
              firstDay={1}
              enableSwipeMonths={true}
            />
          </Card.Content>
        </Card>

        {/* Card de información del día seleccionado */}
        {selectedDate && (
          <Card style={styles.eventCard} elevation={3}>
            <Card.Title 
              title="Eventos del día" 
              titleStyle={styles.cardTitle}
              subtitle={
                (() => {
                  // Parsear la fecha correctamente para evitar problemas de zona horaria
                  const [year, month, day] = selectedDate.split('-');
                  const dateText = new Date(
                    parseInt(year), 
                    parseInt(month) - 1, 
                    parseInt(day)
                  ).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  });
                  
                  if (selectedDaySchool) {
                    return `${dateText} - Día ${selectedDaySchool}`;
                  }
                  return dateText;
                })()
              }
              subtitleStyle={styles.cardSubtitle}
            />
            <Card.Content>
              <Text variant="bodyMedium" style={styles.noEventsText}>
                No hay eventos programados para este día.
              </Text>
            </Card.Content>
            <Divider style={styles.cardDivider} />
            <Card.Actions style={styles.cardActions}>
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
                  color="#1976D2"
                />
              </View>
            </Card.Actions>
          </Card>
        )}

        {/* Card con próximos eventos (placeholder) */}
        <Card style={styles.eventsCard} elevation={3}>
          <Card.Title 
            title="Próximos eventos" 
            titleStyle={styles.cardTitle}
          />
          <Card.Content>
            <List.Item
              title="Sin eventos próximos"
              description="No hay eventos programados"
              left={props => <List.Icon {...props} icon="calendar-blank" color="#999" />}
              titleStyle={styles.listItemTitle}
              descriptionStyle={styles.listItemDescription}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  appBar: {
    backgroundColor: '#1976D2',
  },
  appBarTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  calendarCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  eventCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  eventsCard: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  cardTitle: {
    color: '#1976D2',
    fontWeight: 'bold',
  },
  cardSubtitle: {
    color: '#01579B',
    textTransform: 'capitalize',
  },
  noEventsText: {
    color: '#666',
    fontStyle: 'italic',
  },
  listItemTitle: {
    color: '#01579B',
  },
  listItemDescription: {
    color: '#666',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#1976D2',
    fontSize: 16,
  },
  cardDivider: {
    marginTop: 8,
    backgroundColor: '#BBDEFB',
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  dateCheckText: {
    color: '#01579B',
    fontSize: 14,
    flex: 1,
    marginRight: 8,
    fontStyle: 'italic',
  },
});

export default AgendaVirtualScreen;
