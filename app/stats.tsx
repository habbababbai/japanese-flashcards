import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useStorage } from '../src/hooks/useStorage';
import { spacing, fontSize } from '../src/utils/responsive';

export default function StatsScreen() {
  const { sessions, kanaProgress, isLoading } = useStorage();

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
    return Object.entries(kanaProgress)
      .sort(
        ([, a], [, b]) =>
          b.correctCount +
          b.incorrectCount -
          (a.correctCount + a.incorrectCount)
      )
      .slice(0, 10)
      .map(([kanaId, progress]) => {
        const total = progress.correctCount + progress.incorrectCount;
        const accuracy =
          total > 0 ? Math.round((progress.correctCount / total) * 100) : 0;

        return {
          kanaId,
          progress,
          total,
          accuracy,
        };
      });
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
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.titleText}>Study Statistics</Text>
        </View>

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
            Showing characters with study history
          </Text>
          {Object.keys(kanaProgress).length === 0 ? (
            <Text style={styles.emptyText}>No character progress yet</Text>
          ) : (
            <View style={styles.listContainer}>
              <FlashList
                estimatedItemSize={86}
                data={kanaProgressData}
                renderItem={({ item }) => (
                  <View style={styles.kanaProgressItem}>
                    <Text style={styles.kanaId}>{item.kanaId}</Text>
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
                keyExtractor={item => item.kanaId}
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
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  emptyText: {
    color: '#999',
    fontSize: fontSize.md,
    fontStyle: 'italic',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  header: {
    backgroundColor: 'white',
    borderBottomColor: '#e0e0e0',
    borderBottomWidth: 1,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  kanaAccuracy: {
    color: '#4A90E2',
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  kanaId: {
    color: '#333',
    fontSize: fontSize.md,
    fontWeight: '500',
  },
  kanaProgressItem: {
    alignItems: 'center',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  kanaProgressStats: {
    alignItems: 'flex-end',
  },
  kanaProgressText: {
    color: '#666',
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  listContainer: {
    height: 300,
    marginTop: spacing.sm,
  },
  safeArea: {
    backgroundColor: 'white',
    flex: 1,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 3,
    margin: spacing.md,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionSubtitle: {
    color: '#666',
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: '#333',
    fontSize: fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  sessionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  sessionDate: {
    color: '#666',
    fontSize: fontSize.sm,
  },
  sessionDuration: {
    color: '#4A90E2',
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sessionStat: {
    color: '#666',
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  sessionStats: {
    marginTop: spacing.xs,
  },
  sessionType: {
    color: '#333',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: spacing.sm,
    padding: spacing.md,
    width: '48%',
  },
  statLabel: {
    color: '#666',
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  statNumber: {
    color: '#4A90E2',
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  titleText: {
    color: '#333',
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
