import { useCalculator } from '../hooks/useCalculator';
import { Display } from './Display';
import { Keypad } from './Keypad';

export default function RomanCalculator() {
  const { state, dispatch } = useCalculator();

  return (
    <main className="min-h-svh bg-gray-950 flex items-center justify-center p-4 text-white">
      <article className="w-full max-w-96 bg-gray-900 rounded-2xl border border-gray-700 overflow-hidden">
        <header className="bg-gray-800 px-4 py-3 flex items-center justify-between">
          <h1 className="text-xs font-bold tracking-widest uppercase text-yellow-500">
            {state.activeMode} Calculator
          </h1>
          <button
            type="button"
            onClick={() => dispatch({ type: 'TOGGLE_MODE' })}
            className="text-xs px-3 py-1 rounded-full border border-yellow-500 text-yellow-500 bg-transparent cursor-pointer hover:bg-yellow-500 hover:text-gray-900"
            aria-label={`Switch to ${state.activeMode === 'arabic' ? 'Roman' : 'Arabic'} mode`}
          >
            {state.activeMode === 'arabic' ? 'Roman Mode' : 'Arabic Mode'}
          </button>
        </header>

        <Display state={state} />
        <Keypad state={state} dispatch={dispatch} />
      </article>
    </main>
  );
}