import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { Slot } from 'expo-router';

export default function App() {
  return (
    <View style={styles.container}>
      <Slot />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
});
