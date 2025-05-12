import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';
import { X, Crown } from 'lucide-react-native';

interface PremiumContentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PremiumContentModal({ visible, onClose, onSuccess }: PremiumContentModalProps) {
  const handleSubscribe = () => {
    onClose();
    onSuccess();
    // Navigate to subscription page
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
          
          <View style={styles.iconContainer}>
            <Crown size={40} color={colors.primary} />
          </View>
          
          <Text style={styles.title}>Premium Content</Text>
          
          <Text style={styles.description}>
            This article is exclusive to our premium subscribers. Upgrade now to access this and all other premium content.
          </Text>
          
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Premium Benefits:</Text>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitText}>• Unlimited access to all articles</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitText}>• No ads or article limits</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitText}>• Exclusive premium content</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitText}>• Support quality journalism</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.subscribeButton}
            onPress={handleSubscribe}
          >
            <Text style={styles.subscribeButtonText}>Subscribe to Premium</Text>
          </TouchableOpacity>
          
          <Text style={styles.footnote}>
            Starting at just 5 Pi per month. Cancel anytime.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: 24,
    color: colors.text,
  },
  benefitsContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  benefitsTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginBottom: 8,
  },
  benefitItem: {
    marginBottom: 4,
  },
  benefitText: {
    ...typography.bodySmall,
    color: colors.text,
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  subscribeButtonText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.card,
    textAlign: 'center',
  },
  footnote: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.text,
  },
});
