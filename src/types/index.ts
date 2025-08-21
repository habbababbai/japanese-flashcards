export interface Kana {
  id: string;
  character: string;
  romaji: string;
  type: 'hiragana' | 'katakana';
  correctCount: number;
  incorrectCount: number;
  lastReviewed?: string; // ISO string for serialization
}

export interface StudySession {
  id: string;
  kanaType: 'hiragana' | 'katakana';
  startTime: string; // ISO string for serialization
  endTime?: string; // ISO string for serialization
  cardsReviewed: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

export interface StudyProgress {
  kanaId: string;
  isCorrect: boolean;
  responseTime: number;
  timestamp: string; // ISO string for serialization
}
