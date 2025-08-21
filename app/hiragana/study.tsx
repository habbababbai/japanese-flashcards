import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Flashcard } from '../../src/components/Flashcard';
import { Kana, StudyProgress } from '../../src/types';
import { spacing, fontSize } from '../../src/utils/responsive';
import { useStorage } from '../../src/hooks/useStorage';
import { hiraganaData } from '../../src/data/hiragana';

export default function HiraganaStudyScreen() {
  const { saveSession, saveProgress } = useStorage();

  const [shuffledKanaList, setShuffledKanaList] = useState<Kana[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState<StudyProgress[]>([]);

  // Initialize with shuffled list
  useEffect(() => {
    const shuffled = [...hiraganaData].sort(() => Math.random() - 0.5);
    setShuffledKanaList(shuffled);
    setCurrentIndex(0);
    setProgress([]);
  }, []);

  const currentKana = shuffledKanaList[currentIndex];
  const isLastCard = currentIndex === shuffledKanaList.length - 1;

  if (!currentKana) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.titleText}>Hiragana</Text>
              <Text style={styles.progressText}>Loading...</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const handleAnswer = (isCorrect: boolean) => {
    const newProgress: StudyProgress = {
      kanaId: currentKana.id,
      isCorrect,
      responseTime: Date.now(),
      timestamp: new Date(),
    };

    // Save progress to storage
    saveProgress(newProgress);
    setProgress([...progress, newProgress]);

    if (isLastCard) {
      // Study session complete
      const finalProgress = [...progress, newProgress];

      // Save session to storage
      const session = {
        id: Date.now().toString(),
        kanaType: 'hiragana' as const,
        startTime: new Date(),
        endTime: new Date(),
        cardsReviewed: finalProgress.length,
        correctAnswers: finalProgress.filter(p => p.isCorrect).length,
        incorrectAnswers: finalProgress.filter(p => !p.isCorrect).length,
      };
      saveSession(session);

      const correctCount = finalProgress.filter(p => p.isCorrect).length;
      const totalCount = finalProgress.length;

      Alert.alert(
        'Hiragana Study Complete! 🎉',
        `You got ${correctCount} out of ${totalCount} correct!`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.titleText}>Hiragana</Text>
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
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  header: {
    backgroundColor: 'white',
    borderBottomColor: '#e0e0e0',
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
    color: '#666',
    fontSize: fontSize.md,
  },
  safeArea: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  titleText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
  },
});
