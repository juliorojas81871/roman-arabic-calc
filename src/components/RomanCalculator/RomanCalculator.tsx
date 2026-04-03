// RomanCalculator.tsx
import { useEffect } from 'react';
import type { Operator } from './types.ts';
import { useCalculator } from './useCalculator.ts';
import { fromRoman, fromRomanRaw, toRoman } from '../../utils/romanConverter.ts';

const ARABIC_ROWS = [['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3']];
// Split into two rows so all 7 buttons fill their grids evenly:
const ROMAN_ROW1 = ['I', 'V', 'X', 'L'];
const ROMAN_ROW2 = ['C', 'D', 'M'];
const OPERATORS: Operator[] = ['+', '−', '×', '÷'];

export default function RomanCalculator() {
  const { state, dispatch } = useCalculator();

  const isInputBlocked = state.errorMessage === 'Input Too High';
  const isValueTooHigh = state.errorMessage === 'Value Too High';
  const hasOtherError = state.errorMessage !== '' && !isInputBlocked && !isValueTooHigh;

  // ── Keyboard support ──────────────────────────────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const key = e.key;

      if (state.mode === 'arabic' && /^[0-9]$/.test(key)) {
        e.preventDefault();
        dispatch({ type: 'INPUT_CHAR', payload: key });
      } else if (state.mode === 'roman' && /^[IVXLCDMivxlcdm]$/.test(key)) {
        e.preventDefault();
        dispatch({ type: 'INPUT_CHAR', payload: key.toUpperCase() });
      } else if (key === '+') {
        e.preventDefault();
        dispatch({ type: 'SET_OPERATOR', payload: '+' });
      } else if (key === '-') {
        e.preventDefault();
        dispatch({ type: 'SET_OPERATOR', payload: '−' });
      } else if (key === '*') {
        e.preventDefault();
        dispatch({ type: 'SET_OPERATOR', payload: '×' });
      } else if (key === '/') {
        e.preventDefault();
        dispatch({ type: 'SET_OPERATOR', payload: '÷' });
      } else if (key === '=' || key === 'Enter') {
        e.preventDefault();
        dispatch({ type: 'CALCULATE' });
      } else if (key === 'Backspace') {
        e.preventDefault();
        dispatch({ type: 'BACKSPACE' });
      } else if (key === 'Escape' || key === 'Delete') {
        e.preventDefault();
        dispatch({ type: 'CLEAR' });
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.mode, dispatch]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getSecondaryValue = (): string | null => {
    // Arabic mode: never show a Roman secondary value
    if (state.mode === 'arabic') return null;

    if (isValueTooHigh) return state.currentInput;
    if (isInputBlocked) return String(fromRomanRaw(state.currentInput) ?? '?');
    if (!state.currentInput) return '0';

    const numeric = fromRoman(state.currentInput);
    if (numeric == null || isNaN(numeric)) return '—';
    return String(numeric);
  };

  const secondary = getSecondaryValue();

  const getBtnClass = (
    active: boolean,
    type: 'num' | 'op' | 'action' | 'clear' | 'equals' = 'num',
    disabled = false
  ) => {
    if (disabled) return 'calc-btn-base opacity-30 cursor-not-allowed';
    if (active) return 'calc-btn-base calc-btn-active';
    return `calc-btn-base calc-btn-${type}`;
  };

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4 font-sans text-white">
      <article className="w-full max-w-sm bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">

        <header className="bg-gray-800 px-4 py-3 flex items-center justify-between">
          <h1 className="text-sm font-bold tracking-widest text-yellow-400 uppercase">
            {state.mode} Calculator
          </h1>
          <button
            type="button"
            onClick={() => dispatch({ type: 'TOGGLE_MODE' })}
            className="text-xs px-3 py-1 rounded-full border border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-gray-900 transition-colors"
          >
            {state.mode === 'arabic' ? 'Roman Mode' : 'Arabic Mode'}
          </button>
        </header>

        <section className="bg-gray-950 px-5 pt-4 pb-3 min-h-28 flex flex-col justify-end">

          {/* Stored value + pending operator hint */}
          {state.storedValue !== null && state.pendingOperator && (
            <div className="text-right text-xs text-gray-500 font-mono mb-1">
              {state.mode === 'arabic'
                ? state.storedValue
                : toRoman(state.storedValue) || state.storedValue
              } {state.pendingOperator}
            </div>
          )}

          {/* Primary display */}
          <div className="text-right font-mono tracking-wider">
            {isValueTooHigh ? (
              <span className="text-3xl font-bold tracking-widest text-red-500">
                Value Too High
              </span>
            ) : isInputBlocked ? (
              <span className="text-4xl break-all text-red-400">
                {state.currentInput}
              </span>
            ) : (
              <span className="text-4xl break-all">
                {state.currentInput || (state.mode === 'arabic' ? '0' : '_')}
              </span>
            )}
          </div>

          {/* Secondary (converted) value — only shown in Roman mode */}
          {secondary !== null && (
            <div className="text-right font-mono mt-1">
              <span className={`text-lg tracking-widest ${
                isInputBlocked || isValueTooHigh ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {secondary}
              </span>
            </div>
          )}

          {/* Error message bar */}
          <div className="mt-2 min-h-[1.25rem] text-center text-[10px] font-bold uppercase tracking-tighter border-t border-gray-800 pt-1">
            {isInputBlocked && (
              <span className="text-red-400">Exceeds MMMCMXCIX — press ⌫ to fix</span>
            )}
            {isValueTooHigh && (
              <span className="text-red-400">Result exceeds MMMCMXCIX — press AC</span>
            )}
            {hasOtherError && (
              <span className="text-amber-400">{state.errorMessage}</span>
            )}
          </div>

        </section>

        <section className="px-4 pb-4 space-y-1.5">
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => dispatch({ type: 'CLEAR' })}
              className={`col-span-2 ${getBtnClass(false, 'clear')}`}
            >
              AC
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: 'BACKSPACE' })}
              className={`col-span-2 ${getBtnClass(false, 'action')}`}
            >
              ⌫ Back
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {OPERATORS.map(op => (
              <button
                key={op}
                type="button"
                disabled={isInputBlocked}
                onClick={() => dispatch({ type: 'SET_OPERATOR', payload: op })}
                className={getBtnClass(
                  state.pendingOperator === op && state.isAwaitingNextInput,
                  'op',
                  isInputBlocked
                )}
              >
                {op}
              </button>
            ))}
          </div>

          {state.mode === 'arabic' ? (
            <div className="space-y-1.5">
              {ARABIC_ROWS.map((row, i) => (
                <div key={i} className="grid grid-cols-3 gap-2">
                  {row.map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => dispatch({ type: 'INPUT_CHAR', payload: num })}
                      className={getBtnClass(false, 'num')}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              ))}
              <button
                type="button"
                onClick={() => dispatch({ type: 'INPUT_CHAR', payload: '0' })}
                className={`w-full ${getBtnClass(false, 'num')}`}
              >
                0
              </button>
            </div>
          ) : (
            <div className="space-y-1.5">
              {/* Row 1: I V X L — 4 columns */}
              <div className="grid grid-cols-4 gap-2">
                {ROMAN_ROW1.map(k => (
                  <button
                    key={k}
                    type="button"
                    disabled={isInputBlocked}
                    onClick={() => dispatch({ type: 'INPUT_CHAR', payload: k })}
                    className={`${getBtnClass(false, 'num', isInputBlocked)} font-mono`}
                  >
                    {k}
                  </button>
                ))}
              </div>
              {/* Row 2: C D M — 3 columns to make them equal width */}
              <div className="grid grid-cols-3 gap-2">
                {ROMAN_ROW2.map(k => (
                  <button
                    key={k}
                    type="button"
                    disabled={isInputBlocked}
                    onClick={() => dispatch({ type: 'INPUT_CHAR', payload: k })}
                    className={`${getBtnClass(false, 'num', isInputBlocked)} font-mono`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            disabled={isInputBlocked}
            onClick={() => dispatch({ type: 'CALCULATE' })}
            className={`w-full ${getBtnClass(false, 'equals', isInputBlocked)}`}
          >
            =
          </button>
        </section>
      </article>
    </main>
  );
}