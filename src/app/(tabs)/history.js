import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../../constants/color';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
  const [scanHistory, setScanHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(null); 


  useFocusEffect(
  useCallback(() => {
    
    loadScanHistory();
  }, [activeFilter, searchQuery])
);


  const loadScanHistory = async () => {
    try {
      const storedScans = await AsyncStorage.getItem('scanHistory');
      if (storedScans) {
        const scans = JSON.parse(storedScans);
        
        setScanHistory(scans);
        applyFilters(scans, activeFilter, searchQuery);
      } else {
        setScanHistory([]);
        setFilteredHistory([]);
      }
    } catch (error) {
      console.error('Error loading scan history:', error);
      setScanHistory([]);
      setFilteredHistory([]);
    }
    setLoading(false);
  };


  const applyFilters = (scans, filter, search) => {
    let filtered = [...scans];

   
    if (filter === 'authentic') {
      filtered = filtered.filter(scan => scan.status === 'AUTHENTIC');
    } else if (filter === 'counterfeit') {
      filtered = filtered.filter(scan => 
        scan.status === 'COUNTERFEIT_SUSPECTED' || 
        scan.status === 'TAMPERED_QR'
      );
    } else if (filter === 'expired') {
      filtered = filtered.filter(scan => scan.status === 'EXPIRED');
    }
    
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(scan => {
        const drugName = scan.drugInfo?.name?.toLowerCase() || '';
        const manufacturer = getAttributeValue(scan.metadata?.attributes, 'Manufacturer')?.toLowerCase() || '';
        const serialNumber = scan.drugInfo?.serialNumber?.toLowerCase() || '';
        const batchNumber = scan.drugInfo?.batchNumber?.toLowerCase() || '';
        
        return drugName.includes(searchLower) || 
               manufacturer.includes(searchLower) ||
               serialNumber.includes(searchLower) ||
               batchNumber.includes(searchLower);
      });
    }

    setFilteredHistory(filtered);
  };

  const getAttributeValue = (attributes, traitType) => {
    if (!attributes || !Array.isArray(attributes)) return null;
    const attr = attributes.find(a => a.trait_type === traitType);
    return attr ? attr.value : null;
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'AUTHENTIC': {
        color: Colors.dark.success,
        icon: 'verified-user',
        bgColor: Colors.dark['success-bg'] || Colors.dark.success + '20',
      },
      'ALREADY_OWNED': {
        color: Colors.dark.info,
        icon: 'check-circle',
        bgColor: Colors.dark['info-bg'] || Colors.dark.info + '20',
      },
      'COUNTERFEIT_SUSPECTED': {
        color: Colors.dark.destructive,
        icon: 'gpp-bad',
        bgColor: Colors.dark['destructive-bg'] || Colors.dark.destructive + '20',
      },
      'TAMPERED_QR': {
        color: Colors.dark.destructive,
        icon: 'qr-code',
        bgColor: Colors.dark['destructive-bg'] || Colors.dark.destructive + '20',
      },
      'EXPIRED': {
        color: Colors.dark.warning,
        icon: 'schedule',
        bgColor: Colors.dark['warning-bg'] || Colors.dark.warning + '20',
      }
    };
    
    return statusMap[status] || {
      color: Colors.dark['muted-foreground'],
      icon: 'help-outline',
      bgColor: Colors.dark.muted + '20',
    };
  };

  const handleFilterChange = (filter) => {
   
    const newFilter = activeFilter === filter ? null : filter;
    setActiveFilter(newFilter);
    applyFilters(scanHistory, newFilter, searchQuery);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    applyFilters(scanHistory, activeFilter, text);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScanHistory();
    setRefreshing(false);
  };

  const navigateToDetails = (scan) => {
    router.push({
      pathname: '/history-details',
      params: {
        scanData: JSON.stringify(scan)
      }
    });
  };

  const renderFilterButton = (filter, label, count) => {
    const isActive = activeFilter === filter;
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          isActive && styles.activeFilterButton
        ]}
        onPress={() => handleFilterChange(filter)}
      >
        <Text style={[
          styles.filterButtonText,
          isActive && styles.activeFilterButtonText
        ]}>
          {label}
        </Text>
        {count > 0 && (
          <View style={[
            styles.filterBadge,
            isActive && styles.activeFilterBadge
          ]}>
            <Text style={[
              styles.filterBadgeText,
              isActive && styles.activeFilterBadgeText
            ]}>
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderScanItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    const drugName = item.drugInfo?.name || 'Unknown Medicine';
    const manufacturer = getAttributeValue(item.metadata?.attributes, 'Manufacturer') || 'Unknown';
    const dosage = item.drugInfo?.dosage || getAttributeValue(item.metadata?.attributes, 'Dosage') || '';
    const form = item.drugInfo?.form || getAttributeValue(item.metadata?.attributes, 'Form') || '';
    const imageUrl = item.metadata?.image || 'https://via.placeholder.com/60';
    const serialNumber = (drugName.match(/SN-\s*(\d+)/) || [])[1] || '';
    const scannedDate = new Date(item.timestamp).toLocaleDateString();

    return (
      <TouchableOpacity 
        style={styles.scanItem}
        onPress={() => navigateToDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.scanItemContent}>
          {/* Drug Image */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: imageUrl }}
              style={styles.drugImage}
             
            />
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
              <MaterialIcons 
                name={statusInfo.icon} 
                size={16} 
                color={statusInfo.color} 
              />
            </View>
          </View>

          {/* Drug Info */}
          <View style={styles.drugInfo}>
            <Text style={styles.drugName} numberOfLines={1}>
              {drugName}
            </Text>
            <Text style={styles.manufacturer} numberOfLines={1}>
              {manufacturer}
            </Text>
            
            <View style={styles.dosageForm}>
              {dosage && (
                <Text style={styles.dosageText}>{dosage}</Text>
              )}
              {form && (
                <Text style={styles.formText}>{form}</Text>
              )}
            </View>

            <View style={styles.scanDetails}>
              <Text style={styles.serialNumber} numberOfLines={1}>
                SN: {serialNumber || 'N/A'}
              </Text>
              <Text style={styles.scanDate}>
                {scannedDate}
              </Text>
            </View>
          </View>

          
          <MaterialIcons 
            name="chevron-right" 
            size={24} 
            color={Colors.dark['muted-foreground']} 
          />
        </View>
      </TouchableOpacity>
    );
  };

  const getFilterCounts = () => {
    return {
      authentic: scanHistory.filter(s => s.status === 'AUTHENTIC').length,
      counterfeit: scanHistory.filter(s => 
        s.status === 'COUNTERFEIT_SUSPECTED' || s.status === 'TAMPERED_QR'
      ).length,
      owned: scanHistory.filter(s => s.status === 'EXPIRED').length
    };
  };

  const counts = getFilterCounts();

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <MaterialIcons name="history" size={50} color={Colors.dark.accent} />
          <Text style={styles.loadingText}>Loading scan history...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan History</Text>
        <Text style={styles.headerSubtitle}>
          {filteredHistory.length} of {scanHistory.length} scans
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={Colors.dark['muted-foreground']} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, manufacturer, serial..."
          placeholderTextColor={Colors.dark['muted-foreground']}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <MaterialIcons name="clear" size={20} color={Colors.dark['muted-foreground']} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('authentic', 'Authentic', counts.authentic)}
        {renderFilterButton('counterfeit', 'Counterfeit', counts.counterfeit)}
        {renderFilterButton('expired', 'Expired', counts.owned)}
      </View>

      {/* Scan List */}
      {filteredHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons 
            name={searchQuery ? "search-off" : "history"} 
            size={60} 
            color={Colors.dark['muted-foreground']} 
          />
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'No Results Found' : 'No Scan History'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery 
              ? 'Try adjusting your search or filters'
              : 'Start scanning QR codes to see your history here'
            }
          </Text>
          {!searchQuery && (
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={() => router.push('/scanner')}
            >
              <MaterialIcons name="qr-code-scanner" size={20} color={Colors.dark['primary-foreground']} />
              <Text style={styles.scanButtonText}>Start Scanning</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          renderItem={renderScanItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.dark.accent]}
              tintColor={Colors.dark.accent}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.foreground,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.dark['muted-foreground'],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.dark.foreground,
    marginLeft: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.dark.secondary,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  activeFilterButton: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.dark['secondary-foreground'],
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: Colors.dark['accent-foreground'],
  },
  filterBadge: {
    backgroundColor: Colors.dark.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
    minWidth: 18,
    alignItems: 'center',
  },
  activeFilterBadge: {
    backgroundColor: "#ffffff50",
  },
  filterBadgeText: {
    fontSize: 11,
    color: Colors.dark['muted-foreground'],
    fontWeight: '600',
  },
  activeFilterBadgeText: {
    color: Colors.dark['primary-foreground'],
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  scanItem: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  scanItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  drugImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.dark.muted,
  },
  statusBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.card,
  },
  drugInfo: {
    flex: 1,
  },
  drugName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.foreground,
    marginBottom: 4,
  },
  manufacturer: {
    fontSize: 14,
    color: Colors.dark['muted-foreground'],
    marginBottom: 6,
  },
  dosageForm: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  dosageText: {
    fontSize: 12,
    color: "ffffff80",
    backgroundColor: Colors.dark.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: '500',
  },
  formText: {
    fontSize: 12,
    color: "ffffff10",
    backgroundColor: Colors.dark.info + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontWeight: '500',
  },
  scanDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serialNumber: {
    fontSize: 12,
    color: Colors.dark['muted-foreground'],
    flex: 1,
  },
  scanDate: {
    fontSize: 12,
    color: Colors.dark['muted-foreground'],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark.foreground,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.dark['muted-foreground'],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark['primary-foreground'],
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
});