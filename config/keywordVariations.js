/**
 * Keyword Variations Manager
 * Quản lý tất cả biến thể từ khóa cho SEO
 * Bao gồm: có dấu, không dấu, sai chính tả, spacing variations
 * 
 * Mục tiêu: Tối ưu tìm kiếm trên Google, Bing, Cốc Cốc với mọi cách gõ của người dùng
 */

/**
 * Hàm tạo tất cả biến thể của một keyword
 * @param {string} base - Từ khóa gốc
 * @returns {Array} - Mảng tất cả biến thể
 */
function generateAllVariations(base) {
    const variations = new Set([base]);

    // Thêm version không dấu
    const noDiacritics = removeDiacritics(base);
    if (noDiacritics !== base) {
        variations.add(noDiacritics);
    }

    // Thêm version không space
    variations.add(base.replace(/\s+/g, ''));
    variations.add(noDiacritics.replace(/\s+/g, ''));

    // Thêm version hyphen thay vì space
    variations.add(base.replace(/\s+/g, '-'));
    variations.add(noDiacritics.replace(/\s+/g, '-'));

    // Thêm version underscore thay vì space
    variations.add(base.replace(/\s+/g, '_'));
    variations.add(noDiacritics.replace(/\s+/g, '_'));

    return Array.from(variations);
}

/**
 * Loại bỏ dấu tiếng Việt
 */
function removeDiacritics(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D');
}

/**
 * BRAND KEYWORDS - Từ khóa thương hiệu
 * Tất cả biến thể của "tạo dàn đề wukong"
 */
const BRAND_KEYWORDS = {
    primary: [
        'tạo dàn đề wukong',
        'tạo dàn đề wu kong',
        'tạo dan đề wukong',
        'tạo dàn de wukong',
    ],
    noDiacritics: [
        'tao dan de wukong',
        'tao dan de wu kong',
        'tao dan đe wukong',
        'tao dàn de wukong',
    ],
    noSpace: [
        'taodandewukong',
        'taodandewukong.pro',
        'taodandewuKong',
        'taoDanDeWukong',
    ],
    hyphenated: [
        'tao-dan-de-wukong',
        'tao-dan-de-wu-kong',
        'tạo-dàn-đề-wukong',
    ],
    misspellings: [
        // Sai chính tả phổ biến
        'tạo dan de wukong',
        'tao dàn đề wukong',
        'tạo dàn đê wukong',
        'tao dan đe wukong',
        'taodande wukong',
        'tao dande wukong',
        'tạo đàn đề wukong',
        'tao dan de vukong',
        'tạo dàn đề ukong',

        // Thiếu chữ
        'tao dan wukong',
        'tạo dàn wukong',
        'dan de wukong',

        // Viết liền một phần
        'taodande wukong',
        'tao dande wukong',
        'taodàn đề wukong',

        // Mixed dấu
        'tạo dan dề wukong',
        'tao dàn de wukong',
        'tạo đan de wukong',
    ],
    withDomain: [
        'taodandewukong pro',
        'taodandewukong.pro',
        'www.taodandewukong.pro',
        'web tạo dàn đề wukong',
        'website tao dan de wukong',
    ]
};

/**
 * CORE PRODUCT KEYWORDS - Từ khóa sản phẩm chính
 */
