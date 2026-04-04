import { useCallback } from 'react';
import type { CalculatorAction, Operator, CalculatorState } from '../types/calculator';
import { ARABIC_ROWS, ROMAN_ROW_1, ROMAN_ROW_2, OPERATORS } from '../constants/calculator';

interface KeypadProps {
  state: CalculatorState;
  dispatch: React.Dispatch<CalculatorAction>;
  lastPressed: string | null;
  setLastPressed: (key: string | null) => void;
}

type BtnVariant = 'num' | 'op' | 'action' | 'clear' | 'equals';

function btnClass(variant: BtnVariant, active = false): string {
  const baseClass = `calc-btn-base calc-btn-${variant}`;
  return active ? `${baseClass} calc-btn-active` : baseClass;
}

export function Keypad({ state, dispatch, lastPressed, setLastPressed }: KeypadProps) {
  const { mode, pendingOperator, isAwaitingNextInput } = state;

  // Wraps dispatch to handle the visual "flash" feedback for physical and virtual clicks
  const send = useCallback((action: CalculatorAction, key: string) => {
    dispatch(action);
    setLastPressed(key);
    setTimeout(() => setLastPressed(null), 120);
  }, [dispatch, setLastPressed]);

  const isActive = (key: string) => lastPressed === key;

  return (
    <section className="calc-keypad" aria-label="Keypad">
      <div className="calc-keypad__row calc-keypad__row--2col">
        <button 
          type="button" 
          onClick={() => send({ type: 'CLEAR' }, 'AC')} 
          className={btnClass('clear', isActive('AC'))}
        >
          AC
        </button>
        <button 
          type="button" 
          onClick={() => send({ type: 'BACKSPACE' }, 'Back')} 
          className={btnClass('action', isActive('Back'))}
        >
          Back
        </button>
      </div>

      <div className="calc-keypad__row calc-keypad__row--4col">
        {OPERATORS.map((op: Operator) => (
          <button
            key={op}
            type="button"
            onClick={() => send({ type: 'SET_OPERATOR', payload: op }, op)}
            className={btnClass('op', (pendingOperator === op && isAwaitingNextInput) || isActive(op))}
          >
            {op}
          </button>
        ))}
      </div>

      {mode === 'arabic' ? (
        <div className="calc-keypad__digits">
          {ARABIC_ROWS.map((row, i) => (
            <div key={i} className="calc-keypad__row calc-keypad__row--3col">
              {row.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => send({ type: 'INPUT_CHAR', payload: d }, d)}
                  className={btnClass('num', isActive(d))}
                >
                  {d}
                </button>
              ))}
            </div>
          ))}
          <div className="calc-keypad__row calc-keypad__row--2col">
            <button type="button" onClick={() => send({ type: 'INPUT_CHAR', payload: '0' }, '0')} className={btnClass('num', isActive('0'))}>0</button>
            <button type="button" onClick={() => send({ type: 'INPUT_CHAR', payload: '.' }, '.')} className={btnClass('num', isActive('.'))}>.</button>
          </div>
        </div>
      ) : (
        <div className="calc-keypad__digits">
          {/* Roman layout split into two rows for better tap targets on mobile */}
          <div className="calc-keypad__row calc-keypad__row--4col">
            {ROMAN_ROW_1.map(k => (
              <button
                key={k}
                type="button"
                onClick={() => send({ type: 'INPUT_CHAR', payload: k }, k)}
                className={`${btnClass('num', isActive(k))} font-mono`}
              >
                {k}
              </button>
            ))}
          </div>
          <div className="calc-keypad__row calc-keypad__row--3col">
            {ROMAN_ROW_2.map(k => (
              <button
                key={k}
                type="button"
                onClick={() => send({ type: 'INPUT_CHAR', payload: k }, k)}
                className={`${btnClass('num', isActive(k))} font-mono`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => send({ type: 'CALCULATE' }, '=')}
        className={`w-full ${btnClass('equals', isActive('='))}`}
      >
        =
      </button>
    </section>
  );
}