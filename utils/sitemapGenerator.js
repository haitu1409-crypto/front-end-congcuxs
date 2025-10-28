/**
 * Sitemap Generator
 * Tạo sitemap tối ưu hóa SEO cho website soi cầu
 */

import seoContentGenerator from './seoContentGenerator';

class SitemapGenerator {
    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
        this.pages = [
            {
                url: '/',
                priority: 1.0,
                changefreq: 'daily',
                lastmod: new Date().toISOString()
            },
            {
                url: '/seo-soi-cau-vi-tri',
                priority: 0.9,
                changefreq: 'daily',
                lastmod: new Date().toISOString()
            },
            {
                url: '/soi-cau-xsmb',
                priority: 0.8,
                changefreq: 'daily',
                lastmod: new Date().toISOString()
            },
            {
                url: '/du-doan-xsmb',
                priority: 0.8,
                changefreq: 'daily',
                lastmod: new Date().toISOString()
            },
            {
                url: '/thong-ke-xsmb',
                priority: 0.7,
                changefreq: 'weekly',
                lastmod: new Date().toISOString()
            },
            {
                url: '/cau-bach-thu',
                priority: 0.7,
                changefreq: 'daily',
                lastmod: new Date().toISOString()
            },
            {
                url: '/soi-cau-hom-nay',
                priority: 0.8,
                changefreq: 'daily',
                lastmod: new Date().toISOString()
            }
        ];
    }

    /**
     * Tạo XML sitemap
     */
    generateXMLSitemap() {
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${this.pages.map(page => this.generateURLNode(page)).join('\n')}
</urlset>`;

        return sitemap;
    }

    /**
     * Tạo URL node cho sitemap
     */
    generateURLNode(page) {
        return `  <url>
    <loc>${this.baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${page.images ? page.images.map(img => this.generateImageNode(img)).join('\n    ') : ''}
  </url>`;
    }

    /**
     * Tạo image node cho sitemap
     */
    generateImageNode(image) {
        return `<image:image>
      <image:loc>${image.loc}</image:loc>
      <image:caption>${image.caption}</image:caption>
      <image:title>${image.title}</image:title>
    </image:image>`;
    }

    /**
     * Tạo sitemap index
     */
    generateSitemapIndex() {
        return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${this.baseUrl}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${this.baseUrl}/sitemap-images.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;
    }

    /**
     * Tạo robots.txt
     */
    generateRobotsTxt() {
        return seoContentGenerator.generateRobotsTxt();
    }

    /**
     * Tạo sitemap cho images
     */
    generateImageSitemap() {
        const images = [
            {
                loc: `${this.baseUrl}/images/soi-cau-vi-tri.jpg`,
                caption: 'Soi Cầu Vị Trí XSMB',
                title: 'Soi Cầu Vị Trí XSMB - Dự Đoán Xổ Số Miền Bắc'
            },
            {
                loc: `${this.baseUrl}/images/soi-cau-xsmb.jpg`,
                caption: 'Soi Cầu XSMB',
                title: 'Soi Cầu XSMB - Dự Đoán Xổ Số Miền Bắc'
            },
            {
                loc: `${this.baseUrl}/images/du-doan-xsmb.jpg`,
                caption: 'Dự Đoán XSMB',
                title: 'Dự Đoán XSMB - Soi Cầu Miền Bắc'
            }
        ];

        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${this.pages.map(page => {
            const pageImages = images.filter(img => page.url.includes(img.title.toLowerCase().replace(/\s+/g, '-')));
            return this.generateURLNodeWithImages(page, pageImages);
        }).join('\n')}
</urlset>`;
    }

    /**
     * Tạo URL node với images
     */
    generateURLNodeWithImages(page, images) {
        return `  <url>
    <loc>${this.baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    ${images.map(img => this.generateImageNode(img)).join('\n    ')}
  </url>`;
    }
}

// Export singleton instance
const sitemapGenerator = new SitemapGenerator();

export default sitemapGenerator;
