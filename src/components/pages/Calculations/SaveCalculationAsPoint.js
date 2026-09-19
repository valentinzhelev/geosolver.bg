import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CalculationService from '../../../services/calculationService';
import {
  buildCreatePointPayload,
  getPointPreview,
  interpretCreatePointResult,
  existingPointLabel,
} from '../../../utils/calculationPointCapability';

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-['Manrope'] text-black dark:text-white outline-none";
const btnPrimary =
  "px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold font-['Manrope'] disabled:opacity-50";

/**
 * Explicit "Запази като точка" for one saved, point-producing Project
 * calculation. The user only enters the point's identity (name / code); the
 * coordinates shown are previews of the STORED result and are never sent —
 * the server derives coordinates, project and provenance itself.
 * Render with key={calculation._id} so state resets per calculation.
 */
const SaveCalculationAsPoint = ({ calculation, language = 'bg' }) => {
  const bg = language === 'bg';
  const preview = getPointPreview(calculation);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome] = useState(null);

  if (!preview) return null;

  const done = outcome?.state === 'created' || outcome?.state === 'already';
  const pointsPath = `/points?projectId=${encodeURIComponent(calculation.projectId)}`;

  const submit = async (e) => {
    e.preventDefault();
    if (submitting || done) return;
    setSubmitting(true);
    try {
      const { status, body } = await CalculationService.createPointFromCalculation(
        calculation._id,
        buildCreatePointPayload({ name, code })
      );
      setOutcome(interpretCreatePointResult(status, body));
    } catch {
      setOutcome({ state: 'error', message: null });
    } finally {
      setSubmitting(false);
    }
  };

  const messages = {
    created: bg ? 'Точката е запазена в проекта.' : 'The point was saved to the project.',
    already: bg ? 'От това изчисление вече е създадена точка.' : 'A point has already been created from this calculation.',
    forbidden: bg ? 'Нямате права за редактиране на този проект.' : 'You do not have edit access to this project.',
    invalid: bg ? 'Въведете име на точката.' : 'Enter a point name.',
    crs_mismatch: bg
      ? 'Координатната система на проекта е променена след това изчисление — точката не е запазена.'
      : 'The project coordinate system changed after this calculation — the point was not saved.',
    error: bg ? 'Точката не можа да бъде запазена. Опитайте отново.' : 'The point could not be saved. Please try again.',
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
      <div className="text-xs text-neutral-400 uppercase tracking-wide">
        {bg ? 'Запази като точка' : 'Save as point'}
      </div>
      <div className="text-xs font-mono p-3 rounded-lg bg-stone-50 dark:bg-zinc-800 text-neutral-700 dark:text-zinc-300">
        <div>X = {preview.x.toFixed(3)} m</div>
        <div>Y = {preview.y.toFixed(3)} m</div>
        <div className="mt-1 font-['Manrope'] text-neutral-400">
          {bg ? 'Височината (H) не се изчислява и остава празна.' : 'Height (H) is not calculated and stays empty.'}
        </div>
      </div>
      <label className="flex flex-col gap-1 text-xs font-medium font-['Manrope'] text-neutral-500">
        {bg ? 'Име на точката *' : 'Point name *'}
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} disabled={submitting || done} maxLength={60} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium font-['Manrope'] text-neutral-500">
        {bg ? 'Код / номер' : 'Code / number'}
        <input className={inputClass} value={code} onChange={(e) => setCode(e.target.value)} disabled={submitting || done} maxLength={30} />
      </label>
      <button type="submit" className={btnPrimary} disabled={submitting || done || !name.trim()}>
        {submitting ? (bg ? 'Запазване…' : 'Saving…') : (bg ? 'Запази като точка' : 'Save as point')}
      </button>
      {outcome && (
        <div
          role="status"
          className={`text-sm font-['Manrope'] ${done ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
        >
          {messages[outcome.state] || messages.error}
          {outcome.state === 'already' && existingPointLabel(outcome.point)
            ? ` (${existingPointLabel(outcome.point)})`
            : ''}
        </div>
      )}
      {done && (
        <Link to={pointsPath} className="text-sm font-semibold font-['Manrope'] underline text-black dark:text-white">
          {bg ? 'Към точките на проекта →' : 'Go to project points →'}
        </Link>
      )}
    </form>
  );
};

export default SaveCalculationAsPoint;
