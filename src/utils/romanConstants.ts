export const MAX_ROMAN_LIMIT = 3999999;

export const ROMAN_MAP = [
  ['M̄', 1000000], ['C̄M̄', 900000], ['D̄', 500000], ['C̄D̄', 400000],
  ['C̄', 100000], ['X̄C̄', 90000], ['L̄', 50000], ['X̄L̄', 40000], ['X̄', 10000],
  ['MX̄', 9000], ['V̄', 5000], ['MV̄', 4000], ['M', 1000], ['CM', 900], ['D', 500],
  ['CD', 400], ['C', 100], ['XC', 90], ['L', 50], ['XL', 40], ['X', 10],
  ['IX', 9], ['V', 5], ['IV', 4], ['I', 1],
] as const satisfies [string, number][];

export type RomanCharacters = typeof ROMAN_MAP[number][0];

export const ROMAN_VALUES: Record<string, number> = {
  I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000
};