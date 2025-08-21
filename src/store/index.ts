import { configureStore } from '@reduxjs/toolkit';
import studySessionReducer from './slices/studySessionSlice';

// Custom middleware for logging Redux actions and state changes
const loggerMiddleware = (store: any) => (next: any) => (action: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔴 Redux Action: ${action.type}`);
    console.log('📤 Dispatching:', action);
    const result = next(action);
    console.log('📥 New State:', store.getState());
    console.groupEnd();
    return result;
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    studySession: studySessionReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // Ignore these field paths in all actions
        ignoredActionPaths: [
          'payload.timestamp',
          'payload.startTime',
          'payload.endTime',
        ],
        // Ignore these paths in the state
        ignoredPaths: ['studySession.kanaProgress'],
      },
    }).concat(loggerMiddleware),
  devTools: process.env.NODE_ENV === 'development',
});

// Development-only: expose store for debugging
if (process.env.NODE_ENV === 'development') {
  (global as any).__REDUX_STORE__ = store;
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
