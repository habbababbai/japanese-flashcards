import { katakanaData } from '../../src/data/katakana';
import { Kana } from '../../src/types';

describe('Katakana Data', () => {
  describe('Data Structure', () => {
    it('should be an array', () => {
      expect(Array.isArray(katakanaData)).toBe(true);
    });

    it('should not be empty', () => {
      expect(katakanaData.length).toBeGreaterThan(0);
    });

    it('should contain Kana objects', () => {
      katakanaData.forEach(kana => {
        expect(typeof kana).toBe('object');
        expect(kana).not.toBeNull();
      });
    });

    it('should have required properties for each kana', () => {
      katakanaData.forEach(kana => {
        expect(kana).toHaveProperty('id');
        expect(kana).toHaveProperty('character');
        expect(kana).toHaveProperty('romaji');
        expect(kana).toHaveProperty('type');
        expect(kana).toHaveProperty('correctCount');
        expect(kana).toHaveProperty('incorrectCount');
      });
    });

    it('should have correct property types', () => {
      katakanaData.forEach(kana => {
        expect(typeof kana.id).toBe('string');
        expect(typeof kana.character).toBe('string');
        expect(typeof kana.romaji).toBe('string');
        expect(typeof kana.type).toBe('string');
        expect(typeof kana.correctCount).toBe('number');
        expect(typeof kana.incorrectCount).toBe('number');
      });
    });

    it('should have type set to katakana', () => {
      katakanaData.forEach(kana => {
        expect(kana.type).toBe('katakana');
      });
    });

    it('should have initial counts set to 0', () => {
      katakanaData.forEach(kana => {
        expect(kana.correctCount).toBe(0);
        expect(kana.incorrectCount).toBe(0);
      });
    });
  });

  describe('Data Integrity', () => {
    it('should have unique IDs', () => {
      const ids = katakanaData.map(kana => kana.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have unique characters', () => {
      const characters = katakanaData.map(kana => kana.character);
      const uniqueCharacters = new Set(characters);
      expect(uniqueCharacters.size).toBe(characters.length);
    });

    it('should have valid katakana Unicode ranges', () => {
      katakanaData.forEach(kana => {
        const charCode = kana.character.charCodeAt(0);
        // Katakana Unicode range: 0x30A0-0x30FF
        expect(charCode).toBeGreaterThanOrEqual(0x30a0);
        expect(charCode).toBeLessThanOrEqual(0x30ff);
      });
    });

    it('should have single character entries', () => {
      katakanaData.forEach(kana => {
        expect(kana.character.length).toBe(1);
      });
    });

    it('should have non-empty romaji', () => {
      katakanaData.forEach(kana => {
        expect(kana.romaji.length).toBeGreaterThan(0);
        expect(kana.romaji.trim()).toBe(kana.romaji);
      });
    });

    it('should have valid romaji format', () => {
      katakanaData.forEach(kana => {
        // Romaji should only contain lowercase letters
        expect(kana.romaji).toMatch(/^[a-z]+$/);
      });
    });
  });

  describe('Content Validation', () => {
    it('should contain basic vowels', () => {
      const basicVowels = ['ア', 'イ', 'ウ', 'エ', 'オ'];
      const characters = katakanaData.map(kana => kana.character);

      basicVowels.forEach(vowel => {
        expect(characters).toContain(vowel);
      });
    });

    it('should contain K series', () => {
      const kSeries = ['カ', 'キ', 'ク', 'ケ', 'コ'];
      const characters = katakanaData.map(kana => kana.character);

      kSeries.forEach(kana => {
        expect(characters).toContain(kana);
      });
    });

    it('should contain S series', () => {
      const sSeries = ['サ', 'シ', 'ス', 'セ', 'ソ'];
      const characters = katakanaData.map(kana => kana.character);

      sSeries.forEach(kana => {
        expect(characters).toContain(kana);
      });
    });

    it('should contain T series', () => {
      const tSeries = ['タ', 'チ', 'ツ', 'テ', 'ト'];
      const characters = katakanaData.map(kana => kana.character);

      tSeries.forEach(kana => {
        expect(characters).toContain(kana);
      });
    });

    it('should contain N series', () => {
      const nSeries = ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'];
      const characters = katakanaData.map(kana => kana.character);

      nSeries.forEach(kana => {
        expect(characters).toContain(kana);
      });
    });

    it('should contain H series', () => {
      const hSeries = ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'];
      const characters = katakanaData.map(kana => kana.character);

      hSeries.forEach(kana => {
        expect(characters).toContain(kana);
      });
    });

    it('should contain M series', () => {
      const mSeries = ['マ', 'ミ', 'ム', 'メ', 'モ'];
      const characters = katakanaData.map(kana => kana.character);

      mSeries.forEach(kana => {
        expect(characters).toContain(kana);
      });
    });

    it('should contain Y series', () => {
      const ySeries = ['ヤ', 'ユ', 'ヨ'];
      const characters = katakanaData.map(kana => kana.character);

      ySeries.forEach(kana => {
        expect(characters).toContain(kana);
      });
    });

    it('should contain R series', () => {
      const rSeries = ['ラ', 'リ', 'ル', 'レ', 'ロ'];
      const characters = katakanaData.map(kana => kana.character);

      rSeries.forEach(kana => {
        expect(characters).toContain(kana);
      });
    });

    it('should contain W series', () => {
      const wSeries = ['ワ', 'ヲ'];
      const characters = katakanaData.map(kana => kana.character);

      wSeries.forEach(kana => {
        expect(characters).toContain(kana);
      });
    });

    it('should contain N (ん)', () => {
      const characters = katakanaData.map(kana => kana.character);
      expect(characters).toContain('ン');
    });
  });

  describe('Romaji Mapping', () => {
    it('should have correct romaji for basic vowels', () => {
      const vowelMappings = [
        { character: 'ア', romaji: 'a' },
        { character: 'イ', romaji: 'i' },
        { character: 'ウ', romaji: 'u' },
        { character: 'エ', romaji: 'e' },
        { character: 'オ', romaji: 'o' },
      ];

      vowelMappings.forEach(mapping => {
        const kana = katakanaData.find(k => k.character === mapping.character);
        expect(kana).toBeDefined();
        expect(kana?.romaji).toBe(mapping.romaji);
      });
    });

    it('should have correct romaji for K series', () => {
      const kMappings = [
        { character: 'カ', romaji: 'ka' },
        { character: 'キ', romaji: 'ki' },
        { character: 'ク', romaji: 'ku' },
        { character: 'ケ', romaji: 'ke' },
        { character: 'コ', romaji: 'ko' },
      ];

      kMappings.forEach(mapping => {
        const kana = katakanaData.find(k => k.character === mapping.character);
        expect(kana).toBeDefined();
        expect(kana?.romaji).toBe(mapping.romaji);
      });
    });

    it('should have correct romaji for special cases', () => {
      const specialMappings = [
        { character: 'シ', romaji: 'shi' },
        { character: 'チ', romaji: 'chi' },
        { character: 'ツ', romaji: 'tsu' },
        { character: 'フ', romaji: 'fu' },
        { character: 'ン', romaji: 'n' },
      ];

      specialMappings.forEach(mapping => {
        const kana = katakanaData.find(k => k.character === mapping.character);
        expect(kana).toBeDefined();
        expect(kana?.romaji).toBe(mapping.romaji);
      });
    });
  });

  describe('Data Consistency', () => {
    it('should have consistent ID format', () => {
      katakanaData.forEach(kana => {
        expect(kana.id).toMatch(/^\d+$/);
      });
    });

    it('should have sequential IDs', () => {
      const ids = katakanaData
        .map(kana => parseInt(kana.id))
        .sort((a, b) => a - b);
      for (let i = 1; i < ids.length; i++) {
        expect(ids[i]).toBe(ids[i - 1] + 1);
      }
    });

    it('should not contain hiragana characters', () => {
      katakanaData.forEach(kana => {
        const charCode = kana.character.charCodeAt(0);
        // Hiragana Unicode range: 0x3040-0x309F
        expect(charCode < 0x3040 || charCode > 0x309f).toBe(true);
      });
    });

    it('should not contain kanji characters', () => {
      katakanaData.forEach(kana => {
        const charCode = kana.character.charCodeAt(0);
        // Kanji Unicode range: 0x4E00-0x9FAF
        expect(charCode < 0x4e00 || charCode > 0x9faf).toBe(true);
      });
    });
  });

  describe('Type Safety', () => {
    it('should conform to Kana type', () => {
      katakanaData.forEach(kana => {
        // This test ensures TypeScript compilation
        const typedKana: Kana = kana;
        expect(typedKana).toBeDefined();
        expect(typedKana.type).toBe('katakana');
      });
    });
  });
});
