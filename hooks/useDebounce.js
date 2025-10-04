/**
 * useDebounce Hook
 * Custom hook để debounce giá trị input, giúp tối ưu performance
 */

import { useState, useEffect } from 'react';

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set timeout để update giá trị sau delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup function để clear timeout nếu value thay đổi trước khi delay kết thúc
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounce;
