/**
 * Custom App Component
 * Wrapper cho tất cả các pages, quản lý global state và styles
 * Tích hợp Analytics và Web Vitals tracking
 */

// ✅ Import CSS in correct order
import '../styles/globals.css';
import '../styles/fonts.css';
import '../styles/CLSFix.css';
import '../styles/CriticalCLSFix.css';
import Head from 'next/head';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useState } from 'react';

import dynamic from 'next/dynamic';
import reportWebVitals from '../lib/reportWebVitals';

// ✅ Multi-Search Engine Optimizer - For Bing, Cốc Cốc, Google
const MultiSearchEngineOptimizer = dynamic(() => import('../components/MultiSearchEngineOptimizer'), {
    ssr: true,  // SSR for SEO
    loading: () => null
});

// ✅ SEO Schema Components
const OrganizationSchema = dynamic(() => import('../components/SEO/OrganizationSchema'), {
    ssr: true,
    loading: () => null
});

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
// ✅ Temporarily disabled due to web-vitals dependency issue
// const SEOAnalyticsEnhanced = dynamic(() => import('../components/SEOAnalyticsEnhanced'), {
//     ssr: false,
//     loading: () => null
// });
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
        const handleComplete = () => {
            setIsLoading(false);
        };
        const handleError = () => {
            setIsLoading(false);
            console.log('Route change error occurred');
        };

        router.events.on('routeChangeStart', handleStart);
        router.events.on('routeChangeComplete', handleComplete);
        router.events.on('routeChangeError', handleError);

        return () => {
            router.events.off('routeChangeStart', handleStart);
            router.events.off('routeChangeComplete', handleComplete);
            router.events.off('routeChangeError', handleError);
        };
    }, [router]);

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
                <meta charSet="utf-8" />

                {/* ✅ Critical resource hints for LCP optimization */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="dns-prefetch" href="//fonts.googleapis.com" />
                <link rel="dns-prefetch" href="//fonts.gstatic.com" />

                {/* ✅ Preload critical images */}
                <link rel="preload" as="image" href="/imgs/monkey.png" />
                <link rel="preload" as="image" href="/imgs/wukong.png" />

                {/* ✅ Search Engine Verification */}
                {/* TODO: Thay YOUR_GOOGLE_VERIFICATION_CODE bằng code thật từ Search Console */}
                <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "YOUR_GOOGLE_VERIFICATION_CODE"} />
                <meta name="msvalidate.01" content={process.env.NEXT_PUBLIC_BING_VERIFICATION || "YOUR_BING_VERIFICATION_CODE"} />
                <meta name="coccoc-verification" content={process.env.NEXT_PUBLIC_COCCOC_VERIFICATION || "YOUR_COCCOC_VERIFICATION_CODE"} />
            </Head>

            {/* ✅ Multi-Search Engine Optimizer */}
            <MultiSearchEngineOptimizer
                title="Tạo Dàn Đề Wukong (Tao Dan De) | Ứng Dụng Tạo Mức Số 2025"
                description="Tạo dàn đề (tao dan de) online miễn phí. Công cụ tạo dàn số, mức số chuyên nghiệp. Hỗ trợ: taodande, lô đề, dan de."
                keywords="tạo dàn đề wukong, tao dan de wukong, taodandewukong, tạo dàn số, tao dan so, lô đề, lo de"
            />

            {/* ✅ SEO Schema - Organization */}
            <OrganizationSchema />

            {/* Google Analytics */}
            <Analytics />
            <GoogleAnalytics />

            {/* Web Vitals Tracking */}
            <WebVitals />

            {/* Enhanced Web Vitals Monitor */}
            <WebVitalsMonitor />

            {/* SEO Analytics Enhanced - Temporarily disabled */}
            {/* <SEOAnalyticsEnhanced /> */}


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

