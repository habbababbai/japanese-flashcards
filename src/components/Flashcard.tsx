import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  withTiming,
} from 'react-native-reanimated';
import { Kana } from '../types';
import { spacing, fontSize, cardDimensions } from '../utils/responsive';
import { colors } from '../utils/colors';

interface FlashcardProps {
  kana: Kana;
  onFlip?: () => void;
  onAnswer?: (isCorrect: boolean) => void;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  kana,
  onFlip,
  onAnswer,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const flipAnimation = useSharedValue(0);
  const cardAnimation = useSharedValue(1);

  // Reset state when kana changes
  useEffect(() => {
    setIsFlipped(false);
    setUserAnswer(null);
    flipAnimation.value = 0;
    cardAnimation.value = 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kana.id]);

  const handleFlip = useCallback(() => {
    const toValue = isFlipped ? 0 : 1;
    flipAnimation.value = withSpring(toValue, {
      damping: 15,
      stiffness: 100,
    });
    setIsFlipped(!isFlipped);
    onFlip?.();
  }, [isFlipped, flipAnimation, onFlip]);

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      // Set user answer for color feedback
      setUserAnswer(isCorrect);

      // Animate card fade out
      cardAnimation.value = withTiming(0, {
        duration: 600,
      });

      // Call onAnswer after animation completes
      setTimeout(() => {
        onAnswer?.(isCorrect);
        flipAnimation.value = withSpring(0, {
          damping: 15,
          stiffness: 100,
        });
        setIsFlipped(false);

        // Reset animations for next card
        cardAnimation.value = withTiming(1, { duration: 600 });
      }, 600);
    },
    [onAnswer, cardAnimation, flipAnimation]
  );

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnimation.value, [0, 1], [0, Math.PI]);
    return {
      transform: [{ rotateY: `${rotateY}rad` }],
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      flipAnimation.value,
      [0, 1],
      [Math.PI, 2 * Math.PI]
    );
    return {
      transform: [{ rotateY: `${rotateY}rad` }],
    };
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cardAnimation.value,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={cardAnimatedStyle}>
        <TouchableOpacity onPress={handleFlip} activeOpacity={0.9}>
          <View style={styles.cardContainer}>
            <Animated.View
              style={[
                styles.card,
                styles.cardFront,
                frontAnimatedStyle,
                isFlipped && styles.hidden,
              ]}
            >
              {!isFlipped && (
                <>
                  <Text style={styles.kanaText}>{kana.character}</Text>
                  <Text style={styles.hintText}>
                    What does this sound like?
                  </Text>
                </>
              )}
            </Animated.View>
            <Animated.View
              style={[
                styles.card,
                styles.cardBack,
                backAnimatedStyle,
                !isFlipped && styles.hidden,
                userAnswer !== null && {
                  backgroundColor: userAnswer
                    ? colors.success.main
                    : colors.error.main,
                },
              ]}
            >
              {isFlipped && (
                <>
                  <Text style={styles.romajiText}>{kana.romaji}</Text>
                  <Text style={styles.hintText}>Did you know it?</Text>
                </>
              )}
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Animated.View>
      {isFlipped ? (
        <Animated.View style={styles.answerButtons}>
          <TouchableOpacity
            style={[styles.answerButton, styles.incorrectButton]}
            onPress={() => handleAnswer(false)}
          >
            <Text style={styles.answerButtonText}>
              ❌ I didn&apos;t know it
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.answerButton, styles.correctButton]}
            onPress={() => handleAnswer(true)}
          >
            <Text style={styles.answerButtonText}>✅ I knew it!</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        <View style={styles.answerButtons} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  answerButton: {
    alignItems: 'center',
    borderRadius: spacing.md,
    elevation: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: spacing.xxl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    shadowColor: colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: spacing.xs,
    },
    shadowOpacity: 0.3,
    shadowRadius: spacing.sm,
  },
  answerButtonText: {
    color: colors.text.inverse,
    fontSize: fontSize.sm,
    fontWeight: '700',
    lineHeight: fontSize.sm * 1.25,
    textAlign: 'center',
  },
  answerButtons: {
    bottom: spacing.md,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-around',
    left: 0,
    paddingHorizontal: spacing.md,
    position: 'absolute',
    right: 0,
  },
  card: {
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    borderRadius: spacing.lg,
    elevation: 8,
    height: '100%',
    justifyContent: 'center',
    padding: spacing.xl,
    position: 'absolute',
    shadowColor: colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: spacing.xs,
    },
    shadowOpacity: 0.3,
    shadowRadius: spacing.md,
    width: '100%',
  },
  cardBack: {
    backgroundColor: colors.secondary.main,
  },
  cardContainer: {
    alignSelf: 'center',
    height: cardDimensions.height,
    position: 'relative',
    width: cardDimensions.width,
  },
  cardFront: {
    backgroundColor: colors.primary.main,
  },
  container: {
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.xxl * 2 + spacing.lg,
  },
  correctButton: {
    backgroundColor: colors.success.main,
  },
  hidden: {
    opacity: 0,
    pointerEvents: 'none',
  },
  hintText: {
    color: colors.neutral.white,
    fontSize: fontSize.sm,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  incorrectButton: {
    backgroundColor: colors.error.main,
  },
  kanaText: {
    color: colors.text.inverse,
    fontSize: fontSize.huge,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  romajiText: {
    color: colors.text.inverse,
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});
