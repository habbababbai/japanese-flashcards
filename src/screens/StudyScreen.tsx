import React, { useState } from "react";
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

interface StudyScreenProps {
    kanaList: Kana[];
    onComplete?: (progress: StudyProgress[]) => void;
    onBack?: () => void;
}

export const StudyScreen: React.FC<StudyScreenProps> = ({
    kanaList,
    onComplete,
    onBack,
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState<StudyProgress[]>([]);
    const [showAnswer, setShowAnswer] = useState(false);

    const currentKana = kanaList[currentIndex];
    const isLastCard = currentIndex === kanaList.length - 1;

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
                `You reviewed ${kanaList.length} hiragana characters.`,
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
        if (currentIndex < kanaList.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowAnswer(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.progressText}>
                    {currentIndex + 1} / {kanaList.length}
                </Text>
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
                            currentIndex === 0 && styles.navButtonTextDisabled,
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
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "white",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    progressText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    cardContainer: {
        flex: 1,
        justifyContent: "center",
    },
    navigationContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    navButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: "#4A90E2",
        minWidth: 100,
        alignItems: "center",
    },
    navButtonDisabled: {
        backgroundColor: "#ccc",
    },
    navButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
    navButtonTextDisabled: {
        color: "#999",
    },
    skipButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: "#FF9800",
        minWidth: 80,
        alignItems: "center",
    },
    skipButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "600",
    },
});
