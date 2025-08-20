import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StudyScreen } from "../screens/StudyScreen";
import { hiraganaData } from "../data/hiragana";
import { katakanaData } from "../data/katakana";
import { StudyProgress } from "../types";
import { Alert } from "react-native";
import { wp, hp, fontSize } from "../utils/responsive";
import { Text } from "react-native";

const Tab = createBottomTabNavigator();

const HiraganaScreen = () => {
    const handleStudyComplete = (progress: StudyProgress[]) => {
        const correctCount = progress.filter((p) => p.isCorrect).length;
        const totalCount = progress.length;

        Alert.alert(
            "Hiragana Study Complete! 🎉",
            `You got ${correctCount} out of ${totalCount} correct!`,
            [{ text: "OK" }]
        );
    };

    return (
        <StudyScreen
            kanaList={hiraganaData}
            onComplete={handleStudyComplete}
            title="Hiragana"
        />
    );
};

const KatakanaScreen = () => {
    const handleStudyComplete = (progress: StudyProgress[]) => {
        const correctCount = progress.filter((p) => p.isCorrect).length;
        const totalCount = progress.length;

        Alert.alert(
            "Katakana Study Complete! 🎉",
            `You got ${correctCount} out of ${totalCount} correct!`,
            [{ text: "OK" }]
        );
    };

    return (
        <StudyScreen
            kanaList={katakanaData}
            onComplete={handleStudyComplete}
            title="Katakana"
        />
    );
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
                component={HiraganaScreen}
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
                component={KatakanaScreen}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <Text style={{ color, fontSize: size }}>
                            {katakanaData[0].character}
                        </Text>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};
