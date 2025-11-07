/**
 * Statistics SEO Component
 * Tối ưu SEO cho các trang thống kê với Dataset Schema
 * Performance Optimized với useMemo
 */

import Head from 'next/head';
import { useMemo, memo } from 'react';
import { getPageSEO, generateBreadcrumbSchema, generateFAQSchema } from '../config/seoConfig';

const StatisticsSEO = memo(function StatisticsSEO({ 
    pageType, 
    metadata = {}, 
    faq = null,
    customTitle = null,
    customDescription = null 
}) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro';
    
    // Memoize pageSEO để tránh re-compute
    const pageSEO = useMemo(() => getPageSEO(pageType), [pageType]);

    // Memoize title, description, canonical
    const title = useMemo(() => customTitle || pageSEO.title, [customTitle, pageSEO.title]);
    const description = useMemo(() => customDescription || pageSEO.description, [customDescription, pageSEO.description]);
    const canonical = useMemo(() => pageSEO.canonical, [pageSEO.canonical]);

    // Determine section breadcrumb URL if applicable
    const sectionBreadcrumb = useMemo(() => {
        if (!pageSEO.url) {
            return null;
        }

        const segments = pageSEO.url.split('/').filter(Boolean);
        if (segments.length < 2) {
            return null;
        }

        const section = segments[0];
        if (section === 'thongke') {
            return {
                name: 'Thống Kê',
                url: `${siteUrl}/thongke/dau-duoi`
            };
        }

        return {
            name: section.charAt(0).toUpperCase() + section.slice(1),
            url: `${siteUrl}/${section}`
        };
    }, [pageSEO.url, siteUrl]);

    // Breadcrumbs for statistics pages - Memoized
    const breadcrumbs = useMemo(() => {
        const items = [{ name: 'Trang chủ', url: siteUrl }];
        if (sectionBreadcrumb) {
            items.push(sectionBreadcrumb);
        }
        items.push({ name: title, url: canonical });
        return items;
    }, [siteUrl, sectionBreadcrumb, title, canonical]);

    // Dataset Schema for Statistics - Memoized
    const datasetSchema = useMemo(() => ({
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": title,
        "description": description,
        "url": canonical,
        "version": "1.0",
        "keywords": pageSEO.keywords.join(', '),
        "license": "https://creativecommons.org/licenses/by/4.0/",
        "creator": {
            "@type": "Organization",
            "name": "TAODANDEWUKONG.PRO",
            "url": siteUrl
        },
        "publisher": {
            "@type": "Organization",
            "name": "TAODANDEWUKONG.PRO",
            "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}/logo.png`
            }
        },
        "datePublished": metadata.startDate || new Date().toISOString().split('T')[0],
        "dateModified": new Date().toISOString().split('T')[0],
        "temporalCoverage": metadata.startDate && metadata.endDate 
            ? `${metadata.startDate}/${metadata.endDate}` 
            : "2024-01-01/2025-01-15",
        "spatialCoverage": {
            "@type": "Place",
            "name": "Miền Bắc, Việt Nam"
        },
        "distribution": {
            "@type": "DataDownload",
            "encodingFormat": "application/json",
            "contentUrl": canonical
        },
        "includesObject": {
            "@type": "DataCatalog",
            "name": "Xổ Số Miền Bắc Statistics"
        },
        "measurementTechnique": "Statistical Analysis",
        "variableMeasured": "Lottery Statistics"
    }), [title, description, canonical, metadata, siteUrl]);

    // Article Schema - Memoized
    const articleSchema = useMemo(() => ({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": title,
        "description": description,
        "image": pageSEO.image,
        "author": {
            "@type": "Organization",
            "name": "TAODANDEWUKONG.PRO"
        },
        "publisher": {
            "@type": "Organization",
            "name": "TAODANDEWUKONG.PRO",
            "logo": {
                "@type": "ImageObject",
                "url": `${siteUrl}/logo.png`
            }
        },
        "datePublished": metadata.startDate || new Date().toISOString(),
        "dateModified": new Date().toISOString(),
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonical
        }
    }), [title, description, canonical, metadata, siteUrl, pageSEO.image]);

    // Memoize keywords string
    const keywordsString = useMemo(() => pageSEO.keywords.join(', '), [pageSEO.keywords]);

    return (
        <Head>
            {/* Basic Meta */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywordsString} />
            
            {/* Canonical */}
            <link rel="canonical" href={canonical} />
            
            {/* Open Graph */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={pageSEO.image} />
            <meta property="og:url" content={canonical} />
            <meta property="og:type" content="article" />
            <meta property="og:site_name" content="TAODANDEWUKONG.PRO" />
            <meta property="og:locale" content="vi_VN" />
            
            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={pageSEO.image} />
            
            {/* Dataset Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }}
            />
            
            {/* Article Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            
            {/* Breadcrumb Schema */}
            {breadcrumbs && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ 
                        __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbs)) 
                    }}
                />
            )}
            
            {/* FAQ Schema */}
            {faq && faq.length > 0 && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ 
                        __html: JSON.stringify(generateFAQSchema(faq)) 
                    }}
                />
            )}
        </Head>
    );
});

StatisticsSEO.displayName = 'StatisticsSEO';

export default StatisticsSEO;