const PRODUCT_KEYWORDS = {
    // Tạo dàn đề
    taoDanDe: [
        'tạo dàn đề',
        'tao dan de',
        'tạo dan đề',
        'tao dàn de',
        'tạo đàn đề',
        'taodande',
        'tao-dan-de',
        'tạo-dàn-đề',

        // Với "online"
        'tạo dàn đề online',
        'tao dan de online',
        'tạo dàn đề trực tuyến',

        // Với "miễn phí"
        'tạo dàn đề miễn phí',
        'tao dan de mien phi',
        'tạo dàn đề free',
    ],

    // Tạo dàn số
    taoDanSo: [
        'tạo dàn số',
        'tao dan so',
        'tạo dan số',
        'tao dàn so',
        'tạo đàn số',
        'taodanso',

        'tạo dàn số online',
        'tao dan so online',
        'tạo dàn số miễn phí',
    ],

    // Tạo mức số
    taoMucSo: [
        'tạo mức số',
        'tao muc so',
        'tạo muc số',
        'tao mức so',
        'taomucso',

        'ứng dụng mức số',
        'ung dung muc so',
        'app mức số',
    ],

    // Dàn đề variants
    danDe: [
        'dàn đề',
        'dan de',
        'dàn de',
        'dan đề',
        'đàn đề',
        'dande',

        // With numbers
        'dàn đề 2d',
        'dan de 2d',
        'dàn đề 3d',
        'dàn đề 4d',
        'dàn đề 9x0x',
        'dan de 9x0x',

        // With actions
        'tạo dàn đề',
        'ghép dàn đề',
        'lọc dàn đề',
        'nuôi dàn đề',
    ],

    // Lô đề, lô tô variants
    loDe: [
        'lô đề',
        'lo de',
        'lô de',
        'lo đề',
        'ló đề',
        'ló tô',
        'lô tô',
        'lo to',
        'loto',
        'lotô',

        // Misspellings
        'lo đe',
        'lô đe',
        'ló đe',
    ],

    // Dàn 9x-0x
    dan9x0x: [
        'dàn 9x0x',
        'dan 9x0x',
        'dàn 9x-0x',
        'dan 9x-0x',
        'dàn 9x 0x',

        'dàn 9x',
        'dan 9x',
        'dàn 0x',
        'dan 0x',

        'tạo dàn 9x0x',
        'tao dan 9x0x',
        'tạo dàn 9x-0x',
    ],

    // Dàn 2D
    dan2d: [
        'dàn 2d',
        'dan 2d',
        'dàn 2D',
        'dan2d',

        'dàn đề 2d',
        'dan de 2d',
        'dàn số 2d',

        'tạo dàn 2d',
        'tao dan 2d',
    ],

    // Dàn 3D/4D
    dan3d4d: [
        'dàn 3d',
        'dan 3d',
        'dàn 4d',
        'dan 4d',
        'dàn 3d4d',
        'dan 3d4d',

        'dàn 3 càng',
        'dan 3 cang',
        'dàn 4 càng',

        'tạo dàn 3d',
        'tao dan 3d',
        'tạo dàn de 3d',
    ]
};

/**
 * FEATURE KEYWORDS - Từ khóa tính năng
 */
const FEATURE_KEYWORDS = {
    // Lọc ghép dàn
    locGhep: [
        'lọc ghép dàn đề',
        'loc ghep dan de',
        'lọc ghép dàn',
        'loc ghep dan',
        'lọc dàn đề',
        'ghép dàn đề',

        'lọc ghép số',
        'loc ghep so',
        'ghép dàn số',
    ],

    // Lấy nhanh
    layNhanh: [
        'lấy nhanh dàn đề',
        'lay nhanh dan de',
        'lấy nhanh dàn số',
        'lay nhanh dan so',
        'tạo dàn nhanh',
        'tao dan nhanh',
    ],

    // Nuôi dàn
    nuoiDan: [
        'nuôi dàn đề',
        'nuoi dan de',
        'nuôi dàn',
        'nuoi dan',
        'nuôi dàn khung',
        'nuoi dan khung',

        'nuôi dàn 3 ngày',
        'nuôi dàn 5 ngày',
        'nuôi dàn khung 3 ngày',
    ],

    // Soi cầu
    soiCau: [
        'soi cầu',
        'soi cau',
        'soi cầu lô đề',
        'soi cau lo de',
        'soi cầu xổ số',
        'soi cau xo so',

        'soi cầu miền bắc',
        'soi cầu mb',
        'soi cầu mn',
        'soi cầu mt',
    ],

    // Thống kê
    thongKe: [
        'thống kê xổ số',
        'thong ke xo so',
        'thống kê 3 miền',
        'thong ke 3 mien',

        'thống kê lô đề',
        'thong ke lo de',
        'bảng thống kê',
        'bang thong ke',
    ],

    // Ghép xiên
    ghepXien: [
        'ghép xiên',
        'ghep xien',
        'ghép lô xiên',
        'ghep lo xien',
        'xiên quay',
        'xien quay',

        'ghép lotto',
        'ghep lotto',
        'xiên 2',
        'xiên 3',
        'xiên 4',
    ]
};

