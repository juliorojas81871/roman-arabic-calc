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

function calculatorReducer(state: CalculatorState, action: CalculatorAction): CalculatorState {
  switch (action.type) {
    case 'INPUT_CHAR': {
        const newChar = action.payload.replace(/([IVXLCDM])_/i, (_, p1) => `${p1.toUpperCase()}\u0304`);

        if (state.isAwaitingNextInput) {
            return { ...state, currentInput: newChar, isAwaitingNextInput: false, errorMessage: '' };
        }
        return { ...state, currentInput: state.currentInput + newChar, errorMessage: '' };
    }

    case 'SET_OPERATOR': {
        const currentNumericValue = state.mode === 'arabic'
            ? parseInt(state.currentInput, 10)
            : fromRoman(state.currentInput);

        if (!currentNumericValue && currentNumericValue !== 0) return { ...state, pendingOperator: action.payload };

        if (state.storedValue !== null && state.pendingOperator && !state.isAwaitingNextInput) {
            const result = calculateResult(state.storedValue, currentNumericValue, state.pendingOperator);
            if (typeof result === 'string') return { ...state, errorMessage: result };

        if (state.mode === 'roman' && (result > MAX_ROMAN || result < 1)) {
            return {
                ...state,
                storedValue: result as number,
                currentInput: '',
                pendingOperator: action.payload,
                isAwaitingNextInput: true,
                errorMessage: 'LIMIT REACHED',
            };
        }

        return {
            ...state,
            storedValue: result as number,
            currentInput: state.mode === 'arabic' ? String(result) : toRoman(result as number),
            pendingOperator: action.payload,
            isAwaitingNextInput: true,
        };
      }

      return {
        ...state,
        storedValue: currentNumericValue,
        pendingOperator: action.payload,
        isAwaitingNextInput: true,
      };
    }

    case 'CALCULATE': {
        if (state.storedValue === null || state.pendingOperator === null) return state;

        const currentNumericValue = state.mode === 'arabic'
            ? parseInt(state.currentInput, 10)
            : fromRoman(state.currentInput);

        if (!currentNumericValue && currentNumericValue !== 0) return state;

        const result = calculateResult(state.storedValue, currentNumericValue, state.pendingOperator);

        if (typeof result === 'string') {
            return { ...state, errorMessage: result };
        }

        if (state.mode === 'roman' && (result > MAX_ROMAN || result < 1)) {
            return {
            ...state,
            currentInput: '',
            storedValue: result as number,
            pendingOperator: null,
            isAwaitingNextInput: true,
            errorMessage: 'LIMIT REACHED',
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
        const nextInput = state.currentInput.replace(/.\u0304?$/, '');
        return { ...state, currentInput: nextInput, errorMessage: '' };
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