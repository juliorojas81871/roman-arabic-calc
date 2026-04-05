import { ROMAN_MAP, MAX_ROMAN_LIMIT } from './romanConstants';

export function toRoman(numberToConvert: number): string {
  if (!Number.isInteger(numberToConvert) || numberToConvert < 1 || numberToConvert > MAX_ROMAN_LIMIT) {
    return '';
  }

  let finalRomanString = '';
  let leftoverValue = numberToConvert;

  for (const [romanSymbol, numericValue] of ROMAN_MAP) {
    while (leftoverValue >= numericValue) {
      finalRomanString += romanSymbol;
      leftoverValue -= numericValue;
    }
  }

  return finalRomanString;
}

export function fromRoman(romanInput: string): number | null {
  if (!romanInput.trim()) return null;

  const uppercaseInput = romanInput.toUpperCase();
  let currentIndex = 0;
  let calculatedTotal = 0;

  while (currentIndex < uppercaseInput.length) {
    let foundMatch = false;

    for (const [romanSymbol, numericValue] of ROMAN_MAP) {
      if (uppercaseInput.startsWith(romanSymbol, currentIndex)) {
        calculatedTotal += numericValue;
        currentIndex += romanSymbol.length;
        foundMatch = true;
        break;
      }
    }

    if (!foundMatch) return null;
  }

  if (calculatedTotal < 1 || calculatedTotal > MAX_ROMAN_LIMIT) {
    return null;
  }

  return calculatedTotal;
}