/**
 * SEARCH ENGINE SPECIFIC KEYWORDS
 * Từ khóa tối ưu riêng cho từng search engine
 */
const SEARCH_ENGINE_KEYWORDS = {
    // Google - Long-tail questions
    google: [
        'cách tạo dàn đề hiệu quả',
        'tạo dàn đề như thế nào',
        'app tạo dàn đề nào tốt',
        'web tạo dàn đề uy tín',
        'công cụ tạo dàn đề chuyên nghiệp',
        'phần mềm tạo dàn đề miễn phí',
    ],

    // Bing - More formal queries
    bing: [
        'ứng dụng tạo dàn đề',
        'phần mềm tạo mức số',
        'công cụ lô đề online',
        'hệ thống tạo dàn số',
        'giải pháp tạo dàn đề',
    ],

    // Cốc Cốc - Vietnamese-specific
    coccoc: [
        'tạo dàn đề việt nam',
        'app tạo dàn đề tiếng việt',
        'web tạo dàn đề vn',
        'công cụ lô đề việt',
        'tạo dàn số miền bắc',
        'tạo dàn số 3 miền',
    ]
};

/**
 * LOCATION KEYWORDS - Từ khóa theo vị trí
 */
const LOCATION_KEYWORDS = {
    vietnam: [
        'tạo dàn đề việt nam',
        'tao dan de viet nam',
        'tạo dàn đề vn',
        'tao dan de vn',
    ],

    regions: [
        'tạo dàn đề miền bắc',
        'tạo dàn đề miền nam',
        'tạo dàn đề miền trung',
        'tao dan de mien bac',
        'tao dan de mien nam',
        'tao dan de mien trung',

        'xổ số miền bắc',
        'xổ số miền nam',
        'xổ số miền trung',
        'xs mb',
        'xs mn',
        'xs mt',
        'xsmb',
        'xsmn',
        'xsmt',
    ]
};

/**
 * COMPETITOR KEYWORDS - Từ khóa đối thủ
 */
const COMPETITOR_KEYWORDS = [
    'kangdh',
    'kang dh',
    'taodanxoso',
    'tao dan xo so',
    'giai ma so hoc',
    'giải mã số học',
    'dan de pro',
    'dande pro',
];

/**
 * YEAR-BASED KEYWORDS - Từ khóa theo năm
 */
const YEAR_KEYWORDS = [
    'tạo dàn đề 2025',
    'tao dan de 2025',
    'tạo dàn đề mới nhất',
    'tao dan de moi nhat',
    'tạo dàn đề hôm nay',
    'tao dan de hom nay',
];

/**
 * ⭐ PAGE-SPECIFIC KEYWORD VARIATIONS ⭐
 * Kết hợp BRAND + FEATURE cho TỪNG PAGE cụ thể
 * Bao quát MỌI CÁCH GÕ có thể của người dùng
 */
