import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import SEO from '../../shared/SEO';
import ClassroomLayout from '../ClassroomLayout';
import { Card } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ActionButton } from '../ui/ActionButton';
import { classroomApi } from '../../../services/classroomApi';
import { useTranslation } from '../../../hooks/useTranslation';
import { toolKeyFromTemplate } from '../../../config/eduTools';
import { EDU_TOOLS } from '../../../config/eduTools';

const GroupDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const bg = language === 'bg';
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [showArchivedAssignments, setShowArchivedAssignments] = useState(false);
  const [emails, setEmails] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [archiveAssignmentTarget, setArchiveAssignmentTarget] = useState(null);
  const [confirmArchiveGroup, setConfirmArchiveGroup] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  const isGroupArchived = course?.isActive === false;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { course: id };
      if (showArchivedAssignments) params.status = 'archived';
      const [cRes, aRes] = await Promise.all([
        classroomApi.getCourse(id),
        classroomApi.listAssignments(params),
      ]);
      setCourse(cRes.data);
      setAssignments(aRes.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id, showArchivedAssignments]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddStudents = async (e) => {
    e.preventDefault();
    const list = emails
      .split(/[\n,;]+/)
      .map((x) => x.trim())
      .filter(Boolean);
    if (!list.length) return;
    try {
      await classroomApi.addStudents(id, list);
      setEmails('');
      setMessage(bg ? 'Учениците са добавени.' : 'Students added.');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleArchiveAssignment = async () => {
    if (!archiveAssignmentTarget) return;
    setStatusBusy(true);
    setError('');
    try {
      await classroomApi.archiveAssignment(archiveAssignmentTarget._id);
      setArchiveAssignmentTarget(null);
      setMessage(bg ? 'Заданието е архивирано.' : 'Assignment archived.');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setStatusBusy(false);
    }
  };

  const handleArchiveGroup = async () => {
    setStatusBusy(true);
    setError('');
    try {
      await classroomApi.archiveCourse(id);
      setConfirmArchiveGroup(false);
      setMessage(bg ? 'Групата е архивирана.' : 'Group archived.');
      navigate('/classroom/groups');
    } catch (err) {
      setError(err.message);
    } finally {
      setStatusBusy(false);
    }
  };

  const handleRestoreGroup = async () => {
    setStatusBusy(true);
    setError('');
    try {
      await classroomApi.restoreCourse(id);
      setMessage(bg ? 'Групата е възстановена.' : 'Group restored.');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setStatusBusy(false);
    }
  };

  const handleRestore = async (assignmentId) => {
    setStatusBusy(true);
    setError('');
    try {
      await classroomApi.restoreAssignment(assignmentId);
      setMessage(bg ? 'Заданието е възстановено.' : 'Assignment restored.');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setStatusBusy(false);
    }
  };

  const toolLabel = (a) => {
    const key = toolKeyFromTemplate(a.taskTemplate);
    const tool = EDU_TOOLS.find((t) => t.toolKey === key);
    if (!tool) return a.taskTemplate?.name || '—';
    return bg ? tool.titleBg : tool.titleEn;
  };

  return (
    <>
      <SEO title={course?.name || 'Group'} canonical={`/classroom/groups/${id}`} />
      <ClassroomLayout
        title={course?.name || (bg ? 'Група' : 'Group')}
        subtitle={course ? `${bg ? 'Код' : 'Code'}: ${course.code}` : ''}
      >
        <Link to="/classroom/groups" className="text-sm text-neutral-500 hover:text-black dark:hover:text-white font-['Manrope'] w-fit">
          ← {bg ? 'Към групите' : 'Back to groups'}
        </Link>

        {error && <Card className="p-4 text-sm text-red-600">{error}</Card>}
        {message && <Card className="p-4 text-sm text-green-700 dark:text-green-400">{message}</Card>}

        <ConfirmDialog
          open={Boolean(archiveAssignmentTarget)}
          title={bg ? 'Архивиране на задание?' : 'Archive assignment?'}
          message={
            archiveAssignmentTarget
              ? bg
                ? `„${archiveAssignmentTarget.title}" ще изчезне за учениците. Можете да го възстановите от „Архивирани“.`
                : `"${archiveAssignmentTarget.title}" will be hidden from students. You can restore it from Archived.`
              : ''
          }
          confirmLabel={bg ? 'Архивирай' : 'Archive'}
          cancelLabel={bg ? 'Отказ' : 'Cancel'}
          variant="danger"
          busy={statusBusy}
          onConfirm={handleArchiveAssignment}
          onCancel={() => setArchiveAssignmentTarget(null)}
        />

        <ConfirmDialog
          open={confirmArchiveGroup}
          title={bg ? 'Архивиране на група?' : 'Archive group?'}
          message={
            bg
              ? 'Групата ще изчезне от активните списъци. Учениците няма да я виждат и няма да могат да се присъединят с кода. Данните и заданията остават — възстановете от „Архивирани“ в списъка с групи.'
              : 'The group will be hidden from active lists. Students will not see it and cannot join with the code. Data and assignments remain — restore from Archived in the groups list.'
          }
          confirmLabel={bg ? 'Архивирай групата' : 'Archive group'}
          cancelLabel={bg ? 'Отказ' : 'Cancel'}
          variant="danger"
          busy={statusBusy}
          onConfirm={handleArchiveGroup}
          onCancel={() => setConfirmArchiveGroup(false)}
        />

        {loading && <Card className="p-8 text-center text-neutral-500">{bg ? 'Зареждане...' : 'Loading...'}</Card>}

        {course && (
          <>
            {isGroupArchived && (
              <Card className="p-4 border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30">
                <p className="text-sm font-['Manrope'] text-amber-900 dark:text-amber-200">
                  {bg
                    ? 'Тази група е архивирана. Учениците не я виждат; нови задания и покани са изключени.'
                    : 'This group is archived. Students cannot see it; new assignments and invites are disabled.'}
                </p>
              </Card>
            )}

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6 flex flex-col gap-4 min-h-[280px]">
              <h2 className="font-bold text-lg font-['Manrope'] text-black dark:text-white">
                {bg ? 'Покани ученици' : 'Invite students'}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope']">
                {bg
                  ? `Учениците се регистрират и въвеждат кода ${course.code} в „Присъедини се“, или добавете имейли (акаунт student).`
                  : `Students register and enter code ${course.code} under Join, or add emails below.`}
              </p>
              {!isGroupArchived ? (
              <form onSubmit={handleAddStudents} className="flex flex-col gap-3">
                <textarea
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  rows={4}
                  placeholder={bg ? 'email1@school.bg\nemail2@school.bg' : 'email1@school.bg\nemail2@school.bg'}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-['Manrope']"
                />
                <button type="submit" className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium w-fit">
                  {bg ? 'Добави по имейл' : 'Add by email'}
                </button>
              </form>
              ) : (
                <p className="text-sm text-neutral-500 font-['Manrope']">
                  {bg ? 'Възстановете групата, за да добавяте ученици.' : 'Restore the group to add students.'}
                </p>
              )}
              <ul className="mt-2 flex flex-col gap-1 max-h-48 overflow-auto">
                {(course.students || []).length === 0 ? (
                  <li className="text-sm text-neutral-400 font-['Manrope']">
                    {bg ? 'Няма добавени ученици.' : 'No students added yet.'}
                  </li>
                ) : (
                  (course.students || []).map((s) => (
                    <li key={s._id} className="text-sm font-['Manrope'] text-neutral-700 dark:text-zinc-300">
                      {s.name} · {s.email}
                    </li>
                  ))
                )}
              </ul>

              <div className="mt-auto pt-4 border-t border-stone-100 dark:border-zinc-800 flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-zinc-500 font-['Manrope']">
                  {bg ? 'Управление на групата' : 'Group management'}
                </p>
                {isGroupArchived ? (
                  <ActionButton
                    type="button"
                    variant="secondary"
                    disabled={statusBusy}
                    onClick={handleRestoreGroup}
                    className="w-fit"
                  >
                    {bg ? 'Възстанови групата' : 'Restore group'}
                  </ActionButton>
                ) : (
                  <>
                    <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope'] leading-relaxed">
                      {bg
                        ? 'Архивирането скрива групата от учениците. Данните остават — възстановяване от „Архивирани“ в списъка с групи.'
                        : 'Archiving hides the group from students. Data is kept — restore from Archived on the groups list.'}
                    </p>
                    <ActionButton
                      type="button"
                      variant="danger"
                      disabled={statusBusy}
                      onClick={() => setConfirmArchiveGroup(true)}
                      className="w-fit"
                    >
                      {bg ? 'Архивирай групата' : 'Archive group'}
                    </ActionButton>
                  </>
                )}
              </div>
            </Card>

            <Card className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h2 className="font-bold text-lg font-['Manrope'] text-black dark:text-white">
                  {showArchivedAssignments ? (bg ? 'Архивирани задания' : 'Archived assignments') : bg ? 'Задания' : 'Assignments'}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <ActionButton
                    type="button"
                    variant="outline"
                    className="text-sm px-3 py-1.5"
                    onClick={() => {
                      setShowArchivedAssignments((v) => !v);
                      setMessage('');
                    }}
                  >
                    {showArchivedAssignments ? (bg ? 'Активни' : 'Active') : bg ? 'Архивирани' : 'Archived'}
                  </ActionButton>
                  {!showArchivedAssignments && !isGroupArchived && (
                    <ActionButton
                      to={`/classroom/assignments/new?course=${id}`}
                      variant="primary"
                      className="text-sm px-3 py-1.5"
                    >
                      + {bg ? 'Ново' : 'New'}
                    </ActionButton>
                  )}
                </div>
              </div>
              {assignments.length === 0 ? (
                <p className="text-sm text-neutral-500 font-['Manrope']">
                  {showArchivedAssignments
                    ? bg
                      ? 'Няма архивирани задания.'
                      : 'No archived assignments.'
                    : bg
                      ? 'Няма задания.'
                      : 'No assignments.'}
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {assignments.map((a) => (
                    <li
                      key={a._id}
                      className="p-4 rounded-xl bg-white dark:bg-zinc-900 outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_0_rgba(0,0,0,0.2)]"
                    >
                      <div className="font-semibold text-sm text-black dark:text-white font-['Manrope']">{a.title}</div>
                      <div className="text-xs text-neutral-500 dark:text-zinc-400 mt-1 font-['Manrope']">
                        {toolLabel(a)} · {a.status} ·{' '}
                        {new Date(a.dueDate).toLocaleDateString(bg ? 'bg-BG' : 'en-US')}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-3 items-center">
                        <ActionButton
                          to={`/classroom/teaching/assignments/${a._id}`}
                          variant="primary"
                        >
                          {bg ? 'Виж задачите' : 'View problems'}
                        </ActionButton>
                        {!showArchivedAssignments && (
                          <ActionButton
                            to={`/classroom/review?assignment=${a._id}`}
                            variant="secondary"
                          >
                            {bg ? 'Предавания' : 'Submissions'}
                          </ActionButton>
                        )}
                        {!isGroupArchived && (showArchivedAssignments ? (
                          <ActionButton
                            type="button"
                            variant="secondary"
                            disabled={statusBusy}
                            onClick={() => handleRestore(a._id)}
                          >
                            {bg ? 'Възстанови' : 'Restore'}
                          </ActionButton>
                        ) : (
                          <ActionButton
                            type="button"
                            variant="danger"
                            disabled={statusBusy}
                            onClick={() => setArchiveAssignmentTarget(a)}
                          >
                            {bg ? 'Архивирай' : 'Archive'}
                          </ActionButton>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
          </>
        )}
      </ClassroomLayout>
    </>
  );
};

export default GroupDetailPage;
