import { Ionicons } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const { colors } = useTheme();

  const handleScanPress = async () => {
    
    if (permission?.granted) {
      
      router.push('../camera');
      return;
    }

    // Check if permission was previously denied
    if (permission?.status === 'denied' && !permission?.canAskAgain) {
      Alert.alert(
        'Camera Permission Required',
        'Camera access is required to scan medicines. Please enable camera permission in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => {/* Open device settings */} }
        ]
      );
      return;
    }

    // Show permission modal
    setShowPermissionModal(true);
  };

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true);
    try {
      const result = await requestPermission();
      
      if (result.granted) {
        setShowPermissionModal(false);
        
        router.push('/camera');
      } else {
        Alert.alert(
          'Permission Denied',
          'Camera access is required to scan and verify medicines. Please grant permission to continue.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to request camera permission. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: Platform.OS === 'android' ? 40 : 20,
    },
    header: {
      alignItems: 'center',
      marginTop: 40,
      marginBottom: 60,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.onSurface,
      textAlign: 'center',
      lineHeight: 24,
      paddingHorizontal: 20,
    },
    actionSection: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -40,
    },
    scanButton: {
      width: width * 0.8,
      height: 140,
      borderRadius: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
    },
    scanButtonGradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      paddingHorizontal: 24,
    },
    scanButtonText: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.onPrimary,
      marginTop: 12,
      marginBottom: 4,
    },
    scanButtonSubtext: {
      fontSize: 14,
      color: colors.onPrimary,
      fontWeight: '500',
    },
    infoSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 50,
      marginBottom: 40,
    },
    infoCard: {
      flex: 1,
      backgroundColor: colors.surface,
      padding: 20,
      borderRadius: 16,
      alignItems: 'center',
      marginHorizontal: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    infoTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.onSurface,
      marginTop: 8,
      marginBottom: 4,
    },
    infoText: {
      fontSize: 12,
      color: colors.onSurface,
      textAlign: 'center',
    },
    statsSection: {
      backgroundColor: colors.surface,
      padding: 24,
      borderRadius: 16,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    statsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.onSurface,
      textAlign: 'center',
      marginBottom: 16,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.error,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.onSurface,
      textAlign: 'center',
    },
    statDivider: {
      width: 1,
      height: 40,
      backgroundColor: colors.outline,
      marginHorizontal: 20,
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.surface,
      margin: 20,
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 10,
      maxWidth: width * 0.9,
    },
    modalIcon: {
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.onSurface,
      marginBottom: 12,
      textAlign: 'center',
    },
    modalDescription: {
      fontSize: 16,
      color: colors.onSurface,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 24,
      opacity: 0.8,
    },
    modalButtons: {
      flexDirection: 'row',
      width: '100%',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
    },
    modalButtonPrimary: {
      backgroundColor: colors.primary,
    },
    modalButtonSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.outline,
    },
    modalButtonTextPrimary: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.onPrimary,
    },
    modalButtonTextSecondary: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.onSurface,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Sanus</Text>
          <Text style={styles.subtitle}>
            Verify your medicine authenticity with blockchain technology
          </Text>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScanPress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#3b82f6', '#1d4ed8']}
              style={styles.scanButtonGradient}
            >
              <Ionicons name="scan" size={32} color="#ffffff" />
              <Text style={styles.scanButtonText}>Scan Medicine</Text>
              <Text style={styles.scanButtonSubtext}>
                Tap to verify authenticity
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#10b981" />
            <Text style={styles.infoTitle}>Secure Verification</Text>
            <Text style={styles.infoText}>
              Powered by Solana blockchain
            </Text>
          </View>
          
          <View style={styles.infoCard}>
            <Ionicons name="flash-outline" size={24} color="#f59e0b" />
            <Text style={styles.infoTitle}>Instant Results</Text>
            <Text style={styles.infoText}>
              Get verification in seconds
            </Text>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>Global Impact</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>13%</Text>
              <Text style={styles.statLabel}>Fake medicines globally</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>250K+</Text>
              <Text style={styles.statLabel}>Deaths annually</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Permission Modal */}
      <Modal
        visible={showPermissionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPermissionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="camera-outline" size={48} color={colors.primary} />
            </View>
            
            <Text style={styles.modalTitle}>Camera Permission Required</Text>
            
            <Text style={styles.modalDescription}>
              To scan and verify medicines, Sanus needs access to your camera. 
              Your privacy is protected - we only use the camera for scanning QR codes.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowPermissionModal(false)}
                disabled={isRequestingPermission}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleRequestPermission}
                disabled={isRequestingPermission}
              >
                <Text style={styles.modalButtonTextPrimary}>
                  {isRequestingPermission ? 'Please wait...' : 'Allow Camera'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default HomeScreen;