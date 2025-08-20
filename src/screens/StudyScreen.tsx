import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    Alert,
} from "react-native";
import { Flashcard } from "../components/Flashcard";
import { Kana, StudyProgress } from "../types";
import { spacing, fontSize, hp, wp } from "../utils/responsive";

interface StudyScreenProps {
    kanaList: Kana[];
    onComplete?: (progress: StudyProgress[]) => void;
    onBack?: () => void;
    title?: string;
}

export const StudyScreen: React.FC<StudyScreenProps> = ({
    kanaList,
    onComplete,
    onBack,
    title = "Study",
}) => {
    const [shuffledKanaList, setShuffledKanaList] = useState<Kana[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState<StudyProgress[]>([]);
    const [showAnswer, setShowAnswer] = useState(false);

    // Initialize with shuffled list
    useEffect(() => {
        shuffleKanaList();
    }, [kanaList]);

    const shuffleKanaList = () => {
        const shuffled = [...kanaList].sort(() => Math.random() - 0.5);
        setShuffledKanaList(shuffled);
        setCurrentIndex(0);
        setProgress([]);
        setShowAnswer(false);
    };

    const currentKana = shuffledKanaList[currentIndex];
    const isLastCard = currentIndex === shuffledKanaList.length - 1;

    const handleCardFlip = () => {
        setShowAnswer(true);
    };

    const handleAnswer = (isCorrect: boolean) => {
        const newProgress: StudyProgress = {
            kanaId: currentKana.id,
            isCorrect,
            responseTime: Date.now(),
            timestamp: new Date(),
        };

        setProgress([...progress, newProgress]);

        if (isLastCard) {
            // Study session complete
            onComplete?.(progress);
            Alert.alert(
                "Study Session Complete! 🎉",
                `You reviewed ${shuffledKanaList.length} ${title.toLowerCase()} characters.`,
                [
                    {
                        text: "OK",
                        onPress: onBack,
                    },
                ]
            );
        } else {
            setCurrentIndex(currentIndex + 1);
            setShowAnswer(false);
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setShowAnswer(false);
        }
    };

    const goToNext = () => {
        if (currentIndex < shuffledKanaList.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowAnswer(false);
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
                    <TouchableOpacity
                        style={styles.shuffleButton}
                        onPress={shuffleKanaList}
                    >
                        <Text style={styles.shuffleButtonText}>🔀 Shuffle</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.cardContainer}>
                    <Flashcard
                        kana={currentKana}
                        onFlip={handleCardFlip}
                        onAnswer={handleAnswer}
                    />
                </View>

                <View style={styles.navigationContainer}>
                    <TouchableOpacity
                        style={[
                            styles.navButton,
                            currentIndex === 0 && styles.navButtonDisabled,
                        ]}
                        onPress={goToPrevious}
                        disabled={currentIndex === 0}
                    >
                        <Text
                            style={[
                                styles.navButtonText,
                                currentIndex === 0 &&
                                    styles.navButtonTextDisabled,
                            ]}
                        >
                            ← Previous
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.navButton,
                            isLastCard && styles.navButtonDisabled,
                        ]}
                        onPress={goToNext}
                        disabled={isLastCard}
                    >
                        <Text
                            style={[
                                styles.navButtonText,
                                isLastCard && styles.navButtonTextDisabled,
                            ]}
                        >
                            Next →
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: "white",
        flex: 1,
    },
    cardContainer: {
        flex: 1,
        justifyContent: "center",
    },
    container: {
        backgroundColor: "#f5f5f5",
        flex: 1,
    },
    header: {
        alignItems: "center",
        backgroundColor: "white",
        borderBottomColor: "#e0e0e0",
        borderBottomWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        padding: spacing.md,
    },
    headerContent: {
        alignItems: "center",
        flex: 1,
    },
    navButton: {
        alignItems: "center",
        backgroundColor: "#4A90E2",
        borderRadius: hp(1),
        minWidth: wp(25),
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    navButtonDisabled: {
        backgroundColor: "#ccc",
    },
    navButtonText: {
        color: "white",
        fontSize: fontSize.xs,
        fontWeight: "600",
    },
    navButtonTextDisabled: {
        color: "#999",
    },
    navigationContainer: {
        alignItems: "center",
        backgroundColor: "white",
        borderTopColor: "#e0e0e0",
        borderTopWidth: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        padding: spacing.md,
    },
    progressText: {
        color: "#333",
        fontSize: fontSize.sm,
        fontWeight: "600",
    },
    titleText: {
        color: "#333",
        fontSize: fontSize.lg,
        fontWeight: "700",
        marginBottom: spacing.xs,
    },
    shuffleButton: {
        backgroundColor: "#4A90E2",
        borderRadius: hp(1),
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    shuffleButtonText: {
        color: "white",
        fontSize: fontSize.xs,
        fontWeight: "600",
    },
    skipButton: {
        alignItems: "center",
        backgroundColor: "#FF9800",
        borderRadius: hp(1),
        minWidth: wp(20),
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    skipButtonText: {
        color: "white",
        fontSize: fontSize.xs,
        fontWeight: "600",
    },
});
