export const MAX_ROMAN = 3999999;

// A clean, deterministic map for generating Roman numerals
const ROMAN_MAP: [string, number][] = [
  ['M̄', 1000000], ['C̄M̄', 900000], ['D̄', 500000], ['C̄D̄', 400000],
  ['C̄', 100000], ['X̄C̄', 90000], ['L̄', 50000], ['X̄L̄', 40000],
  ['X̄', 10000], ['MX̄', 9000], ['V̄', 5000], ['MV̄', 4000],
  ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
  ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
  ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1],
];

export function toRoman(num: number): string {
  if (!Number.isInteger(num) || num < 1 || num > MAX_ROMAN) return '';
  let result = '';
  let remainder = num;

  for (const [symbol, value] of ROMAN_MAP) {
    while (remainder >= value) {
      result += symbol;
      remainder -= value;
    }
  }
  return result;
}

export function fromRoman(input: string): number | null {
  if (!input.trim()) return null;
  const sanitizedInput = input.toUpperCase();
  let index = 0;
  let total = 0;

  while (index < sanitizedInput.length) {
    let matchFound = false;
    for (const [symbol, value] of ROMAN_MAP) {
      if (sanitizedInput.startsWith(symbol, index)) {
        total += value;
        index += symbol.length;
        matchFound = true;
        break;
      }
    }
    if (!matchFound) return null;
  }

  if (total < 1 || total > MAX_ROMAN) return null;
  return total;
}