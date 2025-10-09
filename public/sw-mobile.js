/**
 * Mobile-Optimized Service Worker
 * Enhanced caching strategy for mobile lottery tools
 */

const CACHE_NAME = 'lottery-tools-mobile-v1';
const STATIC_CACHE = 'static-mobile-v1';
const DYNAMIC_CACHE = 'dynamic-mobile-v1';

// Critical resources for mobile
const CRITICAL_RESOURCES = [
    '/',
    '/dan-9x0x'
    // Removed non-existent resources:
    // '/styles/critical.css',
    // '/fonts/inter-var.woff2',
    // '/api/dande/generate'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Mobile SW: Caching critical resources');
                return cache.addAll(CRITICAL_RESOURCES);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) =>
                            cacheName !== STATIC_CACHE &&
                            cacheName !== DYNAMIC_CACHE
                        )
                        .map((cacheName) => caches.delete(cacheName))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - mobile-optimized caching strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Mobile-specific caching strategies
    if (url.pathname.startsWith('/api/')) {
        // API requests - network first with cache fallback
        event.respondWith(networkFirstStrategy(request));
    } else if (url.pathname.match(/\.(css|js|woff2|png|jpg|jpeg|svg)$/)) {
        // Static assets - cache first
        event.respondWith(cacheFirstStrategy(request));
    } else if (url.pathname.startsWith('/dan-') || url.pathname === '/') {
        // Lottery tool pages - stale while revalidate
        event.respondWith(staleWhileRevalidateStrategy(request));
    } else {
        // Default - network first
        event.respondWith(networkFirstStrategy(request));
    }
});

// Network first strategy (for API calls)
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/offline.html');
        }

        throw error;
    }
}

// Cache first strategy (for static assets)
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
        return cachedResponse;
    }

    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        // Return a fallback for images
        if (request.destination === 'image') {
            return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" fill="#9ca3af">Image unavailable</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
            );
        }
        throw error;
    }
}

// Stale while revalidate strategy (for pages)
async function staleWhileRevalidateStrategy(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);

    // Fetch from network in background
    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => {
        // Network failed, return cached version if available
        return cachedResponse;
    });

    // Return cached version immediately if available
    return cachedResponse || fetchPromise;
}

// Background sync for lottery number generation
self.addEventListener('sync', (event) => {
    if (event.tag === 'lottery-generation') {
        event.waitUntil(
            // Handle background lottery generation
            handleBackgroundLotteryGeneration()
        );
    }
});

async function handleBackgroundLotteryGeneration() {
    try {
        // Pre-generate lottery numbers in background
        const response = await fetch('/api/dande/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: 1, preload: true })
        });

        if (response.ok) {
            const data = await response.json();
            // Store in IndexedDB for quick access
            await storeLotteryData(data);
        }
    } catch (error) {
        console.log('Background lottery generation failed:', error);
    }
}

async function storeLotteryData(data) {
    // Store lottery data in IndexedDB for offline access
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('LotteryCache', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['lottery'], 'readwrite');
            const store = transaction.objectStore('lottery');

            store.put({
                id: Date.now(),
                data: data,
                timestamp: Date.now()
            });

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        };

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains('lottery')) {
                db.createObjectStore('lottery', { keyPath: 'id' });
            }
        };
    });
}

// Push notifications for lottery results
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();

        const options = {
            body: data.body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Xem kết quả',
                    icon: '/icons/checkmark.png'
                },
                {
                    action: 'close',
                    title: 'Đóng',
                    icon: '/icons/xmark.png'
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

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/dan-9x0x')
        );
    }
});
