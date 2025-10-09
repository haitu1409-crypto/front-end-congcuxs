/**
 * Performance Monitor Component
 * Monitor Core Web Vitals and performance metrics
 */

import { useEffect } from 'react';

const PerformanceMonitor = () => {
    useEffect(() => {
        // Mobile-optimized performance monitoring
        if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
            // Detect mobile device for optimized monitoring
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
            
            // Adjust monitoring frequency for mobile/low-end devices
            const monitoringInterval = isMobile || isLowEndDevice ? 5000 : 2000;
            // Largest Contentful Paint (LCP) - Mobile optimized
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                const lcpValue = Math.round(lastEntry.startTime);
                
                // Mobile-specific LCP thresholds
                const isGoodLCP = lcpValue <= 2500;
                const isNeedsImprovement = lcpValue > 2500 && lcpValue <= 4000;
                
                console.log('LCP:', lcpValue, isMobile ? '(Mobile)' : '(Desktop)');
                
                // Send to analytics with mobile context
                if (window.gtag) {
                    window.gtag('event', 'web_vitals', {
                        name: 'LCP',
                        value: lcpValue,
                        event_category: 'Web Vitals',
                        custom_map: {
                            dimension1: isMobile ? 'mobile' : 'desktop',
                            dimension2: isGoodLCP ? 'good' : isNeedsImprovement ? 'needs_improvement' : 'poor'
                        }
                    });
                }
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // First Input Delay (FID)
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                    
                    if (window.gtag) {
                        window.gtag('event', 'web_vitals', {
                            name: 'FID',
                            value: Math.round(entry.processingStart - entry.startTime),
                            event_category: 'Web Vitals'
                        });
                    }
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                console.log('CLS:', clsValue);
                
                if (window.gtag) {
                    window.gtag('event', 'web_vitals', {
                        name: 'CLS',
                        value: Math.round(clsValue * 1000),
                        event_category: 'Web Vitals'
                    });
                }
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });

            // Interaction to Next Paint (INP)
            const inpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry) => {
                    console.log('INP:', entry.processingEnd - entry.startTime);
                    
                    if (window.gtag) {
                        window.gtag('event', 'web_vitals', {
                            name: 'INP',
                            value: Math.round(entry.processingEnd - entry.startTime),
                            event_category: 'Web Vitals'
                        });
                    }
                });
            });
            inpObserver.observe({ entryTypes: ['event'] });

            // Cleanup observers
            return () => {
                lcpObserver.disconnect();
                fidObserver.disconnect();
                clsObserver.disconnect();
                inpObserver.disconnect();
            };
        }
    }, []);

    return null; // This component doesn't render anything
};

export default PerformanceMonitor;
