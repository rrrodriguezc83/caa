import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Text, 
  Card,
  useTheme,
  ActivityIndicator,
  Avatar,
  IconButton,
} from 'react-native-paper';
import RenderHtml from 'react-native-render-html';
import { getInfo } from '../services/authService';

const DetalleCircularScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const { circular, auth } = route.params || {};
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [circularContent, setCircularContent] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      await fetchUserInfo();
      if (circular && circular.circular) {
        await sendConsult();
        await fetchCircularContent();
      }
    };
    loadData();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const infoResponse = await getInfo();
      if (infoResponse && infoResponse.response && infoResponse.response[0]) {
        const userData = infoResponse.response[0];
        setUserInfo(userData);
        console.log('Información de usuario obtenida:', userData);
      }
    } catch (error) {
      console.error('Error al obtener información de usuario:', error);
    }
  };

  const sendConsult = async () => {
    try {
      const formData = new FormData();
      formData.append('base', 'comunidad');
      formData.append('param', 'sendConsult');
      formData.append('num_notice', circular.circular);

      const response = await fetch(
        'https://www.comunidadvirtualcaa.co/Notices/controller/cont.php',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      console.log('Respuesta sendConsult:', data);

      // Validar respuesta: {"code":200,"response":[true]}
      if (data.code === 200 && Array.isArray(data.response) && data.response[0] === true) {
        console.log('✓ Consulta de circular registrada exitosamente');
      } else {
        console.warn('⚠ No se pudo registrar la consulta de circular correctamente:', data);
      }
    } catch (error) {
      console.error('Error al registrar consulta de circular:', error);
    }
  };

  // Función para transformar texto plano con saltos de línea a HTML
  const transformTextToHtml = (text) => {
    if (!text) return '<p>Sin contenido</p>';
    
    console.log('Texto original:', text);
   
    // Normalizar caracteres escapados
    let htmlText = text.replace(/\\"/g, '"');  // Reemplazar \" por "
    htmlText = htmlText.replace(/\\'/g, "'");  // Reemplazar \' por '
    
    // Eliminar estilos CSS no soportados en React Native
    htmlText = htmlText.replace(/border-collapse\s*:\s*collapse\s*;?/gi, '');
    
    // Reemplazar saltos de línea \n por <br>
    htmlText = htmlText.replace(/\n/g, '');
    
    // Verificar si el texto ya contiene etiquetas HTML
    const hasHtmlTags = /<[a-z][\s\S]*>/i.test(htmlText);
    
    // Si no tiene etiquetas HTML, envolver en un párrafo
    if (!hasHtmlTags) {
      htmlText = `<p>${htmlText}</p>`;
    }
    
    console.log('Texto transformado:', htmlText);
    return htmlText;
  };

  const replaceFooterPlaceholders = (footerText) => {
    if (!footerText || !userInfo) return footerText;
    
    let processedFooter = footerText;
    
    // Reemplazar $nombrecompleto con el campo nombre del usuario
    if (userInfo.NOMBRE) {
      processedFooter = processedFooter.replace(/\$nombrecompleto/g, userInfo.NOMBRE);
    }
    
    // Reemplazar $curso con el campo curso del usuario
    if (userInfo.CURSO) {
      processedFooter = processedFooter.replace(/\$curso/g, userInfo.CURSO);
    }
    
    return processedFooter;
  };

  // Función para obtener el mensaje según el valor de auth
  const getAuthMessage = () => {
    if (!auth || auth === '') {
      return 'Pendiente Autorización';
    } else if (auth.toLowerCase() === 'si') {
      return 'Autorizado';
    } else if (auth.toLowerCase() === 'no') {
      return 'No Autorizado';
    } else if (auth.toLowerCase() === 'na') {
      return 'No Requiere';
    } else {
      return 'Pendiente Autorización';
    }
  };

  // Función para obtener el estilo del card según el valor de auth
  const getAuthCardStyle = () => {
    if (!auth || auth === '') {
      return [styles.responseCard, styles.responseCardPendiente];
    } else if (auth.toLowerCase() === 'si') {
      return [styles.responseCard, styles.responseCardAutorizado];
    } else if (auth.toLowerCase() === 'no') {
      return [styles.responseCard, styles.responseCardNoAutorizado];
    } else if (auth.toLowerCase() === 'na') {
      return [styles.responseCard, styles.responseCardNoRequiere];
    } else {
      return [styles.responseCard, styles.responseCardPendiente];
    }
  };

  // Función para obtener el estilo del texto según el valor de auth
  const getAuthMessageStyle = () => {
    if (!auth || auth === '') {
      return [styles.responseMessageText, styles.responseMessagePendiente];
    } else if (auth.toLowerCase() === 'si') {
      return [styles.responseMessageText, styles.responseMessageAutorizado];
    } else if (auth.toLowerCase() === 'no') {
      return [styles.responseMessageText, styles.responseMessageNoAutorizado];
    } else if (auth.toLowerCase() === 'na') {
      return [styles.responseMessageText, styles.responseMessageNoRequiere];
    } else {
      return [styles.responseMessageText, styles.responseMessagePendiente];
    }
  };

  // Función para obtener el ícono según el valor de auth
  const getAuthIcon = () => {
    if (!auth || auth === '') {
      return 'clock-outline';
    } else if (auth.toLowerCase() === 'si') {
      return 'check-circle-outline';
    } else if (auth.toLowerCase() === 'no') {
      return 'close-circle-outline';
    } else if (auth.toLowerCase() === 'na') {
      return 'minus-circle-outline';
    } else {
      return 'clock-outline';
    }
  };

  // Función para obtener el estilo del ícono según el valor de auth
  const getAuthIconStyle = () => {
    if (!auth || auth === '') {
      return styles.iconContainerPendiente;
    } else if (auth.toLowerCase() === 'si') {
      return styles.iconContainerAutorizado;
    } else if (auth.toLowerCase() === 'no') {
      return styles.iconContainerNoAutorizado;
    } else if (auth.toLowerCase() === 'na') {
      return styles.iconContainerNoRequiere;
    } else {
      return styles.iconContainerPendiente;
    }
  };

  // Función para obtener el color del ícono según el valor de auth
  const getAuthIconColor = () => {
    if (!auth || auth === '') {
      return '#f59e0b'; // naranja
    } else if (auth.toLowerCase() === 'si') {
      return '#10b981'; // verde
    } else if (auth.toLowerCase() === 'no') {
      return '#ef4444'; // rojo
    } else if (auth.toLowerCase() === 'na') {
      return '#64748b'; // gris
    } else {
      return '#f59e0b'; // naranja
    }
  };

  const fetchCircularContent = async () => {
    try {
      setLoading(true);
      
      // Codificar el campo "circular" en base64
      const noticeBase64 = btoa(circular.circular);
      
      const formData = new FormData();
      formData.append('base', 'comunidad');
      formData.append('param', 'getNoticeContent');
      formData.append('notice', noticeBase64);

      const response = await fetch(
        'https://www.comunidadvirtualcaa.co/Notices/controller/cont.php',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      console.log('Contenido de circular recibido:', data);

      if (data.code === 200 && data.response) {
        setCircularContent(data.response);
      } else {
        console.error('Error al cargar contenido de circular');
        setCircularContent(null);
      }
    } catch (error) {
      console.error('Error al cargar contenido de circular:', error);
      setCircularContent(null);
    } finally {
      setLoading(false);
    }
  };

  if (!circular) {
    return (
      <SafeAreaView style={styles.mainContainer} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Avatar.Icon icon="arrow-left" size={40} style={styles.backIcon} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalle Circular</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.content}>
          <Card style={styles.errorCard} elevation={1}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.errorText}>
                No se encontró información de la circular.
              </Text>
            </Card.Content>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.mainContainer} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Avatar.Icon icon="arrow-left" size={40} style={styles.backIcon} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles Circular</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#002c5d" />
          <Text style={styles.loadingText}>Cargando contenido de la circular...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!circularContent) {
    return (
      <SafeAreaView style={styles.mainContainer} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Avatar.Icon icon="arrow-left" size={40} style={styles.backIcon} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles Circular</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.content}>
          <Card style={styles.errorCard} elevation={1}>
            <Card.Content>
              <Text variant="bodyMedium" style={styles.errorText}>
                No se pudo cargar el contenido de la circular.
              </Text>
            </Card.Content>
          </Card>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.mainContainer} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#002c5d" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Avatar.Icon icon="arrow-left" size={40} style={styles.backIcon} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles Circular</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Circular Card */}
        <Card style={styles.card} elevation={1}>
          <Card.Content style={styles.cardContent}>
            {/* Título */}
            <Text style={styles.title}>
              {circularContent.SUBJECT}
            </Text>

            {/* Sección de Fechas con Grid e Iconos */}
            <View style={styles.datesContainer}>
              {/* Fecha de Apertura */}
              <View style={styles.dateColumn}>
                <Text style={styles.dateLabel}>FECHA APERTURA</Text>
                <View style={styles.dateRow}>
                  <Avatar.Icon icon="calendar" size={20} style={styles.dateIconBlue} color="#002c5d" />
                  <Text style={styles.dateValue}>{circularContent.DATE_START}</Text>
                </View>
              </View>

              {/* Fecha de Cierre */}
              <View style={styles.dateColumn}>
                <Text style={styles.dateLabel}>FECHA CIERRE</Text>
                <View style={styles.dateRow}>
                  <Avatar.Icon icon="calendar-remove" size={20} style={styles.dateIconOrange} color="#ec5b13" />
                  <Text style={styles.dateValue}>{circularContent.DATE_END}</Text>
                </View>
              </View>
            </View>

            {/* Cuerpo del mensaje (HTML) */}
            <View style={styles.bodyContainer}>
              <RenderHtml
                contentWidth={width - 64}
                source={{ html: '<p>Señores<br><b>Padres de Familia</b></p>' + transformTextToHtml(circularContent.BODY) }}
                ignoredDomTags={['input']}
                tagsStyles={{
                  body: { 
                    color: '#475569', 
                    fontSize: 16, 
                    lineHeight: 24,
                    margin: 0,
                    padding: 0,
                  },
                  p: { 
                    margin: 0,
                    marginBottom: 12,
                  },
                  strong: { 
                    fontWeight: 'bold', 
                    color: '#002c5d' 
                  },
                  b: { 
                    fontWeight: 'bold', 
                    color: '#002c5d' 
                  },
                  em: { 
                    fontStyle: 'italic' 
                  },
                  i: { 
                    fontStyle: 'italic' 
                  },
                  u: { 
                    textDecorationLine: 'underline',
                    textDecorationColor: '#475569',
                  },
                  h1: { color: '#002c5d', fontSize: 20, marginBottom: 8, fontWeight: 'bold' },
                  h2: { color: '#002c5d', fontSize: 18, marginBottom: 8, fontWeight: 'bold' },
                  h3: { color: '#002c5d', fontSize: 16, marginBottom: 8, fontWeight: 'bold' },
                  li: { marginBottom: 8, color: '#475569' },
                  table: {
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                    borderStyle: 'solid',
                    marginBottom: 12,
                  },
                  th: {
                    backgroundColor: '#f8fafc',
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                    borderStyle: 'solid',
                    padding: 8,
                    fontWeight: 'bold',
                    color: '#002c5d',
                    textAlign: 'center',
                  },
                  td: {
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                    borderStyle: 'solid',
                    padding: 8,
                    color: '#475569',
                  },
                  tr: {
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                    borderStyle: 'solid',
                  },
                  thead: {
                    backgroundColor: '#f8fafc',
                  },
                  tbody: {
                    backgroundColor: '#FFFFFF',
                  },
                }}
              />
            </View>
          </Card.Content>

          {/* Footer interno con fondo gris */}
          <View style={styles.footerInterno}>
            <RenderHtml
              contentWidth={width - 64}
              source={{ 
                html: transformTextToHtml(
                  circularContent.FOOTER 
                    ? replaceFooterPlaceholders(circularContent.FOOTER)
                    : `Nosotros los padres del estudiante ${userInfo?.NOMBRE || 'Usuario'} del curso ${userInfo?.CURSO || ''}, estamos enterados de la circular.`
                )
              }}
              ignoredDomTags={['input']}
              tagsStyles={{
                body: { 
                  color: '#475569', 
                  fontSize: 14, 
                  lineHeight: 22,
                  margin: 0,
                  padding: 0,
                  fontStyle: 'italic',
                  textAlign: 'justify',
                },
                p: { 
                  margin: 0,
                  marginBottom: 0,
                  textAlign: 'justify',
                },
                strong: { 
                  fontWeight: 'bold', 
                  color: '#002c5d' 
                },
                b: { 
                  fontWeight: 'bold', 
                  color: '#002c5d' 
                },
                em: { 
                  fontStyle: 'italic' 
                },
                i: { 
                  fontStyle: 'italic' 
                },
                u: { 
                  textDecorationLine: 'underline',
                  textDecorationColor: '#475569',
                },
              }}
            />
          </View>
        </Card>

        {/* Mensaje para circulares con respuesta */}
        {circularContent.TYPE_NOT === '1' && (
          <Card style={getAuthCardStyle()} elevation={1}>
            <Card.Content style={styles.responseCardContent}>
              <View style={getAuthIconStyle()}>
                <Avatar.Icon 
                  icon={getAuthIcon()} 
                  size={28} 
                  style={styles.authIcon} 
                  color={getAuthIconColor()} 
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={getAuthMessageStyle()}>
                  {getAuthMessage()}
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Footer fijo con botón de acción */}
      <View style={styles.footerFixed}>
        <TouchableOpacity 
          style={styles.backButtonFixed}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Avatar.Icon icon="arrow-left" size={24} style={styles.backButtonIcon} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
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
  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f6f6',
  },
  loadingText: {
    marginTop: 16,
    color: '#64748b',
    fontSize: 14,
  },
  // Content
  content: {
    flex: 1,
    backgroundColor: '#f8f6f6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Espacio para el footer fijo
  },
  // Main card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 20,
  },
  errorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 16,
  },
  errorText: {
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
  },
  // Title
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#002c5d',
    lineHeight: 32,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  // Dates section
  datesContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 16,
  },
  dateColumn: {
    flex: 1,
    gap: 4,
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateIconOrange: {
    backgroundColor: 'transparent',
    width: 20,
    height: 20,
  },
  dateIconBlue: {
    backgroundColor: 'transparent',
    width: 20,
    height: 20,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  // Body content
  bodyContainer: {
    marginBottom: 0,
  },
  // Footer interno
  footerInterno: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(248, 246, 246, 0.5)',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  // Response card
  responseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  responseCardAutorizado: {
    backgroundColor: '#FFFFFF',
  },
  responseCardNoAutorizado: {
    backgroundColor: '#FFFFFF',
  },
  responseCardNoRequiere: {
    backgroundColor: '#FFFFFF',
  },
  responseCardPendiente: {
    backgroundColor: '#FFFFFF',
  },
  responseCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  // Icon containers
  iconContainerAutorizado: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1fae5', // green-100
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerNoAutorizado: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerNoRequiere: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e2e8f0', // slate-200
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerPendiente: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fed7aa', // orange-100
    alignItems: 'center',
    justifyContent: 'center',
  },
  authIcon: {
    backgroundColor: 'transparent',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  responseMessageText: {
    fontWeight: '700', // font-bold
    textAlign: 'center',
    fontSize: 18, // text-lg
    lineHeight: 24,
    letterSpacing: -0.45, // tracking-tight (-0.025em en 18px)
    textTransform: 'uppercase',
  },
  responseMessageAutorizado: {
    color: '#10b981', // green-600
  },
  responseMessageNoAutorizado: {
    color: '#ef4444', // red-600
  },
  responseMessageNoRequiere: {
    color: '#64748b', // slate-600
  },
  responseMessagePendiente: {
    color: '#f59e0b', // orange-600
  },
  // Footer fijo
  footerFixed: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 16,
  },
  backButtonFixed: {
    backgroundColor: '#002c5d',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButtonIcon: {
    backgroundColor: 'transparent',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DetalleCircularScreen;
