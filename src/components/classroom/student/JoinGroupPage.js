import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../shared/SEO';
import ClassroomLayout from '../ClassroomLayout';
import { Card } from '../ui/Card';
import { studentClassroomApi } from '../../../services/classroomApi';
import { useTranslation } from '../../../hooks/useTranslation';

const JoinGroupPage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await studentClassroomApi.joinCourse(code.trim().toUpperCase());
      setSuccess(res.message || (bg ? 'Успешно!' : 'Success!'));
      setTimeout(() => navigate('/classroom/assignments'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title={bg ? 'Присъедини се' : 'Join group'} canonical="/classroom/join" />
      <ClassroomLayout
        title={bg ? 'Присъедини се към група' : 'Join a group'}
        subtitle={bg ? 'Въведете кода от преподавателя.' : 'Enter the code from your teacher.'}
      >
        <Card className="p-6 max-w-md">
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium font-['Manrope']">{bg ? 'Код на група' : 'Group code'}</span>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="GEO101"
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 font-mono text-lg tracking-wider bg-white dark:bg-zinc-800 text-black dark:text-white"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-700 dark:text-green-400">{success}</p>}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {loading ? (bg ? 'Присъединяване...' : 'Joining...') : bg ? 'Присъедини се' : 'Join'}
            </button>
          </form>
        </Card>
      </ClassroomLayout>
    </>
  );
};

export default JoinGroupPage;
