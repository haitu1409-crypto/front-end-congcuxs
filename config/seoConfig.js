/**
 * SEO Configuration for All Pages
 * Centralized SEO metadata management
 * 
 * Based on competitor analysis and keyword research
 * Last Updated: 2025-01-12
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro';
const SITE_NAME = 'Dàn Đề Wukong';
const SITE_DESCRIPTION = 'Bộ công cụ tạo dàn đề chuyên nghiệp hàng đầu Việt Nam';

// Common Open Graph Images
const OG_IMAGES = {
    default: `${SITE_URL}/imgs/wukong.png`,
    dan9x0x: `${SITE_URL}/imgs/dan9x0x (1).png`,
    dan2d: `${SITE_URL}/imgs/dan2d1d (1).png`,
    dan3d4d: `${SITE_URL}/imgs/dan3d4d (1).png`,
    danDacBiet: `${SITE_URL}/imgs/dandacbiet (1).png`,
    thongKe: `${SITE_URL}/imgs/thongke (1).png`,
};

/**
 * SEO Config for Each Page
 */
const SEO_CONFIG = {
    /**
     * HOMEPAGE
     * PRIMARY: tạo dàn số (74,000), tao dan de (74,000), taodande (8,100)
     * SECONDARY: ứng dụng tạo dàn (1,000), tạo dàn số (4,400), tạo dàn xổ số (2,900)
     */
    home: {
        title: 'Tạo Dàn Đề (Tao Dan De) | Ứng Dụng Tạo Mức Số - Nuôi Dàn Miễn Phí 2025',
        description: 'Ứng dụng tạo dàn đề, tạo mức số (tao dan de) online miễn phí. Công cụ tạo dàn lô đề, ghép lotto, nuôi dàn khung 3-5 ngày, soi cầu. Dàn 36-50 số, bạch thủ, xiên quay. Chuyên nghiệp!',
        keywords: [
            // Primary keywords (có dấu + không dấu)
            'tạo dàn đề', 'tạo dàn số', 'tao dan de', 'taodande',

            // Core features
            'tạo mức số', 'ứng dụng mức số', 'tạo dàn lô đề', 'tạo dàn lô số',
            'công cụ lô đề', 'công cụ lô số',

            // No diacritics (lươn lẹo)
            'lo de', 'lo to', 'dan de', 'tao dan so', 'tao muc so', 'lo đe',

            // Common misspellings
            'tạo dan đê', 'ló tô', 'dan đe', 'tạo dàn dề',

            // Long-tail (question-based)
            'cách tạo dàn đề', 'tạo dàn đề online', 'tạo dàn đề miễn phí',
            'web tạo dàn đề', 'tool tạo dàn đề', 'app tạo dàn đề',

            // Competitive
            'kangdh', 'taodanxoso', 'giai ma so hoc',

            // Advanced features
            'ghép lotto', 'tách dàn nhanh', 'lọc ghép dàn đề', 'lọc ghép dàn',
            'lấy nhanh dàn đề', 'dàn đề bất tử', 'dàn khung 3 ngày',
            'nuôi dàn đề', 'nuôi dàn khung 3 ngày', 'nuôi dàn khung',

            // Specific numbers
            'dàn 36 số', 'dàn 50 số', 'dàn 60 số',

            // Techniques
            'soi cầu lô đề', 'bạch thủ lô đề', 'song thủ lô đề',
            'xiên quay', 'lô đá',

            // Platform & software
            'ứng dụng tạo dàn', 'phần mềm tạo dàn đề',
            'AI tạo dàn đề', 'thuật toán Fisher-Yates',

            // Regional
            'tạo dàn đề 3 miền', 'tạo dàn đề miền bắc',

            // Trending
            'tạo dàn đề 2025', 'tạo dàn đề mới nhất', 'tạo dàn đề chuyên nghiệp'
        ],
        url: '/',
        image: OG_IMAGES.default,
        canonical: SITE_URL,
        type: 'website',
        priority: 1.0,
        changefreq: 'daily',
        structuredData: {
            type: 'SoftwareApplication',
            additionalTypes: ['Organization', 'WebSite']
        }
    },

    /**
     * DÀN 9X-0X
     * Primary Keywords: tạo dàn 9x0x, dàn 9x0x, cắt dàn 9x0x, lọc dàn 9x
     */
    dan9x0x: {
        title: 'Tạo Dàn Đề 9x-0x | Lọc Dàn Đề Siêu Cấp - Miễn Phí 2025',
        description: 'Công cụ tạo dàn 9x-0x ngẫu nhiên chuyên nghiệp. Cắt dàn 9x, lọc dàn 9x, nuôi dàn 9x khung 3-5 ngày. Thuật toán Fisher-Yates chuẩn. Miễn phí 100%!',
        keywords: [
            // Primary
            'tạo dàn 9x0x', 'dàn 9x0x', 'dàn đề 9x0x',

            // No diacritics
            'tao dan 9x0x', 'dan 9x0x', 'tao dan 9x',

            // Short forms
            'dàn 9x', 'dàn 0x', 'dan 9x',

            // Actions
            'tạo dàn 9x ngẫu nhiên', 'cắt dàn 9x0x', 'cắt dàn 9x', 'cat dan 9x',
            'lọc dàn 9x0x', 'lọc dàn 9x', 'loc dan 9x',

            // Advanced
            'nuôi dàn 9x', 'nuôi dàn đề 9x', 'nuoi dan 9x',
            'nuôi dàn khung 3 ngày', 'dàn 90 số khung 3 ngày',
            'rút dàn 9x', 'rut dan 9x',

            // Long-tail
            'dàn đề 9x0x miễn phí', 'công cụ tạo dàn 9x0x',
            'cách tạo dàn 9x0x', 'tạo dàn 9x0x online'
        ],
        url: '/dan-9x0x',
        image: OG_IMAGES.dan9x0x,
        canonical: `${SITE_URL}/dan-9x0x`,
        type: 'article',
        priority: 0.9,
        changefreq: 'daily',
        structuredData: {
            type: 'HowTo',
            additionalTypes: ['SoftwareApplication', 'FAQPage']
        }
    },

    /**
     * DÀN 2D
     * PRIMARY: tạo dàn 2d (5,400), tạo dàn số 2d (590)
     * SECONDARY: tao dan 2d, dàn 2d, ứng dụng tạo dàn 2d
     */
    dan2d: {
        title: 'Tạo Dàn Đề 2D - Tạo Mức Số 2D | Công Cụ Lô Đề Miễn Phí 2025',
        description: 'Tạo dàn đề 2D, tạo mức số 2D (tao dan 2d) online miễn phí. Công cụ tạo dàn lô đề 2 số. Bạch thủ, song thủ, lô đá 2D. Lấy nhanh dàn đề đặc biệt. Chính xác 100%!',
        keywords: [
            // Primary
            'tạo dàn 2d', 'tạo dàn đề 2d', 'dàn 2d',

            // No diacritics
            'tao dan 2d', 'dan 2d', 'tao dan de 2d',

            // Technical
            'tạo mức số 2d', 'tao muc so 2d',

            // Features
            'dàn lô đề 2d', 'lo de 2d', 'lấy nhanh dàn 2d', 'lay nhanh dan 2d',
            'lọc ghép dàn 2d', 'loc ghep dan 2d',
            'công cụ lô đề 2d', 'cong cu lo de 2d',

            // Techniques
            'bạch thủ lô đề 2d', 'bach thu lo de 2d', 'bạch thủ 2d',
            'song thủ lô đề 2d', 'song thu lo de 2d', 'song thủ 2d',
            'lô đá 2d', 'lo da 2d',

            // Sizes
            'dàn 10 số', 'dàn 20 số', 'dan 10 so', 'dan 20 so',

            // Long-tail
            'tạo dàn số 2d', 'nuôi dàn đề 2d', 'nuoi dan de 2d',
            'ứng dụng tạo dàn 2d', 'cách tạo dàn 2d'
        ],
        url: '/dan-2d',
        image: OG_IMAGES.dan2d,
        canonical: `${SITE_URL}/dan-2d`,
        type: 'article',
        priority: 0.9,
        changefreq: 'daily',
        structuredData: {
            type: 'HowTo',
            additionalTypes: ['SoftwareApplication', 'FAQPage']
        }
    },

    /**
     * DÀN 3D/4D
     * PRIMARY: tạo dàn 3 càng (1,600), tạo dàn de 3d (880), dàn 3d (260), tạo dàn số 4d (210)
     * SECONDARY: dàn 3 càng (210), tao dan 3d, tao dan 3 cang
     */
    dan3d4d: {
        title: 'Tạo Dàn Đề 3D-4D | Tách Dàn Nhanh AB-BC-CD | Mức Số 3-4D Pro 2025',
        description: 'Tạo dàn đề 3D-4D, tạo mức số 3-4D (tao dan 3d 4d). Tách dàn nhanh thành AB, BC, CD. Công cụ tạo dàn lô đề 3 càng, ghép lotto 4 càng. Dành cho cao thủ!',
        keywords: [
            'tạo dàn 3d',
            'tạo dàn 4d',
            'tạo dàn đề 3d',
            'tạo dàn đề 4d',
            'tạo mức số 3d',
            'tách dàn nhanh',
            'tách ab bc cd',
            'dàn lô đề 3 càng',
            'ghép lotto 4 càng',
            'tạo dàn 3 càng',
            'tao dan 3 cang',
            'tạo dàn de 3d',
            'dàn đề 3d',
            'dàn 3d',
            'dàn bc cd de',
            'nuôi dàn đề 3d',
            'tạo dàn số 4d'
        ],
        url: '/dan-3d4d',
        image: OG_IMAGES.dan3d4d,
        canonical: `${SITE_URL}/dan-3d4d`,
        type: 'article',
        priority: 0.9,
        changefreq: 'daily',
        structuredData: {
            type: 'HowTo',
            additionalTypes: ['SoftwareApplication', 'FAQPage']
        }
    },

    /**
     * DÀN ĐẶC BIỆT
     * Primary Keywords: dàn đặc biệt, lọc ghép dàn số, lấy nhanh dàn số
     */
    danDacBiet: {
        title: 'Dàn Đề Đặc Biệt | Lọc Ghép Dàn Đề | Tạo Dàn Đầu Đuôi Tổng Chạm Bộ 2025',
        description: 'Lọc ghép dàn đề chuyên nghiệp. Tạo dàn đề đặc biệt theo đầu, đuôi, tổng. Tạo dàn đề đầu đuôi chạm bộ. Lấy nhanh dàn đề 36-50 số. Dàn đề bất tử. Miễn phí 100%!',
        keywords: [
            'dàn đặc biệt',
            'lọc ghép dàn đề',
            'lọc ghép dàn',
            'tạo dàn đặc biệt đầu đuôi tổng',
            'tạo dàn đề đầu',
            'tạo dàn đề đuôi',
            'tạo dàn đề chạm',
            'tạo dàn đề bộ',
            'tạo dàn đề tổng',
            'lấy nhanh dàn đề',
            'dàn đề bất tử',
            'dàn 36 số',
            'dàn 50 số',
            'dàn 60 số',
            'bạch thủ lô đề',
            'song thủ lô đề',
            'lọc dàn lô đề',
            'ghép dàn đề tự động',
            'nuôi dàn đề',
            'tài xỉu chẵn lẻ',
            'kép bằng kép lệch'
        ],
        url: '/dan-dac-biet',
        image: OG_IMAGES.danDacBiet,
        canonical: `${SITE_URL}/dan-dac-biet`,
        type: 'article',
        priority: 0.9,
        changefreq: 'daily',
        structuredData: {
            type: 'HowTo',
            additionalTypes: ['SoftwareApplication', 'FAQPage']
        },
        sections: {
            locGhepDan: {
                title: 'Lọc Ghép Dàn Đề Thông Minh',
                url: '/dan-dac-biet#loc-ghep-dan',
                keywords: ['lọc ghép dàn số', 'lọc dàn thông minh', 'ghép dàn tự động']
            },
            layNhanhDacBiet: {
                title: 'Lấy Nhanh Dàn Đề Đặc Biệt',
                url: '/dan-dac-biet#lay-nhanh-dac-biet',
                keywords: ['lấy nhanh dàn số', 'dàn đặc biệt nhanh', 'tạo dàn nhanh']
            },
            taoDanDauDuoi: {
                title: 'Tạo Dàn Đề Đầu Đuôi',
                url: '/dan-dac-biet#tao-dan-dau-duoi',
                keywords: ['tạo dàn đầu đuôi', 'dàn số đầu', 'dàn số đuôi']
            },
            taoDanCham: {
                title: 'Tạo Dàn Đề Chạm',
                url: '/dan-dac-biet#tao-dan-cham',
                keywords: ['tạo dàn chạm', 'dàn số chạm', 'lọc theo chạm']
            },
            taoDanBo: {
                title: 'Tạo Dàn Đề Bộ',
                url: '/dan-dac-biet#tao-dan-bo',
                keywords: ['tạo dàn bộ', 'dàn số bộ', 'lọc theo bộ']
            }
        }
    },

    /**
     * GHÉP LÔ XIÊN (NEW - High Priority)
     * PRIMARY: tạo dàn xiên (1,000), tạo dàn lô xiên (390), tạo dàn xiên 3 (260)
     * SECONDARY: tao dan xien, ghép lô xiên, xiên 2 3 4 càng
     */
    ghepLoXien: {
        title: 'Ghép Lotto - Xiên Quay 2-3-4 Càng | Tạo Dàn Xiên Tự Động 2025',
        description: 'Ghép lotto, xiên quay, ghép lô xiên (tao dan xien) 2-3-4 càng tự động. Tạo dàn xiên, soi cầu xiên, tính tiền cược nhanh. Công cụ chuyên nghiệp. Miễn phí!',
        keywords: [
            'ghép lotto',
            'ghép lô xiên',
            'xiên quay',
            'lô xiên quay',
            'tạo dàn xiên',
            'tao dan xien',
            'xiên 2 3 4 càng',
            'ghép dàn lô số',
            'lotto tự động',
            'ghép xiên quay tự động',
            'dàn xiên quay',
            'soi cầu xiên',
            'tạo dàn lô xiên',
            'lô xiên tự động',
            'tạo dàn xiên 3'
        ],
        url: '/ghep-lo-xien',
        image: OG_IMAGES.default,
        canonical: `${SITE_URL}/ghep-lo-xien`,
        type: 'article',
        priority: 0.85,
        changefreq: 'weekly',
        structuredData: {
            type: 'HowTo',
            additionalTypes: ['SoftwareApplication', 'FAQPage']
        }
    },

    /**
     * BẢNG TÍNH CHÀO (NEW - Medium Priority)
     * Primary Keywords: bảng tính chào, tính chào dàn số, đánh chào gấp thếp
     */
    bangTinhChao: {
        title: 'Bảng Tính Chào | Tính Lãi Chào Gấp Thếp Dàn Đề Tự Động 2025',
        description: 'Công cụ tính chào (gấp thếp) dàn số chuyên nghiệp. Tính lãi chào tự động, mô phỏng chiến lược đánh gấp thếp. Hỗ trợ dàn 9x-0x, 2D. Miễn phí 100%!',
        keywords: [
            'bảng tính chào',
            'tính chào dàn số',
            'đánh chào gấp thếp',
            'tính lãi chào',
            'bảng tính lãi chào 2d',
            'công cụ tính chào',
            'đánh gấp thếp tự động',
            'bảng tính chào dàn 9x',
            'tính tiền đánh chào',
            'chiến lược gấp thếp'
        ],
        url: '/bang-tinh-chao',
        image: OG_IMAGES.default,
        canonical: `${SITE_URL}/bang-tinh-chao`,
        type: 'article',
        priority: 0.8,
        changefreq: 'weekly',
        structuredData: {
            type: 'HowTo',
            additionalTypes: ['SoftwareApplication', 'FAQPage']
        }
    },

    /**
     * THỐNG KÊ XỔ SỐ
     * Primary Keywords: thống kê xổ số, thống kê 3 miền, phân tích xổ số
     */
    thongKe: {
        title: 'Thống Kê Xổ Số 3 Miền | Phân Tích Kết Quả XSMB XSMN XSMT 2025',
        description: 'Thống kê xổ số 3 miền chi tiết, chính xác. Phân tích tần suất xuất hiện, số nóng, số lạnh. Hỗ trợ XSMB, XSMN, XSMT. Cập nhật realtime. Miễn phí 100%!',
        keywords: [
            'thống kê xổ số',
            'thống kê 3 miền',
            'phân tích xổ số',
            'thống kê xsmb',
            'thống kê xsmn',
            'thống kê xsmt',
            'số nóng số lạnh',
            'tần suất xuất hiện',
            'phân tích lô số'
        ],
        url: '/thong-ke',
        image: OG_IMAGES.thongKe,
        canonical: `${SITE_URL}/thong-ke`,
        type: 'article',
        priority: 0.8,
        changefreq: 'daily',
        structuredData: {
            type: 'Article',
            additionalTypes: ['FAQPage']
        }
    },

    /**
     * CONTENT / HƯỚNG DẪN
     * Primary Keywords: hướng dẫn chơi lô số, mẹo chơi xổ số
     */
    content: {
        title: 'Hướng Dẫn Chơi Lô Đề | Mẹo & Chiến Thuật Xổ Số Hiệu Quả 2025',
        description: 'Hướng dẫn chi tiết cách chơi lô số, xổ số hiệu quả. Mẹo chơi dàn số, chiến thuật gấp thếp, quản lý vốn. Kinh nghiệm từ cao thủ. Miễn phí 100%!',
        keywords: [
            'hướng dẫn chơi lô số',
            'mẹo chơi xổ số',
            'chiến thuật xổ số',
            'cách chơi dàn số',
            'kinh nghiệm chơi lô số',
            'quản lý vốn lô số'
        ],
        url: '/content',
        image: OG_IMAGES.default,
        canonical: `${SITE_URL}/content`,
        type: 'article',
        priority: 0.7,
        changefreq: 'weekly',
        structuredData: {
            type: 'Article',
            additionalTypes: ['FAQPage']
        }
    },

    /**
     * TIN TỨC
     * Primary Keywords: tin tức xổ số, kết quả xổ số mới nhất
     */
    tinTuc: {
        title: 'Tin Tức Xổ Số | Kết Quả & Cập Nhật XSMB XSMN XSMT Mới Nhất 2025',
        description: 'Tin tức xổ số mới nhất hôm nay. Kết quả XSMB, XSMN, XSMT nhanh chính xác. Cập nhật liên tục 24/7. Miễn phí 100%!',
        keywords: [
            'tin tức xổ số',
            'kết quả xổ số',
            'xsmb hôm nay',
            'xsmn hôm nay',
            'xsmt hôm nay',
            'kết quả xổ số mới nhất'
        ],
        url: '/tin-tuc',
        image: OG_IMAGES.default,
        canonical: `${SITE_URL}/tin-tuc`,
        type: 'website',
        priority: 0.7,
        changefreq: 'daily',
        structuredData: {
            type: 'CollectionPage',
            additionalTypes: []
        }
    }
};

