import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import TaskDocsLayout, {
  DocSection,
  DocCallout,
  DocFormulaBlock,
  DocList,
  CalculatorLink,
} from './docs/TaskDocsLayout';

const ForwardIntersectionDocs = () => {
  const { language, t } = useTranslation();
  const isBg = language === 'bg';
  const title = t.forwardIntersection;

  return (
    <TaskDocsLayout title={title} toolPath="/forward-intersection">
      <DocSection title={isBg ? 'Теория' : 'Theory'}>
        <p className="text-lg text-neutral-800 dark:text-neutral-200">
          {isBg
            ? 'Правата засечка определя координатите на неизвестна точка P по две известни точки A и B и двата ъгъла β₁, β₂ в триъгълника ABP (ъглите при A и B).'
            : 'Forward intersection finds point P from known points A and B and interior angles β₁, β₂ in triangle ABP (angles at A and B).'}
        </p>
        <DocCallout title={isBg ? 'Условие' : 'Problem statement'}>
          {isBg
            ? 'Дадени: (Yₐ, Xₐ), (Yᵦ, Xᵦ), β₁, β₂ (gon). Търсят се: (Yₚ, Xₚ). Изисквания: β₁, β₂ > 0 и β₁ + β₂ < 200 gon.'
            : 'Given: (Yₐ, Xₐ), (Yᵦ, Xᵦ), β₁, β₂ (gon). Find: (Yₚ, Xₚ). Requirements: β₁, β₂ > 0 and β₁ + β₂ < 200 gon.'}
        </DocCallout>
      </DocSection>

      <DocSection title={isBg ? 'Формули (както в GeoSolver)' : 'Formulas (as in GeoSolver)'}>
        <DocFormulaBlock
          note={
            isBg
              ? 'Първо се намира посочният ъгъл αₐᵦ по A→B. Синусовата теорема дава Sₐₚ и Sᵦₚ; P се получава и от A, и от B, после се осреднява.'
              : 'Bearing αₐᵦ from A→B is computed first. Law of sines gives Sₐₚ and Sᵦₚ; P is computed from A and B, then averaged.'
          }
        >
          <span>αₐᵦ = atan2(Yᵦ−Yₐ, Xᵦ−Xₐ)</span>
          <span>Sₐᵦ = √(ΔX² + ΔY²)</span>
          <span>Sₐₚ = Sₐᵦ · sin(β₂) / sin(β₁+β₂)</span>
          <span>Sᵦₚ = Sₐᵦ · sin(β₁) / sin(β₁+β₂)</span>
          <span>Xₚ, Yₚ — от полярни координати през A и B (средно)</span>
        </DocFormulaBlock>
      </DocSection>

      <DocSection title={isBg ? 'Схема' : 'Diagram'}>
        <DocCallout>
          <div className="text-sm space-y-1 text-neutral-700 dark:text-neutral-300">
            <p>A ——— Sₐᵦ ——— B</p>
            <p>β₁ при A, β₂ при B, P вътре в триъгълника</p>
            <p>{isBg ? 'Ъглите β₁ и β₂ са вътрешни ъгли при основата AB' : 'β₁ and β₂ are interior angles at base AB'}</p>
          </div>
        </DocCallout>
      </DocSection>

      <DocSection title={isBg ? 'Проверка в GeoSolver' : 'Verification in GeoSolver'}>
        <DocCallout variant="green" title={isBg ? 'Двойно определяне' : 'Double determination'}>
          {isBg
            ? 'P се изчислява от A и от B; разликата |ΔX|, |ΔY| между двете решения трябва да е минимална. Показват се и проверки на Sₐₚ, Sᵦₚ.'
            : 'P is computed from A and from B; |ΔX|, |ΔY| between solutions should be minimal. SAP and SBP checks are shown.'}
        </DocCallout>
        <CalculatorLink />
      </DocSection>

      <DocSection title={isBg ? 'Пример' : 'Example'}>
        <DocCallout>
          <div className="font-mono text-sm space-y-1">
            <p>A: Y = 1000, X = 1000</p>
            <p>B: Y = 1100, X = 1200</p>
            <p>β₁ = 50 gon, β₂ = 60 gon</p>
            <p className="pt-2 font-sans font-semibold">
              {isBg ? 'Резултат:' : 'Result:'} Yₚ ≈ 942.08, Xₚ ≈ 1173.76
            </p>
            <p className="font-sans text-xs text-neutral-600">Sₐᵦ ≈ 223.61 m</p>
          </div>
        </DocCallout>
      </DocSection>

      <DocSection title={isBg ? 'Бележки' : 'Notes'}>
        <DocList
          items={
            isBg
              ? [
                  'A и B не трябва да съвпадат.',
                  'Сумата β₁ + β₂ не може да достига 200 gon.',
                  'Лоша геометрия: много остър ъгъл при P или почти колinearни точки.',
                ]
              : [
                  'A and B must not coincide.',
                  'β₁ + β₂ must stay below 200 gon.',
                  'Poor geometry: very acute angle at P or nearly collinear points.',
                ]
          }
        />
      </DocSection>
    </TaskDocsLayout>
  );
};

export default ForwardIntersectionDocs;
