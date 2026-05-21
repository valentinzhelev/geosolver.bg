import React, { useState, useEffect } from 'react';
import SEO from '../shared/SEO';
import { Link } from 'react-router-dom';
import Layout from '../layout/Layout';
import { useAuth } from './AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import PlanService from '../../services/planService';
import BillingService from '../../services/billingService';
import CalculationService from '../../services/calculationService';
import UserManagementService from '../../services/userManagementService';
import { teacherAccessApi } from '../../services/classroomApi';

const TEACHER_REQUEST_FILTERS = [
  { value: 'pending', labelBg: 'Чакащи', labelEn: 'Pending' },
  { value: 'approved', labelBg: 'Одобрени', labelEn: 'Approved' },
  { value: 'rejected', labelBg: 'Отхвърлени', labelEn: 'Rejected' },
  { value: '', labelBg: 'Всички', labelEn: 'All' },
  { value: 'archived', labelBg: 'Архивирани', labelEn: 'Archived' },
];

const REQUEST_STATUS_META = {
  pending: {
    labelBg: 'Чакаща',
    labelEn: 'Pending',
    badge:
      'bg-amber-50 text-amber-900 ring-amber-200/80 dark:bg-amber-950/50 dark:text-amber-200 dark:ring-amber-800/60',
  },
  approved: {
    labelBg: 'Одобрена',
    labelEn: 'Approved',
    badge:
      'bg-emerald-50 text-emerald-800 ring-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-800/60',
  },
  rejected: {
    labelBg: 'Отхвърлена',
    labelEn: 'Rejected',
    badge:
      'bg-stone-100 text-stone-600 ring-stone-200/80 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-600/80',
  },
};

const ADMIN_INPUT_CLASS =
  "w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-sm font-medium font-['Manrope'] text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 transition-colors";

const ADMIN_SECTION_CLASS =
  'rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] flex flex-col gap-5';

const ADMIN_TABLE_WRAP_CLASS =
  'rounded-xl border border-gray-200 dark:border-zinc-700 overflow-hidden bg-white dark:bg-zinc-900';

const formatRequestDate = (dateStr, language) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
};

const SelectChevron = ({ className = '' }) => (
  <svg
    className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-zinc-400 ${className}`}
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden
  >
    <path
      d="M5 7.5L10 12.5L15 7.5"
      stroke="currentColor"
      strokeWidth="1.15"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ADMIN_ROLE_FILTERS = [
  { value: '', labelKey: 'allRoles' },
  { value: 'student', labelKey: 'student' },
  { value: 'teacher', labelKey: 'teacher' },
  { value: 'admin', labelKey: 'administratorShort' },
];

const USER_ROLE_META = {
  student: {
    badge:
      'bg-stone-100 text-stone-700 ring-stone-200/80 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-600/80',
  },
  teacher: {
    badge:
      'bg-sky-50 text-sky-800 ring-sky-200/80 dark:bg-sky-950/50 dark:text-sky-200 dark:ring-sky-800/60',
  },
  admin: {
    badge:
      'bg-black text-white ring-black/20 dark:bg-white dark:text-black dark:ring-zinc-500',
  },
};

const AdminRoleFilterBar = ({ value, onChange, t }) => (
  <div
    className="inline-flex flex-wrap gap-1 rounded-xl bg-stone-100 dark:bg-zinc-800 p-1 shrink-0"
    role="tablist"
    aria-label={t.allRoles}
  >
    {ADMIN_ROLE_FILTERS.map((opt) => {
      const active = value === opt.value;
      return (
        <button
          key={opt.value || 'all'}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onChange(opt.value)}
          className={`rounded-lg px-3 py-2 text-sm font-medium font-['Manrope'] transition-colors whitespace-nowrap ${
            active
              ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm ring-1 ring-gray-200/80 dark:ring-zinc-600'
              : 'text-neutral-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
          }`}
        >
          {t[opt.labelKey]}
        </button>
      );
    })}
  </div>
);

const AdminRoleBadge = ({ role, t }) => {
  const meta = USER_ROLE_META[role] || USER_ROLE_META.student;
  const label =
    role === 'admin' ? t.administrator : role === 'teacher' ? t.teacher : t.student;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold font-['Manrope'] ring-1 ring-inset ${meta.badge}`}
    >
      {label}
    </span>
  );
};

const AdminRoleSelect = ({ value, onChange, disabled, t, language }) => {
  const adminOptionLabel =
    language === 'bg' ? t.administratorShort || 'Админ' : t.administratorShort || 'Admin';

  return (
    <div className="relative w-full min-w-[10.5rem] sm:min-w-[11.5rem]">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        title={value === 'admin' ? t.administrator : undefined}
        className="w-full min-w-[10.5rem] cursor-pointer appearance-none rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 py-2 pl-3 pr-10 text-sm font-medium font-['Manrope'] text-black dark:text-zinc-100 whitespace-nowrap transition-colors hover:border-gray-300 dark:hover:border-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="student">{t.student}</option>
        <option value="teacher">{t.teacher}</option>
        <option value="admin">{adminOptionLabel}</option>
      </select>
      <SelectChevron />
    </div>
  );
};

const AdminPagination = ({ currentPage, totalPages, loading, onPageChange, t }) => {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center gap-2 pt-1">
      <button
        type="button"
        className="w-8 h-8 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-zinc-800 disabled:opacity-40"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || loading}
        aria-label={t.back}
      >
        <img src="/icons/small_left_arrow.svg" alt="" className="w-3 h-3 opacity-70 dark:invert" />
      </button>
      {pages.map((pageNum) => (
        <button
          key={pageNum}
          type="button"
          className={`min-w-[2rem] h-8 px-2 rounded-lg text-sm font-medium font-['Manrope'] transition-colors ${
            currentPage === pageNum
              ? 'bg-black dark:bg-white text-white dark:text-black'
              : 'border border-gray-200 dark:border-zinc-600 text-neutral-600 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800'
          }`}
          onClick={() => onPageChange(pageNum)}
          disabled={currentPage === pageNum || loading}
        >
          {pageNum}
        </button>
      ))}
      <button
        type="button"
        className="w-8 h-8 rounded-lg border border-gray-200 dark:border-zinc-700 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-zinc-800 disabled:opacity-40"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages || loading}
        aria-label={t.next}
      >
        <img src="/icons/small_right_arrow.svg" alt="" className="w-3 h-3 opacity-70 dark:invert" />
      </button>
    </div>
  );
};

