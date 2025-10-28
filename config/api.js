/**
 * API Configuration
 * Cấu hình URL và endpoints cho API calls
 */

export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
    ENDPOINTS: {
        THONG_KE: {
            THREE_REGIONS: '/api/thongke/3-mien',
            BY_REGION: '/api/thongke/mien',
            OVERVIEW: '/api/thongke/tong-quan',
            BY_DATE: '/api/thongke',
            UPDATE: '/api/thongke',
            DELETE: '/api/thongke',
            SAVE: '/api/thongke/save',
            LOAD: '/api/thongke/load' // Correct endpoint for loading
        },
        DAN_DE: {
            GENERATE: '/api/dande/generate',
            SAVE: '/api/dande/save',
            STATS: '/api/dande/stats'
        },
        SOI_CAU: {
            BACH_THU: '/api/soicau/soi-cau-bach-thu',
            RANGE: '/api/soicau/bach-thu/range'
        },
        BACH_THU_DE: {
            BASE: '/api/bach-thu-de',
            TODAY: '/api/bach-thu-de/today'
        }
    }
};

export default API_CONFIG;
