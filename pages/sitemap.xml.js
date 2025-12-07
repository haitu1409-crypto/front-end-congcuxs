/**
 * Dynamic Sitemap Generator
 * Auto-generates sitemap from all articles
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
// Normalize SITE_URL - ensure it has trailing slash for homepage
const SITE_URL_BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.taodandewukong.pro').replace(/\/+$/, '');
const SITE_URL = SITE_URL_BASE + '/';

function generateSiteMap(articles) {
    // Use ISO 8601 format with timezone for consistent lastmod
    const lastmod = new Date().toISOString();

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    
    <!-- Homepage - Priority 1.0 -->
    <url>
        <loc>${SITE_URL_BASE}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <!-- Main Tool Pages - Priority 0.95 -->
    <url>
        <loc>${SITE_URL_BASE}/soi-cau-mien-bac-ai</loc>
        <changefreq>daily</changefreq>
        <priority>0.95</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <url>
        <loc>${SITE_URL_BASE}/soi-cau-dac-biet-mien-bac</loc>
        <changefreq>daily</changefreq>
        <priority>0.95</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <url>
        <loc>${SITE_URL_BASE}/soi-cau-loto-mien-bac</loc>
        <changefreq>daily</changefreq>
        <priority>0.95</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <url>
        <loc>${SITE_URL_BASE}/dan-9x0x</loc>
        <changefreq>daily</changefreq>
        <priority>0.90</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <url>
        <loc>${SITE_URL_BASE}/dan-2d</loc>
        <changefreq>daily</changefreq>
        <priority>0.90</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <url>
        <loc>${SITE_URL_BASE}/dan-3d4d</loc>
        <changefreq>daily</changefreq>
        <priority>0.90</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <url>
        <loc>${SITE_URL_BASE}/dan-dac-biet</loc>
        <changefreq>daily</changefreq>
        <priority>0.90</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <!-- Additional Tool Pages - Priority 0.85 -->
    <url>
        <loc>${SITE_URL_BASE}/loc-dan-de</loc>
        <changefreq>daily</changefreq>
        <priority>0.90</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <url>
        <loc>${SITE_URL_BASE}/ghep-lo-xien</loc>
        <changefreq>weekly</changefreq>
        <priority>0.85</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <url>
        <loc>${SITE_URL_BASE}/bang-tinh-chao</loc>
        <changefreq>weekly</changefreq>
        <priority>0.85</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <!-- Results Pages - Priority 0.95 -->
    <url>
        <loc>${SITE_URL_BASE}/ket-qua-xo-so-mien-bac</loc>
        <changefreq>daily</changefreq>
        <priority>0.95</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <url>
        <loc>${SITE_URL_BASE}/kqxs-live</loc>
        <changefreq>daily</changefreq>
        <priority>0.90</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <!-- Statistics Hub -->
    <url>
        <loc>${SITE_URL_BASE}/thong-ke</loc>
        <changefreq>daily</changefreq>
        <priority>0.82</priority>
        <lastmod>${lastmod}</lastmod>
    </url>

    <!-- Statistics Pages - Priority 0.85-0.90 -->
    <url>
        <loc>${SITE_URL_BASE}/thongke/dau-duoi</loc>
        <changefreq>daily</changefreq>
        <priority>0.90</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <url>
        <loc>${SITE_URL_BASE}/thongke/lo-gan</loc>
        <changefreq>daily</changefreq>
        <priority>0.85</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <url>
        <loc>${SITE_URL_BASE}/thongke/giai-dac-biet</loc>
        <changefreq>daily</changefreq>
        <priority>0.90</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <url>
        <loc>${SITE_URL_BASE}/thongke/giai-dac-biet-tuan</loc>
        <changefreq>daily</changefreq>
        <priority>0.78</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <url>
        <loc>${SITE_URL_BASE}/thongke/tan-suat-loto</loc>
        <changefreq>daily</changefreq>
        <priority>0.88</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <url>
        <loc>${SITE_URL_BASE}/thongke/tan-suat-locap</loc>
        <changefreq>daily</changefreq>
        <priority>0.80</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <!-- News List Page -->
    <url>
        <loc>${SITE_URL_BASE}/tin-tuc</loc>
        <changefreq>hourly</changefreq>
        <priority>0.90</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <!-- Content Page -->
    <url>
        <loc>${SITE_URL_BASE}/content</loc>
        <changefreq>weekly</changefreq>
        <priority>0.70</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    
    <!-- Article Pages -->
    ${articles.map(article => {
        if (!article.slug) return ''; // Skip articles without slug
        
        const publishDate = new Date(article.publishedAt || article.createdAt);
        const updateDate = new Date(article.updatedAt || article.createdAt);
        const isRecent = Date.now() - publishDate.getTime() < 2 * 24 * 60 * 60 * 1000; // 2 days

        return `
    <url>
        <loc>${SITE_URL_BASE}/tin-tuc/${article.slug}</loc>
        <lastmod>${updateDate.toISOString()}</lastmod>
        <changefreq>${isRecent ? 'daily' : 'weekly'}</changefreq>
        <priority>${isRecent ? '0.9' : '0.7'}</priority>
        ${article.featuredImage?.url ? `
        <image:image>
            <image:loc>${escapeXml(article.featuredImage.url)}</image:loc>
            <image:title>${escapeXml(article.title || '')}</image:title>
            <image:caption>${escapeXml(article.excerpt || article.title || '')}</image:caption>
        </image:image>` : ''}
        ${isRecent ? `
        <news:news>
            <news:publication>
                <news:name>Tạo Dàn Đề Wukong</news:name>
                <news:language>vi</news:language>
            </news:publication>
            <news:publication_date>${publishDate.toISOString()}</news:publication_date>
            <news:title>${escapeXml(article.title || '')}</news:title>
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
    // Always set headers first - Important for Google to properly parse sitemap
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    try {
        // Fetch articles with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        let articles = [];
        try {
            const response = await fetch(`${API_URL}/api/articles?limit=1000&sort=-publishedAt`, {
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
            // Silently fail - use empty articles array
            console.warn('[Sitemap] Could not fetch articles, using static sitemap:', fetchError.message);
        } finally {
            clearTimeout(timeoutId);
        }

        // Generate sitemap (works even with empty articles)
        const sitemap = generateSiteMap(articles);

        // Write sitemap
        res.write(sitemap);
        res.end();

    } catch (error) {
        console.error('[Sitemap] Generation error:', error);

        // Return comprehensive sitemap on error (without articles)
        const lastmod = new Date().toISOString();
        const minimalSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    <url>
        <loc>${SITE_URL_BASE}/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    <url>
        <loc>${SITE_URL_BASE}/soi-cau-mien-bac-ai</loc>
        <changefreq>daily</changefreq>
        <priority>0.95</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    <url>
        <loc>${SITE_URL_BASE}/soi-cau-dac-biet-mien-bac</loc>
        <changefreq>daily</changefreq>
        <priority>0.95</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    <url>
        <loc>${SITE_URL_BASE}/soi-cau-loto-mien-bac</loc>
        <changefreq>daily</changefreq>
        <priority>0.95</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    <url>
        <loc>${SITE_URL_BASE}/dan-9x0x</loc>
        <changefreq>daily</changefreq>
        <priority>0.90</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    <url>
        <loc>${SITE_URL_BASE}/dan-2d</loc>
        <changefreq>daily</changefreq>
        <priority>0.90</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    <url>
        <loc>${SITE_URL_BASE}/dan-3d4d</loc>
        <changefreq>daily</changefreq>
        <priority>0.90</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    <url>
        <loc>${SITE_URL_BASE}/dan-dac-biet</loc>
        <changefreq>daily</changefreq>
        <priority>0.90</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    <url>
        <loc>${SITE_URL_BASE}/loc-dan-de</loc>
        <changefreq>daily</changefreq>
        <priority>0.90</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    <url>
        <loc>${SITE_URL_BASE}/ghep-lo-xien</loc>
        <changefreq>weekly</changefreq>
        <priority>0.85</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    <url>
        <loc>${SITE_URL_BASE}/bang-tinh-chao</loc>
        <changefreq>weekly</changefreq>
        <priority>0.85</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    <url>
        <loc>${SITE_URL_BASE}/ket-qua-xo-so-mien-bac</loc>
        <changefreq>daily</changefreq>
        <priority>0.95</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    <url>
        <loc>${SITE_URL_BASE}/thong-ke</loc>
        <changefreq>daily</changefreq>
        <priority>0.82</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    <url>
        <loc>${SITE_URL_BASE}/thongke/dau-duoi</loc>
        <changefreq>daily</changefreq>
        <priority>0.90</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    <url>
        <loc>${SITE_URL_BASE}/thongke/lo-gan</loc>
        <changefreq>daily</changefreq>
        <priority>0.85</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    <url>
        <loc>${SITE_URL_BASE}/thongke/giai-dac-biet</loc>
        <changefreq>daily</changefreq>
        <priority>0.90</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    <url>
        <loc>${SITE_URL_BASE}/thongke/giai-dac-biet-tuan</loc>
        <changefreq>daily</changefreq>
        <priority>0.78</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    <url>
        <loc>${SITE_URL_BASE}/thongke/tan-suat-loto</loc>
        <changefreq>daily</changefreq>
        <priority>0.88</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    <url>
        <loc>${SITE_URL_BASE}/thongke/tan-suat-locap</loc>
        <changefreq>daily</changefreq>
        <priority>0.80</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
    <url>
        <loc>${SITE_URL_BASE}/tin-tuc</loc>
        <changefreq>hourly</changefreq>
        <priority>0.90</priority>
        <lastmod>${lastmod}</lastmod>
    </url>
</urlset>`;

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

