/**
 * Analytics Utilities
 * Quản lý các script tracking và analytics
 */

// whos.amung.us configuration
export const WHOS_AMUNG_US_CONFIG = {
    widgetId: '7aijsjfwyp',
    scriptUrl: '//waust.at/d.js',
    dashboardUrl: 'https://whos.amung.us/stats/7aijsjfwyp'
};

/**
 * Load whos.amung.us tracking script
 * @param {string} widgetId - Widget ID từ whos.amung.us
 */
export const loadWhosAmungUs = (widgetId = WHOS_AMUNG_US_CONFIG.widgetId) => {
    // Check if script is already loaded
    if (window._wau || document.querySelector('script[src*="waust.at"]')) {
        console.log('whos.amung.us script already loaded');
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        try {
            // Initialize whos.amung.us
            window._wau = window._wau || [];
            window._wau.push(["dynamic", widgetId, "o34", "c4302bffffff", "small"]);

            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = WHOS_AMUNG_US_CONFIG.scriptUrl;

            script.onload = () => {
                console.log('whos.amung.us script loaded successfully');
                resolve();
            };

            script.onerror = (error) => {
                console.error('Failed to load whos.amung.us script:', error);
                reject(error);
            };

            document.head.appendChild(script);
        } catch (error) {
            console.error('Error creating whos.amung.us script:', error);
            reject(error);
        }
    });
};

/**
 * Initialize analytics on page load
 */
export const initAnalytics = () => {
    // Load whos.amung.us
    loadWhosAmungUs().catch(error => {
        console.error('Analytics initialization failed:', error);
    });
};

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
 * Get current online count (if available)
 * @returns {number|null} Current online count or null if not available
 */
export const getOnlineCount = () => {
    const widgetElement = document.getElementById('_wauo34');
    if (widgetElement && widgetElement.textContent) {
        const count = parseInt(widgetElement.textContent);
        return isNaN(count) ? null : count;
    }
    return null;
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
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAnalytics);
    } else {
        initAnalytics();
    }
}
