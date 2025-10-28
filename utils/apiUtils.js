/**
 * API Utilities
 * Các utility functions để xử lý API calls với retry logic và error handling
 */

/**
 * Fetch với retry logic cho 429 errors
 * @param {string} url - URL để fetch
 * @param {Object} options - Fetch options
 * @param {number} maxRetries - Số lần retry tối đa
 * @returns {Promise<Response>} - Response object
 */
export const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, options);

            if (response.status === 429) {
                if (attempt < maxRetries) {
                    const retryAfter = response.headers.get('Retry-After') || Math.pow(2, attempt);
                    console.warn(`⚠️ Rate limited (429), retrying in ${retryAfter}s (attempt ${attempt}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                    continue;
                } else {
                    throw new Error('API đang bị giới hạn. Vui lòng thử lại sau vài phút.');
                }
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return response;
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }
            console.warn(`⚠️ Fetch attempt ${attempt} failed:`, error.message);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
};

/**
 * Fetch JSON với retry logic
 * @param {string} url - URL để fetch
 * @param {Object} options - Fetch options
 * @param {number} maxRetries - Số lần retry tối đa
 * @returns {Promise<Object>} - JSON data
 */
export const fetchJSONWithRetry = async (url, options = {}, maxRetries = 3) => {
    const response = await fetchWithRetry(url, options, maxRetries);
    return await response.json();
};

/**
 * Xử lý 429 error với user-friendly message
 * @param {Error} error - Error object
 * @returns {string} - User-friendly error message
 */
export const handle429Error = (error) => {
    if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        return 'API đang bị giới hạn. Vui lòng thử lại sau vài phút.';
    }
    return error.message;
};

/**
 * Debounce function để tránh gọi API quá nhiều
 * @param {Function} func - Function cần debounce
 * @param {number} wait - Thời gian chờ (ms)
 * @returns {Function} - Debounced function
 */
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

/**
 * Throttle function để giới hạn số lần gọi API
 * @param {Function} func - Function cần throttle
 * @param {number} limit - Số lần gọi tối đa
 * @param {number} time - Khoảng thời gian (ms)
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit, time) => {
    let inThrottle;
    let lastFunc;
    let lastRan;

    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            lastRan = Date.now();
            inThrottle = true;
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(() => {
                if ((Date.now() - lastRan) >= time) {
                    func.apply(this, args);
                    lastRan = Date.now();
                }
            }, time - (Date.now() - lastRan));
        }
    };
};

/**
 * Cache cho API responses
 */
class APICache {
    constructor(defaultTTL = 5 * 60 * 1000) { // 5 minutes default
        this.cache = new Map();
        this.defaultTTL = defaultTTL;
    }

    set(key, value, ttl = this.defaultTTL) {
        this.cache.set(key, {
            value,
            expiry: Date.now() + ttl
        });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    clear() {
        this.cache.clear();
    }

    delete(key) {
        this.cache.delete(key);
    }
}

export const apiCache = new APICache();

/**
 * Fetch với cache và retry
 * @param {string} url - URL để fetch
 * @param {Object} options - Fetch options
 * @param {number} cacheTTL - Cache TTL (ms)
 * @param {number} maxRetries - Số lần retry tối đa
 * @returns {Promise<Object>} - JSON data
 */
export const fetchWithCacheAndRetry = async (url, options = {}, cacheTTL = 5 * 60 * 1000, maxRetries = 3) => {
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    const cached = apiCache.get(cacheKey);

    if (cached) {
        console.log('📦 Using cached API data for:', url);
        return cached;
    }

    const data = await fetchJSONWithRetry(url, options, maxRetries);
    apiCache.set(cacheKey, data, cacheTTL);

    return data;
};

export default {
    fetchWithRetry,
    fetchJSONWithRetry,
    handle429Error,
    debounce,
    throttle,
    APICache,
    apiCache,
    fetchWithCacheAndRetry
};
