import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
} from "react-native-reanimated";
import { Kana } from "../types";

interface FlashcardProps {
    kana: Kana;
    onFlip?: () => void;
    onAnswer?: (isCorrect: boolean) => void;
}

const { width } = Dimensions.get("window");

export const Flashcard: React.FC<FlashcardProps> = ({
    kana,
    onFlip,
    onAnswer,
}) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [showAnswerButtons, setShowAnswerButtons] = useState(false);
    const flipAnimation = useSharedValue(0);

    const handleFlip = () => {
        const toValue = isFlipped ? 0 : 1;
        flipAnimation.value = withSpring(toValue, {
            damping: 15,
            stiffness: 100,
        });
        setIsFlipped(!isFlipped);

        if (!isFlipped) {
            setShowAnswerButtons(true);
        } else {
            setShowAnswerButtons(false);
        }

        onFlip?.();
    };

    const handleAnswer = (isCorrect: boolean) => {
        onAnswer?.(isCorrect);
        setShowAnswerButtons(false);
        flipAnimation.value = withSpring(0, {
            damping: 15,
            stiffness: 100,
        });
        setIsFlipped(false);
    };

    const frontAnimatedStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(flipAnimation.value, [0, 1], [0, 180]);
        return {
            transform: [{ rotateY: `${rotateY}deg` }],
        };
    });

    const backAnimatedStyle = useAnimatedStyle(() => {
        const rotateY = interpolate(flipAnimation.value, [0, 1], [180, 360]);
        return {
            transform: [{ rotateY: `${rotateY}deg` }],
        };
    });

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={handleFlip} activeOpacity={0.9}>
                <View style={styles.cardContainer}>
                    <Animated.View
                        style={[
                            styles.card,
                            styles.cardFront,
                            frontAnimatedStyle,
                        ]}
                    >
                        <Text style={styles.kanaText}>{kana.character}</Text>
                        <Text style={styles.hintText}>
                            What does this sound like?
                        </Text>
                    </Animated.View>
                    <Animated.View
                        style={[
                            styles.card,
                            styles.cardBack,
                            backAnimatedStyle,
                        ]}
                    >
                        <Text style={styles.romajiText}>{kana.romaji}</Text>
                        <Text style={styles.hintText}>Did you know it?</Text>
                    </Animated.View>
                </View>
            </TouchableOpacity>
            {showAnswerButtons && (
                <View style={styles.answerButtons}>
                    <TouchableOpacity
                        style={[styles.answerButton, styles.incorrectButton]}
                        onPress={() => handleAnswer(false)}
                    >
                        <Text style={styles.answerButtonText}>
                            ❌ I didn't know it
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.answerButton, styles.correctButton]}
                        onPress={() => handleAnswer(true)}
                    >
                        <Text style={styles.answerButtonText}>
                            ✅ I knew it!
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    cardContainer: {
        width: width - 40,
        height: 400,
        position: "relative",
    },
    card: {
        width: "100%",
        height: "100%",
        borderRadius: 20,
        padding: 30,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        backfaceVisibility: "hidden",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    cardFront: {
        backgroundColor: "#4A90E2",
    },
    cardBack: {
        backgroundColor: "#FFC107",
    },
    kanaText: {
        fontSize: 120,
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
        marginBottom: 30,
    },
    romajiText: {
        fontSize: 48,
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
        marginBottom: 30,
    },
    hintText: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.8)",
        textAlign: "center",
        fontStyle: "italic",
    },
    answerButtons: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 30,
        paddingHorizontal: 20,
        gap: 15,
    },
    answerButton: {
        flex: 1,
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: 15,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        minHeight: 60,
        justifyContent: "center",
    },
    correctButton: {
        backgroundColor: "#4CAF50",
        borderWidth: 2,
        borderColor: "#45A049",
    },
    incorrectButton: {
        backgroundColor: "#F44336",
        borderWidth: 2,
        borderColor: "#D32F2F",
    },
    answerButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "700",
        textAlign: "center",
        lineHeight: 20,
    },
});
