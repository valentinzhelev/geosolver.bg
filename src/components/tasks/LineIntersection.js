import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useGuardedCalculation } from '../../hooks/useGuardedCalculation';
import { useCalculationRestore } from '../../hooks/useCalculationRestore';
import { inputDataToFormStrings } from '../../utils/calculationRestore';
import { calculateLineIntersection } from '../../domain/geodesy/lineIntersection';
import SimpleGeodeticLayout, { CoordInput } from './shared/SimpleGeodeticLayout';
import PointPicker from './PointPicker';

const LineIntersection = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const { runWithTracking } = useGuardedCalculation();
  const [form, setForm] = useState({ y1: '', x1: '', y2: '', x2: '', y3: '', x3: '', y4: '', x4: '' });
  const [resultText, setResultText] = useState(bg ? 'Въведи координати на двете прави.' : 'Enter coordinates for both lines.');
  useCalculationRestore('line-intersection', setForm, inputDataToFormStrings);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.id]: e.target.value }));

  const isValid = ['y1', 'x1', 'y2', 'x2', 'y3', 'x3', 'y4', 'x4'].every((k) => form[k] !== '' && Number.isFinite(parseFloat(form[k])));

  const calculate = async () => {
    const vals = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, parseFloat(v)]));
    const result = await runWithTracking({
      toolName: 'line-intersection',
      toolDisplayName: { bg: 'Пресичане на прави', en: 'Line intersection' },
      inputData: vals,
      getResultData: (r) => ({ yI: r.yI, xI: r.xI }),
      run: () => calculateLineIntersection(vals.x1, vals.y1, vals.x2, vals.y2, vals.x3, vals.y3, vals.x4, vals.y4),
    });
    if (!result) return;
    setResultText(
      bg
        ? `Пресичане I:\nY = ${result.yI.toFixed(3)} m\nX = ${result.xI.toFixed(3)} m\n\nПараметър по AB: t = ${result.t.toFixed(4)}\nПараметър по CD: s = ${result.s.toFixed(4)}\n\n${result.isSegmentIntersection ? 'Вътре в двата сегмента.' : 'Извън сегмент(и) — безкрайни прави.'}`
        : `Intersection I:\nY = ${result.yI.toFixed(3)} m\nX = ${result.xI.toFixed(3)} m\n\nParameter on AB: t = ${result.t.toFixed(4)}\nParameter on CD: s = ${result.s.toFixed(4)}\n\n${result.isSegmentIntersection ? 'Inside both segments.' : 'Outside segment(s) — infinite lines.'}`
    );
  };

  return (
    <SimpleGeodeticLayout
      title={bg ? 'Пресичане на прави' : 'Line intersection'}
      toolPath="/line-intersection"
      language={language}
      seo={{
        title: bg ? 'Пресичане на прави – GeoSolver' : 'Line intersection – GeoSolver',
        description: bg ? 'Пресичане на две прави по координати' : 'Intersection of two lines from coordinates',
      }}
      onCalculate={calculate}
      onReset={() => { setForm({ y1: '', x1: '', y2: '', x2: '', y3: '', x3: '', y4: '', x4: '' }); setResultText(bg ? 'Въведи координати.' : 'Enter coordinates.'); }}
      isValid={isValid}
      resultText={resultText}
      docsExtra
    >
      <p className="text-xs text-neutral-500 font-['Manrope']">{bg ? 'Права 1: A→B · Права 2: C→D' : 'Line 1: A→B · Line 2: C→D'}</p>
      <div className="grid grid-cols-2 gap-2">
        <PointPicker language={language} label="A" onSelect={(p) => setForm((f) => ({ ...f, y1: String(p.y), x1: String(p.x) }))} />
        <PointPicker language={language} label="B" onSelect={(p) => setForm((f) => ({ ...f, y2: String(p.y), x2: String(p.x) }))} />
        <PointPicker language={language} label="C" onSelect={(p) => setForm((f) => ({ ...f, y3: String(p.y), x3: String(p.x) }))} />
        <PointPicker language={language} label="D" onSelect={(p) => setForm((f) => ({ ...f, y4: String(p.y), x4: String(p.x) }))} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <CoordInput id="y1" label="Y_A" value={form.y1} onChange={handle} />
        <CoordInput id="x1" label="X_A" value={form.x1} onChange={handle} />
        <CoordInput id="y2" label="Y_B" value={form.y2} onChange={handle} />
        <CoordInput id="x2" label="X_B" value={form.x2} onChange={handle} />
        <CoordInput id="y3" label="Y_C" value={form.y3} onChange={handle} />
        <CoordInput id="x3" label="X_C" value={form.x3} onChange={handle} />
        <CoordInput id="y4" label="Y_D" value={form.y4} onChange={handle} />
        <CoordInput id="x4" label="X_D" value={form.x4} onChange={handle} />
      </div>
    </SimpleGeodeticLayout>
  );
};

export default LineIntersection;
