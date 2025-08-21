import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  withTiming,
} from 'react-native-reanimated';
import { Kana } from '../types';
import { spacing, fontSize, hp, wp } from '../utils/responsive';
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
  const [showAnswerButtons, setShowAnswerButtons] = useState(false);
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);
  const flipAnimation = useSharedValue(0);
  const answerButtonsOpacity = useSharedValue(1);
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(1);

  // Reset state when kana changes
  useEffect(() => {
    setIsFlipped(false);
    setShowAnswerButtons(false);
    setUserAnswer(null);
    flipAnimation.value = 0;
    answerButtonsOpacity.value = 1;
    cardScale.value = 1;
    cardOpacity.value = 1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kana.id]);

  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 1;
    flipAnimation.value = withSpring(toValue, {
      damping: 15,
      stiffness: 100,
    });
    setIsFlipped(!isFlipped);

    if (!isFlipped) {
      setShowAnswerButtons(true);
    } else {
      setShowAnswerButtons(false);
    }

    onFlip?.();
  };

  const handleAnswer = (isCorrect: boolean) => {
    // Set user answer for color feedback
    setUserAnswer(isCorrect);

    // Hide answer buttons immediately for better test compatibility
    setShowAnswerButtons(false);

    // Animate answer buttons fade out
    answerButtonsOpacity.value = withTiming(0, {
      duration: 500,
    });

    // Animate card scale down slightly
    cardScale.value = withTiming(0.95, {
      duration: 400,
    });

    // Animate card fade out
    cardOpacity.value = withTiming(0, {
      duration: 600,
    });

    // Call onAnswer after a shorter delay to allow animations to complete
    setTimeout(() => {
      onAnswer?.(isCorrect);
      flipAnimation.value = withSpring(0, {
        damping: 15,
        stiffness: 100,
      });
      setIsFlipped(false);

      // Reset animations for next card
      cardScale.value = withTiming(1, { duration: 400 });
      answerButtonsOpacity.value = withTiming(1, { duration: 500 });
      cardOpacity.value = withTiming(1, { duration: 600 });
    }, 500);
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnimation.value, [0, 1], [0, 180]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnimation.value, [0, 1], [180, 360]);
    return {
      transform: [{ rotateY: `${rotateY}deg` }],
    };
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
    };
  });

  const answerButtonsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: answerButtonsOpacity.value,
    };
  });

  const cardContainerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cardOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[cardAnimatedStyle, cardContainerAnimatedStyle]}>
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
      {showAnswerButtons && (
        <Animated.View
          style={[styles.answerButtons, answerButtonsAnimatedStyle]}
        >
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  answerButton: {
    alignItems: 'center',
    borderRadius: hp(2),
    elevation: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: hp(7),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    shadowColor: colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  answerButtonText: {
    color: colors.text.inverse,
    fontSize: fontSize.sm,
    fontWeight: '700',
    lineHeight: fontSize.sm * 1.25,
    textAlign: 'center',
  },
  answerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  card: {
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    borderRadius: hp(2.5),
    elevation: 8,
    height: '100%',
    justifyContent: 'center',
    padding: hp(3.5),
    position: 'absolute',
    shadowColor: colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: '100%',
  },
  cardBack: {
    backgroundColor: colors.secondary.main,
  },
  cardContainer: {
    height: hp(50),
    position: 'relative',
    width: wp(90),
  },
  cardFront: {
    backgroundColor: colors.primary.main,
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  correctButton: {
    backgroundColor: colors.success.main,
    borderColor: colors.success.dark,
    borderWidth: 2,
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
    borderColor: colors.error.dark,
    borderWidth: 2,
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
