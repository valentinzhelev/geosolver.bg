/** MVP tools for GeoSolver Edu — aligned with backend toolKey tags */
export const EDU_TOOLS = [
  {
    toolKey: 'first-basic-task',
    route: '/first-task',
    docsRoute: '/first-task/docs',
    icon: '/icons/first_task_icon.svg',
    titleBg: 'Първа основна задача',
    titleEn: 'First Basic Task',
    descBg: 'Координати на втора точка по ъгъл и разстояние.',
    descEn: 'Coordinates of second point from angle and distance.',
    answerKeys: [
      { key: 'x2', labelBg: 'X₂ (м)', labelEn: 'X₂ (m)' },
      { key: 'y2', labelBg: 'Y₂ (м)', labelEn: 'Y₂ (m)' },
    ],
    inputDisplay: [
      { key: 'y1', labelBg: 'Y₁', labelEn: 'Y₁' },
      { key: 'x1', labelBg: 'X₁', labelEn: 'X₁' },
      { key: 'alpha', labelBg: 'α (гради)', labelEn: 'α (gon)' },
      { key: 's', labelBg: 'S (м)', labelEn: 'S (m)' },
    ],
    workflowSteps: [
      { labelBg: 'Прочети даденото', labelEn: 'Read the given data' },
      { labelBg: 'Отвори калкулатора', labelEn: 'Open the calculator' },
      { labelBg: 'Провери междинните стъпки', labelEn: 'Check intermediate steps' },
      { labelBg: 'Предай координатите', labelEn: 'Submit your coordinates' },
    ],
    calculatorSteps: [
      { key: 'inputs', labelBg: 'Въведи Y₁, X₁, α и S', labelEn: 'Enter Y₁, X₁, α and S' },
      { key: 'compute', labelBg: 'Натисни „Изчисли“', labelEn: 'Press Calculate' },
      { key: 'read', labelBg: 'Провери междинните стойности', labelEn: 'Check intermediate values' },
      { key: 'copy', labelBg: 'Прехвърли X₂ и Y₂ в заданието', labelEn: 'Copy X₂ and Y₂ to the assignment' },
    ],
  },
  {
    toolKey: 'second-basic-task',
    route: '/second-task',
    docsRoute: '/second-task/docs',
    icon: '/icons/second_task_icon.svg',
    titleBg: 'Втора основна задача',
    titleEn: 'Second Basic Task',
    descBg: 'Разстояние и посочен ъгъл между две точки.',
    descEn: 'Distance and direction between two points.',
    answerKeys: [
      { key: 'distance', labelBg: 'S (м)', labelEn: 'S (m)' },
      { key: 'alpha', labelBg: 'α (гради)', labelEn: 'α (gon)' },
    ],
    inputDisplay: [
      { key: 'x1', labelBg: 'X₁', labelEn: 'X₁' },
      { key: 'y1', labelBg: 'Y₁', labelEn: 'Y₁' },
      { key: 'x2', labelBg: 'X₂', labelEn: 'X₂' },
      { key: 'y2', labelBg: 'Y₂', labelEn: 'Y₂' },
    ],
    workflowSteps: [
      { labelBg: 'Запиши двете точки', labelEn: 'Note both points' },
      { labelBg: 'Изчисли в калкулатора', labelEn: 'Calculate in the tool' },
      { labelBg: 'Свери S и α', labelEn: 'Verify S and α' },
      { labelBg: 'Предай отговора', labelEn: 'Submit your answer' },
    ],
    calculatorSteps: [
      { key: 'points', labelBg: 'Въведи координатите на двете точки', labelEn: 'Enter both point coordinates' },
      { key: 'compute', labelBg: 'Изчисли S и α', labelEn: 'Calculate S and α' },
      { key: 'units', labelBg: 'Провери единиците (м, гради)', labelEn: 'Check units (m, gon)' },
      { key: 'submit', labelBg: 'Предай S и α', labelEn: 'Submit S and α' },
    ],
  },
  {
    toolKey: 'forward-intersection',
    route: '/forward-intersection',
    docsRoute: '/forward-intersection/docs',
    icon: '/icons/forward_intersection_icon.svg',
    titleBg: 'Права засечка',
    titleEn: 'Forward Intersection',
    descBg: 'Координати на точка P.',
    descEn: 'Coordinates of point P.',
    answerKeys: [
      { key: 'xP', labelBg: 'Xₚ (м)', labelEn: 'Xₚ (m)' },
      { key: 'yP', labelBg: 'Yₚ (м)', labelEn: 'Yₚ (m)' },
    ],
    inputDisplay: [
      { key: 'yA', labelBg: 'Yₐ', labelEn: 'Yₐ' },
      { key: 'xA', labelBg: 'Xₐ', labelEn: 'Xₐ' },
      { key: 'yB', labelBg: 'Yᵦ', labelEn: 'Yᵦ' },
      { key: 'xB', labelBg: 'Xᵦ', labelEn: 'Xᵦ' },
      { key: 'beta1', labelBg: 'β₁', labelEn: 'β₁' },
      { key: 'beta2', labelBg: 'β₂', labelEn: 'β₂' },
    ],
    workflowSteps: [
      { labelBg: 'Постави A и B', labelEn: 'Set points A and B' },
      { labelBg: 'Въведи ъглите β₁, β₂', labelEn: 'Enter angles β₁, β₂' },
      { labelBg: 'Намери P в калкулатора', labelEn: 'Find P in the calculator' },
      { labelBg: 'Предай Xₚ и Yₚ', labelEn: 'Submit Xₚ and Yₚ' },
    ],
    calculatorSteps: [
      { key: 'ab', labelBg: 'Въведи точки A и B', labelEn: 'Enter points A and B' },
      { key: 'angles', labelBg: 'Въведи β₁ и β₂', labelEn: 'Enter β₁ and β₂' },
      { key: 'compute', labelBg: 'Изчисли P', labelEn: 'Calculate P' },
      { key: 'submit', labelBg: 'Предай Xₚ, Yₚ', labelEn: 'Submit Xₚ, Yₚ' },
    ],
  },
  {
    toolKey: 'resection',
    route: '/resection',
    docsRoute: '/resection/docs',
    icon: '/icons/resection_icon.svg',
    titleBg: 'Обратна засечка',
    titleEn: 'Resection',
    descBg: 'Координати на точка P.',
    descEn: 'Coordinates of point P.',
    answerKeys: [
      { key: 'xP', labelBg: 'Xₚ (м)', labelEn: 'Xₚ (m)' },
      { key: 'yP', labelBg: 'Yₚ (м)', labelEn: 'Yₚ (m)' },
    ],
    inputDisplay: [
      { key: 'xA', labelBg: 'Xₐ', labelEn: 'Xₐ' },
      { key: 'yA', labelBg: 'Yₐ', labelEn: 'Yₐ' },
      { key: 'xB', labelBg: 'Xᵦ', labelEn: 'Xᵦ' },
      { key: 'yB', labelBg: 'Yᵦ', labelEn: 'Yᵦ' },
      { key: 'xC', labelBg: 'Xᶜ', labelEn: 'Xᶜ' },
      { key: 'yC', labelBg: 'Yᶜ', labelEn: 'Yᶜ' },
      { key: 'beta1', labelBg: 'β₁', labelEn: 'β₁' },
      { key: 'beta2', labelBg: 'β₂', labelEn: 'β₂' },
    ],
    workflowSteps: [
      { labelBg: 'Маркирай трите точки', labelEn: 'Mark the three points' },
      { labelBg: 'Въведи ъглите от A, B, C', labelEn: 'Enter angles at A, B, C' },
      { labelBg: 'Реши обратната засечка', labelEn: 'Solve resection' },
      { labelBg: 'Предай координатите на P', labelEn: 'Submit P coordinates' },
    ],
    calculatorSteps: [
      { key: 'abc', labelBg: 'Въведи A, B и C', labelEn: 'Enter A, B and C' },
      { key: 'angles', labelBg: 'Въведи ъглите β₁, β₂', labelEn: 'Enter β₁, β₂' },
      { key: 'compute', labelBg: 'Изчисли P', labelEn: 'Calculate P' },
      { key: 'submit', labelBg: 'Предай координатите на P', labelEn: 'Submit P coordinates' },
    ],
  },
];

export function getEduTool(toolKey) {
  return EDU_TOOLS.find((t) => t.toolKey === toolKey);
}

const TEMPLATE_TYPE_TO_TOOL_KEY = {
  'forward-intersection': 'forward-intersection',
  resection: 'resection',
};

export function toolKeyFromTemplate(template) {
  const tag = template?.tags?.find((t) => t.startsWith('tool:'));
  if (tag) return tag.replace('tool:', '');
  if (template?.paramsSchema?.toolKey) return template.paramsSchema.toolKey;
  if (template?.type && TEMPLATE_TYPE_TO_TOOL_KEY[template.type]) {
    return TEMPLATE_TYPE_TO_TOOL_KEY[template.type];
  }
  return null;
}

export function variantIndexForStudent(userId, variantsCount) {
  if (!variantsCount || variantsCount <= 1) return 0;
  let hash = 0;
  const str = String(userId || '0');
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash + str.charCodeAt(i)) % 10000;
  }
  return hash % variantsCount;
}
