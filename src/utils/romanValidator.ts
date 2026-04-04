import { ROMAN_VALUES } from './romanConstants';

const VALID_SUBTRACTIVES = new Set(['IV', 'IX', 'XL', 'XC', 'CD', 'CM']);
const UNIQUE_NUMERALS = new Set(['V', 'L', 'D']);
const FIVE_OF: Readonly<Record<string, string>> = { I: 'V', X: 'L', C: 'D' };

// Validates token sequence (e.g. catches IXI which passes char-by-char checks but is illegal)
function hasNonIncreasingTokens(s: string): boolean {
  const upper = s.toUpperCase();
  const values: number[] = [];
  let i = 0;

  while (i < upper.length) {
    const pair = upper[i] + (upper[i + 1] ?? '');
    if (VALID_SUBTRACTIVES.has(pair)) {
      values.push(ROMAN_VALUES[upper[i + 1]]);
      i += 2;
    } else {
      values.push(ROMAN_VALUES[upper[i]] ?? 0);
      i++;
    }
  }
  return values.every((val, j) => j === 0 || val <= values[j - 1]);
}

export function getRomanInputError(current: string, addChar: string): string | null {
  const base = current.toUpperCase();
  const ch = addChar.toUpperCase();
  const val = (c: string) => ROMAN_VALUES[c] ?? 0;
  const len = base.length;
  const [p1, p2, p3] = [base[len - 1], base[len - 2], base[len - 3]];

  if (UNIQUE_NUMERALS.has(ch) && base.includes(ch)) return `${ch} cannot be repeated`;
  if (!UNIQUE_NUMERALS.has(ch) && p1 === ch && p2 === ch && p3 === ch) {
    return `${ch} cannot repeat more than 3 times`;
  }

  if (p1 && val(ch) > val(p1)) {
    if (!VALID_SUBTRACTIVES.has(p1 + ch)) return `${p1 + ch} is an invalid pair`;
    if (p2 === p1) return `Double subtraction (${p2}${p1}${ch}) is illegal`;
  }

  if (ch in FIVE_OF && p1 === ch && p2 === FIVE_OF[ch]) return `${p2}${p1}${ch} is a middle-five violation`;

  if (p1 && p2 && VALID_SUBTRACTIVES.has(p2 + p1) && val(ch) >= val(p2)) {
    return `Invalid sequence after subtractive pair: ${p2}${p1}${ch}`;
  }

  return hasNonIncreasingTokens(base + ch) ? null : `${ch} breaks descending order`;
}