import { formatEpisodeRoman, formatMetric } from './formatters';

describe('formatters', () => {
  describe('formatMetric', () => {
    it('should append units and format numbers with commas when requested', () => {
      expect(formatMetric('172', 'cm')).toBe('172 cm');
      expect(formatMetric('77', 'kg')).toBe('77 kg');
      expect(formatMetric('1', '%')).toBe('1%');
      expect(formatMetric('200000', '', true)).toBe('200,000');
      expect(formatMetric('10465', 'km', true)).toBe('10,465 km');
    });

    it('should preserve non-numeric placeholders without appending units', () => {
      expect(formatMetric('unknown', 'cm')).toBe('unknown');
      expect(formatMetric('n/a', 'kg')).toBe('n/a');
      expect(formatMetric('indefinite', 'yr')).toBe('indefinite');
      expect(formatMetric(undefined, 'cm')).toBe('unknown');
    });
  });

  describe('formatEpisodeRoman', () => {
    it('should convert episode numbers to Roman numerals', () => {
      expect(formatEpisodeRoman(1)).toBe('Episode I');
      expect(formatEpisodeRoman(4)).toBe('Episode IV');
      expect(formatEpisodeRoman(6)).toBe('Episode VI');
    });
  });
});
