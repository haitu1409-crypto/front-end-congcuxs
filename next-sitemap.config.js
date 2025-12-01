/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.taodandewukong.pro',
    generateRobotsTxt: true,
    generateIndexSitemap: true,

    // Robots.txt options - Tối ưu cho tất cả search engines
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/_next/', '/static/'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                crawlDelay: 0,
            },
            {
                userAgent: 'Googlebot-Image',
                allow: '/',
            },
            {
                userAgent: 'bingbot',
                allow: '/',
                crawlDelay: 0,
            },
            {
                userAgent: 'coccoc',
                allow: '/',
                crawlDelay: 0,
            },
        ],
        additionalSitemaps: [
            `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.taodandewukong.pro'}/sitemap.xml`,
        ],
    },

    // URLs to exclude from sitemap
    exclude: [
        '/api/*',
        '/_next/*',
        '/static/*',
        '/*.json',
        '/*.xml',
    ],

    // Transform function to customize each URL
    transform: async (config, path) => {
        // Customize priority and changefreq based on page type (from SEO analysis)
        let priority = 0.7;
        let changefreq = 'weekly';

        // Homepage - highest priority
        if (path === '/') {
            priority = 1.0;
            changefreq = 'daily';
        }
        // Soi cau Bayesian - highest priority (highest search volume)
        else if (path === '/soicau-bayesian') {
            priority = 0.95;
            changefreq = 'daily';
        }
        // Main tool pages - very high priority (high search volume)
        else if (path.match(/\/(dan-9x0x|dan-2d|dan-3d4d|dan-dac-biet)/)) {
            priority = 0.9;
            changefreq = 'daily';
        }
        // High-value pages (good search volume)
        else if (path.match(/\/(ghep-lo-xien|bang-tinh-chao)/)) {
            priority = 0.85;
            changefreq = 'weekly';
        }
        // Statistics & content pages
        else if (path.match(/\/(thong-ke|content)/)) {
            priority = 0.8;
            changefreq = 'daily';
        }
        // News/blog pages
        else if (path.match(/\/tin-tuc/)) {
            priority = 0.7;
            changefreq = 'daily';
        }

        return {
            loc: path,
            changefreq: changefreq,
            priority: priority,
            lastmod: new Date().toISOString(),
            alternateRefs: [
                {
                    href: `${config.siteUrl}${path}`,
                    hreflang: 'vi',
                },
                {
                    href: `${config.siteUrl}${path}`,
                    hreflang: 'x-default',
                },
            ],
        };
    },

    // Additional paths to include (if using static generation)
    additionalPaths: async (config) => {
        const result = [];

        // Add custom paths (sorted by SEO priority)
        const customPaths = [
            '/',                    // Priority 1.0
            '/soicau-bayesian',   // Priority 0.95 - NEW: Highest search volume (74,000/month)
            '/dan-9x0x',           // Priority 0.9 - High search volume
            '/dan-2d',             // Priority 0.9 - High search volume
            '/dan-3d4d',           // Priority 0.9 - High search volume
            '/dan-dac-biet',       // Priority 0.9 - High search volume
            '/ghep-lo-xien',       // Priority 0.85 - High search volume (3,600/month)
            '/bang-tinh-chao',     // Priority 0.85 - Medium search volume (880/month)
            '/thong-ke',           // Priority 0.82 - Statistics hub
            '/thongke/dau-duoi',   // Priority 0.8
            '/content',            // Priority 0.8
            '/tin-tuc',            // Priority 0.7
        ];

        // Image sitemap configuration (with SEO-optimized captions)
        const imageSitemap = {
            '/': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/wukong.png`,
                        caption: 'Dàn Đề Wukong - Công cụ tạo dàn đề chuyên nghiệp miễn phí #1 Việt Nam',
                        title: 'Tạo Dàn Đề Online - Miễn Phí 100%'
                    }
                ]
            },
            '/dan-9x0x': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/dan9x0x (1).png`,
                        caption: 'Tạo dàn 9x-0x ngẫu nhiên, cắt dàn thông minh, bảng tính chào gấp thếp',
                        title: 'Dàn 9x-0x - Thuật toán Fisher-Yates chuẩn'
                    }
                ]
            },
            '/dan-2d': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/dan2d1d (1).png`,
                        caption: 'Tạo dàn 2D (00-99) với phân loại mức độ, chuyển đổi 1D sang 2D',
                        title: 'Dàn 2D - Công cụ tạo dàn đề 2 số'
                    }
                ]
            },
            '/dan-3d4d': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/dan3d4d (1).png`,
                        caption: 'Tạo dàn 3D-4D, ghép dàn BC-CD-DE từ giải đặc biệt',
                        title: 'Dàn 3D/4D - Công cụ 3 càng 4 càng'
                    }
                ]
            },
            '/dan-dac-biet': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/dandacbiet (1).png`,
                        caption: 'Lọc ghép dàn đề, lấy nhanh dàn đặc biệt, tạo dàn chạm/bộ/đầu đuôi',
                        title: 'Dàn Đặc Biệt - Bộ lọc thông minh'
                    }
                ]
            },
            '/ghep-lo-xien': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/wukong.png`,
                        caption: 'Ghép lô xiên 2-3-4 càng tự động, tính tiền cược nhanh chính xác',
                        title: 'Ghép Lô Xiên - Xiên quay tự động'
                    }
                ]
            },
            '/bang-tinh-chao': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/wukong.png`,
                        caption: 'Bảng tính chào gấp thếp dàn đề, tính lãi chào tự động',
                        title: 'Bảng Tính Chào - Gấp thếp dàn đề'
                    }
                ]
            },
            '/thong-ke': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/thongke (1).png`,
                        caption: 'Thống kê xổ số 3 miền XSMB XSMN XSMT, phân tích xu hướng',
                        title: 'Thống Kê Xổ Số 3 Miền - Tổng quan'
                    }
                ]
            },
            '/thongke/dau-duoi': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/thongke (1).png`,
                        caption: 'Thống kê xổ số 3 miền XSMB XSMN XSMT, phân tích tần suất',
                        title: 'Thống Kê Xổ Số - Phân tích chi tiết'
                    }
                ]
            },
            '/content': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/wukong.png`,
                        caption: 'Hướng dẫn chơi lô số, mẹo chiến thuật xổ số hiệu quả',
                        title: 'Hướng Dẫn - Mẹo chơi xổ số'
                    }
                ]
            },
            '/tin-tuc': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/wukong.png`,
                        caption: 'Tin tức xổ số mới nhất, kết quả XSMB XSMN XSMT hôm nay',
                        title: 'Tin Tức Xổ Số - Cập nhật 24/7'
                    }
                ]
            },
            '/soicau-bayesian': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/soi-cau-bayesian.png`,
                        caption: 'Soi cầu miền bắc hôm nay chính xác 100%, dự đoán XSMB bằng thuật toán Bayesian',
                        title: 'Soi Cầu Bayesian - Dự đoán XSMB AI'
                    }
                ]
            }
        };

        for (const path of customPaths) {
            const pathConfig = {
                loc: path,
                changefreq: 'daily',
                priority: path === '/' ? 1.0 : 0.9,
                lastmod: new Date().toISOString(),
            };

            // Add images if available for this path
            if (imageSitemap[path]) {
                pathConfig.images = imageSitemap[path].images;
            }

            result.push(pathConfig);
        }

        return result;
    },

    sitemapSize: 5000,
    autoLastmod: true,

    // News sitemap configuration
    additionalSitemaps: [
        `${process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro'}/news-sitemap.xml`,
    ],

    // Output directory
    outDir: './public',
};

