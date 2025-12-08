/**
 * SEO Component Tối Ưu - Hình ảnh cho từng page
 * Tối ưu cho Social Media: Facebook, Zalo, Telegram, TikTok
 * Tuân thủ chuẩn Google, Bing, Cốc Cốc
 */

import Head from 'next/head';

// Cấu hình hình ảnh cho từng page - Updated với 5 OG images mới
const PAGE_IMAGES = {
    homepage: {
        og: '/imgs/wukong.png',
        twitter: '/imgs/wukong.png',
        facebook: '/imgs/wukong.png',
        zalo: '/imgs/wukong.png',
        telegram: '/imgs/wukong.png',
        tiktok: '/imgs/wukong.png'
    },
    'dan-9x0x': {
        og: '/imgs/dan9x0x (1).png',
        twitter: '/imgs/dan9x0x (1).png',
        facebook: '/imgs/dan9x0x (1).png',
        zalo: '/imgs/dan9x0x (1).png',
        telegram: '/imgs/dan9x0x (1).png',
        tiktok: '/imgs/dan9x0x (1).png'
    },
    'loc-dan-de': {
        og: '/imgs/dan9x0x (1).png',
        twitter: '/imgs/dan9x0x (1).png',
        facebook: '/imgs/dan9x0x (1).png',
        zalo: '/imgs/dan9x0x (1).png',
        telegram: '/imgs/dan9x0x (1).png',
        tiktok: '/imgs/dan9x0x (1).png'
    },
    'dan-dac-biet': {
        og: '/imgs/dandacbiet (1).png',
        twitter: '/imgs/dandacbiet (1).png',
        facebook: '/imgs/dandacbiet (1).png',
        zalo: '/imgs/dandacbiet (1).png',
        telegram: '/imgs/dandacbiet (1).png',
        tiktok: '/imgs/dandacbiet (1).png'
    },
    'dan-2d': {
        og: '/imgs/dan2d1d (1).png',
        twitter: '/imgs/dan2d1d (1).png',
        facebook: '/imgs/dan2d1d (1).png',
        zalo: '/imgs/dan2d1d (1).png',
        telegram: '/imgs/dan2d1d (1).png',
        tiktok: '/imgs/dan2d1d (1).png'
    },
    'dan-3d4d': {
        og: '/imgs/dan3d4d (1).png',
        twitter: '/imgs/dan3d4d (1).png',
        facebook: '/imgs/dan3d4d (1).png',
        zalo: '/imgs/dan3d4d (1).png',
        telegram: '/imgs/dan3d4d (1).png',
        tiktok: '/imgs/dan3d4d (1).png'
    },
    'thong-ke': {
        og: '/imgs/thongke (1).png',
        twitter: '/imgs/thongke (1).png',
        facebook: '/imgs/thongke (1).png',
        zalo: '/imgs/thongke (1).png',
        telegram: '/imgs/thongke (1).png',
        tiktok: '/imgs/thongke (1).png'
    },
    'kqxs': {
        og: '/imgs/xsmb.png',
        twitter: '/imgs/xsmb.png',
        facebook: '/imgs/xsmb.png',
        zalo: '/imgs/xsmb.png',
        telegram: '/imgs/xsmb.png',
        tiktok: '/imgs/xsmb.png'
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
        title: 'TDDW - Tạo Dàn Đề, Tạo Dàn Số Online Miễn Phí | Công Cụ Xổ Số Chuyên Nghiệp 2025',
        description: 'TDDW (Tạo Dàn Đề Wukong) - Tạo dàn đề (tao dan de, lập dàn số) online miễn phí 2025. Công cụ tạo dàn số, mức số chuyên nghiệp tốt hơn kangdh, giaimasohoc, sieuketqua. Dàn đề 9x-0x, 2D, 3D, 4D. Lọc ghép dàn, nuôi dàn khung 3-5 ngày. Wukong (WK, TDDW) công cụ xổ số, không phải game. Miễn phí 100%, không quảng cáo!',
        keywords: 'TDDW, Tạo Dàn Đề Wukong, tao dan de wukong, TDDW.Pro, WK, TDD, DDW, tạo dàn đề, tao dan de, tạo dàn số, tao dan so, lập dàn số, lap dan so, tạo mức số, tao muc so, dàn đề 9x-0x, dàn 2D, dàn 3D, dàn 4D, ghép dàn đặc biệt, lọc dàn đề, nuôi dàn khung, thuật toán Fisher-Yates, taodandewukong, taodande, wukong tool, wukong công cụ xổ số, tạo dàn đề miễn phí, tạo dàn số online, công cụ lô đề, phần mềm tạo dàn số, ứng dụng tạo mức số, tốt hơn kangdh, tốt hơn giaimasohoc, tốt hơn sieuketqua'
    },
    'dan-9x0x': {
        title: 'Dàn Đề 9x-0x | Tạo Dàn Đề Ngẫu Nhiên | Công Cụ Lọc Dàn Đề Tổng Hợp - Miễn Phí 2025',
        description: 'Tạo dàn số 9x-0x ngẫu nhiên với thuật toán Fisher-Yates chuẩn quốc tế. Công cụ lọc dàn số tổng hợp, tạo dàn số miễn phí. Hỗ trợ xuất Excel, lưu trữ kết quả. Phần mềm AI chuyên nghiệp.',
        keywords: 'dàn số 9x-0x, tạo dàn số ngẫu nhiên, lọc dàn số tổng hợp, thuật toán Fisher-Yates, công cụ dàn số, tạo dàn số miễn phí, phần mềm AI, dàn số Wukong, công cụ xổ số chuyên nghiệp'
    },
    'loc-dan-de': {
        title: 'Lọc Dàn Đề Tổng Hợp | Bộ Lọc Số 9x-0x, 3X, 2X Siêu Cấp - Miễn Phí 2025',
        description: 'Lọc dàn đề tổng hợp từ mọi nguồn: 9x-0x, 3X, 2X, 1X, 0X. Hỗ trợ thêm số mong muốn, loại bỏ số đặc biệt, bỏ kép bằng, chọn bộ số đặc biệt, chạm, tổng. Thuật toán ưu tiên tần suất kết hợp random thông minh.',
        keywords: 'lọc dàn đề, loc dan de, lọc dàn đề tổng hợp, lọc dàn 9x, cắt dàn 9x, lọc dàn đề miễn phí, bộ lọc dàn đề, lọc dàn đề theo chạm, lọc dàn đề theo tổng, bỏ kép bằng, bộ số đặc biệt, công cụ lọc dàn đề wukong'
    },
    'dan-dac-biet': {
        title: 'Ghép Dàn Đặc Biệt | Lọc Dàn Đặc Biệt | Dàn Theo Tổng, Chạm, Kép Bằng - Miễn Phí 2025',
        description: 'Ghép dàn đặc biệt, lọc dàn đặc biệt với bộ lọc thông minh: Lấy nhanh, Đầu-Đuôi, Chạm, Bộ, Kép. Dàn theo tổng, dàn theo chạm, dàn kép bằng. Cắt dàn, lọc dàn. Thuật toán AI tiên tiến. Miễn phí không giới hạn.',
        keywords: 'ghép dàn đặc biệt, lọc dàn đặc biệt, tạo dàn xiên, tạo dàn 3 càng, tạo dàn đặc biệt, bộ lọc dàn số, lọc số đặc biệt, đầu đuôi số, chạm số, kép bằng, dàn số đặc biệt, bộ lọc thông minh, tạo dàn đặc biệt online, dàn số Wukong, lọc dàn số chuyên nghiệp, bộ lọc số chính xác, dàn đặc biệt miễn phí, công cụ lọc số, thuật toán lọc dàn số, dàn theo tổng, dàn theo chạm, dàn kép bằng, cắt dàn, lọc dàn, phần mềm AI, AI Tools, trí tuệ nhân tạo'
    },
    'dan-2d': {
        title: 'Tạo Dàn Số 2D | Tạo Dàn Đề 2D (00-99) | Ứng Dụng Tạo Mức Số - Miễn Phí 2025',
        description: 'Tạo dàn số 2D, tạo dàn số 2D từ 00-99 với bộ lọc thông minh, phân loại theo mức độ xuất hiện. Ứng dụng tạo mức số, tạo mức số miễn phí. Hỗ trợ chuyển đổi 1D, lưu trữ kết quả, xuất file Excel.',
        keywords: 'tạo dàn số 2D, tạo dàn 2D, dàn số 2D, tạo dàn số 2D online, công cụ dàn 2D, công cụ mức số, ứng dụng tạo mức số, tạo mức số miễn phí, dàn 2D miễn phí, thuật toán Fisher-Yates, bộ lọc dàn 2D, xuất file dàn 2D, lưu dàn 2D, dàn số 00-99, chuyển đổi 1D, phân loại mức độ, dàn 2D chuyên nghiệp'
    },
    'dan-3d4d': {
        title: 'Tạo Dàn Xổ Số 3D/4D | Tạo Dàn Đề 3D/4D (000-999/0000-9999) | Phần Mềm AI - Miễn Phí 2025',
        description: 'Tạo dàn xổ số 3D/4D, tạo dàn số 3D (000-999) và 4D (0000-9999) với thuật toán tiên tiến. Phần mềm AI, trí tuệ nhân tạo. Dành cho cao thủ, tối ưu chiến lược chơi. Hỗ trợ bộ lọc số, xuất file Excel, lưu trữ kết quả. Miễn phí, chính xác 100%.',
        keywords: 'tạo dàn xổ số 3D, tạo dàn xổ số 4D, tạo dàn 3D, tạo dàn 4D, dàn số 3D, dàn số 4D, tạo dàn số 3D online, tạo dàn số 4D online, công cụ dàn 3D, công cụ dàn 4D, dàn 3D miễn phí, dàn 4D miễn phí, dàn số 000-999, dàn số 0000-9999, cao thủ lô đề, chiến lược chơi, phần mềm AI, AI Tools, trí tuệ nhân tạo'
    },
    'thong-ke': {
        title: 'Xem Kết Quả Xổ Số | Kết Quả Xổ Số Nhanh Nhất | Thống Kê Xổ Số 3 Miền - Miễn Phí 2025',
        description: 'Xem kết quả xổ số, kết quả xổ số nhanh nhất tại Việt Nam. Thống kê xổ số 3 miền (Bắc-Nam-Trung) chuyên nghiệp. Lập bảng thống kê chốt dàn, công cụ theo dõi xu hướng và phân tích dữ liệu xổ số để tối ưu chiến lược chơi dàn số. Cập nhật realtime, chính xác 100%.',
        keywords: 'xem kết quả xổ số, kết quả xổ số, kết quả xổ số nhanh nhất, thống kê xổ số, lập bảng thống kê chốt dàn 3 miền, thống kê chốt dàn, bảng thống kê xổ số, thống kê miền bắc, thống kê miền nam, thống kê miền trung, phân tích xổ số, xu hướng xổ số, thống kê lô đề, bảng thống kê chính xác, thống kê xổ số realtime, dàn số Wukong, thống kê xổ số miễn phí, công cụ thống kê xổ số, phân tích dữ liệu xổ số, xổ số miền bắc, xổ số miền nam, xổ số miền trung, chốt dàn số'
    },
    'content': {
        title: 'Hướng Dẫn Chơi Xổ Số & Mẹo Tăng Tỷ Lệ Trúng - Công Cụ Chuyên Nghiệp 2025',
        description: 'Hướng dẫn chi tiết cách chơi xổ số hiệu quả, mẹo tăng tỷ lệ trúng, thống kê xổ số 3 miền, soi cầu chính xác. Công cụ tạo dàn số chuyên nghiệp, bảng thống kê chốt dàn, phương pháp soi cầu hiệu quả nhất 2025.',
        keywords: 'hướng dẫn chơi xổ số, mẹo tăng tỷ lệ trúng xổ số, thống kê xổ số 3 miền, soi cầu xổ số, cách tạo dàn số hiệu quả, bảng thống kê chốt dàn, phương pháp soi cầu, mẹo chơi lô đề, chiến lược chơi xổ số, công cụ xổ số chuyên nghiệp, dự đoán xổ số, phân tích xổ số, xu hướng xổ số, số may mắn, cao thủ xổ số'
    },
    'tin-tuc': {
        title: 'Tin Tức Xổ Số & Lô Đề - Cập Nhật Mới Nhất 2025',
        description: 'Tin tức xổ số mới nhất, giải mã giấc mơ, kinh nghiệm chơi lô đề, thống kê xổ số 3 miền. Cập nhật hàng ngày với thông tin chính xác và mẹo chơi hiệu quả từ chuyên gia.',
        keywords: 'tin tức xổ số, giải mã giấc mơ, kinh nghiệm chơi lô đề, thống kê xổ số, mẹo vặt xổ số, phương pháp soi cầu, dàn số chuyên nghiệp, xu hướng xổ số, số may mắn, tin tức lô đề, cập nhật xổ số, tin tức miền bắc, tin tức miền nam, tin tức miền trung'
    },
    'faq': {
        title: 'FAQ - Câu Hỏi Thường Gặp Về Tạo Dàn Đề 9x-0x | Hỗ Trợ 24/7',
        description: 'FAQ - Giải đáp mọi thắc mắc về tạo dàn số 9x-0x, công cụ tạo dàn số chuyên nghiệp. Hướng dẫn sử dụng, mẹo chơi, chiến lược tối ưu. Hỗ trợ 24/7, cập nhật thường xuyên.',
        keywords: 'câu hỏi thường gặp dàn số, hướng dẫn sử dụng dàn số, cách chơi dàn số, mẹo chơi lô đề, giải đáp thắc mắc lô đề, hỗ trợ dàn số, FAQ dàn số, tạo dàn 9x-0x, công cụ tạo dàn số'
    },
    'dan-9x0x': {
        title: 'Tạo Dàn Đề 9x-0x Chuyên Nghiệp | Phần Mềm AI, Trí Tuệ Nhân Tạo - Miễn Phí 2025',
        description: 'Tạo dàn số 9x-0x ngẫu nhiên chuyên nghiệp với thuật toán Fisher-Yates chuẩn quốc tế. Phần mềm AI, trí tuệ nhân tạo. Bộ lọc dàn số tổng hợp thông minh, miễn phí 100%, chính xác cho xổ số 3 miền.',
        keywords: 'tạo dàn số 9x-0x, dàn số 9x-0x, công cụ tạo dàn số, dàn số ngẫu nhiên, bộ lọc dàn số, thuật toán Fisher-Yates, xổ số 3 miền, lô đề, tạo dàn số miễn phí, dàn số chuyên nghiệp, taodande, phần mềm AI, AI Tools, trí tuệ nhân tạo'
    }
};

