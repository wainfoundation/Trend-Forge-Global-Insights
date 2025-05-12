import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Journalist } from '@/types/journalist';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { CheckCircle, Twitter } from 'lucide-react-native';

interface JournalistCardProps {
  journalist: Journalist;
  compact?: boolean;
  onPress?: () => void;
}

export default function JournalistCard({ journalist, compact = false, onPress }: JournalistCardProps) {
  const router = useRouter();
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/journalist/${journalist.id}`);
    }
  };
  
  if (compact) {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={handlePress}>
        <Image source={{ uri: journalist.avatarUrl }} style={styles.compactAvatar} />
        <View style={styles.compactInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.compactName} numberOfLines={1}>{journalist.name}</Text>
            {journalist.verified && (
              <CheckCircle size={14} color={colors.primary} style={styles.verifiedIcon} />
            )}
          </View>
          <Text style={styles.compactBio} numberOfLines={1}>{journalist.bio}</Text>
        </View>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image source={{ uri: journalist.avatarUrl }} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{journalist.name}</Text>
            {journalist.verified && (
              <CheckCircle size={16} color={colors.primary} style={styles.verifiedIcon} />
            )}
          </View>
          <Text style={styles.stats}>{journalist.articles || 0} articles</Text>
        </View>
        {journalist.twitter && (
          <TouchableOpacity style={styles.twitterContainer}>
            <Twitter size={14} color={colors.primary} />
            <Text style={styles.twitterHandle}>{journalist.twitter}</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.bio} numberOfLines={2}>{journalist.bio}</Text>
        <View style={styles.expertiseContainer}>
          {journalist.expertise.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.expertiseTag}>
              <Text style={styles.expertiseText}>{tag}</Text>
            </View>
          ))}
          {journalist.expertise.length > 3 && (
            <Text style={styles.moreText}>+{journalist.expertise.length - 3}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 4,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    ...typography.h4,
    marginRight: 4,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  stats: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  twitterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  twitterHandle: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: 4,
  },
  bio: {
    ...typography.bodySmall,
    color: colors.text,
    marginBottom: 8,
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  expertiseTag: {
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  expertiseText: {
    ...typography.caption,
    color: colors.text,
  },
  moreText: {
    ...typography.caption,
    color: colors.primary,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginBottom: 8,
  },
  compactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    ...typography.body,
    fontWeight: '500',
  },
  compactBio: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
