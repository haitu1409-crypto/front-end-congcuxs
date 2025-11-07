/**
 * SEO Analytics Enhanced Component
 * Theo dõi và phân tích hiệu suất SEO realtime
 * Tích hợp Google Analytics 4, Search Console, và custom metrics
 */

import { useEffect, useCallback } from 'react';

export default function SEOAnalyticsEnhanced() {
    const extractKeywordsFromPage = useCallback(() => {
        const keywords = [];

        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords) {
            keywords.push(...metaKeywords.content.split(',').map(k => k.trim()));
        }

        const title = document.title;
        keywords.push(...title.toLowerCase().split(' ').filter(word => word.length > 3));

        const headings = document.querySelectorAll('h1, h2, h3');
        headings.forEach(heading => {
            keywords.push(...heading.textContent.toLowerCase().split(' ').filter(word => word.length > 3));
        });

        return [...new Set(keywords)];
    }, []);

    const getPageType = useCallback(() => {
        const path = window.location.pathname;
        if (path === '/') return 'homepage';
        if (path.includes('dan-2d')) return 'dan-2d';
        if (path.includes('dan-3d4d')) return 'dan-3d4d';
        if (path.includes('dan-dac-biet')) return 'dan-dac-biet';
        if (path.includes('thong-ke')) return 'thong-ke';
        if (path.includes('faq')) return 'faq';
        return 'other';
    }, []);

    const getConnectionType = useCallback(() => {
        if ('connection' in navigator) {
            return navigator.connection.effectiveType || 'unknown';
        }
        return 'unknown';
    }, []);

    const trackEvent = useCallback((eventName, parameters) => {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                event_category: 'SEO Analytics',
                ...parameters
            });
        }

        if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
            fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: eventName,
                    parameters: parameters,
                    timestamp: Date.now(),
                    url: window.location.href
                })
            }).catch(err => console.log('Analytics error:', err));
        }

        if (process.env.NODE_ENV === 'development' && Math.random() < 0.1) {
            console.log(`📊 SEO Analytics: ${eventName}`, parameters);
        }
    }, []);

    const trackMetric = useCallback((metricName) => (metric) => {
        trackEvent('web_vitals', {
            metric_name: metricName,
            metric_value: metric.value,
            metric_rating: metric.rating,
            page_type: getPageType()
        });
    }, [trackEvent, getPageType]);

    const initializeSEOTracking = useCallback(() => {
        // Google Analytics 4 với SEO tracking
        if (typeof gtag !== 'undefined') {
            // Enhanced ecommerce tracking
            gtag('config', process.env.NEXT_PUBLIC_GA_ID || 'GA_MEASUREMENT_ID', {
                // SEO specific configuration
                page_title: document.title,
                page_location: window.location.href,
                // Enhanced measurement
                enhanced_measurements: {
                    scrolls: true,
                    outbound_clicks: true,
                    site_search: true,
                    video_engagement: true,
                    file_downloads: true
                }
            });
        }

        // Custom SEO Analytics
        if (process.env.NEXT_PUBLIC_SEO_ANALYTICS_ENABLED === 'true') {
            window.seoAnalytics = {
                pageLoadTime: Date.now(),
                scrollDepth: 0,
                timeOnPage: 0,
                interactions: 0,
                keywords: extractKeywordsFromPage(),
                pageType: getPageType()
            };
        }
    }, [extractKeywordsFromPage, getPageType]);

    const trackPagePerformance = useCallback(() => {
        if ('web-vitals' in window) {
            import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                getLCP(trackMetric('LCP'));
                getFID(trackMetric('FID'));
                getCLS(trackMetric('CLS'));
                getFCP(trackMetric('FCP'));
                getTTFB(trackMetric('TTFB'));
            });
        }

        const loadHandler = () => {
            const loadTime = performance.now();
            trackEvent('page_performance', {
                load_time: Math.round(loadTime),
                page_type: getPageType(),
                connection_type: getConnectionType()
            });
        };

        window.addEventListener('load', loadHandler);

        return () => {
            window.removeEventListener('load', loadHandler);
        };
    }, [trackMetric, trackEvent, getPageType, getConnectionType]);

    const trackUserEngagement = useCallback(() => {
        let maxScroll = 0;
        const scrollHandler = () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                trackEvent('scroll_depth', {
                    depth: maxScroll,
                    page_type: getPageType()
                });
            }
        };
        window.addEventListener('scroll', scrollHandler);

        const startTime = Date.now();
        const trackTimeOnPage = () => {
            const timeSpent = Date.now() - startTime;
            trackEvent('time_on_page', {
                duration: timeSpent,
                page_type: getPageType()
            });
        };

        window.addEventListener('beforeunload', trackTimeOnPage);
        const visibilityHandler = () => {
            if (document.visibilityState === 'hidden') {
                trackTimeOnPage();
            }
        };
        document.addEventListener('visibilitychange', visibilityHandler);

        let interactions = 0;
        const interactionHandler = () => {
            interactions++;
            trackEvent('user_interaction', {
                interaction_count: interactions,
                page_type: getPageType()
            });
        };

        ['click', 'keydown', 'touchstart'].forEach(event => {
            document.addEventListener(event, interactionHandler, { once: true });
        });
        return () => {
            window.removeEventListener('scroll', scrollHandler);
            window.removeEventListener('beforeunload', trackTimeOnPage);
            document.removeEventListener('visibilitychange', visibilityHandler);
        };
    }, [trackEvent, getPageType]);

    const trackSEOMetrics = useCallback(() => {
        const keywords = extractKeywordsFromPage();
        trackEvent('seo_keywords', {
            keywords: keywords,
            page_type: getPageType(),
            keyword_count: keywords.length
        });

        // Track content engagement
        trackEvent('content_engagement', {
            headings_count: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
            images_count: document.querySelectorAll('img').length,
            links_count: document.querySelectorAll('a').length,
            page_type: getPageType()
        });

        // Track mobile optimization
        trackEvent('mobile_optimization', {
            is_mobile: window.innerWidth < 768,
            viewport_width: window.innerWidth,
            viewport_height: window.innerHeight,
            user_agent: navigator.userAgent
        });
    }, [extractKeywordsFromPage, trackEvent, getPageType]);

    useEffect(() => {
        initializeSEOTracking();
        const cleanupPerformance = trackPagePerformance();
        const cleanupEngagement = trackUserEngagement();
        trackSEOMetrics();

        return () => {
            cleanupPerformance && cleanupPerformance();
            cleanupEngagement && cleanupEngagement();
        };
    }, [initializeSEOTracking, trackPagePerformance, trackUserEngagement, trackSEOMetrics]);

    return null; // Component không render gì
}

