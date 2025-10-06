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
                    href: `${config.siteUrl}/vi${path}`,
                    hreflang: 'vi',
                },
                {
                    href: `${config.siteUrl}/en${path}`,
                    hreflang: 'en',
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
            '/thong-ke',
            '/content',
            '/tin-tuc',
        ];

        for (const path of customPaths) {
            result.push({
                loc: path,
                changefreq: 'daily',
                priority: path === '/' ? 1.0 : 0.9,
                lastmod: new Date().toISOString(),
            });
        }

        return result;
    },

    sitemapSize: 5000,
    autoLastmod: true,

    // Output directory
    outDir: './public',
};

