import { colors, semanticColors } from '../../src/utils/colors';

describe('Colors Utils', () => {
  describe('Main colors object', () => {
    it('should have all required color categories', () => {
      expect(colors).toHaveProperty('primary');
      expect(colors).toHaveProperty('secondary');
      expect(colors).toHaveProperty('success');
      expect(colors).toHaveProperty('error');
      expect(colors).toHaveProperty('neutral');
      expect(colors).toHaveProperty('background');
      expect(colors).toHaveProperty('text');
      expect(colors).toHaveProperty('border');
      expect(colors).toHaveProperty('shadow');
      expect(colors).toHaveProperty('study');
    });

    it('should have valid hex color values for primary colors', () => {
      expect(colors.primary.main).toMatch(/^#[0-9A-F]{6}$/i);
      expect(colors.primary.light).toMatch(/^#[0-9A-F]{6}$/i);
      expect(colors.primary.dark).toMatch(/^#[0-9A-F]{6}$/i);
      expect(colors.primary.contrast).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should have valid hex color values for secondary colors', () => {
      expect(colors.secondary.main).toMatch(/^#[0-9A-F]{6}$/i);
      expect(colors.secondary.light).toMatch(/^#[0-9A-F]{6}$/i);
      expect(colors.secondary.dark).toMatch(/^#[0-9A-F]{6}$/i);
      expect(colors.secondary.contrast).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  describe('Neutral colors', () => {
    it('should have basic neutral colors', () => {
      expect(colors.neutral.white).toBe('#FFFFFF');
      expect(colors.neutral.black).toBe('#000000');
    });

    it('should have gray scale from 50 to 900', () => {
      const grayKeys = Object.keys(colors.neutral.gray);
      const expectedKeys = [
        '50',
        '100',
        '200',
        '300',
        '400',
        '500',
        '600',
        '700',
        '800',
        '900',
      ];

      expect(grayKeys).toEqual(expectedKeys);
    });

    it('should have valid hex values for all gray colors', () => {
      Object.values(colors.neutral.gray).forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('Background colors', () => {
    it('should have all background color variants', () => {
      expect(colors.background).toHaveProperty('primary');
      expect(colors.background).toHaveProperty('secondary');
      expect(colors.background).toHaveProperty('tertiary');
    });

    it('should have valid hex values for background colors', () => {
      Object.values(colors.background).forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('Text colors', () => {
    it('should have all text color variants', () => {
      expect(colors.text).toHaveProperty('primary');
      expect(colors.text).toHaveProperty('secondary');
      expect(colors.text).toHaveProperty('tertiary');
      expect(colors.text).toHaveProperty('inverse');
    });

    it('should have valid hex values for text colors', () => {
      Object.values(colors.text).forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });

  describe('Study colors', () => {
    it('should have study-specific colors', () => {
      expect(colors.study).toHaveProperty('hiragana');
      expect(colors.study).toHaveProperty('katakana');
      expect(colors.study).toHaveProperty('progress');
      expect(colors.study).toHaveProperty('warning');
    });

    it('should have valid hex values for study colors', () => {
      Object.values(colors.study).forEach(color => {
        expect(color).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });
  });
});

describe('Semantic Colors', () => {
  describe('Button colors', () => {
    it('should have all button color variants', () => {
      expect(semanticColors.button).toHaveProperty('primary');
      expect(semanticColors.button).toHaveProperty('primaryPressed');
      expect(semanticColors.button).toHaveProperty('secondary');
      expect(semanticColors.button).toHaveProperty('secondaryPressed');
      expect(semanticColors.button).toHaveProperty('success');
      expect(semanticColors.button).toHaveProperty('error');
    });
  });

  describe('Card colors', () => {
    it('should have all card color variants', () => {
      expect(semanticColors.card).toHaveProperty('background');
      expect(semanticColors.card).toHaveProperty('border');
      expect(semanticColors.card).toHaveProperty('shadow');
    });
  });
});
