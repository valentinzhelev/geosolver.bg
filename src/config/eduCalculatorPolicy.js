export const CALCULATOR_POLICIES = ['off', 'guided', 'full'];

export const DEFAULT_CALCULATOR_POLICY = 'guided';

export function normalizeCalculatorPolicy(value) {
  if (CALCULATOR_POLICIES.includes(value)) return value;
  return DEFAULT_CALCULATOR_POLICY;
}

export function allowsCalculatorAccess(policy) {
  const p = normalizeCalculatorPolicy(policy);
  return p === 'guided' || p === 'full';
}

export function allowsSaveToAssignment(policy) {
  return allowsCalculatorAccess(policy);
}

export function getCalculatorPolicyMeta(policy, bg = true) {
  const p = normalizeCalculatorPolicy(policy);
  const map = {
    off: {
      labelBg: 'Без калкулатор',
      labelEn: 'No calculator',
      studentHintBg:
        'Решете на тетрадка или както преподавателят е указал. Въведете крайните стойности в полетата за предаване.',
      studentHintEn: 'Solve on paper as instructed. Enter final values in the submit form.',
      teacherHintBg: 'Учениците виждат условието и предават отговори — без „Отвори в калкулатора“.',
      teacherHintEn: 'Students see the problem and submit answers — no “Open in calculator”.',
    },
    guided: {
      labelBg: 'Помощник (препоръчително)',
      labelEn: 'Guided helper',
      studentHintBg:
        'Калкулаторът попълва дадените стойности. Изчисленията за това задание не влизат в лимита 5/5.',
      studentHintEn:
        'The calculator pre-fills given values. Calculations for this assignment do not count toward the 5/5 free limit.',
      teacherHintBg: 'Домашно с цифров помощник — не брои consumer лимита на ученика.',
      teacherHintEn: 'Homework with digital helper — does not use the student’s consumer limit.',
    },
    full: {
      labelBg: 'Пълен калкулатор',
      labelEn: 'Full calculator',
      studentHintBg:
        'Пълен достъп до инструмента в контекста на заданието. Предайте отговорите след проверка.',
      studentHintEn: 'Full tool access in assignment context. Submit after you verify your answers.',
      teacherHintBg: 'Упражнение/подготовка — калкулатор разрешен в рамките на заданието.',
      teacherHintEn: 'Practice — calculator allowed within the assignment.',
    },
  };
  const row = map[p];
  return {
    policy: p,
    label: bg ? row.labelBg : row.labelEn,
    studentHint: bg ? row.studentHintBg : row.studentHintEn,
    teacherHint: bg ? row.teacherHintBg : row.teacherHintEn,
  };
}

export const CALCULATOR_POLICY_OPTIONS = [
  { value: 'off', labelBg: 'Само предаване (без калкулатор)', labelEn: 'Submit only (no calculator)' },
  { value: 'guided', labelBg: 'Помощник (препоръчително за домашно)', labelEn: 'Guided helper (recommended)' },
  { value: 'full', labelBg: 'Пълен калкулатор в заданието', labelEn: 'Full calculator in assignment' },
];
