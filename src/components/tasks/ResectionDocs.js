import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import TaskDocsLayout, {
  DocSection,
  DocCallout,
  DocFormulaBlock,
  DocList,
  CalculatorLink,
} from './docs/TaskDocsLayout';
import { RESECTION_DOC_EXAMPLE } from '../../domain/geodesy/resectionExample';

const fmt = (v) => v.toFixed(2);

const ResectionDocs = () => {
  const { language, t } = useTranslation();
  const isBg = language === 'bg';
  const title = t.resection;
  const { controls, station, angles } = RESECTION_DOC_EXAMPLE;

  return (
    <TaskDocsLayout title={title} toolPath="/resection">
      <DocSection title={isBg ? 'Теория' : 'Theory'}>
        <p className="text-lg text-neutral-800 dark:text-neutral-200">
          {isBg
            ? 'Обратната засечка определя координатите на станция P по три известни точки A, B, C и два хоризонтални ъгъла, измерени в P.'
            : 'Resection determines station P from three known points A, B, C and two horizontal angles measured at P.'}
        </p>
        <DocCallout title={isBg ? 'Условие' : 'Problem statement'}>
          {isBg
            ? 'Дадени: координати на A, B, C; насочените ъгли β₁ и β₂ (в гради). Търсят се: Xₚ, Yₚ.'
            : 'Given: coordinates of A, B, C; the directed angles β₁ and β₂ (gon). Find: Xₚ, Yₚ.'}
        </DocCallout>
      </DocSection>

      <DocSection title={isBg ? 'Входове в GeoSolver: насочени ъгли' : 'Inputs in GeoSolver: directed angles'}>
        <DocFormulaBlock
          note={
            isBg
              ? 'Ъглите са НАСОЧЕНИ и се броят ПО ЧАСОВНИКОВАТА СТРЕЛКА в станцията P. Валиден интервал: 0 < β < 400 гради.'
              : 'The angles are DIRECTED and counted CLOCKWISE at station P. Valid range: 0 < β < 400 gon.'
          }
        >
          <span>
            {isBg
              ? 'β₁ — насочен ъгъл по часовниковата стрелка от лъч P→A към лъч P→B'
              : 'β₁ — directed clockwise angle from ray P→A to ray P→B'}
          </span>
          <span>
            {isBg
              ? 'β₂ — насочен ъгъл по часовниковата стрелка от лъч P→B към лъч P→C'
              : 'β₂ — directed clockwise angle from ray P→B to ray P→C'}
          </span>
        </DocFormulaBlock>
        <DocCallout variant="green" title={isBg ? 'β и 400 − β не са едно и също' : 'β and 400 − β are not interchangeable'}>
          {isBg
            ? 'Ъгълът β и допълващият го 400 − β описват различни станции. GeoSolver използва въведения ъгъл точно както е зададен и не подменя ъгъл с допълващия му. Ако сте измерили посоки към A, B и C, β₁ е разликата на посоките (към B минус към A), а β₂ — (към C минус към B), взета по модул 400.'
            : 'An angle β and its complement 400 − β describe different stations. GeoSolver uses the angle exactly as entered and never substitutes its complement. If you observed directions to A, B and C, β₁ is (direction to B − direction to A) and β₂ is (direction to C − direction to B), taken modulo 400.'}
        </DocCallout>
      </DocSection>

      <DocSection title={isBg ? 'Метод' : 'Method'}>
        <p className="text-base text-neutral-800 dark:text-neutral-200">
          {isBg
            ? 'Множеството от точки, от които отсечката AB се вижда под насочен ъгъл β₁, е окръжност; аналогично за BC и β₂. И двете окръжности минават през B, затова P е втората им пресечна точка. Насочена двойка ъгли определя най-много една станция, така че резултатът е еднозначен и не зависи от избор между кандидати. Показват се разстояния до A, B, C и проверка на въведените ъгли.'
            : 'The set of points from which segment AB is seen under the directed angle β₁ is a circle; likewise for BC and β₂. Both circles pass through B, so P is their second intersection. A directed pair of angles determines at most one station, so the result is unambiguous and involves no choice between candidates. Distances to A, B, C and a check of the entered angles are shown.'}
        </p>
      </DocSection>

      <DocSection title={isBg ? 'Проверка в GeoSolver' : 'Verification in GeoSolver'}>
        <DocCallout variant="green" title={isBg ? 'Контрол на ъглите' : 'Angle control'}>
          {isBg
            ? 'След изчисление въведените β₁, β₂ се сравняват с преизчислените от координатите на P. Отклонението над 0,000001 гради се отхвърля като несъгласувани ъгли.'
            : 'After the calculation the entered β₁, β₂ are compared with the values recomputed from P. A deviation above 0.000001 gon is rejected as inconsistent angles.'}
        </DocCallout>
        <CalculatorLink />
      </DocSection>

      <DocSection title={isBg ? 'Пример' : 'Example'}>
        <DocCallout>
          <div className="font-mono text-sm space-y-1">
            <p>Yₐ = {fmt(controls.A.y)}, Xₐ = {fmt(controls.A.x)}</p>
            <p>Yᵦ = {fmt(controls.B.y)}, Xᵦ = {fmt(controls.B.x)}</p>
            <p>Yᶜ = {fmt(controls.C.y)}, Xᶜ = {fmt(controls.C.x)}</p>
            <p>β₁ = {angles.beta1.toFixed(4)} gon, β₂ = {angles.beta2.toFixed(4)} gon</p>
            <p className="pt-2 font-sans font-semibold">
              {isBg ? 'Резултат:' : 'Result:'} Yₚ = {fmt(station.y)}, Xₚ = {fmt(station.x)}
            </p>
          </div>
        </DocCallout>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {isBg
            ? 'Ъглите са получени от известната станция P, гледана по часовниковата стрелка към A, B и C.'
            : 'The angles were derived from the known station P, looking clockwise to A, B and C.'}
        </p>
      </DocSection>

      <DocSection title={isBg ? 'Бележки и съобщения за грешка' : 'Notes and error messages'}>
        <DocList
          items={
            isBg
              ? [
                  'Контролните точки A, B, C трябва да са различни и да не лежат на една права.',
                  'Станция P не трябва да лежи върху окръжността през A, B, C (опасна окръжност), нито много близо до нея — геометрията става неустойчива.',
                  'Ъгъл 0 или 200 гради означава станция върху права през две контролни точки и се отхвърля.',
                  'Ако въведените насочени ъгли не съответстват на нито една станция, изчислението се отхвърля като несъгласувани ъгли — проверете посоката (по часовниковата стрелка).',
                  'За по-висока точност измерявайте ъглите прецизно и избирайте добра геометрия (ъгли около 30–150 гради).',
                ]
              : [
                  'Control points A, B, C must be distinct and must not be collinear.',
                  'P must not lie on the circle through A, B, C (danger circle), nor very close to it — the geometry becomes unstable.',
                  'An angle of 0 or 200 gon puts the station on a line through two control points and is rejected.',
                  'If the entered directed angles match no station, the calculation is rejected as inconsistent angles — check the direction (clockwise).',
                  'For better accuracy use precise angles and strong geometry (angles roughly 30–150 gon).',
                ]
          }
        />
      </DocSection>
    </TaskDocsLayout>
  );
};

export default ResectionDocs;
