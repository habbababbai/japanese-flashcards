import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { MainNavigator } from "./src/navigation/MainNavigator";

export default function App() {
    return (
        <NavigationContainer>
            <View style={styles.container}>
                <MainNavigator />
                <StatusBar style="auto" />
            </View>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#f5f5f5",
        flex: 1,
    },
});
