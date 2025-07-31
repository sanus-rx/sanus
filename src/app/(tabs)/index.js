import { Ionicons } from '@expo/vector-icons';
import { useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RecentScans from '../../components/scan/recent';
import { Colors } from '../../constants/color';

const ScanScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const handleScanPress = async () => {
    if (permission?.granted) {
      router.push('/camera');
      return;
    }

    if (permission?.status === 'denied' && !permission?.canAskAgain) {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access in device settings to scan QR codes.',
        [{ text: 'OK' }]
      );
      return;
    }

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
        Alert.alert('Permission Denied', 'Camera access is required to scan.', [{ text: 'OK' }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not request permission.', [{ text: 'OK' }]);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
        
          <View style={styles.header}>
            <View style={styles.hero}>
              <Text style={styles.title}>Sanus</Text>
              <Text style={styles.subtitle}>Verify medicine authenticity</Text>
              <Text style={styles.tagline}>Powered by Solana Blockchain</Text>
            </View>

            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScanPress}
              activeOpacity={0.9}
            >
              <View style={styles.scanButtonContent}>
                <Ionicons
                  name="scan"
                  size={24}
                  color={Colors.light['primary-foreground']}
                  style={styles.icon}
                />
                <Text style={styles.scanText}>Scan Medicine</Text>
              </View>
            </TouchableOpacity>
          </View>

          
          <RecentScans />
        </View>

        {/* Modal */}
        <Modal
          visible={showPermissionModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPermissionModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Ionicons name="camera" size={28} color={Colors.dark.primary} style={{ marginBottom: 16 }} />
              <Text style={styles.modalTitle}>Camera Permission</Text>
              <Text style={styles.modalDescription}>
                Sanus needs camera access to scan QR codes on medicine packages.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancel]}
                  onPress={() => setShowPermissionModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalAllow]}
                  onPress={handleRequestPermission}
                >
                  <Text style={styles.modalAllowText}>
                    {isRequestingPermission ? 'Requesting...' : 'Allow'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

export default ScanScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark.foreground,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark['muted-foreground'],
    marginTop: 8,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.primary,
    marginTop: 4,
  },
  scanButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  scanButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanText: {
    fontSize: 18,
    color: Colors.light['primary-foreground'],
    fontWeight: '700',
    marginLeft: 10,
  },
  icon: {
    marginRight: 5,
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.foreground,
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.dark['muted-foreground'],
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancel: {
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  modalCancelText: {
    color: Colors.dark['muted-foreground'],
    fontWeight: '600',
  },
  modalAllow: {
    backgroundColor: Colors.dark.primary,
  },
  modalAllowText: {
    color: Colors.light['primary-foreground'],
    fontWeight: '600',
  },
});