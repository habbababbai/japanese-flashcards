import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { spacing, fontSize, hp, wp } from '../utils/responsive';

interface ToastProps {
  isVisible: boolean;
  isCorrect: boolean;
  onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  isVisible,
  isCorrect,
  onHide,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-50);

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withTiming(0, { duration: 200 });

      const timer = setTimeout(() => {
        opacity.value = withTiming(0, { duration: 200 });
        translateY.value = withTiming(-50, { duration: 200 }, () => {
          runOnJS(onHide)();
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, opacity, translateY, onHide]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        // eslint-disable-next-line react-native/no-inline-styles,
        {
          backgroundColor: isCorrect ? '#4CAF50' : '#F44336',
        },
        animatedStyle,
      ]}
    >
      <Text style={styles.emoji}>{isCorrect ? '✅' : '❌'}</Text>
      <Text style={styles.text}>
        {isCorrect ? 'I knew it!' : "I didn't know it"}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  emoji: {
    fontSize: fontSize.lg,
  },
  text: {
    color: 'white',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  toast: {
    alignItems: 'center',
    borderRadius: hp(2.5),
    elevation: 5,
    flexDirection: 'row',
    gap: spacing.sm,
    height: hp(5),
    justifyContent: 'center',
    left: wp(5),
    position: 'absolute',
    right: wp(5),
    shadowColor: '#000',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    top: hp(1.5),
    zIndex: 1000,
  },
});
