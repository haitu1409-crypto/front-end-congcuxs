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
        // This handles keyboard show/hide on mobile
        if (window.visualViewport) {
            const handleVisualViewportResize = () => {
                // Use visual viewport height when keyboard is visible
                const visualHeight = window.visualViewport.height;
                const windowHeight = window.innerHeight;
                
                // When keyboard is open, visual viewport is smaller
                // Use visual viewport height for more accurate positioning
                if (visualHeight < windowHeight * 0.75) {
                    // Keyboard is likely open - use visual viewport
                    document.documentElement.style.setProperty('--vh', `${visualHeight * 0.01}px`);
                    document.documentElement.style.setProperty('--visual-vh', `${visualHeight * 0.01}px`);
                } else {
                    // Keyboard is closed - use window height
                    updateViewportHeight();
                    document.documentElement.style.setProperty('--visual-vh', `${windowHeight * 0.01}px`);
                }
            };
            
            window.visualViewport.addEventListener('resize', handleVisualViewportResize);
            window.visualViewport.addEventListener('scroll', handleVisualViewportResize);
            
            return () => {
                window.removeEventListener('resize', handleResize);
                window.removeEventListener('orientationchange', handleOrientationChange);
                window.removeEventListener('scroll', handleScroll);
                window.visualViewport.removeEventListener('resize', handleVisualViewportResize);
                window.visualViewport.removeEventListener('scroll', handleVisualViewportResize);
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

