import type { CalculatorState } from '../types/calculator';
import { toRoman, fromRoman } from '../utils/romanConverter';

interface DisplayProps {
  state: CalculatorState;
}

function getSecondaryValue(state: CalculatorState): string | null {
  if (state.mode === 'arabic') return null;
  const { currentInput, errorMessage } = state;

  // Preserve the numeric input during overflow so users see the value causing the error
  if (errorMessage === 'Value Too High') return currentInput;
  if (!currentInput) return '_';

  const numeric = fromRoman(currentInput);
  return numeric == null ? '—' : String(numeric);
}

export function Display({ state }: DisplayProps) {
  const { currentInput, storedValue, pendingOperator, errorMessage, mode } = state;
  const isValueTooHigh = errorMessage === 'Value Too High';
  const hasInlineError = errorMessage !== '' && !isValueTooHigh;
  const secondary = getSecondaryValue(state);

  return (
    <section className="calc-display" aria-label="Display">
      {/* Visual hint for chained operations (e.g., "X +") */}
      {storedValue !== null && pendingOperator && (
        <div className="calc-display__hint">
          {mode === 'arabic' ? storedValue : (toRoman(storedValue) || storedValue)} {pendingOperator}
        </div>
      )}

      <div className="calc-display__primary">
        {isValueTooHigh ? (
          <span className="calc-display__primary--error-high">Value Too High</span>
        ) : (
          <span aria-live="polite">
            {currentInput || <span aria-hidden="true">_</span>}
            {!currentInput && <span className="sr-only">Empty</span>}
          </span>
        )}
      </div>

      {secondary !== null && (
        <div className={`calc-display__secondary ${isValueTooHigh ? 'calc-display__secondary--error' : 'calc-display__secondary--normal'}`}>
          {secondary}
        </div>
      )}

      <div className="calc-display__error-bar" role="alert">
        {isValueTooHigh && (
          <span className="calc-display__error-bar--red">
            Result exceeds 3,999,999 — Press AC
          </span>
        )}
        {hasInlineError && (
          <span className="calc-display__error-bar--amber">{errorMessage}</span>
        )}
      </div>
    </section>
  );
}