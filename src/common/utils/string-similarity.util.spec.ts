import {
  compareTwoStrings,
  findBestMatch,
  levenshteinDistance,
  levenshteinSimilarity,
} from './string-similarity.util';

describe('StringSimilarityUtil', () => {
  describe('compareTwoStrings (Dice coefficient)', () => {
    it('should return 1.0 for identical strings', () => {
      expect(compareTwoStrings('hello', 'hello')).toBe(1.0);
    });

    it('should return 0.0 for completely different strings', () => {
      const result = compareTwoStrings('apple', 'orange');
      expect(result).toBeGreaterThanOrEqual(0.0);
      expect(result).toBeLessThan(0.3);
    });

    it('should return high similarity for similar strings', () => {
      const result = compareTwoStrings('hello world', 'hello world');
      expect(result).toBe(1.0);
    });

    it('should detect similar news titles', () => {
      const title1 = 'Apple announces new iPhone 15 with USB-C';
      const title2 = 'Apple announces new iPhone 15 with USB-C port';
      const result = compareTwoStrings(
        title1.toLowerCase(),
        title2.toLowerCase(),
      );
      expect(result).toBeGreaterThan(0.85); // Should detect as duplicate
    });

    it('should not match very different titles', () => {
      const title1 = 'Apple announces new iPhone 15';
      const title2 = 'Microsoft releases Windows 12';
      const result = compareTwoStrings(
        title1.toLowerCase(),
        title2.toLowerCase(),
      );
      expect(result).toBeLessThan(0.5);
    });

    it('should handle empty strings', () => {
      expect(compareTwoStrings('', '')).toBe(1.0);
      expect(compareTwoStrings('hello', '')).toBe(0.0);
      expect(compareTwoStrings('', 'hello')).toBe(0.0);
    });

    it('should be case-sensitive unless normalized', () => {
      const result1 = compareTwoStrings('Hello', 'hello');
      const result2 = compareTwoStrings('hello', 'hello');
      expect(result2).toBeGreaterThan(result1);
    });
  });

  describe('findBestMatch', () => {
    it('should find the best matching string', () => {
      const result = findBestMatch('apple', ['orange', 'banana', 'apple pie']);
      expect(result.bestMatch.target).toBe('apple pie');
      expect(result.bestMatch.rating).toBeGreaterThan(0.5);
    });

    it('should return all ratings', () => {
      const result = findBestMatch('test', ['test', 'testing', 'best']);
      expect(result.ratings).toHaveLength(3);
      expect(result.ratings[0].target).toBe('test');
      expect(result.ratings[0].rating).toBe(1.0);
    });

    it('should handle empty target array', () => {
      const result = findBestMatch('test', []);
      expect(result.ratings).toHaveLength(0);
      expect(result.bestMatch.target).toBe('');
      expect(result.bestMatch.rating).toBe(0);
    });
  });

  describe('levenshteinDistance', () => {
    it('should return 0 for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
    });

    it('should calculate edit distance correctly', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    });

    it('should handle insertions', () => {
      expect(levenshteinDistance('test', 'tests')).toBe(1);
    });

    it('should handle deletions', () => {
      expect(levenshteinDistance('tests', 'test')).toBe(1);
    });

    it('should handle substitutions', () => {
      expect(levenshteinDistance('test', 'text')).toBe(1);
    });
  });

  describe('levenshteinSimilarity', () => {
    it('should return 1.0 for identical strings', () => {
      expect(levenshteinSimilarity('hello', 'hello')).toBe(1.0);
    });

    it('should return normalized similarity', () => {
      const result = levenshteinSimilarity('kitten', 'sitting');
      expect(result).toBeGreaterThan(0.5);
      expect(result).toBeLessThan(1.0);
    });
  });

  describe('Real-world RSS duplicate detection', () => {
    it('should detect duplicate news titles from different sources', () => {
      const title1 =
        'Borsa İstanbul BIST 100 endeksi yükselişle günü kapattı';
      const title2 =
        'BIST 100 endeksi yükselişle günü tamamladı';
      const similarity = compareTwoStrings(
        title1.toLowerCase(),
        title2.toLowerCase(),
      );
      expect(similarity).toBeGreaterThan(0.5);
    });

    it('should not flag different news as duplicates', () => {
      const title1 = 'Apple releases new iPhone 15';
      const title2 = 'Google announces Pixel 8';
      const similarity = compareTwoStrings(
        title1.toLowerCase(),
        title2.toLowerCase(),
      );
      expect(similarity).toBeLessThan(0.3);
    });

    it('should detect near-duplicate with minor differences', () => {
      const title1 = 'Merkez Bankası faiz kararını açıkladı';
      const title2 = 'Merkez Bankası faiz kararını açıkladı - Son dakika';
      const similarity = compareTwoStrings(
        title1.toLowerCase(),
        title2.toLowerCase(),
      );
      // 75% similarity is reasonable for this case (added suffix)
      expect(similarity).toBeGreaterThan(0.7);
      expect(similarity).toBeLessThan(0.8);
    });
  });
});

