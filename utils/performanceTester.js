/**
 * Frontend Performance Tester
 * Utility để test hiệu suất frontend components
 */

class FrontendPerformanceTester {
    constructor() {
        this.metrics = {
            renderTimes: [],
            apiCallTimes: [],
            memoryUsage: [],
            userInteractions: [],
            errors: []
        };

        this.observers = new Map();
        this.isMonitoring = false;
    }

    /**
     * Start performance monitoring
     */
    startMonitoring() {
        this.isMonitoring = true;
        console.log('🔍 Frontend performance monitoring started');

        // Monitor render times
        this.monitorRenderTimes();

        // Monitor memory usage
        this.monitorMemoryUsage();

        // Monitor user interactions
        this.monitorUserInteractions();

        // Monitor Web Vitals
        this.monitorWebVitals();
    }

    /**
     * Stop performance monitoring
     */
    stopMonitoring() {
        this.isMonitoring = false;

        // Disconnect all observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();

        console.log('⏹️ Frontend performance monitoring stopped');
    }

    /**
     * Monitor render times
     */
    monitorRenderTimes() {
        let renderStartTime = 0;

        // Override React's render method (if available)
        if (typeof window !== 'undefined' && window.React) {
            const originalRender = window.React.Component.prototype.render;
            window.React.Component.prototype.render = function () {
                const start = performance.now();
                const result = originalRender.apply(this, arguments);
                const end = performance.now();

                if (this.isMonitoring) {
                    this.metrics.renderTimes.push({
                        component: this.constructor.name,
                        renderTime: end - start,
                        timestamp: Date.now()
                    });
                }

                return result;
            };
        }
    }

    /**
     * Monitor memory usage
     */
    monitorMemoryUsage() {
        if (!performance.memory) return;

        const checkMemory = () => {
            if (this.isMonitoring) {
                this.metrics.memoryUsage.push({
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                });
            }
        };

        // Check memory every 5 seconds
        const interval = setInterval(checkMemory, 5000);
        this.observers.set('memory', { disconnect: () => clearInterval(interval) });
    }

    /**
     * Monitor user interactions
     */
    monitorUserInteractions() {
        const trackInteraction = (event) => {
            if (this.isMonitoring) {
                this.metrics.userInteractions.push({
                    type: event.type,
                    target: event.target.tagName,
                    timestamp: Date.now(),
                    x: event.clientX,
                    y: event.clientY
                });
            }
        };

        const events = ['click', 'scroll', 'keydown', 'mousemove'];
        events.forEach(eventType => {
            document.addEventListener(eventType, trackInteraction, { passive: true });
        });

        this.observers.set('interactions', {
            disconnect: () => {
                events.forEach(eventType => {
                    document.removeEventListener(eventType, trackInteraction);
                });
            }
        });
    }

    /**
     * Monitor Web Vitals
     */
    monitorWebVitals() {
        // First Contentful Paint
        if ('PerformanceObserver' in window) {
            const paintObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-contentful-paint') {
                        console.log(`🎨 FCP: ${entry.startTime}ms`);
                    }
                }
            });
            paintObserver.observe({ entryTypes: ['paint'] });
            this.observers.set('paint', paintObserver);

            // Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    console.log(`📏 LCP: ${entry.startTime}ms`);
                }
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.set('lcp', lcpObserver);

            // Cumulative Layout Shift
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        console.log(`📐 CLS: ${entry.value}`);
                    }
                }
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
            this.observers.set('cls', clsObserver);
        }
    }

    /**
     * Track API call performance
     */
    trackApiCall(apiName, startTime, endTime, success = true) {
        if (this.isMonitoring) {
            this.metrics.apiCallTimes.push({
                apiName,
                duration: endTime - startTime,
                success,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Track component performance
     */
    trackComponentPerformance(componentName, startTime, endTime) {
        if (this.isMonitoring) {
            this.metrics.renderTimes.push({
                component: componentName,
                renderTime: endTime - startTime,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Track error
     */
    trackError(error, context = {}) {
        if (this.isMonitoring) {
            this.metrics.errors.push({
                error: error.message || error,
                stack: error.stack,
                context,
                timestamp: Date.now()
            });
        }
    }

    /**
     * Get performance report
     */
    getPerformanceReport() {
        const report = {
            summary: {
                totalRenderTimes: this.metrics.renderTimes.length,
                totalApiCalls: this.metrics.apiCallTimes.length,
                totalInteractions: this.metrics.userInteractions.length,
                totalErrors: this.metrics.errors.length,
                averageRenderTime: this.calculateAverage(this.metrics.renderTimes, 'renderTime'),
                averageApiCallTime: this.calculateAverage(this.metrics.apiCallTimes, 'duration'),
                memoryUsage: this.getMemoryStats()
            },
            details: {
                renderTimes: this.metrics.renderTimes,
                apiCallTimes: this.metrics.apiCallTimes,
                memoryUsage: this.metrics.memoryUsage,
                userInteractions: this.metrics.userInteractions,
                errors: this.metrics.errors
            },
            recommendations: this.generateRecommendations()
        };

        return report;
    }

    /**
     * Calculate average
     */
    calculateAverage(array, property) {
        if (array.length === 0) return 0;
        const sum = array.reduce((acc, item) => acc + item[property], 0);
        return Math.round(sum / array.length);
    }

    /**
     * Get memory statistics
     */
    getMemoryStats() {
        if (this.metrics.memoryUsage.length === 0) return null;

        const latest = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
        const max = Math.max(...this.metrics.memoryUsage.map(m => m.used));
        const min = Math.min(...this.metrics.memoryUsage.map(m => m.used));

        return {
            current: latest.used,
            max,
            min,
            average: this.calculateAverage(this.metrics.memoryUsage, 'used')
        };
    }

    /**
     * Generate performance recommendations
     */
    generateRecommendations() {
        const recommendations = [];

        // Check render performance
        const avgRenderTime = this.calculateAverage(this.metrics.renderTimes, 'renderTime');
        if (avgRenderTime > 16) {
            recommendations.push('Consider using React.memo() or useMemo() to optimize re-renders');
        }

        // Check memory usage
        const memoryStats = this.getMemoryStats();
        if (memoryStats && memoryStats.current > 50 * 1024 * 1024) { // 50MB
            recommendations.push('High memory usage detected, consider optimizing data structures');
        }

        // Check API performance
        const avgApiTime = this.calculateAverage(this.metrics.apiCallTimes, 'duration');
        if (avgApiTime > 1000) {
            recommendations.push('API calls are slow, consider implementing caching');
        }

        // Check error rate
        const errorRate = this.metrics.errors.length / this.metrics.userInteractions.length;
        if (errorRate > 0.1) {
            recommendations.push('High error rate detected, review error handling');
        }

        return recommendations;
    }

    /**
     * Export performance data
     */
    exportPerformanceData() {
        const report = this.getPerformanceReport();
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });

        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `performance-report-${Date.now()}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }

    /**
     * Clear performance data
     */
    clearPerformanceData() {
        this.metrics = {
            renderTimes: [],
            apiCallTimes: [],
            memoryUsage: [],
            userInteractions: [],
            errors: []
        };
        console.log('🧹 Performance data cleared');
    }
}

// Export singleton instance
const performanceTester = new FrontendPerformanceTester();

export default performanceTester;
