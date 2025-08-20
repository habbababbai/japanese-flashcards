export interface Kana {
    id: string;
    character: string;
    romaji: string;
    type: "hiragana" | "katakana";
    correctCount: number;
    incorrectCount: number;
    lastReviewed?: Date;
}

export interface StudySession {
    id: string;
    kanaType: "hiragana" | "katakana";
    startTime: Date;
    endTime?: Date;
    cardsReviewed: number;
    correctAnswers: number;
    incorrectAnswers: number;
}

export interface StudyProgress {
    kanaId: string;
    isCorrect: boolean;
    responseTime: number;
    timestamp: Date;
}
