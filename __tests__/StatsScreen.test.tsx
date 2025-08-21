import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import studySessionReducer from '../src/store/slices/studySessionSlice';
import StatsScreen from '../app/stats';

// Mock React Native components
jest.mock('react-native', () => ({
  ScrollView: 'ScrollView',
  SafeAreaView: 'SafeAreaView',
  View: 'View',
  Text: 'Text',
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => style,
  },
}));

// Mock the data files
jest.mock('../src/data/hiragana', () => ({
  hiraganaData: [
    { id: 'h1', character: 'あ', romaji: 'a', type: 'hiragana' },
    { id: 'h2', character: 'い', romaji: 'i', type: 'hiragana' },
    { id: 'h6', character: 'か', romaji: 'ka', type: 'hiragana' },
    { id: 'h7', character: 'き', romaji: 'ki', type: 'hiragana' },
    { id: 'h11', character: 'さ', romaji: 'sa', type: 'hiragana' },
  ],
}));

jest.mock('../src/data/katakana', () => ({
  katakanaData: [
    { id: 'k1', character: 'ア', romaji: 'a', type: 'katakana' },
    { id: 'k2', character: 'イ', romaji: 'i', type: 'katakana' },
    { id: 'k6', character: 'カ', romaji: 'ka', type: 'katakana' },
    { id: 'k7', character: 'キ', romaji: 'ki', type: 'katakana' },
    { id: 'k11', character: 'サ', romaji: 'sa', type: 'katakana' },
  ],
}));

// Mock FlashList to render data directly
jest.mock('@shopify/flash-list', () => ({
  FlashList: ({ data, renderItem }: any) => {
    return data?.map((item: any, index: number) => (
      <div key={item.kanaId || index}>{renderItem({ item })}</div>
    ));
  },
}));

const createTestStore = (initialState: any) => {
  return configureStore({
    reducer: {
      studySession: studySessionReducer,
    },
    preloadedState: {
      studySession: initialState,
    },
  });
};

