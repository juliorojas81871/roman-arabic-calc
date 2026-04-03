import type { CalculatorAction, Operator, CalculatorState } from '../types/calculator';
import { ARABIC_ROWS, ROMAN_ROW_1, ROMAN_ROW_2, OPERATORS } from '../constants/calculator';

interface KeypadProps {
  state: CalculatorState;
  dispatch: React.Dispatch<CalculatorAction>;
}

type BtnVariant = 'num' | 'op' | 'action' | 'clear' | 'equals';

function btnClass(variant: BtnVariant, active = false): string {
  if (active) return 'calc-btn-base calc-btn-active';
  return `calc-btn-base calc-btn-${variant}`;
}

export function Keypad({ state, dispatch }: KeypadProps) {
  const { mode, pendingOperator, isAwaitingNextInput } = state;

  const send = (action: CalculatorAction) => dispatch(action);

  return (
    <section className="calc-keypad" aria-label="Keypad">
      <div className="calc-keypad__row calc-keypad__row--2col">
        <button type="button" onClick={() => send({ type: 'CLEAR' })} className={btnClass('clear')}>AC</button>
        <button type="button" onClick={() => send({ type: 'BACKSPACE' })} className={btnClass('action')}>Back</button>
      </div>

      <div className="calc-keypad__row calc-keypad__row--4col">
        {OPERATORS.map((op: Operator) => (
          <button
            key={op}
            type="button"
            onClick={() => send({ type: 'SET_OPERATOR', payload: op })}
            className={btnClass('op', pendingOperator === op && isAwaitingNextInput)}
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
                <button key={d} type="button" onClick={() => send({ type: 'INPUT_CHAR', payload: d })} className={btnClass('num')}>{d}</button>
              ))}
            </div>
          ))}
          <button type="button" onClick={() => send({ type: 'INPUT_CHAR', payload: '0' })} className={`w-full ${btnClass('num')}`}>0</button>
        </div>
      ) : (
        <div className="calc-keypad__digits">
          <div className="calc-keypad__row calc-keypad__row--4col">
            {ROMAN_ROW_1.map(k => (
              <button key={k} type="button" onClick={() => send({ type: 'INPUT_CHAR', payload: k })} className={`${btnClass('num')} font-mono`}>{k}</button>
            ))}
          </div>
          <div className="calc-keypad__row calc-keypad__row--3col">
            {ROMAN_ROW_2.map(k => (
              <button key={k} type="button" onClick={() => send({ type: 'INPUT_CHAR', payload: k })} className={`${btnClass('num')} font-mono`}>{k}</button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => send({ type: 'CALCULATE' })}
        className={`w-full ${btnClass('equals')}`}
      >
        =
      </button>
    </section>
  );
}