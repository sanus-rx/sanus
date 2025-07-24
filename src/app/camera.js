import { Ionicons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import { useTheme } from 'react-native-paper';
const { width, height } = Dimensions.get('window');

const CameraScreen = () => {
  const [scanned, setScanned] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [isCameraReady, setCameraReady] = useState(false);
    const { colors: color } = useTheme();

  useEffect(() => {
    
    setScanned(false);
  }, []);

  const handleBarcodeScanned = ({ type, data }) => {
    if (scanned) return;
    setScanned(true);
    
    
    Vibration.vibrate(50);
    
    
    setTimeout(() => {
      router.replace({
        pathname: '/mint',
        params: {
          qrData: data,
          scanType: type,
          timestamp: Date.now(),
        }
      });
    }, 200);
  };

  const handleBackPress = () => {
    router.back();
  };

  const toggleFlash = () => {
    setFlashOn(!flashOn);
  };

  const resetScan = () => {
    setScanned(false);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
    },
    camera: {
      flex: 1,
      justifyContent: 'space-between',
    },
    overlay: {
      flex: 1,
      position: 'relative',
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: StatusBar.currentHeight || 40,
      paddingBottom: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    flashButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    flashButtonActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    scannerArea: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    scannerFrame: {
      width: width * 0.7,
      height: width * 0.7,
      position: 'relative',
    },
    scannerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    scannerCorner: {
      position: 'absolute',
      width: 30,
      height: 30,
      borderColor: color.primary,
      borderWidth: 3,
    },
    cornerTopLeft: {
      top: 0,
      left: 0,
      borderBottomWidth: 0,
      borderRightWidth: 0,
    },
    cornerTopRight: {
      top: 0,
      right: 0,
      borderBottomWidth: 0,
      borderLeftWidth: 0,
    },
    cornerBottomLeft: {
      bottom: 0,
      left: 0,
      borderTopWidth: 0,
      borderRightWidth: 0,
    },
    cornerBottomRight: {
      bottom: 0,
      right: 0,
      borderTopWidth: 0,
      borderLeftWidth: 0,
    },
    scanLine: {
      position: 'absolute',
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: '#00ff88',
      opacity: 0.8,
      top: '50%',
    },
    instructionText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
      marginTop: 30,
      paddingHorizontal: 20,
    },
    bottomBar: {
      paddingHorizontal: 20,
      paddingBottom: 40,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={flashOn}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onCameraReady={() => setCameraReady(true)}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      >
        {isCameraReady && (
        <View style={styles.overlay}>
          
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBackPress}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.flashButton, flashOn && styles.flashButtonActive]}
              onPress={toggleFlash}
            >
              <Ionicons 
                name={flashOn ? 'flash' : 'flash-off'} 
                size={20} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>

          
          <View style={styles.scannerArea}>
            <View style={styles.scannerFrame}>
             
              <View style={styles.scannerOverlay}>
                <View style={[styles.scannerCorner, styles.cornerTopLeft]} />
                <View style={[styles.scannerCorner, styles.cornerTopRight]} />
                <View style={[styles.scannerCorner, styles.cornerBottomLeft]} />
                <View style={[styles.scannerCorner, styles.cornerBottomRight]} />
                
                
              </View>
            </View>

            <Text style={styles.instructionText}>
              {scanned 
                ? 'QR Code scanned successfully!' 
                : 'Position the QR code within the frame to scan'
              }
            </Text>
          </View>

          
          <View style={styles.bottomBar}>
            <Text style={{
              color: '#fff',
              fontSize: 12,
              textAlign: 'center',
              opacity: 0.7,
            }}>
              Sanus Medicine Verification
            </Text>
          </View>
        </View>
        )}
      </CameraView>
    </View>
  );
};

export default CameraScreen;