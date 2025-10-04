/**
 * Web Vitals Monitor Component
 * Theo dõi Core Web Vitals và hiệu suất trang web
 * Tuân thủ chuẩn Google Page Experience 2024
 */

import { useEffect } from 'react';

export default function WebVitalsMonitor() {
    useEffect(() => {
        // Chỉ load Web Vitals trong production hoặc khi cần thiết
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
            import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                // Largest Contentful Paint (LCP) - < 2.5s
                getLCP((metric) => {
                    console.log('LCP:', metric);
                    // Gửi metric đến analytics service
                    sendToAnalytics('LCP', metric.value, metric.rating);
                });

                // First Input Delay (FID) - < 100ms
                getFID((metric) => {
                    console.log('FID:', metric);
                    sendToAnalytics('FID', metric.value, metric.rating);
                });

                // Cumulative Layout Shift (CLS) - < 0.1
                getCLS((metric) => {
                    console.log('CLS:', metric);
                    sendToAnalytics('CLS', metric.value, metric.rating);
                });

                // First Contentful Paint (FCP) - < 1.8s
                getFCP((metric) => {
                    console.log('FCP:', metric);
                    sendToAnalytics('FCP', metric.value, metric.rating);
                });

                // Time to First Byte (TTFB) - < 800ms
                getTTFB((metric) => {
                    console.log('TTFB:', metric);
                    sendToAnalytics('TTFB', metric.value, metric.rating);
                });
            });
        }
    }, []);

    // Function để gửi metrics đến analytics
    const sendToAnalytics = (metricName, value, rating) => {
        // Gửi đến Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', metricName, {
                event_category: 'Web Vitals',
                value: Math.round(value),
                custom_map: {
                    metric_rating: rating
                }
            });
        }

        // Gửi đến custom analytics endpoint
        if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
            fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    metric: metricName,
                    value: value,
                    rating: rating,
                    url: window.location.href,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent
                })
            }).catch(err => console.log('Analytics error:', err));
        }

        // Log performance warnings
        if (rating === 'poor') {
            console.warn(`⚠️ Poor ${metricName}: ${value}ms`);
        } else if (rating === 'needs-improvement') {
            console.info(`ℹ️ Needs improvement ${metricName}: ${value}ms`);
        } else {
            console.log(`✅ Good ${metricName}: ${value}ms`);
        }
    };

    return null; // Component không render gì
}

// Performance monitoring utilities
export const performanceUtils = {
    // Đo thời gian load component
    measureComponentLoad: (componentName) => {
        const start = performance.now();
        return () => {
            const end = performance.now();
            console.log(`${componentName} load time: ${end - start}ms`);
        };
    },

    // Đo thời gian API call
    measureAPICall: (apiName) => {
        const start = performance.now();
        return (response) => {
            const end = performance.now();
            console.log(`${apiName} response time: ${end - start}ms`);
            return response;
        };
    },

    // Kiểm tra connection speed
    getConnectionSpeed: () => {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            return {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt
            };
        }
        return null;
    },

    // Optimize based on connection
    shouldOptimizeForSlowConnection: () => {
        const connection = performanceUtils.getConnectionSpeed();
        return connection && (
            connection.effectiveType === 'slow-2g' ||
            connection.effectiveType === '2g' ||
            connection.downlink < 1.5
        );
    }
};
