/**
 * Indexing Optimizer
 * Các phương pháp tối ưu để Google Bot lập chỉ mục nhanh hơn
 */

/**
 * 1. INTERNAL LINKING - Tạo internal links tự động
 * Internal linking giúp Google Bot discover pages nhanh hơn
 */
export const INTERNAL_LINKING_STRATEGY = {
    /**
     * Tạo breadcrumb links (đã có trong structured data)
     */
    breadcrumbs: true,
    
    /**
     * Tạo related pages links
     */
    relatedPages: true,
    
    /**
     * Tạo footer links (đã có trong Layout)
     */
    footerLinks: true,
    
    /**
     * Tạo category navigation
     */
    categoryNav: true
};

/**
 * 2. CANONICAL URLs - Đảm bảo không duplicate content
 * Đã được implement trong SEOOptimized component
 */

/**
 * 3. HREFLANG TAGS - Cho đa ngôn ngữ (nếu cần)
 */
export function generateHreflangTags(defaultUrl, alternateUrls = {}) {
    const tags = [];
    
    // Default
    tags.push({
        hreflang: 'x-default',
        href: defaultUrl
    });
    
    // Vietnamese (default)
    tags.push({
        hreflang: 'vi',
        href: defaultUrl
    });
    
    // Add alternate languages if any
    Object.entries(alternateUrls).forEach(([lang, url]) => {
        tags.push({
            hreflang: lang,
            href: url
        });
    });
    
    return tags;
}

/**
 * 4. XML SITEMAP OPTIMIZATION
 * - Đảm bảo lastmod được update thường xuyên
 * - Priority và changefreq được set đúng
 * - Sitemap không quá 50MB hoặc 50,000 URLs
 */
export const SITEMAP_BEST_PRACTICES = {
    maxUrls: 50000,
    maxSize: 50 * 1024 * 1024, // 50MB
    updateFrequency: 'daily', // Update sitemap hàng ngày
    compress: true // Gzip compression
};

/**
 * 5. CORE WEB VITALS OPTIMIZATION
 * Google ưu tiên index các trang có Core Web Vitals tốt
 */
export const CORE_WEB_VITALS_TARGETS = {
    LCP: 2.5, // Largest Contentful Paint < 2.5s
    FID: 100, // First Input Delay < 100ms
    CLS: 0.1, // Cumulative Layout Shift < 0.1
    TTFB: 800, // Time to First Byte < 800ms
    INP: 200  // Interaction to Next Paint < 200ms (new metric)
};

/**
 * 6. CONTENT FRESHNESS SIGNALS
 * - Update lastmod khi có nội dung mới
 * - Sử dụng changefreq phù hợp
 * - Thêm updatedAt trong structured data
 */
export function getOptimalChangeFreq(pageType) {
    const changefreqMap = {
        'home': 'daily',
        'news': 'hourly',
        'article': 'weekly',
        'tool': 'daily',
        'static': 'monthly'
    };
    
    return changefreqMap[pageType] || 'weekly';
}

/**
 * 7. ROBOTS.TXT OPTIMIZATION
 * - Không block Google Bot
 * - Allow tất cả pages quan trọng
 * - Crawl-delay = 0 (đã được set)
 */
export const ROBOTS_TXT_CHECKLIST = [
    '✓ Allow Googlebot',
    '✓ Crawl-delay = 0',
    '✓ Sitemap URL included',
    '✓ No blocking of important pages',
    '✓ Host directive included'
];

/**
 * 8. STRUCTURED DATA OPTIMIZATION
 * - Sử dụng đúng schema types
 * - Validate schema với Google Rich Results Test
 * - Tránh duplicate schemas
 */
export const STRUCTURED_DATA_CHECKLIST = [
    '✓ Organization schema',
    '✓ BreadcrumbList schema',
    '✓ FAQPage schema (where applicable)',
    '✓ SoftwareApplication schema (for tools)',
    '✓ Article schema (for news)',
    '✓ No duplicate schemas'
];

/**
 * 9. PAGE SPEED OPTIMIZATION
 * Google ưu tiên index các trang nhanh
 */
export const PAGE_SPEED_OPTIMIZATIONS = [
    'Image optimization (WebP, lazy loading)',
    'Code splitting và dynamic imports',
    'CSS/JS minification',
    'CDN usage',
    'Caching headers',
    'Server-side rendering (SSR)'
];

/**
 * 10. MOBILE-FIRST INDEXING
 * Đảm bảo responsive và mobile-friendly
 */
export const MOBILE_OPTIMIZATION = [
    '✓ Responsive design',
    '✓ Viewport meta tag',
    '✓ Touch-friendly buttons',
    '✓ Fast mobile page speed',
    '✓ No mobile-only errors'
];

/**
 * CHECKLIST: Các bước để Google index nhanh hơn
 */
export const INDEXING_CHECKLIST = [
    {
        step: 1,
        action: 'Submit sitemap to Google Search Console',
        priority: 'HIGH',
        frequency: 'Once, then on major updates'
    },
    {
        step: 2,
        action: 'Request indexing for important pages via Search Console',
        priority: 'HIGH',
        frequency: 'When publishing new content'
    },
    {
        step: 3,
        action: 'Ping sitemap after updates',
        priority: 'MEDIUM',
        frequency: 'Daily or after major content updates'
    },
    {
        step: 4,
        action: 'Optimize Core Web Vitals',
        priority: 'HIGH',
        frequency: 'Ongoing monitoring'
    },
    {
        step: 5,
        action: 'Ensure fast page speed',
        priority: 'HIGH',
        frequency: 'Ongoing optimization'
    },
    {
        step: 6,
        action: 'Fix all crawl errors',
        priority: 'HIGH',
        frequency: 'Immediately when found'
    },
    {
        step: 7,
        action: 'Use proper canonical URLs',
        priority: 'MEDIUM',
        frequency: 'On all pages'
    },
    {
        step: 8,
        action: 'Implement internal linking strategy',
        priority: 'MEDIUM',
        frequency: 'On all pages'
    },
    {
        step: 9,
        action: 'Add structured data',
        priority: 'MEDIUM',
        frequency: 'On all pages'
    },
    {
        step: 10,
        action: 'Ensure mobile-friendly',
        priority: 'HIGH',
        frequency: 'On all pages'
    }
];

/**
 * Helper để generate priority cho sitemap dựa trên page importance
 */
export function getPagePriority(path, pageType) {
    // Homepage always highest
    if (path === '/') return 1.0;
    
    // Main tools and features
    if (path.match(/\/(soi-cau|ket-qua-xo-so|dan-)/)) return 0.95;
    
    // Important content pages
    if (path.match(/\/(thong-ke|tin-tuc)/)) return 0.85;
    
    // Static/info pages
    if (path.match(/\/(content|about)/)) return 0.70;
    
    // Default
    return 0.80;
}






















