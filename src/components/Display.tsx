import { twMerge } from 'tailwind-merge';
import type { CalcState } from '../hooks/useCalculator';
import { toRoman, fromRoman } from '../utils/romanConverter';

interface DisplayProps {
  state: CalcState;
}

function getConvertedLabel(state: CalcState): string | null {
  if (state.activeMode === 'arabic') return null;

  const { input, error } = state;

  if (error === 'Value Too High') return input;

  if (!input) return '_';

  const numeric = fromRoman(input);

  return numeric == null ? '—' : String(numeric);
}

export function Display({ state }: DisplayProps) {
  const { input, savedValue, operation, error, activeMode } = state;
  const isOverflow = error === 'Value Too High';
  const isGenericError = error !== '' && !isOverflow;
  const secondaryDisplay = getConvertedLabel(state);

  return (
    <section
      className="bg-gray-800 px-4 py-4 pb-2 min-h-36 flex flex-col justify-end border-b border-gray-700"
      aria-label="Display"
    >
      {savedValue !== null && operation && (
        <div className="text-right text-xs font-mono text-gray-400 mb-1">
          {activeMode === 'arabic' ? savedValue : (toRoman(savedValue) || savedValue)} {operation}
        </div>
      )}

      <div className={twMerge(
        'text-right font-mono font-bold tracking-wide break-all text-white',
        activeMode === 'arabic' ? 'text-3xl' : 'text-4xl'
      )}>
        {isOverflow ? (
          <span className="text-red-400 text-3xl">Value Too High</span>
        ) : (
          <span aria-live="polite">
            {input || <span aria-hidden="true">_</span>}
            {!input && <span className="sr-only">Empty</span>}
          </span>
        )}
      </div>

      {secondaryDisplay !== null && (
        <div className={twMerge(
          'text-right font-mono text-lg tracking-wide mt-1',
          isOverflow ? 'text-red-400' : 'text-emerald-300'
        )}>
          {secondaryDisplay}
        </div>
      )}

      <div
        className="mt-2 min-h-5 text-center text-[0.625rem] font-bold uppercase tracking-wide border-t border-gray-700 pt-1"
        role="alert"
      >
        {isOverflow && <span className="text-red-400">Result exceeds 3,999,999 — Press AC</span>}
        {isGenericError && <span className="text-yellow-300">{error}</span>}
      </div>
    </section>
  );
}