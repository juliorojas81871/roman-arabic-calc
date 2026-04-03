import { useEffect } from 'react';
import { useCalculator } from '../hooks/useCalculator';
import { Display } from './Display';
import { Keypad } from './Keypad';
import { KEY_TO_OPERATOR } from '../constants/calculator';

export default function RomanCalculator() {
  const { state, dispatch } = useCalculator();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if modifier keys are held (allow refresh, copy/paste, etc.)
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const { key } = e;

      // Mode-specific digit/numeral capture
      if (state.mode === 'arabic' && /^[0-9]$/.test(key)) {
        e.preventDefault();
        dispatch({ type: 'INPUT_CHAR', payload: key });
        return;
      }

      if (state.mode === 'roman' && /^[IVXLCDMivxlcdm]$/.test(key)) {
        e.preventDefault();
        dispatch({ type: 'INPUT_CHAR', payload: key.toUpperCase() });
        return;
      }

      const op = KEY_TO_OPERATOR[key];
      if (op) {
        e.preventDefault();
        dispatch({ type: 'SET_OPERATOR', payload: op });
        return;
      }

      // Quick-mapped terminal actions
      const actionMap: Record<string, () => void> = {
        '=':         () => dispatch({ type: 'CALCULATE' }),
        'Enter':     () => dispatch({ type: 'CALCULATE' }),
        'Backspace': () => dispatch({ type: 'BACKSPACE' }),
        'Escape':    () => dispatch({ type: 'CLEAR' }),
        'Delete':    () => dispatch({ type: 'CLEAR' }),
      };

      if (key in actionMap) {
        e.preventDefault();
        actionMap[key]();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.mode, dispatch]);

  return (
    <main className="calc-shell" aria-label="Roman numeral calculator">
      <article className="calc-card" role="application">
        <header className="calc-header">
          <h1 className="calc-header__title">
            {state.mode} Calculator
          </h1>
          <button
            type="button"
            onClick={() => dispatch({ type: 'TOGGLE_MODE' })}
            className="calc-header__toggle"
            aria-label={`Switch to ${state.mode === 'arabic' ? 'Roman' : 'Arabic'} mode`}
          >
            {state.mode === 'arabic' ? 'Roman Mode' : 'Arabic Mode'}
          </button>
        </header>

        <Display state={state} />
        <Keypad state={state} dispatch={dispatch} />
      </article>
    </main>
  );
}