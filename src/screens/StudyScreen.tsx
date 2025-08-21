import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Flashcard } from '../components/Flashcard';
import { Kana, StudyProgress } from '../types';
import { spacing, fontSize } from '../utils/responsive';
import { useStorage } from '../hooks/useStorage';

interface StudyScreenProps {
  kanaList: Kana[];
  onComplete?: (progress: StudyProgress[]) => void;
  onBack?: () => void;
  title?: string;
  isShuffled?: boolean;
}

export const StudyScreen: React.FC<StudyScreenProps> = ({
  kanaList,
  onComplete,
  onBack,
  title = 'Study',
  isShuffled = true,
}) => {
  const { saveSession, saveProgress } = useStorage();

  const [shuffledKanaList, setShuffledKanaList] = useState<Kana[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState<StudyProgress[]>([]);

  // Initialize with shuffled or ordered list
  useEffect(() => {
    if (isShuffled) {
      shuffleKanaList();
    } else {
      setShuffledKanaList([...kanaList]);
      setCurrentIndex(0);
      setProgress([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kanaList, isShuffled]);

  const shuffleKanaList = () => {
    const shuffled = [...kanaList].sort(() => Math.random() - 0.5);
    setShuffledKanaList(shuffled);
    setCurrentIndex(0);
    setProgress([]);
  };

  const currentKana = shuffledKanaList[currentIndex];
  const isLastCard = currentIndex === shuffledKanaList.length - 1;

  if (!currentKana) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.titleText}>{title}</Text>
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
      const endTime = new Date();
      const finalProgress = [...progress, newProgress];

      // Save session to storage
      const session = {
        id: Date.now().toString(),
        kanaType: title.toLowerCase() as 'hiragana' | 'katakana',
        startTime: new Date(),
        endTime,
        cardsReviewed: finalProgress.length,
        correctAnswers: finalProgress.filter(p => p.isCorrect).length,
        incorrectAnswers: finalProgress.filter(p => !p.isCorrect).length,
      };
      saveSession(session);

      onComplete?.(finalProgress);
      Alert.alert(
        'Study Session Complete! 🎉',
        `You reviewed ${shuffledKanaList.length} ${title.toLowerCase()} characters.`,
        [
          {
            text: 'OK',
            onPress: onBack,
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
            <Text style={styles.titleText}>{title}</Text>
            <Text style={styles.progressText}>
              {currentIndex + 1} / {shuffledKanaList.length}
            </Text>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <Flashcard kana={currentKana} onAnswer={handleAnswer} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
  },
  progressText: {
    color: '#333',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  safeArea: {
    backgroundColor: 'white',
    flex: 1,
  },
  titleText: {
    color: '#333',
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
});
