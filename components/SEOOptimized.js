/**
 * SEO Component Tối Ưu - Hình ảnh cho từng page
 * Tối ưu cho Social Media: Facebook, Zalo, Telegram, TikTok
 * Tuân thủ chuẩn Google, Bing, Cốc Cốc
 */

import Head from 'next/head';

// Cấu hình hình ảnh cho từng page
const PAGE_IMAGES = {
    homepage: {
        og: '/imgs/wukong.png',
        twitter: '/imgs/wukong.png',
        facebook: '/imgs/wukong.png',
        zalo: '/imgs/wukong.png',
        telegram: '/imgs/wukong.png',
        tiktok: '/imgs/wukong.png'
    },
    'dan-dac-biet': {
        og: '/imgs/chemical-weapon.png',
        twitter: '/imgs/chemical-weapon.png',
        facebook: '/imgs/chemical-weapon.png',
        zalo: '/imgs/chemical-weapon.png',
        telegram: '/imgs/chemical-weapon.png',
        tiktok: '/imgs/chemical-weapon.png'
    },
    'dan-2d': {
        og: '/imgs/monkey.png',
        twitter: '/imgs/monkey.png',
        facebook: '/imgs/monkey.png',
        zalo: '/imgs/monkey.png',
        telegram: '/imgs/monkey.png',
        tiktok: '/imgs/monkey.png'
    },
    'dan-3d4d': {
        og: '/imgs/wukong.png',
        twitter: '/imgs/wukong.png',
        facebook: '/imgs/wukong.png',
        zalo: '/imgs/wukong.png',
        telegram: '/imgs/wukong.png',
        tiktok: '/imgs/wukong.png'
    },
    'thong-ke': {
        og: '/imgs/chemical-weapon.png',
        twitter: '/imgs/chemical-weapon.png',
        facebook: '/imgs/chemical-weapon.png',
        zalo: '/imgs/chemical-weapon.png',
        telegram: '/imgs/chemical-weapon.png',
        tiktok: '/imgs/chemical-weapon.png'
    },
    'content': {
        og: '/imgs/wukong.png',
        twitter: '/imgs/wukong.png',
        facebook: '/imgs/wukong.png',
        zalo: '/imgs/wukong.png',
        telegram: '/imgs/wukong.png',
        tiktok: '/imgs/wukong.png'
    },
    'tin-tuc': {
        og: '/imgs/wukong.png',
        twitter: '/imgs/wukong.png',
        facebook: '/imgs/wukong.png',
        zalo: '/imgs/wukong.png',
        telegram: '/imgs/wukong.png',
        tiktok: '/imgs/wukong.png'
    },
    'faq': {
        og: '/imgs/monkey.png',
        twitter: '/imgs/monkey.png',
        facebook: '/imgs/monkey.png',
        zalo: '/imgs/monkey.png',
        telegram: '/imgs/monkey.png',
        tiktok: '/imgs/monkey.png'
    }
};

