const CACHE_SHELL = 'geosolver-shell-v3';
const CACHE_RUNTIME = 'geosolver-runtime-v3';

const SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  '/icons/favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_SHELL).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_SHELL && k !== CACHE_RUNTIME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isNavigationRequest(request) {
  return request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/static/') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/images/') ||
    /\.(js|css|woff2?|png|svg|jpg|jpeg|webp)$/i.test(pathname)
  );
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache API — always network
  if (url.pathname.startsWith('/api/')) return;

  if (isNavigationRequest(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_SHELL).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request)
          .then((response) => {
            if (response && response.status === 200) {
              const copy = response.clone();
              caches.open(CACHE_RUNTIME).then((cache) => cache.put(event.request, copy));
            }
            return response;
          })
          .catch(() => null);
        return cached || fetchPromise.then((r) => r || caches.match('/index.html'));
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_RUNTIME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => null);
      return cached || network.then((r) => r || caches.match('/index.html'));
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
