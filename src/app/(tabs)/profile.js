import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import bs58 from 'bs58';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/color';

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

export default function ProfileScreen() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadWalletData();
    }, [])
  );

  const loadWalletData = async () => {
    try {
      const { authToken, walletAddress } = await getStoredWalletData();
      setWalletAddress(walletAddress);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
    setLoading(false);
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
        
        ToastAndroid.showWithGravity(
          'Wallet connected successfully!',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );
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

    if (error.message.includes('USER_REJECTED')) {
      title = 'Connection Cancelled';
      message = 'You cancelled the wallet connection.';
    } else if (error.message.includes('NO_WALLET_FOUND')) {
      title = 'No Wallet Found';
      message = 'Please install a Solana wallet app first.';
    } else if (error.message.includes('Invalid address format')) {
      title = 'Address Error';
      message = 'Invalid wallet address format received.';
    }

    Alert.alert(title, message);
  };

  const disconnectWallet = () => {
    Alert.alert(
      'Disconnect Wallet',
      'Are you sure you want to disconnect your wallet?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await clearStoredWalletData();
            setWalletAddress(null);
            ToastAndroid.showWithGravity(
              'Wallet disconnected',
              ToastAndroid.SHORT,
              ToastAndroid.CENTER
            );
          }
        }
      ]
    );
  };

  const getWalletInitials = (address) => {
    if (!address) return 'SA';
    return address.slice(0, 2).toUpperCase();
  };

  const getTruncatedAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const copyToClipboard = async () => {
    if (!walletAddress) return;
    
    try {
      await Clipboard.setString(walletAddress)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.dark.accent} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.walletCard}>
        {/* Header with Wallet Icon and Connection Badge */}
        <View style={styles.header}>
          <View style={styles.walletIconContainer}>
            <View style={styles.walletIcon}>
              <Text style={styles.walletInitials}>
                {getWalletInitials(walletAddress)}
              </Text>
            </View>
            <Text style={styles.walletLabel}>Main Wallet</Text>
            
            {/* Connection Status Badge */}
            <View style={[
              styles.statusBadge, 
              walletAddress ? styles.connectedBadge : styles.disconnectedBadge
            ]}>
              <View style={[
                styles.statusDot,
                walletAddress ? styles.connectedDot : styles.disconnectedDot
              ]} />
              <Text style={[
                styles.statusText,
                walletAddress ? styles.connectedText : styles.disconnectedText
              ]}>
                {walletAddress ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
          </View>

          {/* App Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/images/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Wallet Address Section */}
        <View style={styles.addressSection}>
          <Text style={styles.addressLabel}>WALLET ADDRESS</Text>
          
          {walletAddress ? (
            <TouchableOpacity 
              style={styles.addressContainer}
              onPress={copyToClipboard}
              activeOpacity={0.7}
            >
              <Text style={styles.addressText}>
                {getTruncatedAddress(walletAddress)}
              </Text>
              <MaterialIcons name="content-copy" size={20} color={Colors.dark['muted-foreground']} />
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyAddressContainer}>
              <Text style={styles.emptyAddressText}>Not Connected</Text>
            </View>
          )}
        </View>

        {/* Action Button */}
        <View style={styles.actionSection}>
          {walletAddress ? (
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={disconnectWallet}
            >
              <MaterialIcons name="link-off" size={18} color={Colors.dark.destructive} />
              <Text style={styles.disconnectButtonText}>Disconnect Wallet</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.connectButton, isConnecting && styles.disabledButton]}
              onPress={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <ActivityIndicator size="small" color={Colors.dark['primary-foreground']} />
                  <Text style={styles.connectButtonText}>Connecting...</Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="link" size={18} color={Colors.dark['primary-foreground']} />
                  <Text style={styles.connectButtonText}>Connect Wallet</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
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
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.dark['muted-foreground'],
    marginTop: 15,
  },
  
  walletCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  
  walletIconContainer: {
    flex: 1,
  },
  
  walletIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.dark.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Colors.dark.border,
  },
  
  walletInitials: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.foreground,
  },
  
  walletLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.foreground,
    marginBottom: 8,
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  
  connectedBadge: {
    backgroundColor: Colors.dark.success + '20',
  },
  
  disconnectedBadge: {
    backgroundColor: Colors.dark.destructive + '20',
  },
  
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  
  connectedDot: {
    backgroundColor: "#00C853",
  },
  
  disconnectedDot: {
    backgroundColor: "#D32F2F",
  },
  
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  connectedText: {
    color: Colors.dark['success-foreground'],
  },
  
  disconnectedText: {
    color: Colors.dark['destructive-foreground'],
  },
  
  logoContainer: {
    width: '25%',
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  logo: {
    width: '500%',
    height: '500%',
  },
  
  addressSection: {
    marginBottom: 24,
  },
  
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark['muted-foreground'],
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.secondary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.foreground,
    fontFamily: 'monospace',
  },
  
  emptyAddressContainer: {
    backgroundColor: Colors.dark.secondary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    opacity: 0.6,
  },
  
  emptyAddressText: {
    fontSize: 16,
    color: Colors.dark['muted-foreground'],
    fontStyle: 'italic',
  },
  
  actionSection: {
    alignItems: 'flex-end',
  },
  
  connectButton: {
    backgroundColor: Colors.dark.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  
  connectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark['primary-foreground'],
  },
  
  disconnectButton: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.dark.destructive + '40',
  },
  
  disconnectButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.destructive,
  },
  
  disabledButton: {
    opacity: 0.6,
  },
});