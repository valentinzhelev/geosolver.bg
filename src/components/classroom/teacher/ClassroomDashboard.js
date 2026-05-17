import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../shared/SEO';
import ClassroomLayout from '../ClassroomLayout';
import { Card, StatCard, EmptyState } from '../ui/Card';
import { classroomApi } from '../../../services/classroomApi';
import { useTranslation } from '../../../hooks/useTranslation';

const ClassroomDashboard = () => {
  const { language } = useTranslation();
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

  return (
    <>
      <SEO
        title={bg ? 'Класна стая — GeoSolver Edu' : 'Classroom — GeoSolver Edu'}
        description={bg ? 'Образователен панел GeoSolver' : 'GeoSolver educational panel'}
        canonical="/classroom"
      />
      <ClassroomLayout
        title={bg ? 'Днес' : 'Today'}
        subtitle={
          bg
            ? 'Преглед на групите, заданията и чакащите предавания.'
            : 'Overview of groups, assignments and pending submissions.'
        }
      >
        {loading && (
          <Card className="p-8 text-center text-neutral-500 dark:text-zinc-400 font-['Manrope']">
            {bg ? 'Зареждане...' : 'Loading...'}
          </Card>
        )}
        {error && (
          <Card className="p-6 text-red-600 dark:text-red-400 text-sm font-['Manrope']">{error}</Card>
        )}
        {!loading && data && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label={bg ? 'Групи' : 'Groups'} value={data.totalGroups} />
              <StatCard label={bg ? 'Ученици' : 'Students'} value={data.totalStudents} />
              <StatCard
                label={bg ? 'Активни задания' : 'Active assignments'}
                value={data.activeAssignments}
              />
              <StatCard
                label={bg ? 'За преглед' : 'To review'}
                value={data.pendingReviews}
                hint={data.dueSoon ? `${data.dueSoon} ${bg ? 'изтичат скоро' : 'due soon'}` : null}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold font-['Manrope'] text-black dark:text-white">
                    {bg ? 'Моите групи' : 'My groups'}
                  </h2>
                  <Link
                    to="/classroom/groups"
                    className="text-sm text-neutral-500 hover:text-black dark:hover:text-white font-['Manrope']"
                  >
                    {bg ? 'Всички →' : 'All →'}
                  </Link>
                </div>
                {data.groups?.length === 0 ? (
                  <p className="text-sm text-neutral-500 font-['Manrope']">
                    {bg ? 'Все още нямате групи.' : 'No groups yet.'}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {data.groups.map((g) => (
                      <li key={g._id || g.id}>
                        <Link
                          to={`/classroom/groups/${g._id || g.id}`}
                          className="flex justify-between p-3 rounded-lg bg-stone-50 dark:bg-zinc-800 border border-stone-100 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600 transition-colors"
                        >
                          <span className="font-medium font-['Manrope'] text-black dark:text-white">
                            {g.name}
                          </span>
                          <span className="text-xs text-neutral-500 font-mono">{g.code}</span>
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
                    className="text-sm text-neutral-500 hover:text-black dark:hover:text-white font-['Manrope']"
                  >
                    {bg ? 'Преглед →' : 'Review →'}
                  </Link>
                </div>
                {data.recentActivity?.length === 0 ? (
                  <p className="text-sm text-neutral-500 font-['Manrope']">
                    {bg ? 'Няма предавания.' : 'No submissions yet.'}
                  </p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {data.recentActivity.map((a) => (
                      <li
                        key={a.id}
                        className="p-3 rounded-lg bg-stone-50 dark:bg-zinc-800 text-sm font-['Manrope']"
                      >
                        <div className="font-medium text-black dark:text-white">{a.studentName}</div>
                        <div className="text-neutral-500 dark:text-zinc-400">
                          {a.assignmentTitle}
                          {a.score != null && ` · ${Math.round(a.score)}%`}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/classroom/assignments/new"
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium font-['Manrope']"
              >
                {bg ? 'Създай задание' : 'Create assignment'}
              </Link>
              <Link
                to="/classroom/review"
                className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 text-sm font-medium font-['Manrope'] text-black dark:text-white"
              >
                {bg ? 'Опашка за преглед' : 'Review queue'}
              </Link>
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
