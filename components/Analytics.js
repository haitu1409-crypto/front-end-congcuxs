/**
 * Analytics Component
 * Google Analytics 4 + Facebook Pixel + Bing Ads
 * Track user behavior for SEO optimization
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Analytics = () => {
    const router = useRouter();

    useEffect(() => {
        // ✅ Google Analytics 4
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA4_ID) {
            // Load Google Analytics
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`;
            document.head.appendChild(script);

            // Initialize GA4
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                window.dataLayer.push(arguments);
            }
            gtag('js', new Date());
            gtag('config', process.env.NEXT_PUBLIC_GA4_ID, {
                page_title: document.title,
                page_location: window.location.href,
                page_path: router.asPath,
            });

            // Track page views on route change
            router.events.on('routeChangeComplete', (url) => {
                gtag('config', process.env.NEXT_PUBLIC_GA4_ID, {
                    page_path: url,
                });
            });

            // Custom event tracking
            window.trackGA4Event = (action, category, label, value) => {
                gtag('event', action, {
                    event_category: category,
                    event_label: label,
                    value: value,
                });
            };
        }

        // ✅ Facebook Pixel
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID) {
            window.fbq = window.fbq || function() {
                window.fbq.q = window.fbq.q || [];
                window.fbq.q.push(arguments);
            };
            window.fbq.l = +new Date();

            // Load Facebook Pixel
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://connect.facebook.net/en_US/fbevents.js`;
            document.head.appendChild(script);

            // Initialize Facebook Pixel
            window.fbq('init', process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID);
            window.fbq('track', 'PageView');

            // Custom event tracking
            window.trackFacebookEvent = (event, data = {}) => {
                window.fbq('track', event, data);
            };
        }

        // ✅ Bing Ads/UET
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_BING_UET_ID) {
            // Load Bing UET
            const script = document.createElement('script');
            script.async = true;
            script.innerHTML = `
                (function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"${process.env.NEXT_PUBLIC_BING_UET_ID}"};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","//bat.bing.com/bat.js","uetq");
            `;
            document.head.appendChild(script);

            // Custom event tracking
            window.trackBingEvent = (event, value) => {
                if (window.uetq) {
                    window.uetq.push('event', event, { value: value });
                }
            };
        }

        // ✅ Cốc Cốc Analytics (if available)
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_COCCOC_ANALYTICS_ID) {
            const script = document.createElement('script');
            script.async = true;
            script.innerHTML = `
                !function(t,e,n,i){if(!t.coccoc){var a=t.coccoc={};a.webtracker=[];var r=e.createElement(n),s=e.getElementsByTagName(n)[0];r.async=!0,r.src="//cdn.coccoc.com/js/analytics.min.js",s.parentNode.insertBefore(r,s)}}(window,document,"script");
                coccoc.create("${process.env.NEXT_PUBLIC_COCCOC_ANALYTICS_ID}");
            `;
            document.head.appendChild(script);
        }

        // Cleanup on unmount
        return () => {
            if (router.events) {
                router.events.off('routeChangeComplete', () => {});
            }
        };
    }, [router]);

    return null; // This component doesn't render anything
};

export default Analytics;
