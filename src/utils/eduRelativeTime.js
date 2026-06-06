/** Lightweight relative time formatter for classroom activity. */
export function relativeTime(dateInput, language = 'bg') {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';

  const bg = language === 'bg';
  const diffMs = Date.now() - date.getTime();
  const sec = Math.round(diffMs / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);

  if (sec < 60) return bg ? 'сега' : 'just now';
  if (min < 60) return bg ? `преди ${min} мин` : `${min} min ago`;
  if (hr < 24) return bg ? `преди ${hr} ч` : `${hr}h ago`;
  if (day < 7) return bg ? `преди ${day} д` : `${day}d ago`;

  return date.toLocaleDateString(bg ? 'bg-BG' : 'en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

/** Time-of-day greeting. */
export function greeting(language = 'bg', name = '') {
  const h = new Date().getHours();
  const bg = language === 'bg';
  let part;
  if (h < 12) part = bg ? 'Добро утро' : 'Good morning';
  else if (h < 18) part = bg ? 'Добър ден' : 'Good afternoon';
  else part = bg ? 'Добър вечер' : 'Good evening';
  const first = (name || '').trim().split(/\s+/)[0];
  return first ? `${part}, ${first}` : part;
}
