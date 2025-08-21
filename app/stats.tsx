import React, { useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useAppSelector } from '../src/hooks/useRedux';
import { spacing, fontSize } from '../src/utils/responsive';
import { colors } from '../src/utils/colors';
import { hiraganaData } from '../src/data/hiragana';
import { katakanaData } from '../src/data/katakana';

export default function StatsScreen() {
  const sessions = useAppSelector(state => state.studySession.sessions);
  const kanaProgress = useAppSelector(state => state.studySession.kanaProgress);
  const isLoading = useAppSelector(state => state.studySession.isLoading);

  // Load data on mount
  useEffect(() => {
    // Data will be loaded automatically by the store
  }, []);

  const totalStudyTime = sessions.reduce((total, session) => {
    if (session.endTime) {
      const duration =
        new Date(session.endTime).getTime() -
        new Date(session.startTime).getTime();
      return total + duration;
    }
    return total;
  }, 0);

  const totalCardsReviewed = sessions.reduce(
    (total, session) => total + session.cardsReviewed,
    0
  );
  const totalCorrectAnswers = sessions.reduce(
    (total, session) => total + session.correctAnswers,
    0
  );

  const formatDuration = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const calculateAccuracy = () => {
    if (totalCardsReviewed === 0) return 0;
    return Math.round((totalCorrectAnswers / totalCardsReviewed) * 100);
  };

  // Prepare data for FlashList components
  const recentSessions = sessions.slice(-5).reverse();

  const kanaProgressData = useMemo(() => {
    // Combine all kana data (hiragana + katakana)
    const allKana = [...hiraganaData, ...katakanaData];

    // Create progress data for all characters, including those with zero progress
    const allProgressData = allKana.map(kana => {
      const progress = kanaProgress[kana.id] || {
        correctCount: 0,
        incorrectCount: 0,
      };
      const total = progress.correctCount + progress.incorrectCount;
      const accuracy =
        total > 0 ? Math.round((progress.correctCount / total) * 100) : 0;

      return {
        kanaId: kana.id,
        character: kana.character,
        romaji: kana.romaji,
        type: kana.type,
        progress,
        total,
        accuracy,
      };
    });

    // Filter out characters with no practice, then sort by frequency only
    return allProgressData
      .filter(item => item.total > 0) // Only show practiced characters
      .sort((a, b) => b.total - a.total); // Sort by frequency (most studied first)
  }, [kanaProgress]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.titleText}>Study Statistics</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.titleText}>Study Statistics</Text>
      </View>
      <ScrollView style={styles.container}>
        {/* Overall Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalCardsReviewed}</Text>
              <Text style={styles.statLabel}>Cards Reviewed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{calculateAccuracy()}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {formatDuration(totalStudyTime)}
              </Text>
              <Text style={styles.statLabel}>Total Time</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{sessions.length}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
          </View>
        </View>

        {/* Recent Sessions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {recentSessions.length === 0 ? (
            <Text style={styles.emptyText}>No study sessions yet</Text>
          ) : (
            <View style={styles.listContainer}>
              <FlashList
                estimatedItemSize={86}
                data={recentSessions}
                renderItem={({ item: session }) => (
                  <View style={styles.sessionCard}>
                    <View style={styles.sessionHeader}>
                      <Text style={styles.sessionType}>
                        {session.kanaType.charAt(0).toUpperCase() +
                          session.kanaType.slice(1)}
                      </Text>
                      <Text style={styles.sessionDate}>
                        {new Date(session.startTime).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.sessionStats}>
                      <Text style={styles.sessionStat}>
                        {session.cardsReviewed} cards • {session.correctAnswers}{' '}
                        correct • {session.incorrectAnswers} incorrect
                      </Text>
                      {session.endTime && (
                        <Text style={styles.sessionDuration}>
                          Duration:{' '}
                          {formatDuration(
                            new Date(session.endTime).getTime() -
                              new Date(session.startTime).getTime()
                          )}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
                getItemType={_item => 'default'}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </View>

        {/* Kana Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Character Progress</Text>
          <Text style={styles.sectionSubtitle}>
            Practiced characters ({kanaProgressData.length} total) - Sorted by
            study frequency
          </Text>
          {kanaProgressData.length === 0 ? (
            <Text style={styles.emptyText}>No characters available</Text>
          ) : (
            <View style={styles.listContainer}>
              <FlashList
                estimatedItemSize={86}
                data={kanaProgressData}
                renderItem={({ item }) => (
                  <View style={styles.kanaProgressItem}>
                    <View style={styles.kanaInfo}>
                      <Text style={styles.kanaCharacter}>{item.character}</Text>
                      <Text style={styles.kanaRomaji}>{item.romaji}</Text>
                      <Text style={styles.kanaType}>{item.type}</Text>
                    </View>
                    <View style={styles.kanaProgressStats}>
                      <Text style={styles.kanaProgressText}>
                        {item.progress.correctCount}✓{' '}
                        {item.progress.incorrectCount}✗
                      </Text>
                      <Text style={styles.kanaAccuracy}>{item.accuracy}%</Text>
                    </View>
                  </View>
                )}
                getItemType={_item => 'default'}
                keyExtractor={item => `${item.type}-${item.kanaId}`}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    flex: 1,
  },
  emptyText: {
    color: colors.text.tertiary,
    fontSize: fontSize.md,
    fontStyle: 'italic',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  header: {
    backgroundColor: colors.background.primary,
    borderBottomColor: colors.border.light,
    borderBottomWidth: 1,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  kanaAccuracy: {
    color: colors.primary.main,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  kanaCharacter: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
  kanaInfo: {
    alignItems: 'center',
  },
  kanaProgressItem: {
    alignItems: 'center',
    borderBottomColor: colors.neutral.gray[100],
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  kanaProgressStats: {
    alignItems: 'flex-end',
  },
  kanaProgressText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  kanaRomaji: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  kanaType: {
    color: colors.text.tertiary,
    fontSize: fontSize.xs,
    textTransform: 'capitalize',
  },
  listContainer: {
    height: 400,
    marginTop: spacing.sm,
  },
  safeArea: {
    backgroundColor: colors.neutral.white,
    flex: 1,
  },
  section: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    elevation: 3,
    margin: spacing.md,
    padding: spacing.lg,
    shadowColor: colors.shadow.light,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionSubtitle: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  sessionCard: {
    backgroundColor: colors.neutral.gray[50],
    borderRadius: 8,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  sessionDate: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  sessionDuration: {
    color: colors.primary.main,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sessionStat: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  sessionStats: {
    marginTop: spacing.xs,
  },
  sessionType: {
    color: colors.text.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: colors.neutral.gray[50],
    borderRadius: 8,
    marginBottom: spacing.sm,
    padding: spacing.md,
    width: '48%',
  },
  statLabel: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  statNumber: {
    color: colors.primary.main,
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  titleText: {
    color: colors.text.primary,
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
