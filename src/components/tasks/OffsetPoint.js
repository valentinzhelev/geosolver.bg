import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useGuardedCalculation } from '../../hooks/useGuardedCalculation';
import { useCalculationRestore } from '../../hooks/useCalculationRestore';
import { inputDataToFormStrings } from '../../utils/calculationRestore';
import { calculateOrthogonalOffset } from '../../domain/geodesy/orthogonalOffset';
import SimpleGeodeticLayout, { CoordInput } from './shared/SimpleGeodeticLayout';
import PointPicker from './PointPicker';

const OffsetPoint = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const { runWithTracking } = useGuardedCalculation();
  const [form, setForm] = useState({ yA: '', xA: '', yB: '', xB: '', s: '', d: '' });
  const [resultText, setResultText] = useState(bg ? 'Въведи отсечка A→B, s и d.' : 'Enter segment A→B, s and d.');
  useCalculationRestore('offset-point', setForm, inputDataToFormStrings);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.id]: e.target.value }));

  const isValid = ['yA', 'xA', 'yB', 'xB', 's', 'd'].every((k) => form[k] !== '' && Number.isFinite(parseFloat(form[k])));

  const calculate = async () => {
    const yA = parseFloat(form.yA);
    const xA = parseFloat(form.xA);
    const yB = parseFloat(form.yB);
    const xB = parseFloat(form.xB);
    const s = parseFloat(form.s);
    const d = parseFloat(form.d);
    const result = await runWithTracking({
      toolName: 'offset-point',
      toolDisplayName: { bg: 'Ортогонален offset', en: 'Orthogonal offset' },
      inputData: { yA, xA, yB, xB, s, d },
      getResultData: (r) => ({ yP: r.yP, xP: r.xP }),
      run: () => calculateOrthogonalOffset(yA, xA, yB, xB, s, d),
    });
    if (!result) return;
    setResultText(
      bg
        ? `Точка на отсечката (s=${s} m):\nY₀ = ${result.yOn.toFixed(3)} · X₀ = ${result.xOn.toFixed(3)}\n\nOffset точка P (d=${d} m наляво):\nY = ${result.yP.toFixed(3)} m\nX = ${result.xP.toFixed(3)} m\n\nДължина AB = ${result.len.toFixed(3)} m`
        : `Point on segment (s=${s} m):\nY₀ = ${result.yOn.toFixed(3)} · X₀ = ${result.xOn.toFixed(3)}\n\nOffset point P (d=${d} m left):\nY = ${result.yP.toFixed(3)} m\nX = ${result.xP.toFixed(3)} m\n\nLength AB = ${result.len.toFixed(3)} m`
    );
  };

  return (
    <SimpleGeodeticLayout
      title={bg ? 'Ортогонален offset' : 'Orthogonal offset'}
      toolPath="/offset-point"
      language={language}
      seo={{
        title: bg ? 'Ортогонален offset – GeoSolver' : 'Orthogonal offset – GeoSolver',
        description: bg ? 'Точка перпендикулярно на отсечка' : 'Point perpendicular to a segment',
      }}
      onCalculate={calculate}
      onReset={() => { setForm({ yA: '', xA: '', yB: '', xB: '', s: '', d: '' }); setResultText(bg ? 'Въведи данни.' : 'Enter data.'); }}
      isValid={isValid}
      resultText={resultText}
      docsExtra
    >
      <p className="text-xs text-neutral-500 font-['Manrope']">
        {bg ? 'd > 0 = наляво от A→B · s = разстояние по отсечката от A' : 'd > 0 = left of A→B · s = chainage from A'}
      </p>
      <div className="grid grid-cols-2 gap-2">
        <PointPicker language={language} label="A" onSelect={(p) => setForm((f) => ({ ...f, yA: String(p.y), xA: String(p.x) }))} />
        <PointPicker language={language} label="B" onSelect={(p) => setForm((f) => ({ ...f, yB: String(p.y), xB: String(p.x) }))} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <CoordInput id="yA" label="Y_A" value={form.yA} onChange={handle} />
        <CoordInput id="xA" label="X_A" value={form.xA} onChange={handle} />
        <CoordInput id="yB" label="Y_B" value={form.yB} onChange={handle} />
        <CoordInput id="xB" label="X_B" value={form.xB} onChange={handle} />
        <CoordInput id="s" label={bg ? 's (m)' : 's (m)'} value={form.s} onChange={handle} />
        <CoordInput id="d" label={bg ? 'd (m)' : 'd (m)'} value={form.d} onChange={handle} />
      </div>
    </SimpleGeodeticLayout>
  );
};

export default OffsetPoint;
