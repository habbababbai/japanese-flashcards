import { configureStore, Middleware, AnyAction } from '@reduxjs/toolkit';
import studySessionReducer from './slices/studySessionSlice';

// Feature flag to enable/disable Redux logging
const ENABLE_REDUX_LOGGING = false; // Set to true when you need logs

// Custom middleware for logging Redux actions and state changes
const loggerMiddleware: Middleware = store => next => action => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔴 Redux Action: ${(action as AnyAction).type}`);
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
  middleware: getDefaultMiddleware => {
    const middleware = getDefaultMiddleware({
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
    });

    // Only add logger middleware in development and when flag is enabled
    if (process.env.NODE_ENV === 'development' && ENABLE_REDUX_LOGGING) {
      middleware.push(loggerMiddleware);
    }

    return middleware;
  },
  devTools: process.env.NODE_ENV === 'development',
});

// Development-only: expose store for debugging
if (process.env.NODE_ENV === 'development') {
  (global as { __REDUX_STORE__?: typeof store }).__REDUX_STORE__ = store;
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
