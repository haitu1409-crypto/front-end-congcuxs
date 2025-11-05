/**
 * Dynamic Robots.txt Generator
 * Auto-generates robots.txt with correct production URL
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro';

export async function getServerSideProps({ res }) {
    const robotsTxt = `# *
User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Googlebot
User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Googlebot-Image
User-agent: Googlebot-Image
Allow: /

# bingbot
User-agent: bingbot
Allow: /
Crawl-delay: 0

# coccoc
User-agent: coccoc
Allow: /
Crawl-delay: 0

# Host
Host: ${SITE_URL}

# Sitemaps
Sitemap: ${SITE_URL}/sitemap.xml`;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
    res.write(robotsTxt);
    res.end();

    return {
        props: {}
    };
}

export default function RobotsTxt() {
    // getServerSideProps will handle the response
    return null;
}

