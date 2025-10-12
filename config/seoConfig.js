/**
 * SEO Configuration for All Pages
 * Centralized SEO metadata management
 * 
 * Based on competitor analysis and keyword research
 * Last Updated: 2025-01-12
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro';
const SITE_NAME = 'Dàn Đề Tôn Ngộ Không';
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
     * PRIMARY: tạo dàn đề (74,000), tao dan de (74,000), taodande (8,100)
     * SECONDARY: ứng dụng tạo dàn (1,000), tạo dàn số (4,400), tạo dàn xổ số (2,900)
     */
    home: {
        title: 'Tạo Dàn Đề (Tao Dan De) | Ứng Dụng Tạo Mức Số - Nuôi Dàn Miễn Phí 2025',
        description: 'Ứng dụng tạo dàn đề, tạo mức số (tao dan de) online miễn phí. Công cụ tạo dàn lô đề, ghép lotto, nuôi dàn khung 3-5 ngày, soi cầu. Dàn 36-50 số, bạch thủ, xiên quay. Chuyên nghiệp!',
        keywords: [
            'tạo dàn đề',
            'tao dan de',
            'taodande',
            'tạo mức số',
            'ứng dụng mức số',
            'tạo dàn lô đề',
            'công cụ lô đề',
            'ghép lotto',
            'tách dàn nhanh',
            'lọc ghép dàn',
            'lấy nhanh dàn đề',
            'dàn đề bất tử',
            'dàn khung 3 ngày',
            'nuôi dàn đề',
            'nuôi dàn khung 3 ngày',
            'dàn 36 số',
            'dàn 50 số',
            'soi cầu lô đề',
            'bạch thủ lô đề',
            'xiên quay',
            'lô đá',
            'ứng dụng tạo dàn',
            'tạo dàn số',
            'phần mềm tạo dàn đề'
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
        title: 'Tạo Dàn 9x-0x Ngẫu Nhiên | Cắt Dàn 9x - Lọc Dàn 9x Miễn Phí 2025',
        description: 'Công cụ tạo dàn 9x-0x ngẫu nhiên chuyên nghiệp. Cắt dàn 9x, lọc dàn 9x, nuôi dàn 9x khung 3-5 ngày. Thuật toán Fisher-Yates chuẩn. Miễn phí 100%!',
        keywords: [
            'tạo dàn 9x0x',
            'dàn 9x0x',
            'tạo dàn 9x ngẫu nhiên',
            'cắt dàn 9x0x',
            'cắt dàn 9x',
            'lọc dàn 9x0x',
            'lọc dàn 9x',
            'nuôi dàn 9x',
            'nuôi dàn khung 3 ngày',
            'dàn 90 số khung 3 ngày',
            'rút dàn 9x',
            'dàn đề 9x0x miễn phí',
            'công cụ tạo dàn 9x0x'
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
     * PRIMARY: tạo dàn 2d (5,400), tạo dàn đề 2d (590)
     * SECONDARY: tao dan 2d, dàn 2d, ứng dụng tạo dàn 2d
     */
    dan2d: {
        title: 'Tạo Dàn 2D - Tạo Mức Số 2D | Công Cụ Lô Đề Miễn Phí 2025',
        description: 'Tạo dàn 2D, tạo mức số 2D (tao dan 2d) online miễn phí. Công cụ tạo dàn lô đề 2 số. Bạch thủ, song thủ, lô đá 2D. Lấy nhanh dàn đặc biệt. Chính xác 100%!',
        keywords: [
            'tạo dàn 2d',
            'tao dan 2d',
            'tạo mức số 2d',
            'dàn lô đề 2d',
            'lấy nhanh dàn 2d',
            'lọc ghép dàn 2d',
            'công cụ lô đề 2d',
            'bạch thủ lô 2d',
            'song thủ lô 2d',
            'lô đá 2d',
            'dàn 10 số',
            'dàn 20 số',
            'tạo dàn đề 2d',
            'dàn 2d',
            'ứng dụng tạo dàn 2d'
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
     * PRIMARY: tạo dàn 3 càng (1,600), tạo dàn de 3d (880), dàn 3d (260), tạo dàn đề 4d (210)
     * SECONDARY: dàn 3 càng (210), tao dan 3d, tao dan 3 cang
     */
    dan3d4d: {
        title: 'Tạo Dàn 3D-4D | Tách Dàn Nhanh AB-BC-CD | Mức Số 3-4D Pro 2025',
        description: 'Tạo dàn 3D-4D, tạo mức số 3-4D (tao dan 3d 4d). Tách dàn nhanh thành AB, BC, CD. Công cụ tạo dàn lô đề 3 càng, ghép lotto 4 càng. Dành cho cao thủ!',
        keywords: [
            'tạo dàn 3d',
            'tạo dàn 4d',
            'tạo mức số 3d',
            'tách dàn nhanh',
            'tách ab bc cd',
            'dàn lô đề 3 càng',
            'ghép lotto 4 càng',
            'tạo dàn 3 càng',
            'tao dan 3 cang',
            'tạo dàn de 3d',
            'dàn 3d',
            'dàn bc cd de',
            'tạo dàn đề 4d'
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
     * Primary Keywords: dàn đặc biệt, lọc ghép dàn đề, lấy nhanh dàn đề
     */
    danDacBiet: {
        title: 'Dàn Đặc Biệt | Dàn 36-50 Số | Nuôi Dàn Khung 3-5 Ngày 2025',
        description: 'Lấy nhanh dàn đặc biệt: Dàn 10-16-20-36-50-60 số. Nuôi dàn khung 3-5 ngày. Lọc ghép dàn lô đề, bạch thủ, song thủ. Dàn đề bất tử. Miễn phí 100%!',
        keywords: [
            'dàn đặc biệt',
            'lấy nhanh dàn đề',
            'lọc ghép dàn',
            'dàn đề bất tử',
            'dàn khung 3 ngày',
            'dàn 10 số khung 5 ngày',
            'dàn 16 số khung 3 ngày',
            'dàn 20 số khung 3 ngày',
            'dàn 36 số khung 3 ngày',
            'dàn 50 số khung 3 ngày',
            'dàn 60 số khung 2 ngày',
            'nuôi dàn đặc biệt',
            'nuôi dàn khung 3 ngày',
            'bạch thủ lô đề',
            'song thủ lô đề',
            'lô đá đặc biệt',
            'lọc dàn lô đề',
            'tài xỉu chẵn lẻ',
            'kép bằng kép lệch',
            'tạo dàn đặc biệt'
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
                keywords: ['lọc ghép dàn đề', 'lọc dàn thông minh', 'ghép dàn tự động']
            },
            layNhanhDacBiet: {
                title: 'Lấy Nhanh Dàn Đề Đặc Biệt',
                url: '/dan-dac-biet#lay-nhanh-dac-biet',
                keywords: ['lấy nhanh dàn đề', 'dàn đặc biệt nhanh', 'tạo dàn nhanh']
            },
            taoDanDauDuoi: {
                title: 'Tạo Dàn Đề Đầu Đuôi',
                url: '/dan-dac-biet#tao-dan-dau-duoi',
                keywords: ['tạo dàn đầu đuôi', 'dàn đề đầu', 'dàn đề đuôi']
            },
            taoDanCham: {
                title: 'Tạo Dàn Đề Chạm',
                url: '/dan-dac-biet#tao-dan-cham',
                keywords: ['tạo dàn chạm', 'dàn đề chạm', 'lọc theo chạm']
            },
            taoDanBo: {
                title: 'Tạo Dàn Đề Bộ',
                url: '/dan-dac-biet#tao-dan-bo',
                keywords: ['tạo dàn bộ', 'dàn đề bộ', 'lọc theo bộ']
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
            'ghép dàn lô đề',
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
     * Primary Keywords: bảng tính chào, tính chào dàn đề, đánh chào gấp thếp
     */
    bangTinhChao: {
        title: 'Bảng Tính Chào | Tính Lãi Chào Gấp Thếp Dàn Đề Tự Động 2025',
        description: 'Công cụ tính chào (gấp thếp) dàn đề chuyên nghiệp. Tính lãi chào tự động, mô phỏng chiến lược đánh gấp thếp. Hỗ trợ dàn 9x-0x, 2D. Miễn phí 100%!',
        keywords: [
            'bảng tính chào',
            'tính chào dàn đề',
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
            'phân tích lô đề'
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
     * Primary Keywords: hướng dẫn chơi lô đề, mẹo chơi xổ số
     */
    content: {
        title: 'Hướng Dẫn Chơi Lô Đề | Mẹo & Chiến Thuật Xổ Số Hiệu Quả 2025',
        description: 'Hướng dẫn chi tiết cách chơi lô đề, xổ số hiệu quả. Mẹo chơi dàn đề, chiến thuật gấp thếp, quản lý vốn. Kinh nghiệm từ cao thủ. Miễn phí 100%!',
        keywords: [
            'hướng dẫn chơi lô đề',
            'mẹo chơi xổ số',
            'chiến thuật xổ số',
            'cách chơi dàn đề',
            'kinh nghiệm chơi lô đề',
            'quản lý vốn lô đề'
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

