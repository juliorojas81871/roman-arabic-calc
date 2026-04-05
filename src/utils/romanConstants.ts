export const MAX_ROMAN_LIMIT = 3999;

export const ROMAN_MAP = [
  ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
  ['C', 100],  ['XC', 90],  ['L', 50],  ['XL', 40],
  ['X', 10],   ['IX', 9],   ['V', 5],   ['IV', 4], ['I', 1]
] as const satisfies [string, number][];

export type RomanCharacters = typeof ROMAN_MAP[number][0];

export const ROMAN_VALUES: Record<string, number> = {
  I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
};