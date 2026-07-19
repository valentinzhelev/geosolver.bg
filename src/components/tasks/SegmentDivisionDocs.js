import React from 'react';
import TaskDocsLayout, { DocSection, DocFormulaBlock, CalculatorLink } from './docs/TaskDocsLayout';
import { useTranslation } from '../../hooks/useTranslation';

const SegmentDivisionDocs = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  return (
    <TaskDocsLayout title={bg ? 'Деление на отсечка' : 'Segment division'} toolPath="/segment-division">
      <DocSection title={bg ? 'Теория' : 'Theory'}>
        <p className="text-base text-neutral-700 dark:text-zinc-300 leading-relaxed">
          {bg
            ? 'Точка P на отсечка AB — по разстояние s от A или по пропорция k (0 = A, 1 = B).'
            : 'Point P on segment AB — by distance s from A or ratio k (0 = A, 1 = B).'}
        </p>
      </DocSection>
      <DocSection title={bg ? 'Формули' : 'Formulas'}>
        <DocFormulaBlock>
          <span>k = s / |AB| · Y_P = Y_A + k·ΔY · X_P = X_A + k·ΔX</span>
        </DocFormulaBlock>
      </DocSection>
      <CalculatorLink />
    </TaskDocsLayout>
  );
};

export default SegmentDivisionDocs;
