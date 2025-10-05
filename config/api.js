/**
 * API Configuration
 * Cấu hình URL và endpoints cho API calls
 */

export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.yourdomain.com',
    ENDPOINTS: {
        THONG_KE: {
            THREE_REGIONS: '/api/thongke/3-mien',
            BY_REGION: '/api/thongke/mien',
            OVERVIEW: '/api/thongke/tong-quan',
            BY_DATE: '/api/thongke',
            UPDATE: '/api/thongke',
            DELETE: '/api/thongke',
            SAVE: '/api/thongke/save',
            LOAD: '/api/thongke/save' // Use save endpoint for loading
        },
        DAN_DE: {
            GENERATE: '/api/dande/generate',
            SAVE: '/api/dande/save',
            STATS: '/api/dande/stats'
        }
    }
};

export default API_CONFIG;
