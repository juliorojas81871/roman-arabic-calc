import { ROMAN_MAP } from './romanConstants';

export const MAX_ROMAN = 3999999;

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
  const sanitized = input.toUpperCase();
  let index = 0, total = 0;
  while (index < sanitized.length) {
    let matched = false;
    for (const [symbol, value] of ROMAN_MAP) {
      if (sanitized[index] === symbol) {
        total += value;
        index += symbol.length;
        matched = true;
        break;
      }
    }
    if (!matched) return null;
  }
  return (total < 1 || total > MAX_ROMAN) ? null : total;
}