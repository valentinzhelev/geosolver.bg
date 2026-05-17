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
  },
];

export function getEduTool(toolKey) {
  return EDU_TOOLS.find((t) => t.toolKey === toolKey);
}

export function toolKeyFromTemplate(template) {
  const tag = template?.tags?.find((t) => t.startsWith('tool:'));
  if (tag) return tag.replace('tool:', '');
  return template?.paramsSchema?.toolKey || null;
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
