import { useCalculator } from '../hooks/useCalculator';
import { Display } from './Display';
import { Keypad } from './Keypad';

export default function RomanCalculator() {
  const { state, dispatch } = useCalculator();

  return (
    <main className="min-h-svh bg-[#F9FAFB] flex items-center justify-center p-4 text-gray-900">
      <article className="w-full max-w-96 bg-white overflow-hidden border border-gray-300">

        <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-200">
          <h1 className="text-xs font-bold tracking-widest uppercase text-gray-400">
            {state.activeMode} Calculator
          </h1>
          <button
            type="button"
            onClick={() => dispatch({ type: 'TOGGLE_MODE' })}
            className="text-xs px-3 py-1 border border-gray-400 text-gray-600 bg-transparent cursor-pointer hover:bg-gray-100 transition-colors"
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