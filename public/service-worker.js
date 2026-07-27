const CACHE_NAME = 'guia-casamento-v3';
const OFFLINE_URL = '/offline.html';

const CACHE_FIRST_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_FIRST_ASSETS).catch((err) => {
        console.warn('Cache pre-fetch partial error:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network ONLY for non-GET or sensitive endpoints
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/auth') ||
    url.pathname.startsWith('/api/admin') ||
    url.pathname.startsWith('/api/photographer/subscription') ||
    url.pathname.startsWith('/api/webhooks') ||
    url.pathname.startsWith('/api/push') ||
    url.pathname.startsWith('/api/smtp')
  ) {
    return;
  }

  // Navigation requests: Network First with offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // Static assets: Cache First
  if (
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Default Network First
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// Push Event listener
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Guia Fotógrafo Casamento',
    body: 'Você possui uma nova notificação.',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-96.png',
    url: '/',
    data: {}
  };

  if (event.data) {
    try {
      const data = event.data.json();
      payload = { ...payload, ...data };
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/badge-96.png',
    image: payload.image || undefined,
    tag: payload.tag || 'general-notification',
    data: {
      url: payload.url || payload.actionUrl || '/',
      notificationId: payload.notificationId,
      ...payload.data
    },
    vibrate: [100, 50, 100],
    actions: payload.actions || []
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(payload.title, options),
      typeof self.registration.setAppBadge === 'function'
        ? self.registration.setAppBadge().catch(() => {})
        : Promise.resolve()
    ])
  );
});

// Notification Click Listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  let targetUrl = '/notificacoes';
  try {
    const candidate = new URL(event.notification.data?.url || '/notificacoes', self.location.origin);
    if (candidate.origin === self.location.origin) {
      targetUrl = candidate.pathname + candidate.search + candidate.hash;
    }
  } catch (_) {}
  const notificationId = event.notification.data?.notificationId;

  // Track click if notificationId exists
  if (notificationId) {
    fetch(`/api/notifications/${notificationId}/click`, { method: 'POST' }).catch(() => {});
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window open with the origin
      for (let client of windowClients) {
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
