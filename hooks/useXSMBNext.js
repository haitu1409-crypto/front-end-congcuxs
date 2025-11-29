/**
 * useXSMBNext Hook
 * Custom hook để quản lý việc fetch dữ liệu XSMB từ backend
 */

import { useState, useEffect, useCallback } from 'react';
import {
    getLatestXSMBNext,
    getXSMBNextByDate,
    getXSMBNextRange,
    getCurrentDateFormatted
} from '../services/xsmbApi';

/**
 * Hook để lấy dữ liệu XSMB
 * @param {Object} options - Các tùy chọn
 * @param {string} options.date - Ngày cụ thể (DD-MM-YYYY) hoặc 'latest' cho mới nhất
 * @param {boolean} options.autoFetch - Tự động fetch khi component mount (default: true)
 * @param {number} options.refreshInterval - Interval để refresh dữ liệu (ms, default: 0 = không auto refresh)
 * @returns {Object} - { data, loading, error, refetch, setDate }
 */
export const useXSMBNext = (options = {}) => {
    const {
        date = 'latest',
        autoFetch = true,
        refreshInterval = 0
    } = options;

    // ✅ CRITICAL: Cache data để tránh fetch lại mỗi lần mount
    const cacheKey = `xsmb_${date}`;
    const getCachedData = () => {
        if (typeof window === 'undefined') return null;
        try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                const { data: cachedData, timestamp } = JSON.parse(cached);
                // Cache trong 5 phút
                if (Date.now() - timestamp < 5 * 60 * 1000) {
                    return cachedData;
                }
            }
        } catch (e) {
            console.warn('Error reading cache:', e);
        }
        return null;
    };

    const setCachedData = (dataToCache) => {
        if (typeof window === 'undefined') return;
        try {
            sessionStorage.setItem(cacheKey, JSON.stringify({
                data: dataToCache,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('Error setting cache:', e);
        }
    };

    // ✅ CRITICAL: Khởi tạo với cached data nếu có
    const [data, setData] = useState(() => getCachedData());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentDate, setCurrentDate] = useState(date);

    // Function để fetch dữ liệu
    const fetchData = useCallback(async (targetDate = currentDate) => {
        if (!targetDate) return;

        setLoading(true);
        setError(null);

        try {
            let result;

            if (targetDate === 'latest') {
                console.log('🔄 Fetching latest XSMB data...');
                result = await getLatestXSMBNext();
                console.log('✅ Latest XSMB data fetched:', result);
            } else {
                console.log(`🔄 Fetching XSMB data for date: ${targetDate}`);
                result = await getXSMBNextByDate(targetDate);
                console.log(`✅ XSMB data for ${targetDate} fetched:`, result);
            }

            setData(result);
            setCurrentDate(targetDate);
            // ✅ Cache data để tránh fetch lại
            setCachedData(result);
        } catch (err) {
            console.error('❌ Error fetching XSMB data:', err);
            // Xử lý 429 error đặc biệt
            if (err.response?.status === 429) {
                setError('API đang bị giới hạn. Vui lòng thử lại sau.');
                console.warn('API rate limited, using fallback data');
            } else {
                setError(err.message);
                console.error('Error fetching XSMB data:', err);
            }
        } finally {
            setLoading(false);
        }
    }, [currentDate]);

    // Function để refetch dữ liệu
    const refetch = useCallback(() => {
        fetchData(currentDate);
    }, [fetchData, currentDate]);

    // Function để thay đổi ngày
    const setDate = useCallback((newDate) => {
        setCurrentDate(newDate);
        fetchData(newDate);
    }, [fetchData]);

    // Auto fetch khi component mount - ✅ REMOVED debounce để tăng tốc độ
    useEffect(() => {
        if (autoFetch) {
            // ✅ CRITICAL: Nếu đã có cached data, không cần fetch ngay
            // Chỉ fetch nếu không có data hoặc data quá cũ
            const cachedData = getCachedData();
            if (!cachedData) {
                // Không có cache, fetch ngay lập tức
                fetchData();
            } else {
                // Có cache, fetch trong background để update nếu cần
                // Nhưng hiển thị cached data ngay
                fetchData();
            }
        }
    }, [autoFetch, fetchData]);

    // Auto refresh interval
    useEffect(() => {
        if (refreshInterval > 0) {
            const interval = setInterval(() => {
                fetchData();
            }, refreshInterval);

            return () => clearInterval(interval);
        }
    }, [refreshInterval, fetchData]);

    return {
        data,
        loading,
        error,
        refetch,
        setDate,
        currentDate
    };
};

/**
 * Hook để lấy dữ liệu XSMB theo khoảng thời gian
 * @param {Object} options - Các tùy chọn
 * @param {string} options.startDate - Ngày bắt đầu (DD-MM-YYYY)
 * @param {string} options.endDate - Ngày kết thúc (DD-MM-YYYY)
 * @param {number} options.limit - Số lượng kết quả tối đa (default: 30)
 * @param {boolean} options.autoFetch - Tự động fetch khi component mount (default: true)
 * @returns {Object} - { data, loading, error, refetch, setDateRange }
 */
export const useXSMBNextRange = (options = {}) => {
    const {
        startDate,
        endDate,
        limit = 30,
        autoFetch = true
    } = options;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentRange, setCurrentRange] = useState({ startDate, endDate, limit });

    // Function để fetch dữ liệu theo khoảng
    const fetchData = useCallback(async (range = currentRange) => {
        if (!range.startDate || !range.endDate) return;

        setLoading(true);
        setError(null);

        try {
            const result = await getXSMBNextRange(range.startDate, range.endDate, range.limit);
            setData(result);
            setCurrentRange(range);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching XSMB range data:', err);
        } finally {
            setLoading(false);
        }
    }, [currentRange]);

    // Function để refetch dữ liệu
    const refetch = useCallback(() => {
        fetchData(currentRange);
    }, [fetchData, currentRange]);

    // Function để thay đổi khoảng thời gian
    const setDateRange = useCallback((newStartDate, newEndDate, newLimit = limit) => {
        const newRange = { startDate: newStartDate, endDate: newEndDate, limit: newLimit };
        setCurrentRange(newRange);
        fetchData(newRange);
    }, [fetchData, limit]);

    // Auto fetch khi component mount
    useEffect(() => {
        if (autoFetch && startDate && endDate) {
            fetchData();
        }
    }, [autoFetch, startDate, endDate, fetchData]);

    return {
        data,
        loading,
        error,
        refetch,
        setDateRange,
        currentRange
    };
};

