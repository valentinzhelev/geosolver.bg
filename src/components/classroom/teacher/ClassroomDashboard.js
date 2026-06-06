import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../shared/SEO';
import ClassroomLayout from '../ClassroomLayout';
import { Card, StatCard, EmptyState } from '../ui/Card';
import { classroomApi } from '../../../services/classroomApi';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../auth/AuthContext';
import { relativeTime, greeting } from '../../../utils/eduRelativeTime';

const Icon = ({ path, className = 'w-5 h-5' }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden
  >
    {path}
  </svg>
);

const ICONS = {
  groups: <Icon path={<><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></>} />,
  students: <Icon path={<><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></>} />,
  assignments: <Icon path={<><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6M9 13h6M9 17h4" /></>} />,
  review: <Icon path={<><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></>} />,
  bolt: <Icon path={<path d="M13 2L3 14h9l-1 8 10-12h-9z" />} />,
  clock: <Icon path={<><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>} />,
  arrow: <Icon path={<path d="M5 12h14M12 5l7 7-7 7" />} className="w-4 h-4" />,
};

const scoreTone = (score) => {
  if (score == null) return 'text-neutral-500 dark:text-zinc-400';
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
};

const QuickAction = ({ to, icon, title, desc }) => (
  <Link
    to={to}
    className="group flex items-start gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 hover:-translate-y-0.5 hover:shadow-lg hover:outline-gray-400 dark:hover:outline-zinc-500 transition-all duration-200 no-underline"
  >
    <span className="shrink-0 w-10 h-10 rounded-lg bg-stone-100 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center transition-colors group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black">
      {icon}
    </span>
    <span className="flex flex-col">
      <span className="text-sm font-semibold font-['Manrope'] text-black dark:text-white">{title}</span>
      <span className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">{desc}</span>
    </span>
  </Link>
);

const SkeletonGrid = () => (
  <div className="flex flex-col gap-6 animate-pulse">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-28 rounded-xl bg-stone-200/70 dark:bg-zinc-800/70" />
      ))}
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="h-64 rounded-xl bg-stone-200/70 dark:bg-zinc-800/70" />
      <div className="h-64 rounded-xl bg-stone-200/70 dark:bg-zinc-800/70" />
    </div>
  </div>
);

