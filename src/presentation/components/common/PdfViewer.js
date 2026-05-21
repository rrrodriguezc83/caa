import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Buffer } from 'buffer';
import ExpoConstants from 'expo-constants';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Visor embebido de PDF (render nativo) sin abrir navegador externo.
 * Acepta `uri` (GET con cookie) o `base64` (contenido ya decodificado, saltea el fetch).
 */
const PdfViewer = ({ uri, cookie, base64: base64Prop }) => {
  const [localUri, setLocalUri] = useState(null);
  const [base64Content, setBase64Content] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [NativePdf, setNativePdf] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // 'download' | 'print' | null

  useEffect(() => {
    // `react-native-pdf` es un módulo nativo: en Expo Go puede romper el runtime.
    // Intentamos cargarlo dinámicamente y si falla, usamos WebView como fallback.
    try {
      const executionEnvironment = ExpoConstants?.executionEnvironment
        ?? ExpoConstants?.default?.executionEnvironment;
      // En Expo Go ('storeClient'), el módulo nativo rompe el runtime.
      const isExpoGo = typeof executionEnvironment === 'string'
        && executionEnvironment.toLowerCase().includes('storeclient');
      if (isExpoGo) {
        setNativePdf(null);
        return;
      }

      // eslint-disable-next-line global-require
      const mod = require('react-native-pdf');
      const PdfComponent = mod?.default || mod;
      setNativePdf(() => PdfComponent);
    } catch (e) {
      setNativePdf(null);
    }
  }, []);

  // Modo base64: el contenido ya viene decodificado, no hay que hacer fetch
  useEffect(() => {
    if (!base64Prop) return;
    let isMounted = true;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        if (NativePdf) {
          const localPath = `${FileSystem.cacheDirectory}boletin_${Date.now()}.pdf`;
          await FileSystem.writeAsStringAsync(localPath, base64Prop, { encoding: 'base64' });
          if (isMounted) setLocalUri(localPath);
        }
        if (isMounted) setBase64Content(base64Prop);
      } catch (e) {
        if (isMounted) setError(e?.message || String(e));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    run();
    return () => { isMounted = false; };
  }, [base64Prop, NativePdf]);

  useEffect(() => {
    if (!uri || base64Prop) return;

    let isMounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const safeBaseName = `recibo_${Date.now()}.pdf`;
        const localPath = `${FileSystem.cacheDirectory}${safeBaseName}`;

        const headers = cookie ? { Cookie: `PHPSESSID=${cookie}` } : undefined;
        const res = await fetch(uri, { method: 'GET', headers });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} al descargar PDF`);
        }

        const arrayBuffer = await res.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        if (NativePdf) {
          await FileSystem.writeAsStringAsync(localPath, base64, {
            encoding: 'base64',
          });
          if (isMounted) setLocalUri(localPath);
        }

        if (isMounted) setBase64Content(base64);
      } catch (e) {
        console.error('PdfViewer error:', e);
        if (isMounted) setError(e?.message || String(e));
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [uri, cookie, NativePdf, base64Prop]);

  // Writes the PDF to a temp file (or reuses the existing one) and returns its path.
  const getTempFilePath = useCallback(async () => {
    if (localUri) return localUri;
    const path = `${FileSystem.cacheDirectory}recibo_share_${Date.now()}.pdf`;
    await FileSystem.writeAsStringAsync(path, base64Content, {
      encoding: 'base64',
    });
    return path;
  }, [localUri, base64Content]);

  const handleDownload = useCallback(async () => {
    try {
      setActionLoading('download');

      if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) return;

        const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          'recibo_pension.pdf',
          'application/pdf',
        );
        await FileSystem.writeAsStringAsync(fileUri, base64Content, { encoding: 'base64' });
        Alert.alert('Descargado', 'El archivo se guardó correctamente.');
      } else {
        // iOS: guardar en Archivos via share sheet
        const path = await getTempFilePath();
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          Alert.alert('No disponible', 'La función de descarga no está disponible en este dispositivo.');
          return;
        }
        await Sharing.shareAsync(path, { mimeType: 'application/pdf', dialogTitle: 'Guardar recibo' });
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo descargar el archivo.');
      console.error('PdfViewer download error:', e);
    } finally {
      setActionLoading(null);
    }
  }, [getTempFilePath, base64Content]);

  const handlePrint = useCallback(async () => {
    try {
      setActionLoading('print');
      const path = await getTempFilePath();
      await Print.printAsync({ uri: path });
    } catch (e) {
      Alert.alert('Error', 'No se pudo imprimir el archivo.');
      console.error('PdfViewer print error:', e);
    } finally {
      setActionLoading(null);
    }
  }, [getTempFilePath]);

  if (!uri && !base64Prop) return null;

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se pudo cargar el PDF.</Text>
      </View>
    );
  }

  const toolbar = !loading && base64Content ? (
    <View style={styles.toolbar}>
      <TouchableOpacity
        style={styles.toolbarBtn}
        onPress={handleDownload}
        disabled={actionLoading !== null}
      >
        {actionLoading === 'download'
          ? <ActivityIndicator size={20} color="#FFFFFF" />
          : <MaterialCommunityIcons name="download" size={22} color="#FFFFFF" />}
        <Text style={styles.toolbarBtnText}>Descargar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.toolbarBtn}
        onPress={handlePrint}
        disabled={actionLoading !== null}
      >
        {actionLoading === 'print'
          ? <ActivityIndicator size={20} color="#FFFFFF" />
          : <MaterialCommunityIcons name="printer" size={22} color="#FFFFFF" />}
        <Text style={styles.toolbarBtnText}>Imprimir</Text>
      </TouchableOpacity>
    </View>
  ) : null;

  // Fallback: WebView con PDF.js embebido.
  // Renderiza el PDF como canvases dentro de una página HTML para evitar que
  // Android descargue el archivo en lugar de mostrarlo.
  if (!NativePdf) {
    const pdfHtml = base64Content
      ? `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    html,body{margin:0;padding:0;background:#525659;overflow-x:hidden}
    canvas{width:100%!important;height:auto!important;display:block;margin-bottom:4px}
  </style>
  <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js"></script>
</head>
<body>
  <div id="pages"></div>
  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    var b64 = '${base64Content}';
    var arr = Uint8Array.from(atob(b64), function(c){return c.charCodeAt(0);});
    pdfjsLib.getDocument({data: arr}).promise.then(function(pdf) {
      var container = document.getElementById('pages');
      var load = function(n) {
        if (n > pdf.numPages) return;
        pdf.getPage(n).then(function(page) {
          var vp = page.getViewport({scale: window.devicePixelRatio || 2});
          var c = document.createElement('canvas');
          c.width = vp.width; c.height = vp.height;
          container.appendChild(c);
          page.render({canvasContext: c.getContext('2d'), viewport: vp}).promise
            .then(function(){ load(n + 1); });
        });
      };
      load(1);
    }).catch(function(e){
      document.body.innerHTML = '<p style="color:#fca5a5;padding:16px">Error al renderizar PDF: '+e.message+'</p>';
    });
  </script>
</body>
</html>`
      : null;

    return (
      <View style={styles.container}>
        {loading || !pdfHtml ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color="#002c5d" />
          </View>
        ) : (
          <WebView
            originWhitelist={['*']}
            style={styles.webview}
            source={{ html: pdfHtml }}
            javaScriptEnabled
            scalesPageToFit={false}
            mixedContentMode="always"
          />
        )}
        {toolbar}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading || !localUri ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#002c5d" />
        </View>
      ) : (
        <NativePdf
          source={{ uri: localUri }}
          style={styles.pdf}
          trustAllCerts={false}
          enablePaging
        />
      )}
      {toolbar}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pdf: { flex: 1, width: '100%', height: '100%' },
  webview: { flex: 1 },
  errorText: { padding: 16, fontSize: 14, color: '#ef4444', textAlign: 'center' },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: '#002c5d',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
  },
  toolbarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingVertical: 8,
  },
  toolbarBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
});

export default PdfViewer;
