/**
 * HydrationSafeWrapper Component
 * Prevents hydration errors by ensuring consistent rendering between server and client
 */

import { useState, useEffect } from 'react';

export default function HydrationSafeWrapper({ children, fallback = null }) {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // During SSR and before hydration, show fallback
    if (!isHydrated) {
        return fallback;
    }

    // After hydration, show the actual content
    return children;
}