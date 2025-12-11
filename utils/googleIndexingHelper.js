/**
 * Google Indexing Helper
 * Các công cụ hỗ trợ Google Bot lập chỉ mục nhanh hơn
 */

/**
 * Ping Google về sitemap khi có cập nhật
 * Sử dụng Google Ping API để thông báo Google về sitemap mới
 */
export async function pingGoogleSitemap(sitemapUrl) {
    if (typeof window !== 'undefined') {
        // Client-side: Sử dụng Google Ping endpoint
        const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;

        try {
            // Sử dụng fetch với mode 'no-cors' để tránh CORS issues
            await fetch(pingUrl, {
                method: 'GET',
                mode: 'no-cors',
                cache: 'no-cache'
            });
            console.log('[Google Indexing] Pinged Google about sitemap update');
            return true;
        } catch (error) {
            console.warn('[Google Indexing] Failed to ping Google:', error);
            return false;
        }
    }
    return false;
}

/**
 * Ping Bing về sitemap (hỗ trợ thêm search engine)
 */
export async function pingBingSitemap(sitemapUrl) {
    if (typeof window !== 'undefined') {
        const pingUrl = `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`;

        try {
            await fetch(pingUrl, {
                method: 'GET',
                mode: 'no-cors',
                cache: 'no-cache'
            });
            console.log('[Bing Indexing] Pinged Bing about sitemap update');
            return true;
        } catch (error) {
            console.warn('[Bing Indexing] Failed to ping Bing:', error);
            return false;
        }
    }
    return false;
}

/**
 * Ping tất cả search engines về sitemap update
 */
export async function pingAllSearchEngines(sitemapUrl) {
    if (typeof window !== 'undefined') {
        await Promise.all([
            pingGoogleSitemap(sitemapUrl),
            pingBingSitemap(sitemapUrl)
        ]);
    }
}

/**
 * Generate sitemap ping URL for server-side
 * Sử dụng trong API routes hoặc server-side rendering
 */
export function getSitemapPingUrls(sitemapUrl) {
    return {
        google: `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
        bing: `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
        yandex: `https://webmaster.yandex.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    };
}

/**
 * Helper để log indexing events (có thể tích hợp với analytics)
 */
export function logIndexingEvent(eventType, url) {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'indexing_request', {
            event_category: 'SEO',
            event_label: eventType,
            value: url
        });
    }
}

/**
 * Instructions cho Google Search Console Manual Submission
 * Hướng dẫn submit URL thủ công trong Google Search Console
 */
export const SEARCH_CONSOLE_INSTRUCTIONS = {
    manualSubmission: `
    Để submit URL lên Google Search Console:
    1. Truy cập: https://search.google.com/search-console
    2. Chọn property: ${process.env.NEXT_PUBLIC_SITE_URL || 'your-domain.com'}
    3. Vào mục "URL Inspection"
    4. Nhập URL cần index
    5. Click "Request Indexing"
    
    Lưu ý: Chỉ submit URL khi có nội dung mới hoặc thay đổi quan trọng
    `,

    sitemapSubmission: `
    Để submit sitemap:
    1. Vào Google Search Console
    2. Chọn property
    3. Vào mục "Sitemaps"
    4. Nhập: sitemap.xml
    5. Click "Submit"
    `
};





















