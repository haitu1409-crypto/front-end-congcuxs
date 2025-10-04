/**
 * Google Analytics Component
 * Tối ưu cho Next.js với tracking đầy đủ
 */

import Script from 'next/script';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// Google Analytics Measurement ID
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Track pageviews
export const pageview = (url) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', GA_MEASUREMENT_ID, {
            page_path: url,
        });
    }
};

// Track events
export const event = ({ action, category, label, value }) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value,
        });
    }
};

// Analytics Component
export default function Analytics() {
    const router = useRouter();

    useEffect(() => {
        // Track page views on route change
        const handleRouteChange = (url) => {
            pageview(url);
        };

        router.events.on('routeChangeComplete', handleRouteChange);
        return () => {
            router.events.off('routeChangeComplete', handleRouteChange);
        };
    }, [router.events]);

    // Don't load GA in development
    if (process.env.NODE_ENV !== 'production' || !GA_MEASUREMENT_ID) {
        return null;
    }

    return (
        <>
            {/* Global Site Tag (gtag.js) - Google Analytics */}
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
                id="gtag-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              send_page_view: false
            });
          `,
                }}
            />
        </>
    );
}

// Custom hooks for tracking
export const useAnalytics = () => {
    return {
        trackEvent: event,
        trackPageView: pageview,
    };
};

