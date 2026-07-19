import React from 'react';
import TaskDocsLayout, { DocSection, DocCallout, DocFormulaBlock, CalculatorLink } from './docs/TaskDocsLayout';
import { useTranslation } from '../../hooks/useTranslation';

const LineIntersectionDocs = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  return (
    <TaskDocsLayout title={bg ? 'Пресичане на прави' : 'Line intersection'} toolPath="/line-intersection">
      <DocSection title={bg ? 'Теория' : 'Theory'}>
        <p className="text-base text-neutral-700 dark:text-zinc-300 leading-relaxed">
          {bg
            ? 'Дадени са две прави чрез точки A, B и C, D. Търсят се координатите на пресечната точка I.'
            : 'Two lines are given by points A, B and C, D. Find intersection point I.'}
        </p>
      </DocSection>
      <DocSection title={bg ? 'Формули' : 'Formulas'}>
        <DocFormulaBlock>
          <span>t = ((X_C−X_A)·ΔY_CD − (Y_C−Y_A)·ΔX_CD) / (ΔX_AB·ΔY_CD − ΔY_AB·ΔX_CD)</span>
          <span>Y_I = Y_A + t·ΔY_AB · X_I = X_A + t·ΔX_AB</span>
        </DocFormulaBlock>
      </DocSection>
      <DocCallout variant="yellow">
        {bg ? 't, s ∈ [0,1] — пресичане в рамките на сегментите; иначе — на безкрайните прави.' : 't, s ∈ [0,1] — intersection within segments; otherwise on infinite lines.'}
      </DocCallout>
      <CalculatorLink />
    </TaskDocsLayout>
  );
};

export default LineIntersectionDocs;
