
const CACHE_NAME = 'phd-thesis-v5';

// 基础资源列表
const BASE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com'
];

// 核心库（esm.sh）
const LIB_ASSETS = [
  'https://esm.sh/react@^19.2.3',
  'https://esm.sh/react-dom@^19.2.3',
  'https://esm.sh/lucide-react@^0.562.0'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('正在离线化所有论文组件...');
      // 分开缓存，防止其中一个失败导致全部失败
      cache.addAll(BASE_ASSETS).catch(e => console.error('Base assets failed', e));
      return cache.addAll(LIB_ASSETS).catch(e => console.error('Lib assets failed', e));
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // 动态缓存 esm.sh 的模块依赖
        if (response && response.status === 200 && (url.host === 'esm.sh' || url.origin === location.origin)) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // 当 localhost 服务器关闭时，所有的导航请求重定向到缓存的 index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html') || caches.match('./');
        }
      });
    })
  );
});
