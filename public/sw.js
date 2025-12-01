/**
 * Service Worker for Lottery Results
 * Service Worker tối ưu caching cho kết quả xổ số
 */

const CACHE_NAME = 'lottery-results-v1';
const API_CACHE_NAME = 'lottery-api-v1';
const STATIC_CACHE_NAME = 'lottery-static-v1';

// Cache strategies
const CACHE_STRATEGIES = {
    // API responses - cache first, network fallback
    API: 'cache-first',
    // Static assets - cache first
    STATIC: 'cache-first',
    // HTML pages - network first, cache fallback
    HTML: 'network-first'
};

// Cache durations (in milliseconds)
const CACHE_DURATIONS = {
    API: 5 * 60 * 1000, // 5 minutes
    STATIC: 24 * 60 * 60 * 1000, // 24 hours
    HTML: 60 * 60 * 1000 // 1 hour
};

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME &&
                        cacheName !== API_CACHE_NAME &&
                        cacheName !== STATIC_CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Skip streaming/audio requests that use Range headers (Chrome bug: ERR_CACHE_OPERATION_NOT_SUPPORTED)
    if (request.headers.has('range') || request.destination === 'audio') {
        event.respondWith(fetch(request));
        return;
    }

    // Determine cache strategy based on URL
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(request));
    } else if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)) {
        event.respondWith(handleStaticRequest(request));
    } else if (url.pathname.startsWith('/kqxs') || url.pathname === '/') {
        event.respondWith(handleHtmlRequest(request));
    } else {
        event.respondWith(fetch(request));
    }
});

// Handle API requests with cache-first strategy
async function handleApiRequest(request) {
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        // Check if cache is still valid
        const cacheDate = cachedResponse.headers.get('sw-cache-date');
        if (cacheDate && Date.now() - parseInt(cacheDate) < CACHE_DURATIONS.API) {
            return cachedResponse;
        }
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // Clone response and add cache headers
            const responseToCache = networkResponse.clone();
            const headers = new Headers(responseToCache.headers);
            headers.set('sw-cache-date', Date.now().toString());

            const cachedResponse = new Response(responseToCache.body, {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: headers
            });

            cache.put(request, cachedResponse);
        }

        return networkResponse;
    } catch (error) {
        // Return cached response if network fails
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
    const cache = await caches.open(STATIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // Return a fallback response for images
        if (request.destination === 'image') {
            return new Response('', { status: 404 });
        }
        throw error;
    }
}

// Handle HTML requests with network-first strategy
async function handleHtmlRequest(request) {
    const cache = await caches.open(CACHE_NAME);

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            // Cache successful responses
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // Return cached response if network fails
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline page if available
        const offlineResponse = await cache.match('/offline.html');
        if (offlineResponse) {
            return offlineResponse;
        }

        throw error;
    }
}

// Background sync for lottery results
self.addEventListener('sync', (event) => {
    if (event.tag === 'lottery-results-sync') {
        event.waitUntil(syncLotteryResults());
    }
});

// Sync lottery results in background
async function syncLotteryResults() {
    try {
        const response = await fetch('/api/xsmb/latest');
        if (response.ok) {
            const cache = await caches.open(API_CACHE_NAME);
            const headers = new Headers(response.headers);
            headers.set('sw-cache-date', Date.now().toString());

            const cachedResponse = new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: headers
            });

            await cache.put('/api/xsmb/latest', cachedResponse);
            console.log('Lottery results synced in background');
        }
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

// Push notifications for lottery results
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: 'lottery-results',
            data: data.data,
            actions: [
                {
                    action: 'view',
                    title: 'Xem kết quả',
                    icon: '/icon-192x192.png'
                },
                {
                    action: 'close',
                    title: 'Đóng',
                    icon: '/icon-192x192.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/kqxs')
        );
    }
});

// Periodic background sync (if supported)
if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    self.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SKIP_WAITING') {
            self.skipWaiting();
        }
    });
}
