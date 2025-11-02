
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  visible: boolean;
  onHide?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  visible,
  onHide,
}) => {
  const [opacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide?.();
      });
    }
  }, [visible, duration, opacity, onHide]);

  if (!visible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'info':
      default:
        return colors.primary;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          backgroundColor: getBackgroundColor(),
        },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    zIndex: 1000,
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    elevation: 5,
  },
  text: {
    color: colors.card,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