const AdminUsersTable = ({ users, loading, currentUserId, language, t, onRoleChange }) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString(language === 'bg' ? 'bg-BG' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-10 text-center text-sm text-neutral-500 dark:text-zinc-400 font-['Manrope']">{t.loading}</div>
    );
  }

  if (!users.length) {
    return (
      <div className="px-4 py-10 text-center text-sm text-neutral-500 dark:text-zinc-400 font-['Manrope'] border-t border-gray-100 dark:border-zinc-800">
        {t.noUsers}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm font-['Manrope']">
        <thead>
          <tr className="border-b border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/90">
            <th className="px-4 py-3 font-semibold text-black dark:text-white">{t.name}</th>
            <th className="px-4 py-3 font-semibold text-black dark:text-white">{t.email}</th>
            <th className="px-4 py-3 font-semibold text-black dark:text-white w-36">{t.role}</th>
            <th className="px-4 py-3 font-semibold text-black dark:text-white w-32">{t.registration}</th>
            <th className="px-4 py-3 font-semibold text-black dark:text-white min-w-[11.5rem] w-52">{t.actions}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
          {users.map((adminUser) => {
            const userId = adminUser._id || adminUser.id;
            const isSelf = userId === currentUserId;
            return (
              <tr key={userId} className="bg-white dark:bg-zinc-900 hover:bg-stone-50/80 dark:hover:bg-zinc-800/70 transition-colors">
                <td className="px-4 py-3 font-medium text-black dark:text-white">
                  {adminUser.name?.trim() || '—'}
                </td>
                <td className="px-4 py-3 text-neutral-700 dark:text-zinc-300 break-all">{adminUser.email || '—'}</td>
                <td className="px-4 py-3">
                  <AdminRoleBadge role={adminUser.role} t={t} />
                </td>
                <td className="px-4 py-3 text-neutral-600 dark:text-zinc-400 whitespace-nowrap">
                  {formatDate(adminUser.createdAt)}
                </td>
                <td className="px-4 py-3 min-w-[11.5rem]">
                  <AdminRoleSelect
                    value={adminUser.role}
                    disabled={isSelf}
                    t={t}
                    language={language}
                    onChange={(e) => onRoleChange(userId, e.target.value)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const TeacherRequestFilterBar = ({ value, onChange, language }) => {
  const isBg = language === 'bg';

  return (
    <div
      className="inline-flex flex-wrap gap-1 rounded-xl bg-stone-100 dark:bg-zinc-800 p-1"
      role="tablist"
      aria-label={isBg ? 'Филтър по статус' : 'Filter by status'}
    >
      {TEACHER_REQUEST_FILTERS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value || 'all'}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={`rounded-lg px-3 py-2 text-sm font-medium font-['Manrope'] transition-colors ${
              active
                ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm ring-1 ring-gray-200/80 dark:ring-zinc-600'
                : 'text-neutral-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            {isBg ? opt.labelBg : opt.labelEn}
          </button>
        );
      })}
    </div>
  );
};

const TeacherRejectModal = ({ open, language, note, error, submitting, onNoteChange, onClose, onSubmit }) => {
  if (!open) return null;
  const isBg = language === 'bg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/70 px-4">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-zinc-900 p-5 shadow-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700">
        <h3 className="text-lg font-bold font-['Manrope'] text-black dark:text-white">
          {isBg ? 'Отхвърляне на заявка' : 'Reject request'}
        </h3>
        <p className="mt-1 text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope']">
          {isBg
            ? 'Посочете причината — потребителят ще я види и може да подаде нова заявка.'
            : 'Provide a reason — the user will see it and may submit a new request.'}
        </p>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={4}
          className="mt-4 w-full rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 px-3 py-2 text-sm font-['Manrope'] text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 focus:border-gray-400 dark:focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10"
          placeholder={isBg ? 'Причина за отказ...' : 'Reason for rejection...'}
        />
        {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-['Manrope']">{error}</p>}
        <div className="mt-4 flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-zinc-600 text-black dark:text-zinc-200 text-sm font-semibold font-['Manrope'] hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {isBg ? 'Отказ' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-semibold font-['Manrope'] hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {submitting ? (isBg ? 'Запис...' : 'Saving...') : isBg ? 'Отхвърли' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  );
};

const TeacherRequestCard = ({ req, language, onApprove, onReject, onArchive, onDelete }) => {
  const isBg = language === 'bg';
  const statusMeta = REQUEST_STATUS_META[req.status] || REQUEST_STATUS_META.pending;
  const displayName = req.user?.name?.trim() || (isBg ? 'Без име' : 'No name');
  const email = req.user?.email || '—';

  return (
    <article className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-zinc-800 px-4 py-3 sm:px-5">
        <h3 className="min-w-0 text-base font-semibold font-['Manrope'] text-black dark:text-white truncate">{displayName}</h3>
        <span
          className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold font-['Manrope'] ring-1 ring-inset ${statusMeta.badge}`}
        >
          {isBg ? statusMeta.labelBg : statusMeta.labelEn}
        </span>
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-[7rem_1fr] gap-x-4 gap-y-2.5 px-4 py-4 sm:px-5 text-sm font-['Manrope']">
        <dt className="text-neutral-500 dark:text-zinc-400 font-medium">{isBg ? 'Имейл' : 'Email'}</dt>
        <dd className="text-black dark:text-white break-all">{email}</dd>

        <dt className="text-neutral-500 dark:text-zinc-400 font-medium">{isBg ? 'Съобщение' : 'Message'}</dt>
        <dd className="text-neutral-800 dark:text-zinc-200">
          {req.message?.trim() ? (
            <span className="block rounded-lg bg-stone-50 dark:bg-zinc-800 px-3 py-2 text-sm leading-relaxed border border-gray-100 dark:border-zinc-700 text-neutral-800 dark:text-zinc-200">
              {req.message.trim()}
            </span>
          ) : (
            <span className="text-neutral-400 dark:text-zinc-400 italic">{isBg ? 'Няма съобщение' : 'No message'}</span>
          )}
        </dd>

        <dt className="text-neutral-500 dark:text-zinc-400 font-medium">{isBg ? 'Подадена' : 'Submitted'}</dt>
        <dd className="text-black dark:text-white">{formatRequestDate(req.createdAt, language)}</dd>

        {req.reviewedAt && (
          <>
            <dt className="text-neutral-500 dark:text-zinc-400 font-medium">{isBg ? 'Прегледана' : 'Reviewed'}</dt>
            <dd className="text-black dark:text-white">{formatRequestDate(req.reviewedAt, language)}</dd>
          </>
        )}

        {req.status === 'rejected' && req.adminNote?.trim() && (
          <>
            <dt className="text-neutral-500 dark:text-zinc-400 font-medium">{isBg ? 'Причина за отказ' : 'Rejection reason'}</dt>
            <dd>
              <span className="block rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-900 leading-relaxed dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                {req.adminNote.trim()}
              </span>
            </dd>
          </>
        )}
        {req.status !== 'rejected' && req.adminNote?.trim() && (
          <>
            <dt className="text-neutral-500 dark:text-zinc-400 font-medium">{isBg ? 'Бележка' : 'Admin note'}</dt>
            <dd className="text-neutral-700 dark:text-zinc-300">{req.adminNote.trim()}</dd>
          </>
        )}
      </dl>

      {req.status === 'pending' && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 dark:border-zinc-800 bg-stone-50/60 dark:bg-zinc-800/60 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onApprove(req._id)}
              className="px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-semibold font-['Manrope'] hover:opacity-90 transition-opacity"
            >
              {isBg ? 'Одобри' : 'Approve'}
            </button>
            <button
              type="button"
              onClick={() => onReject(req._id)}
              className="px-4 py-2 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 text-sm font-semibold font-['Manrope'] border border-gray-200 dark:border-zinc-600 hover:bg-stone-50 dark:hover:bg-zinc-700 transition-colors"
            >
              {isBg ? 'Отхвърли' : 'Reject'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => onDelete(req._id)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium font-['Manrope'] text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            {isBg ? 'Изтрий' : 'Delete'}
          </button>
        </div>
      )}

      {(req.status === 'rejected' || req.archived) && (
        <div className="flex flex-wrap gap-2 border-t border-gray-100 dark:border-zinc-800 px-4 py-3 sm:px-5">
          {!req.archived && (
            <button
              type="button"
              onClick={() => onArchive(req._id)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium font-['Manrope'] text-neutral-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-600 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
            >
              {isBg ? 'Архивирай' : 'Archive'}
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(req._id)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium font-['Manrope'] text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            {isBg ? 'Изтрий' : 'Delete'}
          </button>
        </div>
      )}

      {req.status === 'approved' && !req.archived && (
        <div className="flex flex-wrap gap-2 border-t border-gray-100 dark:border-zinc-800 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => onArchive(req._id)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium font-['Manrope'] text-neutral-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-600 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
          >
            {isBg ? 'Архивирай' : 'Archive'}
          </button>
        </div>
      )}
    </article>
  );
};

const Account = () => {
  const { user, logout, refreshUser } = useAuth();
  const { t, language } = useTranslation();
  
  console.log('Account.js loaded, user:', user);
  console.log('Token in localStorage:', localStorage.getItem('token'));
  
  // Function to refresh limits
  const refreshLimits = async () => {
    try {
      console.log('Refreshing limits...');
      const limits = await CalculationService.checkLimits();
      console.log('New limits:', limits);
      setCalculationLimits(limits);
    } catch (error) {
      console.log('Failed to refresh limits:', error);
    }
  };

  // Function to reload usage history when page changes
  const reloadUsageHistory = async (page) => {
    if (!user) {
      console.log('No user, skipping history reload');
      return;
    }
    
    try {
      console.log('Reloading usage history for page:', page);
      setLoading(true);
      const calculationData = await CalculationService.getCalculationHistory(page, usageItemsPerPage);
      console.log('Calculation data received:', calculationData);
      console.log('Calculations array:', calculationData.calculations);
      console.log('Calculations array length:', calculationData.calculations?.length || 0);
      
      // Check if we have calculations
      if (!calculationData.calculations || calculationData.calculations.length === 0) {
        console.log('No calculations found in response');
        setUsageHistory([]);
        setTotalCalculations(0);
        setUsageTotalPages(1);
        return;
      }
      
      // Map calculations to display format
      const mappedHistory = calculationData.calculations.map(calc => {
        console.log('Mapping calc:', calc);
        console.log('calc.toolDisplayName:', calc.toolDisplayName);
        console.log('t.language:', language);
        
        const toolName = calc.toolDisplayName?.[language] || 
                         calc.toolDisplayName?.bg || 
                         calc.toolDisplayName?.en ||
                         calc.toolName || 
                         t.unknownTool;
        
        console.log('Mapped toolName:', toolName);
        
        return {
          tool: toolName,
          date: new Date(calc.createdAt).toLocaleString('bg-BG')
        };
      });
      
      console.log('Mapped history:', mappedHistory);
      console.log('Mapped history length:', mappedHistory.length);
      
      setUsageHistory(mappedHistory);
      
      // Backend returns pagination.total as total pages, pagination.totalItems as total count
      const totalCount = calculationData.pagination?.totalItems || 
                        (calculationData.pagination?.total ? calculationData.pagination.total * usageItemsPerPage : 0);
      setTotalCalculations(totalCount);
      setUsageTotalPages(calculationData.pagination?.total || 1);
      
      console.log('Set usageHistory to:', mappedHistory);
      console.log('Set totalCalculations to:', totalCount);
      console.log('Set usageTotalPages to:', calculationData.pagination?.total || 1);
      
      // Update planExpiryDate from backend response if available
      if (calculationData.period?.end) {
        setPlanExpiryDate(new Date(calculationData.period.end));
      }
    } catch (error) {
      console.error('Failed to reload usage history:', error);
      console.error('Error details:', error.message, error.stack);
      setUsageHistory([]);
      setTotalCalculations(0);
      setUsageTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Function to reload payment history when page changes
  const reloadPaymentHistory = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const billingSummary = await BillingService.getBillingSummary();
      const invoices = billingSummary?.invoices || [];
      setPaymentHistory(invoices.map(inv => ({
        method: billingSummary?.paymentMethod?.last4 ? `**** ${billingSummary.paymentMethod.last4}` : (language === 'bg' ? 'Карта' : 'Card'),
        brand: billingSummary?.paymentMethod?.brand || 'visa',
        amount: `${((inv.amountPaid ?? inv.amountDue ?? 0) / 100).toFixed(2)} ${String(inv.currency || '').toUpperCase()}`,
        date: inv.created ? new Date(inv.created * 1000).toLocaleString('bg-BG') : ''
      })));
    } catch (error) {
      console.log('Failed to reload payment history:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // State for real data
  const [plan, setPlan] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [usageHistory, setUsageHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [totalCalculations, setTotalCalculations] = useState(0);
  const [calculationLimits, setCalculationLimits] = useState({ used: 0, limit: 5, unlimited: false });
  const [planExpiryDate, setPlanExpiryDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [error, setError] = useState(null);
  // Admin panel state
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminRoleFilter, setAdminRoleFilter] = useState('');
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);
  const [adminTotalPages, setAdminTotalPages] = useState(1);
  const [adminTotalUsers, setAdminTotalUsers] = useState(0);
  const [teacherRequests, setTeacherRequests] = useState([]);
  const [teacherRequestsLoading, setTeacherRequestsLoading] = useState(false);
  const [teacherRequestFilter, setTeacherRequestFilter] = useState('pending');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectRequestId, setRejectRequestId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  const isProUser =
    user?.role === 'admin' ||
    user?.plan === 'pro' ||
    ['active', 'trialing'].includes(user?.subscriptionStatus);
  const displayLimit = calculationLimits.limit > 0 ? calculationLimits.limit : 5;
  const displayUsed = Math.min(calculationLimits.used, displayLimit);
  const usageProgressPct = displayLimit ? Math.min((displayUsed / displayLimit) * 100, 100) : 0;
  const getCardBrandIcon = (brand, size = 'large') => {
    const normalized = (brand || '').toLowerCase();
    const baseClass = size === 'small' ? 'w-5 h-5' : 'w-8 h-8';
    if (normalized.includes('mastercard') || normalized.includes('master')) {
      return {
        src: '/icons/mastercard.png',
        alt: 'Mastercard',
        className: size === 'small' ? 'w-6 h-5' : 'w-9 h-8'
      };
    }
    if (normalized.includes('visa')) {
      return { src: size === 'small' ? '/icons/visa_small.svg' : '/icons/visa.svg', alt: 'Visa', className: baseClass };
    }
    return { src: size === 'small' ? '/icons/visa_small.svg' : '/icons/visa.svg', alt: 'Card', className: baseClass };
  };

  // Pagination state for usage history
  const [usageCurrentPage, setUsageCurrentPage] = useState(1);
  const [usageTotalPages, setUsageTotalPages] = useState(1);
  const usageItemsPerPage = 5;
  // Don't paginate locally - we get paginated data from API
  const paginatedUsageHistory = usageHistory;

  // Pagination state for payment history
  const [paymentCurrentPage, setPaymentCurrentPage] = useState(1);
  const paymentItemsPerPage = 5;
  const paymentTotalPages = Math.ceil(paymentHistory.length / paymentItemsPerPage);
  const paginatedPaymentHistory = paymentHistory.slice((paymentCurrentPage - 1) * paymentItemsPerPage, paymentCurrentPage * paymentItemsPerPage);

  // Refresh user on mount (ensures latest plan/subscription status after billing)
  useEffect(() => {
    if (refreshUser) refreshUser();
  }, [refreshUser]);

  const handleAddPaymentMethod = async () => {
    try {
      const { url } = await BillingService.createPortalSession();
      if (url) window.location.href = url;
    } catch (err) {
      alert(err.message);
    }
  };

  // Load account data
  useEffect(() => {
    const loadAccountData = async () => {
      try {
        setLoading(true);
        
        // If user is not logged in, show free plan by default
        if (!user) {
          const plans = await PlanService.getPlans();
          const freePlan = plans.find(p => p.name === 'free');
          setPlan(freePlan);
          setSubscription(null);
          setUsageHistory([]);
          setPaymentHistory([]);
          setTotalCalculations(0);
          setPaymentMethods([]);
          setLoading(false);
          return;
        }
        
        // Load current subscription and plan (don't let errors block other data loading)
        let subscriptionData = null;
        try {
          subscriptionData = await PlanService.getCurrentSubscription();
          if (subscriptionData) {
            setSubscription(subscriptionData);
            if (subscriptionData.planId) {
              try {
                const planData = await PlanService.getPlan(subscriptionData.planId);
                setPlan(planData);
              } catch (planError) {
                console.log('Failed to load plan, using free plan');
                const plans = await PlanService.getPlans().catch(() => []);
                const freePlan = plans.find(p => p.name === 'free');
                setPlan(freePlan || {
                  name: 'free',
                  displayName: { bg: 'Безплатен план (По подразбиране)', en: 'Free Plan (Default)' },
                  limits: { calculationsPerMonth: 5, unlimited: false }
                });
              }
            } else {
              // If no planId, show free plan
              const plans = await PlanService.getPlans().catch(() => []);
              const freePlan = plans.find(p => p.name === 'free');
              setPlan(freePlan || {
                name: 'free',
                displayName: { bg: 'Безплатен план (По подразбиране)', en: 'Free Plan (Default)' },
                limits: { calculationsPerMonth: 5, unlimited: false }
              });
            }
          } else {
            // No subscription, show free plan
            setSubscription(null);
            const plans = await PlanService.getPlans().catch(() => []);
            const freePlan = plans.find(p => p.name === 'free');
            setPlan(freePlan || {
              name: 'free',
              displayName: { bg: 'Безплатен план (По подразбиране)', en: 'Free Plan (Default)' },
              limits: { calculationsPerMonth: 5, unlimited: false }
            });
          }
        } catch (subError) {
          console.log('Subscription loading error (non-blocking):', subError.message);
          // Continue with free plan - don't block other data loading
          setSubscription(null);
          try {
            const plans = await PlanService.getPlans();
            const freePlan = plans.find(p => p.name === 'free');
            setPlan(freePlan);
          } catch (planError) {
            console.log('Failed to load plans, using default free plan');
            setPlan({
              name: 'free',
              displayName: { bg: 'Безплатен план (По подразбиране)', en: 'Free Plan (Default)' },
              limits: { calculationsPerMonth: 5, unlimited: false }
            });
          }
        }
        
        // Load calculation history and limits from backend
        // History is automatically filtered to current month by backend
        try {
          console.log('Loading calculation history...');
          const calculationData = await CalculationService.getCalculationHistory(1, usageItemsPerPage);
          console.log('Calculation history received:', calculationData);
          console.log('Calculations array:', calculationData.calculations);
          console.log('Pagination:', calculationData.pagination);
          
          // Check if we have calculations
          if (!calculationData.calculations || calculationData.calculations.length === 0) {
            console.log('No calculations found in initial load');
            setUsageHistory([]);
            setTotalCalculations(0);
            setUsageTotalPages(1);
          } else {
            // Map calculations to display format
            const mappedHistory = calculationData.calculations.map(calc => {
              console.log('Mapping calc:', calc);
              console.log('calc.toolDisplayName:', calc.toolDisplayName);
              console.log('t.language:', language);
              
              const toolName = calc.toolDisplayName?.[language] || 
                               calc.toolDisplayName?.bg || 
                               calc.toolDisplayName?.en ||
                               calc.toolName || 
                               'Неизвестен инструмент';
              
              console.log('Mapped toolName:', toolName);
              
              return {
                tool: toolName,
                date: new Date(calc.createdAt).toLocaleString('bg-BG')
              };
            });
            
            console.log('Mapped history:', mappedHistory);
            console.log('Mapped history length:', mappedHistory.length);
            setUsageHistory(mappedHistory);
          }
          
          // Backend returns pagination.total as total pages, pagination.totalItems as total count
          const totalCount = calculationData.pagination.totalItems || (calculationData.pagination.total * usageItemsPerPage);
          setTotalCalculations(totalCount);
          setUsageTotalPages(calculationData.pagination.total || 1);
          
          // Update planExpiryDate from backend response if available
          if (calculationData.period?.end) {
            setPlanExpiryDate(new Date(calculationData.period.end));
          }
          
          // Load calculation limits
          console.log('Loading calculation limits...');
          const limits = await CalculationService.checkLimits();
          console.log('Limits received:', limits);
          setCalculationLimits(limits);
          
          // Set plan expiry date based on backend response or subscription
          if (limits.periodEnd) {
            setPlanExpiryDate(new Date(limits.periodEnd));
          } else if (subscriptionData?.endDate) {
            setPlanExpiryDate(new Date(subscriptionData.endDate));
          } else {
            setPlanExpiryDate(null);
          }
          // Prefer limits.used for consistent counts
          if (typeof limits.used === 'number') {
            setTotalCalculations(limits.used);
          }
        } catch (calcError) {
          console.log('No calculation history found from database');
          setUsageHistory([]);
          setTotalCalculations(0);
          setCalculationLimits({ used: 0, limit: 5, unlimited: false });
          setPlanExpiryDate(null);
        }
        
        // Load billing data from Stripe (only if user is logged in)
        try {
          const billingSummary = await BillingService.getBillingSummary();
          
          if (billingSummary?.subscription && !subscriptionData) {
            setSubscription({
              startDate: billingSummary.subscription.currentPeriodStart,
              endDate: billingSummary.subscription.currentPeriodEnd
            });
          }
          
          if (billingSummary?.paymentMethod?.last4) {
            setPaymentMethods([{
              last4: billingSummary.paymentMethod.last4,
              active: true,
              brand: billingSummary.paymentMethod.brand || 'visa'
            }]);
          } else {
            setPaymentMethods([]);
          }
          
          const invoices = billingSummary?.invoices || [];
          setPaymentHistory(invoices.map(inv => ({
            method: billingSummary?.paymentMethod?.last4 ? `**** ${billingSummary.paymentMethod.last4}` : (language === 'bg' ? 'Карта' : 'Card'),
            brand: billingSummary?.paymentMethod?.brand || 'visa',
            amount: `${((inv.amountPaid ?? inv.amountDue ?? 0) / 100).toFixed(2)} ${String(inv.currency || '').toUpperCase()}`,
            date: inv.created ? new Date(inv.created * 1000).toLocaleString('bg-BG') : ''
          })));
        } catch (paymentError) {
          console.log('No billing history found');
          setPaymentHistory([]);
          setPaymentMethods([]);
        }
        
      } catch (err) {
        console.error('Error loading account data:', err);
        // Show error for any database connection issues
        console.error('Database connection error:', err);
        setError('Failed to connect to database. Please check your internet connection and try again.');
      } finally {
        setLoading(false);
        setInitialLoadDone(true);
      }
    };

    loadAccountData();
  }, [user, language]);

  // Update limits when plan changes
  useEffect(() => {
    if (user?.role === 'admin') {
      setCalculationLimits((prev) => ({ ...prev, unlimited: true, limit: -1 }));
      return;
    }
    if (plan) {
      if (plan.name === 'free') {
        setCalculationLimits(prev => ({
          ...prev,
          limit: plan.limits?.calculationsPerMonth || 5,
          unlimited: false
        }));
      } else {
        setCalculationLimits(prev => ({
          ...prev,
          unlimited: true
        }));
      }
    }
  }, [plan, user?.role]);

  // Listen for calculation events to refresh limits and history
  // Only refresh if we're still in the same month period
  useEffect(() => {
    console.log('Setting up calculationCompleted event listener, user:', user);
    
    const handleCalculationUpdate = () => {
      console.log('Calculation completed event received!');
      
      // Check if we're still in the same month period
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      // Only refresh if we're still in the current month period
      // or if planExpiryDate is not set (first load)
      const shouldRefresh = !planExpiryDate || 
        (now >= currentMonthStart && now <= currentMonthEnd);
      
      if (shouldRefresh) {
        console.log('Refreshing limits and history (within current month period)');
        refreshLimits();
        // Also refresh usage history when new calculation is completed (always go to page 1)
        if (user) {
          console.log('User is logged in, refreshing usage history...');
          setUsageCurrentPage(1); // Reset to first page
          reloadUsageHistory(1);
        } else {
          console.log('User is not logged in, skipping history refresh');
        }
      } else {
        console.log('Skipping refresh - outside current month period');
      }
    };

    window.addEventListener('calculationCompleted', handleCalculationUpdate);
    console.log('Event listener added');
    
    return () => {
      window.removeEventListener('calculationCompleted', handleCalculationUpdate);
      console.log('Event listener removed');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, planExpiryDate]);

  // Reload usage history when page changes
  useEffect(() => {
    if (user) {
      console.log('Reloading usage history for page:', usageCurrentPage);
      reloadUsageHistory(usageCurrentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usageCurrentPage, user, planExpiryDate]);

  // Reload payment history when page changes
  useEffect(() => {
    if (user && paymentCurrentPage > 1) {
      reloadPaymentHistory(paymentCurrentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentCurrentPage, user]);

  // Load admin users list
  const loadAdminUsers = async (page = 1) => {
    // Check if user is logged in and is admin
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!user || user.role !== 'admin' || !token) {
      setAdminUsers([]);
      setAdminTotalPages(1);
      setAdminTotalUsers(0);
      return;
    }
    
    try {
      setAdminLoading(true);
      const data = await UserManagementService.getUsers(page, 20, adminSearch, adminRoleFilter);
      setAdminUsers(data.users);
      setAdminTotalPages(data.pagination.totalPages || data.pagination.total || 1);
      setAdminTotalUsers(data.pagination.totalUsers || 0);
    } catch (error) {
      console.error('Error loading admin users:', error);
      // Don't show alert if user is not logged in - just silently fail
      if (error.message !== 'Не сте влезли в системата') {
        alert(error.message || 'Грешка при зареждане на потребителите');
      }
      setAdminUsers([]);
      setAdminTotalPages(1);
      setAdminTotalUsers(0);
    } finally {
      setAdminLoading(false);
    }
  };

  const loadTeacherRequests = async () => {
    if (!user || user.role !== 'admin') return;
    setTeacherRequestsLoading(true);
    try {
      const params =
        teacherRequestFilter === 'archived'
          ? { archived: 'true' }
          : teacherRequestFilter
            ? { status: teacherRequestFilter }
            : {};
      const res = await teacherAccessApi.listRequestsAdmin(params);
      setTeacherRequests(res.data || []);
    } catch (e) {
      console.error(e);
      setTeacherRequests([]);
    } finally {
      setTeacherRequestsLoading(false);
    }
  };

  const openRejectModal = (requestId) => {
    setRejectRequestId(requestId);
    setRejectNote('');
    setRejectError('');
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    if (rejectSubmitting) return;
    setRejectModalOpen(false);
    setRejectRequestId(null);
    setRejectNote('');
    setRejectError('');
  };

  const submitRejectRequest = async () => {
    const note = rejectNote.trim();
    if (note.length < 3) {
      setRejectError(
        language === 'bg' ? 'Въведете причина (минимум 3 символа).' : 'Enter a reason (at least 3 characters).'
      );
      return;
    }
    setRejectSubmitting(true);
    setRejectError('');
    try {
      await teacherAccessApi.reviewRequestAdmin(rejectRequestId, {
        status: 'rejected',
        adminNote: note,
      });
      closeRejectModal();
      loadTeacherRequests();
    } catch (e) {
      setRejectError(e.message);
    } finally {
      setRejectSubmitting(false);
    }
  };

  const handleTeacherRequestApprove = async (requestId) => {
    try {
      await teacherAccessApi.reviewRequestAdmin(requestId, { status: 'approved' });
      loadTeacherRequests();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleTeacherRequestArchive = async (requestId) => {
    const msg =
      language === 'bg'
        ? 'Архивиране скрива заявката от списъка. Потребителят може да подаде нова, ако е отхвърлен.'
        : 'Archive hides this request. The user can submit a new one if rejected.';
    if (!window.confirm(msg)) return;
    try {
      await teacherAccessApi.archiveRequestAdmin(requestId);
      loadTeacherRequests();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleTeacherRequestDelete = async (requestId) => {
    const msg =
      language === 'bg'
        ? 'Изтриване премахва заявката напълно. Потребителят може да подаде нова заявка.'
        : 'Delete removes the request completely. The user can submit a new one.';
    if (!window.confirm(msg)) return;
    try {
      await teacherAccessApi.deleteRequestAdmin(requestId);
      loadTeacherRequests();
    } catch (e) {
      alert(e.message);
    }
  };

  // Load admin users when user is admin and search/filter changes
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAdminUsers(1);
      setAdminCurrentPage(1);
      loadTeacherRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, adminSearch, adminRoleFilter]);

  useEffect(() => {
    if (user?.role === 'admin') loadTeacherRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherRequestFilter]);

  // Load admin users when page changes
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAdminUsers(adminCurrentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminCurrentPage]);

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Сигурни ли сте, че искате да промените ролята на този потребител на "${newRole}"?`)) {
      return;
    }

    try {
      await UserManagementService.updateUserRole(userId, newRole);
      alert('Ролята е променена успешно!');
      loadAdminUsers(adminCurrentPage); // Refresh list
    } catch (error) {
      console.error('Error updating role:', error);
      alert(error.message || 'Грешка при промяна на ролята');
    }
  };

  // Default plan if no subscription
  const defaultPlan = {
    name: t.freePlan,
    daysActive: 0,
    daysToNext: 0,
  };

  if (loading && !initialLoadDone) {
    return (
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors flex flex-col items-center justify-center">
          <div className="text-black dark:text-white text-lg font-medium">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors flex flex-col items-center justify-center">
          <div className="text-red-500 text-lg font-medium">Error: {error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={t.accountTitle}
        description={t.accountDescription}
        canonical="/account"
      />
      <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors flex flex-col items-center">
        <div className="w-full max-w-[1180px] mt-8 mb-8 px-4 sm:px-0 inline-flex flex-col justify-start items-start gap-10">
          <div className="self-stretch justify-start text-black dark:text-white text-3xl font-bold font-['Manrope']">{t.accountTitle}</div>
          
          <div className="self-stretch flex flex-col lg:flex-row justify-start items-start gap-5">
            <div className="w-full max-w-sm lg:w-96 inline-flex flex-col justify-center items-center gap-5">
              <div className="self-stretch p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.50px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-start items-start gap-4 overflow-hidden">
                <div className="flex flex-col justify-start items-start gap-2">
                  <div className="justify-start text-black dark:text-white text-lg font-semibold font-['Manrope']">{user?.name || t.user}</div>
                  <div className="justify-start text-neutral-400 dark:text-zinc-400 text-base font-semibold font-['Manrope']">{user?.email || ''}</div>
                </div>
                <div className="inline-flex justify-center items-center gap-2">
                  <button onClick={logout} className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex justify-start items-center gap-3 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors">
                    <div className="justify-start text-black dark:text-white text-base font-medium font-['Manrope']">{t.logoutFromAccount}</div>
                  </button>
                  <Link
                    to="/account/settings"
                    className="w-9 h-9 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex justify-center items-center hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
                    aria-label={t.settings}
                  >
                    <img src="/icons/account_settings.svg" alt={t.settings} className="w-5 h-5 dark:invert" />
                  </Link>
                </div>
              </div>
              <div className="self-stretch rounded-[20px] flex flex-col justify-center items-center gap-1 relative overflow-hidden">
                <div className="self-stretch px-4 py-2 relative bg-black rounded-tl-xl rounded-tr-xl rounded-bl rounded-br inline-flex flex-col justify-center items-center gap-4 overflow-hidden">
                  <img
                    className="w-96 h-52 left-[380px] top-[127.42px] absolute origin-top-left rotate-180 opacity-50"
                    src="/images/gradient_wallpaper.jpg"
                    alt="Plan Gradient"
                    style={{ zIndex: 1 }}
                  />
                  <div className="text-center justify-start text-white text-lg font-semibold font-['Manrope'] z-10" style={{ opacity: 1 }}>
                    {user?.plan === 'pro'
                      ? (language === 'en' ? 'Professional Plan (Pro)' : 'Професионален план (Pro)')
                      : (plan?.displayName?.[language] || (plan?.name === 'free' ? t.freePlan : plan?.name) || defaultPlan.name)}
                  </div>
                </div>
                <div className="self-stretch p-4 bg-white dark:bg-zinc-900 rounded-tl rounded-tr rounded-bl-xl rounded-br-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.50px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-start items-start gap-4 overflow-hidden z-10 relative">
                  <div className="justify-start"><span className="text-black dark:text-white text-base font-medium font-['Manrope']">{subscription?.startDate ? Math.floor((new Date() - new Date(subscription.startDate)) / (1000 * 60 * 60 * 24)) : 0} {t.daysFromStart}</span></div>
                  <div className="justify-start"><span className="text-black dark:text-white text-base font-medium font-['Manrope']">{subscription?.endDate ? Math.floor((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : (plan?.name === 'free' ? '0' : 0)} {t.daysToNext}</span></div>
                  {(user?.hasBillingCustomer || user?.plan === 'pro') ? (
                    <button
                      onClick={async () => {
                        try {
                          const { url } = await BillingService.createPortalSession();
                          if (url) window.location.href = url;
                        } catch (err) {
                          alert(err.message);
                        }
                      }}
                      className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex justify-start items-center gap-3"
                    >
                      <div className="justify-start text-black dark:text-white text-base font-medium font-['Manrope']">{t.manageSubscription || 'Управление на абонамента'}</div>
                    </button>
                  ) : (
                    <Link to="/prices" className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex justify-start items-center gap-3">
                      <div className="justify-start text-black dark:text-white text-base font-medium font-['Manrope']">{t.changePlan}</div>
                    </Link>
                  )}
                </div>
              </div>
              <div className="self-stretch p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.50px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-start items-start gap-4 overflow-hidden">
                <div className="justify-start text-black dark:text-white text-lg font-semibold font-['Manrope']">{t.paymentMethods}</div>
                <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200 dark:outline-zinc-800" />
                {paymentMethods.map((method, index) => (
                  <div key={index} className="self-stretch inline-flex justify-between items-center">
                    <div className="flex justify-center items-center gap-4">
                      <div className={`w-12 h-6 p-1 rounded-[30px] ${method.active ? 'bg-black' : 'outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800'} flex ${method.active ? 'justify-end' : 'justify-start'} items-center gap-2`}>
                        <div className={`w-4 h-4 ${method.active ? 'bg-white dark:bg-zinc-900' : 'bg-black'} rounded-full`} />
                      </div>
                      <img {...getCardBrandIcon(method.brand)} alt={getCardBrandIcon(method.brand).alt} />
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-base font-medium font-['Manrope']">**** {method.last4}</div>
                    </div>
                    <button className="w-5 h-5 flex items-center justify-center">
                      <img src="/icons/account_x.svg" alt={t.remove} className="w-4 h-4 opacity-60" />
                    </button>
                  </div>
                ))}
                <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200 dark:outline-zinc-800" />
                <button
                  type="button"
                  onClick={handleAddPaymentMethod}
                  className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex justify-start items-center gap-3"
                >
                  <div className="justify-start text-black dark:text-white text-base font-medium font-['Manrope']">{t.addNewMethod}</div>
                </button>
              </div>
            </div>
            <div className="flex-1 w-full inline-flex flex-col justify-center items-start gap-5">
              <div className="self-stretch p-4 bg-white dark:bg-zinc-900 rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.50px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-start items-start gap-4 overflow-hidden">
        <div className="justify-start text-black dark:text-white text-lg font-semibold font-['Manrope']">{t.usageHistory}</div>
                {/* Progress Bar - Different design for free vs paid plans */}
                {!isProUser ? (
                  // Free Plan Progress Bar
                  <div className="w-full max-w-[748px] p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex flex-col justify-start items-start gap-3">
                    <div className="self-stretch inline-flex justify-between items-center">
                      <div className="justify-start">
                        <span className="text-black dark:text-white text-sm font-medium font-['Manrope']">
                          {displayUsed}/{displayLimit}
                        </span>
                        <span className="text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">
                          {' '}{t.freeCalculationsUntil}
                        </span>
                      </div>
                      <Link to="/prices" className="flex justify-start items-center gap-2">
                        <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.viewPlans}</div>
                        <img src="/icons/small_right_arrow.svg" alt={t.next} className="w-3 h-3 opacity-70 dark:invert" />
                      </Link>
                    </div>
                    <div className="w-full lg:w-[723.99px] h-2 bg-gray-200 dark:bg-zinc-700 rounded-[30px] relative">
                      <div 
                        className="h-2 bg-gradient-to-r from-amber-600 to-gray-800 rounded-[30px] transition-all duration-300"
                        style={{ 
                          width: `${usageProgressPct}%` 
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  // Paid Plan Progress Bar (always full)
                  <div className="self-stretch p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-start items-start gap-3">
                    <div className="self-stretch inline-flex justify-between items-center">
                      <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{totalCalculations} {t.calculations}</div>
                      <img src="/icons/infinity.svg" alt="Infinity" className="w-3 h-2"/>
                    </div>
                    <div
                      className="w-full h-2 rounded-[100px]"
                      style={{
                        backgroundImage: 'url(/images/account_gradient.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                  </div>
                )}
                <div className="self-stretch bg-stone-50 dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-start items-start gap-px overflow-hidden">
                  <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px">
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.tool}</div>
                    </div>
                    <div className="w-48 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.date}</div>
                    </div>
                  </div>
                  {(() => {
                    console.log('Rendering usage history:');
                    console.log('  - paginatedUsageHistory:', paginatedUsageHistory);
                    console.log('  - paginatedUsageHistory.length:', paginatedUsageHistory?.length || 0);
                    console.log('  - usageHistory state:', usageHistory);
                    console.log('  - usageHistory.length:', usageHistory?.length || 0);
                    console.log('  - usageCurrentPage:', usageCurrentPage);
                    console.log('  - usageTotalPages:', usageTotalPages);
                    
                    if (!paginatedUsageHistory || paginatedUsageHistory.length === 0) {
                      console.log('  - No history to display, showing empty message');
                      return (
                        <div className="w-full px-3 py-2 bg-white dark:bg-zinc-900 text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">Няма изчисления.</div>
                      );
                    }
                    
                    console.log('  - Rendering', paginatedUsageHistory.length, 'items');
                    return paginatedUsageHistory.map((h, i) => {
                      console.log(`  - Rendering item ${i}:`, h);
                      return (
                        <div key={i} className="self-stretch inline-flex justify-start items-start gap-px">
                          <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                            <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{h.tool || 'Неизвестен инструмент'}</div>
                          </div>
                          <div className="w-48 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                            <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{h.date || 'Няма дата'}</div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
                <div className="self-stretch inline-flex justify-center items-center gap-4">
                  <div className="flex justify-start items-center gap-2">
                    <button className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center" onClick={() => {
                      const newPage = Math.max(1, usageCurrentPage - 1);
                      setUsageCurrentPage(newPage);
                      if (user) reloadUsageHistory(newPage);
                    }} disabled={usageCurrentPage === 1 || loading}>
                      <img src="/icons/small_left_arrow.svg" alt={t.back} className="w-3 h-3 opacity-70 dark:invert" />
                    </button>
                    {Array.from({ length: usageTotalPages }, (_, i) => (
                      <button key={i} className={`w-7 px-2 py-1 rounded ${usageCurrentPage === i + 1 ? 'bg-gray-200 dark:bg-zinc-700 text-black dark:text-white' : 'outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 text-neutral-400 dark:text-zinc-400'} inline-flex flex-col justify-center items-center`} onClick={() => {
                        setUsageCurrentPage(i + 1);
                        if (user) reloadUsageHistory(i + 1);
                      }} disabled={usageCurrentPage === i + 1 || loading}>
                        <div className="justify-start text-sm font-medium font-['Manrope']">{i + 1}</div>
                      </button>
                    ))}
                    <button className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center" onClick={() => {
                      const newPage = Math.min(usageTotalPages, usageCurrentPage + 1);
                      setUsageCurrentPage(newPage);
                      if (user) reloadUsageHistory(newPage);
                    }} disabled={usageCurrentPage === usageTotalPages || usageTotalPages === 0 || loading}>
                      <img src="/icons/small_right_arrow.svg" alt={t.next} className="w-3 h-3 opacity-70 dark:invert" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="self-stretch p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-0.50px] outline-gray-200 dark:outline-zinc-800 inline-flex flex-col justify-start items-start gap-4 overflow-hidden">
                <div className="justify-start text-black dark:text-white text-lg font-semibold font-['Manrope']">{t.paymentHistory}</div>
                <div className="self-stretch bg-stone-50 dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-start items-start gap-px overflow-hidden">
                  <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px">
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.paymentMethod}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.value}</div>
                    </div>
                    <div className="w-48 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.date}</div>
                    </div>
                  </div>
                  {paginatedPaymentHistory.length === 0 ? (
                    <div className="w-full px-3 py-2 bg-white dark:bg-zinc-900 text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">Няма плащания.</div>
                  ) : (
                    paginatedPaymentHistory.map((payment, i) => (
                      <div key={i} className="self-stretch inline-flex justify-start items-center gap-px">
                        <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                          <img {...getCardBrandIcon(payment.brand, 'small')} alt={getCardBrandIcon(payment.brand, 'small').alt} />
                          <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{payment.method}</div>
                        </div>
                        <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                          <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{payment.amount}</div>
                        </div>
                        <div className="w-48 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                          <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{payment.date}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="self-stretch inline-flex justify-center items-center gap-4">
                  <div className="flex justify-start items-center gap-2">
                    <button className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center" onClick={() => {
                      const newPage = Math.max(1, paymentCurrentPage - 1);
                      setPaymentCurrentPage(newPage);
                      if (user) reloadPaymentHistory(newPage);
                    }} disabled={paymentCurrentPage === 1 || loading}>
                      <img src="/icons/small_left_arrow.svg" alt={t.back} className="w-3 h-3 opacity-70 dark:invert" />
                    </button>
                    {Array.from({ length: paymentTotalPages }, (_, i) => (
                      <button key={i} className={`w-7 px-2 py-1 rounded ${paymentCurrentPage === i + 1 ? 'bg-gray-200 dark:bg-zinc-700 text-black dark:text-white' : 'outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 text-neutral-400 dark:text-zinc-400'} inline-flex flex-col justify-center items-center`} onClick={() => {
                        setPaymentCurrentPage(i + 1);
                        if (user) reloadPaymentHistory(i + 1);
                      }} disabled={paymentCurrentPage === i + 1 || loading}>
                        <div className="justify-start text-sm font-medium font-['Manrope']">{i + 1}</div>
                      </button>
                    ))}
                    <button className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center" onClick={() => {
                      const newPage = Math.min(paymentTotalPages, paymentCurrentPage + 1);
                      setPaymentCurrentPage(newPage);
                      if (user) reloadPaymentHistory(newPage);
                    }} disabled={paymentCurrentPage === paymentTotalPages || paymentTotalPages === 0 || loading}>
                      <img src="/icons/small_right_arrow.svg" alt={t.next} className="w-3 h-3 opacity-70 dark:invert" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Panel Section - Only visible for admins */}
          {user && user.role === 'admin' && (
            <div className="self-stretch flex flex-col gap-6">
              <section className={ADMIN_SECTION_CLASS}>
                <h2 className="text-black dark:text-white text-2xl font-bold font-['Manrope']">{t.adminPanel}</h2>

                <div className="flex flex-col gap-4">
                  <input
                    type="search"
                    placeholder={t.searchByNameOrEmail}
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className={ADMIN_INPUT_CLASS}
                  />
                  <AdminRoleFilterBar
                    value={adminRoleFilter}
                    onChange={setAdminRoleFilter}
                    t={t}
                  />
                </div>

                <div className={ADMIN_TABLE_WRAP_CLASS}>
                  <AdminUsersTable
                    users={adminUsers}
                    loading={adminLoading}
                    currentUserId={user.id || user._id}
                    language={language}
                    t={t}
                    onRoleChange={handleRoleChange}
                  />
                </div>

                <AdminPagination
                  currentPage={adminCurrentPage}
                  totalPages={adminTotalPages}
                  loading={adminLoading}
                  onPageChange={setAdminCurrentPage}
                  t={t}
                />

                <p className="text-sm font-medium font-['Manrope'] text-neutral-600 dark:text-zinc-400">
                  {t.totalUsers}{' '}
                  <span className="text-black dark:text-white font-semibold">{adminTotalUsers}</span>
                </p>
              </section>

              <section className={ADMIN_SECTION_CLASS}>
                <div className="flex flex-col gap-4">
                  <h2 className="text-black dark:text-white text-xl font-bold font-['Manrope']">
                    {language === 'bg' ? 'Заявки за преподавател' : 'Teacher access requests'}
                  </h2>
                  <TeacherRequestFilterBar
                    value={teacherRequestFilter}
                    onChange={setTeacherRequestFilter}
                    language={language}
                  />
                </div>
                {teacherRequestsLoading ? (
                  <p className="text-sm text-neutral-500 dark:text-zinc-400 font-['Manrope']">{t.loading}</p>
                ) : teacherRequests.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 dark:border-zinc-600 bg-stone-50/80 dark:bg-zinc-800/50 px-4 py-8 text-center">
                    <p className="text-sm text-neutral-500 dark:text-zinc-400 font-['Manrope']">
                      {language === 'bg' ? 'Няма заявки за избрания филтър.' : 'No requests for this filter.'}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {teacherRequests.map((req) => (
                      <TeacherRequestCard
                        key={req._id}
                        req={req}
                        language={language}
                        onApprove={handleTeacherRequestApprove}
                        onReject={openRejectModal}
                        onArchive={handleTeacherRequestArchive}
                        onDelete={handleTeacherRequestDelete}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>

      <TeacherRejectModal
        open={rejectModalOpen}
        language={language}
        note={rejectNote}
        error={rejectError}
        submitting={rejectSubmitting}
        onNoteChange={setRejectNote}
        onClose={closeRejectModal}
        onSubmit={submitRejectRequest}
      />

    </Layout>
  );
};

export default Account; 