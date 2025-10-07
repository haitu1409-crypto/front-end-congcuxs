/**
 * PageSpeed Optimizer Component
 * Tối ưu hóa Core Web Vitals và PageSpeed
 */

import { useEffect } from 'react';

const PageSpeedOptimizer = () => {
    useEffect(() => {
        // Optimize LCP (Largest Contentful Paint)
        const optimizeLCP = () => {
            // Preload critical resources
            const criticalResources = [
                '/favicon.ico',
                '/icon-192.png',
                '/icon-512.png'
            ];

            criticalResources.forEach(resource => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.href = resource;
                link.as = resource.endsWith('.ico') ? 'image' : 'image';
                document.head.appendChild(link);
            });
        };

        // Optimize FID (First Input Delay)
        const optimizeFID = () => {
            // Defer non-critical JavaScript
            const scripts = document.querySelectorAll('script[src]');
            scripts.forEach(script => {
                if (!script.async && !script.defer) {
                    script.defer = true;
                }
            });
        };

        // Optimize CLS (Cumulative Layout Shift)
        const optimizeCLS = () => {
            // Reserve space for dynamic content
            const style = document.createElement('style');
            style.textContent = `
                .loadingSkeleton {
                    min-height: 200px;
                    width: 100%;
                }
                
                .toolCard {
                    min-height: 200px;
                }
                
                .featureItem {
                    min-height: 120px;
                }
            `;
            document.head.appendChild(style);
        };

        // Optimize TTFB (Time to First Byte)
        const optimizeTTFB = () => {
            // Preconnect to external domains
            const domains = [
                'https://www.google-analytics.com',
                'https://www.googletagmanager.com',
                'https://api.taodandewukong.pro'
            ];

            domains.forEach(domain => {
                const link = document.createElement('link');
                link.rel = 'preconnect';
                link.href = domain;
                link.crossOrigin = 'anonymous';
                document.head.appendChild(link);
            });
        };

        // Run optimizations
        optimizeLCP();
        optimizeFID();
        optimizeCLS();
        optimizeTTFB();

        // Performance monitoring
        if ('performance' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log('LCP:', entry.startTime);
                    }
                    if (entry.entryType === 'first-input') {
                        console.log('FID:', entry.processingStart - entry.startTime);
                    }
                    if (entry.entryType === 'layout-shift') {
                        console.log('CLS:', entry.value);
                    }
                }
            });

            observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        }

    }, []);

    return null; // This component doesn't render anything
};

export default PageSpeedOptimizer;
