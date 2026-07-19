import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useGuardedCalculation } from '../../hooks/useGuardedCalculation';
import { consumeCalculationRestore, inputDataToFormStrings } from '../../utils/calculationRestore';
import { calculateSegmentPoint } from '../../domain/geodesy/segmentDivision';
import SimpleGeodeticLayout, { CoordInput } from './shared/SimpleGeodeticLayout';
import PointPicker from './PointPicker';

const SegmentDivision = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const { runWithTracking } = useGuardedCalculation();
  const [mode, setMode] = useState('distance');
  const [form, setForm] = useState({ yA: '', xA: '', yB: '', xB: '', value: '' });
  const [resultText, setResultText] = useState(bg ? 'Въведи отсечка и s или k.' : 'Enter segment and s or k.');

  useEffect(() => {
    const payload = consumeCalculationRestore('segment-division');
    if (!payload) return;
    if (payload.mode) setMode(payload.mode);
    setForm((f) => ({ ...f, ...inputDataToFormStrings(payload) }));
  }, []);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.id]: e.target.value }));

  const isValid = ['yA', 'xA', 'yB', 'xB', 'value'].every((k) => form[k] !== '' && Number.isFinite(parseFloat(form[k])));

  const calculate = async () => {
    const yA = parseFloat(form.yA);
    const xA = parseFloat(form.xA);
    const yB = parseFloat(form.yB);
    const xB = parseFloat(form.xB);
    const value = parseFloat(form.value);
    const result = await runWithTracking({
      toolName: 'segment-division',
      toolDisplayName: { bg: 'Деление на отсечка', en: 'Segment division' },
      inputData: { yA, xA, yB, xB, value, mode },
      getResultData: (r) => ({ yP: r.yP, xP: r.xP }),
      run: () => calculateSegmentPoint(yA, xA, yB, xB, value, mode),
    });
    if (!result) return;
    setResultText(
      bg
        ? `Точка P на отсечката:\nY = ${result.yP.toFixed(3)} m\nX = ${result.xP.toFixed(3)} m\n\nAB = ${result.len.toFixed(3)} m\ns = ${result.s.toFixed(3)} m\nk = ${result.t.toFixed(4)}`
        : `Point P on segment:\nY = ${result.yP.toFixed(3)} m\nX = ${result.xP.toFixed(3)} m\n\nAB = ${result.len.toFixed(3)} m\ns = ${result.s.toFixed(3)} m\nk = ${result.t.toFixed(4)}`
    );
  };

  return (
    <SimpleGeodeticLayout
      title={bg ? 'Деление на отсечка' : 'Segment division'}
      toolPath="/segment-division"
      language={language}
      seo={{
        title: bg ? 'Деление на отсечка – GeoSolver' : 'Segment division – GeoSolver',
        description: bg ? 'Точка на отсечка по разстояние или пропорция' : 'Point on segment by distance or ratio',
      }}
      onCalculate={calculate}
      onReset={() => { setForm({ yA: '', xA: '', yB: '', xB: '', value: '' }); setResultText(bg ? 'Въведи данни.' : 'Enter data.'); }}
      isValid={isValid}
      resultText={resultText}
      docsExtra
    >
      <div className="flex gap-2">
        <button type="button" onClick={() => setMode('distance')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold font-['Manrope'] ${mode === 'distance' ? 'bg-black text-white' : 'outline outline-1 outline-gray-200'}`}>
          s (m)
        </button>
        <button type="button" onClick={() => setMode('ratio')} className={`px-3 py-1.5 rounded-lg text-sm font-semibold font-['Manrope'] ${mode === 'ratio' ? 'bg-black text-white' : 'outline outline-1 outline-gray-200'}`}>
          k (0–1)
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <PointPicker language={language} label="A" onSelect={(p) => setForm((f) => ({ ...f, yA: String(p.y), xA: String(p.x) }))} />
        <PointPicker language={language} label="B" onSelect={(p) => setForm((f) => ({ ...f, yB: String(p.y), xB: String(p.x) }))} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <CoordInput id="yA" label="Y_A" value={form.yA} onChange={handle} />
        <CoordInput id="xA" label="X_A" value={form.xA} onChange={handle} />
        <CoordInput id="yB" label="Y_B" value={form.yB} onChange={handle} />
        <CoordInput id="xB" label="X_B" value={form.xB} onChange={handle} />
        <CoordInput id="value" label={mode === 'distance' ? 's (m)' : 'k'} value={form.value} onChange={handle} />
      </div>
    </SimpleGeodeticLayout>
  );
};

export default SegmentDivision;
