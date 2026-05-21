const STORAGE_KEY = 'geosolver-lang';

/** Current UI language for API requests (bg | en). */
export function getApiLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' ? 'en' : 'bg';
  } catch {
    return 'bg';
  }
}

/** Headers to send so the backend returns localized messages. */
export function getApiLanguageHeaders(extra = {}) {
  return {
    'X-GeoSolver-Language': getApiLanguage(),
    ...extra,
  };
}

const FALLBACK_ERRORS = {
  bg: {
    403: 'Нямате достъп до тази функция.',
    404: 'API endpoint не е намерен — рестартирайте backend с последния код.',
    default: (status) => `Грешка ${status}`,
  },
  en: {
    403: 'You do not have access to this feature.',
    404: 'API endpoint not found — restart the backend with the latest code.',
    default: (status) => `Error ${status}`,
  },
};

export function getNetworkErrorMessage() {
  return getApiLanguage() === 'en'
    ? 'Could not connect to the server.'
    : 'Грешка при връзка със сървъра.';
}

const AUTH_CLIENT_FALLBACKS = {
  bg: {
    login: 'Грешка при вход.',
    register: 'Грешка при регистрация.',
    forgot: 'Грешка при заявка за нова парола.',
    forgotSuccess: 'Изпратен е email за възстановяване на парола.',
    changePassword: 'Грешка при смяна на паролата.',
  },
  en: {
    login: 'Login failed.',
    register: 'Registration failed.',
    forgot: 'Password reset request failed.',
    forgotSuccess: 'A password reset email has been sent.',
    changePassword: 'Failed to change password.',
  },
};

export function getAuthClientFallback(key) {
  const lang = getApiLanguage();
  return (AUTH_CLIENT_FALLBACKS[lang] || AUTH_CLIENT_FALLBACKS.bg)[key];
}

const ADMIN_CLIENT_FALLBACKS = {
  bg: {
    notSignedIn: 'Не сте влезли в системата',
    loadUsers: 'Грешка при зареждане на потребителите',
    loadUser: 'Грешка при зареждане на потребителя',
    changeRole: 'Грешка при промяна на ролята',
    deleteUser: 'Грешка при изтриване на потребителя',
  },
  en: {
    notSignedIn: 'You are not signed in',
    loadUsers: 'Failed to load users',
    loadUser: 'Failed to load user',
    changeRole: 'Failed to change role',
    deleteUser: 'Failed to delete user',
  },
};

export function getAdminClientFallback(key) {
  const lang = getApiLanguage();
  return (ADMIN_CLIENT_FALLBACKS[lang] || ADMIN_CLIENT_FALLBACKS.bg)[key];
}

/** Client-side fallback when the response has no message body. */
export function getApiErrorFallback(status) {
  const lang = getApiLanguage();
  const pack = FALLBACK_ERRORS[lang] || FALLBACK_ERRORS.bg;
  if (status === 403) return pack[403];
  if (status === 404) return pack[404];
  return pack.default(status);
}
