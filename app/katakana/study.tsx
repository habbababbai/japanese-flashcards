import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
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
    try {
      return params.studyOptions
        ? JSON.parse(params.studyOptions as string)
        : { isShuffled: true };
    } catch {
      // Return default options if JSON parsing fails
      return { isShuffled: true };
    }
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

  const handleClose = useCallback(() => {
    Alert.alert(
      'Leave Study Session?',
      'Are you sure you want to leave? Your progress will be saved, but unanswered characters will be marked as incorrect.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: () => {
            // Mark all unanswered characters as wrong
            const answeredKanaIds = new Set(progress.map(p => p.kanaId));
            const unansweredProgress: StudyProgress[] = shuffledKanaList
              .filter(kana => !answeredKanaIds.has(kana.id))
              .map(kana => ({
                kanaId: kana.id,
                isCorrect: false,
                responseTime: 0,
                timestamp: new Date().toISOString(),
              }));

            // Dispatch addProgress for each unanswered character to update kanaProgress
            unansweredProgress.forEach(progressItem => {
              dispatch(addProgress(progressItem));
            });

            const finalProgress = [...progress, ...unansweredProgress];

            // End session in Redux
            dispatch(
              endSession({
                endTime: new Date().toISOString(),
                progress: finalProgress,
              })
            );

            router.back();
          },
        },
      ]
    );
  }, [progress, shuffledKanaList, dispatch]);

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
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Flashcard kana={currentKana} onAnswer={handleAnswer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral.white,
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
    zIndex: 1,
  },
  closeButtonText: {
    color: colors.text.secondary,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginTop: 100,
  },
});
