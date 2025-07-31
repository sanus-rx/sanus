import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Clipboard,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../constants/color';

const { width, height } = Dimensions.get('window');

export default function VerificationResultScreen() {
  const params = useLocalSearchParams();
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    parseVerificationData();
  }, []);

  const parseVerificationData = async () => {
    try {
      if (params.verificationData) {
        const data = JSON.parse(params.verificationData);
        console.log('Parsed verification data:', data);
        setVerificationData(data);
        await storeScanResult(data);
      } else {
        console.error('No verification data received');
        setVerificationData({
          success: false,
          message: 'No verification data received',
          data: {
            drugInfo: {
              name: 'Unknown',
              status: 'NO_DATA'
            }
          }
        });
      }
    } catch (error) {
      console.error('Error parsing verification data:', error);
      setVerificationData({
        success: false,
        message: 'Failed to parse verification data',
        data: {
          drugInfo: {
            name: 'Parse Error',
            status: 'PARSE_ERROR'
          }
        }
      });
    }
    setLoading(false);
  };

  const storeScanResult = async (data) => {
    try {
      const scanResult = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(), 
        scannedAt: new Date().toLocaleString(),
        success: data.success,
        message: data.message,
        drugInfo: data.data?.drugInfo || {},
        status: data.data?.drugInfo?.status || 'UNKNOWN',
        walletAddress: data.data?.requestingWallet || data.data?.toWallet,
        transactionSignature: data.data?.transactionSignature,
        errorCode: data.data?.errorCode,
        metadata: data.data?.metadata || {}
      };
      

      const existingScans = await AsyncStorage.getItem('scanHistory');
      const scanHistory = existingScans ? JSON.parse(existingScans) : [];
      
      
      scanHistory.unshift(scanResult);
      const trimmedHistory = scanHistory.slice(0, 100);
      
      await AsyncStorage.setItem('scanHistory', JSON.stringify(trimmedHistory));
      console.log('Scan result stored in history at:', scanResult.scannedAt);
    } catch (error) {
      console.error('Error storing scan result:', error);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'AUTHENTIC': {
        color: Colors.dark.success || "hsl(142, 76%, 36%)",
        icon: 'verified-user',
        title: 'Authentic Medicine',
        bgColor: Colors.dark['success-bg'] || "hsl(142, 76%, 8%)",
        borderColor: Colors.dark['success-border'] || "hsl(142, 76%, 20%)"
      },
      'ALREADY_OWNED': {
        color: Colors.dark.info || "hsl(221, 83%, 53%)",
        icon: 'check-circle',
        title: 'Already Verified',
        bgColor: Colors.dark['info-bg'] || "hsl(221, 83%, 8%)",
        borderColor: Colors.dark['info-border'] || "hsl(221, 83%, 20%)"
      },
      'EXPIRED': {
        color: Colors.dark.warning || "hsl(38, 92%, 50%)",
        icon: 'schedule',
        title: 'Expired Medicine',
        bgColor: Colors.dark['warning-bg'] || "hsl(38, 92%, 8%)",
        borderColor: Colors.dark['warning-border'] || "hsl(38, 92%, 25%)"
      },
      'COUNTERFEIT_SUSPECTED': {
        color: Colors.dark.destructive || "hsl(0, 84%, 60%)",
        icon: 'gpp-bad',
        title: 'DANGER - Counterfeit Suspected',
        bgColor: Colors.dark['destructive-bg'] || "hsl(0, 84%, 8%)",
        borderColor: Colors.dark['destructive-border'] || "hsl(0, 84%, 25%)"
      },
      'VALIDATION_ERROR': {
        color: Colors.dark.warning || "hsl(38, 92%, 50%)",
        icon: 'error-outline',
        title: 'Validation Error',
        bgColor: Colors.dark['warning-bg'] || "hsl(38, 92%, 8%)",
        borderColor: Colors.dark['warning-border'] || "hsl(38, 92%, 25%)"
      },
      'NETWORK_ERROR': {
        color: Colors.dark.warning || "hsl(38, 92%, 50%)",
        icon: 'wifi-off',
        title: 'Network Error',
        bgColor: Colors.dark['warning-bg'] || "hsl(38, 92%, 8%)",
        borderColor: Colors.dark['warning-border'] || "hsl(38, 92%, 25%)"
      },
      'SYSTEM_ERROR': {
        color: Colors.dark.destructive || "hsl(0, 84%, 60%)",
        icon: 'bug-report',
        title: 'System Error',
        bgColor: Colors.dark['destructive-bg'] || "hsl(0, 84%, 8%)",
        borderColor: Colors.dark['destructive-border'] || "hsl(0, 84%, 25%)"
      },
      'TRANSFER_FAILED': {
        color: Colors.dark.warning || "hsl(38, 92%, 50%)",
        icon: 'sync-disabled',
        title: 'Transfer Failed',
        bgColor: Colors.dark['warning-bg'] || "hsl(38, 92%, 8%)",
        borderColor: Colors.dark['warning-border'] || "hsl(38, 92%, 25%)"
      },
      'TAMPERED_QR': {
        color: Colors.dark.destructive || "hsl(0, 84%, 60%)",
        icon: 'qr-code',
        title: 'Tampered QR Code',
        bgColor: Colors.dark['destructive-bg'] || "hsl(0, 84%, 8%)",
        borderColor: Colors.dark['destructive-border'] || "hsl(0, 84%, 25%)"
      },
      'INVALID_QR_FORMAT': {
        color: Colors.dark.warning || "hsl(38, 92%, 50%)",
        icon: 'qr-code-scanner',
        title: 'Invalid QR Format',
        bgColor: Colors.dark['warning-bg'] || "hsl(38, 92%, 8%)",
        borderColor: Colors.dark['warning-border'] || "hsl(38, 92%, 25%)"
      },
      'ASSET_NOT_FOUND': {
        color: Colors.dark.warning || "hsl(38, 92%, 50%)",
        icon: 'search-off',
        title: 'Medicine Not Found',
        bgColor: Colors.dark['warning-bg'] || "hsl(38, 92%, 8%)",
        borderColor: Colors.dark['warning-border'] || "hsl(38, 92%, 25%)"
      },
      'UNKNOWN': {
        color: Colors.dark['muted-foreground'],
        icon: 'help-outline',
        title: 'Unknown Status',
        bgColor: Colors.dark.muted,
        borderColor: Colors.dark.border
      }
    };
    
    return statusMap[status] || statusMap['UNKNOWN'];
  };

  const shortenAddress = (address) => {
    if (!address || address === 'N/A' || address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const copyToClipboard = async (text, label) => {
    try {
       Clipboard.setString(text);
      
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      ToastAndroid.showWithGravity(
        'Failed to copy to clipboard',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
    }
  };

  const renderInfoRow = (label, value, copyable = false) => {
    if (!value || value === 'N/A') return null;
    
    
    let stringValue = value;
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        stringValue = value.join(', ');
      } else {
        stringValue = JSON.stringify(value, null, 2);
      }
    } else {
      stringValue = String(value);
    }
    
    const displayValue = copyable ? shortenAddress(stringValue) : stringValue;
    
    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}:</Text>
        <TouchableOpacity 
          style={styles.infoValue}
          onPress={copyable ? () => copyToClipboard(stringValue, label) : undefined}
          disabled={!copyable}
        >
          <Text style={[styles.infoValueText, copyable && styles.copyableText]}>
            {displayValue}
          </Text>
          {copyable && <MaterialIcons name="content-copy" size={16} color={Colors.dark['muted-foreground']} />}
        </TouchableOpacity>
      </View>
    );
  };

  const renderDescription = (description) => {
    if (!description) return null;
    
    const isLong = description.length > 100;
    const displayText = isLong && !showFullDescription 
      ? `${description.slice(0, 100)}...` 
      : description;

    return (
      <View style={styles.descriptionSection}>
        <Text style={styles.sectionTitle}>Description</Text>
        <View style={styles.descriptionContent}>
          <Text style={styles.descriptionText}>{displayText}</Text>
          {isLong && (
            <TouchableOpacity 
              style={styles.toggleButton} 
              onPress={() => setShowFullDescription(!showFullDescription)}
            >
              <Text style={styles.toggleButtonText}>
                {showFullDescription ? 'Show Less' : 'Show More'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <MaterialIcons name="hourglass-empty" size={50} color={Colors.dark.accent} />
          <Text style={styles.loadingText}>Processing results...</Text>
        </View>
      </View>
    );
  }

  if (!verificationData) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <MaterialIcons name="error" size={50} color={Colors.dark.destructive} />
          <Text style={styles.title}>No Data Available</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/scanner')}>
            <Text style={styles.primaryButtonText}>Scan New QR Code</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { success, message, data } = verificationData;
  const drugInfo = data?.drugInfo || {};
  const metadata = data?.metadata || {};
  console.log(metadata)
  const statusInfo = getStatusInfo(drugInfo.status);

  return (
    <ScrollView style={styles.containers} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Status Header */}
      <View style={[
        styles.statusHeader, 
        { 
          backgroundColor: statusInfo.bgColor,
          borderWidth: 2,
          borderColor: statusInfo.borderColor
        }
      ]}>
        <MaterialIcons name={statusInfo.icon} size={60} color={statusInfo.color} />
        <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
          {statusInfo.title}
        </Text>
        <Text style={styles.statusMessage}>{message}</Text>
      </View>

      {/* Drug Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medicine Information</Text>
        <View style={styles.sectionContent}>
          {renderInfoRow('Name', drugInfo.name)}
          {renderInfoRow('Symbol', drugInfo.symbol)}
          {renderInfoRow('Status', drugInfo.status)}
          {renderInfoRow('Asset Address', drugInfo.assetAddress, true)}
          {renderInfoRow('Expiry Date', drugInfo.expiryDate)}
        </View>
      </View>

      
      {metadata.description && renderDescription(metadata.description)}

      {/* Security Alert */}
      {data?.securityAlert && (
        <View style={styles.alertSection}>
          <MaterialIcons name="warning" size={24} color={Colors.dark.destructive} />
          <Text style={styles.alertText}>{data.securityAlert}</Text>
        </View>
      )}

     
      {metadata && Object.keys(metadata).filter(key => key !== 'description').length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <View style={styles.sectionContent}>
            
            {metadata.created_by && renderInfoRow('Created By', metadata.created_by, true)}
            
            
            {metadata.attributes && Array.isArray(metadata.attributes) && metadata.attributes.map((attr, index) => (
              <View key={index}>
                {renderInfoRow(attr.trait_type || `Attribute ${index + 1}`, attr.value)}
              </View>
            ))}
            
           
          </View>
        </View>
      )}

      {/* Timestamp */}
      <View style={styles.timestampSection}>
        <Text style={styles.timestampText}>
          Scanned: {new Date().toLocaleString()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  containers: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    paddingTop: 30
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.dark['muted-foreground'],
    marginTop: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.foreground,
    marginTop: 15,
    textAlign: 'center',
  },
  statusHeader: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 16,
    color: Colors.dark['muted-foreground'],
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    backgroundColor: Colors.dark.card,
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.foreground,
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  sectionContent: {
    padding: 20,
    paddingTop: 15,
  },
  descriptionSection: {
    backgroundColor: Colors.dark.card,
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
  },
  descriptionContent: {
    padding: 20,
    paddingTop: 15,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.dark.foreground,
    lineHeight: 20,
    marginBottom: 10,
  },
  toggleButton: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
  },
  toggleButtonText: {
    fontSize: 14,
    color: Colors.dark.accent,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.dark['muted-foreground'],
    flex: 1,
  },
  infoValue: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  infoValueText: {
    fontSize: 14,
    color: Colors.dark.foreground,
    textAlign: 'right',
    marginRight: 8,
  },
  copyableText: {
    color: Colors.dark.accent,
    textDecorationLine: 'underline',
  },
  alertSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.dark.destructive + '20',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.dark.destructive + '40',
  },
  alertText: {
    fontSize: 14,
    color: Colors.dark.destructive,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  timestampSection: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  timestampText: {
    fontSize: 12,
    color: Colors.dark['muted-foreground'],
    fontStyle: 'italic',
  },
  primaryButton: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
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
});