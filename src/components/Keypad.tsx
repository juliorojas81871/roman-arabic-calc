import { twMerge } from 'tailwind-merge';
import type { CalcState } from '../hooks/useCalculator';

interface KeypadProps {
  state: CalcState;
  dispatch: React.Dispatch<{ type: string; payload?: string }>;
}

type ButtonType = 'number' | 'operator' | 'action' | 'clear' | 'equals';

const buttonThemes: Record<ButtonType, string> = {
  number: 'bg-gray-800 text-white hover:bg-gray-700',
  operator: 'bg-amber-700 text-gray-900 text-xl hover:bg-amber-600',
  clear: 'bg-red-700 text-white hover:bg-red-600',
  action: 'bg-gray-600 text-white hover:bg-gray-500',
  equals: 'bg-yellow-500 text-gray-900 text-xl hover:bg-yellow-400',
};

function getButtonClass(type: ButtonType): string {
  return twMerge(
    'rounded-xl font-semibold text-lg leading-none py-3 border-none cursor-pointer select-none flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed',
    buttonThemes[type]
  );
}

export function Keypad({ state, dispatch }: KeypadProps) {
  const { activeMode } = state;

  return (
    <section className="p-4 flex flex-col gap-1.5" aria-label="Calculator Keypad">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => dispatch({ type: 'CLEAR' })}
          className={getButtonClass('clear')}
        >
          AC
        </button>
        <button
          type="button"
          onClick={() => dispatch({ type: 'BACKSPACE' })}
          className={getButtonClass('action')}
        >
          Back
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {['+', '-', '*', '/'].map((symbol) => (
          <button
            key={symbol}
            type="button"
            onClick={() => dispatch({ type: 'SET_OPERATOR', payload: symbol })}
            className={getButtonClass('operator')}
          >
            {symbol}
          </button>
        ))}
      </div>

      {activeMode === 'arabic' ? (
        <div className="mt-1.5 flex flex-col gap-1.5">
          {[['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3']].map((row, i) => (
            <div key={i} className="grid grid-cols-3 gap-2">
              {row.map(digit => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => dispatch({ type: 'INPUT_CHAR', payload: digit })}
                  className={getButtonClass('number')}
                >
                  {digit}
                </button>
              ))}
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'INPUT_CHAR', payload: '0' })} 
              className={getButtonClass('number')}
            >
              0
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: 'INPUT_CHAR', payload: '.' })} 
              className={getButtonClass('number')}
            >
              .
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-1.5 flex flex-col gap-1.5">
          <div className="grid grid-cols-4 gap-2">
            {['I', 'V', 'X', 'L'].map(roman => (
              <button
                key={roman}
                type="button"
                onClick={() => dispatch({ type: 'INPUT_CHAR', payload: roman })}
                className={twMerge(getButtonClass('number'), 'font-mono')}
              >
                {roman}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {['C', 'D', 'M'].map(roman => (
              <button
                key={roman}
                type="button"
                onClick={() => dispatch({ type: 'INPUT_CHAR', payload: roman })}
                className={twMerge(getButtonClass('number'), 'font-mono')}
              >
                {roman}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => dispatch({ type: 'CALCULATE' })}
        className={twMerge('w-full mt-2', getButtonClass('equals'))}
      >
        =
      </button>
    </section>
  );
}