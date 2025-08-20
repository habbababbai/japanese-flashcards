import AsyncStorage from "@react-native-async-storage/async-storage";

// Helper functions for storing and retrieving data
export const storageUtils = {
    // Store data
    set: async (key: string, value: any) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error("Error storing data:", error);
        }
    },

    // Retrieve data
    get: async (key: string, defaultValue: any = null) => {
        try {
            const value = await AsyncStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.error("Error retrieving data:", error);
            return defaultValue;
        }
    },

    // Delete data
    delete: async (key: string) => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    },

    // Clear all data
    clear: async () => {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error("Error clearing data:", error);
        }
    },
};
