/**
 * Custom App Component
 * Wrapper cho tất cả các pages, quản lý global state và styles
 * Tích hợp Analytics và Web Vitals tracking
 */

import '../styles/globals.css';
import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useState } from 'react';

import dynamic from 'next/dynamic';
import reportWebVitals from '../lib/reportWebVitals';

// Lazy load heavy components with proper error handling
const Analytics = dynamic(() => import('../components/Analytics'), { 
    ssr: false,
    loading: () => null
});
const WebVitals = dynamic(() => import('../components/WebVitals'), { 
    ssr: false,
    loading: () => null
});
const WebVitalsMonitor = dynamic(() => import('../components/WebVitalsMonitor'), { 
    ssr: false,
    loading: () => null
});
const SEOAnalyticsEnhanced = dynamic(() => import('../components/SEOAnalyticsEnhanced'), { 
    ssr: false,
    loading: () => null
});
const GoogleAnalytics = dynamic(() => import('../components/GoogleAnalytics'), { 
    ssr: false,
    loading: () => null
});

function MyApp({ Component, pageProps }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Log app version (optional)
        if (process.env.NODE_ENV === 'production') {
            console.log('%c🎲 Tạo Dàn Đề v1.0.0', 'font-size: 20px; font-weight: bold; color: #4F46E5;');
            console.log('%cWebsite: ' + process.env.NEXT_PUBLIC_SITE_URL, 'color: #6B7280;');
        }
    }, []);

    // Handle route changes for smooth navigation
    useEffect(() => {
        const handleStart = () => setIsLoading(true);
        const handleComplete = () => setIsLoading(false);

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleComplete);
        router.events.on('routeChangeError', handleComplete);

        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleComplete);
            router.events.off('routeChangeError', handleComplete);
        };
    }, [router]);

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
                <meta charSet="utf-8" />
            </Head>

            {/* Google Analytics */}
            <Analytics />
            <GoogleAnalytics />

            {/* Web Vitals Tracking */}
            <WebVitals />

            {/* Enhanced Web Vitals Monitor */}
            <WebVitalsMonitor />

            {/* SEO Analytics Enhanced */}
            <SEOAnalyticsEnhanced />

            {/* Loading indicator */}
            {isLoading && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '3px',
                    background: 'linear-gradient(90deg, #4F46E5, #7C3AED)',
                    zIndex: 9999,
                    animation: 'loading 1s ease-in-out infinite'
                }} />
            )}

            {/* Main Component */}
            <Component {...pageProps} />

            <style jsx>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100vw); }
                }
            `}</style>
        </>
    );
}

export default MyApp;

// Export reportWebVitals for Next.js
export { reportWebVitals };

