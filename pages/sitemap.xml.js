/**
 * Dynamic Sitemap Generator
 * Auto-generates sitemap from all articles
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro';

function generateSiteMap(articles) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    <!-- Homepage -->
    <url>
        <loc>${SITE_URL}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
        <lastmod>${new Date().toISOString()}</lastmod>
    </url>
    
    <!-- News List Page -->
    <url>
        <loc>${SITE_URL}/tin-tuc</loc>
        <changefreq>hourly</changefreq>
        <priority>0.9</priority>
        <lastmod>${new Date().toISOString()}</lastmod>
    </url>
    
    <!-- Content Page -->
    <url>
        <loc>${SITE_URL}/content</loc>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>
    
    <!-- Tool Pages -->
    <url>
        <loc>${SITE_URL}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    
    <!-- Article Pages -->
    ${articles.map(article => {
        const publishDate = new Date(article.publishedAt || article.createdAt);
        const isRecent = Date.now() - publishDate.getTime() < 2 * 24 * 60 * 60 * 1000; // 2 days

        return `
    <url>
        <loc>${SITE_URL}/tin-tuc/${article.slug}</loc>
        <lastmod>${new Date(article.updatedAt || article.createdAt).toISOString()}</lastmod>
        <changefreq>${isRecent ? 'daily' : 'weekly'}</changefreq>
        <priority>${isRecent ? '0.9' : '0.7'}</priority>
        ${article.featuredImage?.url ? `
        <image:image>
            <image:loc>${article.featuredImage.url}</image:loc>
            <image:title>${escapeXml(article.title)}</image:title>
            <image:caption>${escapeXml(article.excerpt || article.title)}</image:caption>
        </image:image>` : ''}
        ${isRecent ? `
        <news:news>
            <news:publication>
                <news:name>Tạo Dàn Đề Wukong</news:name>
                <news:language>vi</news:language>
            </news:publication>
            <news:publication_date>${publishDate.toISOString()}</news:publication_date>
            <news:title>${escapeXml(article.title)}</news:title>
        </news:news>` : ''}
    </url>`;
    }).join('')}
</urlset>`;
}

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

export async function getServerSideProps({ res }) {
    try {
        // Fetch all articles
        const response = await fetch(`${API_URL}/api/articles?limit=1000&sort=-publishedAt`);
        const data = await response.json();

        const articles = data.success ? data.data.articles : [];

        // Generate sitemap
        const sitemap = generateSiteMap(articles);

        // Set headers
        res.setHeader('Content-Type', 'text/xml');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate');

        // Write sitemap
        res.write(sitemap);
        res.end();

    } catch (error) {
        console.error('Sitemap generation error:', error);

        // Return minimal sitemap on error
        const minimalSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${SITE_URL}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${SITE_URL}/tin-tuc</loc>
        <changefreq>hourly</changefreq>
        <priority>0.9</priority>
    </url>
</urlset>`;

        res.setHeader('Content-Type', 'text/xml');
        res.write(minimalSitemap);
        res.end();
    }

    return {
        props: {}
    };
}

export default function Sitemap() {
    // getServerSideProps will handle the response
    return null;
}

