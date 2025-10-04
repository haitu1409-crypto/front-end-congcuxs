/**
 * Custom App Component
 * Wrapper cho tất cả các pages, quản lý global state và styles
 * Tích hợp Analytics và Web Vitals tracking
 */

import '../styles/globals.css';
import Head from 'next/head';
import Analytics from '../components/Analytics';
import WebVitals from '../components/WebVitals';
import WebVitalsMonitor from '../components/WebVitalsMonitor';
import SEOAnalyticsEnhanced from '../components/SEOAnalyticsEnhanced';
import reportWebVitals from '../lib/reportWebVitals';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
    useEffect(() => {
        // Remove preloader after load
        const preloader = document.getElementById('__next_preloader');
        if (preloader) {
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 300);
            }, 500);
        }

        // Log app version (optional)
        if (process.env.NODE_ENV === 'production') {
            console.log('%c🎲 Tạo Dàn Đề v1.0.0', 'font-size: 20px; font-weight: bold; color: #4F46E5;');
            console.log('%cWebsite: ' + process.env.NEXT_PUBLIC_SITE_URL, 'color: #6B7280;');
        }
    }, []);

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
                <meta charSet="utf-8" />
            </Head>

            {/* Google Analytics */}
            <Analytics />

            {/* Web Vitals Tracking */}
            <WebVitals />

            {/* Enhanced Web Vitals Monitor */}
            <WebVitalsMonitor />

            {/* SEO Analytics Enhanced */}
            <SEOAnalyticsEnhanced />

            {/* Main Component */}
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;

// Export reportWebVitals for Next.js
export { reportWebVitals };

