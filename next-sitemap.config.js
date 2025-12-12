/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro',
    generateRobotsTxt: false, // Sử dụng dynamic robots.txt từ pages/robots.txt.js
    generateIndexSitemap: false, // Sử dụng dynamic sitemap từ pages/sitemap.xml.js

    // Robots.txt options - Tối ưu cho tất cả search engines
    // Note: Không dùng vì đã có dynamic robots.txt
    robotsTxtOptions: {
        policies: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/_next/', '/static/', '/admin/', '/auth/'],
            },
            {
                userAgent: 'Googlebot',
                allow: '/',
                crawlDelay: 0, // ✅ QUAN TRỌNG: Cho phép Googlebot crawl ngay lập tức
            },
            {
                userAgent: 'Googlebot-Image',
                allow: '/',
                crawlDelay: 0,
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
            `${process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro'}/sitemap.xml`,
            `${process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro'}/news-sitemap.xml`,
        ],
    },

    // URLs to exclude from sitemap
    exclude: [
        '/api/*',
        '/_next/*',
        '/static/*',
        '/admin/*',
        '/auth/*',
        '/*.json',
        '/404',
        '/500',
    ],

    // Transform function to customize each URL
    transform: async (config, path) => {
        // Customize priority and changefreq based on page type
        let priority = 0.7;
        let changefreq = 'weekly';

        if (path === '/') {
            priority = 1.0;
            changefreq = 'daily';
        } else if (path.match(/\/(soi-cau|ket-qua-xo-so|thong-ke|tin-tuc)/)) {
            priority = 0.95;
            changefreq = 'daily';
        } else if (path.match(/\/(dan-2d|dan-3d4d|dan-dac-biet|dan-9x0x|loc-dan-de)/)) {
            priority = 0.90;
            changefreq = 'daily';
        } else if (path.match(/\/tin-tuc\//)) {
            priority = 0.85;
            changefreq = 'weekly';
        }

        return {
            loc: path,
            changefreq: changefreq,
            priority: priority,
            lastmod: new Date().toISOString(),
        };
    },

    sitemapSize: 5000,
    autoLastmod: true,

    // Output directory
    outDir: './public',
};
