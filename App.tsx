import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { Provider } from "react-redux";
import { store } from "./src/store";
import { MainNavigator } from "./src/navigation/MainNavigator";

export default function App() {
    return (
        <Provider store={store}>
            <NavigationContainer>
                <View style={styles.container}>
                    <MainNavigator />
                    <StatusBar style="auto" />
                </View>
            </NavigationContainer>
        </Provider>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#f5f5f5",
        flex: 1,
    },
});
