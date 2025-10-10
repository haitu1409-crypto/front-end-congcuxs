/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
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
            `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sitemap.xml`,
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
        // Customize priority and changefreq based on page type
        let priority = 0.7;
        let changefreq = 'weekly';

        if (path === '/') {
            priority = 1.0;
            changefreq = 'daily';
        } else if (path.match(/\/(dan-2d|dan-3d4d|dan-dac-biet)/)) {
            priority = 0.9;
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

        // Add custom paths
        const customPaths = [
            '/',
            '/dan-2d',
            '/dan-3d4d',
            '/dan-dac-biet',
            '/dan-9x0x',
            '/thong-ke',
            '/content',
            '/tin-tuc',
        ];

        // Image sitemap configuration
        const imageSitemap = {
            '/': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/wukong.png`,
                        caption: 'Dàn Đề Tôn Ngộ Không - Công cụ tạo dàn đề chuyên nghiệp',
                        title: 'Homepage - Dàn Đề Tôn Ngộ Không'
                    }
                ]
            },
            '/dan-9x0x': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/dan9x0x (1).png`,
                        caption: 'Tạo dàn đề 9x-0x ngẫu nhiên chuyên nghiệp',
                        title: 'Dàn Đề 9x-0x - Thuật toán Fisher-Yates'
                    }
                ]
            },
            '/dan-2d': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/dan2d1d (1).png`,
                        caption: 'Tạo dàn đề 2D (00-99) chuyên nghiệp',
                        title: 'Dàn Đề 2D - Phân loại theo mức độ'
                    }
                ]
            },
            '/dan-3d4d': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/dan3d4d (1).png`,
                        caption: 'Tạo dàn đề 3D/4D cho cao thủ',
                        title: 'Dàn Đề 3D/4D - Công cụ cao thủ'
                    }
                ]
            },
            '/dan-dac-biet': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/dandacbiet (1).png`,
                        caption: 'Ghép dàn đề đặc biệt với bộ lọc thông minh',
                        title: 'Dàn Đề Đặc Biệt - Bộ lọc AI'
                    }
                ]
            },
            '/thong-ke': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/thongke (1).png`,
                        caption: 'Thống kê xổ số 3 miền chính xác',
                        title: 'Thống Kê Xổ Số 3 Miền'
                    }
                ]
            },
            '/content': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/wukong.png`,
                        caption: 'Hướng dẫn chơi lô đề và mẹo vặt xổ số',
                        title: 'Content - Hướng dẫn chơi lô đề'
                    }
                ]
            },
            '/tin-tuc': {
                images: [
                    {
                        loc: `${config.siteUrl}/imgs/wukong.png`,
                        caption: 'Tin tức xổ số và cập nhật kết quả mới nhất',
                        title: 'Tin Tức Xổ Số - Cập nhật mới nhất'
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

