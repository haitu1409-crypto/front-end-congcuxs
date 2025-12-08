/**
 * useXSMNNext Hook
 * Custom hook để quản lý việc fetch dữ liệu XSMN từ backend
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to fetch latest XSMN results with pagination
 * @param {Object} options - Options object
 * @param {boolean} options.autoFetch - Auto fetch on mount
 * @param {number} options.refreshInterval - Refresh interval in ms
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Number of days per page (default: 10), not number of documents
 */
export function useXSMNLatest10(options = {}) {
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
            const url = `${apiUrl}/api/xsmn/results/latest10?page=${page}&limit=${limit}`;
            console.log(`🔵 Fetching XSMN: ${url}`);
            
            const response = await fetch(url);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ HTTP error! status: ${response.status}`, errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ XSMN API Response:', {
                success: result.success,
                dataLength: result.data?.length,
                pagination: result.pagination
            });

            if (result.success && result.data) {
                if (Array.isArray(result.data) && result.data.length > 0) {
                    console.log(`✅ Loaded ${result.data.length} XSMN results`);
                    setData(result.data);
                    setPagination(result.pagination);
                } else {
                    console.warn('⚠️ No XSMN data in response');
                    setData([]);
                    setPagination(result.pagination || { currentPage: 1, totalPages: 1 });
                }
            } else {
                console.error('❌ Invalid response format:', result);
                throw new Error(result.message || 'Invalid response format');
            }
        } catch (err) {
            console.error('❌ Error fetching XSMN results:', err);
            setError(err.message);
            setData([]);
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
    useXSMNLatest10
};

