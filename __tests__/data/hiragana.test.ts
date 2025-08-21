import { hiraganaData } from '../../src/data/hiragana';
import { Kana } from '../../src/types';

describe('Hiragana Data', () => {
  describe('Data structure', () => {
    it('should be an array', () => {
      expect(Array.isArray(hiraganaData)).toBe(true);
    });

    it('should not be empty', () => {
      expect(hiraganaData.length).toBeGreaterThan(0);
    });

    it('should contain at least basic vowels', () => {
      const basicVowels = ['あ', 'い', 'う', 'え', 'お'];
      const characters = hiraganaData.map(kana => kana.character);

      basicVowels.forEach(vowel => {
        expect(characters).toContain(vowel);
      });
    });
  });

  describe('Individual kana structure', () => {
    it('should have correct structure for each kana', () => {
      hiraganaData.forEach((kana: Kana) => {
        expect(kana).toHaveProperty('id');
        expect(kana).toHaveProperty('character');
        expect(kana).toHaveProperty('romaji');
        expect(kana).toHaveProperty('type');
        expect(kana).toHaveProperty('correctCount');
        expect(kana).toHaveProperty('incorrectCount');
      });
    });

    it('should have valid IDs', () => {
      hiraganaData.forEach((kana: Kana) => {
        expect(typeof kana.id).toBe('string');
        expect(kana.id.length).toBeGreaterThan(0);
      });
    });

    it('should have unique IDs', () => {
      const ids = hiraganaData.map(kana => kana.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid hiragana characters', () => {
      hiraganaData.forEach((kana: Kana) => {
        expect(typeof kana.character).toBe('string');
        expect(kana.character.length).toBe(1);
        // Check if it's a valid hiragana character (Unicode range: 3040-309F)
        const charCode = kana.character.charCodeAt(0);
        expect(charCode).toBeGreaterThanOrEqual(0x3040);
        expect(charCode).toBeLessThanOrEqual(0x309f);
      });
    });

    it('should have valid romaji', () => {
      hiraganaData.forEach((kana: Kana) => {
        expect(typeof kana.romaji).toBe('string');
        expect(kana.romaji.length).toBeGreaterThan(0);
        // Romaji should only contain lowercase letters
        expect(kana.romaji).toMatch(/^[a-z]+$/);
      });
    });

    it('should have correct type', () => {
      hiraganaData.forEach((kana: Kana) => {
        expect(kana.type).toBe('hiragana');
      });
    });

    it('should have numeric counters', () => {
      hiraganaData.forEach((kana: Kana) => {
        expect(typeof kana.correctCount).toBe('number');
        expect(typeof kana.incorrectCount).toBe('number');
        expect(kana.correctCount).toBeGreaterThanOrEqual(0);
        expect(kana.incorrectCount).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Character validation', () => {
    it('should have valid hiragana characters for basic vowels', () => {
      const basicVowels = [
        { character: 'あ', romaji: 'a' },
        { character: 'い', romaji: 'i' },
        { character: 'う', romaji: 'u' },
        { character: 'え', romaji: 'e' },
        { character: 'お', romaji: 'o' },
      ];

      basicVowels.forEach(expected => {
        const kana = hiraganaData.find(k => k.character === expected.character);
        expect(kana).toBeDefined();
        expect(kana?.romaji).toBe(expected.romaji);
      });
    });

    it('should have valid K-series characters', () => {
      const kSeries = [
        { character: 'か', romaji: 'ka' },
        { character: 'き', romaji: 'ki' },
        { character: 'く', romaji: 'ku' },
        { character: 'け', romaji: 'ke' },
        { character: 'こ', romaji: 'ko' },
      ];

      kSeries.forEach(expected => {
        const kana = hiraganaData.find(k => k.character === expected.character);
        expect(kana).toBeDefined();
        expect(kana?.romaji).toBe(expected.romaji);
      });
    });
  });

  describe('Data integrity', () => {
    it('should have no duplicate characters', () => {
      const characters = hiraganaData.map(kana => kana.character);
      const uniqueCharacters = new Set(characters);
      expect(uniqueCharacters.size).toBe(characters.length);
    });

    it('should have no duplicate romaji', () => {
      const romaji = hiraganaData.map(kana => kana.romaji);
      const uniqueRomaji = new Set(romaji);
      expect(uniqueRomaji.size).toBe(romaji.length);
    });

    it('should have consistent initial counter values', () => {
      hiraganaData.forEach((kana: Kana) => {
        expect(kana.correctCount).toBe(0);
        expect(kana.incorrectCount).toBe(0);
      });
    });
  });
});
