import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ActivityIndicator,
  Linking
} from 'react-native';
import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { fetchPiPrice } from '@/utils/news-api';

interface PiPriceData {
  price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  last_updated: string;
}

export default function PiPriceWidget() {
  const [priceData, setPriceData] = useState<PiPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadPriceData = async () => {
      try {
        setLoading(true);
        const data = await fetchPiPrice();
        setPriceData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching Pi price:', err);
        setError('Failed to load Pi price data');
      } finally {
        setLoading(false);
      }
    };
    
    loadPriceData();
    
    // Refresh price data every 5 minutes
    const intervalId = setInterval(loadPriceData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const formatPrice = (price: number) => {
    return price < 0.01 
      ? price.toFixed(8) 
      : price.toLocaleString('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 4,
          maximumFractionDigits: 6
        });
  };
  
  const formatLargeNumber = (num: number) => {
    if (num >= 1000000000) {
      return `$${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`;
    }
    return `$${num.toFixed(2)}`;
  };
  
  const handleOpenCoinGecko = () => {
    Linking.openURL('https://www.coingecko.com/en/coins/pi-network');
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Pi price...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }
  
  if (!priceData) {
    return null;
  }
  
  const isPriceUp = priceData.price_change_percentage_24h >= 0;
  
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handleOpenCoinGecko}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Pi Network</Text>
        <ArrowUpRight size={16} color={colors.primary} />
      </View>
      
      <View style={styles.priceContainer}>
        <Text style={styles.price}>
          {formatPrice(priceData.price)}
        </Text>
        
        <View style={[
          styles.changeContainer, 
          { backgroundColor: isPriceUp ? colors.success + '20' : colors.error + '20' }
        ]}>
          {isPriceUp ? (
            <TrendingUp size={14} color={colors.success} />
          ) : (
            <TrendingDown size={14} color={colors.error} />
          )}
          <Text style={[
            styles.changeText,
            { color: isPriceUp ? colors.success : colors.error }
          ]}>
            {isPriceUp ? '+' : ''}
            {priceData.price_change_percentage_24h.toFixed(2)}%
          </Text>
        </View>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Market Cap</Text>
          <Text style={styles.statValue}>
            {formatLargeNumber(priceData.market_cap)}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Volume (24h)</Text>
          <Text style={styles.statValue}>
            {formatLargeNumber(priceData.total_volume)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.updatedText}>
        Last updated: {new Date(priceData.last_updated).toLocaleTimeString()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    ...typography.h3,
    color: colors.primary,
    fontSize: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  price: {
    ...typography.h2,
    fontSize: 24,
    fontWeight: '700',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border + '40',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textLight,
    marginBottom: 2,
  },
  statValue: {
    ...typography.body,
    fontWeight: '600',
  },
  updatedText: {
    ...typography.caption,
    color: colors.textLight,
    fontSize: 11,
    textAlign: 'right',
  },
  loadingContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingText: {
    ...typography.body,
    color: colors.textLight,
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.error,
  },
});
