// SmartCon Service Worker - offline support
// v27: Score UX clarity — semantic labels (완벽/우수/양호/보통/주의/부적합/위험) + A-F grades + explicit "↑ 높을수록 좋음" indicator (eliminates ambiguity)
const CACHE_NAME = 'smartcon-v27-score-ux';
const urlsToCache = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

// Network-First for HTML documents — always fetch fresh HTML when online
// Cache-First for static assets (icons, manifest) — fast loading
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isHTML =
    event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    url.pathname.endsWith('.html') ||
    url.pathname === '/' ||
    url.pathname === '';

  if (isHTML) {
    // Network-First: 항상 최신 HTML을 네트워크에서 받아옴. 오프라인 시만 캐시 fallback.
    event.respondWith(
      fetch(event.request)
        .then((fetchRes) => {
          const resClone = fetchRes.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try { cache.put(event.request, resClone); } catch(e) {}
          });
          return fetchRes;
        })
        .catch(() =>
          caches.match(event.request).then((r) => r || caches.match('./index.html'))
        )
    );
    return;
  }

  // Cache-First for static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchRes) => {
        return caches.open(CACHE_NAME).then((cache) => {
          try { cache.put(event.request, fetchRes.clone()); } catch(e) {}
          return fetchRes;
        });
      }).catch(() => caches.match('./index.html'));
    })
  );
});

// 메시지로 강제 업데이트 트리거 지원 (앱 내에서 호출 가능)
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
