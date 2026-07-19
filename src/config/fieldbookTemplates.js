/**
 * Preset row templates for field books (educational / typical site types).
 */

export const FIELDBOOK_TEMPLATES = {
  coordinate: [
    {
      id: 'trace',
      label: { bg: 'Трасé (полигонометрия)', en: 'Alignment (traverse)' },
      settings: { startY: 5000, startX: 5000, startBearing: 0, closed: false },
      rows: [
        { pointNo: 'TP1', beta: '', distance: '', comment: 'Станция 1' },
        { pointNo: 'TP2', beta: '', distance: '', comment: '' },
        { pointNo: 'TP3', beta: '', distance: '', comment: '' },
        { pointNo: 'TP4', beta: '', distance: '', comment: 'Край' },
      ],
    },
    {
      id: 'building',
      label: { bg: 'Сграда (затворен полигон)', en: 'Building (closed polygon)' },
      settings: { startY: 1000, startX: 1000, startBearing: 0, closed: true },
      rows: [
        { pointNo: '1', beta: '', distance: '', comment: 'Ъгъл 1' },
        { pointNo: '2', beta: '100', distance: '', comment: '' },
        { pointNo: '3', beta: '100', distance: '', comment: '' },
        { pointNo: '4', beta: '100', distance: '', comment: '' },
        { pointNo: '1', beta: '100', distance: '', comment: 'Затваряне' },
      ],
    },
    {
      id: 'control',
      label: { bg: 'Реперна рамка', en: 'Control framework' },
      settings: { startY: 0, startX: 0, startBearing: 0, closed: true },
      rows: [
        { pointNo: 'R1', beta: '', distance: '', isControl: true, comment: 'Репер' },
        { pointNo: 'R2', beta: '', distance: '', isControl: true, comment: 'Репер' },
        { pointNo: 'D1', beta: '', distance: '', comment: 'Детайл' },
        { pointNo: 'R1', beta: '', distance: '', comment: 'Затваряне' },
      ],
    },
  ],
  leveling: [
    {
      id: 'simple',
      label: { bg: 'Прост нивелационен ход', en: 'Simple leveling run' },
      settings: { benchmarkHeight: 100, toleranceMm: 5 },
      rows: [
        { station: 'Репер A', back: '', fore: '', comment: 'Начало' },
        { station: 'TP1', back: '', fore: '', comment: '' },
        { station: 'TP2', back: '', fore: '', comment: '' },
        { station: 'Репер B', back: '', fore: '', comment: 'Край' },
      ],
    },
    {
      id: 'closed',
      label: { bg: 'Затворен нивелационен ход', en: 'Closed leveling loop' },
      settings: { benchmarkHeight: 100, toleranceMm: 5 },
      rows: [
        { station: 'BM1', back: '', fore: '', comment: 'Репер' },
        { station: '1', back: '', fore: '', comment: '' },
        { station: '2', back: '', fore: '', comment: '' },
        { station: 'BM1', back: '', fore: '', comment: 'Обратно на репер' },
      ],
    },
  ],
};

export function getTemplatesForType(type) {
  return FIELDBOOK_TEMPLATES[type] || [];
}
