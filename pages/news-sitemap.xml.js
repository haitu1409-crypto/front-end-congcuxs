/**
 * Dynamic News Sitemap Generator
 * Google News Sitemap - chỉ bao gồm các bài viết tin tức mới (trong vòng 2 ngày)
 * 
 * News Sitemap giúp Google News index các bài viết nhanh hơn
 * Yêu cầu: Bài viết phải được publish trong vòng 2-3 ngày gần đây
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const SITE_URL_BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro').replace(/\/+$/, '');

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
    // News sitemap chỉ bao gồm các bài viết trong vòng 3 ngày gần đây (Google cho phép đến 3 ngày)
    const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
    
    // Lọc bài viết hợp lệ (có slug và publishedAt)
    const validArticles = recentArticles.filter(article => {
        return article.slug && (article.publishedAt || article.createdAt);
    });
    
    // Lọc bài viết trong vòng 3 ngày
    let newsArticles = validArticles.filter(article => {
        const publishDate = new Date(article.publishedAt || article.createdAt);
        return publishDate.getTime() >= threeDaysAgo;
    });
    
    // Nếu không có bài viết trong 3 ngày, lấy ít nhất 1 bài viết mới nhất để đảm bảo có URL
    // (Google yêu cầu phải có ít nhất 1 thẻ <url> trong <urlset>)
    if (newsArticles.length === 0 && validArticles.length > 0) {
        // Lấy bài viết mới nhất
        const latestArticle = validArticles.sort((a, b) => {
            const dateA = new Date(a.publishedAt || a.createdAt);
            const dateB = new Date(b.publishedAt || b.createdAt);
            return dateB.getTime() - dateA.getTime();
        })[0];
        newsArticles = [latestArticle];
    }

    // Nếu vẫn không có bài viết nào, trả về sitemap rỗng (sẽ báo lỗi nhưng đúng format)
    if (newsArticles.length === 0) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
</urlset>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
    ${newsArticles.map(article => {
        const publishDate = new Date(article.publishedAt || article.createdAt);
        
        return `
    <url>
        <loc>${SITE_URL_BASE}/tin-tuc/${escapeXml(article.slug)}</loc>
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
        
        // Nếu có lỗi, vẫn cố gắng tạo sitemap với dữ liệu rỗng
        // Nhưng Google sẽ báo lỗi nếu không có URL nào
        // Tốt hơn là nên trả về 404 hoặc không có sitemap
        // Tuy nhiên, để đảm bảo format đúng, vẫn trả về sitemap rỗng
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





