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
}

const { width } = Dimensions.get("window");

export const Flashcard: React.FC<FlashcardProps> = ({ kana, onFlip }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const flipAnimation = useSharedValue(0);

    const handleFlip = () => {
        const toValue = isFlipped ? 0 : 1;
        flipAnimation.value = withSpring(toValue, {
            damping: 15,
            stiffness: 100,
        });
        setIsFlipped(!isFlipped);
        onFlip?.();
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
                    {/* Front of card - shows hiragana */}
                    <Animated.View
                        style={[
                            styles.card,
                            styles.cardFront,
                            frontAnimatedStyle,
                        ]}
                    >
                        <Text style={styles.kanaText}>{kana.character}</Text>
                        <Text style={styles.hintText}>Tap to see romaji</Text>
                    </Animated.View>

                    {/* Back of card - shows romaji */}
                    <Animated.View
                        style={[
                            styles.card,
                            styles.cardBack,
                            backAnimatedStyle,
                        ]}
                    >
                        <Text style={styles.romajiText}>{kana.romaji}</Text>
                        <Text style={styles.hintText}>Tap to flip back</Text>
                    </Animated.View>
                </View>
            </TouchableOpacity>
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
        backgroundColor: "#50C878",
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
});
