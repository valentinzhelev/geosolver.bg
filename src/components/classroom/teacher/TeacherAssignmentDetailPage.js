import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import SEO from '../../shared/SEO';
import ClassroomLayout from '../ClassroomLayout';
import { Card } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ActionButton } from '../ui/ActionButton';
import { classroomApi } from '../../../services/classroomApi';
import { useTranslation } from '../../../hooks/useTranslation';
import { EDU_TOOLS, toolKeyFromTemplate } from '../../../config/eduTools';

function flattenInputData(inputData) {
  if (!inputData || typeof inputData !== 'object') return {};
  if (inputData.input && typeof inputData.input === 'object') return inputData.input;
  return inputData;
}

const TeacherAssignmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const bg = language === 'bg';
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    classroomApi
      .getAssignment(id)
      .then((res) => setAssignment(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const isArchived = assignment?.status === 'archived';

  const handleArchive = async () => {
    setStatusBusy(true);
    setError('');
    try {
      await classroomApi.archiveAssignment(id);
      setConfirmArchive(false);
      const cid = assignment?.course?._id || assignment?.course;
      if (cid) {
        navigate(`/classroom/groups/${cid}`);
      } else {
        load();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setStatusBusy(false);
    }
  };

  const handleRestore = async () => {
    setStatusBusy(true);
    setError('');
    try {
      await classroomApi.restoreAssignment(id);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setStatusBusy(false);
    }
  };

  const toolKey = assignment ? toolKeyFromTemplate(assignment.taskTemplate) : null;
  const tool = EDU_TOOLS.find((t) => t.toolKey === toolKey);
  const courseId = assignment?.course?._id || assignment?.course;

  const formatValue = (v) => {
    if (v == null || v === '') return '—';
    if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(3);
    return String(v);
  };

  return (
    <>
      <SEO title={assignment?.title || (bg ? 'Задание' : 'Assignment')} canonical={`/classroom/teaching/assignments/${id}`} />
      <ClassroomLayout
        title={assignment?.title || (bg ? 'Задание' : 'Assignment')}
        subtitle={bg ? 'Входни данни и очаквани отговори по варианти.' : 'Input data and expected answers per variant.'}
      >
        {courseId && (
          <Link
            to={`/classroom/groups/${courseId}`}
            className="text-sm text-neutral-500 hover:text-black dark:hover:text-white font-['Manrope'] w-fit"
          >
            ← {bg ? 'Към групата' : 'Back to group'}
          </Link>
        )}

        {error && <Card className="p-4 text-sm text-red-600">{error}</Card>}
        {loading && <Card className="p-8 text-center text-neutral-500">{bg ? 'Зареждане...' : 'Loading...'}</Card>}

        <ConfirmDialog
          open={confirmArchive}
          title={bg ? 'Архивиране на задание?' : 'Archive assignment?'}
          message={
            bg
              ? 'Заданието ще изчезне от списъка за учениците и от активните задания. Можете да го възстановите от „Архивирани“ в групата.'
              : 'The assignment will be hidden from students and active lists. You can restore it from Archived in the group.'
          }
          confirmLabel={bg ? 'Архивирай' : 'Archive'}
          cancelLabel={bg ? 'Отказ' : 'Cancel'}
          variant="danger"
          busy={statusBusy}
          onConfirm={handleArchive}
          onCancel={() => setConfirmArchive(false)}
        />

        {assignment && (
          <div className="flex flex-col gap-6">
            {isArchived && (
              <Card className="p-4 flex flex-wrap items-center justify-between gap-3 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30">
                <p className="text-sm font-['Manrope'] text-amber-900 dark:text-amber-200">
                  {bg ? 'Това задание е архивирано и не се вижда от учениците.' : 'This assignment is archived and hidden from students.'}
                </p>
                <ActionButton
                  type="button"
                  variant="primary"
                  className="text-sm px-3 py-1.5"
                  onClick={handleRestore}
                  disabled={statusBusy}
                >
                  {bg ? 'Възстанови' : 'Restore'}
                </ActionButton>
              </Card>
            )}
            <Card className="p-6 flex flex-col gap-3">
              <div className="flex flex-wrap gap-4 text-sm font-['Manrope'] text-neutral-600 dark:text-zinc-400">
                <span>
                  <strong className="text-black dark:text-white">{bg ? 'Група' : 'Group'}:</strong>{' '}
                  {assignment.course?.name} ({assignment.course?.code})
                </span>
                <span>
                  <strong className="text-black dark:text-white">{bg ? 'Инструмент' : 'Tool'}:</strong>{' '}
                  {tool ? (bg ? tool.titleBg : tool.titleEn) : assignment.taskTemplate?.name}
                </span>
                <span>
                  <strong className="text-black dark:text-white">{bg ? 'Статус' : 'Status'}:</strong> {assignment.status}
                </span>
                <span>
                  <strong className="text-black dark:text-white">{bg ? 'Краен срок' : 'Due'}:</strong>{' '}
                  {new Date(assignment.dueDate).toLocaleString(bg ? 'bg-BG' : 'en-US')}
                </span>
                <span>
                  <strong className="text-black dark:text-white">{bg ? 'Варианти' : 'Variants'}:</strong>{' '}
                  {assignment.variants?.length || 0}
                </span>
              </div>
              {assignment.description && (
                <p className="text-sm text-neutral-700 dark:text-zinc-300 font-['Manrope'] whitespace-pre-wrap pt-2 border-t border-stone-100 dark:border-zinc-800">
                  {assignment.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                {tool && (
                  <ActionButton
                    to={tool.route}
                    variant="outline"
                    className="text-sm px-3 py-1.5"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {bg ? 'Калкулатор ↗' : 'Calculator ↗'}
                  </ActionButton>
                )}
                <ActionButton
                  to={`/classroom/review?assignment=${id}`}
                  variant="primary"
                  className="text-sm px-3 py-1.5"
                >
                  {bg ? 'Предавания' : 'Submissions'}
                </ActionButton>
                {!isArchived && (
                  <ActionButton
                    type="button"
                    variant="danger"
                    className="text-sm px-3 py-1.5"
                    onClick={() => setConfirmArchive(true)}
                    disabled={statusBusy}
                  >
                    {bg ? 'Архивирай' : 'Archive'}
                  </ActionButton>
                )}
              </div>
            </Card>

            <h2 className="text-lg font-bold font-['Manrope'] text-black dark:text-white">
              {bg ? 'Задачи (варианти)' : 'Problems (variants)'}
            </h2>

            {(assignment.variants || []).length === 0 ? (
              <Card className="p-6 text-sm text-neutral-500">
                {bg ? 'Няма генерирани варианти.' : 'No variants generated.'}
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {assignment.variants.map((variant) => {
                  const input = flattenInputData(variant.inputData);
                  const solution = variant.solution || {};
                  return (
                    <Card key={variant.variantIndex} className="p-5">
                      <h3 className="font-bold font-['Manrope'] text-black dark:text-white mb-4">
                        {bg ? 'Вариант' : 'Variant'} {variant.variantIndex + 1}
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs font-semibold uppercase text-neutral-400 mb-2">
                            {bg ? 'Дадено (вход)' : 'Given (input)'}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {(tool?.inputDisplay || Object.keys(input).map((k) => ({ key: k, labelBg: k, labelEn: k }))).map(
                              (f) => (
                                <div
                                  key={f.key}
                                  className="px-3 py-2 bg-stone-50 dark:bg-zinc-800 rounded-lg text-sm font-['Manrope']"
                                >
                                  <span className="text-neutral-500">{bg ? f.labelBg : f.labelEn}: </span>
                                  <span className="font-mono text-black dark:text-white">{formatValue(input[f.key])}</span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-neutral-400 mb-2">
                            {bg ? 'Очакван отговор' : 'Expected answer'}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {(tool?.answerKeys || Object.keys(solution).map((k) => ({ key: k, labelBg: k, labelEn: k }))).map(
                              (f) => (
                                <div
                                  key={f.key}
                                  className="px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm font-['Manrope'] border border-green-100 dark:border-green-900/40"
                                >
                                  <span className="text-neutral-600 dark:text-zinc-400">
                                    {bg ? f.labelBg : f.labelEn}:{' '}
                                  </span>
                                  <span className="font-mono font-medium text-black dark:text-white">
                                    {formatValue(solution[f.key])}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            <p className="text-xs text-neutral-400 font-['Manrope']">
              {bg
                ? 'Всеки ученик получава един вариант (по ID). Броят варианти = брой различни задачи в групата.'
                : 'Each student gets one variant (by ID). Variant count = number of distinct problems.'}
            </p>
          </div>
        )}
      </ClassroomLayout>
    </>
  );
};

export default TeacherAssignmentDetailPage;
