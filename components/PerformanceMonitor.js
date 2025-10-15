/**
 * Performance Monitor Component
 * Tối ưu hóa hiệu suất và theo dõi Core Web Vitals
 */

import { useEffect, useCallback } from 'react';

const PerformanceMonitor = () => {
    // ✅ Optimize LCP (Largest Contentful Paint)
    const optimizeLCP = useCallback(() => {
        // Preload critical resources
        const criticalResources = [
            '/imgs/wukong.png',
            '/imgs/dan9x0x (1).png',
            '/imgs/dan2d1d (1).png',
            '/imgs/dan3d4d (1).png',
            '/imgs/dandacbiet (1).png',
            '/imgs/thongke (1).png'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = 'image';
            link.fetchPriority = 'high';
            document.head.appendChild(link);
        });
    }, []);

    // ✅ Optimize FID (First Input Delay)
    const optimizeFID = useCallback(() => {
        // Defer non-critical JavaScript
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (!script.async && !script.defer && !script.hasAttribute('data-critical')) {
                script.defer = true;
            }
        });
    }, []);

    // ✅ Optimize CLS (Cumulative Layout Shift)
    const optimizeCLS = useCallback(() => {
        // Reserve space for dynamic content
        const style = document.createElement('style');
        style.textContent = `
            .loadingSkeleton {
                min-height: 200px;
                width: 100%;
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: loading 1.5s infinite;
            }
            
            @keyframes loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            .toolCard {
                min-height: 200px;
            }
            
            .featureItem {
                min-height: 120px;
            }

            .slideImage {
                aspect-ratio: 4/3;
                object-fit: cover;
            }

            .heroImage {
                aspect-ratio: 16/9;
                object-fit: cover;
            }
        `;
        document.head.appendChild(style);
    }, []);

    // ✅ Optimize TTFB (Time to First Byte)
    const optimizeTTFB = useCallback(() => {
        // Preconnect to external domains
        const domains = [
            'https://www.google-analytics.com',
            'https://www.googletagmanager.com',
            'https://api.taodandewukong.pro',
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ];

        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });

        // DNS prefetch for additional domains
        const dnsDomains = [
            'https://www.google.com',
            'https://www.gstatic.com'
        ];

        dnsDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });
    }, []);

    // ✅ Optimize Resource Hints
    const optimizeResourceHints = useCallback(() => {
        // Preload critical fonts
        const fontLinks = [
            {
                href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
                as: 'style'
            }
        ];

        fontLinks.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = font.href;
            link.as = font.as;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }, []);

    // ✅ Performance monitoring
    const setupPerformanceMonitoring = useCallback(() => {
        if ('performance' in window && 'PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    switch (entry.entryType) {
                        case 'largest-contentful-paint':
                            if (entry.startTime > 2500) {
                                console.warn('LCP is slow:', entry.startTime, 'ms');
                            } else {
                                console.log('LCP is good:', entry.startTime, 'ms');
                            }
                            break;
                        case 'first-input':
                            const fid = entry.processingStart - entry.startTime;
                            if (fid > 100) {
                                console.warn('FID is slow:', fid, 'ms');
                            } else {
                                console.log('FID is good:', fid, 'ms');
                            }
                            break;
                        case 'layout-shift':
                            // ✅ Enhanced CLS monitoring with debugging info
                            if (entry.value > 0.5) {
                                console.warn('CLS is very high:', entry.value, '- Critical layout shift detected');
                                // ✅ Log which elements caused the shift
                                if (entry.sources && entry.sources.length > 0) {
                                    console.warn('Layout shift sources:', entry.sources.map(source => ({
                                        element: source.node?.tagName || 'unknown',
                                        previousRect: source.previousRect,
                                        currentRect: source.currentRect
                                    })));
                                }
                            } else if (entry.value > 0.1) {
                                console.log('CLS is moderate:', entry.value);
                            } else {
                                console.log('CLS is good:', entry.value);
                            }
                            break;
                    }
                }
            });

            observer.observe({
                entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift']
            });
        }
    }, []);

    // ✅ Run all optimizations
    useEffect(() => {
        // Run optimizations immediately
        optimizeLCP();
        optimizeFID();
        optimizeCLS();
        optimizeTTFB();
        optimizeResourceHints();
        setupPerformanceMonitoring();

        // Additional optimizations after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                // Run additional optimizations after DOM is ready
                setupPerformanceMonitoring();
            });
        }
    }, [optimizeLCP, optimizeFID, optimizeCLS, optimizeTTFB, optimizeResourceHints, setupPerformanceMonitoring]);

    return null; // This component doesn't render anything
};

export default PerformanceMonitor;