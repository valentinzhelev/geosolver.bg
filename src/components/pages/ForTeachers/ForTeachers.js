import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../auth/AuthContext';
import { canAccessTeacherClassroom } from '../../../utils/eduRoles';
import { teacherAccessApi } from '../../../services/classroomApi';

const ForTeachers = () => {
  const { t, language } = useTranslation();
  const { user, loading } = useAuth();
  const features = t.forTeachersFeatures || [];
  const steps = t.forTeachersSteps || [];
  const planFreeFeatures = t.forTeachersPlanFreeFeatures || [];
  const planProFeatures = t.forTeachersPlanProFeatures || [];
  const showClassroomLink = canAccessTeacherClassroom(user, { loading });
  const bg = language === 'bg';
  const [requestNote, setRequestNote] = useState('');
  const [requestMsg, setRequestMsg] = useState('');
  const [requestStatus, setRequestStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && user.role === 'student') {
      teacherAccessApi.getMyRequest().then((r) => setRequestStatus(r.data)).catch(() => {});
    }
  }, [user]);

  const handleTeacherRequest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setRequestMsg('');
    try {
      const res = await teacherAccessApi.requestAccess(requestNote);
      setRequestMsg(res.message || (bg ? 'Заявката е изпратена.' : 'Request sent.'));
      setRequestStatus(res.data);
    } catch (err) {
      setRequestMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO
        title={t.forTeachersTitle}
        description={t.forTeachersDescription}
        keywords="геодезия, преподаватели, класна стая, задания, автоматична проверка, GeoSolver, образование"
        canonical="/for-teachers"
      />
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors">
          <div className="w-full max-w-[1180px] mx-auto px-4 lg:px-6 pt-6 lg:pt-16 pb-12 flex flex-col gap-10 lg:gap-14">
            {/* Hero */}
            <div className="max-w-[640px] flex flex-col gap-2">
              <h1 className="text-black dark:text-white text-2xl lg:text-3xl font-bold font-['Manrope']">
                {t.forTeachersTitle}
              </h1>
              <p className="text-neutral-500 dark:text-zinc-400 text-sm lg:text-base font-semibold font-['Manrope']">
                {t.forTeachersHeadline}
              </p>
              <p className="text-neutral-700 dark:text-zinc-300 text-sm lg:text-base font-['Manrope'] leading-relaxed mt-1">
                {t.forTeachersIntro}
              </p>
            </div>

            {/* Features */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="p-4 lg:p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-2 transition-colors"
                >
                  <h2 className="text-black dark:text-white text-base font-semibold font-['Manrope']">
                    {f.title}
                  </h2>
                  <p className="text-neutral-600 dark:text-zinc-400 text-sm font-['Manrope'] leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </section>

            {/* How to start */}
            <section className="flex flex-col gap-4">
              <h2 className="text-black dark:text-white text-lg font-bold font-['Manrope']">
                {t.forTeachersHowTitle}
              </h2>
              <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none p-0 m-0">
                {steps.map((step, i) => (
                  <li
                    key={i}
                    className="flex gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 transition-colors"
                  >
                    <span className="shrink-0 w-7 h-7 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold font-['Manrope'] text-black dark:text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm text-neutral-700 dark:text-zinc-300 font-['Manrope'] leading-relaxed pt-0.5">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Plans */}
            <section className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-5">
                <div className="flex-1 p-4 lg:p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-4 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-black dark:text-white text-lg font-semibold font-['Manrope']">
                      {t.forTeachersPlanFreeTitle}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-zinc-500 font-['Manrope']">
                      {t.forTeachersPlanFreeNote}
                    </p>
                  </div>
                  <div className="text-2xl font-bold font-['Manrope'] text-black dark:text-white">
                    {t.forTeachersPlanFreePrice}
                  </div>
                  <ul className="flex flex-col gap-2">
                    {planFreeFeatures.map((item, i) => (
                      <li
                        key={i}
                        className="px-3 py-2 bg-stone-50 dark:bg-zinc-800 rounded-lg text-xs lg:text-sm font-medium font-['Manrope'] text-black dark:text-zinc-200"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex-1 p-4 lg:p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-4 transition-colors">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-black dark:text-white text-lg font-semibold font-['Manrope']">
                      {t.forTeachersPlanProTitle}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold font-['Manrope'] bg-stone-100 dark:bg-zinc-800 text-neutral-700 dark:text-zinc-300">
                      {t.forTeachersPlanProBadge}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope'] -mt-2">
                    {t.forTeachersPlanProNote}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {planProFeatures.map((item, i) => (
                      <li
                        key={i}
                        className="px-3 py-2 bg-stone-50 dark:bg-zinc-800 rounded-lg text-xs lg:text-sm font-medium font-['Manrope'] text-black dark:text-zinc-200"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="mailto:team@geosolver.bg?subject=GeoSolver%20Classroom%20Pro"
                    className="mt-auto w-fit px-4 py-2 bg-black dark:bg-white rounded-lg text-sm font-medium font-['Manrope'] text-white dark:text-black hover:opacity-90 transition-opacity"
                  >
                    {t.forTeachersPlanProCta}
                  </a>
                </div>
              </div>

              <p className="text-center text-xs text-neutral-500 dark:text-zinc-500 font-['Manrope'] max-w-[720px] mx-auto leading-relaxed">
                {t.forTeachersStudentsNote}{' '}
                <Link
                  to="/for-students"
                  className="text-black dark:text-white underline underline-offset-2 hover:opacity-80"
                >
                  {t.forTeachersStudentsLink}
                </Link>
                .
              </p>
            </section>

            {/* Teacher access */}
            <section className="p-5 lg:p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-4 transition-colors">
              <h2 className="text-black dark:text-white text-base font-bold font-['Manrope']">
                {t.howToGetAccess}
              </h2>
              <p className="text-sm text-neutral-700 dark:text-zinc-300 font-['Manrope'] leading-relaxed">
                {t.howToGetAccessText}{' '}
                <a
                  href="mailto:team@geosolver.bg"
                  className="text-black dark:text-white font-medium underline underline-offset-2"
                >
                  team@geosolver.bg
                </a>
                . {t.howToGetAccessHelp}
              </p>
              <Link
                to="/contacts"
                className="text-sm font-medium font-['Manrope'] text-neutral-600 dark:text-zinc-400 underline underline-offset-2 w-fit hover:text-black dark:hover:text-white transition-colors"
              >
                {t.howToGetAccessContact}
              </Link>

              {user?.role === 'student' && !showClassroomLink && (
                <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-3">
                  {requestStatus?.status === 'pending' && (
                    <p className="text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope']">
                      {bg ? 'Заявката чака одобрение от администратор.' : 'Your request is pending admin review.'}
                    </p>
                  )}
                  {requestStatus?.status === 'rejected' && (
                    <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3 text-sm font-['Manrope']">
                      <p className="font-semibold text-red-900 dark:text-red-200">
                        {bg ? 'Заявката е отхвърлена' : 'Your request was rejected'}
                      </p>
                      {requestStatus.adminNote?.trim() ? (
                        <p className="mt-1 text-red-800 dark:text-red-300">{requestStatus.adminNote.trim()}</p>
                      ) : null}
                      <p className="mt-2 text-neutral-600 dark:text-zinc-400">
                        {bg ? 'Можете да подадете нова заявка по-долу.' : 'You can submit a new request below.'}
                      </p>
                    </div>
                  )}
                  {(!requestStatus || requestStatus.status === 'rejected') && (
                    <form onSubmit={handleTeacherRequest} className="flex flex-col gap-2 max-w-md">
                      <textarea
                        value={requestNote}
                        onChange={(e) => setRequestNote(e.target.value)}
                        rows={3}
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-600 text-sm bg-stone-50 dark:bg-zinc-800 text-black dark:text-white font-['Manrope'] placeholder:text-neutral-400 dark:placeholder:text-zinc-500"
                        placeholder={t.teacherRequestPlaceholder}
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium font-['Manrope'] w-fit hover:opacity-90 disabled:opacity-50 transition-opacity"
                      >
                        {submitting
                          ? bg
                            ? 'Изпращане...'
                            : 'Sending...'
                          : requestStatus?.status === 'rejected'
                            ? bg
                              ? 'Подай нова заявка'
                              : 'Submit new request'
                            : bg
                              ? 'Заяви достъп'
                              : 'Request access'}
                      </button>
                    </form>
                  )}
                  {requestMsg && (
                    <p className="text-sm font-['Manrope'] text-neutral-700 dark:text-zinc-300">{requestMsg}</p>
                  )}
                </div>
              )}
            </section>

            <section className="p-5 lg:p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-4 transition-colors">
              <h2 className="text-black dark:text-white text-base font-bold font-['Manrope']">
                {t.forTeachersThanksTitle}
              </h2>
              <p className="text-sm text-neutral-700 dark:text-zinc-300 font-['Manrope'] leading-relaxed">
                {t.forTeachersThanksP1}
              </p>
              <p className="text-sm text-neutral-700 dark:text-zinc-300 font-['Manrope'] leading-relaxed">
                {t.forTeachersThanksP2}
              </p>
              <p className="text-sm text-neutral-700 dark:text-zinc-300 font-['Manrope'] leading-relaxed">
                {t.forTeachersThanksP3}{' '}
                {t.forTeachersThanksContactBefore}{' '}
                <Link
                  to="/contacts"
                  className="text-black dark:text-white font-medium underline underline-offset-2 hover:opacity-80"
                >
                  {t.howToGetAccessContact}
                </Link>{' '}
                {t.forTeachersThanksContactAfter}
              </p>
            </section>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ForTeachers;
