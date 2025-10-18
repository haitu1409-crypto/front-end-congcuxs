/**
 * HydrationSafeWrapper - Component wrapper để tránh hydration mismatch
 * Sử dụng để wrap các component có thể gây ra hydration mismatch
 */

import { useState, useEffect } from 'react';

const HydrationSafeWrapper = ({ children, fallback = null }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return fallback || <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>;
    }

    return children;
};

export default HydrationSafeWrapper;
















