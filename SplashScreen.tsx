import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import colors from '@/constants/colors';
import typography from '@/constants/typography';

interface SplashScreenProps {
  onFinish?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // First animation: scale up slightly
    Animated.timing(scaleAnim, {
      toValue: 1.1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // After a delay, fade out
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          opacity: fadeAnim,
        }
      ]}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        <Text style={styles.title}>Trend Forge</Text>
      </Animated.View>
      <Text style={styles.subtitle}>by Mrwain Organization</Text>
      <Text style={styles.tagline}>In-depth analysis and global insights</Text>
      <ActivityIndicator size="large" color="#e3120b" style={styles.spinner} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#e3120b', // Economist red color
    marginBottom: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563', // Gray-600
    marginBottom: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 16,
    color: '#6b7280', // Gray-500
    marginBottom: 24,
    fontStyle: 'italic',
  },
  spinner: {
    marginTop: 8,
  }
});

export default SplashScreen;
