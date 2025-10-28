/**
 * SEO Configuration for All Pages
 * Centralized SEO metadata management
 * 
 * Based on competitor analysis and keyword research
 * Last Updated: 2025-01-12
 * Enhanced: Multi-search engine optimization (Google, Bing, Cốc Cốc)
 */

const { getAllKeywordsForPage, generateMetaDescription } = require('./keywordVariations');

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
     * ENHANCED: Keyword variations for multi-search engine optimization
     */
    home: {
        title: 'Tạo Dàn Đề Wukong (Tao Dan De) | Ứng Dụng Tạo Mức Số - Nuôi Dàn Miễn Phí 2025',
        description: generateMetaDescription('home', true),
        keywords: [
            // ✅ BRAND VARIATIONS - Tất cả cách gõ tìm kiếm
            'tạo dàn đề wukong',
            'tao dan de wukong',
            'tạo dàn đề wu kong',
            'tao dan de wu kong',
            'tạo dan đề wukong',
            'tao dàn de wukong',
            'taodandewukong',
            'taodande wukong',
            'tao dande wukong',
            'tạo đàn đề wukong',
            'tao dan wukong',
            'tạo dàn wukong',
            'dan de wukong',
            'taodandewukong.pro',
            'web tạo dàn đề wukong',

            // ✅ CORE KEYWORDS - Từ khóa chính (có dấu + không dấu)
            'tạo dàn đề', 'tao dan de', 'tạo dan đề', 'tao dàn de', 'tạo đàn đề',
            'taodande', 'tao-dan-de', 'tạo-dàn-đề', 'taodàndề',
            'tạo dàn số', 'tao dan so', 'tạo dan số', 'tao dàn so', 'taodanso',
            'tạo mức số', 'tao muc so', 'tạo muc số', 'taomucso',

            // ✅ LÔ ĐỀ VARIATIONS - Tất cả cách viết lô đề
            'lô đề', 'lo de', 'lô de', 'lo đề', 'ló đề', 'lo đe', 'lô đe',
            'lô tô', 'lo to', 'ló tô', 'loto', 'lotô',
            'dàn đề', 'dan de', 'dàn de', 'dan đề', 'đàn đề', 'dande',

            // ✅ COMMON MISSPELLINGS - Sai chính tả phổ biến
            'tạo dan đê', 'tao dàn đề', 'tạo dàn đê', 'tao dan đe',
            'ló tô', 'dan đe', 'tạo dàn dề', 'tạo đan de',

            // ✅ LONG-TAIL QUESTIONS - Tối ưu cho Google
            'cách tạo dàn đề', 'tạo dàn đề online', 'tạo dàn đề miễn phí',
            'web tạo dàn đề', 'tool tạo dàn đề', 'app tạo dàn đề',
            'cách tạo dàn đề hiệu quả', 'tạo dàn đề như thế nào',
            'app tạo dàn đề nào tốt', 'web tạo dàn đề uy tín',
            'công cụ tạo dàn đề chuyên nghiệp', 'phần mềm tạo dàn đề miễn phí',

            // ✅ BING OPTIMIZATION - Formal queries
            'ứng dụng tạo dàn đề', 'phần mềm tạo mức số',
            'công cụ lô đề online', 'hệ thống tạo dàn số',
            'giải pháp tạo dàn đề',

            // ✅ CỐC CỐC OPTIMIZATION - Vietnamese-specific
            'tạo dàn đề việt nam', 'app tạo dàn đề tiếng việt',
            'web tạo dàn đề vn', 'công cụ lô đề việt',
            'tạo dàn số miền bắc', 'tạo dàn số 3 miền',

            // ✅ COMPETITIVE KEYWORDS
            'kangdh', 'kang dh', 'taodanxoso', 'tao dan xo so',
            'giai ma so hoc', 'giải mã số học', 'dan de pro', 'dande pro',

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
    },

    /**
     * SOI CẦU BAYESIAN - NEW HIGH PRIORITY
     * PRIMARY: soi cầu miền bắc hôm nay (74,000), dự đoán XSMB (12,100), soi cầu MB (8,100)
     * SECONDARY: thống kê vị trí XSMB (2,900), phân tích xổ số miền Bắc (1,600)
     * ENHANCED: Multi-search engine optimization + User behavior keywords
     */
    soiCauBayesian: {
        title: 'Soi Cầu Miền Bắc Hôm Nay | Dự Đoán XSMB Chính Xác 100% - Thuật Toán Bayesian 2025',
        description: generateMetaDescription('soiCauBayesian', true),
        keywords: [
            // ✅ PRIMARY KEYWORDS - Từ khóa chính có volume cao
            'soi cầu miền bắc hôm nay', 'soi cau mien bac hom nay',
            'dự đoán XSMB hôm nay', 'du doan XSMB hom nay',
            'soi cầu MB hôm nay', 'soi cau MB hom nay',
            'soi cầu miền bắc', 'soi cau mien bac',
            'dự đoán XSMB', 'du doan XSMB',
            'soi cầu MB', 'soi cau MB',

            // ✅ BRAND + FEATURE COMBINATIONS
            'soi cầu wukong', 'soi cau wukong',
            'soi cầu miền bắc wukong', 'soi cau mien bac wukong',
            'dự đoán XSMB wukong', 'du doan XSMB wukong',
            'soi cầu MB wukong', 'soi cau MB wukong',
            'wukong soi cầu', 'wukong soi cau',
            'wukong dự đoán XSMB', 'wukong du doan XSMB',

            // ✅ LONG-TAIL KEYWORDS - Câu hỏi người dùng
            'soi cầu miền bắc hôm nay chính xác', 'soi cau mien bac hom nay chinh xac',
            'dự đoán XSMB hôm nay chuẩn', 'du doan XSMB hom nay chuan',
            'soi cầu MB hôm nay miễn phí', 'soi cau MB hom nay mien phi',
            'soi cầu miền bắc online', 'soi cau mien bac online',
            'dự đoán xổ số miền bắc hôm nay', 'du doan xo so mien bac hom nay',
            'soi cầu xổ số miền bắc', 'soi cau xo so mien bac',

            // ✅ TIME-BASED KEYWORDS - Theo thời gian
            'soi cầu miền bắc ngày mai', 'soi cau mien bac ngay mai',
            'dự đoán XSMB ngày mai', 'du doan XSMB ngay mai',
            'soi cầu MB ngày mai', 'soi cau MB ngay mai',
            'soi cầu miền bắc tuần này', 'soi cau mien bac tuan nay',
            'dự đoán XSMB tuần này', 'du doan XSMB tuan nay',

            // ✅ METHOD-SPECIFIC KEYWORDS - Phương pháp cụ thể
            'soi cầu Bayesian miền bắc', 'soi cau Bayesian mien bac',
            'dự đoán Bayesian XSMB', 'du doan Bayesian XSMB',
            'soi cầu thống kê miền bắc', 'soi cau thong ke mien bac',
            'phân tích Bayesian XSMB', 'phan tich Bayesian XSMB',
            'soi cầu AI miền bắc', 'soi cau AI mien bac',
            'dự đoán AI XSMB', 'du doan AI XSMB',

            // ✅ COMPETITIVE KEYWORDS - Đối thủ cạnh tranh
            'soi cầu miền bắc xskt', 'soi cau mien bac xskt',
            'soi cầu miền bắc xoso', 'soi cau mien bac xoso',
            'soi cầu miền bắc atrungroi', 'soi cau mien bac atrungroi',
            'soi cầu miền bắc xsmn247', 'soi cau mien bac xsmn247',
            'soi cầu miền bắc xosothantai', 'soi cau mien bac xosothantai',

            // ✅ STATISTICAL KEYWORDS - Thống kê
            'thống kê vị trí XSMB', 'thong ke vi tri XSMB',
            'phân tích xổ số miền Bắc', 'phan tich xo so mien Bac',
            'thống kê XSMB hôm nay', 'thong ke XSMB hom nay',
            'bảng thống kê XSMB', 'bang thong ke XSMB',
            'tần suất xuất hiện XSMB', 'tan suat xuat hien XSMB',
            'số nóng số lạnh XSMB', 'so nong so lanh XSMB',

            // ✅ REGIONAL VARIATIONS - Biến thể theo vùng
            'soi cầu xsmb', 'soi cau xsmb',
            'dự đoán xsmb', 'du doan xsmb',
            'soi cầu xổ số miền bắc', 'soi cau xo so mien bac',
            'soi cầu miền bắc 3 miền', 'soi cau mien bac 3 mien',
            'soi cầu miền bắc 24h', 'soi cau mien bac 24h',

            // ✅ ACCURACY KEYWORDS - Độ chính xác
            'soi cầu miền bắc chính xác 100%', 'soi cau mien bac chinh xac 100%',
            'dự đoán XSMB chuẩn nhất', 'du doan XSMB chuan nhat',
            'soi cầu MB siêu chuẩn', 'soi cau MB sieu chuan',
            'soi cầu miền bắc uy tín', 'soi cau mien bac uy tin',
            'soi cầu miền bắc chuyên nghiệp', 'soi cau mien bac chuyen nghiep',

            // ✅ FREE KEYWORDS - Miễn phí
            'soi cầu miền bắc miễn phí', 'soi cau mien bac mien phi',
            'dự đoán XSMB miễn phí', 'du doan XSMB mien phi',
            'soi cầu MB free', 'soi cau MB free',
            'soi cầu miền bắc không mất phí', 'soi cau mien bac khong mat phi',

            // ✅ MOBILE KEYWORDS - Di động
            'soi cầu miền bắc mobile', 'soi cau mien bac mobile',
            'soi cầu XSMB app', 'soi cau XSMB app',
            'dự đoán XSMB điện thoại', 'du doan XSMB dien thoai',
            'soi cầu miền bắc wap', 'soi cau mien bac wap',

            // ✅ TECHNICAL KEYWORDS - Kỹ thuật
            'soi cầu miền bắc thuật toán', 'soi cau mien bac thuat toan',
            'dự đoán XSMB machine learning', 'du doan XSMB machine learning',
            'soi cầu MB AI', 'soi cau MB AI',
            'phân tích dữ liệu XSMB', 'phan tich du lieu XSMB',
            'soi cầu miền bắc big data', 'soi cau mien bac big data',

            // ✅ MISSING DIACRITICS - Thiếu dấu
            'soi cau mien bac', 'soi cau MB',
            'du doan XSMB', 'du doan xsmb',
            'soi cau xo so mien bac', 'soi cau xsmb',
            'thong ke vi tri XSMB', 'thong ke XSMB',

            // ✅ SPACING VARIATIONS - Biến thể khoảng trắng
            'soicau mien bac', 'soicauMB',
            'dudoan XSMB', 'dudoanxsmb',
            'soicau xsmb', 'soicauxsmb',
            'thongke XSMB', 'thongkexsmb',

            // ✅ HYPHEN VARIATIONS - Biến thể gạch ngang
            'soi-cau-mien-bac', 'soi-cau-MB',
            'du-doan-XSMB', 'du-doan-xsmb',
            'soi-cau-xsmb', 'thong-ke-XSMB',

            // ✅ QUESTION KEYWORDS - Câu hỏi
            'soi cầu miền bắc hôm nay như thế nào', 'soi cau mien bac hom nay nhu the nao',
            'dự đoán XSMB hôm nay ra sao', 'du doan XSMB hom nay ra sao',
            'soi cầu MB hôm nay có chính xác không', 'soi cau MB hom nay co chinh xac khong',
            'cách soi cầu miền bắc hôm nay', 'cach soi cau mien bac hom nay',
            'làm sao để soi cầu XSMB', 'lam sao de soi cau XSMB',

            // ✅ COMPARISON KEYWORDS - So sánh
            'soi cầu miền bắc tốt nhất', 'soi cau mien bac tot nhat',
            'dự đoán XSMB chính xác nhất', 'du doan XSMB chinh xac nhat',
            'soi cầu MB uy tín nhất', 'soi cau MB uy tin nhat',
            'soi cầu miền bắc nào tốt', 'soi cau mien bac nao tot',

            // ✅ URGENCY KEYWORDS - Khẩn cấp
            'soi cầu miền bắc hôm nay gấp', 'soi cau mien bac hom nay gap',
            'dự đoán XSMB hôm nay nhanh', 'du doan XSMB hom nay nhanh',
            'soi cầu MB hôm nay khẩn cấp', 'soi cau MB hom nay khan cap',
            'soi cầu miền bắc hôm nay ngay', 'soi cau mien bac hom nay ngay'
        ],
        url: '/soi-cau-bayesian',
        image: `${SITE_URL}/imgs/soi-cau-bayesian.png`,
        canonical: `${SITE_URL}/soi-cau-bayesian`,
        type: 'article',
        priority: 0.95,
        changefreq: 'daily',
        structuredData: {
            type: 'Article',
            additionalTypes: ['FAQPage', 'SoftwareApplication']
        },
        sections: {
            soiCauHomNay: {
                title: 'Soi Cầu Miền Bắc Hôm Nay',
                url: '/soi-cau-bayesian#soi-cau-hom-nay',
                keywords: ['soi cầu miền bắc hôm nay', 'soi cau mien bac hom nay', 'dự đoán XSMB hôm nay']
            },
            thongKeViTri: {
                title: 'Thống Kê Vị Trí XSMB',
                url: '/soi-cau-bayesian#thong-ke-vi-tri',
                keywords: ['thống kê vị trí XSMB', 'thong ke vi tri XSMB', 'phân tích xổ số miền Bắc']
            },
            phuongPhapBayesian: {
                title: 'Phương Pháp Bayesian',
                url: '/soi-cau-bayesian#phuong-phap-bayesian',
                keywords: ['soi cầu Bayesian', 'dự đoán Bayesian XSMB', 'thuật toán Bayesian']
            }
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

