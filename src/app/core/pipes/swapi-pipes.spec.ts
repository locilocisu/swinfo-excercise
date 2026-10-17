import { AurebeshTextPipe, EpisodeRomanPipe, SwapiMetricPipe } from './swapi-pipes';

describe('SWAPI Pipes', () => {
  describe('SwapiMetricPipe', () => {
    const pipe = new SwapiMetricPipe();

    it('should append units and format numbers with commas when requested', () => {
      expect(pipe.transform('172', 'cm')).toBe('172 cm');
      expect(pipe.transform('77', 'kg')).toBe('77 kg');
      expect(pipe.transform('1', '%')).toBe('1%');
      expect(pipe.transform('200000', '', true)).toBe('200,000');
      expect(pipe.transform('10465', 'km', true)).toBe('10,465 km');
    });

    it('should preserve non-numeric placeholders without appending units', () => {
      expect(pipe.transform('unknown', 'cm')).toBe('unknown');
      expect(pipe.transform('n/a', 'kg')).toBe('n/a');
      expect(pipe.transform('indefinite', 'yr')).toBe('indefinite');
      expect(pipe.transform(undefined, 'cm')).toBe('unknown');
      expect(pipe.transform(null, 'cm')).toBe('unknown');
    });
  });

  describe('EpisodeRomanPipe', () => {
    const pipe = new EpisodeRomanPipe();

    it('should convert episode numbers to Roman numerals', () => {
      expect(pipe.transform(1)).toBe('Episode I');
      expect(pipe.transform(4)).toBe('Episode IV');
      expect(pipe.transform(6)).toBe('Episode VI');
      expect(pipe.transform(null)).toBe('');
    });
  });

  describe('AurebeshTextPipe', () => {
    const pipe = new AurebeshTextPipe();

    it('should strip accents and diacritics so letters map to standard Aurebesh glyphs', () => {
      expect(pipe.transform('Padmé Amidala')).toBe('Padme Amidala');
      expect(pipe.transform('Dormé')).toBe('Dorme');
      expect(pipe.transform('Ric Olié')).toBe('Ric Olie');
      expect(pipe.transform('Lama Su')).toBe('Lama Su');
      expect(pipe.transform(null)).toBe('');
    });
  });
});
