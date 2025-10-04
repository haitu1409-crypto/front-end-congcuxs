/**
 * Dynamic Robots.txt Generator
 * Tạo robots.txt động cho Next.js
 */

function Robots() {
    // This function will be called by Next.js
}

export async function getServerSideProps({ res }) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com';

    const robotsTxt = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Allow all search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /

User-agent: YandexBot
Allow: /

# Block unwanted bots
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /`;

    res.setHeader('Content-Type', 'text/plain');
    res.write(robotsTxt);
    res.end();

    return {
        props: {},
    };
}

export default Robots;
