/**
 * SEO Keywords Database - 2025
 * Từ khóa SEO tối ưu cho ngành dàn số, xổ số Việt Nam
 * Tham khảo xu hướng SEO 2025 và chính sách trình duyệt mới nhất
 */

// Primary Keywords - High Volume, High Competition
export const PRIMARY_KEYWORDS = {
    // Main Brand Keywords
    'tạo dàn số': {
        volume: 'high',
        competition: 'high',
        intent: 'commercial',
        longTail: [
            'tạo dàn số online',
            'tạo dàn số miễn phí',
            'tạo dàn số chuyên nghiệp',
            'công cụ tạo dàn số',
            'tạo dàn số 2D',
            'tạo dàn số 3D',
            'tạo dàn số 4D',
            'tạo dàn số đặc biệt'
        ]
    },

    // Lottery Related
    'xổ số': {
        volume: 'very-high',
        competition: 'very-high',
        intent: 'informational',
        longTail: [
            'xổ số miền bắc',
            'xổ số miền nam',
            'xổ số miền trung',
            'kết quả xổ số',
            'thống kê xổ số',
            'xổ số 3 miền',
            'xổ số vietlott',
            'xổ số max 3d',
            'xổ số max 4d'
        ]
    },

    'lô số': {
        volume: 'high',
        competition: 'high',
        intent: 'commercial',
        longTail: [
            'lô số online',
            'cách chơi lô số',
            'thống kê lô số',
            'dàn lô số',
            'tạo dàn lô số',
            'lô số miền bắc',
            'lô số miền nam',
            'lô số miền trung'
        ]
    }
};

// Secondary Keywords - Medium Volume, Medium Competition
export const SECONDARY_KEYWORDS = {
    'dàn 2D': {
        volume: 'medium',
        competition: 'medium',
        intent: 'commercial',
        related: ['dàn số 2 chữ số', 'dàn 00-99', 'tạo dàn 2D', 'dàn 2D miễn phí']
    },

    'dàn 3D': {
        volume: 'medium',
        competition: 'medium',
        intent: 'commercial',
        related: ['dàn số 3 chữ số', 'dàn 000-999', 'tạo dàn 3D', 'dàn 3D chuyên nghiệp']
    },

    'dàn 4D': {
        volume: 'medium',
        competition: 'medium',
        intent: 'commercial',
        related: ['dàn số 4 chữ số', 'dàn 0000-9999', 'tạo dàn 4D', 'dàn 4D cao cấp']
    },

    'dàn đặc biệt': {
        volume: 'medium',
        competition: 'low',
        intent: 'commercial',
        related: ['bộ lọc số', 'lọc dàn số', 'dàn số đặc biệt', 'tạo dàn đặc biệt']
    },

    'thống kê xổ số': {
        volume: 'high',
        competition: 'medium',
        intent: 'informational',
        related: ['thống kê 3 miền', 'bảng thống kê', 'thống kê kết quả', 'phân tích xổ số']
    }
};

// Long-tail Keywords - Low Competition, High Intent
export const LONG_TAIL_KEYWORDS = [
    // High Intent Commercial
    'tạo dàn số online miễn phí 2025',
    'công cụ tạo dàn số chuyên nghiệp nhất',
    'tạo dàn số 2D nhanh nhất',
    'dàn số 3D 4D chính xác 100%',
    'bộ lọc dàn số đặc biệt thông minh',
    'thống kê xổ số 3 miền mới nhất',

    // Problem-solving
    'cách tạo dàn số hiệu quả',
    'phương pháp tạo dàn số chính xác',
    'hướng dẫn tạo dàn số cho người mới',
    'bí quyết tạo dàn số thành công',

    // Location-based
    'tạo dàn số tại Việt Nam',
    'công cụ dàn số cho người Việt',
    'xổ số Việt Nam thống kê',

    // Brand-specific
    'dàn số Wukong',
    'công cụ dàn số Wukong',
    'tạo dàn số thương hiệu Wukong'
];

// LSI Keywords (Latent Semantic Indexing)
export const LSI_KEYWORDS = [
    // Technical Terms
    'thuật toán Fisher-Yates',
    'ngẫu nhiên hóa',
    'rút dần',
    'cấp độ dàn số',
    'phân loại số',
    'bộ lọc thông minh',

    // Lottery Terms
    'giải đặc biệt',
    'giải nhất',
    'giải nhì',
    'giải ba',
    'giải tư',
    'giải năm',
    'giải sáu',
    'giải bảy',
    'giải tám',

    // Number Patterns
    'số kép',
    'số chạm',
    'số đầu',
    'số đuôi',
    'tổng số',
    'hiệu số',
    'chẵn lẻ',
    'lớn nhỏ',

    // Tools & Features
    'miễn phí',
    'nhanh chóng',
    'chính xác',
    'chuyên nghiệp',
    'dễ sử dụng',
    'hỗ trợ mobile',
    'responsive design'
];

// Competitor Keywords Analysis
export const COMPETITOR_KEYWORDS = {
    'taodande.com': [
        'tạo dàn số',
        'dàn số online',
        'công cụ dàn số',
        'dàn số miễn phí'
    ],
    'xoso3mien.com': [
        'xổ số 3 miền',
        'kết quả xổ số',
        'thống kê xổ số',
        'xổ số miền bắc'
    ],
    'lodeonline.com': [
        'lô số online',
        'thống kê lô số',
        'dàn lô số',
        'cách chơi lô số'
    ]
};

