// useCalculator.ts
import { useReducer } from 'react';
import type { CalculatorState, CalculatorAction, Operator } from './types.ts';
import { fromRoman, toRoman, MAX_ROMAN } from '../../utils/romanConverter.ts';

const initialState: CalculatorState = {
  mode: 'arabic',
  currentInput: '',
  storedValue: null,
  pendingOperator: null,
  isAwaitingNextInput: false,
  errorMessage: '',
};

function calculateResult(a: number, b: number, op: Operator): number | string {
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷':
      if (b === 0) return 'Division by zero is not allowed.';
      if (!Number.isInteger(a / b)) return 'Roman numerals require whole numbers.';
      return a / b;
    default: return b;
  }
}

function isOutOfRange(result: number, mode: string): boolean {
  return mode === 'roman' && (result > MAX_ROMAN || result < 1);
}

const ROMAN_VALUES: Record<string, number> = {
  I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
};
const VALID_SUBTRACTIVES = new Set(['IV', 'IX', 'XL', 'XC', 'CD', 'CM']);
const FIVE_NUMERALS = new Set(['V', 'L', 'D']);
const FIVE_OF: Record<string, string> = { I: 'V', X: 'L', C: 'D' };

function isNonIncreasingTokenSequence(s: string): boolean {
  const u = s.toUpperCase();
  const tokenValues: number[] = [];
  let i = 0;
  while (i < u.length) {
    if (i + 1 < u.length && VALID_SUBTRACTIVES.has(u[i] + u[i + 1])) {
      tokenValues.push(ROMAN_VALUES[u[i + 1]] - ROMAN_VALUES[u[i]]);
      i += 2;
    } else {
      tokenValues.push(ROMAN_VALUES[u[i]] ?? 0);
      i++;
    }
  }
  for (let j = 1; j < tokenValues.length; j++) {
    if (tokenValues[j] > tokenValues[j - 1]) return false;
  }
  return true;
}

function getRomanInputError(current: string, addChar: string): string | null {
  const base = current.toUpperCase();
  const ch = addChar.toUpperCase();
  const v = (c: string) => ROMAN_VALUES[c] ?? 0;

  const len = base.length;
  const p1 = len >= 1 ? base[len - 1] : '';
  const p2 = len >= 2 ? base[len - 2] : '';
  const p3 = len >= 3 ? base[len - 3] : '';

  if (FIVE_NUMERALS.has(ch) && base.includes(ch)) {
    return `${ch} cannot be repeated`;
  }

  if (!FIVE_NUMERALS.has(ch) && p1 === ch && p2 === ch && p3 === ch) {
    return `${ch} cannot repeat more than 3 times in a row`;
  }

  if (p1 && v(ch) > v(p1)) {
    const pair = p1 + ch;
    if (!VALID_SUBTRACTIVES.has(pair)) {
      return `${pair} is not valid — ${p1} cannot precede ${ch}`;
    }
    if (p2 === p1) {
      return `${p2}${p1}${ch} — double subtraction is not allowed`;
    }
  }

  if (ch in FIVE_OF && p1 === ch && p2 === FIVE_OF[ch]) {
    return `${p2}${p1}${ch} — middle-five is not valid`;
  }

  if (p1 && p2 && VALID_SUBTRACTIVES.has(p2 + p1)) {
    if (v(ch) >= v(p2)) {
      return `${p2}${p1}${ch} — cannot follow ${p2}${p1} with ${ch}`;
    }
  }

  if (!isNonIncreasingTokenSequence(base + ch)) {
    return `${ch} breaks descending order`;
  }

  return null;
}

function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'INPUT_CHAR': {
      const base = state.isAwaitingNextInput ? '' : state.currentInput;
      const newInput = base + action.payload;

      if (state.mode === 'roman') {
        const validationError = getRomanInputError(base, action.payload);
        if (validationError) {
          return { ...state, errorMessage: validationError };
        }
      }

      return {
        ...state,
        currentInput: newInput,
        isAwaitingNextInput: false,
        errorMessage: '',
      };
    }

    case 'SET_OPERATOR': {
      const currentNumericValue = state.mode === 'arabic'
        ? parseInt(state.currentInput, 10)
        : fromRoman(state.currentInput);

      if (currentNumericValue == null || isNaN(currentNumericValue as number)) {
        return { ...state, pendingOperator: action.payload, errorMessage: '' };
      }

      if (state.storedValue !== null && state.pendingOperator && !state.isAwaitingNextInput) {
        const result = calculateResult(state.storedValue, currentNumericValue, state.pendingOperator);
        if (typeof result === 'string') return { ...state, errorMessage: result };

        if (isOutOfRange(result as number, state.mode)) {
          return {
            ...state,
            currentInput: String(result),
            storedValue: null,
            pendingOperator: null,
            isAwaitingNextInput: true,
            errorMessage: 'Value Too High',
          };
        }

        return {
          ...state,
          storedValue: result as number,
          currentInput: state.mode === 'arabic' ? String(result) : toRoman(result as number),
          pendingOperator: action.payload,
          isAwaitingNextInput: true,
          errorMessage: '',
        };
      }

      return {
        ...state,
        storedValue: currentNumericValue,
        pendingOperator: action.payload,
        isAwaitingNextInput: true,
        errorMessage: '',
      };
    }

    case 'CALCULATE': {
      if (state.storedValue === null || state.pendingOperator === null) return state;

      const currentNumericValue = state.mode === 'arabic'
        ? parseInt(state.currentInput, 10)
        : fromRoman(state.currentInput);

      if (currentNumericValue == null || isNaN(currentNumericValue as number)) return state;

      const result = calculateResult(state.storedValue, currentNumericValue, state.pendingOperator);
      if (typeof result === 'string') return { ...state, errorMessage: result };

      if (isOutOfRange(result as number, state.mode)) {
        return {
          ...state,
          currentInput: String(result),
          storedValue: null,
          pendingOperator: null,
          isAwaitingNextInput: true,
          errorMessage: 'Value Too High',
        };
      }

      return {
        ...state,
        currentInput: state.mode === 'arabic' ? String(result) : toRoman(result as number),
        storedValue: null,
        pendingOperator: null,
        isAwaitingNextInput: true,
        errorMessage: '',
      };
    }

    case 'CLEAR':
      return { ...initialState, mode: state.mode };

    case 'BACKSPACE': {
      if (state.isAwaitingNextInput) return state;
      return {
        ...state,
        currentInput: state.currentInput.slice(0, -1),
        errorMessage: '',
      };
    }

    case 'TOGGLE_MODE':
      return { ...initialState, mode: state.mode === 'arabic' ? 'roman' : 'arabic' };

    default:
      return state;
  }
}

export function useCalculator() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  return { state, dispatch };
}