import type { Operator } from '../types/calculator';

export const ARABIC_ROWS: string[][] = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
];

// Split to ensure consistent button sizing across different grid densities
export const ROMAN_ROW_1 = ['I', 'V', 'X', 'L'] as const;
export const ROMAN_ROW_2 = ['C', 'D', 'M'] as const;

export const OPERATORS: Operator[] = ['+', '−', '×', '÷'];

export const KEY_TO_OPERATOR: Readonly<Record<string, Operator>> = {
  '+': '+',
  '-': '−',
  '*': '×',
  '/': '÷',
};