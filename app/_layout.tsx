import { Tabs } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import { Text } from 'react-native';
import { hiraganaData } from '../src/data/hiragana';
import { katakanaData } from '../src/data/katakana';
import { hp, fontSize } from '../src/utils/responsive';
import { colors } from '../src/utils/colors';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary.main,
          tabBarInactiveTintColor: colors.text.tertiary,
          tabBarStyle: {
            backgroundColor: colors.background.primary,
            borderTopColor: colors.border.light,
            borderTopWidth: 1,
            height: hp(10),
            paddingBottom: hp(1),
            paddingTop: hp(1),
          },
          tabBarLabelStyle: {
            fontSize: fontSize.xs,
            fontWeight: '600',
          },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="hiragana"
          options={{
            title: 'Hiragana',
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Text style={{ color, fontSize: size }}>
                {hiraganaData[0].character}
              </Text>
            ),
          }}
        />
        <Tabs.Screen
          name="katakana"
          options={{
            title: 'Katakana',
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Text style={{ color, fontSize: size }}>
                {katakanaData[0].character}
              </Text>
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <Text style={{ color, fontSize: size }}>📊</Text>
            ),
          }}
        />
      </Tabs>
    </Provider>
  );
}
