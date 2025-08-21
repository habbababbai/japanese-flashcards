import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { fontSize, spacing } from '../utils/responsive';

interface StudySettings {
  isShuffled: boolean;
}

interface SettingsScreenProps {
  onStartStudy: (settings: StudySettings) => void;
  title: string;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onStartStudy,
  title,
}) => {
  const [isShuffled, setIsShuffled] = useState(false);

  const handleStartStudy = () => {
    onStartStudy({ isShuffled });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titleText}>{title} Study</Text>
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
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  header: {
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  optionButton: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderColor: '#e0e0e0',
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  optionButtonActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#4A90E2',
  },
  optionDescription: {
    color: '#999',
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  optionText: {
    color: '#666',
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  optionTextActive: {
    color: '#4A90E2',
  },
  optionsContainer: {
    marginBottom: spacing.xl,
  },
  safeArea: {
    backgroundColor: 'white',
    flex: 1,
  },
  sectionTitle: {
    color: '#333',
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  startButton: {
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  startButtonText: {
    color: 'white',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  titleText: {
    color: '#333',
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
