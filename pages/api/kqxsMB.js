import { fetchJSONWithRetry, handle429Error } from '../../utils/apiUtils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backendkqxs-1.onrender.com';

// Hàm tạo userId ngẫu nhiên nếu không có hệ thống đăng nhập
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

export const apiMB = {
    getLoGanStats: async (days) => {
        if (!days || !['6', '7', '14', '30', '60'].includes(days.toString())) {
            throw new Error('Invalid days parameter. Valid options are: 6, 7, 14, 30, 60.');
        }

        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/gan?days=${days}`;

        try {
            return await fetchJSONWithRetry(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'x-user-id': getUserId(),
                },
            }, 3);
        } catch (error) {
            console.error('Lỗi khi lấy thống kê lô gan:', error);
            const errorMessage = handle429Error(error);
            throw new Error(errorMessage || 'Không thể tải thống kê lô gan, vui lòng thử lại sau');
        }
    },

    updateLoGanStats: async (days) => {
        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/gan?days=${days}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': getUserId(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Lỗi khi cập nhật: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi khi cập nhật thống kê lô gan:', error);
            throw error;
        }
    },

    getSpecialStats: async (days) => {
        const daysStr = days.toString();
        
        if (!daysStr || !['10', '20', '30', '60', '90', '180', '270', '365'].includes(daysStr)) {
            throw new Error('Invalid days parameter. Valid options are: 10, 20, 30, 60, 90, 180, 270, 365.');
        }

        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/special?days=${daysStr}`;

        try {
            return await fetchJSONWithRetry(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'x-user-id': getUserId(),
                },
            }, 3);
        } catch (error) {
            console.error('Lỗi khi lấy thống kê giải đặc biệt:', error);
            const errorMessage = handle429Error(error);
            throw new Error(errorMessage || 'Không thể tải thống kê giải đặc biệt, vui lòng thử lại sau');
        }
    },

    getSoiCauBacCauStats: async (days = 90) => {
        if (!days || !['90', '120', '150', '180', '240', '270', '300', '365'].includes(days.toString())) {
            throw new Error('Invalid days parameter. Valid options are: 90, 120, 150, 180, 240, 270, 300, 365.');
        }

        const url = `${API_BASE_URL}/api/soicau-bac-cau?days=${days}`;

        try {
            return await fetchJSONWithRetry(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'x-user-id': getUserId(),
                },
            }, 3);
        } catch (error) {
            console.error('Lỗi khi lấy thống kê soi cầu bắc cầu:', error);
            // Nếu đã có message từ backend, giữ nguyên; nếu không thì dùng message mặc định
            if (error.message && !error.message.includes('Không thể tải') && !error.message.includes('429')) {
                throw error; // Re-throw với message gốc
            }
            const errorMessage = handle429Error(error);
            throw new Error(errorMessage || 'Không thể tải thống kê soi cầu bắc cầu, vui lòng thử lại sau');
        }
    },

    updateSoiCauBacCauStats: async (days = 90) => {
        const url = `${API_BASE_URL}/api/soicau-bac-cau?days=${days}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': getUserId(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Lỗi khi cập nhật: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi khi cập nhật thống kê soi cầu bắc cầu:', error);
            throw error;
        }
    },

    updateSpecialStats: async (days) => {
        const daysStr = days.toString();
        
        if (!daysStr || !['10', '20', '30', '60', '90', '180', '270', '365'].includes(daysStr)) {
            throw new Error('Invalid days parameter. Valid options are: 10, 20, 30, 60, 90, 180, 270, 365.');
        }
        
        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/special?days=${daysStr}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': getUserId(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Lỗi khi cập nhật: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi khi cập nhật thống kê giải đặc biệt:', error);
            throw error;
        }
    },

    getDauDuoiStats: async (days) => {
        if (!days || !['30', '60', '90', '120', '180', '270', '365'].includes(days.toString())) {
            throw new Error('Invalid days parameter. Valid options are: 30, 60, 90, 120, 180, 270, 365.');
        }

        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/dau-duoi?days=${days}`;

        try {
            return await fetchJSONWithRetry(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'x-user-id': getUserId(),
                },
            }, 3);
        } catch (error) {
            console.error('Lỗi khi lấy thống kê đầu đuôi:', error);
            const errorMessage = handle429Error(error);
            throw new Error(errorMessage || 'Không thể tải thống kê đầu đuôi, vui lòng thử lại sau');
        }
    },

    updateDauDuoiStats: async (days) => {
        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/dau-duoi?days=${days}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': getUserId(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Lỗi khi cập nhật: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi khi cập nhật thống kê đầu đuôi:', error);
            throw error;
        }
    },

    getDauDuoiStatsByDate: async (days) => {
        if (!days || !['30', '60', '90', '120', '180', '270', '365'].includes(days.toString())) {
            throw new Error('Invalid days parameter. Valid options are: 30, 60, 90, 120, 180, 270, 365.');
        }

        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/dau-duoi-by-date?days=${days}`;

        try {
            return await fetchJSONWithRetry(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'x-user-id': getUserId(),
                },
            }, 3);
        } catch (error) {
            console.error('Lỗi khi lấy thống kê đầu đuôi theo ngày:', error);
            const errorMessage = handle429Error(error);
            throw new Error(errorMessage || 'Không thể tải thống kê đầu đuôi theo ngày, vui lòng thử lại sau');
        }
    },

    getSpecialStatsByWeek: async (month, year) => {
        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/special-by-week?month=${month}&year=${year}`;

        try {
            const data = await fetchJSONWithRetry(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'x-user-id': getUserId(),
                },
            }, 3);
            console.log('Dữ liệu từ API getSpecialStatsByWeek:', data); // Log để kiểm tra dữ liệu
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy thống kê giải đặc biệt theo tuần:', error);
            const errorMessage = handle429Error(error);
            throw new Error(errorMessage || 'Không thể tải thống kê giải đặc biệt theo tuần, vui lòng thử lại sau');
        }
    },

    updateSpecialStatsByWeek: async (month, year) => {
        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/special-by-week?month=${month}&year=${year}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': getUserId(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Lỗi khi cập nhật: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi khi cập nhật thống kê giải đặc biệt theo tuần:', error);
            throw error;
        }
    },

    getTanSuatLotoStats: async (days) => {
        if (!days || !['30', '60', '90', '120', '180', '270', '365'].includes(days.toString())) {
            throw new Error('Invalid days parameter. Valid options are: 30, 60, 90, 120, 180, 270, 365.');
        }

        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/tan-suat-loto?days=${days}`;

        try {
            return await fetchJSONWithRetry(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'x-user-id': getUserId(),
                },
            }, 3);
        } catch (error) {
            console.error('Lỗi khi lấy thống kê tần suất loto:', error);
            const errorMessage = handle429Error(error);
            throw new Error(errorMessage || 'Không thể tải thống kê tần suất loto, vui lòng thử lại sau');
        }
    },

    updateTanSuatLotoStats: async (days) => {
        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/tan-suat-loto?days=${days}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': getUserId(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Lỗi khi cập nhật: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi khi cập nhật thống kê tần suất loto:', error);
            throw error;
        }
    },

    getTanSuatLoCapStats: async (days) => {
        if (!days || !['30', '60', '90', '120', '180', '270', '365'].includes(days.toString())) {
            throw new Error('Invalid days parameter. Valid options are: 30, 60, 90, 120, 180, 270, 365.');
        }

        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/tan-suat-lo-cap?days=${days}`;
        console.log('Calling API:', url);

        try {
            return await fetchJSONWithRetry(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'x-user-id': getUserId(),
                },
            }, 3);
        } catch (error) {
            console.error('Lỗi khi lấy thống kê tần suất lô cặp:', error);
            const errorMessage = handle429Error(error);
            throw new Error(errorMessage || 'KHÔNG GỌI ĐƯỢC API THỐNG KÊ TẦN SUẤT LÔ CẶP....');
        }
    },

    updateTanSuatLoCapStats: async (days) => {
        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/tan-suat-lo-cap?days=${days}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': getUserId(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Lỗi khi cập nhật: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi khi cập nhật thống kê tần suất lô cặp:', error);
            throw error;
        }
    },

    // BacCau Stats API
    getBacCauStats: async (days) => {
        if (!days || !['90', '100', '120', '150'].includes(days.toString())) {
            throw new Error('Invalid days parameter. Valid options are: 90, 100, 120, 150.');
        }

        const url = `${API_BASE_URL}/api/bac-cau/stats?days=${days}`;

        try {
            return await fetchJSONWithRetry(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'x-user-id': getUserId(),
                },
            }, 3);
        } catch (error) {
            console.error('Lỗi khi lấy thống kê bắc cầu:', error);
            const errorMessage = handle429Error(error);
            throw new Error(errorMessage || 'Không thể tải thống kê bắc cầu, vui lòng thử lại sau');
        }
    },

    updateBacCauStats: async (days) => {
        const url = `${API_BASE_URL}/api/bac-cau/stats?days=${days}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': getUserId(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Lỗi khi cập nhật: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi khi cập nhật thống kê bắc cầu:', error);
            throw error;
        }
    },

    // Thống kê chi tiết Giải Đặc Biệt (gan theo bộ, tổng, chạm, đầu đuôi)
    getSpecialDetailedStats: async (days) => {
        const daysStr = days.toString();
        
        if (!daysStr || !['10', '20', '30', '60', '90', '180', '270', '365'].includes(daysStr)) {
            throw new Error('Invalid days parameter. Valid options are: 10, 20, 30, 60, 90, 180, 270, 365.');
        }

        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/special-detailed?days=${daysStr}`;

        try {
            return await fetchJSONWithRetry(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'x-user-id': getUserId(),
                },
            }, 3);
        } catch (error) {
            console.error('Lỗi khi lấy thống kê chi tiết giải đặc biệt:', error);
            const errorMessage = handle429Error(error);
            throw new Error(errorMessage || 'Không thể tải thống kê chi tiết giải đặc biệt, vui lòng thử lại sau');
        }
    },

    updateSpecialDetailedStats: async (days) => {
        const daysStr = days.toString();
        
        if (!daysStr || !['10', '20', '30', '60', '90', '180', '270', '365'].includes(daysStr)) {
            throw new Error('Invalid days parameter. Valid options are: 10, 20, 30, 60, 90, 180, 270, 365.');
        }
        
        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/special-detailed?days=${daysStr}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': getUserId(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Lỗi khi cập nhật: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi khi cập nhật thống kê chi tiết:', error);
            throw error;
        }
    },

    // API dự đoán kết quả
    predictNumbers: async (numbers, days = 365, type = 'special') => {
        if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
            throw new Error('Mảng numbers là bắt buộc và không được rỗng');
        }

        if (!['loto', 'special'].includes(type)) {
            throw new Error('Type phải là "loto" hoặc "special"');
        }

        const url = `${API_BASE_URL}/api/predictions/predict`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': getUserId(),
                },
                body: JSON.stringify({ numbers, days, type })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Lỗi khi dự đoán: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi khi dự đoán:', error);
            throw error;
        }
    },

};