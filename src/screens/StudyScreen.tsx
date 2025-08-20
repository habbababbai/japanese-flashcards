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
import { useStorage } from "../hooks/useStorage";

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
    title = "Study",
    isShuffled = true,
}) => {
    const { saveSession, saveProgress } = useStorage();

    const [shuffledKanaList, setShuffledKanaList] = useState<Kana[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState<StudyProgress[]>([]);
    const [showAnswer, setShowAnswer] = useState(false);

    // Initialize with shuffled or ordered list
    useEffect(() => {
        if (isShuffled) {
            shuffleKanaList();
        } else {
            setShuffledKanaList([...kanaList]);
            setCurrentIndex(0);
            setProgress([]);
            setShowAnswer(false);
        }
    }, [kanaList, isShuffled]);

    const shuffleKanaList = () => {
        const shuffled = [...kanaList].sort(() => Math.random() - 0.5);
        setShuffledKanaList(shuffled);
        setCurrentIndex(0);
        setProgress([]);
        setShowAnswer(false);
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
                kanaType: title.toLowerCase() as "hiragana" | "katakana",
                startTime: new Date(),
                endTime,
                cardsReviewed: finalProgress.length,
                correctAnswers: finalProgress.filter((p) => p.isCorrect).length,
                incorrectAnswers: finalProgress.filter((p) => !p.isCorrect)
                    .length,
            };
            saveSession(session);

            onComplete?.(finalProgress);
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
                </View>

                <View style={styles.cardContainer}>
                    <Flashcard
                        kana={currentKana}
                        onFlip={handleCardFlip}
                        onAnswer={handleAnswer}
                    />
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
