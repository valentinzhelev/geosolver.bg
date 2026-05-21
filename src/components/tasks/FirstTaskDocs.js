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

const FirstTaskDocs = () => {
  const { language, t } = useTranslation();
  const isBg = language === 'bg';

  return (
    <TaskDocsLayout title={t.firstTaskTitle} toolPath="/first-task">
      <DocSection title={isBg ? 'Теория' : 'Theory'}>
        <p className="text-lg text-neutral-800 dark:text-neutral-200">
          {isBg
            ? 'Първата основна задача (права задача) определя координатите на точка B, когато са известни координатите на A, посочният ъгъл α и разстоянието S.'
            : 'The first basic task (forward task) finds coordinates of point B from known point A, bearing angle α, and distance S.'}
        </p>
        <DocCallout title={isBg ? 'Условие' : 'Problem statement'}>
          {isBg
            ? 'Дадени: Yₐ, Xₐ, αₐᵦ (в гради), Sₐᵦ. Търсят се: Yᵦ, Xᵦ.'
            : 'Given: Yₐ, Xₐ, αₐᵦ (in gon), Sₐᵦ. Find: Yᵦ, Xᵦ.'}
        </DocCallout>
      </DocSection>

      <DocSection title={isBg ? 'Формули' : 'Formulas'}>
        <DocFormulaBlock
          note={
            isBg
              ? 'В GeoSolver ъгълът е в гради (0–400 gon). ΔX = S·cos(α), ΔY = S·sin(α).'
              : 'GeoSolver uses gon (0–400). ΔX = S·cos(α), ΔY = S·sin(α).'
          }
        >
          <span>ΔY = S · sin(α)</span>
          <span>ΔX = S · cos(α)</span>
          <span>Yᵦ = Yₐ + ΔY</span>
          <span>Xᵦ = Xₐ + ΔX</span>
        </DocFormulaBlock>
      </DocSection>

      <DocSection title={isBg ? 'Таблица на знаците' : 'Sign table'}>
        <DocTable
          headers={[isBg ? 'Посочен ъгъл' : 'Bearing', 'ΔY', 'ΔX']}
          rows={[
            ['0 – 100g', '+', '+'],
            ['100 – 200g', '+', '−'],
            ['200 – 300g', '−', '−'],
            ['300 – 400g', '−', '+'],
          ]}
        />
      </DocSection>

      <DocSection title={isBg ? 'Проверка в GeoSolver' : 'Verification in GeoSolver'}>
        <DocCallout variant="green" title={isBg ? 'Автоматична проверка' : 'Automatic check'}>
          {isBg
            ? 'След изчисление инструментът сравнява S и α с обратно изчислени стойности от ΔX и ΔY.'
            : 'After calculation, the tool compares S and α with values recomputed from ΔX and ΔY.'}
        </DocCallout>
        <CalculatorLink />
      </DocSection>

      <DocSection title={isBg ? 'Пример' : 'Example'}>
        <DocCallout>
          <div className="font-mono text-sm space-y-1">
            <p>Yₐ = 1209.12, Xₐ = 4047.53</p>
            <p>S = 185.28 m, α = 28.4512 gon</p>
            <p className="pt-2 font-sans font-semibold">
              {isBg ? 'Резултат:' : 'Result:'} Yᵦ = 1289.19, Xᵦ = 4214.61
            </p>
          </div>
        </DocCallout>
      </DocSection>

      <DocSection title={isBg ? 'Бележки' : 'Notes'}>
        <DocList
          items={
            isBg
              ? [
                  'Посочният ъгъл се отчита от оста +X по часовниковата стрелка.',
                  'Разстоянието S трябва да е положително.',
                  'Ъгълът трябва да е в интервала [0, 400) gon.',
                ]
              : [
                  'Bearing is measured from +X axis clockwise.',
                  'Distance S must be positive.',
                  'Angle must be in [0, 400) gon.',
                ]
          }
        />
      </DocSection>
    </TaskDocsLayout>
  );
};

export default FirstTaskDocs;
