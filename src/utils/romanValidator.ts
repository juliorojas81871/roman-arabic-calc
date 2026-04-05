import { ROMAN_VALUES } from './romanConstants';

const validSubtractivePairs = new Set(['IV', 'IX', 'XL', 'XC', 'CD', 'CM']);
const singleUseSymbols = new Set(['V', 'L', 'D']);

export function getRomanInputError(currentInput: string, nextCharacter: string): string | null {
  const baseText = currentInput.toUpperCase();
  const newChar = nextCharacter.toUpperCase();
  const getNumericValue = (char: string) => ROMAN_VALUES[char] ?? 0;

  const lastChar = baseText.at(-1);
  const secondLastChar = baseText.at(-2);
  const thirdLastChar = baseText.at(-3);

  if (singleUseSymbols.has(newChar) && baseText.includes(newChar))
    return `${newChar} cannot be repeated`;

  if (!singleUseSymbols.has(newChar) && lastChar === newChar && secondLastChar === newChar && thirdLastChar === newChar)
    return `${newChar} cannot repeat more than 3 times`;

  if (lastChar && getNumericValue(newChar) > getNumericValue(lastChar)) {
    if (!validSubtractivePairs.has(lastChar + newChar)){
      return `${newChar} breaks descending order`;
    }

    if (secondLastChar === lastChar){
      return `Double subtraction (${secondLastChar}${lastChar}${newChar}) is illegal`;
    }
  }

  if (lastChar && secondLastChar && validSubtractivePairs.has(secondLastChar + lastChar) && getNumericValue(newChar) >= getNumericValue(secondLastChar)){
    return `Invalid sequence after subtractive pair: ${secondLastChar}${lastChar}${newChar}`;
  }

  return null;
}