import React, { useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useStorage } from "../hooks/useStorage";
import { spacing, fontSize, hp, wp } from "../utils/responsive";

export const StatsScreen: React.FC = () => {
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
                    total > 0
                        ? Math.round((progress.correctCount / total) * 100)
                        : 0;

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
                            <Text style={styles.statNumber}>
                                {totalCardsReviewed}
                            </Text>
                            <Text style={styles.statLabel}>Cards Reviewed</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>
                                {calculateAccuracy()}%
                            </Text>
                            <Text style={styles.statLabel}>Accuracy</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>
                                {formatDuration(totalStudyTime)}
                            </Text>
                            <Text style={styles.statLabel}>Total Time</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>
                                {sessions.length}
                            </Text>
                            <Text style={styles.statLabel}>Sessions</Text>
                        </View>
                    </View>
                </View>

                {/* Recent Sessions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Sessions</Text>
                    {recentSessions.length === 0 ? (
                        <Text style={styles.emptyText}>
                            No study sessions yet
                        </Text>
                    ) : (
                        <View style={styles.listContainer}>
                            <FlashList
                                data={recentSessions}
                                renderItem={({ item: session }) => (
                                    <View style={styles.sessionCard}>
                                        <View style={styles.sessionHeader}>
                                            <Text style={styles.sessionType}>
                                                {session.kanaType
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    session.kanaType.slice(1)}
                                            </Text>
                                            <Text style={styles.sessionDate}>
                                                {new Date(
                                                    session.startTime
                                                ).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <View style={styles.sessionStats}>
                                            <Text style={styles.sessionStat}>
                                                {session.cardsReviewed} cards •{" "}
                                                {session.correctAnswers} correct
                                                • {session.incorrectAnswers}{" "}
                                                incorrect
                                            </Text>
                                            {session.endTime && (
                                                <Text
                                                    style={
                                                        styles.sessionDuration
                                                    }
                                                >
                                                    Duration:{" "}
                                                    {formatDuration(
                                                        new Date(
                                                            session.endTime
                                                        ).getTime() -
                                                            new Date(
                                                                session.startTime
                                                            ).getTime()
                                                    )}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                )}
                                getItemType={(item) => "default"}
                                keyExtractor={(item) => item.id}
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
                        <Text style={styles.emptyText}>
                            No character progress yet
                        </Text>
                    ) : (
                        <View style={styles.listContainer}>
                            <FlashList
                                data={kanaProgressData}
                                renderItem={({ item }) => (
                                    <View style={styles.kanaProgressItem}>
                                        <Text style={styles.kanaId}>
                                            {item.kanaId}
                                        </Text>
                                        <View style={styles.kanaProgressStats}>
                                            <Text
                                                style={styles.kanaProgressText}
                                            >
                                                {item.progress.correctCount}✓{" "}
                                                {item.progress.incorrectCount}✗
                                            </Text>
                                            <Text style={styles.kanaAccuracy}>
                                                {item.accuracy}%
                                            </Text>
                                        </View>
                                    </View>
                                )}
                                getItemType={(item) => "default"}
                                keyExtractor={(item) => item.kanaId}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: "white",
        flex: 1,
    },
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    titleText: {
        fontSize: fontSize.xl,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
    },
    section: {
        margin: spacing.md,
        padding: spacing.lg,
        backgroundColor: "white",
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: "600",
        color: "#333",
        marginBottom: spacing.md,
    },
    sectionSubtitle: {
        fontSize: fontSize.sm,
        color: "#666",
        marginBottom: spacing.md,
    },
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    statCard: {
        width: "48%",
        backgroundColor: "#f8f9fa",
        padding: spacing.md,
        borderRadius: 8,
        marginBottom: spacing.sm,
        alignItems: "center",
    },
    statNumber: {
        fontSize: fontSize.xl,
        fontWeight: "bold",
        color: "#4A90E2",
    },
    statLabel: {
        fontSize: fontSize.sm,
        color: "#666",
        marginTop: spacing.xs,
    },
    sessionCard: {
        backgroundColor: "#f8f9fa",
        padding: spacing.md,
        borderRadius: 8,
        marginBottom: spacing.sm,
    },
    sessionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: spacing.xs,
    },
    sessionType: {
        fontSize: fontSize.md,
        fontWeight: "600",
        color: "#333",
    },
    sessionDate: {
        fontSize: fontSize.sm,
        color: "#666",
    },
    sessionStats: {
        marginTop: spacing.xs,
    },
    sessionStat: {
        fontSize: fontSize.sm,
        color: "#666",
        marginBottom: spacing.xs,
    },
    sessionDuration: {
        fontSize: fontSize.sm,
        color: "#4A90E2",
        fontWeight: "500",
    },
    kanaProgressList: {
        marginTop: spacing.sm,
    },
    kanaProgressItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    kanaId: {
        fontSize: fontSize.md,
        fontWeight: "500",
        color: "#333",
    },
    kanaProgressStats: {
        alignItems: "flex-end",
    },
    kanaProgressText: {
        fontSize: fontSize.sm,
        color: "#666",
        marginBottom: spacing.xs,
    },
    kanaAccuracy: {
        fontSize: fontSize.sm,
        fontWeight: "600",
        color: "#4A90E2",
    },
    emptyText: {
        fontSize: fontSize.md,
        color: "#999",
        textAlign: "center",
        fontStyle: "italic",
        marginTop: spacing.lg,
    },
    listContainer: {
        height: 300,
        marginTop: spacing.sm,
    },
});