const PAGE_SPECIFIC_KEYWORDS = {
    /**
     * DÀN 9X-0X PAGE - Brand + 9x0x variations
     */
    dan9x0x: [
        // ✅ Có dấu
        'tạo dàn đề wukong 9x0x', 'tạo dàn wukong 9x0x', 'dàn đề wukong 9x0x',
        'tạo dàn đề wukong 9x-0x', 'dàn wukong 9x0x',

        // ✅ Không dấu
        'tao dan de wukong 9x0x', 'tao dan wukong 9x0x', 'dan de wukong 9x0x',
        'tao dan wukong 9x-0x', 'dan wukong 9x0x',

        // ✅ Viết liền (NO SPACE) - Người dùng hay gõ
        'taodandewukong9x0x', 'taodandewukong 9x0x',
        'taodanwukong9x0x', 'taodanwukong 9x0x',
        'taodande9x0x', 'taodan9x0x', 'taodan9x',
        'wukong9x0x', 'wukong9x',

        // ✅ Partial spacing
        'tao dan wukong9x0x', 'tao danwukong 9x0x',
        'taodande wukong 9x0x', 'tao dande wukong9x0x',

        // ✅ Hyphen variations
        'tao-dan-de-wukong-9x0x', 'tao-dan-wukong-9x0x',

        // ✅ Shortened/Viết tắt
        'tao dan wukong 9x', 'tao dan 9x0x', 'taodanwukong9x',
        'wukong 9x0x', 'wukong 9x', '9x0x wukong', '9x wukong',

        // ✅ Mixed diacritics (lẫn dấu)
        'tạo dan wukong 9x0x', 'tao dàn wukong 9x0x',
        'tạo dàn wukong9x0x', 'tao dan de wukong9x0x',

        // ✅ With modifiers
        'tạo dàn wukong 9x0x online', 'tao dan wukong 9x0x online',
        'tạo dàn 9x0x wukong miễn phí', 'tao dan 9x0x wukong',
    ],

    /**
     * DÀN 2D PAGE - Brand + 2d variations
     */
    dan2d: [
        // ✅ Có dấu
        'tạo dàn đề wukong 2d', 'tạo dàn 2d wukong', 'dàn đề 2d wukong',
        'dàn 2d wukong', 'tạo dàn lô đề 2d wukong',

        // ✅ Không dấu
        'tao dan de wukong 2d', 'tao dan 2d wukong', 'dan de 2d wukong',
        'dan 2d wukong', 'tao dan lo de 2d wukong',

        // ✅ Viết liền
        'taodandewukong2d', 'taodandewukong 2d',
        'taodanwukong2d', 'taodanwukong 2d',
        'taodande2d', 'taodan2d',
        'wukong2d',

        // ✅ Partial spacing
        'tao dan wukong2d', 'tao danwukong 2d',
        'taodande wukong 2d', 'tao dande wukong2d',

        // ✅ Shortened
        'tao dan wukong 2d', 'taodan2d wukong',
        'wukong 2d', '2d wukong',

        // ✅ Mixed
        'tạo dan wukong 2d', 'tao dàn wukong 2d',
        'tạo dàn wukong2d',

        // ✅ With lô đề
        'lô đề 2d wukong', 'lo de 2d wukong', 'lode2d wukong',
    ],

    /**
     * DÀN 3D-4D PAGE - Brand + 3d/4d variations
     */
    dan3d4d: [
        // ✅ 3D variations
        'tạo dàn đề wukong 3d', 'tao dan de wukong 3d', 'taodandewukong3d',
        'taodanwukong3d', 'taodande3d', 'taodan3d', 'wukong3d', 'wukong 3d',
        'dàn 3d wukong', 'dan 3d wukong', '3d wukong',

        // ✅ 4D variations
        'tạo dàn đề wukong 4d', 'tao dan de wukong 4d', 'taodandewukong4d',
        'taodanwukong4d', 'taodande4d', 'taodan4d', 'wukong4d', 'wukong 4d',
        'dàn 4d wukong', 'dan 4d wukong', '4d wukong',

        // ✅ 3D4D combined
        'tạo dàn 3d4d wukong', 'tao dan 3d4d wukong',
        'taodanwukong3d4d', 'taodan3d4d', 'wukong 3d4d', 'wukong3d4d',

        // ✅ 3 càng / 4 càng
        'tạo dàn 3 càng wukong', 'tao dan 3 cang wukong',
        'tạo dàn 4 càng wukong', 'tao dan 4 cang wukong',
        '3 cang wukong', '4 cang wukong',
    ],

    /**
     * DÀN ĐẶC BIỆT PAGE
     */
    danDacBiet: [
        'tạo dàn đặc biệt wukong', 'tao dan dac biet wukong',
        'dàn đặc biệt wukong', 'dan dac biet wukong',
        'taodandacbietwukong', 'taodandacbiet wukong',
        'lọc ghép dàn wukong', 'loc ghep dan wukong',
        'lọc ghép dàn đề wukong', 'locghepdan wukong',
        'lấy nhanh dàn đề wukong', 'lay nhanh dan de wukong',
        'dàn 36 số wukong', 'dan 36 so wukong',
        'dàn 50 số wukong', 'dan50so wukong',
        'wukong dac biet', 'wukong đặc biệt',
    ],

    /**
     * THỐNG KÊ PAGE
     */
    thongKe: [
        'thống kê wukong', 'thong ke wukong',
        'thống kê xổ số wukong', 'thong ke xo so wukong',
        'thống kê 3 miền wukong', 'thong ke 3 mien wukong',
        'thongkewukong', 'thongke wukong',
        'wukong thong ke', 'wukong thống kê',
        'tk wukong', 'tkxs wukong',
    ],

    /**
     * GHÉP LÔ XIÊN PAGE
     */
    ghepLoXien: [
        'ghép lô xiên wukong', 'ghep lo xien wukong',
        'ghép xiên wukong', 'ghep xien wukong',
        'xiên quay wukong', 'xien quay wukong',
        'gheploxienwukong', 'ghepxienwukong',
        'ghép lotto wukong', 'ghep lotto wukong',
        'wukong xien', 'wukong xiên', 'wukong lotto',
    ]
};

