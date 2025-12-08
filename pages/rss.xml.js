/**
 * RSS Feed Generator
 * Auto-generates RSS feed from latest articles
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
// Normalize SITE_URL - remove trailing slash to avoid double slashes
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro').replace(/\/+$/, '');
const SITE_NAME = 'Tạo Dàn Đề Wukong - Tin Tức Xổ Số';
const SITE_DESCRIPTION = 'Tin tức xổ số, lô đề, thống kê và kinh nghiệm chơi mới nhất 24/7';

function generateRssFeed(articles) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/">
    <channel>
        <title>${SITE_NAME}</title>
        <link>${SITE_URL}/tin-tuc</link>
        <description>${SITE_DESCRIPTION}</description>
        <language>vi</language>
        <copyright>Copyright ${new Date().getFullYear()} ${SITE_NAME}</copyright>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
        <image>
            <url>${SITE_URL}/imgs/wukong.png</url>
            <title>${SITE_NAME}</title>
            <link>${SITE_URL}</link>
        </image>
        
        ${articles.map(article => `
        <item>
            <title>${escapeXml(article.title)}</title>
            <link>${SITE_URL}/tin-tuc/${article.slug}</link>
            <guid isPermaLink="true">${SITE_URL}/tin-tuc/${article.slug}</guid>
            <description>${escapeXml(article.excerpt || article.summary || '')}</description>
            <content:encoded><![CDATA[${article.content || article.excerpt || ''}]]></content:encoded>
            <pubDate>${new Date(article.publishedAt || article.createdAt).toUTCString()}</pubDate>
            <dc:creator>${escapeXml(article.author?.name || 'Admin')}</dc:creator>
            ${article.category ? `<category>${escapeXml(getCategoryLabel(article.category))}</category>` : ''}
            ${article.featuredImage?.url ? `
            <media:content url="${article.featuredImage.url}" medium="image" type="image/jpeg">
                <media:title>${escapeXml(article.title)}</media:title>
                <media:description>${escapeXml(article.featuredImage.alt || article.title)}</media:description>
            </media:content>
            <enclosure url="${article.featuredImage.url}" type="image/jpeg" />` : ''}
        </item>`).join('')}
    </channel>
</rss>`;
}

function getCategoryLabel(category) {
    const labels = {
        'du-doan-ket-qua-xo-so': 'Dự Đoán Kết Quả Xổ Số',
        'dan-de-chuyen-nghiep': 'Dàn Đề Chuyên Nghiệp',
        'thong-ke-xo-so': 'Thống Kê Xổ Số',
        'giai-ma-giac-mo': 'Giải Mã Giấc Mơ',
        'tin-tuc-xo-so': 'Tin Tức Xổ Số',
        'kinh-nghiem-choi-lo-de': 'Kinh Nghiệm Chơi Lô Đề',
        'meo-vat-xo-so': 'Mẹo Vặt Xổ Số',
        'phuong-phap-soi-cau': 'Phương Pháp Soi Cầu',
        'huong-dan-choi': 'Hướng Dẫn Chơi'
    };
    return labels[category] || 'Tin Tức';
}

function escapeXml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe).replace(/[<>&'"]/g, (c) => {
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
    try {
        // Fetch latest 50 articles
        const response = await fetch(`${API_URL}/api/articles?limit=50&sort=-publishedAt`);
        const data = await response.json();

        const articles = data.success ? data.data.articles : [];

        // Generate RSS feed
        const rssFeed = generateRssFeed(articles);

        // Set headers
        res.setHeader('Content-Type', 'application/rss+xml; charset=UTF-8');
        res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate');

        // Write feed
        res.write(rssFeed);
        res.end();

    } catch (error) {
        console.error('RSS generation error:', error);

        // Return minimal feed on error
        const minimalFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>${SITE_NAME}</title>
        <link>${SITE_URL}/tin-tuc</link>
        <description>${SITE_DESCRIPTION}</description>
        <language>vi</language>
    </channel>
</rss>`;

        res.setHeader('Content-Type', 'application/rss+xml; charset=UTF-8');
        res.write(minimalFeed);
        res.end();
    }

    return {
        props: {}
    };
}

export default function RssFeed() {
    // getServerSideProps will handle the response
    return null;
}

