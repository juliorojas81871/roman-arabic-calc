import { useState } from 'react';
import { toRoman, fromRoman, MAX_ROMAN } from './romanLogic';

type Op = '+' | '−' | '×' | '÷' | null;
type Mode = 'arabic' | 'roman';

const ROMAN_BASIC  = ['I', 'V', 'X', 'L', 'C', 'D', 'M'];
const ROMAN_HIGH   = ['Ī', 'V̄', 'X̄', 'L̄', 'C̄', 'D̄', 'M̄'];
const ARABIC_ROWS  = [['7','8','9'], ['4','5','6'], ['1','2','3']];
const OPS: Op[]    = ['+', '−', '×', '÷'];

export default function Calculator() {
  const [mode, setMode]           = useState<Mode>('arabic');
  const [display, setDisplay]     = useState('');
  const [stored, setStored]       = useState<number | null>(null);
  const [pendingOp, setPendingOp] = useState<Op>(null);
  const [awaitNext, setAwaitNext] = useState(false);
  const [hasInput, setHasInput]   = useState(false);
  const [error, setError]         = useState('');

  const currentValue = (): number | null => {
    if (!display) return null;
    if (mode === 'arabic') {
      const n = parseInt(display, 10);
      return isNaN(n) ? null : n;
    }
    return fromRoman(display);
  };

  const primary = (): string => {
    if (!hasInput) return mode === 'arabic' ? '0' : '_';
    return display || (mode === 'arabic' ? '0' : '_');
  };

  const secondary = (): string => {
    if (!hasInput) return mode === 'arabic' ? '—' : '0';
    const n = currentValue();
    if (n === null || n < 1 || n > MAX_ROMAN) return mode === 'roman' ? '0' : '—';
    if (mode === 'arabic') return toRoman(n);
    return String(n);
  };

  const compute = (a: number, b: number, op: Op): number | null => {
    switch (op) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': {
        if (b === 0) { setError('Division by zero.'); return null; }
        const q = a / b;
        if (!Number.isInteger(q)) {
          setError(`${a} ÷ ${b} = ${q.toFixed(4)}… — Roman numerals require whole numbers.`);
          return null;
        }
        return q;
      }
      default: return null;
    }
  };

  const handleDigit = (ch: string) => {
    setError('');
    setHasInput(true);
    const base = awaitNext ? '' : display;
    setAwaitNext(false);
    if (mode === 'arabic') {
      const next = base + ch;
      if (/^\d{1,7}$/.test(next) && parseInt(next, 10) <= MAX_ROMAN) setDisplay(next);
    } else {
      setDisplay(base + ch);
    }
  };

  const handleOp = (op: Op) => {
    setError('');
    const val = currentValue();
    if (val === null) return;
    if (stored !== null && pendingOp && !awaitNext) {
      const chained = compute(stored, val, pendingOp);
      if (chained === null) return;
      setStored(chained);
    } else {
      setStored(val);
    }
    setPendingOp(op);
    setAwaitNext(true);
    setDisplay('');
  };

  const handleEquals = () => {
    const val = currentValue();
    if (val === null || stored === null || pendingOp === null) return;
    const result = compute(stored, val, pendingOp);
    if (result === null) return;
    setStored(null);
    setPendingOp(null);
    setAwaitNext(true);
    setHasInput(true);
    if (result < 1 || result > MAX_ROMAN) {
      setError(`Result outside range (1 – ${MAX_ROMAN.toLocaleString()}). Value: ${result}`);
      setDisplay(String(result));
    } else {
      setError('');
      setDisplay(mode === 'arabic' ? String(result) : toRoman(result));
    }
  };

  const handleClear = () => {
    setDisplay(''); setStored(null); setPendingOp(null);
    setAwaitNext(false); setHasInput(false); setError('');
  };

  const handleBack = () => {
    setError('');
    const next = display.slice(0, -1);
    setDisplay(next);
    if (!next) setHasInput(false);
  };

  const toggleMode = () => {
    setMode(m => m === 'arabic' ? 'roman' : 'arabic');
    handleClear();
  };

  const btn  = 'rounded-xl font-semibold transition-all duration-150 select-none cursor-pointer active:scale-95';
  const num  = `${btn} py-4 text-lg bg-gray-800 hover:bg-gray-700 text-white`;
  const opB  = (active: boolean) =>
    `${btn} py-3 text-xl ${active ? 'bg-yellow-300 text-gray-900 scale-95' : 'bg-yellow-600 hover:bg-yellow-500 text-gray-900'}`;

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4 font-sans">
      <style>{`
        /* Firefox Support */
        .custom-scroll {
          scrollbar-width: thin;
          scrollbar-color: #4b5563 #111827;
        }

        /* Webkit (Chrome, Safari, Edge) Support */
        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: #111827; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #eab308; }
      `}</style>

      <article className="w-full max-w-sm bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
        <header className="bg-gray-800 px-4 py-3 flex items-center justify-between">
          <h1 className="text-sm font-bold tracking-widest text-yellow-400 uppercase">Roman / Arabic Calc</h1>
          <button
            type="button"
            onClick={toggleMode}
            aria-label={`Switch to ${mode === 'arabic' ? 'Roman' : 'Arabic'} mode`}
            className="text-xs px-3 py-1 rounded-full border border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-gray-900 transition-colors"
          >
            {mode === 'arabic' ? 'Roman Mode' : 'Arabic Mode'}
          </button>
        </header>

        <section className="bg-gray-950 px-5 pt-5 pb-3 min-h-28 flex flex-col justify-end" aria-live="polite">
          {stored !== null && pendingOp && (
            <div className="text-right text-xs text-gray-500 font-mono mb-1">
              {mode === 'arabic' ? String(stored) : (stored >= 1 && stored <= MAX_ROMAN ? toRoman(stored) : String(stored))} {pendingOp}
            </div>
          )}
          <div className={`text-right font-mono tracking-wider transition-opacity duration-200 ${hasInput ? 'opacity-100' : 'opacity-30'}`}>
            <span className="text-4xl text-white break-all">{primary()}</span>
          </div>
          <div className={`text-right font-mono mt-1 transition-opacity duration-200 ${hasInput ? 'opacity-100' : 'opacity-30'}`}>
            <span className="text-lg text-yellow-400 tracking-widest">{secondary()}</span>
          </div>
          {error && (
            <div role="alert" className="mt-3 rounded-lg bg-red-950 border border-red-700 px-3 py-2 text-xs text-red-300 leading-relaxed">⚠ {error}</div>
          )}
        </section>

        <section className="px-4 pb-5 space-y-2">
          <div className="grid grid-cols-4 gap-2">
            <button type="button" onClick={handleClear} className={`col-span-2 ${btn} py-3 bg-red-700 hover:bg-red-600 text-white`}>AC</button>
            <button type="button" onClick={handleBack} className={`col-span-2 ${btn} py-3 bg-gray-700 hover:bg-gray-600 text-white`}>⌫ Back</button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {OPS.map(op => (<button type="button" key={op} onClick={() => handleOp(op)} className={opB(pendingOp === op)}>{op}</button>))}
          </div>

          {mode === 'arabic' ? (
            <div className="space-y-2">
              {ARABIC_ROWS.map((row, ri) => (
                <div key={ri} className="grid grid-cols-3 gap-2">
                  {row.map(k => (<button type="button" key={k} onClick={() => handleDigit(k)} className={num}>{k}</button>))}
                </div>
              ))}
              <button type="button" onClick={() => handleDigit('0')} className={`w-full ${num}`}>0</button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2">
                {ROMAN_BASIC.slice(0, 4).map(k => (<button type="button" key={k} onClick={() => handleDigit(k)} className={`${num} py-3 font-mono`}>{k}</button>))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ROMAN_BASIC.slice(4).map(k => (<button type="button" key={k} onClick={() => handleDigit(k)} className={`${num} py-3 font-mono`}>{k}</button>))}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {ROMAN_HIGH.slice(0, 4).map(k => (<button type="button" key={k} onClick={() => handleDigit(k)} className={`${num} py-3 font-mono`}>{k}</button>))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ROMAN_HIGH.slice(4).map(k => (<button type="button" key={k} onClick={() => handleDigit(k)} className={`${num} py-3 font-mono`}>{k}</button>))}
              </div>
            </div>
          )}

          <button type="button" onClick={handleEquals} className={`w-full ${btn} py-4 text-xl bg-yellow-500 hover:bg-yellow-400 text-gray-900`}>=</button>
        </section>

        <footer className="px-4 pb-4">
            <details className="text-xs text-gray-400">
            <summary className="cursor-pointer hover:text-gray-200 mb-2 select-none">Numeral reference</summary>
            <div className="max-h-48 overflow-y-auto pr-2 custom-scroll">
                <table className="w-full text-center border-collapse">
                    <thead>
                        <tr className="text-yellow-500 sticky top-0 bg-gray-900 shadow-sm">
                        <th className="py-1">Symbol</th><th>Value</th>
                        <th className="py-1">Symbol</th><th>Value</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono">
                        {[
                            ['I', '1', 'V', '5'],
                            ['X', '10', 'L', '50'],
                            ['C', '100', 'D', '500'],
                            ['M', '1,000', 'V̄', '5,000'],
                            ['X̄', '10,000', 'L̄', '50,000'],
                            ['C̄', '100,000', 'D̄', '500,000'],
                            ['M̄', '1,000,000', '', ''],
                        ].map((row, i) => (
                            <tr key={`base-${i}`} className="border-t border-gray-800">
                            <td className="py-1 text-white">{row[0]}</td>
                            <td>{row[1]}</td>
                            <td className="text-white">{row[2]}</td>
                            <td>{row[3]}</td>
                            </tr>
                        ))}

                        <tr>
                            <td colSpan={4} className="py-2 text-yellow-600 font-sans font-semibold text-left">
                            Subtractive Forms
                            </td>
                        </tr>

                        {[
                            ['IV', '4', 'IX', '9'],
                            ['XL', '40', 'XC', '90'],
                            ['CD', '400', 'CM', '900'],
                            ['MV̄', '4,000', 'MX̄', '9,000'],
                            ['X̄L̄', '40,000', 'X̄C̄', '90,000'],
                            ['C̄D̄', '400,000', 'C̄M̄', '900,000'],
                        ].map((row, i) => (
                            <tr key={`sub-${i}`} className="border-t border-gray-800">
                            <td className="py-1 text-white">{row[0]}</td>
                            <td>{row[1]}</td>
                            <td className="text-white">{row[2]}</td>
                            <td>{row[3]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            </details>
        </footer>
      </article>
    </main>
  );
}