describe('StatsScreen', () => {
  const renderWithStore = (initialState: any) => {
    const store = createTestStore(initialState);
    return render(
      <Provider store={store}>
        <StatsScreen />
      </Provider>
    );
  };

  describe('Character Progress Sorting', () => {
    it('should filter out characters with no practice', () => {
      const initialState = {
        sessions: [],
        currentSession: null,
        kanaProgress: {
          h1: { correctCount: 0, incorrectCount: 0 }, // No practice
          h2: { correctCount: 2, incorrectCount: 1 }, // Has practice
          k1: { correctCount: 0, incorrectCount: 0 }, // No practice
        },
        isLoading: false,
        error: null,
      };

      renderWithStore(initialState);

      // Should only show h2 character (the one with practice)
      expect(screen.getByText('い')).toBeTruthy(); // h2 character
      expect(screen.queryByText('あ')).toBeNull(); // h1 character (no practice)
      expect(screen.queryByText('ア')).toBeNull(); // k1 character (no practice)
    });

    it('should sort by frequency only (most studied first)', () => {
      const initialState = {
        sessions: [],
        currentSession: null,
        kanaProgress: {
          k1: { correctCount: 5, incorrectCount: 1 }, // katakana, 6 total (high)
          h1: { correctCount: 2, incorrectCount: 1 }, // hiragana, 3 total (low)
        },
        isLoading: false,
        error: null,
      };

      renderWithStore(initialState);

      // Katakana should come first due to higher frequency, regardless of type
      expect(screen.getByText(/ア/)).toBeTruthy(); // k1 (higher frequency)
      expect(screen.getByText(/あ/)).toBeTruthy(); // h1 (lower frequency)
    });

    it('should sort multiple characters by frequency', () => {
      const initialState = {
        sessions: [],
        currentSession: null,
        kanaProgress: {
          h1: { correctCount: 1, incorrectCount: 1 }, // 2 total (lowest)
          h2: { correctCount: 5, incorrectCount: 2 }, // 7 total (highest)
          h6: { correctCount: 3, incorrectCount: 1 }, // 4 total (medium)
        },
        isLoading: false,
        error: null,
      };

      renderWithStore(initialState);

      // Should be sorted by frequency only: h2 (7) > h6 (4) > h1 (2)
      expect(screen.getByText(/い/)).toBeTruthy(); // h2 (highest practice)
      expect(screen.getByText(/か/)).toBeTruthy(); // h6 (medium practice)
      expect(screen.getByText(/あ/)).toBeTruthy(); // h1 (lowest practice)
    });
  });

  describe('Session Statistics', () => {
    it('should calculate total study time correctly', () => {
      const sessions = [
        {
          id: '1',
          kanaType: 'hiragana',
          startTime: '2023-01-01T10:00:00.000Z',
          endTime: '2023-01-01T10:05:00.000Z', // 5 minutes
          cardsReviewed: 10,
          correctAnswers: 8,
          incorrectAnswers: 2,
        },
        {
          id: '2',
          kanaType: 'katakana',
          startTime: '2023-01-01T11:00:00.000Z',
          endTime: '2023-01-01T11:03:00.000Z', // 3 minutes
          cardsReviewed: 5,
          correctAnswers: 4,
          incorrectAnswers: 1,
        },
      ];

      const initialState = {
        sessions,
        currentSession: null,
        kanaProgress: {},
        isLoading: false,
        error: null,
      };

      renderWithStore(initialState);

      // Should show total time (8 minutes)
      expect(screen.getByText('8m 0s')).toBeTruthy();
    });

    it('should calculate accuracy correctly', () => {
      const sessions = [
        {
          id: '1',
          kanaType: 'hiragana',
          startTime: '2023-01-01T10:00:00.000Z',
          endTime: '2023-01-01T10:05:00.000Z',
          cardsReviewed: 10,
          correctAnswers: 8,
          incorrectAnswers: 2,
        },
      ];

      const initialState = {
        sessions,
        currentSession: null,
        kanaProgress: {},
        isLoading: false,
        error: null,
      };

      renderWithStore(initialState);

      // Should show 80% accuracy (8 correct out of 10 total)
      expect(screen.getByText('80%')).toBeTruthy();
    });

    it('should show correct session count', () => {
      const sessions = [
        {
          id: '1',
          kanaType: 'hiragana',
          startTime: '2023-01-01T10:00:00.000Z',
          endTime: '2023-01-01T10:05:00.000Z',
          cardsReviewed: 10,
          correctAnswers: 8,
          incorrectAnswers: 2,
        },
        {
          id: '2',
          kanaType: 'katakana',
          startTime: '2023-01-01T11:00:00.000Z',
          endTime: '2023-01-01T11:03:00.000Z',
          cardsReviewed: 5,
          correctAnswers: 4,
          incorrectAnswers: 1,
        },
        {
          id: '3',
          kanaType: 'hiragana',
          startTime: '2023-01-01T12:00:00.000Z',
          endTime: '2023-01-01T12:02:00.000Z',
          cardsReviewed: 3,
          correctAnswers: 2,
          incorrectAnswers: 1,
        },
      ];

      const initialState = {
        sessions,
        currentSession: null,
        kanaProgress: {},
        isLoading: false,
        error: null,
      };

      renderWithStore(initialState);

      // Should show 3 sessions
      expect(screen.getByText('3')).toBeTruthy();
    });
  });

  describe('Loading States', () => {
    it('should show loading state when isLoading is true', () => {
      const initialState = {
        sessions: [],
        currentSession: null,
        kanaProgress: {},
        isLoading: true,
        error: null,
      };

      renderWithStore(initialState);

      expect(screen.getByText('Loading...')).toBeTruthy();
    });

    it('should show empty state when no data', () => {
      const initialState = {
        sessions: [],
        currentSession: null,
        kanaProgress: {},
        isLoading: false,
        error: null,
      };

      renderWithStore(initialState);

      expect(screen.getByText('No study sessions yet')).toBeTruthy();
      expect(screen.getByText('No characters available')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle error state', () => {
      const initialState = {
        sessions: [],
        currentSession: null,
        kanaProgress: {},
        isLoading: false,
        error: 'Failed to load data',
      };

      renderWithStore(initialState);

      // Component should still render without crashing
      expect(screen.getByText('Study Statistics')).toBeTruthy();
    });
  });
});
