import React from 'react';
import TaskDocsLayout, { DocSection, DocFormulaBlock, CalculatorLink } from './docs/TaskDocsLayout';
import { useTranslation } from '../../hooks/useTranslation';

const OffsetPointDocs = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  return (
    <TaskDocsLayout title={bg ? 'Ортогонален offset' : 'Orthogonal offset'} toolPath="/offset-point">
      <DocSection title={bg ? 'Теория' : 'Theory'}>
        <p className="text-base text-neutral-700 dark:text-zinc-300 leading-relaxed">
          {bg
            ? 'По отсечка A→B на разстояние s, след което перпендикулярен отстъп d (наляво от посоката A→B).'
            : 'Along segment A→B at distance s, then perpendicular offset d (left of A→B direction).'}
        </p>
      </DocSection>
      <DocSection title={bg ? 'Формули' : 'Formulas'}>
        <DocFormulaBlock>
          <span>Y₀ = Y_A + s·(ΔY/|AB|) · X₀ = X_A + s·(ΔX/|AB|)</span>
          <span>Y_P = Y₀ + d·n_Y · X_P = X₀ + d·n_X</span>
        </DocFormulaBlock>
      </DocSection>
      <CalculatorLink />
    </TaskDocsLayout>
  );
};

export default OffsetPointDocs;
