/**
 * SEO Sitemap Component
 * Component tạo sitemap.xml cho SEO
 */

const generateSitemap = () => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';
    const currentDate = new Date().toISOString().split('T')[0];

    const staticPages = [
        {
            url: '/',
            priority: '1.0',
            changefreq: 'daily',
            lastmod: currentDate
        },
        {
            url: '/#dan-de-generator',
            priority: '0.9',
            changefreq: 'daily',
            lastmod: currentDate
        },
        {
            url: '/#dan-de-filter',
            priority: '0.9',
            changefreq: 'daily',
            lastmod: currentDate
        },
        {
            url: '/#huong-dan',
            priority: '0.8',
            changefreq: 'weekly',
            lastmod: currentDate
        }
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${staticPages.map(page => `    <url>
        <loc>${baseUrl}${page.url}</loc>
        <lastmod>${page.lastmod}</lastmod>
        <changefreq>${page.changefreq}</changefreq>
        <priority>${page.priority}</priority>
    </url>`).join('\n')}
</urlset>`;

    return sitemap;
};

export default generateSitemap;
