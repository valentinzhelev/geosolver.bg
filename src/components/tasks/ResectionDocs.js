import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import TaskDocsLayout, {
  DocSection,
  DocCallout,
  DocFormulaBlock,
  DocList,
  CalculatorLink,
} from './docs/TaskDocsLayout';

const ResectionDocs = () => {
  const { language, t } = useTranslation();
  const isBg = language === 'bg';
  const title = t.resection;

  return (
    <TaskDocsLayout title={title} toolPath="/resection">
      <DocSection title={isBg ? 'Теория' : 'Theory'}>
        <p className="text-lg text-neutral-800 dark:text-neutral-200">
          {isBg
            ? 'Обратната засечка определя координатите на станция P по три известни точки A, B, C и двата хоризонтални ъгъла, измерени в P.'
            : 'Resection determines station P from three known points A, B, C and two horizontal angles measured at P.'}
        </p>
        <DocCallout title={isBg ? 'Условие' : 'Problem statement'}>
          {isBg
            ? 'Дадени: координати на A, B, C; β₁ = ∠APB, β₂ = ∠BPC (в гради). Търсят се: Xₚ, Yₚ.'
            : 'Given: coordinates of A, B, C; β₁ = ∠APB, β₂ = ∠BPC (gon). Find: Xₚ, Yₚ.'}
        </DocCallout>
      </DocSection>

      <DocSection title={isBg ? 'Входове в GeoSolver' : 'Inputs in GeoSolver'}>
        <DocFormulaBlock
          note={
            isBg
              ? 'Ъглите се въвеждат както в полето: β₁ (A–P–B), β₂ (B–P–C).'
              : 'Enter angles as in the tool: β₁ (A–P–B), β₂ (B–P–C).'
          }
        >
          <span>β₁ — ъгъл между посоките P→A и P→B</span>
          <span>β₂ — ъгъл между посоките P→B и P→C</span>
        </DocFormulaBlock>
      </DocSection>

      <DocSection title={isBg ? 'Метод' : 'Method'}>
        <p className="text-base text-neutral-800 dark:text-neutral-200">
          {isBg
            ? 'GeoSolver използва триангулация (Hansen): P се определя от A и от B по синусовата теорема; крайните координати са средно от двете решения. Показват се разстояния до A, B, C и проверка на измерените ъгли.'
            : 'GeoSolver uses triangulation (Hansen): P from A and from B via law of sines; final coordinates are averaged. Distances to A, B, C and angle checks are shown.'}
        </p>
      </DocSection>

      <DocSection title={isBg ? 'Проверка в GeoSolver' : 'Verification in GeoSolver'}>
        <DocCallout variant="green" title={isBg ? 'Контрол на ъглите' : 'Angle control'}>
          {isBg
            ? 'След изчисление се сравняват въведените β₁, β₂ с преизчислените от координатите на P (показва се отклонение).'
            : 'Computed β₁, β₂ from P are compared with input values (deviation is shown).'}
        </DocCallout>
        <CalculatorLink />
      </DocSection>

      <DocSection title={isBg ? 'Пример' : 'Example'}>
        <DocCallout>
          <div className="font-mono text-sm space-y-1">
            <p>Yₐ = 1209.12, Xₐ = 4047.53</p>
            <p>Yᵦ = 1289.19, Xᵦ = 4214.61</p>
            <p>Yᶜ = 1400.00, Xᶜ = 4100.00</p>
            <p>β₁ = 80 gon, β₂ = 70 gon</p>
            <p className="pt-2 font-sans font-semibold">
              {isBg ? 'Резултат:' : 'Result:'} Yₚ = 1417.19, Xₚ = 4142.16
            </p>
          </div>
        </DocCallout>
      </DocSection>

      <DocSection title={isBg ? 'Бележки' : 'Notes'}>
        <DocList
          items={
            isBg
              ? [
                  'Трите контролни точки не трябва да са на една права.',
                  'Станция P не трябва да попада в окружността през A, B, C (класическа слабост на засечката).',
                  'За по-висока точност измерявайте ъглите с по-малка грешка и избирайте добра геометрия (ъгли 30–150 gon).',
                ]
              : [
                  'Control points A, B, C must not be collinear.',
                  'P must not lie on the danger circle through A, B, C.',
                  'For better accuracy use precise angles and strong geometry (angles roughly 30–150 gon).',
                ]
          }
        />
      </DocSection>
    </TaskDocsLayout>
  );
};

export default ResectionDocs;
