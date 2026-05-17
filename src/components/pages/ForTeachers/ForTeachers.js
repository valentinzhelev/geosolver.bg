import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  const showClassroomLink = canAccessTeacherClassroom(user, { loading });
  const bg = language === 'bg';
  const [requestMsg, setRequestMsg] = useState('');
  const [requestNote, setRequestNote] = useState('');
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
        keywords="геодезия, образование, учители, преподаватели, безплатно, GeoSolver, дигитални инструменти, проверка на задачи, сканиране, класна стая, обучение"
        canonical="/for-teachers"
      />
      <Layout>
        <div className="w-full flex justify-center bg-stone-50 dark:bg-zinc-950 min-h-screen py-8 px-2 md:px-0 transition-colors">
          <div className="w-full max-w-[900px] flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h1 className="text-black dark:text-white text-xl md:text-2xl font-bold font-['Manrope'] mb-1">{t.forTeachersTitle}</h1>
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-700 p-6 md:p-8 flex flex-col gap-8 shadow-sm dark:shadow-none transition-colors">
                <div className="flex flex-col gap-3">
                <h2 className="text-base md:text-lg font-bold text-black dark:text-white font-['Manrope'] mb-2 text-center">{t.forTeachersHeadline}</h2>
                  <p className="text-base text-black dark:text-zinc-200 font-['Manrope'] leading-relaxed">
                    {t.forTeachersIntro}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((f, i) => (
                    <div key={i} className="flex flex-col gap-1 bg-stone-50 dark:bg-zinc-800 rounded-lg p-4 border border-stone-100 dark:border-zinc-700 shadow-sm transition-colors">
                      <div className="text-base font-bold text-black dark:text-white font-['Manrope'] mb-0.5">{f.title}</div>
                      <div className="text-sm text-neutral-700 dark:text-zinc-400 font-['Manrope']">{f.desc}</div>
                    </div>
                  ))}
                </div>
                {showClassroomLink && (
                  <Link
                    to="/classroom/dashboard"
                    className="inline-block px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium font-['Manrope']"
                  >
                    {language === 'bg' ? 'Отвори класната стая' : 'Open classroom'}
                  </Link>
                )}
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-500 rounded-xl flex flex-col gap-1 transition-colors">
                  <div className="text-base font-semibold text-blue-900 dark:text-blue-200 font-['Manrope']">{t.howToGetAccess}</div>
                  <div className="text-sm text-blue-900 dark:text-blue-200 font-['Manrope']">
                    {t.howToGetAccessText} <a href="mailto:team@geosolver.bg" className="text-blue-700 dark:text-blue-400 underline">team@geosolver.bg</a>.<br />
                    {t.howToGetAccessHelp}
                  </div>
                  {user?.role === 'student' && !showClassroomLink && (
                    <form onSubmit={handleTeacherRequest} className="flex flex-col gap-2 mt-2">
                      {requestStatus?.status === 'pending' && (
                        <p className="text-sm">{bg ? 'Заявката чака одобрение.' : 'Request pending.'}</p>
                      )}
                      {(!requestStatus || requestStatus.status === 'rejected') && (
                        <>
                          <textarea
                            value={requestNote}
                            onChange={(e) => setRequestNote(e.target.value)}
                            rows={2}
                            className="px-3 py-2 rounded-lg border text-sm bg-white dark:bg-zinc-900"
                            placeholder={bg ? 'Съобщение' : 'Message'}
                          />
                          <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm w-fit">
                            {bg ? 'Заяви достъп' : 'Request access'}
                          </button>
                        </>
                      )}
                      {requestMsg && <p className="text-sm">{requestMsg}</p>}
                    </form>
                  )}
                </div>
                <div className="pt-3 text-center">
                  <span className="text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope']">{t.thanksForSupport}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ForTeachers; 