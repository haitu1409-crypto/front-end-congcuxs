/**
 * Analytics Utilities
 * Quản lý các script tracking và analytics
 */

import { initTrackingErrorHandling } from './trackingErrorHandler';

/**
 * Track page view (for manual tracking if needed)
 * @param {string} page - Page path
 * @param {string} title - Page title
 */
export const trackPageView = (page, title) => {
    // Google Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('config', 'G-RLCH8J3MHR', {
            page_title: title,
            page_location: window.location.href
        });
    }

    console.log(`Page view tracked: ${page} - ${title}`);
};


/**
 * Analytics event tracking
 * @param {string} action - Action name
 * @param {string} category - Category name
 * @param {string} label - Label (optional)
 * @param {number} value - Value (optional)
 */
export const trackEvent = (action, category, label = '', value = 0) => {
    // Google Analytics event tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }

    console.log(`Event tracked: ${category} - ${action}`, { label, value });
};

/**
 * Performance monitoring
 * @param {string} metric - Metric name
 * @param {number} value - Metric value
 * @param {string} unit - Unit (ms, bytes, etc.)
 */
export const trackPerformance = (metric, value, unit = 'ms') => {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'timing_complete', {
            name: metric,
            value: Math.round(value)
        });
    }

    console.log(`Performance metric: ${metric} = ${value}${unit}`);
};

// Auto-initialize analytics when module is imported
// DISABLED: Widget được quản lý bởi SimpleOnlineWidget component
// if (typeof window !== 'undefined') {
//     // Initialize tracking error handling first
//     initTrackingErrorHandling();
//     
//     // Wait for DOM to be ready
//     if (document.readyState === 'loading') {
//         document.addEventListener('DOMContentLoaded', initAnalytics);
//     } else {
//         initAnalytics();
//     }
// }
