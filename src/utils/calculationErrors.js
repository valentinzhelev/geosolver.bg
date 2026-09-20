import { validationMessage } from './authoritativeResult';

/**
 * One consistent user-facing shape for calculation failures (QA-06).
 *
 * EXPECTED failures become a professional inline message and never an uncaught exception:
 *  - local domain/input validation (the domain calculators throw plain Error / ResectionError with a Bulgarian message);
 *  - structured backend validation (HTTP 400 with a code, see classifySaveError).
 * PROGRAMMING errors (TypeError, ReferenceError, RangeError, SyntaxError, ...) are NOT expected: they are re-thrown so
 * they stay observable to developers instead of being disguised as a user message.
 */

const PROGRAMMING_ERRORS = [TypeError, ReferenceError, RangeError, SyntaxError, EvalError, URIError];

export function isExpectedCalculationError(err) {
  if (!err || typeof err !== 'object') return false;
  if (PROGRAMMING_ERRORS.some((Kind) => err instanceof Kind)) return false;
  return err instanceof Error;
}

const TEXT = {
  bg: {
    title: 'Изчислението не може да бъде извършено',
    hint: 'Проверете входните данни и опитайте отново.',
    generic: 'Входните данни не са валидни.',
  },
  en: {
    title: 'The calculation cannot be performed',
    hint: 'Check the input data and try again.',
    generic: 'The input data is not valid.',
  },
};

/**
 * @param {Error} err
 * @param {'bg'|'en'} language
 * @param {'local'|'server'} source  where the rejection came from
 * @returns {{title: string, message: string, hint: string, code: string|null, source: string}}
 */
export function toCalculationFailure(err, language = 'bg', source = 'local') {
  const t = TEXT[language === 'bg' ? 'bg' : 'en'];
  const message = source === 'server' ? validationMessage(err, language) : (err && err.message) || t.generic;
  return {
    title: t.title,
    message,
    hint: t.hint,
    code: (err && err.code) || null, // kept for developers; never the main message
    source,
  };
}

/** The failure as text for the calculator's existing result area (replaces any previous result). */
export function failureResultText(failure) {
  return `${failure.title}\n\n${failure.message}\n\n${failure.hint}`;
}