const ClassroomDashboard = () => {
  const { language } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    classroomApi
      .getOverview()
      .then((res) => setData(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const bg = language === 'bg';
  const needsAttention = !!data && (data.pendingReviews > 0 || data.dueSoon > 0);

  return (
    <>
      <SEO
        title={bg ? 'Класна стая — GeoSolver Edu' : 'Classroom — GeoSolver Edu'}
        description={bg ? 'Образователен панел GeoSolver' : 'GeoSolver educational panel'}
        canonical="/classroom"
      />
      <ClassroomLayout
        title={greeting(language, user?.name)}
        subtitle={
          bg
            ? 'Ето какво се случва в часовете ви днес.'
            : 'Here is what is happening in your classes today.'
        }
      >
        {loading && <SkeletonGrid />}
        {error && (
          <Card className="p-6 text-red-600 dark:text-red-400 text-sm font-['Manrope']">{error}</Card>
        )}

        {!loading && data && (
          <>
            {/* Priority banner */}
            {needsAttention && (
              <Card className="p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 outline-amber-300 dark:outline-amber-700/60 bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-950/20 dark:to-zinc-900 animate-gai-fade-up">
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                    {ICONS.bolt}
                  </span>
                  <div>
                    <h2 className="text-base font-bold font-['Manrope'] text-black dark:text-white">
                      {bg ? 'Изисква вниманието ви' : 'Needs your attention'}
                    </h2>
                    <p className="text-sm text-neutral-600 dark:text-zinc-300 font-['Manrope']">
                      {data.pendingReviews > 0 &&
                        (bg
                          ? `${data.pendingReviews} предавания чакат преглед`
                          : `${data.pendingReviews} submissions awaiting review`)}
                      {data.pendingReviews > 0 && data.dueSoon > 0 && ' · '}
                      {data.dueSoon > 0 &&
                        (bg
                          ? `${data.dueSoon} задания изтичат до 48ч`
                          : `${data.dueSoon} assignments due within 48h`)}
                    </p>
                  </div>
                </div>
                <Link
                  to="/classroom/review"
                  className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold font-['Manrope'] hover:opacity-90 transition-opacity"
                >
                  {bg ? 'Към прегледа' : 'Go to review'}
                  {ICONS.arrow}
                </Link>
              </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label={bg ? 'Групи' : 'Groups'}
                value={data.totalGroups}
                icon={ICONS.groups}
                accent="blue"
                to="/classroom/groups"
              />
              <StatCard
                label={bg ? 'Ученици' : 'Students'}
                value={data.totalStudents}
                icon={ICONS.students}
                accent="purple"
              />
              <StatCard
                label={bg ? 'Активни задания' : 'Active assignments'}
                value={data.activeAssignments}
                icon={ICONS.assignments}
                accent="green"
                hint={
                  data.totalAssignments
                    ? bg
                      ? `${data.totalAssignments} общо`
                      : `${data.totalAssignments} total`
                    : null
                }
              />
              <StatCard
                label={bg ? 'За преглед' : 'To review'}
                value={data.pendingReviews}
                icon={ICONS.review}
                accent="amber"
                to="/classroom/review"
                highlight={data.dueSoon > 0}
                hint={data.dueSoon ? `${data.dueSoon} ${bg ? 'изтичат скоро' : 'due soon'}` : null}
              />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <QuickAction
                to="/classroom/assignments/new"
                icon={ICONS.assignments}
                title={bg ? 'Създай задание' : 'Create assignment'}
                desc={bg ? 'Свържи с калкулатор' : 'Link to a calculator'}
              />
              <QuickAction
                to="/classroom/groups"
                icon={ICONS.groups}
                title={bg ? 'Управление на групи' : 'Manage groups'}
                desc={bg ? 'Покани ученици' : 'Invite students'}
              />
              <QuickAction
                to="/classroom/review"
                icon={ICONS.review}
                title={bg ? 'Опашка за преглед' : 'Review queue'}
                desc={bg ? 'Оцени предавания' : 'Grade submissions'}
              />
            </div>

            {/* Groups + Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold font-['Manrope'] text-black dark:text-white">
                    {bg ? 'Моите групи' : 'My groups'}
                  </h2>
                  <Link
                    to="/classroom/groups"
                    className="text-sm text-neutral-500 dark:text-zinc-400 hover:text-black dark:hover:text-white font-['Manrope']"
                  >
                    {bg ? 'Всички →' : 'All →'}
                  </Link>
                </div>
                {data.groups?.length === 0 ? (
                  <p className="text-sm text-neutral-500 dark:text-zinc-400 font-['Manrope']">
                    {bg ? 'Все още нямате групи.' : 'No groups yet.'}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {data.groups.slice(0, 5).map((g) => (
                      <li key={g._id || g.id}>
                        <Link
                          to={`/classroom/groups/${g._id || g.id}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-stone-50 dark:bg-zinc-800 border border-stone-100 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500 transition-colors group"
                        >
                          <span className="flex items-center gap-3 min-w-0">
                            <span className="shrink-0 w-8 h-8 rounded-lg bg-white dark:bg-zinc-900 text-black dark:text-white flex items-center justify-center text-xs font-bold font-['Manrope'] border border-stone-200 dark:border-zinc-700">
                              {(g.name || '?').slice(0, 2).toUpperCase()}
                            </span>
                            <span className="flex flex-col min-w-0">
                              <span className="font-medium font-['Manrope'] text-black dark:text-white truncate">
                                {g.name}
                              </span>
                              <span className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
                                {g.studentCount ?? 0} {bg ? 'ученици' : 'students'}
                              </span>
                            </span>
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-zinc-400 font-mono shrink-0">
                            {g.code}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  to="/classroom/groups"
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium font-['Manrope'] w-fit hover:opacity-90 transition-opacity"
                >
                  {bg ? '+ Нова група' : '+ New group'}
                </Link>
              </Card>

              <Card className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold font-['Manrope'] text-black dark:text-white">
                    {bg ? 'Последна активност' : 'Recent activity'}
                  </h2>
                  <Link
                    to="/classroom/review"
                    className="text-sm text-neutral-500 dark:text-zinc-400 hover:text-black dark:hover:text-white font-['Manrope']"
                  >
                    {bg ? 'Преглед →' : 'Review →'}
                  </Link>
                </div>
                {data.recentActivity?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-8 gap-2">
                    <span className="w-10 h-10 rounded-full bg-stone-100 dark:bg-zinc-800 text-neutral-400 flex items-center justify-center">
                      {ICONS.clock}
                    </span>
                    <p className="text-sm text-neutral-500 dark:text-zinc-400 font-['Manrope']">
                      {bg ? 'Няма предавания все още.' : 'No submissions yet.'}
                    </p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {data.recentActivity.slice(0, 6).map((a) => (
                      <li
                        key={a.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="shrink-0 w-8 h-8 rounded-full bg-stone-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300 flex items-center justify-center text-xs font-bold font-['Manrope']">
                            {(a.studentName || '?').slice(0, 1).toUpperCase()}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white truncate">
                              {a.studentName}
                            </span>
                            <span className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope'] truncate">
                              {a.assignmentTitle}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          {a.score != null && (
                            <span className={`text-sm font-bold font-['Manrope'] ${scoreTone(a.score)}`}>
                              {Math.round(a.score)}%
                            </span>
                          )}
                          {a.submittedAt && (
                            <span className="text-[11px] text-neutral-400 dark:text-zinc-500 font-['Manrope']">
                              {relativeTime(a.submittedAt, language)}
                            </span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          </>
        )}

        {!loading && !data && !error && (
          <EmptyState
            title={bg ? 'Добре дошли в GeoSolver Edu' : 'Welcome to GeoSolver Edu'}
            description={
              bg
                ? 'Създайте първата си група и задайте упражнение към калкулаторите.'
                : 'Create your first group and assign work linked to calculators.'
            }
            action={
              <Link
                to="/classroom/groups"
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium"
              >
                {bg ? 'Започни' : 'Get started'}
              </Link>
            }
          />
        )}
      </ClassroomLayout>
    </>
  );
};

export default ClassroomDashboard;
