/**
 * API Service với caching và optimization
 * Quản lý tất cả API calls với caching, debouncing và error handling
 */

import { API_CONFIG } from '../config/api';

class ApiService {
    constructor() {
        this.cache = new Map();
        this.pendingRequests = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 phút
    }

    /**
     * Tạo cache key từ URL và params
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
     * Kiểm tra cache có hợp lệ không
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
            return cacheEntry.data;
        }
        return null;
    }

    /**
     * Lưu dữ liệu vào cache
     */
    setCache(cacheKey, data) {
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });

        // Tự động xóa cache cũ sau timeout
        setTimeout(() => {
            this.cache.delete(cacheKey);
        }, this.cacheTimeout);
    }

    /**
     * Generic fetch với caching và deduplication
     */
    async fetchWithCache(url, options = {}) {
        const { params = {}, useCache = true, ...fetchOptions } = options;
        const cacheKey = this.createCacheKey(url, params);

        // Kiểm tra cache trước
        if (useCache) {
            const cachedData = this.getFromCache(cacheKey);
            if (cachedData) {
                return cachedData;
            }
        }

        // Kiểm tra request đang pending
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

        // Tạo request promise
        const requestPromise = fetch(urlWithParams.toString(), {
            headers: {
                'Content-Type': 'application/json',
                ...fetchOptions.headers
            },
            ...fetchOptions
        })
            .then(async response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                // Lưu vào cache nếu thành công
                if (useCache && data.success) {
                    this.setCache(cacheKey, data);
                }
                return data;
            })
            .catch(error => {
                // Provide more descriptive error logging
                const errorMessage = error.message || error.toString();
                console.error('API Error:', {
                    message: errorMessage,
                    url: urlWithParams.toString(),
                    timestamp: new Date().toISOString()
                });
                throw error;
            })
            .finally(() => {
                // Xóa khỏi pending requests
                this.pendingRequests.delete(cacheKey);
            });

        // Lưu vào pending requests
        this.pendingRequests.set(cacheKey, requestPromise);

        return requestPromise;
    }

    /**
     * Lấy thống kê 3 miền
     */
    async getThongKe3Mien(params = {}) {
        return this.fetchWithCache(API_CONFIG.ENDPOINTS.THONG_KE.THREE_REGIONS, {
            params,
            useCache: true
        });
    }

    /**
     * Cập nhật thống kê
     */
    async updateThongKe(date, data) {
        const result = await this.fetchWithCache(`${API_CONFIG.ENDPOINTS.THONG_KE.UPDATE}/${date}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            useCache: false // Không cache PUT requests
        });

        // Xóa cache liên quan sau khi update
        this.invalidateRelatedCache();

        return result;
    }

    /**
     * Lưu dữ liệu thống kê
     */
    async saveStatistics(data) {
        return this.fetchWithCache(API_CONFIG.ENDPOINTS.THONG_KE.SAVE, {
            method: 'POST',
            body: JSON.stringify(data),
            useCache: false
        });
    }

    /**
     * Tải dữ liệu thống kê
     */
    async loadStatistics(credentials) {
        return this.fetchWithCache(API_CONFIG.ENDPOINTS.THONG_KE.LOAD, {
            method: 'POST',
            body: JSON.stringify(credentials),
            useCache: false
        });
    }

    /**
     * Xóa cache liên quan đến thống kê
     */
    invalidateRelatedCache() {
        const keysToDelete = [];
        for (const [key] of this.cache) {
            if (key.includes(API_CONFIG.ENDPOINTS.THONG_KE.THREE_REGIONS)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => this.cache.delete(key));
    }

    /**
     * Lấy soi cầu bạch thủ
     */
    async getSoiCauBachThu(params = {}) {
        return this.fetchWithCache(API_CONFIG.ENDPOINTS.SOI_CAU.BACH_THU, {
            params,
            useCache: true
        });
    }

    /**
     * Lấy soi cầu bạch thủ trong khoảng thời gian
     */
    async getSoiCauRange(params = {}) {
        return this.fetchWithCache(API_CONFIG.ENDPOINTS.SOI_CAU.RANGE, {
            params,
            useCache: true
        });
    }

    /**
     * Lấy dự đoán bạch thủ đề
     */
    async getBachThuDe(params = {}) {
        return this.fetchWithCache(API_CONFIG.ENDPOINTS.BACH_THU_DE.BASE, {
            params,
            useCache: true
        });
    }

    /**
     * Lấy dự đoán bạch thủ đề hôm nay
     */
    async getBachThuDeToday() {
        return this.fetchWithCache(API_CONFIG.ENDPOINTS.BACH_THU_DE.TODAY, {
            useCache: true
        });
    }

    /**
     * Lấy kết quả soi cầu dựa trên vị trí số
     */
    async getPositionSoiCau(params = {}) {
        return this.fetchWithCache('/api/position-soicau', {
            params,
            useCache: true
        });
    }

    /**
     * Lấy kết quả soi cầu vị trí trong khoảng thời gian
     */
    async getPositionSoiCauRange(params = {}) {
        return this.fetchWithCache('/api/position-soicau/range', {
            params,
            useCache: true
        });
    }

    /**
     * Lấy thống kê pattern vị trí
     */
    async getPositionPatternStats(params = {}) {
        return this.fetchWithCache('/api/position-soicau/stats', {
            params,
            useCache: true
        });
    }


    /**
     * Xóa toàn bộ cache
     */
    clearCache() {
        this.cache.clear();
        this.pendingRequests.clear();
    }

    /**
     * Lấy thông tin cache (để debug)
     */
    getCacheInfo() {
        return {
            cacheSize: this.cache.size,
            pendingRequests: this.pendingRequests.size,
            cacheKeys: Array.from(this.cache.keys())
        };
    }
}

// Tạo singleton instance
const apiService = new ApiService();

export default apiService;
