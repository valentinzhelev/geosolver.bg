import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import TaskDocsLayout, {
  DocSection,
  DocCallout,
  DocFormulaBlock,
  DocList,
  DocTable,
  CalculatorLink,
} from './docs/TaskDocsLayout';

const SecondTaskDocs = () => {
  const { language, t } = useTranslation();
  const isBg = language === 'bg';

  return (
    <TaskDocsLayout title={t.secondTaskTitle} toolPath="/second-task">
      <DocSection title={isBg ? 'Теория' : 'Theory'}>
        <p className="text-lg text-neutral-800 dark:text-neutral-200">
          {isBg
            ? 'Втората основна задача (обратна задача) определя разстоянието S и посочния ъгъл α между две точки с известни координати.'
            : 'The second basic task (inverse task) finds distance S and bearing α between two points with known coordinates.'}
        </p>
        <DocCallout title={isBg ? 'Условие' : 'Problem statement'}>
          {isBg
            ? 'Дадени: (X₁, Y₁) и (X₂, Y₂). Търсят се: ΔX, ΔY, S и α (в гради).'
            : 'Given: (X₁, Y₁) and (X₂, Y₂). Find: ΔX, ΔY, S, and α (in gon).'}
        </DocCallout>
      </DocSection>

      <DocSection title={isBg ? 'Формули' : 'Formulas'}>
        <DocFormulaBlock
          note={
            isBg
              ? 'GeoSolver използва atan2(ΔY, ΔX) и табличен метод по квадранти за α.'
              : 'GeoSolver uses atan2(ΔY, ΔX) and quadrant rules for α.'
          }
        >
          <span>ΔX = X₂ − X₁</span>
          <span>ΔY = Y₂ − Y₁</span>
          <span>S = √(ΔX² + ΔY²)</span>
          <span>α = atan2(ΔY, ΔX) · 200/π  (нормализиран 0–400 gon)</span>
        </DocFormulaBlock>
      </DocSection>

      <DocSection title={isBg ? 'Квадранти' : 'Quadrants'}>
        <DocTable
          headers={[isBg ? 'Квадрант' : 'Quadrant', 'ΔX', 'ΔY', 'α (gon)']}
          rows={[
            ['I', '+', '+', '0 – 100'],
            ['II', '−', '+', '100 – 200'],
            ['III', '−', '−', '200 – 300'],
            ['IV', '+', '−', '300 – 400'],
          ]}
        />
      </DocSection>

      <DocSection title={isBg ? 'Проверка в GeoSolver' : 'Verification in GeoSolver'}>
        <DocCallout variant="green" title={isBg ? 'Обратна проверка' : 'Back-check'}>
          {isBg
            ? 'Инструментът сравнява ΔX, ΔY със S·cos(α) и S·sin(α) и показва разликите.'
            : 'The tool compares ΔX, ΔY with S·cos(α) and S·sin(α) and shows differences.'}
        </DocCallout>
        <CalculatorLink />
      </DocSection>

      <DocSection title={isBg ? 'Пример' : 'Example'}>
        <DocCallout>
          <div className="font-mono text-sm space-y-1">
            <p>A: Y = 1209.12, X = 4047.53</p>
            <p>B: Y = 1289.19, X = 4214.61</p>
            <p className="pt-2 font-sans font-semibold">
              {isBg ? 'Резултат:' : 'Result:'} S ≈ 185.28 m, α ≈ 28.45 gon
            </p>
            <p className="font-sans text-neutral-600 dark:text-zinc-400 text-xs">
              {isBg
                ? '(обратна проверка на примера от първата основна задача)'
                : '(inverse check of the first basic task example)'}
            </p>
          </div>
        </DocCallout>
      </DocSection>

      <DocSection title={isBg ? 'Бележки' : 'Notes'}>
        <DocList
          items={
            isBg
              ? [
                  'Точките A и B не трябва да съвпадат.',
                  'Резултатът α е посочен ъгъл от A към B.',
                  'Подходяща обратна задача след първата основна задача.',
                ]
              : [
                  'Points A and B must not coincide.',
                  'α is the bearing from A to B.',
                  'Natural inverse of the first basic task.',
                ]
          }
        />
      </DocSection>
    </TaskDocsLayout>
  );
};

export default SecondTaskDocs;
