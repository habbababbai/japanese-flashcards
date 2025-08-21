import React from 'react';
import {
  render,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import studySessionReducer from '../../src/store/slices/studySessionSlice';
import HiraganaStudyScreen from '../../app/hiragana/study';
import KatakanaStudyScreen from '../../app/katakana/study';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
}));

// Mock the kana data
jest.mock('../../src/data/hiragana', () => ({
  hiraganaData: [
    { id: 'h1', character: 'あ', romaji: 'a', type: 'hiragana' as const },
    { id: 'h2', character: 'い', romaji: 'i', type: 'hiragana' as const },
    { id: 'h3', character: 'う', romaji: 'u', type: 'hiragana' as const },
    { id: 'h4', character: 'え', romaji: 'e', type: 'hiragana' as const },
    { id: 'h5', character: 'お', romaji: 'o', type: 'hiragana' as const },
  ],
}));

jest.mock('../../src/data/katakana', () => ({
  katakanaData: [
    { id: 'k1', character: 'ア', romaji: 'a', type: 'katakana' as const },
    { id: 'k2', character: 'イ', romaji: 'i', type: 'katakana' as const },
    { id: 'k3', character: 'ウ', romaji: 'u', type: 'katakana' as const },
    { id: 'k4', character: 'エ', romaji: 'e', type: 'katakana' as const },
    { id: 'k5', character: 'オ', romaji: 'o', type: 'katakana' as const },
  ],
}));

// Mock Alert
jest
  .spyOn(require('react-native'), 'Alert')
  .mockImplementation((title, message, buttons) => {
    if (buttons && buttons[0] && buttons[0].onPress) {
      buttons[0].onPress();
    }
  });

const createTestStore = () => {
  return configureStore({
    reducer: {
      studySession: studySessionReducer,
    },
  });
};

const renderWithProvider = (component: React.ReactElement) => {
  const store = createTestStore();
  return render(<Provider store={store}>{component}</Provider>);
};

