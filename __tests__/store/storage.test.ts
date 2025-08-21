import { storageUtils } from '../../src/store/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  return require('@react-native-async-storage/async-storage/jest/async-storage-mock');
});

describe('Storage Utils', () => {
  beforeEach(() => {
    // Clear all mocks and storage before each test
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('set', () => {
    it('should store data successfully', async () => {
      const testData = { name: 'test', value: 123 };
      const key = 'testKey';

      await storageUtils.set(key, testData);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        key,
        JSON.stringify(testData)
      );
    });

    it('should handle storage errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));

      const testData = { name: 'test' };
      const key = 'testKey';

      // Should not throw
      await expect(storageUtils.set(key, testData)).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error storing data:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should store different data types correctly', async () => {
      const testCases = [
        { key: 'string', value: 'hello world' },
        { key: 'number', value: 42 },
        { key: 'boolean', value: true },
        { key: 'array', value: [1, 2, 3] },
        { key: 'object', value: { nested: { data: 'value' } } },
        { key: 'null', value: null },
      ];

      for (const testCase of testCases) {
        await storageUtils.set(testCase.key, testCase.value);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          testCase.key,
          JSON.stringify(testCase.value)
        );
      }
    });
  });

  describe('get', () => {
    it('should retrieve stored data successfully', async () => {
      const testData = { name: 'test', value: 123 };
      const key = 'testKey';

      // Mock AsyncStorage to return our test data
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(testData));

      const result = await storageUtils.get(key);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(key);
      expect(result).toEqual(testData);
    });

    it('should return default value when key does not exist', async () => {
      const key = 'nonexistentKey';
      const defaultValue = { default: 'value' };

      // Mock AsyncStorage to return null (key doesn't exist)
      AsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await storageUtils.get(key, defaultValue);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(key);
      expect(result).toEqual(defaultValue);
    });

    it('should return null as default when no default is provided', async () => {
      const key = 'nonexistentKey';

      AsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await storageUtils.get(key);

      expect(result).toBeNull();
    });

    it('should handle JSON parsing errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const key = 'invalidJsonKey';
      const defaultValue = { default: 'value' };

      // Mock AsyncStorage to return invalid JSON
      AsyncStorage.getItem.mockResolvedValueOnce('invalid json');

      const result = await storageUtils.get(key, defaultValue);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error retrieving data:',
        expect.any(Error)
      );
      expect(result).toEqual(defaultValue);

      consoleSpy.mockRestore();
    });

    it('should handle storage errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const key = 'errorKey';
      const defaultValue = { default: 'value' };

      AsyncStorage.getItem.mockRejectedValueOnce(new Error('Storage error'));

      const result = await storageUtils.get(key, defaultValue);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error retrieving data:',
        expect.any(Error)
      );
      expect(result).toEqual(defaultValue);

      consoleSpy.mockRestore();
    });
  });

  describe('delete', () => {
    it('should delete data successfully', async () => {
      const key = 'testKey';

      await storageUtils.delete(key);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(key);
    });

    it('should handle deletion errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const key = 'errorKey';

      AsyncStorage.removeItem.mockRejectedValueOnce(new Error('Delete error'));

      await expect(storageUtils.delete(key)).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error deleting data:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('clear', () => {
    it('should clear all data successfully', async () => {
      await storageUtils.clear();

      expect(AsyncStorage.clear).toHaveBeenCalled();
    });

    it('should handle clear errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      AsyncStorage.clear.mockRejectedValueOnce(new Error('Clear error'));

      await expect(storageUtils.clear()).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error clearing data:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Integration', () => {
    it('should handle full CRUD cycle', async () => {
      const key = 'integrationTest';
      const testData = { id: 1, name: 'test', active: true };

      // Create
      await storageUtils.set(key, testData);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        key,
        JSON.stringify(testData)
      );

      // Read
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(testData));
      const retrieved = await storageUtils.get(key);
      expect(retrieved).toEqual(testData);

      // Update
      const updatedData = { ...testData, name: 'updated' };
      await storageUtils.set(key, updatedData);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        key,
        JSON.stringify(updatedData)
      );

      // Delete
      await storageUtils.delete(key);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(key);
    });
  });
});