// Cấu hình title và description cho từng page
const PAGE_SEO_CONFIG = {
    homepage: {
        title: 'Tạo Dàn Đề 9x-0x Ngẫu Nhiên & Lọc Dàn Đề Tổng Hợp - Miễn Phí 2025',
        description: 'Tạo dàn đề 9x-0x ngẫu nhiên với thuật toán Fisher-Yates chuẩn quốc tế. Công cụ lọc dàn đề tổng hợp thông minh, tạo dàn 2D, 3D, 4D, dàn đặc biệt miễn phí 100%. Nhanh chóng, chính xác tuyệt đối. Thương hiệu Tôn Ngộ Không.',
        keywords: 'tạo dàn đề 9x-0x ngẫu nhiên, lọc dàn đề tổng hợp, công cụ tạo dàn đề chuyên nghiệp, dàn đề 9x-0x online, tạo dàn đề miễn phí, dàn đề 2D, dàn đề 3D, dàn đề 4D, dàn đề đặc biệt, lô đề online, xổ số 3 miền, thống kê xổ số, công cụ lô đề, tạo dàn lô đề, dàn đề Tôn Ngộ Không, xổ số Việt Nam, thống kê lô đề, bộ lọc số đặc biệt, dàn đề chính xác 100%, thuật toán Fisher-Yates, lọc dàn đề thông minh'
    },
    'dan-dac-biet': {
        title: 'Tạo Dàn Đặc Biệt Online - Bộ Lọc Thông Minh | Miễn Phí 2025',
        description: 'Tạo dàn đề đặc biệt với bộ lọc thông minh: Lấy nhanh, Đầu-Đuôi, Chạm, Bộ, Kép. Thuật toán AI tiên tiến. Miễn phí không giới hạn. Được hàng ngàn người tin dùng.',
        keywords: 'tạo dàn đặc biệt, bộ lọc dàn đề, lọc số đặc biệt, đầu đuôi số, chạm số, kép bằng, dàn đề đặc biệt, bộ lọc thông minh, tạo dàn đặc biệt online, dàn đề Tôn Ngộ Không, lọc dàn đề chuyên nghiệp, bộ lọc số chính xác, dàn đặc biệt miễn phí, công cụ lọc số, thuật toán lọc dàn đề'
    },
    'dan-2d': {
        title: 'Tạo Dàn Đề 2D (00-99) Online - Bộ Lọc Thông Minh | Miễn Phí 2025',
        description: 'Tạo dàn đề 2D từ 00-99 với bộ lọc thông minh, phân loại theo mức độ xuất hiện. Hỗ trợ chuyển đổi 1D, lưu trữ kết quả, xuất file Excel. Thuật toán Fisher-Yates chuẩn quốc tế.',
        keywords: 'tạo dàn 2D, dàn đề 2D, tạo dàn đề 2D online, công cụ dàn 2D, dàn 2D miễn phí, thuật toán Fisher-Yates, bộ lọc dàn 2D, xuất file dàn 2D, lưu dàn 2D, dàn đề 00-99, chuyển đổi 1D, phân loại mức độ, dàn 2D chuyên nghiệp'
    },
    'dan-3d4d': {
        title: 'Tạo Dàn Đề 3D/4D (000-999/0000-9999) Online - Công Cụ Chuyên Nghiệp | Miễn Phí 2025',
        description: 'Tạo dàn đề 3D (000-999) và 4D (0000-9999) với thuật toán tiên tiến. Dành cho cao thủ, tối ưu chiến lược chơi. Hỗ trợ bộ lọc số, xuất file Excel, lưu trữ kết quả. Miễn phí, chính xác 100%.',
        keywords: 'tạo dàn 3D, tạo dàn 4D, dàn đề 3D, dàn đề 4D, tạo dàn đề 3D online, tạo dàn đề 4D online, công cụ dàn 3D, công cụ dàn 4D, dàn 3D miễn phí, dàn 4D miễn phí, dàn đề 000-999, dàn đề 0000-9999, cao thủ lô đề, chiến lược chơi'
    },
    'thong-ke': {
        title: 'Lập Bảng Thống Kê Chốt Dàn 3 Miền - Công Cụ Chuyên Nghiệp | Miễn Phí 2025',
        description: 'Lập bảng thống kê chốt dàn 3 miền (Bắc-Nam-Trung) chuyên nghiệp. Công cụ theo dõi xu hướng và phân tích dữ liệu xổ số để tối ưu chiến lược chơi dàn đề. Cập nhật realtime, chính xác 100%. Thương hiệu Tôn Ngộ Không.',
        keywords: 'lập bảng thống kê chốt dàn 3 miền, thống kê chốt dàn, bảng thống kê xổ số, thống kê miền bắc, thống kê miền nam, thống kê miền trung, kết quả xổ số, phân tích xổ số, xu hướng xổ số, thống kê lô đề, bảng thống kê chính xác, thống kê xổ số realtime, dàn đề Tôn Ngộ Không, thống kê xổ số miễn phí, công cụ thống kê xổ số, phân tích dữ liệu xổ số, xổ số miền bắc, xổ số miền nam, xổ số miền trung, chốt dàn đề'
    },
    'content': {
        title: 'Hướng Dẫn Chơi Xổ Số & Mẹo Tăng Tỷ Lệ Trúng - Công Cụ Chuyên Nghiệp 2024',
        description: 'Hướng dẫn chi tiết cách chơi xổ số hiệu quả, mẹo tăng tỷ lệ trúng, thống kê xổ số 3 miền, soi cầu chính xác. Công cụ tạo dàn đề chuyên nghiệp, bảng thống kê chốt dàn, phương pháp soi cầu hiệu quả nhất 2024.',
        keywords: 'hướng dẫn chơi xổ số, mẹo tăng tỷ lệ trúng xổ số, thống kê xổ số 3 miền, soi cầu xổ số, cách tạo dàn đề hiệu quả, bảng thống kê chốt dàn, phương pháp soi cầu, mẹo chơi lô đề, chiến lược chơi xổ số, công cụ xổ số chuyên nghiệp, dự đoán xổ số, phân tích xổ số, xu hướng xổ số, số may mắn, cao thủ xổ số'
    },
    'tin-tuc': {
        title: 'Tin Tức Xổ Số & Lô Đề - Cập Nhật Mới Nhất 2024',
        description: 'Tin tức xổ số mới nhất, giải mã giấc mơ, kinh nghiệm chơi lô đề, thống kê xổ số 3 miền. Cập nhật hàng ngày với thông tin chính xác và mẹo chơi hiệu quả từ chuyên gia.',
        keywords: 'tin tức xổ số, giải mã giấc mơ, kinh nghiệm chơi lô đề, thống kê xổ số, mẹo vặt xổ số, phương pháp soi cầu, dàn đề chuyên nghiệp, xu hướng xổ số, số may mắn, tin tức lô đề, cập nhật xổ số, tin tức miền bắc, tin tức miền nam, tin tức miền trung'
    },
    'faq': {
        title: 'FAQ - Câu Hỏi Thường Gặp Về Tạo Dàn Đề 9x-0x | Hỗ Trợ 24/7',
        description: 'FAQ - Giải đáp mọi thắc mắc về tạo dàn đề 9x-0x, công cụ tạo dàn đề chuyên nghiệp. Hướng dẫn sử dụng, mẹo chơi, chiến lược tối ưu. Hỗ trợ 24/7, cập nhật thường xuyên.',
        keywords: 'câu hỏi thường gặp dàn đề, hướng dẫn sử dụng dàn đề, cách chơi dàn đề, mẹo chơi lô đề, giải đáp thắc mắc lô đề, hỗ trợ dàn đề, FAQ dàn đề, tạo dàn 9x-0x, công cụ tạo dàn đề'
    }
};

