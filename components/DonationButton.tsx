import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface DonationButtonProps {
  journalistId: string;
  journalistName: string;
  articleId: string;
}

export default function DonationButton({ journalistId, journalistName, articleId }: DonationButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/donations',
      params: { journalistId, articleId }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.supportText}>
        Did you enjoy this article? Support the journalist with Pi.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Heart size={18} color={colors.card} />
        <Text style={styles.buttonText}>Support {journalistName}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  supportText: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    ...typography.bodySmall,
    color: colors.card,
    fontWeight: '600',
    marginLeft: 8,
  },
});
