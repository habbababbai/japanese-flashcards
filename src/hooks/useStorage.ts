import { useEffect, useState } from "react";
import { storageUtils } from "../store/storage";
import { StudySession, StudyProgress } from "../types";

export const useStorage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [sessions, setSessions] = useState<StudySession[]>([]);
    const [kanaProgress, setKanaProgress] = useState<
        Record<
            string,
            {
                correctCount: number;
                incorrectCount: number;
                lastReviewed?: Date;
            }
        >
    >({});

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [storedSessions, storedProgress] = await Promise.all([
                storageUtils.get("studySessions", []),
                storageUtils.get("kanaProgress", {}),
            ]);
            setSessions(storedSessions);
            setKanaProgress(storedProgress);
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveSession = async (session: StudySession) => {
        try {
            const updatedSessions = [...sessions, session];
            setSessions(updatedSessions);
            await storageUtils.set("studySessions", updatedSessions);
        } catch (error) {
            console.error("Error saving session:", error);
        }
    };

    const saveProgress = async (progress: StudyProgress) => {
        try {
            const updatedProgress = { ...kanaProgress };
            if (!updatedProgress[progress.kanaId]) {
                updatedProgress[progress.kanaId] = {
                    correctCount: 0,
                    incorrectCount: 0,
                };
            }
            if (progress.isCorrect) {
                updatedProgress[progress.kanaId].correctCount += 1;
            } else {
                updatedProgress[progress.kanaId].incorrectCount += 1;
            }
            updatedProgress[progress.kanaId].lastReviewed = progress.timestamp;

            setKanaProgress(updatedProgress);
            await storageUtils.set("kanaProgress", updatedProgress);
        } catch (error) {
            console.error("Error saving progress:", error);
        }
    };

    const clearData = async () => {
        try {
            setSessions([]);
            setKanaProgress({});
            await Promise.all([
                storageUtils.set("studySessions", []),
                storageUtils.set("kanaProgress", {}),
            ]);
        } catch (error) {
            console.error("Error clearing data:", error);
        }
    };

    return {
        sessions,
        kanaProgress,
        isLoading,
        saveSession,
        saveProgress,
        clearData,
        loadData,
    };
};
