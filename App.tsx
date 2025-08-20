import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { Flashcard } from "./src/components/Flashcard";
import { hiraganaData } from "./src/data/hiragana";

export default function App() {
    // For now, just show the first hiragana character
    const firstKana = hiraganaData[0]; // あ (a)

    return (
        <View style={styles.container}>
            <Flashcard kana={firstKana} />
            <StatusBar style="auto" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
});
