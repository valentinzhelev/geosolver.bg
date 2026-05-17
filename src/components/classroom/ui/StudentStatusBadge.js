import React from 'react';
import { getStudentStatusLabel, studentStatusTone } from '../../../utils/eduStudentStatus';

const toneClasses = {
  neutral: 'bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-zinc-300',
  blue: 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
  green: 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200',
  amber: 'bg-amber-50 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200',
  purple: 'bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
  red: 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-200',
};

function StudentStatusBadge({ status, language = 'bg', className = '' }) {
  if (!status) return null;
  const tone = studentStatusTone(status);
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium font-['Manrope'] ${toneClasses[tone]} ${className}`}
    >
      {getStudentStatusLabel(status, language)}
    </span>
  );
}

export default StudentStatusBadge;
