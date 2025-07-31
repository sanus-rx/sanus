import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Clipboard,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../constants/color';

const { width } = Dimensions.get('window');

export default function HistoryDetailsScreen() {
  const params = useLocalSearchParams();
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scanData, setScanData] = useState(() => {
    try {
      return JSON.parse(params.scanData);
    } catch (error) {
      console.error('Error parsing scan data:', error);
      return null;
    }
  });

  // Add loading delay effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  
  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color={Colors.dark.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Details</Text>
          <View style={styles.headerSpacer} />
        </View>

       
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.accent} />
          <Text style={styles.loadingText}>Loading scan details...</Text>
        </View>
      </View>
    );
  }

  if (!scanData) {
    return (
      <View style={styles.container}>
        
        <View style={styles.centered}>
          <MaterialIcons name="error" size={50} color={Colors.dark.destructive} />
          <Text style={styles.errorText}>Failed to load scan details</Text>
        </View>
      </View>
    );
  }

  const getStatusInfo = (status) => {
    const statusMap = {
      'AUTHENTIC': {
        color: Colors.dark.success,
        icon: 'verified-user',
        title: 'Authentic Medicine',
        bgColor: Colors.dark['success-bg'],
        borderColor: Colors.dark['success-border']
      },
      'ALREADY_OWNED': {
        color: Colors.dark.info,
        icon: 'check-circle',
        title: 'Already Verified',
        bgColor: Colors.dark['info-bg'],
        borderColor: Colors.dark['info-border']
      },
      'EXPIRED': {
        color: Colors.dark.warning,
        icon: 'schedule',
        title: 'Expired Medicine',
        bgColor: Colors.dark['warning-bg'],
        borderColor: Colors.dark['warning-border']
      },
      'COUNTERFEIT_SUSPECTED': {
        color: Colors.dark.destructive,
        icon: 'gpp-bad',
        title: 'DANGER - Counterfeit Suspected',
        bgColor: Colors.dark['destructive-bg'],
        borderColor: Colors.dark['destructive-border']
      },
      'TAMPERED_QR': {
        color: Colors.dark.destructive,
        icon: 'qr-code',
        title: 'Tampered QR Code',
        bgColor: Colors.dark['destructive-bg'],
        borderColor: Colors.dark['destructive-border']
      }
    };
    
    return statusMap[status] || {
      color: Colors.dark['muted-foreground'],
      icon: 'help-outline',
      title: 'Unknown Status',
      bgColor: Colors.dark.muted,
      borderColor: Colors.dark.border
    };
  };

  const getAttributeValue = (attributes, traitType) => {
    if (!attributes || !Array.isArray(attributes)) return null;
    const attr = attributes.find(a => a.trait_type === traitType);
    return attr ? attr.value : null;
  };

  const shortenAddress = (address) => {
    if (!address || address === 'N/A' || address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const copyToClipboard = async (text, label) => {
    try {
      await Clipboard.setString(text);
      ToastAndroid.showWithGravity(
        `${label} copied to clipboard!`,
        ToastAndroid.SHORT,
        ToastAndroid.CENTER
      );
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
    if (!value || value === 'N/A' || value === '') return null;
    
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
    
    const isLong = description.length > 150;
    const displayText = isLong && !showFullDescription 
      ? `${description.slice(0, 150)}...` 
      : description;

    return (
      <View style={styles.section}>
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
  
  const drugInfo = scanData.drugInfo || {};
  console.log(scanData)
  const metadata = scanData.metadata || {};
  const attributes = metadata.attributes || [];
  const statusInfo = getStatusInfo(scanData.status);
  
  const drugName = drugInfo.name || getAttributeValue(attributes, 'Drug Name') || 'Unknown Medicine';
  const manufacturer = drugInfo.manufacturer || getAttributeValue(attributes, 'Manufacturer') || 'Unknown';
  const imageUrl = metadata.image || 'https://i.ibb.co/fV89ZY3j/logo.png';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color={Colors.dark.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        
        <View style={[
          styles.imageStatusHeader,
          { 
            backgroundColor: statusInfo.bgColor,
            borderWidth: 2,
            borderColor: statusInfo.borderColor
          }
        ]}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: imageUrl }}
              style={styles.drugImage}
              defaultSource={require('../../assets/images/logo.png')}
            />
            <View style={[styles.statusIconBadge, { backgroundColor: statusInfo.color }]}>
              <MaterialIcons 
                name={statusInfo.icon} 
                size={20} 
                color={Colors.dark.background} 
              />
            </View>
          </View>
          
          <View style={styles.drugHeader}>
            <Text style={styles.drugNameLarge}>{drugName}</Text>
            <Text style={styles.manufacturerLarge}>{manufacturer}</Text>
            <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
              {statusInfo.title}
            </Text>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.sectionContent}>
            {renderInfoRow('Drug Name', drugName)}
            {renderInfoRow('Manufacturer', manufacturer)}
            {renderInfoRow('Dosage', drugInfo.dosage || getAttributeValue(attributes, 'Dosage'))}
            {renderInfoRow('Form', drugInfo.form || getAttributeValue(attributes, 'Form'))}
            {renderInfoRow('Strength', drugInfo.strength)}
            {renderInfoRow('Route', drugInfo.route)}
            {renderInfoRow('Category', drugInfo.category)}
          </View>
        </View>

        {/* Identification */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identification</Text>
          <View style={styles.sectionContent}>
            {renderInfoRow('Serial Number', drugInfo.serialNumber || getAttributeValue(attributes, 'Serial Number'), true)}
            {renderInfoRow('Batch Number', drugInfo.batchNumber || getAttributeValue(attributes, 'Batch Number'))}
            {renderInfoRow('Lot Number', drugInfo.lotNumber)}
            {renderInfoRow('NDC Number', drugInfo.ndcNumber)}
            {renderInfoRow('Asset Address', drugInfo.assetAddress, true)}
            {renderInfoRow('Wallet Address', scanData.walletAddress, true)}
          </View>
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Dates</Text>
          <View style={styles.sectionContent}>
            {renderInfoRow('Manufacturing Date', drugInfo.manufacturingDate || getAttributeValue(attributes, 'Manufacturing Date'))}
            {renderInfoRow('Expiry Date', drugInfo.expiryDate || getAttributeValue(attributes, 'Expiry Date'))}
            {renderInfoRow('Created At', getAttributeValue(attributes, 'Created At'))}
            {renderInfoRow('Scanned At', scanData.scannedAt || new Date(scanData.timestamp).toLocaleString())}
          </View>
        </View>

        {/* Description */}
        {metadata.description && renderDescription(metadata.description)}

        {/* Medical Information */}
        {(drugInfo.indication || drugInfo.activeIngredients?.length > 0 || drugInfo.contraindications?.length > 0 || drugInfo.sideEffects?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medical Information</Text>
            <View style={styles.sectionContent}>
              {renderInfoRow('Indication', drugInfo.indication)}
              {renderInfoRow('Active Ingredients', drugInfo.activeIngredients?.join(', ') || getAttributeValue(attributes, 'Active Ingredients'))}
              {renderInfoRow('Contraindications', drugInfo.contraindications?.join(', '))}
              {renderInfoRow('Side Effects', drugInfo.sideEffects?.join(', '))}
              {renderInfoRow('Storage Conditions', drugInfo.storageConditions)}
            </View>
          </View>
        )}

        {/* Regulatory Information */}
        {metadata.regulatory && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Regulatory Information</Text>
            <View style={styles.sectionContent}>
              {renderInfoRow('FDA Approved', metadata.regulatory.fdaApproved ? 'Yes' : 'No')}
              {renderInfoRow('Prescription Required', metadata.regulatory.prescriptionRequired ? 'Yes' : 'No')}
              {renderInfoRow('Controlled Substance', metadata.regulatory.controlledSubstance ? 'Yes' : 'No')}
              {renderInfoRow('Schedule', metadata.regulatory.schedule)}
            </View>
          </View>
        )}

        {/* Security Information */}
        {metadata.security && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Security Features</Text>
            <View style={styles.sectionContent}>
              {renderInfoRow('Blockchain Network', metadata.security.blockchainNetwork)}
              {renderInfoRow('Anti-Counterfeit', metadata.security.antiCounterfeit ? 'Enabled' : 'Disabled')}
              {renderInfoRow('Tamper Proof', metadata.security.tamperProof ? 'Yes' : 'No')}
              {renderInfoRow('Encryption Used', metadata.security.encryptionUsed ? 'Yes' : 'No')}
              {renderInfoRow('Metaplex Standard', metadata.security.metaplexStandard)}
            </View>
          </View>
        )}

        {/* Verification Information */}
        {metadata.verification && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verification Details</Text>
            <View style={styles.sectionContent}>
              {renderInfoRow('Standard', metadata.verification.standard)}
              {renderInfoRow('One Time Use', metadata.verification.oneTimeUse ? 'Yes' : 'No')}
              {renderInfoRow('Patient Verification Required', metadata.verification.requiresPatientVerification ? 'Yes' : 'No')}
              {renderInfoRow('Burnable', metadata.verification.burnable ? 'Yes' : 'No')}
             
            </View>
          </View>
        )}

        {/* Creator Information */}
        {getAttributeValue(attributes, 'Created By') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Creator Information</Text>
            <View style={styles.sectionContent}>
              {renderInfoRow('Created By', getAttributeValue(attributes, 'Created By'), true)}
             
            </View>
          </View>
        )}

        {/* Additional Attributes */}
        {attributes.filter(attr => 
          !['Drug Name', 'Manufacturer', 'Dosage', 'Form', 'Serial Number', 'Batch Number', 
            'Manufacturing Date', 'Expiry Date', 'Created At', 'Created By', 'Active Ingredients'].includes(attr.trait_type)
        ).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <View style={styles.sectionContent}>
              {attributes
                .filter(attr => 
                  !['Drug Name', 'Manufacturer', 'Dosage', 'Form', 'Serial Number', 'Batch Number', 
                    'Manufacturing Date', 'Expiry Date', 'Created At', 'Created By', 'Active Ingredients'].includes(attr.trait_type)
                )
                .map((attr, index) => (
                  <View key={index}>
                    {renderInfoRow(attr.trait_type, attr.value, attr.trait_type.toLowerCase().includes('address') || attr.trait_type.toLowerCase().includes('wallet'))}
                  </View>
                ))
              }
            </View>
          </View>
        )}

      

        {/* Security Alert */}
        {scanData.securityAlert && (
          <View style={styles.alertSection}>
            <MaterialIcons name="warning" size={24} color={Colors.dark.destructive} />
            <Text style={styles.alertText}>{scanData.securityAlert}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark.foreground,
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.dark['muted-foreground'],
    marginTop: 16,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  imageStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 20,
  },
  drugImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: Colors.dark.muted,
  },
  statusIconBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.dark.background,
  },
  drugHeader: {
    flex: 1,
  },
  drugNameLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.foreground,
    marginBottom: 4,
  },
  manufacturerLarge: {
    fontSize: 16,
    color: Colors.dark['muted-foreground'],
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.foreground,
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  sectionContent: {
    padding: 20,
    paddingTop: 16,
  },
  descriptionContent: {
    padding: 20,
    paddingTop: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.dark.foreground,
    lineHeight: 22,
    marginBottom: 12,
  },
  toggleButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  toggleButtonText: {
    fontSize: 14,
    color: Colors.dark.accent,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.dark['muted-foreground'],
    flex: 1,
    marginRight: 12,
  },
  infoValue: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1.5,
    justifyContent: 'flex-end',
  },
  infoValueText: {
    fontSize: 14,
    color: Colors.dark.foreground,
    textAlign: 'right',
    marginRight: 8,
    flex: 1,
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
    borderRadius: 16,
    marginBottom: 16,
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.dark.destructive,
    marginTop: 16,
    textAlign: 'center',
  },
});