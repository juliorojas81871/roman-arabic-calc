import { useReducer } from 'react';
import type { CalculatorState, CalculatorAction, Operator } from '../types/calculator';
import { fromRoman, toRoman, MAX_ROMAN } from '../utils/romanConverter';
import { getRomanInputError } from '../utils/romanValidator';

const initialState: CalculatorState = {
  mode: 'arabic',
  currentInput: '',
  storedValue: null,
  pendingOperator: null,
  isAwaitingNextInput: false,
  errorMessage: '',
};

function applyOperator(a: number, b: number, op: Operator, mode: string): number | string {
  const ops: Record<Operator, () => number | string> = {
    '+': () => a + b,
    '−': () => a - b,
    '×': () => a * b,
    '÷': () => {
      if (b === 0) return 'Division by zero is not allowed.';
      // Only enforce whole-number division in Roman mode
      if (mode === 'roman' && !Number.isInteger(a / b)) return 'Roman numerals require whole numbers.';
      return a / b;
    },
  };
  return ops[op]?.() ?? b;
}

const isOutOfRange = (val: number, mode: string) =>
  mode === 'roman' && (val > MAX_ROMAN || val < 1);

function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  // Use parseFloat so decimal results survive chained operations
  const parseInput = () =>
    state.mode === 'arabic'
      ? parseFloat(state.currentInput)
      : (fromRoman(state.currentInput) ?? NaN);

  switch (action.type) {
    case 'INPUT_CHAR': {
      const base = state.isAwaitingNextInput ? '' : state.currentInput;

      if (state.mode === 'roman') {
        const err = getRomanInputError(base, action.payload);
        // If validator finds an issue, update message but don't add the char
        if (err) return { ...state, errorMessage: err };
      }

      // Handle decimal point logic for Arabic mode
      if (state.mode === 'arabic' && action.payload === '.') {
        if (base.includes('.')) return { ...state, errorMessage: 'Only one decimal point allowed' };
        return { ...state, currentInput: (base || '0') + '.', isAwaitingNextInput: false, errorMessage: '' };
      }

      // Cap decimal places at 3 and warn the user
      if (state.mode === 'arabic' && base.includes('.')) {
        const decimalPlaces = base.split('.')[1].length;
        if (decimalPlaces >= 3) return { ...state, errorMessage: 'Max 3 decimal places' };
      }

      return { ...state, currentInput: base + action.payload, isAwaitingNextInput: false, errorMessage: '' };
    }

    case 'SET_OPERATOR': {
      const val = parseInput();
      if (isNaN(val)) return { ...state, pendingOperator: action.payload };

      if (state.storedValue !== null && state.pendingOperator && !state.isAwaitingNextInput) {
        const res = applyOperator(state.storedValue, val, state.pendingOperator, state.mode);
        if (typeof res === 'string') return { ...state, errorMessage: res };
        if (isOutOfRange(res, state.mode)) {
          return {
            ...state,
            currentInput: String(res),
            storedValue: null,
            pendingOperator: null,
            isAwaitingNextInput: true,
            errorMessage: 'Value Too High',
          };
        }
        return {
          ...state,
          storedValue: res,
          currentInput: '',
          pendingOperator: action.payload,
          isAwaitingNextInput: true,
        };
      }

      return {
        ...state,
        storedValue: val,
        currentInput: '',
        pendingOperator: action.payload,
        isAwaitingNextInput: true,
        errorMessage: '',
      };
    }

    case 'CALCULATE': {
      if (state.storedValue === null || state.pendingOperator === null) return state;
      const val = parseInput();
      if (isNaN(val)) return state;

      const res = applyOperator(state.storedValue, val, state.pendingOperator, state.mode);
      if (typeof res === 'string') return { ...state, errorMessage: res };

      if (isOutOfRange(res, state.mode)) {
        return {
          ...state,
          currentInput: String(res),
          storedValue: null,
          pendingOperator: null,
          isAwaitingNextInput: true,
          errorMessage: 'Value Too High',
        };
      }

      // Round Arabic results to 3 decimal places to avoid floating-point noise (e.g. 0.1 + 0.2 = 0.300 not 0.30000000004)
      const rounded = state.mode === 'arabic'
        ? String(parseFloat((res as number).toFixed(3)))
        : toRoman(res as number);

      return {
        ...state,
        currentInput: rounded,
        storedValue: null,
        pendingOperator: null,
        isAwaitingNextInput: true,
      };
    }

    case 'CLEAR':
      return { ...initialState, mode: state.mode };

    case 'BACKSPACE':
      // Backspace is a no-op when awaiting a fresh operand
      return state.isAwaitingNextInput
        ? state
        : { ...state, currentInput: state.currentInput.slice(0, -1), errorMessage: '' };

    case 'TOGGLE_MODE':
      return { ...initialState, mode: state.mode === 'arabic' ? 'roman' : 'arabic' };

    default:
      return state;
  }
}

export function useCalculator() {
  const [state, dispatch] = useReducer(calculatorReducer, initialState);
  return { state, dispatch } as const;
}