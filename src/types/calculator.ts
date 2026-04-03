export type CalculatorMode = 'arabic' | 'roman';
export type Operator = '+' | '−' | '×' | '÷';

export interface CalculatorState {
  mode: CalculatorMode;
  currentInput: string;
  storedValue: number | null;
  pendingOperator: Operator | null;
  isAwaitingNextInput: boolean; // Flag to clear display when starting a new operand
  errorMessage: string;
}

export type CalculatorAction =
  | { type: 'INPUT_CHAR'; payload: string }
  | { type: 'SET_OPERATOR'; payload: Operator }
  | { type: 'CALCULATE' }
  | { type: 'CLEAR' }
  | { type: 'BACKSPACE' }
  | { type: 'TOGGLE_MODE' };