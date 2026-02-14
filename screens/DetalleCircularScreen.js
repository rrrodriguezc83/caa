import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Appbar, 
  Text, 
  Card,
  useTheme,
  ActivityIndicator,
  Divider,
  Button,
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
      return 'Responder la circular en la página Web de la Comunidad Virtual';
    } else if (auth.toLowerCase() === 'si') {
      return 'Autorizado';
    } else if (auth.toLowerCase() === 'no') {
      return 'No Autorizado';
    } else {
      return 'Responder la circular en la página Web de la Comunidad Virtual';
    }
  };

  // Función para obtener el estilo del mensaje según el valor de auth
  const getAuthMessageStyle = () => {
    if (!auth || auth === '') {
      return styles.responseMessageText;
    } else if (auth.toLowerCase() === 'si') {
      return [styles.responseMessageText, styles.responseMessageAutorizado];
    } else if (auth.toLowerCase() === 'no') {
      return [styles.responseMessageText, styles.responseMessageNoAutorizado];
    } else {
      return styles.responseMessageText;
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
      <SafeAreaView style={styles.mainContainer} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
        <Appbar.Header elevated style={styles.appBar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
          <Appbar.Content title="Detalle Circular" titleStyle={styles.appBarTitle} />
        </Appbar.Header>
        <View style={styles.content}>
          <Card style={styles.card} elevation={3}>
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
      <SafeAreaView style={styles.mainContainer} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
        <Appbar.Header elevated style={styles.appBar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
          <Appbar.Content title={`Circular ${circular?.circular || ''}`} titleStyle={styles.appBarTitle} />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando contenido de la circular...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!circularContent) {
    return (
      <SafeAreaView style={styles.mainContainer} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
        <Appbar.Header elevated style={styles.appBar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
          <Appbar.Content title="Detalle Circular" titleStyle={styles.appBarTitle} />
        </Appbar.Header>
        <View style={styles.content}>
          <Card style={styles.card} elevation={3}>
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
        <Appbar.Content title={`Circular ${circularContent.NUM}`} titleStyle={styles.appBarTitle} />
      </Appbar.Header>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card} elevation={3}>
          <Card.Content>
            {/* Título */}
            <Text variant="headlineSmall" style={styles.title}>
              {circularContent.SUBJECT}
            </Text>

            <Divider style={styles.titleDivider} />

            {/* Fechas */}
            <View style={styles.datesContainer}>
              <Text style={styles.dateLabel}>
                Fecha de Apertura: <Text style={styles.dateValue}>{circularContent.DATE_START}</Text>
              </Text>
              <Text style={styles.dateLabel}>
                Fecha de Cierre: <Text style={styles.dateValue}>{circularContent.DATE_END}</Text>
              </Text>
            </View>

            <Divider style={styles.divider} />

            {/* Destinatarios */}
            <Text style={styles.greeting}>
              Señores{'\n'}
              Padres de Familia
            </Text>

            {/* Cuerpo del mensaje (HTML) */}
            <View style={styles.bodyContainer}>
              <RenderHtml
                contentWidth={width - 64}
                source={{ html: transformTextToHtml(circularContent.BODY) }}
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
                    marginBottom: 10,
                  },
                  strong: { 
                    fontWeight: 'bold', 
                    color: '#1976D2' 
                  },
                  b: { 
                    fontWeight: 'bold', 
                    color: '#1976D2' 
                  },
                  em: { 
                    fontStyle: 'italic' 
                  },
                  i: { 
                    fontStyle: 'italic' 
                  },
                  u: { 
                    textDecorationLine: 'underline',
                    textDecorationColor: '#01579B',
                  },
                  h1: { color: '#1976D2', fontSize: 18, marginBottom: 8 },
                  h2: { color: '#1976D2', fontSize: 16, marginBottom: 8 },
                  h3: { color: '#1976D2', fontSize: 14, marginBottom: 8 },
                  li: { marginBottom: 8 },
                  table: {
                    borderWidth: 1,
                    borderColor: '#BBDEFB',
                    borderStyle: 'solid',
                    marginBottom: 12,
                  },
                  th: {
                    backgroundColor: '#E3F2FD',
                    borderWidth: 1,
                    borderColor: '#BBDEFB',
                    borderStyle: 'solid',
                    padding: 8,
                    fontWeight: 'bold',
                    color: '#1976D2',
                    textAlign: 'center',
                  },
                  td: {
                    borderWidth: 1,
                    borderColor: '#BBDEFB',
                    borderStyle: 'solid',
                    padding: 8,
                    color: '#01579B',
                  },
                  tr: {
                    borderWidth: 1,
                    borderColor: '#BBDEFB',
                    borderStyle: 'solid',
                  },
                  thead: {
                    backgroundColor: '#E3F2FD',
                  },
                  tbody: {
                    backgroundColor: '#FFFFFF',
                  },
                }}
              />
            </View>

            {/* Separador */}
            <Divider style={styles.divider} />

            {/* Footer */}
            {circularContent.FOOTER && (
              <View style={styles.footerContainer}>
                <RenderHtml
                  contentWidth={width - 64}
                  source={{ html: transformTextToHtml(replaceFooterPlaceholders(circularContent.FOOTER)) }}
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
                    b: { 
                      fontWeight: 'bold', 
                      color: '#1976D2' 
                    },
                    strong: { 
                      fontWeight: 'bold', 
                      color: '#1976D2' 
                    },
                    em: { 
                      fontStyle: 'italic' 
                    },
                    i: { 
                      fontStyle: 'italic' 
                    },
                    u: { 
                      textDecorationLine: 'underline',
                      textDecorationColor: '#01579B',
                    },
                    h1: { color: '#1976D2', fontSize: 18, marginBottom: 8 },
                    h2: { color: '#1976D2', fontSize: 16, marginBottom: 8 },
                    h3: { color: '#1976D2', fontSize: 14, marginBottom: 8 },
                    li: { marginBottom: 4 },
                    table: {
                      borderWidth: 1,
                      borderColor: '#BBDEFB',
                      borderStyle: 'solid',
                      marginBottom: 12,
                    },
                    th: {
                      backgroundColor: '#E3F2FD',
                      borderWidth: 1,
                      borderColor: '#BBDEFB',
                      borderStyle: 'solid',
                      padding: 8,
                      fontWeight: 'bold',
                      color: '#1976D2',
                      textAlign: 'center',
                    },
                    td: {
                      borderWidth: 1,
                      borderColor: '#BBDEFB',
                      borderStyle: 'solid',
                      padding: 8,
                      color: '#01579B',
                    },
                    tr: {
                      borderWidth: 1,
                      borderColor: '#BBDEFB',
                      borderStyle: 'solid',
                    },
                    thead: {
                      backgroundColor: '#E3F2FD',
                    },
                    tbody: {
                      backgroundColor: '#FFFFFF',
                    },
                  }}
                />
              </View>
            )}

            {/* Mensaje para circulares con respuesta */}
            {circularContent.TYPE_NOT === '1' && (
              <View style={styles.responseMessageContainer}>
                <Divider style={styles.divider} />
                <Text variant="bodyMedium" style={getAuthMessageStyle()}>
                  {getAuthMessage()}
                </Text>
              </View>
            )}
          </Card.Content>
          
          <Divider style={styles.buttonDivider} />
          
          <Card.Actions style={styles.cardActions}>
            <Button 
              mode="contained" 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              icon="arrow-left"
            >
              Volver
            </Button>
          </Card.Actions>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    color: '#01579B',
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  errorText: {
    color: '#01579B',
    textAlign: 'center',
    lineHeight: 24,
  },
  title: {
    color: '#1976D2',
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  titleDivider: {
    marginBottom: 16,
    backgroundColor: '#BBDEFB',
  },
  datesContainer: {
    marginBottom: 4,
  },
  dateLabel: {
    color: '#1976D2',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 8,
  },
  dateValue: {
    color: '#01579B',
    fontWeight: 'normal',
  },
  divider: {
    marginTop: 4,
    marginBottom: 16,
    backgroundColor: '#BBDEFB',
  },
  greeting: {
    color: '#01579B',
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 22,
  },
  bodyContainer: {
    marginBottom: 10,
  },
  footerContainer: {
    marginTop: 10,
  },
  responseMessageContainer: {
    marginTop: 16,
  },
  responseMessageText: {
    color: '#1976D2',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  responseMessageAutorizado: {
    color: '#2E7D32', // Verde para autorizado
  },
  responseMessageNoAutorizado: {
    color: '#D32F2F', // Rojo para no autorizado
  },
  buttonDivider: {
    marginTop: 20,
    backgroundColor: '#BBDEFB',
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingVertical: 16,
  },
  backButton: {
    backgroundColor: '#1976D2',
    minWidth: 150,
  },
});

export default DetalleCircularScreen;
