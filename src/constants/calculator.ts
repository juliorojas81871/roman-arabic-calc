import type { Operator } from '../types/calculator';
import type { RomanCharacters } from '../utils/romanConstants';

export const ARABIC_ROWS: string[][] = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
];

// Split to ensure consistent button sizing across different grid densities
export const ROMAN_ROW_1: RomanCharacters[] = ['I', 'V', 'X', 'L'];
export const ROMAN_ROW_2: RomanCharacters[] = ['C', 'D', 'M'];

export const OPERATORS: Operator[] = ['+', '−', '×', '÷'];

export const KEY_TO_OPERATOR: Record<string, Operator> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
};