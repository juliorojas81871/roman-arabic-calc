import { twMerge } from 'tailwind-merge';
import type { CalcState, CalcAction } from '../hooks/useCalculator';

interface KeypadProps {
  state: CalcState;
  dispatch: React.Dispatch<CalcAction>;
}

type ButtonType = 'number' | 'operator' | 'action' | 'clear' | 'equals';

const buttonThemes: Record<ButtonType, string> = {
  number: 'bg-gray-50 text-gray-800 border border-gray-200 hover:bg-gray-100',
  operator: 'bg-[#A7F3D0] text-gray-800 hover:bg-emerald-200',
  clear: 'bg-[#FCA5A5] text-white hover:bg-red-300',
  action: 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200',
  equals: 'bg-[#4F46E5] text-white hover:bg-indigo-500',
};

function getButtonClass(type: ButtonType): string {
  return twMerge(
    'font-semibold text-lg leading-none py-3 cursor-pointer select-none flex items-center justify-center transition-colors',
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
          className={getButtonClass('clear')}>
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
        {['+', '-', '*', '/'].map(symbol => (
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
              className={getButtonClass('number')}>
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