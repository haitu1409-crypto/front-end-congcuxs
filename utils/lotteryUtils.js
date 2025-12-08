/**
 * Utility functions cho Live Lottery Results
 * Bao gồm live window checking, timezone handling, và data formatting
 */

/**
 * Lấy thời gian Việt Nam (cached để tối ưu performance)
 */
let cachedVietnamTime = null;
let lastCacheTime = 0;
const CACHE_TIME_DURATION = 1000; // Cache 1 giây

export const getVietnamTime = () => {
    const now = Date.now();
    if (!cachedVietnamTime || (now - lastCacheTime) > CACHE_TIME_DURATION) {
        cachedVietnamTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        lastCacheTime = now;
    }
    return cachedVietnamTime;
};

/**
 * Kiểm tra có đang trong khung giờ live không (cho XSMB)
 * Logic: 
 * - 18:10: LiveResult xuất hiện với bảng rỗng (loading)
 * - 18:14: Scraper khởi động và cào kết quả
 * - 18:35: Kết thúc live window (hoặc khi kết quả đầy đủ)
 * 
 * Có thể config qua env variables (tùy chọn):
 * - NEXT_PUBLIC_LIVE_WINDOW_HOUR (mặc định: 18)
 * - NEXT_PUBLIC_LIVE_WINDOW_START_MINUTE (mặc định: 10)
 * - NEXT_PUBLIC_LIVE_WINDOW_END_MINUTE (mặc định: 35)
 */
export const isWithinLiveWindow = () => {
    const vietTime = getVietnamTime();
    const hours = vietTime.getHours();
    const minutes = vietTime.getMinutes();

    // Đọc từ env hoặc dùng giá trị mặc định
    const liveHour = parseInt(process.env.NEXT_PUBLIC_LIVE_WINDOW_HOUR) || 18;
    const startMinute = parseInt(process.env.NEXT_PUBLIC_LIVE_WINDOW_START_MINUTE) || 10;
    const endMinute = parseInt(process.env.NEXT_PUBLIC_LIVE_WINDOW_END_MINUTE) || 35;

    // Live window: 18:10 - 18:35 (hoặc đến khi kết quả đầy đủ)
    return hours === liveHour && minutes >= startMinute && minutes <= endMinute;
};

/**
 * Kiểm tra có đang trong khung giờ live không (cho XSMN)
 * Logic: 
 * - 16:10: LiveResult xuất hiện với bảng rỗng (loading)
 * - 16:14: Scraper khởi động và cào kết quả
 * - 16:40: Kết thúc live window (hoặc khi kết quả đầy đủ)
 * 
 * Có thể config qua env variables (tùy chọn):
 * - NEXT_PUBLIC_LIVE_WINDOW_HOUR_MN (mặc định: 16)
 * - NEXT_PUBLIC_LIVE_WINDOW_START_MINUTE_MN (mặc định: 10)
 * - NEXT_PUBLIC_LIVE_WINDOW_END_MINUTE_MN (mặc định: 40)
 */
export const isWithinLiveWindowXSMN = () => {
    const vietTime = getVietnamTime();
    const hours = vietTime.getHours();
    const minutes = vietTime.getMinutes();

    // Đọc từ env hoặc dùng giá trị mặc định
    const liveHour = parseInt(process.env.NEXT_PUBLIC_LIVE_WINDOW_HOUR_MN) || 16;
    const startMinute = parseInt(process.env.NEXT_PUBLIC_LIVE_WINDOW_START_MINUTE_MN) || 10;
    const endMinute = parseInt(process.env.NEXT_PUBLIC_LIVE_WINDOW_END_MINUTE_MN) || 40;

    // Live window: 16:10 - 16:40 (hoặc đến khi kết quả đầy đủ)
    return hours === liveHour && minutes >= startMinute && minutes <= endMinute;
};

/**
 * Format date thành DD-MM-YYYY
 */
export const formatDateToDDMMYYYY = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
};

/**
 * Format date thành DD/MM/YYYY
 */
export const formatDateToDDMMYYYYSlash = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

/**
 * Lấy ngày hôm nay theo format DD-MM-YYYY
 */
export const getTodayFormatted = () => {
    const vietTime = getVietnamTime();
    return vietTime.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).replace(/\//g, '-');
};

