import { spacing, fontSize } from '../../src/utils/responsive';

describe('Responsive Utils', () => {
  describe('Spacing values', () => {
    it('should have all required spacing values', () => {
      expect(spacing).toHaveProperty('xs');
      expect(spacing).toHaveProperty('sm');
      expect(spacing).toHaveProperty('md');
      expect(spacing).toHaveProperty('lg');
      expect(spacing).toHaveProperty('xl');
      expect(spacing).toHaveProperty('xxl');
    });

    it('should have numeric spacing values', () => {
      Object.values(spacing).forEach(value => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThan(0);
      });
    });
  });

  describe('Font size values', () => {
    it('should have all required font size values', () => {
      expect(fontSize).toHaveProperty('xs');
      expect(fontSize).toHaveProperty('sm');
      expect(fontSize).toHaveProperty('md');
      expect(fontSize).toHaveProperty('lg');
      expect(fontSize).toHaveProperty('xl');
      expect(fontSize).toHaveProperty('xxl');
      expect(fontSize).toHaveProperty('huge');
    });

    it('should have numeric font size values', () => {
      Object.values(fontSize).forEach(value => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThan(0);
      });
    });
  });
});
