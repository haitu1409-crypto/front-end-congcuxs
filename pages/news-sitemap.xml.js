/**
 * Dynamic News Sitemap Generator
 * Google News Sitemap - chỉ bao gồm các bài viết tin tức mới (trong vòng 2 ngày)
 * 
 * News Sitemap giúp Google News index các bài viết nhanh hơn
 * Yêu cầu: Bài viết phải được publish trong vòng 2-3 ngày gần đây
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const SITE_URL_BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.taodandewukong.pro').replace(/\/+$/, '');

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

function generateNewsSitemap(recentArticles) {
    // News sitemap chỉ bao gồm các bài viết trong vòng 2 ngày gần đây
    const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
    
    const newsArticles = recentArticles.filter(article => {
        if (!article.slug || !article.publishedAt) return false;
        const publishDate = new Date(article.publishedAt || article.createdAt);
        return publishDate.getTime() >= twoDaysAgo;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
    ${newsArticles.map(article => {
        const publishDate = new Date(article.publishedAt || article.createdAt);
        
        return `
    <url>
        <loc>${SITE_URL_BASE}/tin-tuc/${article.slug}</loc>
        <news:news>
            <news:publication>
                <news:name>Tạo Dàn Đề Wukong</news:name>
                <news:language>vi</news:language>
            </news:publication>
            <news:publication_date>${publishDate.toISOString()}</news:publication_date>
            <news:title>${escapeXml(article.title || '')}</news:title>
            ${article.excerpt ? `<news:keywords>${escapeXml(article.excerpt.substring(0, 200))}</news:keywords>` : ''}
        </news:news>
    </url>`;
    }).join('')}
</urlset>`;
}

export async function getServerSideProps({ res }) {
    // Set headers for XML
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600'); // Cache 30 phút vì news sitemap cần update thường xuyên
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    try {
        // Fetch recent articles (chỉ lấy bài viết trong vòng 3 ngày để đảm bảo có đủ bài mới)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        let articles = [];
        try {
            // Lấy bài viết mới nhất, sắp xếp theo publishedAt
            const response = await fetch(`${API_URL}/api/articles?limit=100&sort=-publishedAt`, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                articles = data.success && data.data?.articles ? data.data.articles : [];
            }
        } catch (fetchError) {
            console.warn('[News Sitemap] Could not fetch articles:', fetchError.message);
        } finally {
            clearTimeout(timeoutId);
        }

        // Generate news sitemap
        const sitemap = generateNewsSitemap(articles);

        res.write(sitemap);
        res.end();

    } catch (error) {
        console.error('[News Sitemap] Generation error:', error);
        
        // Return empty news sitemap on error
        const emptySitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`;

        res.write(emptySitemap);
        res.end();
    }

    return {
        props: {}
    };
}

export default function NewsSitemap() {
    // getServerSideProps will handle the response
    return null;
}


