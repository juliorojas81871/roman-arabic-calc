import React from 'react';
import type { Operator } from './types.ts';
import { useCalculator } from './useCalculator.ts';
import { fromRoman, toRoman, MAX_ROMAN } from '../../utils/romanConverter.ts';

const ARABIC_ROWS = [['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3']];
const ROMAN_BASIC = ['I', 'V', 'X', 'L', 'C', 'D', 'M'];
const ROMAN_HIGH = ['Ī', 'V̄', 'X̄', 'L̄', 'C̄', 'D̄', 'M̄'];
const OPERATORS: Operator[] = ['+', '−', '×', '÷'];

export default function RomanCalculator() {
  const { state, dispatch } = useCalculator();

  const getSecondaryValue = (): string => {
    if (state.errorMessage === 'LIMIT REACHED') {
      return state.mode === 'roman' ? String(state.storedValue) : 'LIMIT REACHED';
    }

    if (!state.currentInput) return state.mode === 'arabic' ? '—' : '0';
    const numeric = state.mode === 'arabic'
      ? parseInt(state.currentInput, 10)
      : fromRoman(state.currentInput);

    if (!numeric || numeric < 1 || numeric > MAX_ROMAN) {
      return state.mode === 'roman' ? String(numeric || 0) : 'LIMIT REACHED';
    }
    return state.mode === 'arabic' ? toRoman(numeric) : String(numeric);
  };

  const getBtnClass = (active: boolean, type: 'num' | 'op' | 'action' | 'clear' | 'equals' = 'num') => {
    if (active) return 'calc-btn-base calc-btn-active';
    return `calc-btn-base calc-btn-${type}`;
  };

  const renderPrimaryDisplay = () => {
    if (state.errorMessage === 'LIMIT REACHED' && state.mode === 'roman') {
      return <span className="text-3xl font-bold tracking-widest text-red-500">LIMIT REACHED</span>;
    }

    if (state.errorMessage && state.mode === 'roman') {
      const numeric = fromRoman(state.currentInput) || state.storedValue;
      return <span className="text-4xl text-red-500">{numeric}</span>;
    }

    return (
      <span className="text-4xl break-all">
        {state.currentInput || (state.mode === 'arabic' ? '0' : '_')}
      </span>
    );
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
          {state.storedValue !== null && state.pendingOperator && (
            <div className="text-right text-xs text-gray-500 font-mono mb-1">
              {state.mode === 'arabic' ? state.storedValue : (state.storedValue > MAX_ROMAN ? state.storedValue : toRoman(state.storedValue))} {state.pendingOperator}
            </div>
          )}
          <div className="text-right font-mono tracking-wider">
            {renderPrimaryDisplay()}
          </div>

          <div className="text-right font-mono mt-1">
            <span className="text-lg text-yellow-400 tracking-widest">
              {getSecondaryValue()}
            </span>
          </div>

          {state.errorMessage && state.errorMessage !== 'LIMIT REACHED' && (
            <div className="mt-2 text-center text-[10px] text-red-400 font-bold uppercase tracking-tighter border-t border-red-900/50 pt-1">
              {state.errorMessage}
            </div>
          )}
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
                onClick={() => dispatch({ type: 'SET_OPERATOR', payload: op })}
                className={getBtnClass(state.pendingOperator === op && state.isAwaitingNextInput, 'op')}
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
              <div className="grid grid-cols-4 gap-2">
                {ROMAN_BASIC.slice(0, 4).map(k => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => dispatch({ type: 'INPUT_CHAR', payload: k })}
                    className={`${getBtnClass(false, 'num')} font-mono`}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ROMAN_BASIC.slice(4).map(k => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => dispatch({ type: 'INPUT_CHAR', payload: k })}
                    className={`${getBtnClass(false, 'num')} font-mono`}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {ROMAN_HIGH.slice(0, 4).map(k => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => dispatch({ type: 'INPUT_CHAR', payload: k })}
                    className={`${getBtnClass(false, 'num')} font-mono`}
                  >
                    {k}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ROMAN_HIGH.slice(4).map(k => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => dispatch({ type: 'INPUT_CHAR', payload: k })}
                    className={`${getBtnClass(false, 'num')} font-mono`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => dispatch({ type: 'CALCULATE' })}
            className={`w-full ${getBtnClass(false, 'equals')}`}
          >
            =
          </button>
        </section>
      </article>
    </main>
  );
}