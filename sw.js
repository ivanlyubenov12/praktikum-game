// Service worker: cache само за "черупката" на играта (index.html + иконният шрифт), за да може
// index.html да се зареди дори при студено презареждане без връзка — така собственият #offline екран
// на играта (не браузърният) успява да се покаже. custom-content.json НИКОГА не се кешира тук: винаги
// отива направо в мрежата, иначе публикуваните промени спират да достигат до всеки компютър.
const CACHE = 'balans-shell-v1';
const SHELL = ['index.html', 'vendor/MaterialIcons.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  const isFont = e.request.url.endsWith('vendor/MaterialIcons.woff2');
  if (e.request.mode !== 'navigate' && !isFont) return;   // всичко друго (включително custom-content.json) — направо в мрежата
  const key = e.request.mode === 'navigate' ? 'index.html' : 'vendor/MaterialIcons.woff2';
  e.respondWith(
    fetch(e.request)
      .then(res => { caches.open(CACHE).then(c => c.put(key, res.clone())); return res; })
      .catch(() => caches.match(key))
  );
});
