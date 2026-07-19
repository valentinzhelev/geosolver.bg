import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';
import { workspaceApi } from '../../../services/workspaceApi';

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-['Manrope'] outline-none focus:ring-2 focus:ring-black/10";
const btnPrimary =
  "px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold font-['Manrope'] disabled:opacity-50";

const ROLE_LABEL = {
  bg: { admin: 'Админ', editor: 'Редактор', viewer: 'Преглед' },
  en: { admin: 'Admin', editor: 'Editor', viewer: 'Viewer' },
};

const WorkspacePage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const [owned, setOwned] = useState([]);
  const [memberOf, setMemberOf] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newName, setNewName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [activeId, setActiveId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await workspaceApi.list();
      setOwned(res.data?.owned || []);
      setMemberOf(res.data?.memberOf || []);
      if (!activeId && (res.data?.owned?.[0]?._id || res.data?.memberOf?.[0]?._id)) {
        setActiveId(res.data?.owned?.[0]?._id || res.data?.memberOf?.[0]?._id);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    load();
  }, [load]);

  const all = [...owned, ...memberOf.filter((m) => !owned.find((o) => o._id === m._id))];
  const active = all.find((w) => w._id === activeId) || all[0];

  const create = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await workspaceApi.create(newName);
      setNewName('');
      setSuccess(bg ? 'Workspace е създаден.' : 'Workspace created.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const join = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const res = await workspaceApi.join(joinCode);
      setJoinCode('');
      setActiveId(res.data?._id || '');
      setSuccess(bg ? 'Присъединихте се към екипа.' : 'Joined the team.');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const invite = async (e) => {
    e.preventDefault();
    if (!active) return;
    setError('');
    setSuccess('');
    try {
      const res = await workspaceApi.invite(active._id, inviteEmail, inviteRole);
      setInviteEmail('');
      setSuccess(res.message || (bg ? 'Поканата е обработена.' : 'Invite processed.'));
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const changeRole = async (userId, role) => {
    if (!active) return;
    try {
      await workspaceApi.updateMemberRole(active._id, userId, role);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeMember = async (userId) => {
    if (!active) return;
    try {
      await workspaceApi.removeMember(active._id, userId);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <SEO
        title={bg ? 'Фирмен workspace – GeoSolver' : 'Firm workspace – GeoSolver'}
        description={bg ? 'Споделена среда за геодезическа фирма' : 'Shared environment for survey firms'}
        canonical="/workspace"
      />
      <Layout>
        <div className="w-full bg-stone-50 dark:bg-zinc-950 py-8 md:py-10">
          <div className="max-w-[900px] mx-auto px-4 flex flex-col gap-6">
            <div>
              <div className="text-neutral-400 text-sm font-['Manrope'] mb-1">
                <Link to="/tools" className="underline">{bg ? 'Инструменти' : 'Tools'}</Link>
                {' > Workspace'}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-['Manrope'] text-black dark:text-white">
                {bg ? 'Фирмен workspace' : 'Firm workspace'}
              </h1>
              <p className="text-neutral-500 text-sm font-['Manrope'] mt-2 leading-relaxed">
                {bg
                  ? 'Сподели проекти и точки с екипа. Създай workspace, покани колеги с код или email, свържи обекти към workspace от проектния hub.'
                  : 'Share projects and points with your team. Create a workspace, invite colleagues by code or email, link sites from the project hub.'}
              </p>
            </div>

            {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{error}</div>}
            {success && <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm font-['Manrope']">{success}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form onSubmit={create} className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800 flex flex-col gap-3">
                <h2 className="font-semibold font-['Manrope']">{bg ? 'Нов workspace' : 'New workspace'}</h2>
                <input className={inputClass} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={bg ? 'Име на фирмата / екипа' : 'Firm / team name'} required />
                <button type="submit" className={btnPrimary} disabled={!newName.trim()}>{bg ? 'Създай' : 'Create'}</button>
              </form>
              <form onSubmit={join} className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800 flex flex-col gap-3">
                <h2 className="font-semibold font-['Manrope']">{bg ? 'Присъедини се' : 'Join team'}</h2>
                <input className={inputClass} value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder={bg ? 'Invite код' : 'Invite code'} required />
                <button type="submit" className={btnPrimary} disabled={!joinCode.trim()}>{bg ? 'Влез' : 'Join'}</button>
              </form>
            </div>

            {loading ? (
              <div className="text-center text-neutral-500 font-['Manrope'] py-8">{bg ? 'Зареждане...' : 'Loading...'}</div>
            ) : all.length === 0 ? (
              <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl text-center text-neutral-500 font-['Manrope']">
                {bg ? 'Няма workspace — създай или влез с код.' : 'No workspace — create one or join with a code.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-4">
                <div className="flex flex-col gap-1">
                  {all.map((w) => (
                    <button
                      key={w._id}
                      type="button"
                      onClick={() => setActiveId(w._id)}
                      className={`text-left px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] ${
                        active?._id === w._id
                          ? 'bg-black dark:bg-white text-white dark:text-black'
                          : 'bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700'
                      }`}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>

                {active && (
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800 flex flex-col gap-4">
                    <div>
                      <h2 className="text-lg font-bold font-['Manrope']">{active.name}</h2>
                      <p className="text-xs text-neutral-500 font-['Manrope'] mt-1">
                        {bg ? 'Invite код' : 'Invite code'}: <code className="font-mono text-black dark:text-white">{active.inviteCode}</code>
                      </p>
                      <p className="text-xs text-neutral-500 font-['Manrope']">
                        {bg ? 'Собственик' : 'Owner'}: {active.owner?.name || active.owner?.email}
                      </p>
                    </div>

                    <form onSubmit={invite} className="flex flex-wrap gap-2 items-end">
                      <label className="flex-1 min-w-[180px] flex flex-col gap-1 text-xs font-medium font-['Manrope']">
                        {bg ? 'Добави по email (съществуващ акаунт)' : 'Add by email (existing account)'}
                        <input className={inputClass} type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
                      </label>
                      <label className="flex flex-col gap-1 text-xs font-medium font-['Manrope']">
                        {bg ? 'Роля' : 'Role'}
                        <select className={inputClass} value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                          <option value="viewer">{ROLE_LABEL[bg ? 'bg' : 'en'].viewer}</option>
                          <option value="editor">{ROLE_LABEL[bg ? 'bg' : 'en'].editor}</option>
                          <option value="admin">{ROLE_LABEL[bg ? 'bg' : 'en'].admin}</option>
                        </select>
                      </label>
                      <button type="submit" className={btnPrimary} disabled={!inviteEmail.trim()}>{bg ? 'Добави' : 'Add'}</button>
                    </form>
                    <p className="text-xs text-neutral-500 font-['Manrope'] -mt-2">
                      {bg
                        ? 'При настроен SMTP/Brevo се изпраща имейл. Ако няма акаунт — в имейла е invite кодът за регистрация.'
                        : 'When SMTP/Brevo is configured, an email is sent. If they have no account, the invite code is included for registration.'}
                    </p>

                    <div>
                      <h3 className="text-sm font-semibold font-['Manrope'] mb-2">{bg ? 'Членове' : 'Members'}</h3>
                      <ul className="space-y-2">
                        {(active.members || []).map((m) => (
                          <li key={m.user?._id || m.user} className="flex items-center justify-between text-sm font-['Manrope']">
                            <span>{m.user?.name || m.user?.email || m.user}</span>
                            <span className="flex items-center gap-2">
                              {String(m.user?._id || m.user) !== String(active.owner?._id || active.owner) ? (
                                <select
                                  className="text-xs px-2 py-1 rounded border border-gray-200 dark:border-zinc-700 bg-transparent"
                                  value={m.role}
                                  onChange={(e) => changeRole(m.user?._id || m.user, e.target.value)}
                                >
                                  <option value="viewer">{ROLE_LABEL[bg ? 'bg' : 'en'].viewer}</option>
                                  <option value="editor">{ROLE_LABEL[bg ? 'bg' : 'en'].editor}</option>
                                  <option value="admin">{ROLE_LABEL[bg ? 'bg' : 'en'].admin}</option>
                                </select>
                              ) : (
                                <span className="text-xs text-neutral-500">{ROLE_LABEL[bg ? 'bg' : 'en'][m.role] || m.role}</span>
                              )}
                              {String(m.user?._id || m.user) !== String(active.owner?._id || active.owner) && (
                                <button type="button" className="text-xs underline text-red-600" onClick={() => removeMember(m.user?._id || m.user)}>
                                  {bg ? 'Премахни' : 'Remove'}
                                </button>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link to="/projects" className="text-sm font-semibold underline font-['Manrope']">
                      {bg ? 'Проектен hub — свържи обект към workspace →' : 'Project hub — link site to workspace →'}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default WorkspacePage;