/**
 * Hook để lấy dữ liệu XSMB mới nhất với auto refresh
 * @param {Object} options - Các tùy chọn
 * @param {number} options.refreshInterval - Interval để refresh (ms, default: 300000 = 5 phút)
 * @param {boolean} options.autoFetch - Tự động fetch khi component mount (default: true)
 * @returns {Object} - { data, loading, error, refetch, lastUpdated }
 */
export const useXSMBNextLive = (options = {}) => {
    const {
        refreshInterval = 300000, // 5 phút
        autoFetch = true
    } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Function để fetch dữ liệu mới nhất
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await getLatestXSMBNext();
            setData(result);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err.message);
            console.error('Error fetching latest XSMB data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Function để refetch dữ liệu
    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    // Auto fetch khi component mount với debounce
    useEffect(() => {
        if (autoFetch) {
            const timeoutId = setTimeout(() => {
                fetchData();
            }, 1000); // Debounce 1 giây

            return () => clearTimeout(timeoutId);
        }
    }, [autoFetch, fetchData]);

    // Auto refresh interval
    useEffect(() => {
        if (refreshInterval > 0) {
            const interval = setInterval(() => {
                fetchData();
            }, refreshInterval);

            return () => clearInterval(interval);
        }
    }, [refreshInterval, fetchData]);

    return {
        data,
        loading,
        error,
        refetch,
        lastUpdated
    };
};

/**
 * Hook để lấy dữ liệu XSMB hôm nay
 * @param {Object} options - Các tùy chọn
 * @param {boolean} options.autoFetch - Tự động fetch khi component mount (default: true)
 * @param {number} options.refreshInterval - Interval để refresh (ms, default: 600000 = 10 phút)
 * @returns {Object} - { data, loading, error, refetch, isToday }
 */