// SEO Content Templates
export const SEO_CONTENT_TEMPLATES = {
    title: {
        primary: '{keyword} - {brand} | Miễn Phí 2025',
        secondary: '{keyword} Chuyên Nghiệp | {brand}',
        longTail: '{longTailKeyword} | {brand} - Công Cụ #1 Việt Nam'
    },

    description: {
        primary: 'Bộ công cụ {keyword} chuyên nghiệp hàng đầu Việt Nam. Miễn phí 100%, nhanh chóng, chính xác tuyệt đối. Được hàng ngàn người tin dùng.',
        secondary: 'Tạo {keyword} với thuật toán chuẩn quốc tế. Hỗ trợ mọi thiết bị, giao diện thân thiện. Thương hiệu {brand}.',
        longTail: '{longTailKeyword} với {brand}. Công cụ {keyword} miễn phí, nhanh chóng, chính xác 100%. Hỗ trợ 24/7.'
    }
};

// Page-specific Keywords
export const PAGE_KEYWORDS = {
    home: {
        primary: 'tạo dàn số 9x-0x online',
        secondary: ['tạo dàn số miễn phí', 'công cụ dàn số chuyên nghiệp', 'dàn số 9x-0x', 'dàn số Wukong'],
        longTail: ['tạo dàn số 9x-0x online miễn phí 2025', 'công cụ tạo dàn số chuyên nghiệp nhất', 'tạo dàn số Fisher-Yates', 'dàn số 9x-0x chính xác 100%'],
        lsi: ['xổ số', 'lô số', 'miễn phí', 'chính xác', 'nhanh chóng', 'thuật toán Fisher-Yates', 'dàn số online']
    },

    'dan-2d': {
        primary: 'tạo dàn số 2D (00-99)',
        secondary: ['dàn số 2D', 'dàn 2D miễn phí', 'công cụ dàn 2D', 'dàn số 00-99'],
        longTail: ['tạo dàn 2D online miễn phí', 'dàn số 2D chính xác 100%', 'dàn số 00-99 chuyên nghiệp', 'chuyển đổi 1D từ 2D'],
        lsi: ['00-99', '2 chữ số', 'rút dần', 'cấp độ', 'Fisher-Yates', 'bộ lọc thông minh']
    },

    'dan-3d4d': {
        primary: 'tạo dàn 3D 4D',
        secondary: ['dàn số 3D', 'dàn số 4D', 'công cụ dàn 3D 4D'],
        longTail: ['tạo dàn 3D 4D chuyên nghiệp', 'dàn số 3D 4D miễn phí'],
        lsi: ['000-999', '0000-9999', '3 chữ số', '4 chữ số']
    },

    'dan-dac-biet': {
        primary: 'tạo dàn đặc biệt',
        secondary: ['dàn số đặc biệt', 'bộ lọc dàn số', 'lọc số đặc biệt'],
        longTail: ['tạo dàn đặc biệt thông minh', 'bộ lọc dàn số chuyên nghiệp'],
        lsi: ['bộ lọc', 'lọc số', 'đầu đuôi', 'chạm', 'kép']
    },

    'thong-ke': {
        primary: 'thống kê xổ số 3 miền',
        secondary: ['thống kê xổ số', 'bảng thống kê', 'phân tích xổ số'],
        longTail: ['thống kê xổ số 3 miền mới nhất', 'bảng thống kê chính xác'],
        lsi: ['miền bắc', 'miền nam', 'miền trung', 'kết quả', 'xu hướng']
    }
};

// Trending Keywords 2025
export const TRENDING_KEYWORDS_2025 = [
    'AI tạo dàn số 2025',
    'dàn số thông minh',
    'công nghệ dàn số mới nhất',
    'dàn số hiện đại 2025',
    'tự động tạo dàn số',
    'dàn số AI',
    'thuật toán dàn số tiên tiến',
    'dàn số machine learning',
    'xổ số miền bắc 2025',
    'xổ số miền nam 2025',
    'xổ số miền trung 2025',
    'dàn số Wukong',
    'tạo dàn số online 2025',
    'công cụ dàn số chuyên nghiệp 2025',
    'dàn số miễn phí không giới hạn',
    'thống kê xổ số realtime 2025',
    'soi cầu dàn số chính xác',
    'dự đoán dàn số thông minh'
];

// Export utility functions
export const getKeywordsForPage = (pageName) => {
    return PAGE_KEYWORDS[pageName] || PAGE_KEYWORDS.home;
};

export const generateSEOTitle = (keyword, brand = 'Dàn Đề Wukong', template = 'primary') => {
    const templates = SEO_CONTENT_TEMPLATES.title;
    return templates[template]
        .replace('{keyword}', keyword)
        .replace('{brand}', brand);
};

export const generateSEODescription = (keyword, brand = 'Dàn Đề Wukong', template = 'primary') => {
    const templates = SEO_CONTENT_TEMPLATES.description;
    return templates[template]
        .replace('{keyword}', keyword)
        .replace('{brand}', brand);
};