/**
 * Hàm lấy tất cả keywords cho một page
 * ✅ Enhanced với PAGE_SPECIFIC_KEYWORDS
 */
function getAllKeywordsForPage(pageType) {
    let keywords = [];

    // ✅ 1. BRAND KEYWORDS (common for all pages)
    keywords.push(
        ...BRAND_KEYWORDS.primary.slice(0, 10),
        ...BRAND_KEYWORDS.noDiacritics.slice(0, 10),
        ...BRAND_KEYWORDS.noSpace.slice(0, 8),
        ...BRAND_KEYWORDS.misspellings.slice(0, 15)
    );

    // ✅ 2. PAGE-SPECIFIC KEYWORDS (Brand + Feature Combined) - MỚI!
    if (PAGE_SPECIFIC_KEYWORDS[pageType]) {
        keywords.push(...PAGE_SPECIFIC_KEYWORDS[pageType]);
    }

    // ✅ 3. PRODUCT & FEATURE KEYWORDS (specific to page type)
    switch (pageType) {
        case 'home':
            keywords.push(
                ...PRODUCT_KEYWORDS.taoDanSo,
                ...PRODUCT_KEYWORDS.taoMucSo,
                ...PRODUCT_KEYWORDS.loDe,
                ...FEATURE_KEYWORDS.locGhep.slice(0, 5),
                ...FEATURE_KEYWORDS.nuoiDan.slice(0, 5),
                ...SEARCH_ENGINE_KEYWORDS.google,
                ...SEARCH_ENGINE_KEYWORDS.bing,
                ...SEARCH_ENGINE_KEYWORDS.coccoc,
                ...YEAR_KEYWORDS
            );
            break;

        case 'dan9x0x':
            keywords.push(
                ...PRODUCT_KEYWORDS.dan9x0x,
                ...FEATURE_KEYWORDS.nuoiDan,
                ...FEATURE_KEYWORDS.locGhep
            );
            break;

        case 'dan2d':
            keywords.push(
                ...PRODUCT_KEYWORDS.dan2d,
                ...PRODUCT_KEYWORDS.loDe
            );
            break;

        case 'dan3d4d':
            keywords.push(
                ...PRODUCT_KEYWORDS.dan3d4d
            );
            break;

        case 'danDacBiet':
            keywords.push(
                ...FEATURE_KEYWORDS.locGhep,
                ...FEATURE_KEYWORDS.layNhanh
            );
            break;

        case 'thongKe':
            keywords.push(
                ...FEATURE_KEYWORDS.thongKe,
                ...FEATURE_KEYWORDS.soiCau,
                ...LOCATION_KEYWORDS.regions
            );
            break;

        case 'ghepLoXien':
            keywords.push(
                ...FEATURE_KEYWORDS.ghepXien
            );
            break;
    }

    // Remove duplicates
    return [...new Set(keywords)];
}

