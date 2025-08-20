import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { StudyScreen } from "../screens/StudyScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { StatsScreen } from "../screens/StatsScreen";
import { hiraganaData } from "../data/hiragana";
import { katakanaData } from "../data/katakana";
import { StudyProgress } from "../types";
import { Alert } from "react-native";
import { wp, hp, fontSize } from "../utils/responsive";
import { Text } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HiraganaStack = () => {
    const [studySettings, setStudySettings] = useState<{
        isShuffled: boolean;
    } | null>(null);

    const handleStudyComplete = (progress: StudyProgress[]) => {
        const correctCount = progress.filter((p) => p.isCorrect).length;
        const totalCount = progress.length;

        Alert.alert(
            "Hiragana Study Complete! 🎉",
            `You got ${correctCount} out of ${totalCount} correct!`,
            [{ text: "OK" }]
        );
        setStudySettings(null); // Go back to settings
    };

    const handleStartStudy = (settings: { isShuffled: boolean }) => {
        setStudySettings(settings);
    };

    const handleBack = () => {
        setStudySettings(null);
    };

    if (studySettings) {
        return (
            <StudyScreen
                kanaList={hiraganaData}
                onComplete={handleStudyComplete}
                onBack={handleBack}
                title="Hiragana"
                isShuffled={studySettings.isShuffled}
            />
        );
    }

    return <SettingsScreen onStartStudy={handleStartStudy} title="Hiragana" />;
};

const KatakanaStack = () => {
    const [studySettings, setStudySettings] = useState<{
        isShuffled: boolean;
    } | null>(null);

    const handleStudyComplete = (progress: StudyProgress[]) => {
        const correctCount = progress.filter((p) => p.isCorrect).length;
        const totalCount = progress.length;

        Alert.alert(
            "Katakana Study Complete! 🎉",
            `You got ${correctCount} out of ${totalCount} correct!`,
            [{ text: "OK" }]
        );
        setStudySettings(null); // Go back to settings
    };

    const handleStartStudy = (settings: { isShuffled: boolean }) => {
        setStudySettings(settings);
    };

    const handleBack = () => {
        setStudySettings(null);
    };

    if (studySettings) {
        return (
            <StudyScreen
                kanaList={katakanaData}
                onComplete={handleStudyComplete}
                onBack={handleBack}
                title="Katakana"
                isShuffled={studySettings.isShuffled}
            />
        );
    }

    return <SettingsScreen onStartStudy={handleStartStudy} title="Katakana" />;
};

export const MainNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: "#4A90E2",
                tabBarInactiveTintColor: "#999",
                tabBarStyle: {
                    backgroundColor: "white",
                    borderTopColor: "#e0e0e0",
                    borderTopWidth: 1,
                    height: hp(10),
                    paddingBottom: hp(1),
                    paddingTop: hp(1),
                },
                tabBarLabelStyle: {
                    fontSize: fontSize.xs,
                    fontWeight: "600",
                },
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Hiragana"
                component={HiraganaStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ color, fontSize: size }}>
                            {hiraganaData[0].character}
                        </Text>
                    ),
                }}
            />
            <Tab.Screen
                name="Katakana"
                component={KatakanaStack}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ color, fontSize: size }}>
                            {katakanaData[0].character}
                        </Text>
                    ),
                }}
            />
            <Tab.Screen
                name="Stats"
                component={StatsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ color, fontSize: size }}>📊</Text>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};