// SEO Performance utilities
export const seoPerformanceUtils = {
    // Check if page is optimized for SEO
    checkSEOOptimization: () => {
        const checks = {
            hasTitle: !!document.title,
            hasMetaDescription: !!document.querySelector('meta[name="description"]'),
            hasH1: !!document.querySelector('h1'),
            hasCanonical: !!document.querySelector('link[rel="canonical"]'),
            hasOpenGraph: !!document.querySelector('meta[property="og:title"]'),
            hasStructuredData: !!document.querySelector('script[type="application/ld+json"]'),
            imageAltTags: Array.from(document.querySelectorAll('img')).filter(img => img.alt).length,
            totalImages: document.querySelectorAll('img').length,
            internalLinks: Array.from(document.querySelectorAll('a[href^="/"]')).length,
            externalLinks: Array.from(document.querySelectorAll('a[href^="http"]')).length
        };

        return checks;
    },

    // Get SEO score
    getSEOScore: () => {
        const checks = seoPerformanceUtils.checkSEOOptimization();
        let score = 0;
        const total = Object.keys(checks).length;

        Object.values(checks).forEach(check => {
            if (typeof check === 'boolean') {
                score += check ? 1 : 0;
            } else if (typeof check === 'number') {
                score += check > 0 ? 1 : 0;
            }
        });

        return Math.round((score / total) * 100);
    },

    // Generate SEO report
    generateSEOReport: () => {
        const checks = seoPerformanceUtils.checkSEOOptimization();
        const score = seoPerformanceUtils.getSEOScore();

        return {
            score,
            checks,
            recommendations: generateSEORecommendations(checks),
            timestamp: Date.now()
        };
    }
};

const generateSEORecommendations = (checks) => {
    const recommendations = [];

    if (!checks.hasTitle) recommendations.push('Thêm title tag cho trang');
    if (!checks.hasMetaDescription) recommendations.push('Thêm meta description');
    if (!checks.hasH1) recommendations.push('Thêm thẻ H1');
    if (!checks.hasCanonical) recommendations.push('Thêm canonical URL');
    if (!checks.hasOpenGraph) recommendations.push('Thêm Open Graph tags');
    if (!checks.hasStructuredData) recommendations.push('Thêm structured data');
    if (checks.imageAltTags < checks.totalImages) recommendations.push('Thêm alt tags cho tất cả hình ảnh');

    return recommendations;
};
