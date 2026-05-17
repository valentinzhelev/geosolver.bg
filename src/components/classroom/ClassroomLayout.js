import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../layout/Layout';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../auth/AuthContext';
import { canAccessTeacherClassroom, canAccessStudentClassroom } from '../../utils/eduRoles';
import NotificationBell from './ui/NotificationBell';

const navTeacher = [
  { to: '/classroom/dashboard', labelBg: 'Днес', labelEn: 'Today', end: true },
  { to: '/classroom/groups', labelBg: 'Групи', labelEn: 'Groups' },
  { to: '/classroom/assignments/new', labelBg: 'Ново задание', labelEn: 'New assignment' },
  { to: '/classroom/review', labelBg: 'Преглед', labelEn: 'Review' },
];

const navStudent = [
  { to: '/classroom/assignments', labelBg: 'Моите задания', labelEn: 'My assignments', end: true },
  { to: '/classroom/join', labelBg: 'Присъедини се', labelEn: 'Join group' },
];

function NavLink({ to, label, end }) {
  const location = useLocation();
  const active = end
    ? location.pathname === to
    : location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium font-['Manrope'] transition-colors ${
        active
          ? 'bg-black text-white dark:bg-white dark:text-black'
          : 'text-neutral-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-800'
      }`}
    >
      {label}
    </Link>
  );
}

const ClassroomLayout = ({ children, title, subtitle }) => {
  const { language } = useTranslation();
  const { user, loading } = useAuth();
  const isTeacher = canAccessTeacherClassroom(user, { loading });
  const isStudent = canAccessStudentClassroom(user, { loading });
  const nav = isTeacher ? navTeacher : isStudent ? navStudent : [];

  return (
    <Layout>
      <div className="w-full min-h-[calc(100vh-120px)] bg-stone-50 dark:bg-zinc-950 py-6 md:py-10 transition-colors">
        <div className="max-w-[1180px] mx-auto px-4 lg:px-6 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-neutral-400 dark:text-zinc-500 font-['Manrope'] uppercase tracking-wide mb-1">
                GeoSolver Edu
              </p>
              <h1 className="text-2xl md:text-3xl font-bold font-['Manrope'] text-black dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope'] mt-1 max-w-2xl">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {user && <NotificationBell />}
              {nav.length > 0 && (
                <nav className="flex flex-wrap gap-1.5 p-1 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 w-fit max-w-full overflow-x-auto">
                  {nav.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      label={language === 'bg' ? item.labelBg : item.labelEn}
                    />
                  ))}
                </nav>
              )}
            </div>
          </div>
          {children}
        </div>
      </div>
    </Layout>
  );
};

export default ClassroomLayout;
