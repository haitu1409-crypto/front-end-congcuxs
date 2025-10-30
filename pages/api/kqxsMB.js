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
            const response = await fetch(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'x-user-id': getUserId(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Lỗi khi gọi API: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi khi lấy thống kê lô gan:', error);
            throw new Error('Không thể tải thống kê lô gan, vui lòng thử lại sau');
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
        if (!days || !['10', '20', '30', '60', '90', '365'].includes(days.toString())) {
            throw new Error('Invalid days parameter. Valid options are: 10, 20, 30, 60, 90, 365.');
        }

        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/special?days=${days}`;

        try {
            const response = await fetch(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'x-user-id': getUserId(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Lỗi khi gọi API: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi khi lấy thống kê giải đặc biệt:', error);
            throw new Error('Không thể tải thống kê giải đặc biệt, vui lòng thử lại sau');
        }
    },

    updateSpecialStats: async (days) => {
        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/special?days=${days}`;

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
        if (!days || !['30', '60', '90', '120', '180', '365'].includes(days.toString())) {
            throw new Error('Invalid days parameter. Valid options are: 30, 60, 90, 120, 180, 365.');
        }

        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/dau-duoi?days=${days}`;

        try {
            const response = await fetch(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'x-user-id': getUserId(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Lỗi khi gọi API: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi khi lấy thống kê đầu đuôi:', error);
            throw new Error('Không thể tải thống kê đầu đuôi, vui lòng thử lại sau');
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
        if (!days || !['30', '60', '90', '120', '180', '365'].includes(days.toString())) {
            throw new Error('Invalid days parameter. Valid options are: 30, 60, 90, 120, 180, 365.');
        }

        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/dau-duoi-by-date?days=${days}`;

        try {
            const response = await fetch(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'x-user-id': getUserId(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Lỗi khi gọi API: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi khi lấy thống kê đầu đuôi theo ngày:', error);
            throw new Error('Không thể tải thống kê đầu đuôi theo ngày, vui lòng thử lại sau');
        }
    },

    getSpecialStatsByWeek: async (month, year) => {
        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/special-by-week?month=${month}&year=${year}`;

        try {
            const response = await fetch(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'x-user-id': getUserId(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Lỗi khi gọi API: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Dữ liệu từ API getSpecialStatsByWeek:', data); // Log để kiểm tra dữ liệu
            return data;
        } catch (error) {
            console.error('Lỗi khi lấy thống kê giải đặc biệt theo tuần:', error);
            throw new Error('Không thể tải thống kê giải đặc biệt theo tuần, vui lòng thử lại sau');
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
        if (!days || !['30', '60', '90', '120', '180', '365'].includes(days.toString())) {
            throw new Error('Invalid days parameter. Valid options are: 30, 60, 90, 120, 180, 365.');
        }

        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/tan-suat-loto?days=${days}`;

        try {
            const response = await fetch(url, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'x-user-id': getUserId(),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Lỗi khi gọi API: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi khi lấy thống kê tần suất loto:', error);
            throw new Error('Không thể tải thống kê tần suất loto, vui lòng thử lại sau');
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
        if (!days || !['30', '60', '90', '120', '180', '365'].includes(days.toString())) {
            throw new Error('Invalid days parameter. Valid options are: 30, 60, 90, 120, 180, 365.');
        }

        const url = `${API_BASE_URL}/api/kqxs/xsmb/statistics/tan-suat-lo-cap?days=${days}`;
        console.log('Calling API:', url);
        const response = await fetch(url, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache',
                'x-user-id': getUserId(),
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'KHÔNG GỌI ĐƯỢC API THỐNG KÊ TẦN SUẤT LÔ CẶP....');
        }

        return response.json();
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

};