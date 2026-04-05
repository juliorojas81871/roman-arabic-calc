import { useReducer } from 'react';
import { fromRoman, toRoman } from '../utils/romanConverter';
import { getRomanInputError } from '../utils/romanValidator';
import { MAX_ROMAN_LIMIT } from '../utils/romanConstants';

const startState = {
  activeMode: 'arabic' as 'arabic' | 'roman',
  input: '',
  savedValue: null as number | null,
  operation: null as string | null,
  waitingForNext: false,
  error: '',
};

export type CalcState = typeof startState;

export type CalcAction =
  | { type: 'INPUT_CHAR'; payload: string }
  | { type: 'SET_OPERATOR'; payload: string }
  | { type: 'CALCULATE' | 'CLEAR' | 'BACKSPACE' | 'TOGGLE_MODE' };

function solve(a: number, b: number, op: string, mode: string): number | string {
  const calculations: Record<string, () => number | string> = {
    '+': () => a + b,
    '-': () => a - b,
    '*': () => a * b,
    '/': () => {
      if (b === 0) return 'Cannot divide by zero';

      if (mode === 'roman' && !Number.isInteger(a / b)) return 'Roman numerals require whole numbers.';

      return a / b;
    },
  };
  return calculations[op]?.() ?? b;
}

const checkBounds = (val: number, mode: string) =>
  mode === 'roman' && (val > MAX_ROMAN_LIMIT || val < 1);

function calcReducer(state: CalcState, action: CalcAction): CalcState {
  const getNumericValue = () =>
    state.activeMode === 'arabic'
      ? parseFloat(state.input)
      : (fromRoman(state.input) ?? NaN);

  switch (action.type) {
    case 'INPUT_CHAR': {
      const char = action.payload;
      const current = state.waitingForNext ? '' : state.input;

      if (state.activeMode === 'roman') {
        const romanError = getRomanInputError(current, char);
        if (romanError) return { ...state, error: romanError };
      }

      if (state.activeMode === 'arabic' && char === '.') {
        if (current.includes('.')) return { ...state, error: 'Only one decimal point allowed' };
        return { ...state, input: (current || '0') + '.', waitingForNext: false, error: '' };
      }

      if (state.activeMode === 'arabic' && current.includes('.')) {
        if (current.split('.')[1].length >= 3) return { ...state, error: 'Max 3 decimal places' };
      }

      return { ...state, input: current + char, waitingForNext: false, error: '' };
    }

    case 'SET_OPERATOR': {
      const val = getNumericValue();
      const nextOp = action.payload;
      if (isNaN(val)) return { ...state, operation: nextOp };

      if (state.savedValue !== null && state.operation && !state.waitingForNext) {
        const result = solve(state.savedValue, val, state.operation, state.activeMode);
        if (typeof result === 'string') return { ...state, error: result };

        if (checkBounds(result, state.activeMode)) {
          return { ...state, input: String(result), savedValue: null, operation: null, waitingForNext: true, error: 'Value Too High' };
        }

        return { ...state, savedValue: result, input: '', operation: nextOp, waitingForNext: true };
      }

      return { ...state, savedValue: val, input: '', operation: nextOp, waitingForNext: true, error: '' };
    }

    case 'CALCULATE': {
      if (state.savedValue === null || state.operation === null) return state;
      const val = getNumericValue();

      if (isNaN(val)) return state;

      const result = solve(state.savedValue, val, state.operation, state.activeMode);

      if (typeof result === 'string') return { ...state, error: result };

      if (checkBounds(result, state.activeMode)) {
        return { ...state, input: String(result), savedValue: null, operation: null, waitingForNext: true, error: 'Value Too High' };
      }

      const formatted = state.activeMode === 'arabic'
        ? String(parseFloat((result as number).toFixed(3)))
        : toRoman(result as number);

      return { ...state, input: formatted, savedValue: null, operation: null, waitingForNext: true };
    }

    case 'CLEAR':
      return { ...startState, activeMode: state.activeMode };

    case 'BACKSPACE':
      return state.waitingForNext ? state : { ...state, input: state.input.slice(0, -1), error: '' };

    case 'TOGGLE_MODE': {
      const nextMode = state.activeMode === 'arabic' ? 'roman' : 'arabic';

      const isValidTransfer = (v: number | string | null): boolean => {
        if (v === null || v === '') return true;
        const num = typeof v === 'number' ? v : (state.activeMode === 'arabic' ? parseFloat(v) : fromRoman(v));
        if (num === null || isNaN(num)) return true;
        return num > 0 && Number.isInteger(num) && num <= MAX_ROMAN_LIMIT;
      };

      if (nextMode === 'roman') {
        if (state.input && parseFloat(state.input) > MAX_ROMAN_LIMIT) {
          return { ...startState, activeMode: nextMode, error: 'Value too large for Roman numerals' };
        }

        if (!isValidTransfer(state.input) || !isValidTransfer(state.savedValue)) {
          return { ...startState, activeMode: nextMode, error: 'No decimal or negative when transfer' };
        }

        const converted = state.input ? (toRoman(parseFloat(state.input)) || '') : '';
        return { ...state, activeMode: nextMode, input: converted, error: '' };
      }

      const rawNum = parseFloat(state.input);
      const backToDigits = state.input
        ? (isNaN(rawNum) ? String(fromRoman(state.input) ?? '') : String(rawNum))
        : '';

      return { ...state, activeMode: nextMode, input: backToDigits, error: '' };
    }

    default:
      return state;
  }
}

export function useCalculator() {
  const [state, dispatch] = useReducer(calcReducer, startState);
  return { state, dispatch };
}