/**
 * Common Meta Tags for All Pages
 */
const COMMON_META = {
    siteName: SITE_NAME,
    locale: 'vi_VN',
    type: 'website',
    twitterCard: 'summary_large_image',
    twitterSite: '@taodandewukong', // Update with actual Twitter handle
    robots: 'index, follow',
    googlebot: 'index, follow',
    author: SITE_NAME,
    viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
    themeColor: '#FF6B35',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black-translucent'
};

/**
 * Generate Open Graph Tags
 */
function generateOpenGraphTags(pageConfig) {
    return {
        'og:site_name': SITE_NAME,
        'og:title': pageConfig.title,
        'og:description': pageConfig.description,
        'og:url': pageConfig.canonical || `${SITE_URL}${pageConfig.url}`,
        'og:type': pageConfig.type || 'website',
        'og:image': pageConfig.image || OG_IMAGES.default,
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:alt': pageConfig.title,
        'og:locale': 'vi_VN'
    };
}

/**
 * Generate Twitter Card Tags
 */
function generateTwitterCardTags(pageConfig) {
    return {
        'twitter:card': 'summary_large_image',
        'twitter:site': COMMON_META.twitterSite,
        'twitter:title': pageConfig.title,
        'twitter:description': pageConfig.description,
        'twitter:image': pageConfig.image || OG_IMAGES.default,
        'twitter:image:alt': pageConfig.title
    };
}

/**
 * Get Complete SEO Config for a Page
 */
function getPageSEO(pageName) {
    const pageConfig = SEO_CONFIG[pageName] || SEO_CONFIG.home;

    return {
        ...pageConfig,
        openGraph: generateOpenGraphTags(pageConfig),
        twitter: generateTwitterCardTags(pageConfig),
        meta: {
            ...COMMON_META,
            keywords: pageConfig.keywords.join(', ')
        }
    };
}

/**
 * Generate Breadcrumb Schema
 */
function generateBreadcrumbSchema(breadcrumbs) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': item.name,
            'item': item.url
        }))
    };
}

/**
 * Generate FAQ Schema
 */
function generateFAQSchema(faqData) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': faqData.map(faq => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer
            }
        }))
    };
}

module.exports = {
    SEO_CONFIG,
    COMMON_META,
    SITE_URL,
    SITE_NAME,
    OG_IMAGES,
    getPageSEO,
    generateOpenGraphTags,
    generateTwitterCardTags,
    generateBreadcrumbSchema,
    generateFAQSchema
};