export default function SEOOptimized({
    pageType = 'homepage',
    customTitle = '',
    customDescription = '',
    customKeywords = '',
    canonical = '',
    canonicalUrl = '',
    ogImage = '',
    noindex = false,
    structuredData = null,
    breadcrumbs = null,
    faq = null,
    articleData = null
}) {
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Dàn Đề Wukong';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro';

    // ✅ FIX: Map 'home' to 'homepage' for PAGE_SEO_CONFIG
    const configPageType = pageType === 'home' ? 'homepage' : pageType;
    
    // Lấy cấu hình SEO cho page
    const pageConfig = PAGE_SEO_CONFIG[configPageType] || PAGE_SEO_CONFIG.homepage;
    const pageImages = PAGE_IMAGES[configPageType] || PAGE_IMAGES.homepage;

    // Sử dụng custom hoặc default (ưu tiên customTitle từ seoConfig.js)
    const title = customTitle || pageConfig.title;
    const description = customDescription || pageConfig.description;
    const keywords = customKeywords || pageConfig.keywords;

    // Fix canonical URL logic - ưu tiên canonicalUrl prop, sau đó canonical, cuối cùng tính từ pageType
    let fullUrl = canonicalUrl || canonical || (pageType === 'home' ? siteUrl : `${siteUrl}/${pageType}`);
    // Normalize: ensure homepage ends with /, other pages don't have trailing slash
    if (pageType === 'home' && !fullUrl.endsWith('/')) {
        fullUrl = fullUrl + '/';
    } else if (pageType !== 'home' && fullUrl.endsWith('/') && fullUrl !== siteUrl + '/') {
        fullUrl = fullUrl.replace(/\/+$/, '');
    }
    const currentDate = new Date().toISOString();

    // Determine og:image - ưu tiên ogImage prop, sau đó PAGE_IMAGES
    let ogImageUrl = '';
    if (ogImage) {
        // If ogImage is a full URL, use it directly; otherwise prepend siteUrl
        ogImageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage.startsWith('/') ? ogImage : '/' + ogImage}`;
    } else {
        ogImageUrl = pageImages.og ? `${siteUrl}${pageImages.og}` : `${siteUrl}${pageImages.facebook}`;
    }

    // Facebook App ID from environment variable
    const fbAppId = process.env.NEXT_PUBLIC_FB_APP_ID || '';

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
            <link rel="dns-prefetch" href="//api1.taodandewukong.pro" />

            {/* ===== PRECONNECT FOR CRITICAL RESOURCES ===== */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
            <link rel="preconnect" href="https://api.taodandewukong.pro" />
            <link rel="preconnect" href="https://api1.taodandewukong.pro" />

            {/* ===== PRELOAD CRITICAL RESOURCES FOR MOBILE PERFORMANCE ===== */}
            {configPageType === 'home' && (
                <>
                    <link rel="preload" href={`${siteUrl}/imgs/monkey.png`} as="image" fetchPriority="high" />
                    <link rel="preload" href={`${siteUrl}/imgs/wukong.png`} as="image" fetchPriority="high" />
                </>
            )}

            {/* ===== OPEN GRAPH - FACEBOOK & TELEGRAM ===== */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImageUrl} />
            <meta property="og:image:secure_url" content={ogImageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={title} />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:type" content={articleData ? "article" : "website"} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content="vi_VN" />
            <meta property="og:updated_time" content={currentDate} />
            {fbAppId && <meta property="fb:app_id" content={fbAppId} />}

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
            <meta name="image" content={ogImageUrl} />
            <link rel="image_src" href={ogImageUrl} />

            {/* ===== TWITTER CARDS ===== */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImageUrl} />
            <meta name="twitter:image:alt" content={title} />
            <meta name="twitter:site" content="@taodandewukong" />
            <meta name="twitter:creator" content="@taodandewukong" />

            {/* ===== ZALO ===== */}
            <meta property="zalo:title" content={title} />
            <meta property="zalo:description" content={description} />
            <meta property="zalo:image" content={ogImageUrl} />

            {/* ===== TELEGRAM ===== */}
            <meta property="telegram:title" content={title} />
            <meta property="telegram:description" content={description} />
            <meta property="telegram:image" content={ogImageUrl} />
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
            <meta property="tiktok:image" content={ogImageUrl} />

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
                                url: ogImageUrl,
                            },
                        },
                        image: {
                            '@type': 'ImageObject',
                            url: ogImageUrl,
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
                        logo: ogImageUrl,
                        description: 'Bộ công cụ tạo dàn số chuyên nghiệp: 2D, 3D, 4D, Đặc Biệt. Miễn phí, nhanh chóng, chính xác.',
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

            {/* ===== SITELINKS SEARCHBOX SCHEMA ===== */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'WebSite',
                        'url': siteUrl,
                        'name': siteName,
                        'description': description,
                        'potentialAction': {
                            '@type': 'SearchAction',
                            'target': {
                                '@type': 'EntryPoint',
                                'urlTemplate': `${siteUrl}/search?q={search_term_string}`
                            },
                            'query-input': 'required name=search_term_string'
                        }
                    }),
                }}
            />

            {/* ===== CUSTOM STRUCTURED DATA ===== */}
            {Array.isArray(structuredData)
                ? structuredData.map((schema, index) => (
                    <script
                        key={`structured-data-${index}`}
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify(schema),
                        }}
                    />
                ))
                : structuredData && (
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
