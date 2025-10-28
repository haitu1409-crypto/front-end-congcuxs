import { useEffect } from 'react';

const PerformanceMonitor = () => {
    useEffect(() => {
        // Monitor Web Vitals
        if (typeof window !== 'undefined' && 'performance' in window) {
            // Monitor LCP (Largest Contentful Paint)
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log('📊 LCP:', entry.startTime);
                    }
                }
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });

            // Monitor FID (First Input Delay)
            const fidObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.log('📊 FID:', entry.processingStart - entry.startTime);
                }
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // Monitor CLS (Cumulative Layout Shift)
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                }
                console.log('📊 CLS:', clsValue);
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });

            return () => {
                observer.disconnect();
                fidObserver.disconnect();
                clsObserver.disconnect();
            };
        }
    }, []);

    return null; // This component doesn't render anything
};

export default PerformanceMonitor;