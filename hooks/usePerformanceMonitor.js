/**
 * Performance Monitoring Hook
 * Hook để monitor hiệu suất của ứng dụng
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const usePerformanceMonitor = (componentName = 'Unknown') => {
    const [metrics, setMetrics] = useState({
        renderCount: 0,
        lastRenderTime: 0,
        averageRenderTime: 0,
        memoryUsage: 0,
        isVisible: true
    });

    const renderStartTime = useRef(0);
    const renderTimes = useRef([]);
    const observerRef = useRef(null);

    // Track render performance
    const trackRender = useCallback(() => {
        const now = performance.now();
        const renderTime = now - renderStartTime.current;

        renderTimes.current.push(renderTime);

        // Keep only last 10 render times
        if (renderTimes.current.length > 10) {
            renderTimes.current.shift();
        }

        const averageRenderTime = renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length;

        setMetrics(prev => ({
            ...prev,
            renderCount: prev.renderCount + 1,
            lastRenderTime: renderTime,
            averageRenderTime: Math.round(averageRenderTime * 100) / 100
        }));

        renderStartTime.current = now;
    }, []);

    // Track memory usage
    const trackMemory = useCallback(() => {
        if (performance.memory) {
            const memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024); // MB
            setMetrics(prev => ({
                ...prev,
                memoryUsage
            }));
        }
    }, []);

    // Intersection Observer để track visibility
    useEffect(() => {
        const element = document.querySelector(`[data-component="${componentName}"]`);
        if (!element) return;

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                setMetrics(prev => ({
                    ...prev,
                    isVisible: entry.isIntersecting
                }));
            },
            { threshold: 0.1 }
        );

        observerRef.current.observe(element);

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [componentName]);

    // Track render start
    useEffect(() => {
        renderStartTime.current = performance.now();
    });

    // Track render end
    useEffect(() => {
        trackRender();
        trackMemory();
    });

    // Web Vitals tracking
    const trackWebVitals = useCallback(() => {
        // First Contentful Paint
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        console.log(`🎨 FCP: ${entry.startTime}ms`);
                    }
                }
            });
            observer.observe({ entryTypes: ['paint'] });

            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.log(`📏 LCP: ${entry.startTime}ms`);
                }
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // Cumulative Layout Shift
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        console.log(`📐 CLS: ${entry.value}`);
                    }
                }
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }, []);

    // Track API performance
    const trackApiCall = useCallback((apiName, startTime, endTime, success = true) => {
        const duration = endTime - startTime;
        console.log(`🌐 API ${apiName}: ${duration}ms (${success ? 'success' : 'failed'})`);

        // Send to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'api_call', {
                'api_name': apiName,
                'duration': duration,
                'success': success
            });
        }
    }, []);

    // Track user interactions
    const trackInteraction = useCallback((interactionType, element = null) => {
        console.log(`👆 Interaction: ${interactionType}`, element);

        if (typeof gtag !== 'undefined') {
            gtag('event', 'user_interaction', {
                'interaction_type': interactionType,
                'element': element?.tagName || 'unknown'
            });
        }
    }, []);

    // Get performance summary
    const getPerformanceSummary = useCallback(() => {
        return {
            component: componentName,
            metrics,
            timestamp: new Date().toISOString(),
            recommendations: generateRecommendations(metrics)
        };
    }, [componentName, metrics]);

    // Generate performance recommendations
    const generateRecommendations = (currentMetrics) => {
        const recommendations = [];

        if (currentMetrics.averageRenderTime > 16) {
            recommendations.push('Consider using React.memo() or useMemo() to optimize re-renders');
        }

        if (currentMetrics.memoryUsage > 50) {
            recommendations.push('High memory usage detected, consider optimizing data structures');
        }

        if (currentMetrics.renderCount > 20) {
            recommendations.push('High render count, check for unnecessary re-renders');
        }

        if (!currentMetrics.isVisible) {
            recommendations.push('Component is not visible, consider lazy loading');
        }

        return recommendations;
    };

    // Cleanup
    useEffect(() => {
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return {
        metrics,
        trackApiCall,
        trackInteraction,
        trackWebVitals,
        getPerformanceSummary
    };
};

export default usePerformanceMonitor;
