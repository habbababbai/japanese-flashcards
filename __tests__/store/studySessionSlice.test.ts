import { configureStore } from '@reduxjs/toolkit';
import studySessionReducer, {
  startSession,
  endSession,
  addProgress,
  clearSessions,
  setLoading,
  setError,
  loadStoredData,
  saveSessions,
  saveKanaProgress,
  selectSessions,
  selectCurrentSession,
  selectKanaProgress,
  selectIsLoading,
  selectError,
} from '../../src/store/slices/studySessionSlice';
import { storageUtils } from '../../src/store/storage';
import { StudySession, StudyProgress } from '../../src/types';

// Mock storage utils
jest.mock('../../src/store/storage', () => ({
  storageUtils: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

const mockStorageUtils = storageUtils as jest.Mocked<typeof storageUtils>;

describe('Study Session Slice', () => {
  let store: ReturnType<typeof setupStore>;

  const setupStore = () => {
    return configureStore({
      reducer: {
        studySession: studySessionReducer,
      },
      middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
          serializableCheck: {
            // Ignore these action types
            ignoredActions: [
              'studySession/startSession',
              'studySession/addProgress',
              'studySession/endSession',
              'studySession/loadStoredData/fulfilled',
              'studySession/loadStoredData/pending',
              'studySession/saveSessions/fulfilled',
              'studySession/saveSessions/pending',
              'studySession/saveKanaProgress/fulfilled',
              'studySession/saveKanaProgress/pending',
            ],
            // Ignore these field paths in all actions
            ignoredActionPaths: [
              'payload.timestamp',
              'payload.startTime',
              'payload.endTime',
              'payload.lastReviewed',
              'meta.arg.0.startTime',
              'meta.arg.0.endTime',
              'meta.arg.1.lastReviewed',
            ],
            // Ignore these paths in the state
            ignoredPaths: [
              'studySession.currentSession.startTime',
              'studySession.currentSession.endTime',
              'studySession.sessions',
              'studySession.kanaProgress',
            ],
          },
        }),
    });
  };

  beforeEach(() => {
    store = setupStore();
    jest.clearAllMocks();
  });

  describe('Reducers', () => {
    describe('startSession', () => {
      it('should start a new session', () => {
        const sessionData = {
          kanaType: 'hiragana' as const,
          isShuffled: true,
        };

        store.dispatch(startSession(sessionData));

        const state = store.getState().studySession;
        expect(state.currentSession).toBeTruthy();
        expect(state.currentSession?.kanaType).toBe('hiragana');
        expect(state.currentSession?.cardsReviewed).toBe(0);
        expect(state.currentSession?.correctAnswers).toBe(0);
        expect(state.currentSession?.incorrectAnswers).toBe(0);
        expect(state.currentSession?.startTime).toBeInstanceOf(Date);
      });

      it('should start a katakana session', () => {
        const sessionData = {
          kanaType: 'katakana' as const,
          isShuffled: false,
        };

        store.dispatch(startSession(sessionData));

        const state = store.getState().studySession;
        expect(state.currentSession?.kanaType).toBe('katakana');
      });
    });

    describe('endSession', () => {
      it('should end current session and save progress', () => {
        // Start a session first
        store.dispatch(
          startSession({ kanaType: 'hiragana', isShuffled: false })
        );

        const progress: StudyProgress[] = [
          {
            kanaId: '1',
            isCorrect: true,
            responseTime: 1000,
            timestamp: new Date(),
          },
          {
            kanaId: '2',
            isCorrect: false,
            responseTime: 2000,
            timestamp: new Date(),
          },
        ];

        const endTime = new Date();
        store.dispatch(endSession({ endTime, progress }));

        const state = store.getState().studySession;
        expect(state.currentSession).toBeNull();
        expect(state.sessions).toHaveLength(1);

        const completedSession = state.sessions[0];
        expect(completedSession.cardsReviewed).toBe(2);
        expect(completedSession.correctAnswers).toBe(1);
        expect(completedSession.incorrectAnswers).toBe(1);
        expect(completedSession.endTime).toBe(endTime);
      });

      it('should update kana progress when ending session', () => {
        // Start a session first
        store.dispatch(
          startSession({ kanaType: 'hiragana', isShuffled: false })
        );

        const progress: StudyProgress[] = [
          {
            kanaId: '1',
            isCorrect: true,
            responseTime: 1000,
            timestamp: new Date(),
          },
          {
            kanaId: '1',
            isCorrect: true,
            responseTime: 1500,
            timestamp: new Date(),
          },
          {
            kanaId: '2',
            isCorrect: false,
            responseTime: 2000,
            timestamp: new Date(),
          },
        ];

        store.dispatch(endSession({ endTime: new Date(), progress }));

        const state = store.getState().studySession;
        expect(state.kanaProgress['1'].correctCount).toBe(2);
        expect(state.kanaProgress['1'].incorrectCount).toBe(0);
        expect(state.kanaProgress['2'].correctCount).toBe(0);
        expect(state.kanaProgress['2'].incorrectCount).toBe(1);
      });

      it('should not end session if no current session exists', () => {
        const progress: StudyProgress[] = [];
        const endTime = new Date();

        store.dispatch(endSession({ endTime, progress }));

        const state = store.getState().studySession;
        expect(state.sessions).toHaveLength(0);
      });
    });

    describe('addProgress', () => {
      it('should add progress to current session', () => {
        // Start a session first
        store.dispatch(
          startSession({ kanaType: 'hiragana', isShuffled: false })
        );

        const progress: StudyProgress = {
          kanaId: '1',
          isCorrect: true,
          responseTime: 1000,
          timestamp: new Date(),
        };

        store.dispatch(addProgress(progress));

        const state = store.getState().studySession;
        expect(state.currentSession?.cardsReviewed).toBe(1);
        expect(state.currentSession?.correctAnswers).toBe(1);
        expect(state.currentSession?.incorrectAnswers).toBe(0);
      });

      it('should add incorrect progress', () => {
        // Start a session first
        store.dispatch(
          startSession({ kanaType: 'hiragana', isShuffled: false })
        );

        const progress: StudyProgress = {
          kanaId: '1',
          isCorrect: false,
          responseTime: 2000,
          timestamp: new Date(),
        };

        store.dispatch(addProgress(progress));

        const state = store.getState().studySession;
        expect(state.currentSession?.cardsReviewed).toBe(1);
        expect(state.currentSession?.correctAnswers).toBe(0);
        expect(state.currentSession?.incorrectAnswers).toBe(1);
      });

      it('should update kana progress when adding progress', () => {
        const progress: StudyProgress = {
          kanaId: '1',
          isCorrect: true,
          responseTime: 1000,
          timestamp: new Date(),
        };

        store.dispatch(addProgress(progress));

        const state = store.getState().studySession;
        expect(state.kanaProgress['1'].correctCount).toBe(1);
        expect(state.kanaProgress['1'].incorrectCount).toBe(0);
        expect(state.kanaProgress['1'].lastReviewed).toBe(progress.timestamp);
      });

      it('should handle multiple progress entries for same kana', () => {
        const progress1: StudyProgress = {
          kanaId: '1',
          isCorrect: true,
          responseTime: 1000,
          timestamp: new Date(),
        };

        const progress2: StudyProgress = {
          kanaId: '1',
          isCorrect: false,
          responseTime: 2000,
          timestamp: new Date(),
        };

        store.dispatch(addProgress(progress1));
        store.dispatch(addProgress(progress2));

        const state = store.getState().studySession;
        expect(state.kanaProgress['1'].correctCount).toBe(1);
        expect(state.kanaProgress['1'].incorrectCount).toBe(1);
      });
    });

    describe('clearSessions', () => {
      it('should clear all sessions and progress', () => {
        // Add some data first
        store.dispatch(
          startSession({ kanaType: 'hiragana', isShuffled: false })
        );
        store.dispatch(
          addProgress({
            kanaId: '1',
            isCorrect: true,
            responseTime: 1000,
            timestamp: new Date(),
          })
        );

        store.dispatch(clearSessions());

        const state = store.getState().studySession;
        expect(state.sessions).toHaveLength(0);
        expect(state.kanaProgress).toEqual({});
      });
    });

    describe('setLoading', () => {
      it('should set loading state', () => {
        store.dispatch(setLoading(true));
        expect(store.getState().studySession.isLoading).toBe(true);

        store.dispatch(setLoading(false));
        expect(store.getState().studySession.isLoading).toBe(false);
      });
    });

    describe('setError', () => {
      it('should set error state', () => {
        const errorMessage = 'Test error';
        store.dispatch(setError(errorMessage));
        expect(store.getState().studySession.error).toBe(errorMessage);

        store.dispatch(setError(null));
        expect(store.getState().studySession.error).toBeNull();
      });
    });
  });

  describe('Async Thunks', () => {
    describe('loadStoredData', () => {
      it('should load stored data successfully', async () => {
        const mockSessions: StudySession[] = [
          {
            id: '1',
            kanaType: 'hiragana',
            startTime: new Date(),
            endTime: new Date(),
            cardsReviewed: 10,
            correctAnswers: 8,
            incorrectAnswers: 2,
          },
        ];

        const mockProgress = {
          '1': { correctCount: 5, incorrectCount: 2, lastReviewed: new Date() },
        };

        mockStorageUtils.get
          .mockResolvedValueOnce(mockSessions)
          .mockResolvedValueOnce(mockProgress);

        await store.dispatch(loadStoredData());

        const state = store.getState().studySession;
        expect(state.sessions).toEqual(mockSessions);
        expect(state.kanaProgress).toEqual(mockProgress);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
      });

      it('should handle loading errors', async () => {
        mockStorageUtils.get.mockRejectedValueOnce(new Error('Storage error'));

        await store.dispatch(loadStoredData());

        const state = store.getState().studySession;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Storage error');
      });
    });

    describe('saveSessions', () => {
      it('should save sessions successfully', async () => {
        const sessions: StudySession[] = [
          {
            id: '1',
            kanaType: 'hiragana',
            startTime: new Date(),
            endTime: new Date(),
            cardsReviewed: 10,
            correctAnswers: 8,
            incorrectAnswers: 2,
          },
        ];

        mockStorageUtils.set.mockResolvedValueOnce(undefined);

        const result = await store.dispatch(saveSessions(sessions));

        expect(mockStorageUtils.set).toHaveBeenCalledWith(
          'studySessions',
          sessions
        );
        expect(result.payload).toEqual(sessions);
      });
    });

    describe('saveKanaProgress', () => {
      it('should save kana progress successfully', async () => {
        const progress = {
          '1': { correctCount: 5, incorrectCount: 2, lastReviewed: new Date() },
        };

        mockStorageUtils.set.mockResolvedValueOnce(undefined);

        const result = await store.dispatch(saveKanaProgress(progress));

        expect(mockStorageUtils.set).toHaveBeenCalledWith(
          'kanaProgress',
          progress
        );
        expect(result.payload).toEqual(progress);
      });
    });
  });

  describe('Selectors', () => {
    beforeEach(() => {
      // Set up some test data
      store.dispatch(startSession({ kanaType: 'hiragana', isShuffled: false }));
      store.dispatch(
        addProgress({
          kanaId: '1',
          isCorrect: true,
          responseTime: 1000,
          timestamp: new Date(),
        })
      );
    });

    it('should select sessions', () => {
      const sessions = selectSessions(store.getState());
      expect(sessions).toEqual(store.getState().studySession.sessions);
    });

    it('should select current session', () => {
      const currentSession = selectCurrentSession(store.getState());
      expect(currentSession).toEqual(
        store.getState().studySession.currentSession
      );
    });

    it('should select kana progress', () => {
      const kanaProgress = selectKanaProgress(store.getState());
      expect(kanaProgress).toEqual(store.getState().studySession.kanaProgress);
    });

    it('should select loading state', () => {
      const isLoading = selectIsLoading(store.getState());
      expect(isLoading).toBe(store.getState().studySession.isLoading);
    });

    it('should select error state', () => {
      const error = selectError(store.getState());
      expect(error).toBe(store.getState().studySession.error);
    });
  });

  describe('State Transitions', () => {
    it('should handle complete study session flow', () => {
      // Start session
      store.dispatch(startSession({ kanaType: 'hiragana', isShuffled: false }));
      expect(store.getState().studySession.currentSession).toBeTruthy();

      // End session with progress
      const progress: StudyProgress[] = [
        {
          kanaId: '1',
          isCorrect: true,
          responseTime: 1000,
          timestamp: new Date(),
        },
        {
          kanaId: '2',
          isCorrect: false,
          responseTime: 2000,
          timestamp: new Date(),
        },
      ];

      store.dispatch(endSession({ endTime: new Date(), progress }));

      const state = store.getState().studySession;
      expect(state.currentSession).toBeNull();
      expect(state.sessions).toHaveLength(1);
      expect(state.kanaProgress['1'].correctCount).toBe(1);
      expect(state.kanaProgress['2'].incorrectCount).toBe(1);
    });
  });
});