export const useXSMBNextToday = (options = {}) => {
    const {
        autoFetch = true,
        refreshInterval = 600000 // 10 phút
    } = options;

    // ✅ CRITICAL: Cache data để tránh fetch lại mỗi lần mount
    const cacheKey = 'xsmb_today';
    const getCachedData = () => {
        if (typeof window === 'undefined') return null;
        try {
            const cached = sessionStorage.getItem(cacheKey);
            if (cached) {
                const { data: cachedData, timestamp } = JSON.parse(cached);
                // Cache trong 5 phút
                if (Date.now() - timestamp < 5 * 60 * 1000) {
                    return cachedData;
                }
            }
        } catch (e) {
            console.warn('Error reading cache:', e);
        }
        return null;
    };

    const setCachedData = (dataToCache) => {
        if (typeof window === 'undefined') return;
        try {
            sessionStorage.setItem(cacheKey, JSON.stringify({
                data: dataToCache,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.warn('Error setting cache:', e);
        }
    };

    // ✅ CRITICAL: Khởi tạo với cached data nếu có
    const [data, setData] = useState(() => getCachedData());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isToday, setIsToday] = useState(false);

    // Function để fetch dữ liệu hôm nay
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const today = getCurrentDateFormatted();
            console.log('🔄 Fetching XSMB data for today:', today);
            const result = await getXSMBNextByDate(today);
            console.log('✅ Today XSMB data fetched:', result);
            setData(result);
            setIsToday(true);
            // ✅ Cache data
            setCachedData(result);
        } catch (err) {
            console.warn('⚠️ No data for today, trying latest data...', err.message);
            // Nếu không có dữ liệu hôm nay, thử lấy dữ liệu mới nhất
            try {
                console.log('🔄 Fetching latest XSMB data as fallback...');
                const result = await getLatestXSMBNext();
                console.log('✅ Latest XSMB data fetched as fallback:', result);
                setData(result);
                setIsToday(false);
                // ✅ Cache data
                setCachedData(result);
            } catch (fallbackErr) {
                console.error('❌ Error fetching latest XSMB data:', fallbackErr);
                setError(fallbackErr.message);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Function để refetch dữ liệu
    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    // Auto fetch khi component mount - ✅ REMOVED debounce để tăng tốc độ
    useEffect(() => {
        if (autoFetch) {
            // ✅ CRITICAL: Nếu đã có cached data, không cần fetch ngay
            const cachedData = getCachedData();
            if (!cachedData) {
                // Không có cache, fetch ngay lập tức
                fetchData();
            } else {
                // Có cache, fetch trong background để update nếu cần
                fetchData();
            }
        }
    }, [autoFetch, fetchData]);

    // Auto refresh interval
    useEffect(() => {
        if (refreshInterval > 0) {
            const interval = setInterval(() => {
                fetchData();
            }, refreshInterval);

            return () => clearInterval(interval);
        }
    }, [refreshInterval, fetchData]);

    return {
        data,
        loading,
        error,
        refetch,
        isToday
    };
};

/**
 * Hook to fetch latest XSMB results with pagination
 */
export function useXSMBLatest10(options = {}) {
    const { autoFetch = true, refreshInterval = 0, page = 1, limit = 10 } = options;
    const [data, setData] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            console.log(`Fetching page ${page}, limit ${limit}`);
            const response = await fetch(`${apiUrl}/api/xsmb/results/latest10?page=${page}&limit=${limit}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('API Response:', result);

            if (result.success && result.data) {
                setData(result.data);
                setPagination(result.pagination);
            } else {
                throw new Error('Invalid response format');
            }
        } catch (err) {
            console.error('Error fetching XSMB results with pagination:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [page, limit]);

    // Auto fetch on mount and when page/limit changes
    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, [autoFetch, fetchData]);

    // Set up refresh interval
    useEffect(() => {
        if (refreshInterval > 0) {
            const interval = setInterval(() => fetchData(), refreshInterval);
            return () => clearInterval(interval);
        }
    }, [refreshInterval, fetchData]);

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return { data, pagination, loading, error, refetch };
}

// Export default object với tất cả hooks
export default {
    useXSMBNext,
    useXSMBNextRange,
    useXSMBNextLive,
    useXSMBNextToday,
    useXSMBLatest10
};
