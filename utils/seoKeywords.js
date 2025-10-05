/**
 * SEO Keywords Database - 2025
 * Từ khóa SEO tối ưu cho ngành dàn đề, xổ số Việt Nam
 * Tham khảo xu hướng SEO 2025 và chính sách trình duyệt mới nhất
 */

// Primary Keywords - High Volume, High Competition
export const PRIMARY_KEYWORDS = {
    // Main Brand Keywords
    'tạo dàn đề': {
        volume: 'high',
        competition: 'high',
        intent: 'commercial',
        longTail: [
            'tạo dàn đề online',
            'tạo dàn đề miễn phí',
            'tạo dàn đề chuyên nghiệp',
            'công cụ tạo dàn đề',
            'tạo dàn đề 2D',
            'tạo dàn đề 3D',
            'tạo dàn đề 4D',
            'tạo dàn đề đặc biệt'
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

    'lô đề': {
        volume: 'high',
        competition: 'high',
        intent: 'commercial',
        longTail: [
            'lô đề online',
            'cách chơi lô đề',
            'thống kê lô đề',
            'dàn lô đề',
            'tạo dàn lô đề',
            'lô đề miền bắc',
            'lô đề miền nam',
            'lô đề miền trung'
        ]
    }
};

// Secondary Keywords - Medium Volume, Medium Competition
export const SECONDARY_KEYWORDS = {
    'dàn 2D': {
        volume: 'medium',
        competition: 'medium',
        intent: 'commercial',
        related: ['dàn đề 2 chữ số', 'dàn 00-99', 'tạo dàn 2D', 'dàn 2D miễn phí']
    },

    'dàn 3D': {
        volume: 'medium',
        competition: 'medium',
        intent: 'commercial',
        related: ['dàn đề 3 chữ số', 'dàn 000-999', 'tạo dàn 3D', 'dàn 3D chuyên nghiệp']
    },

    'dàn 4D': {
        volume: 'medium',
        competition: 'medium',
        intent: 'commercial',
        related: ['dàn đề 4 chữ số', 'dàn 0000-9999', 'tạo dàn 4D', 'dàn 4D cao cấp']
    },

    'dàn đặc biệt': {
        volume: 'medium',
        competition: 'low',
        intent: 'commercial',
        related: ['bộ lọc số', 'lọc dàn đề', 'dàn đề đặc biệt', 'tạo dàn đặc biệt']
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
    'tạo dàn đề online miễn phí 2025',
    'công cụ tạo dàn đề chuyên nghiệp nhất',
    'tạo dàn đề 2D nhanh nhất',
    'dàn đề 3D 4D chính xác 100%',
    'bộ lọc dàn đề đặc biệt thông minh',
    'thống kê xổ số 3 miền mới nhất',

    // Problem-solving
    'cách tạo dàn đề hiệu quả',
    'phương pháp tạo dàn đề chính xác',
    'hướng dẫn tạo dàn đề cho người mới',
    'bí quyết tạo dàn đề thành công',

    // Location-based
    'tạo dàn đề tại Việt Nam',
    'công cụ dàn đề cho người Việt',
    'xổ số Việt Nam thống kê',

    // Brand-specific
    'dàn đề Tôn Ngộ Không',
    'công cụ dàn đề Tôn Ngộ Không',
    'tạo dàn đề thương hiệu Tôn Ngộ Không'
];

// LSI Keywords (Latent Semantic Indexing)
export const LSI_KEYWORDS = [
    // Technical Terms
    'thuật toán Fisher-Yates',
    'ngẫu nhiên hóa',
    'rút dần',
    'cấp độ dàn đề',
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
        'tạo dàn đề',
        'dàn đề online',
        'công cụ dàn đề',
        'dàn đề miễn phí'
    ],
    'xoso3mien.com': [
        'xổ số 3 miền',
        'kết quả xổ số',
        'thống kê xổ số',
        'xổ số miền bắc'
    ],
    'lodeonline.com': [
        'lô đề online',
        'thống kê lô đề',
        'dàn lô đề',
        'cách chơi lô đề'
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
        primary: 'tạo dàn đề 9x-0x online',
        secondary: ['tạo dàn đề miễn phí', 'công cụ dàn đề chuyên nghiệp', 'dàn đề 9x-0x', 'dàn đề Tôn Ngộ Không'],
        longTail: ['tạo dàn đề 9x-0x online miễn phí 2025', 'công cụ tạo dàn đề chuyên nghiệp nhất', 'tạo dàn đề Fisher-Yates', 'dàn đề 9x-0x chính xác 100%'],
        lsi: ['xổ số', 'lô đề', 'miễn phí', 'chính xác', 'nhanh chóng', 'thuật toán Fisher-Yates', 'dàn đề online']
    },

    'dan-2d': {
        primary: 'tạo dàn đề 2D (00-99)',
        secondary: ['dàn đề 2D', 'dàn 2D miễn phí', 'công cụ dàn 2D', 'dàn đề 00-99'],
        longTail: ['tạo dàn 2D online miễn phí', 'dàn đề 2D chính xác 100%', 'dàn đề 00-99 chuyên nghiệp', 'chuyển đổi 1D từ 2D'],
        lsi: ['00-99', '2 chữ số', 'rút dần', 'cấp độ', 'Fisher-Yates', 'bộ lọc thông minh']
    },

    'dan-3d4d': {
        primary: 'tạo dàn 3D 4D',
        secondary: ['dàn đề 3D', 'dàn đề 4D', 'công cụ dàn 3D 4D'],
        longTail: ['tạo dàn 3D 4D chuyên nghiệp', 'dàn đề 3D 4D miễn phí'],
        lsi: ['000-999', '0000-9999', '3 chữ số', '4 chữ số']
    },

    'dan-dac-biet': {
        primary: 'tạo dàn đặc biệt',
        secondary: ['dàn đề đặc biệt', 'bộ lọc dàn đề', 'lọc số đặc biệt'],
        longTail: ['tạo dàn đặc biệt thông minh', 'bộ lọc dàn đề chuyên nghiệp'],
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
    'AI tạo dàn đề 2025',
    'dàn đề thông minh',
    'công nghệ dàn đề mới nhất',
    'dàn đề hiện đại 2025',
    'tự động tạo dàn đề',
    'dàn đề AI',
    'thuật toán dàn đề tiên tiến',
    'dàn đề machine learning',
    'xổ số miền bắc 2025',
    'xổ số miền nam 2025', 
    'xổ số miền trung 2025',
    'dàn đề Tôn Ngộ Không',
    'tạo dàn đề online 2025',
    'công cụ dàn đề chuyên nghiệp 2025',
    'dàn đề miễn phí không giới hạn',
    'thống kê xổ số realtime 2025',
    'soi cầu dàn đề chính xác',
    'dự đoán dàn đề thông minh'
];

// Export utility functions
export const getKeywordsForPage = (pageName) => {
    return PAGE_KEYWORDS[pageName] || PAGE_KEYWORDS.home;
};

export const generateSEOTitle = (keyword, brand = 'Dàn Đề Tôn Ngộ Không', template = 'primary') => {
    const templates = SEO_CONTENT_TEMPLATES.title;
    return templates[template]
        .replace('{keyword}', keyword)
        .replace('{brand}', brand);
};

export const generateSEODescription = (keyword, brand = 'Dàn Đề Tôn Ngộ Không', template = 'primary') => {
    const templates = SEO_CONTENT_TEMPLATES.description;
    return templates[template]
        .replace('{keyword}', keyword)
        .replace('{brand}', brand);
};
