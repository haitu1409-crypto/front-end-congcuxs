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
    locDanDe: `${SITE_URL}/imgs/dan9x0x (1).png`,
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
        title: 'TDDW - Tạo Dàn Đề, Tạo Dàn Số Online Miễn Phí | Công Cụ Xổ Số Chuyên Nghiệp 2025',
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
            
            // ✅ SHORT ABBREVIATIONS - Viết tắt ngắn (giống RBK = Rồng Bạch Kim)
            'tddw', 'TDDW', 'tdd w', 'tdd-w', 'tdd_w',
            'wk', 'WK', 'w k', 'w-k', 'w_k',
            'tdd', 'TDD', 't d d', 't-d-d',
            'wukong', 'Wukong', 'WUKONG', 'wu kong',
            'ddw', 'DDW', 'd d w', 'd-d-w', // Dàn Đề Wukong
            'ddwk', 'DDWK', // Dàn Đề Wukong
            'tdde', 'TDDE', // Tạo Dàn Đề
            'tdd pro', 'tddw.pro', 'tddw pro',

            // ✅ CORE KEYWORDS - Từ khóa chính (có dấu + không dấu)
            'tạo dàn đề', 'tao dan de', 'tạo dan đề', 'tao dàn de', 'tạo đàn đề',
            'taodande', 'tao-dan-de', 'tạo-dàn-đề', 'taodàndề',
            'tạo dàn số', 'tao dan so', 'tạo dan số', 'tao dàn so', 'taodanso',
            'tạo mức số', 'tao muc so', 'tạo muc số', 'taomucso',
            
            // ✅ ĐỒNG NGHĨA - Các từ có nghĩa tương tự
            'lập dàn đề', 'lap dan de', 'lập dàn số', 'lap dan so',
            'lập mức số', 'lap muc so', 'lập dàn', 'lap dan',
            'tạo dàn', 'tao dan', 'tạo mức', 'tao muc',
            'lập mức', 'lap muc', 'tạo bộ số', 'tao bo so',
            'lập bộ số', 'lap bo so', 'tạo dãy số', 'tao day so',
            'lập dãy số', 'lap day so', 'tạo danh sách số', 'tao danh sach so',
            
            // ✅ BIẾN THỂ CHÍNH TẢ - Sai chính tả phổ biến
            'tạo dàn đê', 'tao dan ê', 'tạo đàn đề', 'tao dần đề',
            'tạo dàn dề', 'tao dan đe', 'tạo đan đề', 'tao dản đề',
            'lập dàn đê', 'lap dan ê', 'lập đàn đề', 'lap dần đề',

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
            
            // Long-tail với đồng nghĩa
            'cách lập dàn đề', 'lap dan de online', 'lập dàn đề miễn phí',
            'web lập dàn đề', 'tool lập dàn số', 'app lập mức số',
            'cách tạo dàn số hiệu quả', 'lập dàn đề như thế nào',
            'phần mềm lập dàn đề', 'ứng dụng lập dàn số',
            'cách tạo mức số', 'tạo mức số online', 'lập mức số miễn phí',
            
            // Câu hỏi phổ biến
            'tạo dàn đề ở đâu', 'tao dan de o dau', 'lập dàn số ở đâu',
            'web tạo dàn đề nào tốt', 'app tạo dàn số nào hay',
            'phần mềm tạo dàn đề nào uy tín', 'tool tạo dàn đề nào miễn phí',
            'công cụ tạo dàn số tốt nhất', 'ung dung tao dan de tot nhat',

            // ✅ BING OPTIMIZATION - Formal queries
            'ứng dụng tạo dàn đề', 'phần mềm tạo mức số',
            'công cụ lô đề online', 'hệ thống tạo dàn số',
            'giải pháp tạo dàn đề', 'phần mềm lập dàn số',
            'ứng dụng lập mức số', 'công cụ tạo bộ số',
            'hệ thống lập dàn đề', 'giải pháp lập dàn số',

            // ✅ CỐC CỐC OPTIMIZATION - Vietnamese-specific
            'tạo dàn đề việt nam', 'app tạo dàn đề tiếng việt',
            'web tạo dàn đề vn', 'công cụ lô đề việt',
            'tạo dàn số miền bắc', 'tạo dàn số 3 miền',
            'lập dàn đề việt nam', 'phan mem tao dan so viet nam',
            'ung dung lap dan so vn', 'cong cu lo de viet',
            'tạo dàn số hà nội', 'lập dàn số miền bắc',

            // ✅ COMPETITIVE KEYWORDS - Đối thủ cạnh tranh
            // KangDH.com - Đối thủ lớn
            'kangdh', 'kang dh', 'kangdh.com', 'taodanxoso', 'tao dan xo so',
            'kangdh tạo dàn', 'kangdh tạo dàn số', 'kangdh tạo dàn đề',
            'tốt hơn kangdh', 'tot hon kangdh', 'kangdh.com.vn',
            
            // GiaiMaSoHoc.net - Đối thủ lớn
            'giai ma so hoc', 'giải mã số học', 'giaimasohoc', 'giaimasohoc.net',
            'giai ma so hoc tạo dàn', 'giải mã số học tạo dàn số',
            'tốt hơn giaimasohoc', 'tot hon giaimasohoc',
            
            // SieuKetQua.com - Đối thủ lớn
            'sieu ket qua', 'sieuketqua', 'sieuketqua.com',
            'sieuketqua tạo dàn', 'sieu ket qua tạo dàn xổ số',
            'tốt hơn sieuketqua', 'tot hon sieuketqua',
            
            // DanhCongi.com - Đối thủ
            'danhcongi', 'danhcongi.com', 'danh con gi',
            'danhcongi tạo dàn', 'tốt hơn danhcongi',
            
            // Lottoat.com - Đối thủ
            'lottoat', 'lottoat.com', 'xoso.lottoat.com',
            'lottoat tạo dàn', 'tốt hơn lottoat',
            
            // Quynh.vn - Đối thủ
            'quỳnh.vn', 'quynh.vn', 'quynh tạo dàn đề',
            
            // Các trang khác
            'dan de pro', 'dande pro', 'dàn đề pro',
            'tạo dàn đề chuyên nghiệp', 'tao dan de chuyen nghiep',
            'phần mềm tạo dàn số', 'phan mem tao dan so',
            'ứng dụng tạo dàn số', 'ung dung tao dan so',
            
            // ✅ TRÁNH NHẦM LẪN - Game Black Myth: Wukong
            'wukong tạo dàn đề', 'wukong dàn đề', 'wukong loto',
            'wukong xổ số', 'wukong soi cầu', 'wukong thống kê',
            'dàn đề wukong khác game', 'wukong công cụ xổ số',
            'wukong không phải game', 'wukong tool xổ số',

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
            'ứng dụng lập dàn', 'phan mem lap dan so',
            'app tạo dàn số học', 'phần mềm mức số',
            'tool tạo dàn đề online', 'cong cu tao dan de',

            // Regional
            'tạo dàn đề 3 miền', 'tạo dàn đề miền bắc',
            'lập dàn số 3 miền', 'lập dàn số miền bắc',
            'tạo dàn đề miền nam', 'tạo dàn đề miền trung',
            'lập dàn số miền nam', 'lập dàn số miền trung',

            // Trending
            'tạo dàn đề 2025', 'tạo dàn đề mới nhất', 'tạo dàn đề chuyên nghiệp',
            'lập dàn số 2025', 'lap dan so moi nhat', 'lập dàn số chuyên nghiệp',
            'tạo mức số 2025', 'tao muc so moi nhat',
            
            // ✅ SPACING VARIATIONS - Các cách viết khác nhau
            'tạo-dàn-đề', 'tao-dan-de', 'lập-dàn-số', 'lap-dan-so',
            'tạo_dàn_đề', 'tao_dan_de', 'lập_dàn_số', 'lap_dan_so',
            'taodande', 'lapdanso', 'taomucso', 'lapmucso',
            
            // ✅ NO SPACE - Viết liền
            'taodandewukong', 'taodandeso', 'lapdandeso',
            'taomucso', 'lapmucso', 'taodanso',
            
            // ✅ MIXED CASE - Chữ hoa/thường
            'TạoDànĐề', 'TaoDanDe', 'LapDanSo',
            'TAODANDE', 'LAPDANSO', 'TạoMứcSố'
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
     * LỌC DÀN ĐỀ
     * Primary Keywords: lọc dàn đề, cắt dàn 9x, lọc dàn tổng hợp
     */
    locDanDe: {
        title: 'Lọc Dàn Đề Tổng Hợp | Cắt Dàn 9x-0x, 3X, 2X | Bộ Lọc Số Thông Minh 2025',
        description: 'Công cụ lọc dàn đề tổng hợp từ các dàn 9x-0x, 3X, 2X, 1X, 0X. Hỗ trợ thêm số mong muốn, loại bỏ số, bỏ kép bằng, chọn bộ đặc biệt, chạm, tổng. Thuật toán ưu tiên tần suất, miễn phí 100%.',
        keywords: [
            'lọc dàn đề',
            'loc dan de',
            'lọc dàn 9x',
            'loc dan 9x',
            'cắt dàn 9x',
            'cat dan 9x',
            'lọc dàn tổng hợp',
            'loc dan tong hop',
            'lọc dàn đề miễn phí',
            'loc dan de mien phi',
            'lọc dàn đề online',
            'loc dan de online',
            'lọc dàn đề 9x0x',
            'loc dan de 9x0x',
            'lọc dàn đề 3x',
            'lọc dàn đề 2x',
            'lọc dàn đề theo chạm',
            'lọc dàn đề theo tổng',
            'bộ lọc dàn đề',
            'bo loc dan de',
            'thuật toán lọc dàn đề',
            'thuat toan loc dan de',
            'loc dan de wukong',
            'lọc dàn đề wukong'
        ],
        url: '/loc-dan-de',
        image: OG_IMAGES.locDanDe,
        canonical: `${SITE_URL}/loc-dan-de`,
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
     * COMPETITIVE: Tối ưu để cạnh tranh với xskt, xosothantai, atrungroi, xsmn247
     */
    soiCauBayesian: {
        title: 'Soi Cầu Miền Bắc Hôm Nay | Dự Đoán XSMB Chính Xác 100% - Tốt Hơn XSKT, Xosothantai 2025',
        description: 'Soi cầu miền bắc hôm nay (soi cau mien bac hom nay) chính xác 100%, tốt hơn xskt, xosothantai, atrungroi, xsmn247. Dự đoán XSMB bằng 5 phương pháp truyền thống: Pascal, Hình Quả Trám, Tần Suất Lô Cặp, Lô Gan Kết Hợp, Lô Rơi. Miễn phí 100%, cập nhật realtime!',
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

            // ✅ COMPETITIVE KEYWORDS - Đối thủ cạnh tranh (MỞ RỘNG)
            // XSKT.COM.VN
            'soi cầu miền bắc xskt', 'soi cau mien bac xskt',
            'soi cầu xskt', 'soi cau xskt', 'xskt soi cầu', 'xskt soi cau',
            'soi cầu tốt hơn xskt', 'soi cau tot hon xskt',
            'xskt.com.vn soi cầu', 'xskt.com.vn soi cau',
            'soi cầu thay thế xskt', 'soi cau thay the xskt',
            
            // XOSOTHANTAI.MOBI
            'soi cầu miền bắc xosothantai', 'soi cau mien bac xosothantai',
            'soi cầu xosothantai', 'soi cau xosothantai',
            'xosothantai soi cầu', 'xosothantai soi cau',
            'soi cầu tốt hơn xosothantai', 'soi cau tot hon xosothantai',
            'xosothantai.mobi soi cầu', 'xosothantai.mobi soi cau',
            
            // XSMN247.ME / XSMN247 / XỔ SỐ MINH NGỌC
            'soi cầu miền bắc xsmn247', 'soi cau mien bac xsmn247',
            'soi cầu xsmn247', 'soi cau xsmn247',
            'xsmn247 soi cầu', 'xsmn247 soi cau',
            'soi cầu tốt hơn xsmn247', 'soi cau tot hon xsmn247',
            'xsmn247.me soi cầu', 'xsmn247.me soi cau',
            'xổ số minh ngọc 247 soi cầu', 'xo so minh ngoc 247 soi cau',
            'soi cầu minh ngọc', 'soi cau minh ngoc',
            
            // ATRUNGROI.COM / A TRÚNG RỒI
            'soi cầu miền bắc atrungroi', 'soi cau mien bac atrungroi',
            'soi cầu atrungroi', 'soi cau atrungroi',
            'atrungroi soi cầu', 'atrungroi soi cau',
            'soi cầu tốt hơn atrungroi', 'soi cau tot hon atrungroi',
            'atrungroi.com soi cầu', 'atrungroi.com soi cau',
            'a trúng rồi soi cầu', 'a trung roi soi cau',
            
            // XOSO.COM.VN
            'soi cầu miền bắc xoso', 'soi cau mien bac xoso',
            'soi cầu xoso', 'soi cau xoso',
            'xoso.com.vn soi cầu', 'xoso.com.vn soi cau',
            'thống kê vị trí xoso', 'thong ke vi tri xoso',
            
            // XSMN.MOBI
            'soi cầu xsmn.mobi', 'soi cau xsmn.mobi',
            'xsmn.mobi soi cầu', 'xsmn.mobi soi cau',
            'soi cầu tốt hơn xsmn.mobi', 'soi cau tot hon xsmn.mobi',
            
            // KQXSMB.MOBI
            'soi cầu kqxsmb.mobi', 'soi cau kqxsmb.mobi',
            'kqxsmb.mobi soi cầu', 'kqxsmb.mobi soi cau',
            
            // SOICAUMIENPHI.ORG / SOI CẦU MIỄN PHÍ 888
            'soi cầu miễn phí 888', 'soi cau mien phi 888',
            'soi cầu miễn phí tốt nhất', 'soi cau mien phi tot nhat',
            'soicaumienphi.org soi cầu', 'soicaumienphi soi cau',
            
            // XOSODAIPHAT
            'soi cầu xosodaiphat', 'soi cau xosodaiphat',
            'xosodaiphat soi cầu', 'xosodaiphat soi cau',
            
            // COMPARISON KEYWORDS - So sánh với đối thủ
            'soi cầu nào tốt nhất', 'soi cau nao tot nhat',
            'soi cầu uy tín nhất', 'soi cau uy tin nhat',
            'soi cầu chính xác nhất', 'soi cau chinh xac nhat',
            'soi cầu miền bắc nào đáng tin', 'soi cau mien bac nao dang tin',
            'soi cầu tốt hơn xskt xosothantai', 'soi cau tot hon xskt xosothantai',

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
        url: '/soicau-bayesian',
        image: `${SITE_URL}/imgs/soi-cau-bayesian.png`,
        canonical: `${SITE_URL}/soicau-bayesian`,
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
                url: '/soicau-bayesian#soi-cau-hom-nay',
                keywords: ['soi cầu miền bắc hôm nay', 'soi cau mien bac hom nay', 'dự đoán XSMB hôm nay']
            },
            thongKeViTri: {
                title: 'Thống Kê Vị Trí XSMB',
                url: '/soicau-bayesian#thong-ke-vi-tri',
                keywords: ['thống kê vị trí XSMB', 'thong ke vi tri XSMB', 'phân tích xổ số miền Bắc']
            },
            phuongPhapBayesian: {
                title: 'Phương Pháp Bayesian',
                url: '/soicau-bayesian#phuong-phap-bayesian',
                keywords: ['soi cầu Bayesian', 'dự đoán Bayesian XSMB', 'thuật toán Bayesian']
            }
        }
    },

    /**
     * THỐNG KÊ ĐẦU ĐUÔI
     * PRIMARY: thống kê đầu đuôi (12,000), dau duoi lo to (5,400)
     * ENHANCED: Competitive keywords vs xosothantai
     */
    'dau-duoi': {
        title: 'Thống Kê Đầu Đuôi XSMB - Phân Tích Nhanh Nhất | TAODANDEWUKONG.PRO - Miễn Phí 2025',
        description: generateMetaDescription('dau-duoi', true),
        keywords: [
            // ✅ PRIMARY KEYWORDS
            'thống kê đầu đuôi', 'thống kê đầu đuôi loto', 'thống kê đầu đuôi xsmb',
            'dau duoi lo to', 'dau duoi loto', 'thong ke dau duoi',

            // ✅ COMPETITIVE KEYWORDS
            'thống kê đầu đuôi tốt nhất', 'thong ke dau duoi tot nhat',
            'thống kê đầu đuôi xosothantai', 'xosothantai thống kê đầu đuôi',
            'thống kê đầu đuôi nhanh nhất', 'thong ke dau duoi nhanh nhat',

            // ✅ LONG-TAIL KEYWORDS
            'thống kê đầu đuôi miền bắc', 'dau duoi mien bac',
            'tần suất đầu đuôi', 'phan tich dau duoi loto',
            'bảng thống kê đầu đuôi', 'bang thong ke dau duoi',

            // ✅ BRAND VARIATIONS
            'thống kê đầu đuôi taodandewukong', 'taodandewukong thống kê đầu đuôi',
            'dau duoi wukong', 'wukong thống kê đầu đuôi',

            // ✅ REGIONAL
            'thống kê đầu đuôi 3 miền', 'thống kê đầu đuôi xổ số'
        ],
        url: '/thongke/dau-duoi',
        image: OG_IMAGES.thongKe,
        canonical: `${SITE_URL}/thongke/dau-duoi`,
        type: 'article',
        priority: 0.9,
        changefreq: 'daily',
        structuredData: {
            type: 'Dataset',
            additionalTypes: ['Article', 'FAQPage']
        }
    },

    /**
     * THỐNG KÊ LÔ GAN
     * PRIMARY: lô gan (8,100), lo gan (2,900), thống kê lô gan (2,100)
     * COMPETITIVE: vs xosothantai, xskt
     */
    'lo-gan': {
        title: 'Thống Kê Lô Gan XSMB - Chi Tiết Hơn Xosothantai | TAODANDEWUKONG.PRO - Miễn Phí 2025',
        description: generateMetaDescription('lo-gan', true),
        keywords: [
            // ✅ PRIMARY
            'lô gan', 'lo gan', 'thống kê lô gan', 'thong ke lo gan',
            'lô khan', 'lo khan', 'số gan', 'lô gan miền bắc',

            // ✅ COMPETITIVE
            'lô gan xosothantai', 'xosothantai lô gan',
            'lô gan tốt nhất', 'lo gan tot nhat',
            'lô gan xskt', 'xskt thống kê lô gan',
            'tốt hơn xosothantai', 'chi tiết nhất',

            // ✅ LONG-TAIL
            'lô gan lâu chưa về', 'lo gan lau chua ve',
            'thống kê số gan', 'so gan xsmb',
            'bảng lô gan miền bắc', 'bang lo gan mien bac',

            // ✅ VARIATIONS
            'ló gan', 'lo khan', 'số lâu chưa về',
            'gan cực đại', 'gan max'
        ],
        url: '/thongke/lo-gan',
        image: OG_IMAGES.thongKe,
        canonical: `${SITE_URL}/thongke/lo-gan`,
        type: 'article',
        priority: 0.85,
        changefreq: 'daily',
        structuredData: {
            type: 'Dataset',
            additionalTypes: ['Article', 'FAQPage']
        }
    },

    /**
     * THỐNG KÊ GIẢI ĐẶC BIỆT
     * PRIMARY: giải đặc biệt (74,000), thống kê giải đặc biệt (8,100)
     * COMPETITIVE: vs xskt
     */
    'giai-dac-biet': {
        title: 'Thống Kê Giải Đặc Biệt XSMB - Nhiều Tính Năng Hơn XSKT | TAODANDEWUKONG.PRO - Miễn Phí 2025',
        description: generateMetaDescription('giai-dac-biet', true),
        keywords: [
            // ✅ PRIMARY
            'giải đặc biệt', 'giai dac biet', 'thống kê giải đặc biệt',
            'giải đặc biệt xsmb', 'giai dac biet xsmb',
            'thống kê giải đặc biệt miền bắc',

            // ✅ COMPETITIVE
            'giải đặc biệt xskt', 'xskt giải đặc biệt',
            'giải đặc biệt tốt nhất', 'giai dac biet tot nhat',
            'nhiều tính năng hơn xskt', 'tốt nhất',

            // ✅ LONG-TAIL
            'thống kê giải đặc biệt theo tuần',
            'giải đặc biệt hôm nay', 'giai dac biet hom nay',
            'bảng giải đặc biệt', 'bang giai dac biet',
            'phân tích giải đặc biệt', 'phan tich giai dac biet',

            // ✅ VARIATIONS
            'gải đặc biệt', 'giải đắc biệt',
            'giai đac biet', 'giai đắc biệt'
        ],
        url: '/thongke/giai-dac-biet',
        image: OG_IMAGES.thongKe,
        canonical: `${SITE_URL}/thongke/giai-dac-biet`,
        type: 'article',
        priority: 0.88,
        changefreq: 'daily',
        structuredData: {
            type: 'Dataset',
            additionalTypes: ['Article', 'FAQPage']
        }
    },

    /**
     * THỐNG KÊ TẦN SUẤT LÔ TÔ
     * PRIMARY: tần suất lô tô (1,600)
     * COMPETITIVE: vs các trang thống kê khác
     */
    'tan-suat-loto': {
        title: 'Thống Kê Tần Suất Lô Tô XSMB - Phân Tích Sâu Hơn Đối Thủ | Số Nóng Số Lạnh - Miễn Phí 2025',
        description: 'Thống kê tần suất lô tô (00-99) Xổ số Miền Bắc với phân tích chi tiết số nóng số lạnh. So sánh với đối thủ: Cập nhật nhanh hơn, miễn phí 100%, biểu đồ trực quan. Dữ liệu chính xác từ 30 đến 365 ngày.',
        keywords: [
            // ✅ PRIMARY
            'tần suất lô tô', 'tan suat lo to', 'thống kê tần suất',
            'số nóng số lạnh', 'so nong so lanh',
            'tần suất xuất hiện', 'tan suat xuat hien',

            // ✅ COMPETITIVE
            'tần suất lô tô tốt nhất', 'thống kê số nóng tốt hơn',
            'phân tích tần suất chi tiết', 'phan tich tan suat chi tiet',

            // ✅ LONG-TAIL
            'số nào xuất hiện nhiều nhất', 'so nao xuat hien nhieu nhat',
            'số nào ít xuất hiện', 'so nao it xuat hien',
            'bảng tần suất loto', 'bang tan suat loto'
        ],
        url: '/thongke/tan-suat-loto',
        image: OG_IMAGES.thongKe,
        canonical: `${SITE_URL}/thongke/tan-suat-loto`,
        type: 'article',
        priority: 0.82,
        changefreq: 'daily',
        structuredData: {
            type: 'Dataset',
            additionalTypes: ['Article', 'FAQPage']
        }
    },

    /**
     * THỐNG KÊ TẦN SUẤT LÔ CẶP
     * PRIMARY: tần suất lô cặp (320)
     * COMPETITIVE: Unique feature
     */
    'tan-suat-locap': {
        title: 'Thống Kê Tần Suất Lô Cặp XSMB - Công Cụ Độc Quyền | Phân Tích XX-YY - Miễn Phí 2025',
        description: 'Thống kê tần suất lô cặp (XX-YY) Xổ số Miền Bắc với phân tích độc đáo. Tính năng độc quyền: Số lần xuất hiện riêng lẻ XX và YY, phần trăm tổng thể. Cập nhật hàng ngày, miễn phí 100%.',
        keywords: [
            // ✅ PRIMARY
            'tần suất lô cặp', 'tan suat lo cap', 'thống kê lô cặp',
            'lô cặp', 'lo cap', 'cặp số loto',

            // ✅ FEATURES
            'tần suất lô cặp xx yy', 'phan tich lo cap chi tiet',
            'bảng tần suất lô cặp', 'bang tan suat lo cap',
            'số lần xuất hiện riêng lẻ', 'so lan xuat hien rieng le',

            // ✅ UNIQUE
            'tính năng độc quyền', 'cong cu doc quyen',
            'phân tích cặp số', 'phan tich cap so'
        ],
        url: '/thongke/tan-suat-locap',
        image: OG_IMAGES.thongKe,
        canonical: `${SITE_URL}/thongke/tan-suat-locap`,
        type: 'article',
        priority: 0.80,
        changefreq: 'daily',
        structuredData: {
            type: 'Dataset',
            additionalTypes: ['Article', 'FAQPage']
        }
    },

    /**
     * THỐNG KÊ GIẢI ĐẶC BIỆT THEO TUẦN
     * PRIMARY: giải đặc biệt theo tuần (590)
     * COMPETITIVE: Unique calendar view
     */
    'giai-dac-biet-tuan': {
        title: 'Thống Kê Giải Đặc Biệt Theo Tuần - Xem Theo Ngày Trong Tuần | Calendar View - Miễn Phí 2025',
        description: 'Thống kê giải đặc biệt theo tuần với view lịch (Thứ 2-CN). Tính năng độc đáo: Xem giải đặc biệt theo từng ngày trong tuần, chọn tháng/năm. Phân tích xu hướng, toggle hiển thị thông tin chi tiết.',
        keywords: [
            // ✅ PRIMARY
            'giải đặc biệt theo tuần', 'giai dac biet theo tuan',
            'thống kê theo tuần', 'thong ke theo tuan',
            'giải đặc biệt tuần này', 'giai dac biet tuan nay',

            // ✅ FEATURES
            'xem theo ngày trong tuần', 'xem theo tuan',
            'giải đặc biệt thứ 2', 'giai dac biet thu 2',
            'giải đặc biệt chủ nhật', 'giai dac biet chu nhat',

            // ✅ UNIQUE
            'calendar view', 'view lịch',
            'chọn tháng năm', 'toggle thông tin'
        ],
        url: '/thongke/giai-dac-biet-tuan',
        image: OG_IMAGES.thongKe,
        canonical: `${SITE_URL}/thongke/giai-dac-biet-tuan`,
        type: 'article',
        priority: 0.78,
        changefreq: 'daily',
        structuredData: {
            type: 'Dataset',
            additionalTypes: ['Article', 'FAQPage']
        }
    },

    /**
     * KẾT QUẢ XỔ SỐ MIỀN BẮC
     * PRIMARY: xsmb (673,000), kết quả xổ số miền bắc (201,000)
     * SECONDARY: danh sách kết quả xổ số (8,100), xổ số mb (246,000)
     * COMPETITIVE: vs xosodaiphat, xoso.com.vn, xskt.com.vn, xsmn.mobi, az24.vn
     * ENHANCED: Tối ưu với keywords variations, time-based, competitive
     */
    'kqxs': {
        title: 'XSMB - Kết Quả Xổ Số Miền Bắc Hôm Nay | SXMB - KQXSMB - XSTD Nhanh Nhất 2025',
        description: 'XSMB - Kết quả xổ số miền Bắc (xsmb, sxmb, kqxsmb, xstd) hôm nay nhanh nhất, chính xác nhất. Tường thuật trực tiếp lúc 18h15 từ trường quay. Xem XSMB 30 ngày, XSMB hôm qua, XSMB theo thứ. Tốt hơn xosodaiphat, xoso.com.vn, xskt.com.vn. Miễn phí 100%!',
        keywords: [
            // ✅ PRIMARY KEYWORDS - Từ khóa chính volume cao
            'xsmb', 'XSMB', 'xs mb', 'xổ số mb',
            'kết quả xổ số miền bắc', 'ket qua xo so mien bac',
            'sxmb', 'SXMB', 'sx mb',
            'kqxsmb', 'KQXSMB', 'kq xsmb', 'kqxs mb',
            'xstd', 'XSTD', 'xổ số thủ đô',
            'xo so mien bac', 'xổ số miền bắc',
            'danh sách kết quả xổ số', 'danh sach ket qua xo so',
            'kqxs', 'kq xs', 'ket qua xo so',

            // ✅ TIME-BASED KEYWORDS - Theo thời gian
            'xsmb hôm nay', 'xsmb hom nay', 'XSMB hôm nay',
            'xsmb 30 ngày', 'xsmb 30 ngay', 'XSMB 30 ngày',
            'xsmb hôm qua', 'xsmb hom qua', 'XSMB hôm qua',
            'xsmb 90 ngày', 'xsmb 90 ngay',
            'xsmb ngày hôm nay', 'xsmb ngay hom nay',
            'kết quả xsmb hôm nay', 'ket qua xsmb hom nay',
            
            // ✅ DAY-OF-WEEK KEYWORDS - Theo thứ trong tuần
            'xsmb thứ 2', 'xsmb thu 2', 'XSMB thứ 2', 'xsmb thứ hai',
            'xsmb thứ 3', 'xsmb thu 3', 'XSMB thứ 3', 'xsmb thứ ba',
            'xsmb thứ 4', 'xsmb thu 4', 'XSMB thứ 4', 'xsmb thứ tư',
            'xsmb thứ 5', 'xsmb thu 5', 'XSMB thứ 5', 'xsmb thứ năm', 'xsmb thu 5',
            'xsmb thứ 6', 'xsmb thu 6', 'XSMB thứ 6', 'xsmb thứ sáu',
            'xsmb thứ 7', 'xsmb thu 7', 'XSMB thứ 7', 'xsmb thứ bảy',
            'xsmb chủ nhật', 'xsmb chu nhat', 'XSMB chủ nhật',
            
            // ✅ DATE-SPECIFIC KEYWORDS - Theo ngày cụ thể
            'xsmb 30/10', 'xsmb 31/10', 'xsmb hôm nay 30/10',
            'kết quả xsmb 30/10', 'ket qua xsmb 30/10',
            
            // ✅ ACTION KEYWORDS - Hành động
            'xsmb trực tiếp', 'xsmb truc tiep', 'XSMB trực tiếp',
            'tường thuật xsmb', 'tuong thuat xsmb',
            'xem xsmb trực tiếp', 'xem xsmb truc tiep',
            'kết quả xsmb trực tiếp', 'ket qua xsmb truc tiep',
            'xsmb tường thuật', 'xsmb tuong thuat',
            'quay số xsmb', 'quay so xsmb',
            
            // ✅ COMPETITIVE KEYWORDS - Đối thủ cạnh tranh
            // XOSODAIPHAT
            'xsmb xosodaiphat', 'xosodaiphat xsmb',
            'xsmb tốt hơn xosodaiphat', 'xsmb tot hon xosodaiphat',
            'xosodaiphat.com xsmb',
            
            // XOSO.COM.VN
            'xsmb xoso', 'xoso.com.vn xsmb',
            'xsmb tốt hơn xoso', 'xsmb tot hon xoso',
            'kết quả xsmb xoso', 'ket qua xsmb xoso',
            
            // XSKT.COM.VN
            'xsmb xskt', 'xskt.com.vn xsmb',
            'xsmb tốt hơn xskt', 'xsmb tot hon xskt',
            'kết quả xsmb xskt', 'ket qua xsmb xskt',
            
            // XSMN.MOBI
            'xsmb xsmn.mobi', 'xsmn.mobi xsmb',
            'xsmb tốt hơn xsmn.mobi', 'xsmb tot hon xsmn.mobi',
            
            // AZ24.VN
            'xsmb az24', 'az24.vn xsmb',
            'xsmb tốt hơn az24', 'xsmb tot hon az24',
            
            // COMPARISON
            'xsmb nào tốt nhất', 'xsmb nao tot nhat',
            'kết quả xsmb tốt nhất', 'ket qua xsmb tot nhat',
            'xsmb nhanh nhất', 'xsmb nhanh nhat',
            'xsmb chính xác nhất', 'xsmb chinh xac nhat',
            
            // ✅ LONG-TAIL KEYWORDS
            'xem kết quả xổ số hôm nay', 'xem ket qua xo so hom nay',
            'kết quả xổ số miền bắc mới nhất', 'ket qua xo so mien bac moi nhat',
            'danh sách kết quả xsmb', 'danh sach ket qua xsmb',
            'bảng kết quả xổ số miền bắc', 'bang ket qua xo so mien bac',
            'kết quả xsmb hôm nay chi tiết', 'ket qua xsmb hom nay chi tiet',
            'xem xsmb hôm nay', 'xem xsmb hom nay',
            
            // ✅ VARIATIONS - Biến thể
            // Missing diacritics
            'xsmb', 'ket qua xo so mien bac', 'xo so mien bac',
            'sxmb', 'kqxsmb', 'xstd',
            
            // Spacing variations
            'xsmb', 'xs-mb', 'xs_mb', 'xs mb',
            'kq-xsmb', 'kq_xsmb', 'kq xsmb',
            'xo-so-mien-bac', 'xo_so_mien_bac',
            
            // No space
            'xsmb', 'sxmb', 'kqxsmb', 'xstd',
            'xosomienbac', 'ketquaxoso',
            
            // Mixed case
            'XSMB', 'XSMb', 'XsMb', 'xsMB',
            
            // ✅ LOCATION KEYWORDS
            'xsmb hà nội', 'xsmb ha noi', 'XSMB Hà Nội',
            'xổ số hà nội', 'xo so ha noi',
            'xổ số thủ đô', 'xo so thu do',
            'xskmb', 'xổ số kiến thiết miền bắc',
            
            // ✅ STATISTICAL KEYWORDS
            'thống kê xsmb', 'thong ke xsmb',
            'thống kê giải đặc biệt xsmb', 'thong ke giai dac biet xsmb',
            'xsmb lo gan', 'xsmb lô gan',
            'xsmb quay thử', 'xsmb quay thu',
            
            // ✅ BRAND VARIATIONS
            'taodandewukong xsmb', 'wukong xsmb',
            'taodandewukong.pro xsmb', 'kết quả xsmb wukong',
            'dan de wukong xsmb',
            
            // ✅ REGIONAL
            'kết quả xổ số 3 miền', 'ket qua xo so 3 mien',
            'xsmb xsmn xsmt', 'kết quả xổ số đầy đủ',
            'xổ số 3 miền', 'xo so 3 mien',
            
            // ✅ ACCURACY KEYWORDS
            'xsmb chính xác', 'xsmb chinh xac',
            'kết quả xsmb nhanh nhất', 'ket qua xsmb nhanh nhat',
            'xsmb cập nhật nhanh', 'xsmb cap nhat nhanh',
            
            // ✅ FREE KEYWORDS
            'xsmb miễn phí', 'xsmb mien phi',
            'kết quả xsmb miễn phí', 'ket qua xsmb mien phi',
            'xem xsmb miễn phí', 'xem xsmb mien phi'
        ],
        url: '/kqxs',
        image: OG_IMAGES.default,
        canonical: `${SITE_URL}/kqxs`,
        type: 'website',
        priority: 0.95,
        changefreq: 'daily',
        structuredData: {
            type: 'Article',
            additionalTypes: ['FAQPage', 'CollectionPage']
        }
    },

    /**
     * VẼ ĐƯỜNG CẦU SOI CẦU MIỀN BẮC
     * Primary Keywords: vẽ đường cầu, ve duong cau, soi cầu miền bắc, vẽ cầu xổ số
     */
    'soi-cau-bac-cau': {
        title: 'Vẽ Đường Cầu Soi Cầu Miền Bắc | Phân Tích Định Vị Chính Xác Từng Chữ Số - Miễn Phí 2025',
        description: 'Công cụ vẽ đường cầu soi cầu miền bắc với định vị chính xác từng chữ số trong mỗi ô. Phân tích pattern, vẽ đường cầu kết nối, tìm quy luật số. Miễn phí 100%, cập nhật realtime!',
        keywords: [
            // Primary
            'vẽ đường cầu', 've duong cau', 'vẽ đường cầu soi cầu',
            'soi cầu miền bắc', 'soi cau mien bac', 'vẽ cầu xổ số',
            'vẽ đường cầu XSMB', 've duong cau XSMB',
            
            // Long-tail
            'vẽ đường cầu soi cầu miền bắc', 've duong cau soi cau mien bac',
            'công cụ vẽ đường cầu', 'cong cu ve duong cau',
            'phân tích đường cầu xổ số', 'phan tich duong cau xo so',
            'vẽ cầu định vị chính xác', 've cau dinh vi chinh xac',
            
            // Method
            'vẽ đường cầu theo vị trí', 've duong cau theo vi tri',
            'phân tích pattern đường cầu', 'phan tich pattern duong cau',
            'tìm quy luật đường cầu', 'tim quy luat duong cau',
            
            // Brand
            'vẽ đường cầu wukong', 've duong cau wukong',
            'wukong vẽ đường cầu', 'wukong ve duong cau'
        ],
        url: '/soi-cau-bac-cau',
        image: `${SITE_URL}/imgs/wukong.png`,
        canonical: `${SITE_URL}/soi-cau-bac-cau`,
        type: 'article',
        priority: 0.88,
        changefreq: 'daily',
        structuredData: {
            type: 'WebApplication',
            additionalTypes: ['HowTo', 'FAQPage']
        }
    },

    /**
     * SOI CẦU ĐẶC BIỆT MIỀN BẮC
     * Primary Keywords: soi cầu đặc biệt miền bắc, soi cau dac biet mien bac, dự đoán giải đặc biệt
     */
    'soi-cau-vi-tri': {
        title: 'Soi Cầu Đặc Biệt Miền Bắc Theo Vị Trí Số | Phân Tích Pattern Dự Đoán XSMB - Miễn Phí 2025',
        description: 'Công cụ soi cầu đặc biệt miền bắc dựa trên phân tích vị trí số trong kết quả xổ số. Tìm kiếm pattern nhất quán để dự đoán 2 số cuối giải đặc biệt XSMB. Miễn phí 100%!',
        keywords: [
            // Primary
            'soi cầu đặc biệt miền bắc', 'soi cau dac biet mien bac',
            'soi cầu đặc biệt XSMB', 'soi cau dac biet XSMB',
            'dự đoán giải đặc biệt', 'du doan giai dac biet',
            'soi cầu vị trí', 'soi cau vi tri',
            
            // Long-tail
            'soi cầu đặc biệt miền bắc hôm nay', 'soi cau dac biet mien bac hom nay',
            'dự đoán giải đặc biệt XSMB', 'du doan giai dac biet XSMB',
            'phân tích vị trí số giải đặc biệt', 'phan tich vi tri so giai dac biet',
            'tìm pattern giải đặc biệt', 'tim pattern giai dac biet',
            
            // Method
            'soi cầu theo vị trí số', 'soi cau theo vi tri so',
            'phân tích pattern giải đặc biệt', 'phan tich pattern giai dac biet',
            
            // Brand
            'soi cầu đặc biệt wukong', 'soi cau dac biet wukong',
            'wukong soi cầu đặc biệt', 'wukong soi cau dac biet'
        ],
        url: '/soi-cau-vi-tri',
        image: `${SITE_URL}/imgs/wukong.png`,
        canonical: `${SITE_URL}/soi-cau-vi-tri`,
        type: 'article',
        priority: 0.88,
        changefreq: 'daily',
        structuredData: {
            type: 'WebApplication',
            additionalTypes: ['HowTo', 'FAQPage']
        }
    },

    /**
     * SOI CẦU LÔ TÔ
     * Primary Keywords: soi cầu lô tô, soi cau lo to, dự đoán lô tô miền bắc
     */
    'soi-cau-loto': {
        title: 'Soi Cầu Lô Tô Miền Bắc | Dự Đoán Lô Tô XSMB Theo Vị Trí - Miễn Phí 2025',
        description: 'Công cụ soi cầu lô tô miền bắc dựa trên phân tích vị trí số. Dự đoán lô tô XSMB chính xác, tìm pattern nhất quán. Miễn phí 100%!',
        keywords: [
            // Primary
            'soi cầu lô tô', 'soi cau lo to', 'soi cầu lô tô miền bắc',
            'dự đoán lô tô', 'du doan lo to', 'soi cầu lô tô XSMB',
            
            // Long-tail
            'soi cầu lô tô miền bắc hôm nay', 'soi cau lo to mien bac hom nay',
            'dự đoán lô tô XSMB', 'du doan lo to XSMB',
            'phân tích lô tô theo vị trí', 'phan tich lo to theo vi tri',
            
            // Brand
            'soi cầu lô tô wukong', 'soi cau lo to wukong',
            'wukong soi cầu lô tô', 'wukong soi cau lo to'
        ],
        url: '/soi-cau-loto',
        image: `${SITE_URL}/imgs/wukong.png`,
        canonical: `${SITE_URL}/soi-cau-loto`,
        type: 'article',
        priority: 0.85,
        changefreq: 'daily',
        structuredData: {
            type: 'WebApplication',
            additionalTypes: ['HowTo', 'FAQPage']
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

