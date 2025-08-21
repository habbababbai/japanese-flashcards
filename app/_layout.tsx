import React from 'react';
import { Tabs } from 'expo-router';
import { Provider } from 'react-redux';
import { store } from '../src/store';
import { Text } from 'react-native';
import { hiraganaData } from '../src/data/hiragana';
import { katakanaData } from '../src/data/katakana';
import { hp, fontSize } from '../src/utils/responsive';
import { colors } from '../src/utils/colors';
import { loadStoredData } from '../src/store/slices/studySessionSlice';
import { useSelector } from 'react-redux';
import { selectCurrentSession } from '../src/store/slices/studySessionSlice';

function TabLayout() {
  const currentSession = useSelector(selectCurrentSession);
  const isStudySessionActive = currentSession !== null;

  return (
    <Tabs
      screenOptions={() => ({
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: isStudySessionActive
            ? 'transparent'
            : colors.border.light,
          borderTopWidth: isStudySessionActive ? 0 : 1,
          height: hp(10),
          paddingBottom: hp(1),
          paddingTop: hp(1),
        },
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: '600',
        },
        tabBarButton: isStudySessionActive ? () => null : undefined,
        headerShown: false,
      })}
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
  );
}

export default function RootLayout() {
  // Load stored data when app starts
  React.useEffect(() => {
    store.dispatch(loadStoredData());
  }, []);

  return (
    <Provider store={store}>
      <TabLayout />
    </Provider>
  );
}
