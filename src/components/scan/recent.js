import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../../constants/color';

const RecentScans = () => {
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

 
  useEffect(() => {
    loadRecentScans();
  }, []);

 
  useFocusEffect(
    useCallback(() => {
      loadRecentScans();
    }, [])
  );

  const loadRecentScans = async () => {
    try {
      setLoading(true);
      const scanHistory = await AsyncStorage.getItem('scanHistory');
      if (scanHistory) {
        const scans = JSON.parse(scanHistory);
       
        const recentScansData = scans
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 15);
        setRecentScans(recentScansData);
      }
    } catch (error) {
      console.error('Error loading recent scans:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRecentScans();
  }, []);

  const getStatusIcon = (status) => {
    const statusMap = {
      'AUTHENTIC': { name: 'checkmark-circle', color: Colors.dark.success },
      'ALREADY_OWNED': { name: 'checkmark-circle-outline', color: Colors.dark.info },
      'EXPIRED': { name: 'time-outline', color: Colors.dark.warning },
      'COUNTERFEIT_SUSPECTED': { name: 'warning', color: Colors.dark.destructive },
      'TAMPERED_QR': { name: 'alert-circle', color: Colors.dark.destructive }
    };
    
    return statusMap[status] || { name: 'help-circle-outline', color: Colors.dark['muted-foreground'] };
  };

  const getStatusText = (status) => {
    const statusTextMap = {
      'AUTHENTIC': 'Verified ',
      'ALREADY_OWNED': 'Already Scanned',
      'EXPIRED': 'Expired ',
      'COUNTERFEIT_SUSPECTED': 'Counterfeit ',
      'TAMPERED_QR': 'Tampered '
    };
    
    return statusTextMap[status] || 'Unknown';
  };

  const getDrugName = (scanData) => {
    if (scanData.drugInfo?.name) return scanData.drugInfo.name;
    
    if (scanData.metadata?.attributes) {
      const nameAttr = scanData.metadata.attributes.find(attr => attr.trait_type === 'Drug Name');
      if (nameAttr) return nameAttr.value;
    }
    
    return 'Unknown Medicine';
  };

  const formatScanDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const handleScanPress = (scanData) => {
    router.push({
      pathname: '/history-details',
      params: { scanData: JSON.stringify(scanData) }
    });
  };

  const renderScanItem = ({ item }) => {
    const drugName = getDrugName(item);
    const statusIcon = getStatusIcon(item.status);
    const statusText = getStatusText(item.status);
    const scanDate = formatScanDate(item.timestamp);

    return (
      <TouchableOpacity 
        style={styles.scanCard}
        onPress={() => handleScanPress(item)}
      >
        <View style={styles.scanCardContent}>
          <View style={styles.drugInfoContainer}>
            <Text style={styles.scanCardText} numberOfLines={1}>
              {drugName}
            </Text>
            <Text style={styles.scanDateText}>
              {scanDate}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <Ionicons 
              name={statusIcon.name} 
              size={16} 
              color={statusIcon.color} 
            />
            <Text style={[styles.scanCardStatus, { color: statusIcon.color }]}>
              {statusText}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.recentScans}>
        <Text style={styles.recentTitle}>Recent Scans</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.dark.accent} />
          <Text style={styles.loadingText}>Loading recent scans...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.recentScans}>
      <Text style={styles.recentTitle}>Recent Scans</Text>
      {recentScans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="scan-outline" size={40} color={Colors.dark['muted-foreground']} />
          <Text style={styles.emptyText}>No scans yet</Text>
          <Text style={styles.emptySubText}>Start scanning medicines to see your history here</Text>
        </View>
      ) : (
        <FlatList
          data={recentScans}
          renderItem={renderScanItem}
          keyExtractor={(item, index) => `${item.timestamp}-${index}`}
          showsVerticalScrollIndicator={false}
          scrollEnabled={true}
          style={styles.flatList}
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
};

const styles = StyleSheet.create({
  recentScans: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.foreground,
    marginBottom: 16,
  },
  flatList: {
    flex: 1,
  },
  scanCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  scanCardContent: {
    padding: 12,
  },
  drugInfoContainer: {
    marginBottom: 8,
  },
  scanCardText: {
    fontSize: 16,
    color: Colors.dark.foreground,
    fontWeight: '600',
    marginBottom: 2,
  },
  scanDateText: {
    fontSize: 13,
    color: Colors.dark['muted-foreground'],
    fontWeight: '400',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanCardStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.dark['muted-foreground'],
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.foreground,
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.dark['muted-foreground'],
    marginTop: 4,
    textAlign: 'center',
  },
});

export default RecentScans;