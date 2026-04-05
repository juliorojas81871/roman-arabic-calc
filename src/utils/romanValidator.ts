import { ROMAN_VALUES } from './romanConstants';

const validSubtractivePairs = new Set(['IV', 'IX', 'XL', 'XC', 'CD', 'CM']);
const singleUseSymbols = new Set(['V', 'L', 'D']);

function isDescendingOrder(romanSequence: string): boolean {
  const uppercaseText = romanSequence.toUpperCase();
  const sequenceValues: number[] = [];
  let currentIndex = 0;

  while (currentIndex < uppercaseText.length) {
    const currentPair = uppercaseText[currentIndex] + (uppercaseText[currentIndex + 1] ?? '');

    if (validSubtractivePairs.has(currentPair)) {
      sequenceValues.push(ROMAN_VALUES[uppercaseText[currentIndex + 1]]);
      currentIndex += 2;
    } else {
      sequenceValues.push(ROMAN_VALUES[uppercaseText[currentIndex]] ?? 0);
      currentIndex += 1;
    }
  }

  return sequenceValues.every((value, index) => index === 0 || value <= sequenceValues[index - 1]);
}

export function getRomanInputError(currentInput: string, nextCharacter: string): string | null {
  const baseText = currentInput.toUpperCase();
  const newChar = nextCharacter.toUpperCase();
  const getNumericValue = (char: string) => ROMAN_VALUES[char] ?? 0;
  const inputLength = baseText.length;
  const [lastChar, secondLastChar, thirdLastChar] = [baseText[inputLength - 1], baseText[inputLength - 2], baseText[inputLength - 3]];

  if (singleUseSymbols.has(newChar) && baseText.includes(newChar)) {
    return `${newChar} cannot be repeated`;
  }

  if (!singleUseSymbols.has(newChar) && lastChar === newChar && secondLastChar === newChar && thirdLastChar === newChar) {
    return `${newChar} cannot repeat more than 3 times`;
  }

  if (lastChar && getNumericValue(newChar) > getNumericValue(lastChar)) {
    if (!validSubtractivePairs.has(lastChar + newChar)) {
      return `${lastChar + newChar} is an invalid pair`;
    }
    if (secondLastChar === lastChar) {
      return `Double subtraction (${secondLastChar}${lastChar}${newChar}) is illegal`;
    }
  }

  if (lastChar && secondLastChar && validSubtractivePairs.has(secondLastChar + lastChar) && getNumericValue(newChar) >= getNumericValue(secondLastChar)) {
    return `Invalid sequence after subtractive pair: ${secondLastChar}${lastChar}${newChar}`;
  }

  if (!isDescendingOrder(baseText + newChar)) {
    return `${newChar} breaks descending order`;
  }

  return null;
}