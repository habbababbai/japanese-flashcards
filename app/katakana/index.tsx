import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { fontSize, spacing } from '../../src/utils/responsive';
import { colors } from '../../src/utils/colors';
import { StudyOptions } from '../../src/types';

export default function KatakanaSettingsScreen() {
  const [isShuffled, setIsShuffled] = useState(false);
  const [characterCount, setCharacterCount] = useState<number | undefined>(
    undefined
  );
  const [characterCountSelected, setCharacterCountSelected] = useState(false);

  const handleStartStudy = () => {
    const studyOptions: StudyOptions = {
      isShuffled,
      characterCount: isShuffled ? characterCount : undefined,
    };

    // Navigate to study screen with study options
    router.push({
      pathname: '/katakana/study',
      params: { studyOptions: JSON.stringify(studyOptions) },
    });
  };

  const characterCountOptions = [10, 20, 30, 'All'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titleText}>Katakana Study</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Study Mode</Text>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[
                styles.optionButton,
                !isShuffled && styles.optionButtonActive,
              ]}
              onPress={() => {
                setIsShuffled(false);
                setCharacterCount(undefined);
                setCharacterCountSelected(false);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  !isShuffled && styles.optionTextActive,
                ]}
              >
                In Order
              </Text>
              <Text style={styles.optionDescription}>
                Study characters in their traditional order
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.optionButton,
                isShuffled && styles.optionButtonActive,
              ]}
              onPress={() => {
                setIsShuffled(true);
                setCharacterCount(undefined); // "All" is selected by default
                setCharacterCountSelected(true);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  isShuffled && styles.optionTextActive,
                ]}
              >
                Shuffled
              </Text>
              <Text style={styles.optionDescription}>
                Study characters in random order
              </Text>
            </TouchableOpacity>
          </View>

          {isShuffled && (
            <>
              <Text style={styles.sectionTitle}>Number of Characters</Text>
              <View style={styles.characterCountContainer}>
                {characterCountOptions.map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.characterCountButton,
                      (option === 'All'
                        ? characterCount === undefined
                        : characterCount === option) &&
                        styles.characterCountButtonActive,
                    ]}
                    onPress={() => {
                      setCharacterCount(
                        option === 'All' ? undefined : (option as number)
                      );
                      setCharacterCountSelected(true);
                    }}
                  >
                    <Text
                      style={[
                        styles.characterCountText,
                        (option === 'All'
                          ? characterCount === undefined
                          : characterCount === option) &&
                          styles.characterCountTextActive,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <TouchableOpacity
            style={[
              styles.startButton,
              isShuffled &&
                !characterCountSelected &&
                styles.startButtonDisabled,
            ]}
            onPress={handleStartStudy}
            disabled={isShuffled && !characterCountSelected}
          >
            <Text
              style={[
                styles.startButtonText,
                isShuffled &&
                  !characterCountSelected &&
                  styles.startButtonTextDisabled,
              ]}
            >
              Start Studying
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  characterCountButton: {
    backgroundColor: colors.neutral.gray[200],
    borderRadius: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  characterCountButtonActive: {
    backgroundColor: colors.primary.main,
  },
  characterCountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  characterCountText: {
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  characterCountTextActive: {
    color: colors.text.inverse,
  },
  container: {
    backgroundColor: colors.background.primary,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: colors.border.light,
    borderBottomWidth: 1,
    minHeight: spacing.xxl * 2,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  optionButton: {
    backgroundColor: colors.neutral.gray[100],
    borderRadius: spacing.md,
    padding: spacing.lg,
  },
  optionButtonActive: {
    backgroundColor: colors.primary.main,
  },
  optionDescription: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  optionText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  optionTextActive: {
    color: colors.text.inverse,
  },
  optionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    // Prevent layout shift by ensuring consistent positioning
    minHeight: '100%',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  startButton: {
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    borderRadius: spacing.md,
    paddingVertical: spacing.lg,
  },
  startButtonDisabled: {
    backgroundColor: colors.neutral.gray[300],
    opacity: 0.7,
  },
  startButtonText: {
    color: colors.text.inverse,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  startButtonTextDisabled: {
    color: colors.text.tertiary,
  },
  titleText: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
});
