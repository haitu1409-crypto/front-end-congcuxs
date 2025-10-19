/**
 * CLS Optimizer Component
 * Prevents Cumulative Layout Shift by reserving space and optimizing loading
 */

import { useEffect } from 'react';

const CLSOptimizer = () => {
    useEffect(() => {
        // 1. Optimize font loading to prevent CLS
        const optimizeFonts = () => {
            // Add font-display: swap to all fonts
            const style = document.createElement('style');
            style.textContent = `
                @font-face {
                    font-family: 'system-fonts';
                    src: local('-apple-system'), local('BlinkMacSystemFont'), local('Segoe UI');
                    font-display: swap;
                }
                
                /* Prevent font loading shifts */
                * {
                    font-display: swap !important;
                }
            `;
            document.head.appendChild(style);
        };

        // 2. Reserve space for dynamic content
        const reserveSpace = () => {
            // Add CSS to reserve space for common dynamic elements
            const style = document.createElement('style');
            style.textContent = `
                /* Reserve space for TodayPredictions */
                .today-predictions-container {
                    min-height: 200px !important;
                    contain: layout style !important;
                }
                
                /* Reserve space for dynamic components */
                .dynamic-component {
                    min-height: 150px !important;
                    contain: layout style !important;
                }
                
                /* Prevent layout shifts during loading */
                .loading-placeholder {
                    min-height: 200px !important;
                    contain: layout style !important;
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 8px;
                }
                
                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                
                /* Optimize images to prevent CLS */
                img {
                    height: auto !important;
                    max-width: 100% !important;
                    contain: layout style !important;
                }
                
                /* Prevent layout shifts for icons */
                svg {
                    contain: layout style !important;
                }
            `;
            document.head.appendChild(style);
        };

        // 3. Monitor and log CLS
        const monitorCLS = () => {
            if ('PerformanceObserver' in window) {
                try {
                    const observer = new PerformanceObserver((list) => {
                        for (const entry of list.getEntries()) {
                            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                                console.log('CLS detected:', entry.value);
                                if (entry.value > 0.1) {
                                    console.warn('High CLS detected:', entry.value, entry);
                                }
                            }
                        }
                    });
                    observer.observe({ entryTypes: ['layout-shift'] });
                } catch (error) {
                    console.log('CLS monitoring not supported:', error);
                }
            }
        };

        // 4. Optimize images
        const optimizeImages = () => {
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
                    // Add default dimensions to prevent CLS
                    img.style.minHeight = '100px';
                    img.style.contain = 'layout style';
                }
            });
        };

        // 5. Preload critical resources
        const preloadCriticalResources = () => {
            // Preload critical CSS
            const criticalCSS = document.createElement('link');
            criticalCSS.rel = 'preload';
            criticalCSS.as = 'style';
            criticalCSS.href = '/styles/critical.css';
            document.head.appendChild(criticalCSS);
        };

        // Run optimizations
        optimizeFonts();
        reserveSpace();
        monitorCLS();
        optimizeImages();
        preloadCriticalResources();

        // Cleanup
        return () => {
            // Remove any added styles or observers
            const addedStyles = document.querySelectorAll('style[data-cls-optimizer]');
            addedStyles.forEach(style => style.remove());
        };
    }, []);

    return null; // This component doesn't render anything
};

export default CLSOptimizer;
