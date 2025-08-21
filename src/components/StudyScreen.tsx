import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Flashcard } from './Flashcard';
import { Kana, StudyProgress, StudyOptions } from '../types';
import { spacing, fontSize } from '../utils/responsive';
import { colors } from '../utils/colors';
import { useAppDispatch } from '../hooks/useRedux';
import {
  startSession,
  endSession,
  addProgress,
} from '../store/slices/studySessionSlice';

interface StudyScreenProps {
  kanaData: Kana[];
  kanaType: 'hiragana' | 'katakana';
  completionTitle: string;
}

export function StudyScreen({
  kanaData,
  kanaType,
  completionTitle,
}: StudyScreenProps) {
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
      const shuffled = [...kanaData].sort(() => Math.random() - 0.5);

      // Limit to character count if specified
      if (studyOptions.characterCount) {
        kanaToStudy = shuffled.slice(0, studyOptions.characterCount);
      } else {
        kanaToStudy = shuffled;
      }
    } else {
      // Use all characters in order
      kanaToStudy = [...kanaData];
    }

    setShuffledKanaList(kanaToStudy);
    setCurrentIndex(0);
    setProgress([]);

    // Start Redux session
    dispatch(
      startSession({
        kanaType,
        studyOptions,
      })
    );
  }, [dispatch, studyOptions, kanaData, kanaType]);

  const currentKana = shuffledKanaList[currentIndex];
  const isLastCard = currentIndex === shuffledKanaList.length - 1;

  const handleLeaveSession = useCallback(() => {
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
  }, [progress, shuffledKanaList, dispatch]);

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
          onPress: handleLeaveSession,
        },
      ]
    );
  }, [handleLeaveSession]);

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
          `${completionTitle} Study Complete! 🎉`,
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
    [currentKana, isLastCard, progress, dispatch, completionTitle]
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
  closeButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    top: 50,
    width: 32,
    zIndex: 1,
  },
  closeButtonText: {
    color: colors.text.secondary,
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: colors.neutral.white,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    color: colors.text.secondary,
    fontSize: fontSize.lg,
    marginTop: 100,
    textAlign: 'center',
  },
});
