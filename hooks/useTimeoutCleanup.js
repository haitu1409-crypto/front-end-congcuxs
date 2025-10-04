/**
 * Custom hook để quản lý và cleanup setTimeout một cách an toàn
 * Giúp tránh memory leaks khi component unmount
 */

import { useRef, useEffect } from 'react';

export const useTimeoutCleanup = () => {
    const timeoutRefs = useRef([]);

    // Function để thêm timeout và tự động cleanup
    const addTimeout = (callback, delay) => {
        const timeoutId = setTimeout(callback, delay);
        timeoutRefs.current.push(timeoutId);
        return timeoutId;
    };

    // Function để clear tất cả timeouts
    const clearAllTimeouts = () => {
        timeoutRefs.current.forEach(timeoutId => {
            if (timeoutId) clearTimeout(timeoutId);
        });
        timeoutRefs.current = [];
    };

    // Cleanup khi component unmount
    useEffect(() => {
        return () => {
            clearAllTimeouts();
        };
    }, []);

    return {
        addTimeout,
        clearAllTimeouts
    };
};

export default useTimeoutCleanup;