export default function SEOOptimized({
    pageType = 'homepage',
    customTitle = '',
    customDescription = '',
    customKeywords = '',
    canonical = '',
    noindex = false,
    structuredData = null,
    breadcrumbs = null,
    faq = null,
    articleData = null
}) {
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Dàn Đề Tôn Ngộ Không';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro';

    // Lấy cấu hình SEO cho page
    const pageConfig = PAGE_SEO_CONFIG[pageType] || PAGE_SEO_CONFIG.homepage;
    const pageImages = PAGE_IMAGES[pageType] || PAGE_IMAGES.homepage;

    // Sử dụng custom hoặc default
    const title = customTitle || pageConfig.title;
    const description = customDescription || pageConfig.description;
    const keywords = customKeywords || pageConfig.keywords;

    const fullUrl = canonical || siteUrl;
    const currentDate = new Date().toISOString();

    return (
        <Head>
            {/* ===== BASIC META TAGS ===== */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={siteName} />
            <meta name="robots" content={noindex ? "noindex,nofollow" : "index,follow"} />
            <meta name="googlebot" content="index,follow" />
            <meta name="bingbot" content="index,follow" />
            <meta name="coccocbot" content="index,follow" />

            {/* ===== SEARCH ENGINE VERIFICATION ===== */}
            <meta name="google-site-verification" content="OniUNDUrgOZ4Fou_Thz9y9_TgDX4INuKAklFmpG-a6k" />
            <meta name="msvalidate.01" content="" />
            <meta name="yandex-verification" content="" />
            <meta name="baidu-site-verification" content="" />

            {/* ===== CANONICAL URL ===== */}
            <link rel="canonical" href={fullUrl} />

            {/* ===== DNS PREFETCH FOR PERFORMANCE ===== */}
            <link rel="dns-prefetch" href="//fonts.googleapis.com" />
            <link rel="dns-prefetch" href="//www.google-analytics.com" />
            <link rel="dns-prefetch" href="//fonts.gstatic.com" />
            <link rel="dns-prefetch" href="//api.taodandewukong.pro" />

            {/* ===== PRECONNECT FOR CRITICAL RESOURCES ===== */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
            <link rel="preconnect" href="https://api.taodandewukong.pro" />

            {/* ===== OPEN GRAPH - FACEBOOK & TELEGRAM ===== */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={pageImages.og ? `${siteUrl}${pageImages.og}` : pageImages.facebook} />
            <meta property="og:image:secure_url" content={pageImages.og ? `${siteUrl}${pageImages.og}` : pageImages.facebook} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={title} />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:type" content={articleData ? "article" : "website"} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content="vi_VN" />
            <meta property="og:updated_time" content={currentDate} />

            {/* Article specific OG tags */}
            {articleData && (
                <>
                    <meta property="article:published_time" content={articleData.publishedTime} />
                    <meta property="article:modified_time" content={articleData.modifiedTime} />
                    <meta property="article:author" content={articleData.author} />
                    <meta property="article:section" content={articleData.section} />
                    {articleData.tags && articleData.tags.map(tag => (
                        <meta key={tag} property="article:tag" content={tag} />
                    ))}
                </>
            )}

            {/* ===== ADDITIONAL META FOR TELEGRAM ===== */}
            <meta name="description" content={description} />
            <meta name="image" content={`${siteUrl}${pageImages.facebook}`} />
            <link rel="image_src" href={`${siteUrl}${pageImages.facebook}`} />

            {/* ===== TWITTER CARDS ===== */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={pageImages.og ? `${siteUrl}${pageImages.og}` : pageImages.twitter} />
            <meta name="twitter:image:alt" content={title} />
            <meta name="twitter:site" content="@taodandewukong" />
            <meta name="twitter:creator" content="@taodandewukong" />

            {/* ===== ZALO ===== */}
            <meta property="zalo:title" content={title} />
            <meta property="zalo:description" content={description} />
            <meta property="zalo:image" content={`${siteUrl}${pageImages.zalo}`} />

            {/* ===== TELEGRAM ===== */}
            <meta property="telegram:title" content={title} />
            <meta property="telegram:description" content={description} />
            <meta property="telegram:image" content={`${siteUrl}${pageImages.telegram}`} />
            <meta property="telegram:image:width" content="1200" />
            <meta property="telegram:image:height" content="630" />
            <meta property="telegram:image:alt" content={title} />
            <meta property="telegram:url" content={fullUrl} />
            <meta property="telegram:site_name" content={siteName} />
            <meta property="telegram:site" content="@taodandewukong" />
            <meta property="telegram:creator" content="@taodandewukong" />
            <meta name="telegram:channel" content="@taodandewukong" />
            <meta name="telegram:chat" content="@taodandewukong" />
            <meta name="telegram:bot" content="@taodandewukong" />

            {/* ===== TIKTOK ===== */}
            <meta property="tiktok:title" content={title} />
            <meta property="tiktok:description" content={description} />
            <meta property="tiktok:image" content={`${siteUrl}${pageImages.tiktok}`} />

            {/* ===== MOBILE OPTIMIZATION ===== */}
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="Tạo Dàn Đề" />

            {/* ===== THEME COLOR ===== */}
            <meta name="theme-color" content="#4F46E5" />
            <meta name="msapplication-TileColor" content="#4F46E5" />
            <meta name="msapplication-config" content="/browserconfig.xml" />

            {/* ===== PERFORMANCE HINTS ===== */}
            <meta httpEquiv="Accept-CH" content="DPR, Viewport-Width, Width" />
            <meta name="preload" content="true" />

            {/* ===== SECURITY HEADERS ===== */}
            <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
            <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
            <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />

            {/* ===== PWA ===== */}
            <link rel="manifest" href="/manifest.json" />
            <link rel="icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" href="/icon-192.png" />

            {/* ===== STRUCTURED DATA - WEB APPLICATION ===== */}
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
                                url: `${siteUrl}${pageImages.og}`,
                            },
                        },
                        image: {
                            '@type': 'ImageObject',
                            url: `${siteUrl}${pageImages.og}`,
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

            {/* ===== BREADCRUMB SCHEMA ===== */}
            {breadcrumbs && (
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
                                item: crumb.url,
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
                        logo: `${siteUrl}${pageImages.og}`,
                        description: 'Bộ công cụ tạo dàn đề chuyên nghiệp: 2D, 3D, 4D, Đặc Biệt. Miễn phí, nhanh chóng, chính xác.',
                        sameAs: [
                            'https://www.facebook.com/taodandewukong',
                            'https://t.me/taodandewukong',
                            'https://zalo.me/taodandewukong',
                        ],
                        contactPoint: {
                            '@type': 'ContactPoint',
                            contactType: 'Customer Service',
                            availableLanguage: ['Vietnamese'],
                        },
                    }),
                }}
            />

            {/* ===== FAQ SCHEMA ===== */}
            {faq && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'FAQPage',
                            mainEntity: faq.map(item => ({
                                '@type': 'Question',
                                name: item.question,
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: item.answer,
                                },
                            })),
                        }),
                    }}
                />
            )}

            {/* ===== CUSTOM STRUCTURED DATA ===== */}
            {structuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData),
                    }}
                />
            )}
        </Head>
    );
}
