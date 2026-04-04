import { useEffect, useState, useCallback } from 'react';
import { useCalculator } from '../hooks/useCalculator';
import { Display } from './Display';
import { Keypad } from './Keypad';
import { KEY_TO_OPERATOR } from '../constants/calculator';

export default function RomanCalculator() {
  const { state, dispatch } = useCalculator();
  const [lastPressed, setLastPressed] = useState<string | null>(null);

  const flash = useCallback((key: string) => {
    setLastPressed(key);
    setTimeout(() => setLastPressed(null), 120);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Allow native browser shortcuts (Cmd+R, Cmd+C, etc.) to pass through
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const { key } = e;

      if (state.mode === 'arabic' && /^[0-9.]$/.test(key)) {
        e.preventDefault();
        dispatch({ type: 'INPUT_CHAR', payload: key });
        flash(key);
        return;
      }

      if (state.mode === 'roman' && /^[IVXLCDMivxlcdm]$/.test(key)) {
        e.preventDefault();
        const upper = key.toUpperCase();
        dispatch({ type: 'INPUT_CHAR', payload: upper });
        flash(upper);
        return;
      }

      const op = KEY_TO_OPERATOR[key];
      if (op) {
        e.preventDefault();
        dispatch({ type: 'SET_OPERATOR', payload: op });
        flash(op);
        return;
      }

      // Map keyboard keys to internal keypad labels for the flash effect
      const actionMap: Record<string, { type: 'CALCULATE' | 'BACKSPACE' | 'CLEAR'; flash: string }> = {
        '=':         { type: 'CALCULATE', flash: '=' },
        'Enter':     { type: 'CALCULATE', flash: '=' },
        'Backspace': { type: 'BACKSPACE', flash: 'Back' },
        'Escape':    { type: 'CLEAR', flash: 'AC' },
        'Delete':    { type: 'CLEAR', flash: 'AC' },
      };

      if (key in actionMap) {
        e.preventDefault();
        const action = actionMap[key];
        dispatch({ type: action.type });
        flash(action.flash);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.mode, dispatch, flash]);

  return (
    <main className="calc-shell" aria-label="Roman numeral calculator">
      <article className={`calc-card ${state.mode === 'roman' ? 'calc-card--roman' : ''}`} role="application">
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
        <Keypad
          state={state}
          dispatch={dispatch}
          lastPressed={lastPressed}
          setLastPressed={setLastPressed}
        />
      </article>
    </main>
  );
}