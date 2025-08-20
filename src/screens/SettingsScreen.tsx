import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from "react-native";
import { wp, hp, fontSize, spacing } from "../utils/responsive";

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
                        <Text style={styles.startButtonText}>
                            Start Studying
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
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    titleText: {
        fontSize: fontSize.xl,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
    },
    content: {
        flex: 1,
        padding: spacing.lg,
        justifyContent: "center",
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: "600",
        color: "#333",
        marginBottom: spacing.lg,
        textAlign: "center",
    },
    optionsContainer: {
        marginBottom: spacing.xl,
    },
    optionButton: {
        backgroundColor: "#f8f9fa",
        borderWidth: 2,
        borderColor: "#e0e0e0",
        borderRadius: 12,
        padding: spacing.lg,
        marginBottom: spacing.md,
        alignItems: "center",
    },
    optionButtonActive: {
        borderColor: "#4A90E2",
        backgroundColor: "#e3f2fd",
    },
    optionText: {
        fontSize: fontSize.md,
        fontWeight: "600",
        color: "#666",
        marginBottom: spacing.xs,
    },
    optionTextActive: {
        color: "#4A90E2",
    },
    optionDescription: {
        fontSize: fontSize.sm,
        color: "#999",
        textAlign: "center",
    },
    startButton: {
        backgroundColor: "#4A90E2",
        borderRadius: 12,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        alignItems: "center",
        marginTop: spacing.lg,
    },
    startButtonText: {
        color: "white",
        fontSize: fontSize.md,
        fontWeight: "600",
    },
});
