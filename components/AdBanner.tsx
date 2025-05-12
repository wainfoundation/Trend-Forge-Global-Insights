import React from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image,
  Linking,
  Platform,
} from "react-native";
import colors from "@/constants/colors";
import typography from "@/constants/typography";
import { X } from "lucide-react-native";

interface AdBannerProps {
  position: "top" | "middle" | "bottom";
  onClose?: () => void;
}

// Mock ad data - in a real app, this would come from an ad network API
const getRandomAd = () => {
  const ads = [
    {
      id: "ad1",
      title: "Boost Your Pi Earnings",
      description: "Join PiCommunity+ and increase your mining rate by 25%",
      imageUrl: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=1000&auto=format&fit=crop",
      ctaText: "Join Now",
      url: "https://picommunity.network",
    },
    {
      id: "ad2",
      title: "Pi Marketplace",
      description: "Buy and sell goods using Pi. Over 10,000 products available!",
      imageUrl: "https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=1000&auto=format&fit=crop",
      ctaText: "Shop Now",
      url: "https://pimarketplace.app",
    },
    {
      id: "ad3",
      title: "Pi Developer Program",
      description: "Build the future of Pi Network. $100K in grants available.",
      imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop",
      ctaText: "Apply Today",
      url: "https://pideveloper.network",
    },
  ];
  
  return ads[Math.floor(Math.random() * ads.length)];
};

export default function AdBanner({ position, onClose }: AdBannerProps) {
  const ad = getRandomAd();
  
  const handlePress = async () => {
    // In a real app, you would track ad clicks here
    try {
      await Linking.openURL(ad.url);
    } catch (error) {
      console.error("Failed to open ad URL:", error);
    }
  };
  
  return (
    <View style={[
      styles.container,
      position === "top" && styles.topPosition,
      position === "middle" && styles.middlePosition,
      position === "bottom" && styles.bottomPosition,
    ]}>
      <View style={styles.adContent}>
        <Image 
          source={{ uri: ad.imageUrl }} 
          style={styles.adImage}
          resizeMode="cover"
        />
        <View style={styles.adTextContainer}>
          <Text style={styles.adTitle}>{ad.title}</Text>
          <Text style={styles.adDescription} numberOfLines={2}>
            {ad.description}
          </Text>
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={handlePress}
          >
            <Text style={styles.ctaButtonText}>{ad.ctaText}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {onClose && (
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={onClose}
        >
          <X size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
      
      <View style={styles.adLabel}>
        <Text style={styles.adLabelText}>Ad</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 12,
    overflow: "hidden",
    position: "relative",
  },
  topPosition: {
    marginTop: 0,
    marginBottom: 16,
  },
  middlePosition: {
    marginVertical: 16,
  },
  bottomPosition: {
    marginTop: 16,
    marginBottom: 0,
  },
  adContent: {
    flexDirection: "row",
    padding: 12,
  },
  adImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
    marginRight: 12,
  },
  adTextContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  adTitle: {
    ...typography.body,
    fontWeight: "600",
    marginBottom: 4,
  },
  adDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  ctaButton: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  ctaButtonText: {
    color: colors.card,
    fontWeight: "500",
    fontSize: 12,
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 10,
  },
  adLabel: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: colors.textSecondary + "80", // 50% opacity
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  adLabelText: {
    color: colors.card,
    fontSize: 8,
    fontWeight: "500",
  },
});
