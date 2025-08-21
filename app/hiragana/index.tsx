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

interface StudySettings {
  isShuffled: boolean;
}

export default function HiraganaSettingsScreen() {
  const [isShuffled, setIsShuffled] = useState(false);

  const handleStartStudy = () => {
    router.push('/hiragana/study');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titleText}>Hiragana Study</Text>
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
  safeArea: {
    backgroundColor: 'white',
    flex: 1,
  },
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  titleText: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  optionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  optionButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: spacing.lg,
  },
  optionButtonActive: {
    backgroundColor: '#4A90E2',
  },
  optionText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  optionTextActive: {
    color: 'white',
  },
  optionDescription: {
    color: '#666',
    fontSize: fontSize.sm,
  },
  startButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
