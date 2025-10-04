/**
 * Google Analytics Component
 * Tích hợp Google Analytics với gtag.js
 * Thu thập dữ liệu website cho Google Search Console
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';

const GA_TRACKING_ID = 'G-RLCH8J3MHR';

export const pageview = (url) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', GA_TRACKING_ID, {
            page_path: url,
        });
    }
};

export const event = ({ action, category, label, value }) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }
};

export default function GoogleAnalytics() {
    const router = useRouter();

    useEffect(() => {
        const handleRouteChange = (url) => {
            pageview(url);
        };

        // Track page views on route change
        router.events.on('routeChangeComplete', handleRouteChange);
        router.events.on('hashChangeComplete', handleRouteChange);

        // Track initial page load
        pageview(window.location.pathname + window.location.search);

        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
            router.events.off('hashChangeComplete', handleRouteChange);
        };
    }, [router.events]);

    // Custom event tracking functions
    useEffect(() => {
        // Track page load time
        if (typeof window !== 'undefined' && window.gtag) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    event({
                        action: 'page_load_time',
                        category: 'performance',
                        label: window.location.pathname,
                        value: Math.round(performance.now())
                    });
                }, 1000);
            });
        }
    }, []);

    return null; // This component doesn't render anything
}

// Custom tracking functions for specific events
export const trackDandeGeneration = (type, count) => {
    event({
        action: 'generate_dande',
        category: 'tool_usage',
        label: type,
        value: count
    });
};

export const trackPageView = (pageName) => {
    event({
        action: 'page_view',
        category: 'navigation',
        label: pageName,
        value: 1
    });
};

export const trackButtonClick = (buttonName, page) => {
    event({
        action: 'button_click',
        category: 'interaction',
        label: `${buttonName}_${page}`,
        value: 1
    });
};

export const trackDownload = (fileType, fileName) => {
    event({
        action: 'file_download',
        category: 'engagement',
        label: `${fileType}_${fileName}`,
        value: 1
    });
};

export const trackError = (errorType, errorMessage) => {
    event({
        action: 'error',
        category: 'technical',
        label: errorType,
        value: 1
    });
};
