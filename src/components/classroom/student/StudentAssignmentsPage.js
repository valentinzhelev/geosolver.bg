import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../shared/SEO';
import ClassroomLayout from '../ClassroomLayout';
import { Card, EmptyState } from '../ui/Card';
import { studentClassroomApi } from '../../../services/classroomApi';
import { useTranslation } from '../../../hooks/useTranslation';
import { toolKeyFromTemplate } from '../../../config/eduTools';
import { EDU_TOOLS } from '../../../config/eduTools';

const StudentAssignmentsPage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    studentClassroomApi
      .listAssignments()
      .then((res) => setList(res.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const toolName = (a) => {
    const key = toolKeyFromTemplate(a.taskTemplate);
    const t = EDU_TOOLS.find((x) => x.toolKey === key);
    return t ? (bg ? t.titleBg : t.titleEn) : a.taskTemplate?.name;
  };

  return (
    <>
      <SEO title={bg ? 'Моите задания' : 'My assignments'} canonical="/classroom/assignments" />
      <ClassroomLayout
        title={bg ? 'Моите задания' : 'My assignments'}
        subtitle={bg ? 'Задачи от преподавателите ви.' : 'Tasks from your teachers.'}
      >
        {error && <Card className="p-4 text-sm text-red-600">{error}</Card>}
        {loading && <Card className="p-8 text-center text-neutral-500">{bg ? 'Зареждане...' : 'Loading...'}</Card>}
        {!loading && list.length === 0 && (
          <EmptyState
            title={bg ? 'Няма задания' : 'No assignments'}
            description={bg ? 'Присъединете се към група с код от преподавателя.' : 'Join a group with your teacher\'s code.'}
            action={
              <Link to="/classroom/join" className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium">
                {bg ? 'Присъедини се' : 'Join group'}
              </Link>
            }
          />
        )}
        <div className="flex flex-col gap-3">
          {list.map((a) => (
            <Link key={a._id} to={`/classroom/assignments/${a._id}`}>
              <Card className="p-5 hover:outline-gray-300 dark:hover:outline-zinc-600 transition-colors">
                <div className="flex justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-bold text-black dark:text-white font-['Manrope']">{a.title}</h3>
                    <p className="text-sm text-neutral-500 mt-1">
                      {a.course?.name} · {toolName(a)}
                    </p>
                  </div>
                  <div className="text-right text-sm font-['Manrope']">
                    <div className="text-neutral-600 dark:text-zinc-400">
                      {bg ? 'Краен срок' : 'Due'}: {new Date(a.dueDate).toLocaleString(bg ? 'bg-BG' : 'en-US')}
                    </div>
                    <div className="mt-1 font-medium text-black dark:text-white">
                      {a.submissionStatus === 'not_submitted'
                        ? bg
                          ? 'Не е предадено'
                          : 'Not submitted'
                        : `${a.submissionScore != null ? Math.round(a.submissionScore) + '%' : ''} · ${a.submissionStatus}`}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </ClassroomLayout>
    </>
  );
};

export default StudentAssignmentsPage;
