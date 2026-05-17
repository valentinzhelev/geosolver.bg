import { EDU_TOOLS, toolKeyFromTemplate } from '../config/eduTools';

export function getToolForSubmission(submission) {
  const template = submission?.assignment?.taskTemplate;
  const toolKey = toolKeyFromTemplate(template);
  return EDU_TOOLS.find((t) => t.toolKey === toolKey) || null;
}

export function getAnswerEntries(answers, tool, bg) {
  if (!answers || typeof answers !== 'object') return [];
  if (tool?.answerKeys?.length) {
    return tool.answerKeys.map((f) => ({
      key: f.key,
      label: bg ? f.labelBg : f.labelEn,
      value: answers[f.key],
    }));
  }
  return Object.entries(answers).map(([key, value]) => ({
    key,
    label: key,
    value,
  }));
}

export function formatAnswerValue(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'number') return Number.isInteger(value) ? String(value) : value.toFixed(3);
  return String(value);
}

export function getComparisonRows(submission) {
  const details = submission?.rawComparison?.details;
  if (!Array.isArray(details) || details.length === 0) return [];
  return details;
}
