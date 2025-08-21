import { configureStore } from '@reduxjs/toolkit';
import studySessionReducer, {
  startSession,
  endSession,
  addProgress,
  clearSessions,
  loadStoredData,
  saveSessions,
  saveKanaProgress,
} from '../src/store/slices/studySessionSlice';
import { storageUtils } from '../src/store/storage';

// Mock storage utilities
jest.mock('../src/store/storage', () => ({
  storageUtils: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
  },
}));

const createTestStore = () => {
  return configureStore({
    reducer: {
      studySession: studySessionReducer,
    },
  });
};

describe('studySessionSlice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    jest.clearAllMocks();
  });

  describe('startSession', () => {
    it('should create a new session', () => {
      const action = startSession({
        kanaType: 'hiragana',
        studyOptions: { isShuffled: true },
      });

      store.dispatch(action);

      const state = store.getState().studySession;
      expect(state.currentSession).toBeTruthy();
      expect(state.currentSession?.kanaType).toBe('hiragana');
      expect(state.currentSession?.cardsReviewed).toBe(0);
      expect(state.currentSession?.correctAnswers).toBe(0);
      expect(state.currentSession?.incorrectAnswers).toBe(0);
      expect(state.currentSession?.studyOptions).toEqual({ isShuffled: true });
    });

    it('should create a session with in-order study options', () => {
      const action = startSession({
        kanaType: 'katakana',
        studyOptions: { isShuffled: false },
      });

      store.dispatch(action);

      const state = store.getState().studySession;
      expect(state.currentSession?.kanaType).toBe('katakana');
      expect(state.currentSession?.studyOptions).toEqual({ isShuffled: false });
    });

    it('should create a session with shuffled study options and character count', () => {
      const action = startSession({
        kanaType: 'hiragana',
        studyOptions: { isShuffled: true, characterCount: 20 },
      });

      store.dispatch(action);

      const state = store.getState().studySession;
      expect(state.currentSession?.studyOptions).toEqual({
        isShuffled: true,
        characterCount: 20,
      });
    });

    it('should create a session with shuffled study options without character count (all characters)', () => {
      const action = startSession({
        kanaType: 'katakana',
        studyOptions: { isShuffled: true },
      });

      store.dispatch(action);

      const state = store.getState().studySession;
      expect(state.currentSession?.studyOptions).toEqual({
        isShuffled: true,
      });
      expect(state.currentSession?.studyOptions.characterCount).toBeUndefined();
    });
  });

  describe('addProgress', () => {
    it('should update current session and kana progress', () => {
      // Start a session first
      store.dispatch(
        startSession({
          kanaType: 'hiragana',
          studyOptions: { isShuffled: true },
        })
      );

      const progress = {
        kanaId: 'h1',
        isCorrect: true,
        responseTime: Date.now(),
        timestamp: new Date().toISOString(),
      };

      store.dispatch(addProgress(progress));

      const state = store.getState().studySession;

      // Check current session was updated
      expect(state.currentSession?.cardsReviewed).toBe(1);
      expect(state.currentSession?.correctAnswers).toBe(1);
      expect(state.currentSession?.incorrectAnswers).toBe(0);

      // Check kana progress was updated
      expect(state.kanaProgress['h1']).toBeTruthy();
      expect(state.kanaProgress['h1'].correctCount).toBe(1);
      expect(state.kanaProgress['h1'].incorrectCount).toBe(0);
    });

    it('should handle incorrect answers', () => {
      store.dispatch(
        startSession({
          kanaType: 'hiragana',
          studyOptions: { isShuffled: true },
        })
      );

      const progress = {
        kanaId: 'h1',
        isCorrect: false,
        responseTime: Date.now(),
        timestamp: new Date().toISOString(),
      };

      store.dispatch(addProgress(progress));

      const state = store.getState().studySession;

      expect(state.currentSession?.correctAnswers).toBe(0);
      expect(state.currentSession?.incorrectAnswers).toBe(1);
      expect(state.kanaProgress['h1'].correctCount).toBe(0);
      expect(state.kanaProgress['h1'].incorrectCount).toBe(1);
    });

    it('should accumulate progress for the same kana', () => {
      store.dispatch(
        startSession({
          kanaType: 'hiragana',
          studyOptions: { isShuffled: true },
        })
      );

      // Add multiple progress entries for the same kana
      store.dispatch(
        addProgress({
          kanaId: 'h1',
          isCorrect: true,
          responseTime: Date.now(),
          timestamp: new Date().toISOString(),
        })
      );

      store.dispatch(
        addProgress({
          kanaId: 'h1',
          isCorrect: false,
          responseTime: Date.now(),
          timestamp: new Date().toISOString(),
        })
      );

      store.dispatch(
        addProgress({
          kanaId: 'h1',
          isCorrect: true,
          responseTime: Date.now(),
          timestamp: new Date().toISOString(),
        })
      );

      const state = store.getState().studySession;

      expect(state.kanaProgress['h1'].correctCount).toBe(2);
      expect(state.kanaProgress['h1'].incorrectCount).toBe(1);
    });
  });

  describe('endSession', () => {
    it('should complete the current session and add it to sessions list', () => {
      // Start and add some progress
      store.dispatch(
        startSession({
          kanaType: 'hiragana',
          studyOptions: { isShuffled: true },
        })
      );
      store.dispatch(
        addProgress({
          kanaId: 'h1',
          isCorrect: true,
          responseTime: Date.now(),
          timestamp: new Date().toISOString(),
        })
      );
      store.dispatch(
        addProgress({
          kanaId: 'h2',
          isCorrect: false,
          responseTime: Date.now(),
          timestamp: new Date().toISOString(),
        })
      );

      const endTime = new Date();
      const progress = [
        {
          kanaId: 'h1',
          isCorrect: true,
          responseTime: Date.now(),
          timestamp: new Date().toISOString(),
        },
        {
          kanaId: 'h2',
          isCorrect: false,
          responseTime: Date.now(),
          timestamp: new Date().toISOString(),
        },
      ];

      store.dispatch(endSession({ endTime: endTime.toISOString(), progress }));

      const state = store.getState().studySession;

      // Current session should be null
      expect(state.currentSession).toBeNull();

      // Sessions list should have one completed session
      expect(state.sessions).toHaveLength(1);
      expect(state.sessions[0].cardsReviewed).toBe(2);
      expect(state.sessions[0].correctAnswers).toBe(1);
      expect(state.sessions[0].incorrectAnswers).toBe(1);
      expect(state.sessions[0].endTime).toBe(endTime.toISOString());
      expect(state.sessions[0].studyOptions).toEqual({ isShuffled: true });
    });

    it('should preserve study options in completed session', () => {
      store.dispatch(
        startSession({
          kanaType: 'katakana',
          studyOptions: { isShuffled: true, characterCount: 15 },
        })
      );

      const endTime = new Date();
      const progress = [
        {
          kanaId: 'k1',
          isCorrect: true,
          responseTime: Date.now(),
          timestamp: new Date().toISOString(),
        },
      ];

      store.dispatch(endSession({ endTime: endTime.toISOString(), progress }));

      const state = store.getState().studySession;
      expect(state.sessions[0].studyOptions).toEqual({
        isShuffled: true,
        characterCount: 15,
      });
    });
  });

  describe('clearSessions', () => {
    it('should clear all sessions and progress', () => {
      // Add some data first
      store.dispatch(
        startSession({
          kanaType: 'hiragana',
          studyOptions: { isShuffled: true },
        })
      );
      store.dispatch(
        addProgress({
          kanaId: 'h1',
          isCorrect: true,
          responseTime: Date.now(),
          timestamp: new Date().toISOString(),
        })
      );

      store.dispatch(clearSessions());

      const state = store.getState().studySession;

      expect(state.sessions).toHaveLength(0);
      expect(state.kanaProgress).toEqual({});
      // Note: clearSessions doesn't clear currentSession, only completed sessions
    });
  });

  describe('loadStoredData', () => {
    it('should load stored sessions and progress', async () => {
      const mockSessions = [
        {
          id: '1',
          kanaType: 'hiragana',
          startTime: '2023-01-01T10:00:00.000Z',
          endTime: '2023-01-01T10:05:00.000Z',
          cardsReviewed: 10,
          correctAnswers: 8,
          incorrectAnswers: 2,
          studyOptions: { isShuffled: true },
        },
      ];

      const mockKanaProgress = {
        h1: { correctCount: 5, incorrectCount: 2 },
        h2: { correctCount: 3, incorrectCount: 1 },
      };

      (storageUtils.get as jest.Mock)
        .mockResolvedValueOnce(mockSessions)
        .mockResolvedValueOnce(mockKanaProgress);

      await store.dispatch(loadStoredData());

      const state = store.getState().studySession;

      expect(state.sessions).toEqual(mockSessions);
      expect(state.kanaProgress).toEqual(mockKanaProgress);
      expect(state.isLoading).toBe(false);
    });

    it('should handle loading errors', async () => {
      (storageUtils.get as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      await store.dispatch(loadStoredData());

      const state = store.getState().studySession;

      expect(state.error).toBeTruthy();
      expect(state.isLoading).toBe(false);
    });

    it('should load sessions with different study options', async () => {
      const mockSessions = [
        {
          id: '1',
          kanaType: 'hiragana',
          startTime: '2023-01-01T10:00:00.000Z',
          endTime: '2023-01-01T10:05:00.000Z',
          cardsReviewed: 20,
          correctAnswers: 18,
          incorrectAnswers: 2,
          studyOptions: { isShuffled: true, characterCount: 20 },
        },
        {
          id: '2',
          kanaType: 'katakana',
          startTime: '2023-01-01T11:00:00.000Z',
          endTime: '2023-01-01T11:10:00.000Z',
          cardsReviewed: 46,
          correctAnswers: 40,
          incorrectAnswers: 6,
          studyOptions: { isShuffled: false },
        },
      ];

      (storageUtils.get as jest.Mock)
        .mockResolvedValueOnce(mockSessions)
        .mockResolvedValueOnce({});

      await store.dispatch(loadStoredData());

      const state = store.getState().studySession;
      expect(state.sessions).toHaveLength(2);
      expect(state.sessions[0].studyOptions).toEqual({
        isShuffled: true,
        characterCount: 20,
      });
      expect(state.sessions[1].studyOptions).toEqual({ isShuffled: false });
    });
  });

  describe('saveSessions', () => {
    it('should save sessions to storage', async () => {
      const sessions = [
        {
          id: '1',
          kanaType: 'hiragana',
          startTime: '2023-01-01T10:00:00.000Z',
          endTime: '2023-01-01T10:05:00.000Z',
          cardsReviewed: 10,
          correctAnswers: 8,
          incorrectAnswers: 2,
          studyOptions: { isShuffled: true },
        },
      ];

      await store.dispatch(saveSessions(sessions));

      expect(storageUtils.set).toHaveBeenCalledWith('studySessions', sessions);
    });

    it('should save sessions with character count options', async () => {
      const sessions = [
        {
          id: '1',
          kanaType: 'hiragana',
          startTime: '2023-01-01T10:00:00.000Z',
          endTime: '2023-01-01T10:05:00.000Z',
          cardsReviewed: 30,
          correctAnswers: 25,
          incorrectAnswers: 5,
          studyOptions: { isShuffled: true, characterCount: 30 },
        },
      ];

      await store.dispatch(saveSessions(sessions));

      expect(storageUtils.set).toHaveBeenCalledWith('studySessions', sessions);
    });
  });

  describe('saveKanaProgress', () => {
    it('should save kana progress to storage', async () => {
      const kanaProgress = {
        h1: { correctCount: 5, incorrectCount: 2 },
        h2: { correctCount: 3, incorrectCount: 1 },
      };

      await store.dispatch(saveKanaProgress(kanaProgress));

      expect(storageUtils.set).toHaveBeenCalledWith(
        'kanaProgress',
        kanaProgress
      );
    });
  });

  describe('Study Options Integration', () => {
    it('should handle multiple sessions with different study options', () => {
      // Start first session with shuffled and character count
      store.dispatch(
        startSession({
          kanaType: 'hiragana',
          studyOptions: { isShuffled: true, characterCount: 10 },
        })
      );

      let state = store.getState().studySession;
      expect(state.currentSession?.studyOptions).toEqual({
        isShuffled: true,
        characterCount: 10,
      });

      // End first session
      store.dispatch(
        endSession({
          endTime: new Date().toISOString(),
          progress: [],
        })
      );

      // Start second session with in-order
      store.dispatch(
        startSession({
          kanaType: 'katakana',
          studyOptions: { isShuffled: false },
        })
      );

      state = store.getState().studySession;
      expect(state.currentSession?.studyOptions).toEqual({
        isShuffled: false,
      });
      expect(state.sessions).toHaveLength(1);
      expect(state.sessions[0].studyOptions).toEqual({
        isShuffled: true,
        characterCount: 10,
      });
    });

    it('should handle character count validation', () => {
      // Test with valid character counts
      const validCounts = [10, 20, 30];

      validCounts.forEach(count => {
        store.dispatch(
          startSession({
            kanaType: 'hiragana',
            studyOptions: { isShuffled: true, characterCount: count },
          })
        );

        const state = store.getState().studySession;
        expect(state.currentSession?.studyOptions.characterCount).toBe(count);
      });
    });

    it('should handle undefined character count for "all" option', () => {
      store.dispatch(
        startSession({
          kanaType: 'hiragana',
          studyOptions: { isShuffled: true },
        })
      );

      const state = store.getState().studySession;
      expect(state.currentSession?.studyOptions.characterCount).toBeUndefined();
    });
  });

  describe('Session Limit', () => {
    it('should limit sessions to 10 and remove oldest when exceeded', () => {
      // Create 12 sessions to test the limit
      for (let i = 0; i < 12; i++) {
        store.dispatch(
          startSession({
            kanaType: 'hiragana',
            studyOptions: { isShuffled: true },
          })
        );

        store.dispatch(
          endSession({
            endTime: new Date().toISOString(),
            progress: [
              {
                kanaId: `h${i}`,
                isCorrect: true,
                responseTime: 1000,
                timestamp: new Date().toISOString(),
              },
            ],
          })
        );
      }

      const state = store.getState().studySession;

      // Should only have 10 sessions (not 12)
      expect(state.sessions).toHaveLength(10);

      // Should have the last 10 sessions (sessions 2-11, since 0-1 were removed)
      expect(state.sessions[0].id).toBeDefined();
      expect(state.sessions[9].id).toBeDefined();
    });

    it('should handle loading sessions with more than 10 sessions from storage', () => {
      // Create mock data with 15 sessions
      const mockSessions = Array.from({ length: 15 }, (_, i) => ({
        id: `session-${i}`,
        kanaType: 'hiragana' as const,
        startTime: `2023-01-01T${i.toString().padStart(2, '0')}:00:00.000Z`,
        endTime: `2023-01-01T${i.toString().padStart(2, '0')}:05:00.000Z`,
        cardsReviewed: 5,
        correctAnswers: 4,
        incorrectAnswers: 1,
        studyOptions: { isShuffled: true },
      }));

      const mockKanaProgress = {};

      (storageUtils.get as jest.Mock)
        .mockResolvedValueOnce(mockSessions)
        .mockResolvedValueOnce(mockKanaProgress);

      return store.dispatch(loadStoredData()).then(() => {
        const state = store.getState().studySession;

        // Should only have 10 sessions (last 10 from the 15)
        expect(state.sessions).toHaveLength(10);

        // Should have sessions 5-14 (the last 10)
        expect(state.sessions[0].id).toBe('session-5');
        expect(state.sessions[9].id).toBe('session-14');
      });
    });
  });

  describe('Character Progress Tracking', () => {
    it('should track character progress correctly during normal session completion', () => {
      // Start a session
      store.dispatch(
        startSession({
          kanaType: 'hiragana',
          studyOptions: { isShuffled: true },
        })
      );

      // Add progress for some characters
      store.dispatch(
        addProgress({
          kanaId: 'h1',
          isCorrect: true,
          responseTime: 1000,
          timestamp: new Date().toISOString(),
        })
      );

      store.dispatch(
        addProgress({
          kanaId: 'h2',
          isCorrect: false,
          responseTime: 2000,
          timestamp: new Date().toISOString(),
        })
      );

      // End session
      store.dispatch(
        endSession({
          endTime: new Date().toISOString(),
          progress: [
            {
              kanaId: 'h1',
              isCorrect: true,
              responseTime: 1000,
              timestamp: new Date().toISOString(),
            },
            {
              kanaId: 'h2',
              isCorrect: false,
              responseTime: 2000,
              timestamp: new Date().toISOString(),
            },
          ],
        })
      );

      const state = store.getState().studySession;

      // Check kana progress
      expect(state.kanaProgress.h1).toEqual({
        correctCount: 1,
        incorrectCount: 0,
        lastReviewed: expect.any(String),
      });

      expect(state.kanaProgress.h2).toEqual({
        correctCount: 0,
        incorrectCount: 1,
        lastReviewed: expect.any(String),
      });

      // Check session data
      expect(state.sessions).toHaveLength(1);
      expect(state.sessions[0].cardsReviewed).toBe(2);
      expect(state.sessions[0].correctAnswers).toBe(1);
      expect(state.sessions[0].incorrectAnswers).toBe(1);
    });

    it('should not double-count character progress when endSession is called', () => {
      // Start a session
      store.dispatch(
        startSession({
          kanaType: 'hiragana',
          studyOptions: { isShuffled: true },
        })
      );

      // Add progress for a character
      store.dispatch(
        addProgress({
          kanaId: 'h1',
          isCorrect: true,
          responseTime: 1000,
          timestamp: new Date().toISOString(),
        })
      );

      // End session with the same progress data
      store.dispatch(
        endSession({
          endTime: new Date().toISOString(),
          progress: [
            {
              kanaId: 'h1',
              isCorrect: true,
              responseTime: 1000,
              timestamp: new Date().toISOString(),
            },
          ],
        })
      );

      const state = store.getState().studySession;

      // Should only count once (not doubled)
      expect(state.kanaProgress.h1).toEqual({
        correctCount: 1, // Should be 1, not 2
        incorrectCount: 0,
        lastReviewed: expect.any(String),
      });
    });

    it('should handle multiple sessions with same characters correctly', () => {
      // First session
      store.dispatch(
        startSession({
          kanaType: 'hiragana',
          studyOptions: { isShuffled: true },
        })
      );

      store.dispatch(
        addProgress({
          kanaId: 'h1',
          isCorrect: true,
          responseTime: 1000,
          timestamp: new Date().toISOString(),
        })
      );

      store.dispatch(
        endSession({
          endTime: new Date().toISOString(),
          progress: [
            {
              kanaId: 'h1',
              isCorrect: true,
              responseTime: 1000,
              timestamp: new Date().toISOString(),
            },
          ],
        })
      );

      // Second session with same character
      store.dispatch(
        startSession({
          kanaType: 'hiragana',
          studyOptions: { isShuffled: true },
        })
      );

      store.dispatch(
        addProgress({
          kanaId: 'h1',
          isCorrect: false,
          responseTime: 1500,
          timestamp: new Date().toISOString(),
        })
      );

      store.dispatch(
        endSession({
          endTime: new Date().toISOString(),
          progress: [
            {
              kanaId: 'h1',
              isCorrect: false,
              responseTime: 1500,
              timestamp: new Date().toISOString(),
            },
          ],
        })
      );

      const state = store.getState().studySession;

      // Should accumulate correctly
      expect(state.kanaProgress.h1).toEqual({
        correctCount: 1,
        incorrectCount: 1,
        lastReviewed: expect.any(String),
      });

      // Should have 2 sessions
      expect(state.sessions).toHaveLength(2);
    });

    it('should handle mixed kana types correctly', () => {
      // Hiragana session
      store.dispatch(
        startSession({
          kanaType: 'hiragana',
          studyOptions: { isShuffled: true },
        })
      );

      store.dispatch(
        addProgress({
          kanaId: 'h1',
          isCorrect: true,
          responseTime: 1000,
          timestamp: new Date().toISOString(),
        })
      );

      store.dispatch(
        endSession({
          endTime: new Date().toISOString(),
          progress: [
            {
              kanaId: 'h1',
              isCorrect: true,
              responseTime: 1000,
              timestamp: new Date().toISOString(),
            },
          ],
        })
      );

      // Katakana session
      store.dispatch(
        startSession({
          kanaType: 'katakana',
          studyOptions: { isShuffled: true },
        })
      );

      store.dispatch(
        addProgress({
          kanaId: 'k1',
          isCorrect: false,
          responseTime: 2000,
          timestamp: new Date().toISOString(),
        })
      );

      store.dispatch(
        endSession({
          endTime: new Date().toISOString(),
          progress: [
            {
              kanaId: 'k1',
              isCorrect: false,
              responseTime: 2000,
              timestamp: new Date().toISOString(),
            },
          ],
        })
      );

      const state = store.getState().studySession;

      // Should track both hiragana and katakana separately
      expect(state.kanaProgress.h1).toEqual({
        correctCount: 1,
        incorrectCount: 0,
        lastReviewed: expect.any(String),
      });

      expect(state.kanaProgress.k1).toEqual({
        correctCount: 0,
        incorrectCount: 1,
        lastReviewed: expect.any(String),
      });

      // Should have 2 sessions
      expect(state.sessions).toHaveLength(2);
      expect(state.sessions[0].kanaType).toBe('hiragana');
      expect(state.sessions[1].kanaType).toBe('katakana');
    });
  });
});
