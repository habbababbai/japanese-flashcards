import { Stack } from 'expo-router';

export default function KatakanaLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="study" />
    </Stack>
  );
}
