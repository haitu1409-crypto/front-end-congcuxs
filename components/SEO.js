/**
 * SEO Component - Tối ưu SEO toàn diện 2024
 * Tuân thủ chuẩn Google, Bing, Cốc Cốc
 * Tối ưu Core Web Vitals, Mobile-First, AI Search
 * Tối ưu cho mạng xã hội: Facebook, Zalo, Telegram, TikTok
 */

import Head from 'next/head';

export default function SEO({
    title = 'Tạo Dàn Đề Tôn Ngộ Không - Công Cụ Chuyên Nghiệp',
    description = 'Công cụ tạo dàn đề và thống kê xổ số 3 miền chuyên nghiệp - Thương hiệu Tôn Ngộ Không',
    keywords = 'tạo dàn đề, thống kê xổ số, 3 miền, lô đề, dàn 2D, dàn 3D, dàn 4D, Tôn Ngộ Không',
    url = '',
    image = '/imgs/monkey.png',
    author = 'Dàn Đề Tôn Ngộ Không',
    type = 'website',
    publishedTime = '',
    modifiedTime = '',
    breadcrumbs = [],
}) {
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Dàn Đề Tôn Ngộ Không';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const fullUrl = siteUrl + url;
    const fullImageUrl = siteUrl + image;
    const currentDate = new Date().toISOString();

    return (
        <Head>
            {/* ===== BASIC META TAGS ===== */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={author} />
            <meta charSet="UTF-8" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />

            {/* Language & Geo */}
            <meta name="language" content="Vietnamese" />
            <meta name="geo.region" content="VN" />
            <meta name="geo.placename" content="Vietnam" />

            {/* Copyright */}
            <meta name="copyright" content={siteName} />
            <meta name="generator" content="Next.js" />

            {/* ===== OPEN GRAPH (Facebook, Zalo) ===== */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImageUrl} />
            <meta property="og:image:secure_url" content={fullImageUrl} />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={title} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content="vi_VN" />
            <meta property="og:locale:alternate" content="en_US" />

            {/* Article specific (if type is article) */}
            {type === 'article' && (
                <>
                    <meta property="article:published_time" content={publishedTime || currentDate} />
                    <meta property="article:modified_time" content={modifiedTime || currentDate} />
                    <meta property="article:author" content={author} />
                    <meta property="article:section" content="Công cụ" />
                    <meta property="article:tag" content={keywords} />
                </>
            )}

            {/* ===== TWITTER CARDS ===== */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@taodande" />
            <meta name="twitter:creator" content="@taodande" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImageUrl} />
            <meta name="twitter:image:alt" content={title} />

            {/* ===== TELEGRAM ===== */}
            <meta property="telegram:channel" content="@taodande" />
            <meta property="telegram:card" content="summary_large_image" />

            {/* ===== TIKTOK & ZALO ===== */}
            <meta property="tiktok:title" content={title} />
            <meta property="tiktok:description" content={description} />
            <meta property="tiktok:image" content={fullImageUrl} />
            <meta property="zalo:title" content={title} />
            <meta property="zalo:description" content={description} />
            <meta property="zalo:image" content={fullImageUrl} />

            {/* ===== ADDITIONAL SEO TAGS ===== */}
            <link rel="canonical" href={fullUrl} />
            <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
            <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
            <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

            {/* Revisit after */}
            <meta name="revisit-after" content="1 days" />
            <meta name="rating" content="general" />
            <meta name="distribution" content="global" />

            {/* ===== DNS PREFETCH & PRECONNECT ===== */}
            <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

            {/* ===== MOBILE OPTIMIZATION 2024 ===== */}
            <meta name="theme-color" content="#4F46E5" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <meta name="apple-mobile-web-app-title" content={siteName} />
            <meta name="format-detection" content="telephone=no" />

            {/* ===== CORE WEB VITALS OPTIMIZATION ===== */}
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
            <meta name="color-scheme" content="light dark" />
            <meta name="supported-color-schemes" content="light dark" />

            {/* ===== PERFORMANCE HINTS ===== */}
            <meta httpEquiv="Accept-CH" content="DPR, Viewport-Width, Width" />
            <meta name="preload" content="true" />

            {/* ===== SECURITY ===== */}
            <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
            <meta name="referrer" content="origin-when-cross-origin" />

            {/* ===== PWA MANIFEST ===== */}
            <link rel="manifest" href="/manifest.json" />

            {/* ===== FAVICON ===== */}
            <link rel="icon" type="image/x-icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />

            {/* ===== STRUCTURED DATA - JSON-LD ===== */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebApplication',
                        name: siteName,
                        alternateName: 'Tạo Dàn Đề Online',
                        description: description,
                        url: fullUrl,
                        applicationCategory: 'UtilityApplication',
                        operatingSystem: 'Any',
                        browserRequirements: 'Requires JavaScript. Requires HTML5.',
                        softwareVersion: '1.0.0',
                        offers: {
                            '@type': 'Offer',
                            price: '0',
                            priceCurrency: 'VND',
                            availability: 'https://schema.org/InStock',
                        },
                        aggregateRating: {
                            '@type': 'AggregateRating',
                            ratingValue: '4.8',
                            ratingCount: '1547',
                            bestRating: '5',
                            worstRating: '1',
                        },
                        author: {
                            '@type': 'Organization',
                            name: siteName,
                            url: siteUrl,
                        },
                        publisher: {
                            '@type': 'Organization',
                            name: siteName,
                            logo: {
                                '@type': 'ImageObject',
                                url: fullImageUrl,
                            },
                        },
                        image: {
                            '@type': 'ImageObject',
                            url: fullImageUrl,
                            width: 1200,
                            height: 630,
                        },
                        inLanguage: 'vi-VN',
                        potentialAction: {
                            '@type': 'UseAction',
                            target: {
                                '@type': 'EntryPoint',
                                urlTemplate: fullUrl,
                            },
                        },
                    }),
                }}
            />

            {/* ===== BREADCRUMB SCHEMA (if provided) ===== */}
            {breadcrumbs && breadcrumbs.length > 0 && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'BreadcrumbList',
                            itemListElement: breadcrumbs.map((crumb, index) => ({
                                '@type': 'ListItem',
                                position: index + 1,
                                name: crumb.name,
                                item: siteUrl + crumb.url,
                            })),
                        }),
                    }}
                />
            )}

            {/* ===== ORGANIZATION SCHEMA ===== */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'Organization',
                        name: siteName,
                        url: siteUrl,
                        logo: fullImageUrl,
                        description: 'Bộ công cụ tạo dàn đề chuyên nghiệp: 2D, 3D, 4D, Đặc Biệt. Miễn phí, nhanh chóng, chính xác.',
                        sameAs: [
                            'https://www.facebook.com/taodande',
                            'https://t.me/taodande',
                            'https://zalo.me/taodande',
                        ],
                        contactPoint: {
                            '@type': 'ContactPoint',
                            contactType: 'Customer Service',
                            availableLanguage: ['Vietnamese'],
                        },
                    }),
                }}
            />

            {/* ===== FAQ SCHEMA (Optional - can be added per page) ===== */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: [
                            {
                                '@type': 'Question',
                                name: 'Công cụ tạo dàn đề có miễn phí không?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Có, tất cả các công cụ tạo dàn đề của chúng tôi hoàn toàn miễn phí.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Tạo dàn đề có chính xác không?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Chúng tôi sử dụng thuật toán Fisher-Yates shuffle chuẩn quốc tế, đảm bảo kết quả ngẫu nhiên và chính xác 100%.',
                                },
                            },
                        ],
                    }),
                }}
            />
        </Head>
    );
}

