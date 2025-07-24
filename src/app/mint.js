import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';

// Mobile Wallet Adapter imports
import {
  transact
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { findMintAddress } from '../components/solanaUtils';

const { width } = Dimensions.get('window');

const MintScreen = () => {
  const { colors: color } = useTheme();
  const params = useLocalSearchParams();
  const { qrData, scanType, timestamp, imageUri } = params; // Assuming imageUri is passed as a param

  // State management
  const [modalVisible, setModalVisible] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [connection, setConnection] = useState(null);
  const [authorization, setAuthorization] = useState(null);

  useEffect(() => {
    // Initialize Solana connection
    const solanaConnection = new Connection(clusterApiUrl('devnet'));
    setConnection(solanaConnection);

    // Check for stored data on component mount
    const checkStoredData = async () => {
      try {
        const storedAuth = await AsyncStorage.getItem('authorization');
        const storedWalletAddress = await AsyncStorage.getItem('walletPublicKey');
        const storedImageUri = await AsyncStorage.getItem('imageUri');

        if (storedAuth && storedWalletAddress && storedImageUri) {
          setAuthorization(JSON.parse(storedAuth));
          setWalletAddress(storedWalletAddress);
          setWalletConnected(true);
          console.log('Retrieved data from AsyncStorage:', {
            authorization: JSON.parse(storedAuth),
            walletAddress: storedWalletAddress,
          });
          // If data exists, proceed to find the mint address
          if (qrData && connection) {
            findMintAddress(new PublicKey(qrData), connection);
          }
        } else {
          // If no data, show the connection modal
          setModalVisible(true);
        }
      } catch (error) {
        console.error('Failed to retrieve data from AsyncStorage', error);
        setModalVisible(true);
      }
    };

    checkStoredData();
  }, [qrData, connection]);

  // Connect to Solana wallet using Mobile Wallet Adapter
  const connectWallet = async () => {
    try {
      setIsConnecting(true);

      // Use Mobile Wallet Adapter to connect
      await transact(async (wallet) => {
        // Request authorization from the wallet
        const authorizationResult = await wallet.authorize({
          cluster: 'devnet',
          identity: {
            name: 'Sanus Medicine Verification',
          },
        });

        const walletPublicKey = authorizationResult.accounts[0].address;

        // Store data in AsyncStorage
        await AsyncStorage.setItem('authorization', JSON.stringify(authorizationResult));
        await AsyncStorage.setItem('walletPublicKey', walletPublicKey);
        if (imageUri) {
          await AsyncStorage.setItem('imageUri', imageUri);
        }

        setAuthorization(authorizationResult);
        setWalletAddress(walletPublicKey);
        setWalletConnected(true);
        setModalVisible(false);

        Alert.alert(
          'Wallet Connected!',
          `Successfully connected to wallet:\n${walletPublicKey.slice(0, 8)}...${walletPublicKey.slice(-8)}`,
          [{ text: 'Continue', onPress: () => {
            if (qrData && connection) {
              findMintAddress(new PublicKey(qrData), connection);
            }
          } }]
        );
      });

    } catch (error) {
      console.error('Wallet connection error:', error);

      let errorMessage = 'Failed to connect wallet';
      if (error.message.includes('USER_REJECTED')) {
        errorMessage = 'Connection was cancelled by user';
      } else if (error.message.includes('NO_WALLET_FOUND')) {
        errorMessage = 'No compatible wallet app found. Please install a Solana wallet.';
      }

      Alert.alert('Connection Failed', errorMessage, [
        { text: 'Try Again', onPress: () => setModalVisible(true) },
        { text: 'Cancel', onPress: () => router.back() }
      ]);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const closeModal = () => {
    setModalVisible(false);
    router.back();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: color.background || '#f5f5f5',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: StatusBar.currentHeight || 40,
      paddingBottom: 20,
      backgroundColor: color.surface || '#fff',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    backButton: {
      marginRight: 15,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: color.onSurface || '#000',
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    qrDataSection: {
      backgroundColor: color.surface || '#fff',
      borderRadius: 12,
      padding: 20,
      marginBottom: 20,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: color.onSurface || '#000',
      marginBottom: 10,
    },
    qrDataText: {
      fontSize: 14,
      color: color.onSurface || '#666',
      backgroundColor: color.surfaceVariant || '#f0f0f0',
      padding: 15,
      borderRadius: 8,
      fontFamily: 'monospace',
    },
    walletSection: {
      backgroundColor: color.surface || '#fff',
      borderRadius: 12,
      padding: 20,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    walletAddress: {
      fontSize: 14,
      color: color.primary || '#007AFF',
      backgroundColor: color.surfaceVariant || '#f0f0f0',
      padding: 15,
      borderRadius: 8,
      fontFamily: 'monospace',
      marginTop: 10,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 30,
      margin: 20,
      width: width * 0.85,
      maxWidth: 400,
      alignItems: 'center',
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
    },
    modalIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: color.primary || '#007AFF',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#1a1a1a',
      textAlign: 'center',
      marginBottom: 15,
    },
    modalDescription: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 30,
    },
    connectButton: {
      backgroundColor: color.primary || '#007AFF',
      borderRadius: 25,
      paddingVertical: 15,
      paddingHorizontal: 40,
      minWidth: 160,
      alignItems: 'center',
      marginBottom: 15,
    },
    connectButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
    },
    cancelButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    cancelButtonText: {
      color: '#666',
      fontSize: 16,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    loadingText: {
      color: '#fff',
      fontSize: 16,
      marginLeft: 10,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={color.surface || '#fff'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={color.onSurface || '#000'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medicine Verification</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* QR Data Section */}
        <View style={styles.qrDataSection}>
          <Text style={styles.sectionTitle}>Scanned QR Code</Text>
          <Text style={styles.qrDataText}>{qrData || 'No QR data available'}</Text>
          <Text style={{ 
            fontSize: 12, 
            color: color.onSurface || '#999', 
            marginTop: 10 
          }}>
            Scan Type: {scanType} | Timestamp: {new Date(parseInt(timestamp)).toLocaleString()}
          </Text>
        </View>

        {/* Wallet Section */}
        {walletConnected && walletAddress && (
          <View style={styles.walletSection}>
            <Text style={styles.sectionTitle}>Connected Wallet</Text>
            <Text style={styles.walletAddress}>{walletAddress}</Text>
          </View>
        )}
      </View>

      {/* Wallet Connection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Ionicons name="wallet-outline" size={40} color="#fff" />
            </View>
            
            <Text style={styles.modalTitle}>Connect Your Wallet</Text>
            
            <Text style={styles.modalDescription}>
              To verify your drug data on the Solana blockchain, please connect your Solana wallet.
            </Text>

            <TouchableOpacity 
              style={styles.connectButton}
              onPress={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.loadingText}>Connecting...</Text>
                </View>
              ) : (
                <Text style={styles.connectButtonText}>Connect Wallet</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={closeModal}
              disabled={isConnecting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MintScreen;