/**
 * Hàm tạo meta description với keyword variations
 */
function generateMetaDescription(pageType, includeVariations = true) {
    const descriptions = {
        home: `Tạo dàn đề (tao dan de) online miễn phí 2025. Công cụ tạo dàn số, mức số chuyên nghiệp. Dàn đề 9x-0x, 2D, 3D, 4D. Lọc ghép dàn, nuôi dàn khung 3-5 ngày. ${includeVariations ? 'Hỗ trợ: taodande, tạo dàn số, tao dan so, lô đề, lo de. ' : ''}Miễn phí 100%!`,

        dan9x0x: `Tạo dàn 9x-0x (tao dan 9x0x) ngẫu nhiên. Cắt dàn 9x, lọc dàn 9x, nuôi dàn khung 3 ngày. ${includeVariations ? 'Hỗ trợ: dan 9x0x, dan 9x, tao dan 9x. ' : ''}Thuật toán Fisher-Yates. Miễn phí!`,

        dan2d: `Tạo dàn 2D (tao dan 2d), dàn số 2D (00-99). Bạch thủ, song thủ, lô đá 2D. ${includeVariations ? 'Hỗ trợ: dan 2d, lo de 2d, tao muc so 2d. ' : ''}Lấy nhanh dàn đề đặc biệt!`,

        dan3d4d: `Tạo dàn 3D-4D (tao dan 3d 4d). Tách dàn AB-BC-CD. Ghép lotto 3-4 càng. ${includeVariations ? 'Hỗ trợ: dan 3d, dan 4d, dan 3 cang. ' : ''}Cao thủ xổ số!`,

        thongKe: `Thống kê xổ số 3 miền (thong ke xo so). XSMB, XSMN, XSMT realtime. ${includeVariations ? 'Hỗ trợ: thống kê lô đề, bang thong ke, soi cầu. ' : ''}Chính xác 100%!`
    };

    return descriptions[pageType] || descriptions.home;
}

/**
 * Hàm generate URL patterns cho từng page
 * Giúp search engines hiểu URL structure
 */
function getURLPatternsForPage(pageType) {
    const patterns = {
        home: [
            '/',
            '/tao-dan-de',
            '/tao-dan-de-wukong',
            '/taodandewukong'
        ],
        dan9x0x: [
            '/dan-9x0x',
            '/dan-9x-0x',
            '/tao-dan-9x0x',
            '/tao-dan-wukong-9x0x'
        ],
        dan2d: [
            '/dan-2d',
            '/tao-dan-2d',
            '/tao-dan-wukong-2d'
        ],
        dan3d4d: [
            '/dan-3d4d',
            '/dan-3d',
            '/dan-4d',
            '/tao-dan-3d',
            '/tao-dan-4d'
        ],
        danDacBiet: [
            '/dan-dac-biet',
            '/loc-ghep-dan',
            '/lay-nhanh-dan-de'
        ],
        thongKe: [
            '/thong-ke',
            '/thong-ke-xo-so',
            '/thong-ke-3-mien'
        ],
        ghepLoXien: [
            '/ghep-lo-xien',
            '/ghep-xien',
            '/xien-quay'
        ]
    };

    return patterns[pageType] || [];
}

module.exports = {
    BRAND_KEYWORDS,
    PRODUCT_KEYWORDS,
    FEATURE_KEYWORDS,
    SEARCH_ENGINE_KEYWORDS,
    LOCATION_KEYWORDS,
    COMPETITOR_KEYWORDS,
    YEAR_KEYWORDS,
    PAGE_SPECIFIC_KEYWORDS,
    getAllKeywordsForPage,
    getURLPatternsForPage,
    generateMetaDescription,
    generateAllVariations,
    removeDiacritics
};

