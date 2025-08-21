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

interface StudySettings {
  isShuffled: boolean;
}

export default function KatakanaSettingsScreen() {
  const [isShuffled, setIsShuffled] = useState(false);

  const handleStartStudy = () => {
    router.push('/katakana/study');
  };

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
              onPress={() => setIsShuffled(false)}
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
              onPress={() => setIsShuffled(true)}
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

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartStudy}
          >
            <Text style={styles.startButtonText}>Start Studying</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  optionButton: {
    backgroundColor: colors.neutral.gray[100],
    borderRadius: 12,
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
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  startButton: {
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    borderRadius: 12,
    paddingVertical: spacing.lg,
  },
  startButtonText: {
    color: colors.text.inverse,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  titleText: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
});
