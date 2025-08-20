import React, { useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    runOnJS,
} from "react-native-reanimated";
import { spacing, fontSize, hp, wp } from "../utils/responsive";

interface ToastProps {
    isVisible: boolean;
    isCorrect: boolean;
    onHide: () => void;
}

export const Toast: React.FC<ToastProps> = ({
    isVisible,
    isCorrect,
    onHide,
}) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(-50);

    useEffect(() => {
        if (isVisible) {
            opacity.value = withTiming(1, { duration: 200 });
            translateY.value = withTiming(0, { duration: 200 });

            const timer = setTimeout(() => {
                opacity.value = withTiming(0, { duration: 200 });
                translateY.value = withTiming(-50, { duration: 200 }, () => {
                    runOnJS(onHide)();
                });
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [isVisible, opacity, translateY, onHide]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ translateY: translateY.value }],
        };
    });

    if (!isVisible) return null;

    return (
        <Animated.View
            style={[
                styles.toast,
                {
                    backgroundColor: isCorrect ? "#4CAF50" : "#F44336",
                },
                animatedStyle,
            ]}
        >
            <Text style={styles.emoji}>{isCorrect ? "✅" : "❌"}</Text>
            <Text style={styles.text}>
                {isCorrect ? "I knew it!" : "I didn't know it"}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    toast: {
        position: "absolute",
        top: hp(1.5),
        left: wp(5),
        right: wp(5),
        height: hp(5),
        borderRadius: hp(2.5),
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        flexDirection: "row",
        gap: spacing.sm,
    },
    emoji: {
        fontSize: fontSize.lg,
    },
    text: {
        color: "white",
        fontSize: fontSize.sm,
        fontWeight: "600",
    },
});
