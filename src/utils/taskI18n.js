import { translations } from '../translations';

const PLACEHOLDER_TEXTS = [
  translations.bg.defaultResultText,
  translations.en.defaultResultText,
  translations.bg.secondTaskDefaultResultText,
  translations.en.secondTaskDefaultResultText,
  translations.bg.resectionDefaultResultText,
  translations.en.resectionDefaultResultText,
];

export function isTaskPlaceholderResult(text) {
  return !text || PLACEHOLDER_TEXTS.includes(text);
}
