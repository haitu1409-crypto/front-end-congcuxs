/**
 * SEO Analytics Component
 * Component theo dõi và phân tích SEO performance
 */

import { useEffect } from 'react';

const SEOAnalytics = () => {
    useEffect(() => {
        // Google Analytics 4
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
            // Load Google Analytics
            const script = document.createElement('script');
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`;
            document.head.appendChild(script);

            // Initialize GA
            window.dataLayer = window.dataLayer || [];
            function gtag() {
                window.dataLayer.push(arguments);
            }
            gtag('js', new Date());
            gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
                page_title: document.title,
                page_location: window.location.href
            });

            // Track custom events for SEO
            const trackSEOEvent = (action, category, label) => {
                gtag('event', action, {
                    event_category: category,
                    event_label: label,
                    value: 1
                });
            };

            // Track page interactions
            const trackInteractions = () => {
                // Track form submissions
                const forms = document.querySelectorAll('form, .button');
                forms.forEach(form => {
                    form.addEventListener('click', (e) => {
                        const buttonText = e.target.textContent || e.target.innerText;
                        if (buttonText.includes('Tạo Dàn')) {
                            trackSEOEvent('generate_dan', 'dan_de_generator', 'create_dan_click');
                        } else if (buttonText.includes('Lọc Dàn')) {
                            trackSEOEvent('filter_dan', 'dan_de_filter', 'filter_dan_click');
                        } else if (buttonText.includes('Copy')) {
                            trackSEOEvent('copy_result', 'user_interaction', 'copy_result');
                        }
                    });
                });

                // Track input interactions
                const inputs = document.querySelectorAll('input[type="text"], textarea');
                inputs.forEach(input => {
                    input.addEventListener('blur', () => {
                        if (input.id.includes('combination') || input.id.includes('exclude')) {
                            trackSEOEvent('input_interaction', 'user_engagement', input.id);
                        }
                    });
                });

                // Track special set selections
                const specialSets = document.querySelectorAll('.specialSetItem');
                specialSets.forEach(set => {
                    set.addEventListener('click', () => {
                        trackSEOEvent('special_set_select', 'feature_usage', 'special_set');
                    });
                });
            };

            // Initialize tracking
            setTimeout(trackInteractions, 1000);
        }

        // Google Search Console verification
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GSC_VERIFICATION) {
            const meta = document.createElement('meta');
            meta.name = 'google-site-verification';
            meta.content = process.env.NEXT_PUBLIC_GSC_VERIFICATION;
            document.head.appendChild(meta);
        }

        // Bing Webmaster Tools verification
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_BING_VERIFICATION) {
            const meta = document.createElement('meta');
            meta.name = 'msvalidate.01';
            meta.content = process.env.NEXT_PUBLIC_BING_VERIFICATION;
            document.head.appendChild(meta);
        }

        // Yandex Webmaster verification
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_YANDEX_VERIFICATION) {
            const meta = document.createElement('meta');
            meta.name = 'yandex-verification';
            meta.content = process.env.NEXT_PUBLIC_YANDEX_VERIFICATION;
            document.head.appendChild(meta);
        }

    }, []);

    return null; // This component doesn't render anything
};

export default SEOAnalytics;
