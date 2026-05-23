import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import HomeScreen from '../screens/home/HomeScreen';
import ModuleScreen from '../screens/module/ModuleScreen';
import AgendaVirtualScreen from '../screens/agenda/AgendaVirtualScreen';
import EnfermeriaScreen from '../screens/enfermeria/EnfermeriaScreen';
import ModuloCircularesScreen from '../screens/circular/ModuloCircularesScreen';
import CircularesScreen from '../screens/circular/CircularesScreen';
import EncuestasScreen from '../screens/circular/EncuestasScreen';
import DetalleCircularScreen from '../screens/circular/DetalleCircularScreen';
import DetalleEncuestaScreen from '../screens/circular/DetalleEncuestaScreen';
import DeportesScreen from '../screens/deportes/DeportesScreen';
import ExtraEscolaresScreen from '../screens/extraEscolares/ExtraEscolaresScreen';
import AcademicoScreen from '../screens/academico/AcademicoScreen';
import FechasDiagnosticasScreen from '../screens/academico/FechasDiagnosticasScreen';
import EvaluacionesDiagnosticasScreen from '../screens/academico/EvaluacionesDiagnosticasScreen';
import ComunicadoDiagnosticaScreen from '../screens/academico/ComunicadoDiagnosticaScreen';
import EvaluacionesPeriodoScreen from '../screens/academico/EvaluacionesPeriodoScreen';
import EstudiantesDestacadosScreen from '../screens/academico/EstudiantesDestacadosScreen';
import MejorCursoScreen from '../screens/academico/MejorCursoScreen';
import BoletinAcademicoScreen from '../screens/academico/BoletinAcademicoScreen';
import CarteraScreen from '../screens/cartera/CarteraScreen';
import ReciboPagoScreen from '../screens/cartera/ReciboPagoScreen';
import CertificadoRetencionScreen from '../screens/cartera/CertificadoRetencionScreen';
import PagosOnlineScreen from '../screens/cartera/PagosOnlineScreen';
import MatriculasScreen from '../screens/matriculas/MatriculasScreen';
import ActualizacionDatosScreen from '../screens/matriculas/ActualizacionDatosScreen';
import FirmaElectronicaScreen from '../screens/matriculas/FirmaElectronicaScreen';
import InformacionServiciosScreen from '../screens/matriculas/InformacionServiciosScreen';
import InformacionScreen from '../screens/informacion/InformacionScreen';
import ManualConvivenciaScreen from '../screens/informacion/ManualConvivenciaScreen';
import CostosScreen from '../screens/informacion/CostosScreen';
import AtencionPsicologicaScreen from '../screens/informacion/AtencionPsicologicaScreen';
import PoliticasSeguridadScreen from '../screens/informacion/PoliticasSeguridadScreen';
import PolizaSeguroScreen from '../screens/informacion/PolizaSeguroScreen';
import CambioClaveScreen from '../screens/cambioClave/CambioClaveScreen';
import PlaneacionScreen from '../screens/planeacion/PlaneacionScreen';
import ComunicacionesScreen from '../screens/comunicaciones/ComunicacionesScreen';
import CalendarioCurricularScreen from '../screens/calendario/CalendarioCurricularScreen';
import MenuEscolarScreen from '../screens/menuEscolar/MenuEscolarScreen';
import EntrevistaScreen from '../screens/entrevista/EntrevistaScreen';
import AyudaScreen from '../screens/ayuda/AyudaScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Welcome"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Module"
        component={ModuleScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AgendaVirtual"
        component={AgendaVirtualScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Enfermeria"
        component={EnfermeriaScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ModuloCirculares"
        component={ModuloCircularesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Circulares"
        component={CircularesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Encuestas"
        component={EncuestasScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DetalleCircular"
        component={DetalleCircularScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DetalleEncuesta"
        component={DetalleEncuestaScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Deportes"
        component={DeportesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ExtraEscolares"
        component={ExtraEscolaresScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Academico"
        component={AcademicoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FechasDiagnosticas"
        component={FechasDiagnosticasScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EvaluacionesDiagnosticas"
        component={EvaluacionesDiagnosticasScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ComunicadoDiagnostica"
        component={ComunicadoDiagnosticaScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EvaluacionesPeriodo"
        component={EvaluacionesPeriodoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EstudiantesDestacados"
        component={EstudiantesDestacadosScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MejorCurso"
        component={MejorCursoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BoletinAcademico"
        component={BoletinAcademicoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Cartera"
        component={CarteraScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReciboPago"
        component={ReciboPagoScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CertificadoRetencion"
        component={CertificadoRetencionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PagosOnline"
        component={PagosOnlineScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Matriculas"
        component={MatriculasScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ActualizacionDatos"
        component={ActualizacionDatosScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FirmaElectronica"
        component={FirmaElectronicaScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InformacionServicios"
        component={InformacionServiciosScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Informacion"
        component={InformacionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ManualConvivencia"
        component={ManualConvivenciaScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Costos"
        component={CostosScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AtencionPsicologica"
        component={AtencionPsicologicaScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PoliticasSeguridad"
        component={PoliticasSeguridadScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PolizaSeguro"
        component={PolizaSeguroScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CambioClave"
        component={CambioClaveScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Planeacion"
        component={PlaneacionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Comunicaciones"
        component={ComunicacionesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CalendarioCurricular"
        component={CalendarioCurricularScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MenuEscolar"
        component={MenuEscolarScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Entrevista"
        component={EntrevistaScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Ayuda"
        component={AyudaScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
