import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { Crown } from 'lucide-react-native';

interface SubscriptionBannerProps {
  onSubscribe: () => void;
}

export default function SubscriptionBanner({ onSubscribe }: SubscriptionBannerProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Crown size={24} color={colors.card} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Upgrade to Premium</Text>
        <Text style={styles.description}>
          Get unlimited access to all articles, no ads, and exclusive content.
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={onSubscribe}>
        <Text style={styles.buttonText}>Subscribe</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.h4,
    color: colors.card,
    marginBottom: 4,
  },
  description: {
    ...typography.caption,
    color: colors.card,
  },
  button: {
    backgroundColor: colors.card,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  buttonText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
});
