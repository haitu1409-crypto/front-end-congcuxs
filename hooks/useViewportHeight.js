/**
 * useViewportHeight Hook
 * Fixes mobile viewport height issues when browser bar shows/hides
 * Returns actual viewport height that accounts for browser bar
 */

import { useState, useEffect } from 'react';

export function useViewportHeight() {
    const [viewportHeight, setViewportHeight] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerHeight;
        }
        return 0;
    });

    useEffect(() => {
        // Function to update viewport height
        const updateViewportHeight = () => {
            const vh = window.innerHeight;
            setViewportHeight(vh);
            
            // Set CSS custom property for dynamic viewport height
            document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
        };

        // Initial update
        updateViewportHeight();

        // Update on resize (handles browser bar show/hide)
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(updateViewportHeight, 100);
        };

        // Update on orientation change
        const handleOrientationChange = () => {
            // Delay to wait for browser to adjust
            setTimeout(updateViewportHeight, 500);
        };

        // Update on scroll (for mobile browser bar)
        let scrollTimeout;
        const handleScroll = () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(updateViewportHeight, 150);
        };

        // Listen to events
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Visual Viewport API (better for mobile browsers)
        if (window.visualViewport) {
            const handleVisualViewportResize = () => {
                updateViewportHeight();
            };
            window.visualViewport.addEventListener('resize', handleVisualViewportResize);
            
            return () => {
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('orientationchange', handleOrientationChange);
                window.removeEventListener('scroll', handleScroll);
                window.visualViewport.removeEventListener('resize', handleVisualViewportResize);
            };
        }

        return () => {
            clearTimeout(resizeTimeout);
            clearTimeout(scrollTimeout);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleOrientationChange);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return viewportHeight;
}

