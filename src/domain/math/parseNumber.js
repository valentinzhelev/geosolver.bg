/**
 * Парсва число от низ, поддържа както "." така и "," като десетичен разделител
 * 
 * @param {string|number} input - Входна стойност за парсване
 * @returns {number} Парснатото число
 * @throws {Error} Ако входът не може да бъде парснат като число
 */
export function parseNumber(input) {
  if (typeof input === 'number') {
    if (isNaN(input) || !isFinite(input)) {
      throw new Error('Невалидно число');
    }
    return input;
  }

  if (typeof input !== 'string') {
    throw new Error('Входът трябва да е низ или число');
  }

  const trimmed = input.trim();
  
  if (trimmed === '') {
    throw new Error('Празен низ не може да бъде парснат');
  }

  // Replace comma with dot for parsing
  const normalized = trimmed.replace(',', '.');
  
  const parsed = parseFloat(normalized);
  
  if (isNaN(parsed) || !isFinite(parsed)) {
    throw new Error(`"${input}" не може да бъде парснато като число`);
  }

  return parsed;
}
