/**
 * Multi-Search Engine Optimizer Component
 * Tối ưu SEO cho nhiều search engines: Google, Bing, Cốc Cốc
 * 
 * Features:
 * - Bing-specific meta tags
 * - Cốc Cốc meta tags
 * - Alternative structured data formats
 * - Search engine verification tags
 */

import Head from 'next/head';
import { memo } from 'react';

const MultiSearchEngineOptimizer = memo(function MultiSearchEngineOptimizer({
    title,
    description,
    keywords,
    url,
    image,
    locale = 'vi_VN',
    type = 'website',
    author = 'Dàn Đề Wukong',
    structuredData = null,
}) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro';
    const canonicalUrl = url || siteUrl;
    const ogImage = image || `${siteUrl}/imgs/wukong.png`;

    // ✅ BING-SPECIFIC STRUCTURED DATA
    const bingSearchSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Tạo Dàn Đề Wukong",
        "alternateName": [
            "Tao Dan De Wukong",
            "TaoDanDeWukong",
            "Dàn Đề Wukong",
            "Dan De Wukong"
        ],
        "url": siteUrl,
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${siteUrl}/?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    };

    // ✅ COC COC SPECIFIC META
    const coccoc_keywords = keywords ? keywords.split(', ').slice(0, 20).join(', ') : '';

    return (
        <Head>
            {/* ============================================
                BING OPTIMIZATION
                ============================================ */}

            {/* Bing Webmaster verification */}
            <meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE" />

            {/* Bing-specific meta tags */}
            <meta name="msnbot" content="index, follow" />
            <meta name="bingbot" content="index, follow" />

            {/* Bing preview settings */}
            <meta name="MSSmartTagsPreventParsing" content="true" />

            {/* Bing site verification */}
            <meta name="bing-site-verification" content="YOUR_BING_SITE_VERIFICATION" />

            {/* ============================================
                CỐC CỐC OPTIMIZATION
                ============================================ */}

            {/* Cốc Cốc bot directives */}
            <meta name="coccoc-verification" content="YOUR_COCCOC_VERIFICATION_CODE" />
            <meta name="coccoc" content="index, follow" />

            {/* Cốc Cốc specific keywords (Vietnamese focus) */}
            <meta name="keywords-vi" content={coccoc_keywords} />

            {/* Cốc Cốc language tag */}
            <meta name="language" content="Vietnamese" />
            <meta name="geo.region" content="VN" />
            <meta name="geo.placename" content="Vietnam" />

            {/* ============================================
                DUBLIN CORE METADATA (Bing preference)
                ============================================ */}

            <meta name="DC.title" content={title} />
            <meta name="DC.description" content={description} />
            <meta name="DC.language" content="vi" />
            <meta name="DC.creator" content={author} />
            <meta name="DC.type" content="Service" />
            <meta name="DC.format" content="text/html" />
            <meta name="DC.identifier" content={canonicalUrl} />

            {/* ============================================
                ENHANCED OPEN GRAPH (All search engines)
                ============================================ */}

            <meta property="og:locale:alternate" content="vi_VN" />
            <meta property="og:locale:alternate" content="en_US" />

            {/* Article-specific tags for blog posts */}
            {type === 'article' && (
                <>
                    <meta property="article:author" content={author} />
                    <meta property="article:published_time" content={new Date().toISOString()} />
                    <meta property="article:modified_time" content={new Date().toISOString()} />
                    <meta property="article:section" content="Xổ Số &amp; Lô Đề" />
                    <meta property="article:tag" content={keywords?.split(', ')[0] || 'tạo dàn đề'} />
                </>
            )}

            {/* ============================================
                TWITTER CARD ENHANCED
                ============================================ */}

            <meta name="twitter:label1" content="Loại công cụ" />
            <meta name="twitter:data1" content="Ứng dụng Web" />
            <meta name="twitter:label2" content="Giá" />
            <meta name="twitter:data2" content="Miễn phí" />

            {/* ============================================
                ADDITIONAL SEO TAGS
                ============================================ */}

            {/* Category for search engines */}
            <meta name="category" content="Utilities, Gaming, Tools" />

            {/* Target audience */}
            <meta name="audience" content="All" />

            {/* Distribution */}
            <meta name="distribution" content="global" />

            {/* Rating */}
            <meta name="rating" content="general" />

            {/* Revisit after (Bing preference) */}
            <meta name="revisit-after" content="1 days" />

            {/* Classification */}
            <meta name="classification" content="Web Application, Lottery Tool, Number Generator" />

            {/* ============================================
                STRUCTURED DATA FOR BING
                ============================================ */}

            {/* Bing Search Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(bingSearchSchema) }}
            />

            {/* BreadcrumbList Schema (Bing loves this) */}
            {structuredData?.breadcrumbs && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "BreadcrumbList",
                            "itemListElement": structuredData.breadcrumbs.map((item, index) => ({
                                "@type": "ListItem",
                                "position": index + 1,
                                "name": item.name,
                                "item": item.url
                            }))
                        })
                    }}
                />
            )}

            {/* Organization Schema with Vietnamese focus */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "Dàn Đề Wukong",
                        "alternateName": [
                            "Tạo Dàn Đề Wukong",
                            "Tao Dan De Wukong",
                            "TaoDanDeWukong",
                            "Dan De Wukong"
                        ],
                        "url": siteUrl,
                        "logo": `${siteUrl}/imgs/wukong.png`,
                        "description": "Bộ công cụ tạo dàn đề, tạo mức số chuyên nghiệp hàng đầu Việt Nam",
                        "address": {
                            "@type": "PostalAddress",
                            "addressCountry": "VN"
                        },
                        "areaServed": {
                            "@type": "Country",
                            "name": "Vietnam"
                        },
                        "sameAs": [
                            // Add social media profiles here
                        ]
                    })
                }}
            />

            {/* ============================================
                MOBILE APP ALTERNATE (For Bing & Google)
                ============================================ */}

            {/* Mobile app deep linking */}
            <meta property="al:web:url" content={canonicalUrl} />
            <meta property="al:web:should_fallback" content="true" />

            {/* ============================================
                ALTERNATE LANGUAGES (Multi-region)
                ============================================ */}

            <link rel="alternate" hrefLang="vi" href={canonicalUrl} />
            <link rel="alternate" hrefLang="vi-VN" href={canonicalUrl} />
            <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

            {/* ============================================
                SEARCH ENGINE DISCOVERY
                ============================================ */}

            {/* Help search engines discover other pages */}
            <link rel="sitemap" type="application/xml" title="Sitemap" href={`${siteUrl}/sitemap.xml`} />
            <link rel="alternate" type="application/rss+xml" title="RSS Feed" href={`${siteUrl}/rss.xml`} />

            {/* ============================================
                PERFORMANCE & RESOURCE HINTS
                ============================================ */}

            {/* Preconnect to search engine domains */}
            <link rel="preconnect" href="https://www.google.com" />
            <link rel="preconnect" href="https://www.bing.com" />
            <link rel="preconnect" href="https://coccoc.com" />

            {/* DNS Prefetch for faster discovery */}
            <link rel="dns-prefetch" href="//www.google.com" />
            <link rel="dns-prefetch" href="//www.bing.com" />
            <link rel="dns-prefetch" href="//coccoc.com" />
        </Head>
    );
});

export default MultiSearchEngineOptimizer;








