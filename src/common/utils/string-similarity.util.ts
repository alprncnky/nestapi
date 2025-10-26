/**
 * String Similarity Utility
 * 
 * Implements Sørensen-Dice coefficient for string similarity comparison
 * Returns a value between 0 (completely different) and 1 (identical)
 * 
 * This is a simple, fast algorithm suitable for comparing short strings
 * like article titles, names, etc.
 * 
 * Alternative to deprecated 'string-similarity' package
 */

/**
 * Calculate similarity between two strings using Sørensen-Dice coefficient
 * 
 * @param str1 - First string to compare
 * @param str2 - Second string to compare
 * @returns Similarity score from 0 to 1
 * 
 * @example
 * compareTwoStrings('hello world', 'hello world') // 1.0
 * compareTwoStrings('hello world', 'hello there') // 0.5
 * compareTwoStrings('apple', 'orange') // 0.0
 */
export function compareTwoStrings(str1: string, str2: string): number {
  // Handle edge cases
  if (str1 === str2) return 1.0;
  if (str1.length < 2 || str2.length < 2) return 0.0;

  // Create bigrams (pairs of adjacent characters)
  const bigrams1 = getBigrams(str1);
  const bigrams2 = getBigrams(str2);

  // Count matches
  let matches = 0;
  const bigrams2Copy = new Set(bigrams2);

  for (const bigram of bigrams1) {
    if (bigrams2Copy.has(bigram)) {
      matches++;
      bigrams2Copy.delete(bigram); // Avoid counting duplicates
    }
  }

  // Calculate Dice coefficient: (2 * matches) / (bigrams1 + bigrams2)
  return (2.0 * matches) / (bigrams1.length + bigrams2.length);
}

/**
 * Extract bigrams (pairs of adjacent characters) from a string
 * 
 * @param str - Input string
 * @returns Array of bigrams
 * 
 * @example
 * getBigrams('hello') // ['he', 'el', 'll', 'lo']
 */
function getBigrams(str: string): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < str.length - 1; i++) {
    bigrams.push(str.substring(i, i + 2));
  }
  return bigrams;
}

/**
 * Find the best match for a string in an array of target strings
 * 
 * @param mainString - String to match
 * @param targetStrings - Array of strings to compare against
 * @returns Object with ratings and best match
 * 
 * @example
 * findBestMatch('hello', ['hello', 'helo', 'world'])
 * // { ratings: [...], bestMatch: { target: 'hello', rating: 1.0 } }
 */
export function findBestMatch(
  mainString: string,
  targetStrings: string[],
): {
  ratings: Array<{ target: string; rating: number }>;
  bestMatch: { target: string; rating: number };
} {
  if (!targetStrings || targetStrings.length === 0) {
    return {
      ratings: [],
      bestMatch: { target: '', rating: 0 },
    };
  }

  const ratings = targetStrings.map((target) => ({
    target,
    rating: compareTwoStrings(mainString, target),
  }));

  const bestMatch = ratings.reduce((best, current) =>
    current.rating > best.rating ? current : best,
  );

  return { ratings, bestMatch };
}

/**
 * Calculate Levenshtein distance (alternative algorithm)
 * Returns the number of edits required to transform str1 into str2
 * 
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Edit distance (lower is more similar)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;

  // Create matrix
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  // Initialize first row and column
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity based on Levenshtein distance
 * Normalized to 0-1 range
 * 
 * @param str1 - First string
 * @param str2 - Second string
 * @returns Similarity score from 0 to 1
 */
export function levenshteinSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  
  if (maxLength === 0) return 1.0;
  
  return 1 - distance / maxLength;
}

