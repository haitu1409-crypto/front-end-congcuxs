/**
 * URL Helper Utilities
 * Các hàm tiện ích để xử lý URLs nhất quán
 */

/**
 * Normalize site URL - remove trailing slash
 * Đảm bảo URL không có trailing slash để tránh double slash khi concatenate
 * 
 * @param {string} url - URL cần normalize
 * @returns {string} - URL đã được normalize (không có trailing slash)
 * 
 * @example
 * normalizeSiteUrl('https://example.com/') // => 'https://example.com'
 * normalizeSiteUrl('https://example.com') // => 'https://example.com'
 * normalizeSiteUrl('https://example.com///') // => 'https://example.com'
 */
export function normalizeSiteUrl(url) {
    if (!url) return '';
    return url.replace(/\/+$/, '');
}

/**
 * Get normalized site URL from environment variable
 * Lấy NEXT_PUBLIC_SITE_URL và normalize
 * 
 * @param {string} fallback - Fallback URL nếu không có env variable
 * @returns {string} - Normalized site URL
 */
export function getSiteUrl(fallback = 'https://www.taodandewukong.pro') {
    const url = process.env.NEXT_PUBLIC_SITE_URL || fallback;
    return normalizeSiteUrl(url);
}

/**
 * Build URL path - đảm bảo không có double slash
 * 
 * @param {string} baseUrl - Base URL (đã được normalize)
 * @param {string} path - Path cần append (có thể bắt đầu bằng / hoặc không)
 * @returns {string} - Full URL
 * 
 * @example
 * buildUrl('https://example.com', '/path') // => 'https://example.com/path'
 * buildUrl('https://example.com', 'path') // => 'https://example.com/path'
 */
export function buildUrl(baseUrl, path) {
    const normalizedBase = normalizeSiteUrl(baseUrl);
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
}




