import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import bs58 from 'bs58';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/color';

const { width } = Dimensions.get('window');


const storeWalletData = async (authToken, walletAddress) => {
  try {
    await AsyncStorage.setItem('authToken', authToken);
    await AsyncStorage.setItem('walletAddress', walletAddress);
    return true;
  } catch (error) {
    console.error('Error storing wallet data:', error);
    return false;
  }
};

const getStoredWalletData = async () => {
  try {
    const authToken = await AsyncStorage.getItem('authToken');
    const walletAddress = await AsyncStorage.getItem('walletAddress');
    return { authToken, walletAddress };
  } catch (error) {
    console.error('Error retrieving wallet data:', error);
    return { authToken: null, walletAddress: null };
  }
};

const clearStoredWalletData = async () => {
  try {
    await AsyncStorage.multiRemove(['authToken', 'walletAddress']);
  } catch (error) {
    console.error('Error clearing wallet data:', error);
  }
};

export default function MintScreen() {
  const params = useLocalSearchParams();
  const { qrData, scanType, timestamp } = params;

 
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      
      const conn = new Connection(clusterApiUrl('devnet'));
      setConnection(conn);

      const { authToken, walletAddress } = await getStoredWalletData();
      
      if (authToken && walletAddress) {
        setWalletAddress(walletAddress);
        await processVerification(walletAddress);
      } else {
       
        setShowWalletModal(true);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
      setError('Failed to initialize application');
    } finally {
      setLoading(false);
    }
  };

  
  const base64ToBase58 = (base64) => {
    try {
      const binary = Buffer.from(base64, 'base64');
      return bs58.encode(binary);
    } catch (error) {
      console.error('Error converting base64 to base58:', error);
      throw new Error('Invalid address format');
    }
  };

  const connectWallet = async () => {
    if (isConnecting) return; 
    
    setIsConnecting(true);
    setError(null);

    try {
      await transact(async (wallet) => {
        const auth = await wallet.authorize({
          cluster: 'devnet',
          identity: { name: 'Sanus Medicine Verification' },
        });

        if (!auth.accounts || auth.accounts.length === 0) {
          throw new Error('No accounts found in wallet');
        }

        const address = base64ToBase58(auth.accounts[0].address.toString());
        
       
        const stored = await storeWalletData(auth.auth_token, address);
        if (!stored) {
          throw new Error('Failed to store wallet data');
        }

        setWalletAddress(address);
        setShowWalletModal(false);
        
        
        await processVerification(address);
      });
    } catch (error) {
      console.error('Wallet connection error:', error);
      handleWalletError(error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleWalletError = (error) => {
    let title = 'Connection Failed';
    let message = 'Failed to connect wallet. Please try again.';
    let showRetry = true;

    if (error.message.includes('USER_REJECTED')) {
      title = 'Connection Cancelled';
      message = 'You cancelled the wallet connection.';
      showRetry = true;
    } else if (error.message.includes('NO_WALLET_FOUND')) {
      title = 'No Wallet Found';
      message = 'Please install a Solana wallet app first.';
      showRetry = false;
    } else if (error.message.includes('Invalid address format')) {
      title = 'Address Error';
      message = 'Invalid wallet address format received.';
      showRetry = true;
    } else if (error.message.includes('Failed to store wallet data')) {
      title = 'Storage Error';
      message = 'Failed to save wallet information. Please try again.';
      showRetry = true;
    }

    const buttons = showRetry 
      ? [
          { text: 'Cancel', onPress: () => router.back(), style: 'cancel' },
          { text: 'Retry', onPress: () => setError(null) }
        ]
      : [{ text: 'OK', onPress: () => router.back() }];

    Alert.alert(title, message, buttons);
    setError(message);
  };

  const processVerification = async (address) => {
    if (!qrData || !address) {
      Alert.alert('Error', 'Missing verification data', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('Starting verification process...');
      console.log('QR Data:', qrData);
      console.log('Wallet Address:', address);

      const response = await fetch('https://verify-henna-five.vercel.app/api/scan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          recipientWallet: address, 
          encryptedAsset: qrData 
        }),
      });

      
      

      
      let data;
      try {
        data = await response.json();
        console.log('Response data:', data);
      } catch (parseError) {
        console.error('Failed to parse response JSON:', parseError);
        
        data = {
          success: false,
          message: `Server returned status ${response.status} with invalid JSON`,
          data: {
            drugInfo: {
              name: 'Unknown Medicine',
              status: 'VERIFICATION_FAILED',
              assetAddress: qrData || 'N/A'
            },
            errorCode: response.status,
            timestamp: new Date().toISOString()
          }
        };
      }

     
      const verificationResult = {
        success: data.success || false,
        message: data.message || `Verification returned status ${response.status}`,
        data: {
          drugInfo: {
            name: data?.data?.drugInfo?.name || 'Unknown Medicine',
            symbol: data?.data?.drugInfo?.symbol || 'N/A',
            assetAddress: data?.data?.drugInfo?.assetAddress || qrData || 'N/A',
            status: data?.data?.drugInfo?.status || 'UNKNOWN',
            expiryDate: data?.data?.drugInfo?.expiryDate || null
          },
          
          fromWallet: data?.data?.fromWallet || null,
          toWallet: data?.data?.toWallet || null,
          currentOwner: data?.data?.currentOwner || null,
          expectedOwner: data?.data?.expectedOwner || null,
          requestingWallet: data?.data?.requestingWallet || address,
          metadata: data?.data?.metadata || {},
          errorCode: response.status,
          timestamp: new Date().toISOString(),
          scanType: scanType || 'verification',
          rawResponse: data 
        }
      };

      console.log('Processed verification result:', verificationResult);

     
      router.replace({
        pathname: '/verification',
        params: { verificationData: JSON.stringify(verificationResult) },
      });

    } catch (error) {
      console.error('Verification error:', error);
      
     
      const errorResult = {
        success: false,
        message: 'Network or system error occurred during verification',
        data: {
          drugInfo: {
            name: 'Verification Failed',
            symbol: 'N/A',
            assetAddress: qrData || 'N/A',
            status: 'NETWORK_ERROR'
          },
          toWallet: address,
          requestingWallet: address,
          errorCode: 'NETWORK_ERROR',
          errorMessage: error.message,
          timestamp: new Date().toISOString(),
          scanType: scanType || 'verification',
          metadata: {}
        }
      };

      console.log('Error result:', errorResult);

      
      router.replace({
        pathname: '/verification-result',
        params: { verificationData: JSON.stringify(errorResult) },
      });

    } finally {
      setIsProcessing(false);
    }
  };

  const handleModalClose = () => {
    setShowWalletModal(false);
    router.back();
  };

  const clearWalletAndReconnect = async () => {
    await clearStoredWalletData();
    setWalletAddress(null);
    setShowWalletModal(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.dark.accent} />
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Wallet Connection Modal */}
      <Modal
        visible={showWalletModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialIcons name="account-balance-wallet" size={50} color={Colors.dark.accent} />
            <Text style={styles.modalTitle}>Connect Your Wallet</Text>
            <Text style={styles.modalDescription}>
              To verify your medicine, please connect your Solana wallet. This ensures secure verification and minting of your authenticity certificate.
            </Text>
            
            {error && (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error" size={20} color={Colors.dark.foreground} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.secondaryButton} 
                onPress={handleModalClose}
                disabled={isConnecting}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.primaryButton, isConnecting && styles.disabledButton]} 
                onPress={connectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <ActivityIndicator size="small" color={Colors.dark['primary-foreground']} />
                    <Text style={styles.primaryButtonText}>Connecting...</Text>
                  </>
                ) : (
                  <>
                    <MaterialIcons name="link" size={18} color={Colors.dark['primary-foreground']} />
                    <Text style={styles.primaryButtonText}>Connect</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Main Content */}
      <View style={styles.centered}>
        <MaterialIcons name="shield" size={60} color={Colors.dark.accent} />
        <Text style={styles.title}>Medicine Verification</Text>
        
        {walletAddress && (
          <View style={styles.walletInfo}>
            <MaterialIcons name="check-circle" size={20} color={Colors.dark.success} />
            <Text style={styles.walletText}>
              Wallet Connected: {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
            </Text>
          </View>
        )}

        {isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={Colors.dark.accent} />
            <Text style={styles.subtitle}>Processing verification...</Text>
            <Text style={styles.smallText}>Please wait while we verify your medicine</Text>
          </View>
        ) : (
          <Text style={styles.subtitle}>
            {walletAddress 
              ? "Verification complete! Redirecting..." 
              : "Please connect your wallet to continue"
            }
          </Text>
        )}

        {error && !showWalletModal && (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error" size={20} color={Colors.dark.destructive} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {walletAddress && !isProcessing && (
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={clearWalletAndReconnect}
          >
            <Text style={styles.secondaryButtonText}>Use Different Wallet</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    width: '100%',
    backgroundColor: Colors.dark.card,
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.foreground,
    marginTop: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark['muted-foreground'],
    textAlign: 'center',
    marginVertical: 20,
  },
  smallText: {
    fontSize: 14,
    color: Colors.dark['muted-foreground'],
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.8,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.dark['muted-foreground'],
    marginTop: 15,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.success + '20',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  walletText: {
    color:Colors.dark['muted-foreground'],
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  processingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.destructive + '20',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    maxWidth: '100%',
  },
  errorText: {
    color: Colors.dark.foreground,
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
    flexWrap: 'wrap',
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.dark.foreground,
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    color: Colors.dark['muted-foreground'],
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: Colors.dark['primary-foreground'],
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: Colors.dark.foreground,
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
});