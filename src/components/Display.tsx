import type { CalculatorState } from '../types/calculator';
import { toRoman, fromRoman } from '../utils/romanConverter';

interface DisplayProps { state: CalculatorState; }

function getSecondaryValue(state: CalculatorState): string | null {
  if (state.mode === 'arabic') return null;
  const { currentInput, errorMessage } = state;

  // Show the numeric result even if it's an overflow so the user sees the 'why'
  if (errorMessage === 'Value Too High') return currentInput;
  if (!currentInput) return '0';

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
      {/* Show previous operand during chained ops (e.g. "X +") */}
      {storedValue !== null && pendingOperator && (
        <div className="calc-display__hint">
          {mode === 'arabic' ? storedValue : (toRoman(storedValue) || storedValue)} {pendingOperator}
        </div>
      )}

      <div className="calc-display__primary">
        {isValueTooHigh ? (
          <span className="calc-display__primary--error-high">Value Too High</span>
        ) : (
          <span>{currentInput || (mode === 'arabic' ? '0' : '_')}</span>
        )}
      </div>

      {secondary !== null && (
        <div className={`calc-display__secondary ${isValueTooHigh ? 'calc-display__secondary--error' : ''}`}>
          {secondary}
        </div>
      )}

      <div className="calc-display__error-bar" role="alert">
        {isValueTooHigh && (
          <span className="calc-display__error-bar--red">
            Result exceeds MMMCMXCIX — Press AC
          </span>
        )}
        {hasInlineError && (
          <span className="calc-display__error-bar--amber">{errorMessage}</span>
        )}
      </div>
    </section>
  );
}