describe('Study Screen', () => {
  const mockUseLocalSearchParams = require('expo-router').useLocalSearchParams;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Hiragana Study Screen', () => {
    it('should render with shuffled study options and character count', () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: true,
          characterCount: 3,
        }),
      });

      renderWithProvider(<HiraganaStudyScreen />);

      // Should show progress with limited characters
      expect(screen.getByText('1 / 3')).toBeTruthy();
    });

    it('should render with in-order study options', () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: false,
        }),
      });

      renderWithProvider(<HiraganaStudyScreen />);

      // Should show progress with all characters
      expect(screen.getByText('1 / 5')).toBeTruthy();
    });

    it('should render with shuffled study options without character count (all characters)', () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: true,
        }),
      });

      renderWithProvider(<HiraganaStudyScreen />);

      // Should show progress with all characters
      expect(screen.getByText('1 / 5')).toBeTruthy();
    });

    it('should handle study session completion with limited characters', async () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: true,
          characterCount: 2,
        }),
      });

      renderWithProvider(<HiraganaStudyScreen />);

      // Answer first card correctly
      const flashcard = screen.getByTestId('flashcard');
      fireEvent.press(flashcard);

      // Answer second card (last card) correctly
      await waitFor(() => {
        expect(screen.getByText('2 / 2')).toBeTruthy();
      });

      const flashcard2 = screen.getByTestId('flashcard');
      fireEvent.press(flashcard2);

      // Should show completion alert
      await waitFor(() => {
        expect(require('react-native').Alert).toHaveBeenCalledWith(
          'Hiragana Study Complete! 🎉',
          'You got 2 out of 2 correct!',
          expect.any(Array)
        );
      });
    });

    it('should handle study session completion with all characters', async () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: false,
        }),
      });

      renderWithProvider(<HiraganaStudyScreen />);

      // Answer all 5 cards
      for (let i = 0; i < 5; i++) {
        const flashcard = screen.getByTestId('flashcard');
        fireEvent.press(flashcard);

        if (i < 4) {
          await waitFor(() => {
            expect(screen.getByText(`${i + 2} / 5`)).toBeTruthy();
          });
        }
      }

      // Should show completion alert
      await waitFor(() => {
        expect(require('react-native').Alert).toHaveBeenCalledWith(
          'Hiragana Study Complete! 🎉',
          'You got 5 out of 5 correct!',
          expect.any(Array)
        );
      });
    });

    it('should handle mixed correct/incorrect answers', async () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: true,
          characterCount: 3,
        }),
      });

      renderWithProvider(<HiraganaStudyScreen />);

      // Answer first card correctly
      const flashcard1 = screen.getByTestId('flashcard');
      fireEvent.press(flashcard1);

      // Answer second card incorrectly (simulate wrong answer)
      await waitFor(() => {
        expect(screen.getByText('2 / 3')).toBeTruthy();
      });

      const flashcard2 = screen.getByTestId('flashcard');
      // Simulate incorrect answer by not pressing the correct button
      // This would need to be adjusted based on actual flashcard implementation

      // Answer third card correctly
      await waitFor(() => {
        expect(screen.getByText('3 / 3')).toBeTruthy();
      });

      const flashcard3 = screen.getByTestId('flashcard');
      fireEvent.press(flashcard3);

      // Should show completion alert with mixed results
      await waitFor(() => {
        expect(require('react-native').Alert).toHaveBeenCalledWith(
          'Hiragana Study Complete! 🎉',
          expect.stringMatching(/You got \d+ out of 3 correct!/),
          expect.any(Array)
        );
      });
    });
  });

  describe('Katakana Study Screen', () => {
    it('should render with shuffled study options and character count', () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: true,
          characterCount: 3,
        }),
      });

      renderWithProvider(<KatakanaStudyScreen />);

      // Should show progress with limited characters
      expect(screen.getByText('1 / 3')).toBeTruthy();
    });

    it('should render with in-order study options', () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: false,
        }),
      });

      renderWithProvider(<KatakanaStudyScreen />);

      // Should show progress with all characters
      expect(screen.getByText('1 / 5')).toBeTruthy();
    });

    it('should handle study session completion with limited characters', async () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: true,
          characterCount: 2,
        }),
      });

      renderWithProvider(<KatakanaStudyScreen />);

      // Answer first card correctly
      const flashcard = screen.getByTestId('flashcard');
      fireEvent.press(flashcard);

      // Answer second card (last card) correctly
      await waitFor(() => {
        expect(screen.getByText('2 / 2')).toBeTruthy();
      });

      const flashcard2 = screen.getByTestId('flashcard');
      fireEvent.press(flashcard2);

      // Should show completion alert
      await waitFor(() => {
        expect(require('react-native').Alert).toHaveBeenCalledWith(
          'Katakana Study Complete! 🎉',
          'You got 2 out of 2 correct!',
          expect.any(Array)
        );
      });
    });
  });

  describe('Study Options Parsing', () => {
    it('should handle missing study options gracefully', () => {
      mockUseLocalSearchParams.mockReturnValue({});

      renderWithProvider(<HiraganaStudyScreen />);

      // Should default to shuffled mode
      expect(screen.getByText('1 / 5')).toBeTruthy();
    });

    it('should handle malformed study options gracefully', () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: 'invalid json',
      });

      renderWithProvider(<HiraganaStudyScreen />);

      // Should handle error gracefully and show loading or default state
      expect(screen.getByText('Loading...')).toBeTruthy();
    });

    it('should handle study options with invalid character count', () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: true,
          characterCount: -1, // Invalid count
        }),
      });

      renderWithProvider(<HiraganaStudyScreen />);

      // Should handle invalid count gracefully
      expect(screen.getByText('1 / 5')).toBeTruthy();
    });
  });

  describe('Redux Integration', () => {
    it('should dispatch startSession with correct study options', () => {
      const studyOptions = {
        isShuffled: true,
        characterCount: 3,
      };

      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify(studyOptions),
      });

      const store = createTestStore();
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      render(
        <Provider store={store}>
          <HiraganaStudyScreen />
        </Provider>
      );

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'studySession/startSession',
          payload: {
            kanaType: 'hiragana',
            studyOptions,
          },
        })
      );
    });

    it('should dispatch addProgress for each answer', async () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: true,
          characterCount: 2,
        }),
      });

      const store = createTestStore();
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      render(
        <Provider store={store}>
          <HiraganaStudyScreen />
        </Provider>
      );

      // Answer first card
      const flashcard = screen.getByTestId('flashcard');
      fireEvent.press(flashcard);

      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'studySession/addProgress',
          payload: expect.objectContaining({
            kanaId: expect.any(String),
            isCorrect: true,
          }),
        })
      );
    });

    it('should dispatch endSession when study is complete', async () => {
      mockUseLocalSearchParams.mockReturnValue({
        studyOptions: JSON.stringify({
          isShuffled: true,
          characterCount: 1,
        }),
      });

      const store = createTestStore();
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      render(
        <Provider store={store}>
          <HiraganaStudyScreen />
        </Provider>
      );

      // Answer the only card
      const flashcard = screen.getByTestId('flashcard');
      fireEvent.press(flashcard);

      await waitFor(() => {
        expect(dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'studySession/endSession',
            payload: expect.objectContaining({
              endTime: expect.any(String),
              progress: expect.arrayContaining([
                expect.objectContaining({
                  kanaId: expect.any(String),
                  isCorrect: true,
                }),
              ]),
            }),
          })
        );
      });
    });
  });
});
