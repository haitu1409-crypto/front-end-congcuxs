/**
 * Dynamic Robots.txt Generator
 * Tạo robots.txt động cho Next.js
 * Từ dự án cũ - Index nhanh (2 ngày)
 */

function Robots() {
    // This function will be called by Next.js
}

export async function getServerSideProps({ res }) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro';

    const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/news-sitemap.xml

# Crawl-delay for respectful crawling (Từ dự án cũ - Index nhanh)
Crawl-delay: 1

# Allow all search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Googlebot-Image
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 0

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /

User-agent: YandexBot
Allow: /

User-agent: coccoc
Allow: /
Crawl-delay: 0

# Block unwanted bots
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /_next/static/
Disallow: /static/
Disallow: /auth/
Disallow: /*.json$`;

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.write(robotsTxt);
    res.end();

    return {
        props: {},
    };
}

export default Robots;

