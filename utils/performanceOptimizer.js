/**
 * Performance Optimizer Utilities
 * Tối ưu hóa hiệu suất cho frontend
 */

// Image optimization
export const optimizeImage = (src, width, height, quality = 80) => {
    if (!src) return src;

    // If it's already an optimized image URL, return as is
    if (src.includes('_next/image') || src.includes('w_') || src.includes('q_')) {
        return src;
    }

    // For external images, use Next.js Image Optimization
    if (src.startsWith('http')) {
        return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
    }

    return src;
};

// Lazy loading configuration
export const lazyLoadConfig = {
    rootMargin: '50px 0px',
    threshold: 0.1,
    triggerOnce: true
};

// Debounce function for search
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle function for scroll events
export const throttle = (func, limit) => {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Memory usage monitoring
export const getMemoryUsage = () => {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
        const memory = performance.memory;
        return {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        };
    }
    return null;
};

// Preload critical resources
export const preloadCriticalResources = () => {
    if (typeof window === 'undefined') return;

    const criticalResources = [
        '/api/xsmb/latest',
        '/api/xsmb/stats'
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = resource;
        document.head.appendChild(link);
    });
};

// Service Worker registration
export const registerServiceWorker = () => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
};

// Critical CSS inlining
export const inlineCriticalCSS = (css) => {
    if (typeof document !== 'undefined') {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }
};

// Resource hints
export const addResourceHints = () => {
    if (typeof document === 'undefined') return;

    const hints = [
        { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
        { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
    ];

    hints.forEach(hint => {
        const link = document.createElement('link');
        link.rel = hint.rel;
        link.href = hint.href;
        if (hint.crossorigin) {
            link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
    });
};

// Performance metrics
export const getPerformanceMetrics = () => {
    if (typeof window === 'undefined' || !window.performance) return null;

    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    return {
        // Navigation timing
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,

        // Paint timing
        firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,

        // Resource timing
        totalResources: performance.getEntriesByType('resource').length,

        // Memory usage
        memory: getMemoryUsage()
    };
};

// Web Vitals monitoring
export const reportWebVitals = (metric) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', metric.name, {
            event_category: 'Web Vitals',
            event_label: metric.id,
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            non_interaction: true,
        });
    }

    // Send to analytics
    if (typeof window !== 'undefined' && window.analytics) {
        window.analytics.track('Web Vital', {
            name: metric.name,
            value: metric.value,
            id: metric.id,
            delta: metric.delta
        });
    }
};

// Cache management
export const cacheManager = {
    set: (key, value, ttl = 300000) => { // 5 minutes default
        if (typeof window === 'undefined') return;

        const item = {
            value,
            expiry: Date.now() + ttl
        };

        try {
            localStorage.setItem(`cache_${key}`, JSON.stringify(item));
        } catch (e) {
            console.warn('Cache set failed:', e);
        }
    },

    get: (key) => {
        if (typeof window === 'undefined') return null;

        try {
            const item = localStorage.getItem(`cache_${key}`);
            if (!item) return null;

            const parsed = JSON.parse(item);
            if (Date.now() > parsed.expiry) {
                localStorage.removeItem(`cache_${key}`);
                return null;
            }

            return parsed.value;
        } catch (e) {
            console.warn('Cache get failed:', e);
            return null;
        }
    },

    clear: () => {
        if (typeof window === 'undefined') return;

        try {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('cache_')) {
                    localStorage.removeItem(key);
                }
            });
        } catch (e) {
            console.warn('Cache clear failed:', e);
        }
    }
};

export default {
    optimizeImage,
    lazyLoadConfig,
    debounce,
    throttle,
    getMemoryUsage,
    preloadCriticalResources,
    registerServiceWorker,
    inlineCriticalCSS,
    addResourceHints,
    getPerformanceMetrics,
    reportWebVitals,
    cacheManager
};