/**
 * Filter number theo type (all, last2, last3)
 */
export const getFilteredNumber = (number, filterType = 'all') => {
    if (!number || number === '...' || number === '***') return number;
    if (typeof number !== 'string') number = String(number);

    switch (filterType) {
        case 'last2':
            return number.slice(-2);
        case 'last3':
            return number.slice(-3);
        default:
            return number;
    }
};

/**
 * Format result từ backend thành format cho frontend
 */
export const formatResultForDisplay = (result) => {
    if (!result) return null;

    return {
        drawDate: result.drawDate,
        station: result.station || 'xsmb',
        dayOfWeek: result.dayOfWeek || '',
        tentinh: result.tentinh || '',
        tinh: result.tinh || '',
        year: result.year || new Date(result.drawDate).getFullYear(),
        month: result.month || new Date(result.drawDate).getMonth() + 1,
        maDB: result.maDB || '...',
        specialPrize_0: result.specialPrize_0 || '...',
        firstPrize_0: result.firstPrize_0 || '...',
        secondPrize_0: result.secondPrize_0 || '...',
        secondPrize_1: result.secondPrize_1 || '...',
        threePrizes_0: result.threePrizes_0 || '...',
        threePrizes_1: result.threePrizes_1 || '...',
        threePrizes_2: result.threePrizes_2 || '...',
        threePrizes_3: result.threePrizes_3 || '...',
        threePrizes_4: result.threePrizes_4 || '...',
        threePrizes_5: result.threePrizes_5 || '...',
        fourPrizes_0: result.fourPrizes_0 || '...',
        fourPrizes_1: result.fourPrizes_1 || '...',
        fourPrizes_2: result.fourPrizes_2 || '...',
        fourPrizes_3: result.fourPrizes_3 || '...',
        fivePrizes_0: result.fivePrizes_0 || '...',
        fivePrizes_1: result.fivePrizes_1 || '...',
        fivePrizes_2: result.fivePrizes_2 || '...',
        fivePrizes_3: result.fivePrizes_3 || '...',
        fivePrizes_4: result.fivePrizes_4 || '...',
        fivePrizes_5: result.fivePrizes_5 || '...',
        sixPrizes_0: result.sixPrizes_0 || '...',
        sixPrizes_1: result.sixPrizes_1 || '...',
        sixPrizes_2: result.sixPrizes_2 || '...',
        sevenPrizes_0: result.sevenPrizes_0 || '...',
        sevenPrizes_1: result.sevenPrizes_1 || '...',
        sevenPrizes_2: result.sevenPrizes_2 || '...',
        sevenPrizes_3: result.sevenPrizes_3 || '...',
        lastUpdated: result.lastUpdated || Date.now(),
        isComplete: result.isComplete || false
    };
};

/**
 * Tạo empty result structure
 */
export const createEmptyResult = () => {
    const today = getTodayFormatted();
    const vietTime = getVietnamTime();

    return {
        drawDate: today,
        station: 'xsmb',
        dayOfWeek: vietTime.toLocaleString('vi-VN', { weekday: 'long' }),
        tentinh: 'Miền Bắc',
        tinh: 'MB',
        year: vietTime.getFullYear(),
        month: vietTime.getMonth() + 1,
        maDB: '...',
        specialPrize_0: '...',
        firstPrize_0: '...',
        secondPrize_0: '...',
        secondPrize_1: '...',
        threePrizes_0: '...',
        threePrizes_1: '...',
        threePrizes_2: '...',
        threePrizes_3: '...',
        threePrizes_4: '...',
        threePrizes_5: '...',
        fourPrizes_0: '...',
        fourPrizes_1: '...',
        fourPrizes_2: '...',
        fourPrizes_3: '...',
        fivePrizes_0: '...',
        fivePrizes_1: '...',
        fivePrizes_2: '...',
        fivePrizes_3: '...',
        fivePrizes_4: '...',
        fivePrizes_5: '...',
        sixPrizes_0: '...',
        sixPrizes_1: '...',
        sixPrizes_2: '...',
        sevenPrizes_0: '...',
        sevenPrizes_1: '...',
        sevenPrizes_2: '...',
        sevenPrizes_3: '...',
        lastUpdated: 0,
        isComplete: false
    };
};

