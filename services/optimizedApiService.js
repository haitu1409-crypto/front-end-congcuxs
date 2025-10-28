/**
 * Optimized API Service
 * Service tối ưu hóa với advanced caching, debouncing, và error handling
 */

import { API_CONFIG } from '../config/api';

class OptimizedApiService {
    constructor() {
        this.cache = new Map();
        this.pendingRequests = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 phút
        this.debounceTimers = new Map();
        this.retryCount = new Map();
        this.maxRetries = 3;
        this.retryDelay = 1000; // 1 giây
    }

    /**
     * Tạo cache key thông minh
     */
    createCacheKey(url, params = {}) {
        const sortedParams = Object.keys(params)
            .sort()
            .reduce((result, key) => {
                result[key] = params[key];
                return result;
            }, {});

        return `${url}?${JSON.stringify(sortedParams)}`;
    }

    /**
     * Kiểm tra cache validity
     */
    isCacheValid(cacheEntry) {
        return cacheEntry && (Date.now() - cacheEntry.timestamp) < this.cacheTimeout;
    }

    /**
     * Lấy dữ liệu từ cache
     */
    getFromCache(cacheKey) {
        const cacheEntry = this.cache.get(cacheKey);
        if (this.isCacheValid(cacheEntry)) {
            console.log(`✅ Cache hit: ${cacheKey}`);
            return cacheEntry.data;
        }
        return null;
    }

    /**
     * Lưu dữ liệu vào cache
     */
    setCache(cacheKey, data, customTTL = null) {
        const ttl = customTTL || this.cacheTimeout;
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
            ttl
        });

        // Auto cleanup
        setTimeout(() => {
            this.cache.delete(cacheKey);
        }, ttl);
    }

    /**
     * Debounce function
     */
    debounce(key, func, delay = 300) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }

        return new Promise((resolve, reject) => {
            const timer = setTimeout(async () => {
                try {
                    const result = await func();
                    resolve(result);
                } catch (error) {
                    reject(error);
                } finally {
                    this.debounceTimers.delete(key);
                }
            }, delay);

            this.debounceTimers.set(key, timer);
        });
    }

    /**
     * Retry mechanism với exponential backoff
     */
    async retryWithBackoff(fn, retryCount = 0) {
        try {
            return await fn();
        } catch (error) {
            if (retryCount < this.maxRetries) {
                const delay = this.retryDelay * Math.pow(2, retryCount);
                console.log(`🔄 Retrying in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`);

                await new Promise(resolve => setTimeout(resolve, delay));
                return this.retryWithBackoff(fn, retryCount + 1);
            }
            throw error;
        }
    }

    /**
     * Optimized fetch với caching, debouncing và retry
     */
    async fetchWithOptimizations(url, options = {}) {
        const {
            params = {},
            useCache = true,
            debounceKey = null,
            debounceDelay = 300,
            enableRetry = true,
            ...fetchOptions
        } = options;

        const cacheKey = this.createCacheKey(url, params);

        // Kiểm tra cache trước
        if (useCache) {
            const cachedData = this.getFromCache(cacheKey);
            if (cachedData) {
                return cachedData;
            }
        }

        // Kiểm tra pending requests
        if (this.pendingRequests.has(cacheKey)) {
            return this.pendingRequests.get(cacheKey);
        }

        // Tạo URL với params
        const urlWithParams = new URL(url, API_CONFIG.BASE_URL);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                urlWithParams.searchParams.append(key, params[key]);
            }
        });

        // Tạo request function
        const requestFn = async () => {
            const response = await fetch(urlWithParams.toString(), {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                    ...fetchOptions.headers
                },
                ...fetchOptions
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Cache successful responses
            if (useCache && data.success) {
                this.setCache(cacheKey, data);
            }

            return data;
        };

        // Apply debouncing nếu có
        let requestPromise;
        if (debounceKey) {
            requestPromise = this.debounce(debounceKey, requestFn, debounceDelay);
        } else {
            requestPromise = enableRetry
                ? this.retryWithBackoff(requestFn)
                : requestFn();
        }

        // Lưu vào pending requests
        this.pendingRequests.set(cacheKey, requestPromise);

        try {
            const result = await requestPromise;
            return result;
        } catch (error) {
            console.error('API Error:', {
                message: error.message,
                url: urlWithParams.toString(),
                timestamp: new Date().toISOString()
            });
            throw error;
        } finally {
            this.pendingRequests.delete(cacheKey);
        }
    }

    /**
     * Optimized Position Soi Cau API
     */
    async getOptimizedPositionSoiCau(params = {}) {
        return this.fetchWithOptimizations('/api/optimized-position-soicau', {
            params,
            useCache: true,
            debounceKey: `position-soicau-${JSON.stringify(params)}`,
            debounceDelay: 500
        });
    }

    /**
     * Optimized Position Soi Cau Range API
     */
    async getOptimizedPositionSoiCauRange(params = {}) {
        return this.fetchWithOptimizations('/api/optimized-position-soicau/range', {
            params,
            useCache: true,
            debounceKey: `position-range-${JSON.stringify(params)}`,
            debounceDelay: 800
        });
    }

    /**
     * Optimized Position Pattern Stats API
     */
    async getOptimizedPositionPatternStats(params = {}) {
        return this.fetchWithOptimizations('/api/optimized-position-soicau/stats', {
            params,
            useCache: true,
            debounceKey: `position-stats-${JSON.stringify(params)}`,
            debounceDelay: 1000
        });
    }

    /**
     * Performance Metrics API
     */
    async getPerformanceMetrics() {
        return this.fetchWithOptimizations('/api/optimized-position-soicau/metrics', {
            useCache: false,
            debounceKey: 'metrics',
            debounceDelay: 2000
        });
    }

    /**
     * Cache Health API
     */
    async getCacheStats() {
        return this.fetchWithOptimizations('/api/optimized-position-soicau/cache/stats', {
            useCache: false,
            debounceKey: 'cache-stats',
            debounceDelay: 1000
        });
    }

    /**
     * Invalidate cache
     */
    invalidateCache(pattern) {
        const keysToDelete = [];
        for (const [key] of this.cache) {
            if (key.includes(pattern)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cache.delete(key));
        console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries matching: ${pattern}`);
    }

    /**
     * Clear all cache
     */
    clearAllCache() {
        this.cache.clear();
        this.pendingRequests.clear();
        this.debounceTimers.clear();
        this.retryCount.clear();
        console.log('🧹 All cache cleared');
    }

    /**
     * Get cache statistics
     */
    getCacheInfo() {
        return {
            cacheSize: this.cache.size,
            pendingRequests: this.pendingRequests.size,
            debounceTimers: this.debounceTimers.size,
            cacheKeys: Array.from(this.cache.keys()),
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/optimized-position-soicau/health`);
            const data = await response.json();
            return {
                status: 'healthy',
                data,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Tạo singleton instance
const optimizedApiService = new OptimizedApiService();

export default optimizedApiService;
