import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Flashcard } from '../../src/components/Flashcard';
import { Kana, StudyProgress, StudyOptions } from '../../src/types';
import { spacing, fontSize } from '../../src/utils/responsive';
import { colors } from '../../src/utils/colors';
import { useAppDispatch } from '../../src/hooks/useRedux';
import {
  startSession,
  endSession,
  addProgress,
} from '../../src/store/slices/studySessionSlice';
import { katakanaData } from '../../src/data/katakana';

export default function KatakanaStudyScreen() {
  const dispatch = useAppDispatch();
  const params = useLocalSearchParams();

  const [shuffledKanaList, setShuffledKanaList] = useState<Kana[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState<StudyProgress[]>([]);

  // Parse study options from router params
  const studyOptions: StudyOptions = useMemo(() => {
    return params.studyOptions
      ? JSON.parse(params.studyOptions as string)
      : { isShuffled: true };
  }, [params.studyOptions]);

  // Initialize with shuffled list and start session
  useEffect(() => {
    let kanaToStudy: Kana[];

    if (studyOptions.isShuffled) {
      // Shuffle the data
      const shuffled = [...katakanaData].sort(() => Math.random() - 0.5);

      // Limit to character count if specified
      if (studyOptions.characterCount) {
        kanaToStudy = shuffled.slice(0, studyOptions.characterCount);
      } else {
        kanaToStudy = shuffled;
      }
    } else {
      // Use all characters in order
      kanaToStudy = [...katakanaData];
    }

    setShuffledKanaList(kanaToStudy);
    setCurrentIndex(0);
    setProgress([]);

    // Start Redux session
    dispatch(
      startSession({
        kanaType: 'katakana',
        studyOptions,
      })
    );
  }, [dispatch, studyOptions]);

  const currentKana = shuffledKanaList[currentIndex];
  const isLastCard = currentIndex === shuffledKanaList.length - 1;

  const handleAnswer = useCallback(
    (isCorrect: boolean) => {
      const newProgress: StudyProgress = {
        kanaId: currentKana.id,
        isCorrect,
        responseTime: Date.now(),
        timestamp: new Date().toISOString(),
      };

      // Dispatch progress to Redux
      dispatch(addProgress(newProgress));
      setProgress(prev => [...prev, newProgress]);

      if (isLastCard) {
        // Study session complete
        const finalProgress = [...progress, newProgress];

        // End session in Redux
        dispatch(
          endSession({
            endTime: new Date().toISOString(),
            progress: finalProgress,
          })
        );

        const correctCount = finalProgress.filter(p => p.isCorrect).length;
        const totalCount = finalProgress.length;

        Alert.alert(
          'Katakana Study Complete! 🎉',
          `You got ${correctCount} out of ${totalCount} correct!`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    },
    [currentKana, isLastCard, progress, dispatch]
  );

  if (!currentKana) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.titleText}>Katakana</Text>
              <Text style={styles.progressText}>Loading...</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.titleText}>Katakana</Text>
            <Text style={styles.progressText}>
              {currentIndex + 1} / {shuffledKanaList.length}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <Flashcard kana={currentKana} onAnswer={handleAnswer} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  header: {
    backgroundColor: colors.background.primary,
    borderBottomColor: colors.border.light,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    color: colors.text.secondary,
    fontSize: fontSize.md,
  },
  safeArea: {
    backgroundColor: colors.neutral.white,
    flex: 1,
  },
  titleText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
});
