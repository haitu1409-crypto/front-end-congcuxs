/**
 * API Endpoint để ping Google về sitemap update
 * Sử dụng server-side để tránh CORS issues
 * 
 * POST /api/ping-sitemap
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.taodandewukong.pro';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const sitemapUrl = `${SITE_URL}/sitemap.xml`;
    
    try {
        // Ping Google
        const googlePing = await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SitemapPinger/1.0)'
            }
        });

        // Ping Bing
        const bingPing = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SitemapPinger/1.0)'
            }
        });

        const results = {
            success: true,
            timestamp: new Date().toISOString(),
            sitemap: sitemapUrl,
            google: {
                pinged: true,
                status: googlePing.status
            },
            bing: {
                pinged: true,
                status: bingPing.status
            }
        };

        return res.status(200).json(results);
    } catch (error) {
        console.error('[Ping Sitemap] Error:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}












