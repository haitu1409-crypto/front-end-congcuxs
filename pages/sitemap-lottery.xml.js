/**
 * Dynamic Sitemap for Lottery Results
 * Sitemap tối ưu SEO cho kết quả xổ số
 */

const SitemapLottery = () => {
    return null;
};

export const getServerSideProps = async ({ res }) => {
    const baseUrl = 'https://taodandewukong.pro';
    const currentDate = new Date();

    // Generate dates for the last 30 days
    const dates = [];
    for (let i = 0; i < 30; i++) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() - i);
        dates.push(date);
    }

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    
    <!-- Main lottery results page -->
    <url>
        <loc>${baseUrl}/kqxs</loc>
        <lastmod>${currentDate.toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    
    <!-- Optimized lottery results page -->
    <url>
        <loc>${baseUrl}/kqxs-optimized</loc>
        <lastmod>${currentDate.toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>
    
    <!-- Individual lottery result pages -->
    ${dates.map(date => {
        const dateStr = date.toISOString().split('T')[0];
        const formattedDate = date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '-');

        return `
    <url>
        <loc>${baseUrl}/kqxs/${formattedDate}</loc>
        <lastmod>${date.toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
        <news:news>
            <news:publication>
                <news:name>Dàn Đề Wukong</news:name>
                <news:language>vi</news:language>
            </news:publication>
            <news:publication_date>${date.toISOString()}</news:publication_date>
            <news:title>Kết quả xổ số miền Bắc ngày ${formattedDate}</news:title>
        </news:news>
    </url>`;
    }).join('')}
    
    <!-- Soi cầu pages -->
    <url>
        <loc>${baseUrl}/soi-cau</loc>
        <lastmod>${currentDate.toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
    
    <url>
        <loc>${baseUrl}/soi-cau-vi-tri</loc>
        <lastmod>${currentDate.toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
    
    <!-- Statistics pages -->
    <url>
        <loc>${baseUrl}/thong-ke</loc>
        <lastmod>${currentDate.toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>
    
    <!-- Dàn đề pages -->
    <url>
        <loc>${baseUrl}/dan-dac-biet</loc>
        <lastmod>${currentDate.toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
    
    <url>
        <loc>${baseUrl}/dan-2d</loc>
        <lastmod>${currentDate.toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
    
    <url>
        <loc>${baseUrl}/dan-3d4d</loc>
        <lastmod>${currentDate.toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
    
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.write(sitemap);
    res.end();

    return {
        props: {}
    };
};

export default SitemapLottery;
