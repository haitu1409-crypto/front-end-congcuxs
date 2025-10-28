/**
 * XSMB API Service
 * Service để gọi API backend lấy dữ liệu kết quả xổ số miền Bắc
 */

import axios from 'axios';

// Base URL của backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Hàm tạo userId ngẫu nhiên (từ kqxsMB.js)
const getUserId = () => {
    if (typeof window !== 'undefined') {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = Math.random().toString(36).substring(2);
            localStorage.setItem('userId', userId);
        }
        return userId;
    }
    return 'default-user';
};

// Tạo axios instance với cấu hình mặc định
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
    },
});

// Cache để tránh gọi API quá nhiều
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

// Thêm retry logic cho 429 errors với exponential backoff
const retryRequest = async (requestFn, maxRetries = 2, delay = 3000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await requestFn();
        } catch (error) {
            if (error.response?.status === 429 && i < maxRetries - 1) {
                const backoffDelay = delay * Math.pow(2, i); // Exponential backoff
                console.log(`🔄 Retry ${i + 1}/${maxRetries} after ${backoffDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoffDelay));
                continue;
            }
            throw error;
        }
    }
};

/**
 * Chuyển đổi dữ liệu từ backend sang format của component
 * @param {Object} backendData - Dữ liệu từ backend
 * @returns {Object} - Dữ liệu đã được format cho component
 */
const transformBackendData = (backendData) => {
    if (!backendData) return null;

    console.log('🔍 Backend data received:', backendData);

    // Format ngày
    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Tạo dữ liệu loto từ các giải
    const generateLotoData = (data) => {
        const lotoData = {};

        // Lấy tất cả các số từ các giải
        const allNumbers = [
            ...(data.specialPrize || []),
            ...(data.firstPrize || []),
            ...(data.secondPrize || []),
            ...(data.threePrizes || []),
            ...(data.fourPrizes || []),
            ...(data.fivePrizes || []),
            ...(data.sixPrizes || []),
            ...(data.sevenPrizes || [])
        ];

        // Nhóm theo số đầu (0-9)
        for (let i = 0; i <= 9; i++) {
            const numbers = allNumbers
                .map(num => {
                    if (!num || typeof num !== 'string') return null;
                    const lastTwo = num.slice(-2);
                    return lastTwo;
                })
                .filter(num => num && num.startsWith(i.toString()))
                .filter((num, index, arr) => arr.indexOf(num) === index) // Loại bỏ duplicate
                .sort();

            if (numbers.length > 0) {
                lotoData[i.toString()] = numbers.join(', ');
            }
        }

        return lotoData;
    };

    const transformedData = {
        date: formatDate(backendData.drawDate),
        specialPrize: backendData.specialPrize && backendData.specialPrize[0] ? backendData.specialPrize[0] : null,
        firstPrize: backendData.firstPrize && backendData.firstPrize[0] ? backendData.firstPrize[0] : null,
        secondPrize: backendData.secondPrize || [],
        threePrizes: backendData.threePrizes || [],
        fourPrizes: backendData.fourPrizes || [],
        fivePrizes: backendData.fivePrizes || [],
        sixPrizes: backendData.sixPrizes || [],
        sevenPrizes: backendData.sevenPrizes || [],
        maDB: backendData.maDB || '',
        loto: generateLotoData(backendData),
        dayOfWeek: backendData.dayOfWeek,
        tinh: backendData.tinh,
        tentinh: backendData.tentinh
    };

    console.log('✅ Transformed data:', transformedData);
    return transformedData;
};

/**
 * Lấy kết quả XSMB mới nhất
 * @returns {Promise<Object>} - Dữ liệu kết quả XSMB
 */
export const getLatestXSMBNext = async () => {
    const cacheKey = 'latest-xsmb';
    const cached = apiCache.get(cacheKey);

    // Giảm thời gian cache để đảm bảo dữ liệu mới nhất
    const SHORT_CACHE_DURATION = 2 * 60 * 1000; // 2 phút thay vì 5 phút

    // Kiểm tra cache
    if (cached && Date.now() - cached.timestamp < SHORT_CACHE_DURATION) {
        console.log('📦 Using cached latest XSMB data');
        return cached.data;
    }

    return retryRequest(async () => {
        console.log('🔄 Fetching latest XSMB data...');

        const response = await apiClient.get('/api/xsmb/results/latest');

        if (response.status === 200 && response.data) {
            console.log('✅ Latest XSMB data fetched successfully');

            // Backend trả về { success: true, data: result }
            if (response.data.success && response.data.data) {
                const transformedData = transformBackendData(response.data.data);

                // Cache dữ liệu với thời gian ngắn hơn
                apiCache.set(cacheKey, {
                    data: transformedData,
                    timestamp: Date.now()
                });

                return transformedData;
            } else {
                throw new Error(response.data.message || 'No data received from API');
            }
        } else {
            throw new Error('No data received from API');
        }
    });
};

/**
 * Lấy kết quả XSMB theo ngày cụ thể
 * @param {string} date - Ngày theo format DD-MM-YYYY
 * @returns {Promise<Object>} - Dữ liệu kết quả XSMB
 */
export const getXSMBNextByDate = async (date) => {
    // Validate date format
    if (!date || !/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        throw new Error('Invalid date format. Please use DD-MM-YYYY format.');
    }

    const cacheKey = `xsmb-date-${date}`;
    const cached = apiCache.get(cacheKey);

    // Kiểm tra cache
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`📦 Using cached XSMB data for ${date}`);
        return cached.data;
    }

    return retryRequest(async () => {
        console.log(`🔄 Fetching XSMB data for date: ${date}`);

        const response = await apiClient.get(`/api/xsmb/results/date/${date}`);

        if (response.status === 200 && response.data) {
            console.log(`✅ XSMB data for ${date} fetched successfully`);

            // Backend trả về { success: true, data: result }
            if (response.data.success && response.data.data) {
                const transformedData = transformBackendData(response.data.data);

                // Cache dữ liệu
                apiCache.set(cacheKey, {
                    data: transformedData,
                    timestamp: Date.now()
                });

                return transformedData;
            } else {
                throw new Error(response.data.message || `No data found for date: ${date}`);
            }
        } else {
            throw new Error(`No data found for date: ${date}`);
        }
    });
};

/**
 * Lấy danh sách kết quả XSMB trong khoảng thời gian
 * @param {string} startDate - Ngày bắt đầu (DD-MM-YYYY)
 * @param {string} endDate - Ngày kết thúc (DD-MM-YYYY)
 * @param {number} limit - Số lượng kết quả tối đa (default: 30)
 * @returns {Promise<Array>} - Danh sách dữ liệu kết quả XSMB
 */
export const getXSMBNextRange = async (startDate, endDate, limit = 30) => {
    try {
        // Validate date formats
        if (!startDate || !endDate ||
            !/^\d{2}-\d{2}-\d{4}$/.test(startDate) ||
            !/^\d{2}-\d{2}-\d{4}$/.test(endDate)) {
            throw new Error('Invalid date format. Please use DD-MM-YYYY format.');
        }

        console.log(`🔄 Fetching XSMB data from ${startDate} to ${endDate}`);

        const response = await apiClient.get('/api/xsmb/results', {
            params: { startDate, endDate, limit }
        });

        if (response.status === 200 && response.data) {
            console.log(`✅ XSMB range data fetched successfully: ${response.data.length} records`);
            return response.data.map(transformBackendData);
        } else {
            throw new Error(`No data found for range ${startDate} to ${endDate}`);
        }
    } catch (error) {
        console.error(`❌ Error fetching XSMB range data:`, error);

        if (error.response) {
            if (error.response.status === 404) {
                throw new Error(`Không tìm thấy dữ liệu từ ${startDate} đến ${endDate}`);
            }
            throw new Error(`API Error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`);
        } else if (error.request) {
            throw new Error('Network Error: Unable to connect to server');
        } else {
            throw new Error(`Request Error: ${error.message}`);
        }
    }
};

/**
 * Lấy kết quả XSMB theo thứ trong tuần
 * @param {string} dayOfWeek - Thứ trong tuần (thu-2, thu-3, ..., chu-nhat)
 * @returns {Promise<Array>} - Danh sách dữ liệu kết quả XSMB
 */
export const getXSMBNextByDayOfWeek = async (dayOfWeek) => {
    try {
        if (!dayOfWeek) {
            throw new Error('Day of week is required');
        }

        console.log(`🔄 Fetching XSMB data for day: ${dayOfWeek}`);

        const response = await apiClient.get(`/api/xsmb/${dayOfWeek}`);

        if (response.status === 200 && response.data) {
            console.log(`✅ XSMB data for ${dayOfWeek} fetched successfully: ${response.data.length} records`);
            return response.data.map(transformBackendData);
        } else {
            throw new Error(`No data found for day: ${dayOfWeek}`);
        }
    } catch (error) {
        console.error(`❌ Error fetching XSMB data for ${dayOfWeek}:`, error);

        if (error.response) {
            if (error.response.status === 404) {
                throw new Error(`Không tìm thấy dữ liệu cho ${dayOfWeek}`);
            }
            throw new Error(`API Error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`);
        } else if (error.request) {
            throw new Error('Network Error: Unable to connect to server');
        } else {
            throw new Error(`Request Error: ${error.message}`);
        }
    }
};

/**
 * Lấy tất cả kết quả XSMB (có phân trang)
 * @param {number} limit - Số lượng kết quả tối đa (default: 30)
 * @param {number} page - Trang (default: 1)
 * @returns {Promise<Array>} - Danh sách dữ liệu kết quả XSMB
 */
export const getAllXSMBNext = async (limit = 30, page = 1) => {
    try {
        console.log(`🔄 Fetching all XSMB data - page ${page}, limit ${limit}`);

        const response = await apiClient.get('/api/xsmb/results', {
            params: { limit, page }
        });

        if (response.status === 200 && response.data) {
            console.log(`✅ All XSMB data fetched successfully: ${response.data.length} records`);
            return response.data.map(transformBackendData);
        } else {
            throw new Error('No data received from API');
        }
    } catch (error) {
        console.error('❌ Error fetching all XSMB data:', error);

        if (error.response) {
            throw new Error(`API Error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`);
        } else if (error.request) {
            throw new Error('Network Error: Unable to connect to server');
        } else {
            throw new Error(`Request Error: ${error.message}`);
        }
    }
};

/**
 * Utility function để format ngày hiện tại theo format DD-MM-YYYY
 * @returns {string} - Ngày hiện tại theo format DD-MM-YYYY
 */
export const getCurrentDateFormatted = () => {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
};

/**
 * Utility function để format ngày theo format DD-MM-YYYY
 * @param {Date} date - Ngày cần format
 * @returns {string} - Ngày theo format DD-MM-YYYY
 */
export const formatDateToDDMMYYYY = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
};

/**
 * Utility function để parse ngày từ format DD-MM-YYYY
 * @param {string} dateString - Ngày theo format DD-MM-YYYY
 * @returns {Date} - Date object
 */
export const parseDateFromDDMMYYYY = (dateString) => {
    if (!dateString || !/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
        throw new Error('Invalid date format. Please use DD-MM-YYYY format.');
    }
    const [day, month, year] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

/**
 * Clear cache để force refresh dữ liệu
 */
export const clearCache = () => {
    apiCache.clear();
    console.log('🗑️ API cache cleared');
};

/**
 * Clear cache cho dữ liệu mới nhất
 */
export const clearLatestCache = () => {
    apiCache.delete('latest-xsmb');
    console.log('🗑️ Latest XSMB cache cleared');
};

// Export default object với tất cả functions
export default {
    getLatestXSMBNext,
    getXSMBNextByDate,
    getXSMBNextRange,
    getXSMBNextByDayOfWeek,
    getAllXSMBNext,
    getCurrentDateFormatted,
    formatDateToDDMMYYYY,
    parseDateFromDDMMYYYY,
    transformBackendData,
    clearCache,
    clearLatestCache
};
