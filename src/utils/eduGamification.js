const KEY = 'geosolver_edu_gamification';

function load(userId) {
  try {
    const raw = localStorage.getItem(`${KEY}_${userId || 'anon'}`);
    return raw ? JSON.parse(raw) : { streak: 0, badges: [], lastSubmitDate: null };
  } catch {
    return { streak: 0, badges: [], lastSubmitDate: null };
  }
}

function save(userId, data) {
  localStorage.setItem(`${KEY}_${userId || 'anon'}`, JSON.stringify(data));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getEduGamification(userId) {
  return load(userId);
}

export function recordEduSubmission(userId, { onTime = true } = {}) {
  const data = load(userId);
  const today = todayKey();
  if (onTime) {
    if (data.lastSubmitDate === today) {
      /* same day */
    } else if (
      data.lastSubmitDate &&
      new Date(data.lastSubmitDate).getTime() === new Date(today).getTime() - 86400000
    ) {
      data.streak += 1;
    } else {
      data.streak = 1;
    }
    data.lastSubmitDate = today;
  }
  const badges = new Set(data.badges || []);
  if (data.streak >= 3) badges.add('streak_3');
  if (data.streak >= 7) badges.add('streak_7');
  badges.add('first_submit');
  data.badges = [...badges];
  save(userId, data);
  return data;
}

export function badgeLabel(id, bg) {
  const map = {
    first_submit: bg ? 'Първо предаване' : 'First submit',
    streak_3: bg ? 'Серия 3 дни' : '3-day streak',
    streak_7: bg ? 'Серия 7 дни' : '7-day streak',
  };
  return map[id] || id;
}
