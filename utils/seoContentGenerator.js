/**
 * SEO Content Generator
 * Tạo nội dung SEO tối ưu hóa cho page soi cầu vị trí
 */

class SEOContentGenerator {
    constructor() {
        this.keywords = {
            primary: [
                'soi cầu vị trí',
                'soi cầu XSMB',
                'dự đoán xổ số miền bắc',
                'soi cầu MB',
                'cầu bạch thủ',
                'thống kê vị trí XSMB'
            ],
            secondary: [
                'soi cầu hôm nay',
                'dự đoán XSMB',
                'xổ số miền bắc',
                'kết quả xổ số MB',
                'cầu lô kẹp',
                'soi cầu miền bắc',
                'dự đoán xổ số',
                'thống kê xổ số'
            ],
            longTail: [
                'soi cầu vị trí XSMB hôm nay',
                'dự đoán xổ số miền bắc chính xác',
                'soi cầu bạch thủ miền bắc',
                'thống kê vị trí xổ số miền bắc',
                'soi cầu MB theo vị trí',
                'dự đoán XSMB dựa trên vị trí số'
            ]
        };

        this.contentTemplates = {
            titles: [
                'Soi Cầu Vị Trí XSMB - Dự Đoán Xổ Số Miền Bắc Hôm Nay Chính Xác 100%',
                'Soi Cầu Vị Trí XSMB Hôm Nay - Thuật Toán AI Dự Đoán Xổ Số Miền Bắc',
                'Dự Đoán XSMB Theo Vị Trí - Soi Cầu Miền Bắc Chính Xác 100%',
                'Soi Cầu Bạch Thủ XSMB - Thống Kê Vị Trí Xổ Số Miền Bắc',
                'Soi Cầu Vị Trí XSMB 2025 - Dự Đoán Xổ Số Miền Bắc Siêu Chuẩn'
            ],
            descriptions: [
                'Soi cầu vị trí XSMB hôm nay với thuật toán AI tiên tiến. Dự đoán xổ số miền Bắc chính xác 100% dựa trên phân tích vị trí số. Thống kê soi cầu MB, cầu bạch thủ, cầu lô kẹp miễn phí.',
                'Thuật toán soi cầu vị trí XSMB sử dụng AI để phân tích vị trí số trong kết quả xổ số miền Bắc. Dự đoán chính xác 100% với tỷ lệ thành công cao. Soi cầu MB hôm nay miễn phí.',
                'Soi cầu vị trí XSMB là phương pháp dự đoán xổ số miền Bắc dựa trên phân tích vị trí số. Thuật toán AI tự động tìm ra pattern nhất quán, giúp dự đoán 2 số cuối giải đặc biệt với độ chính xác cao.',
                'Dự đoán XSMB theo vị trí số với thuật toán machine learning. Soi cầu bạch thủ, cầu lô kẹp, thống kê vị trí XSMB hôm nay. Miễn phí 100%, cập nhật real-time.',
                'Soi cầu vị trí XSMB 2025 với công nghệ AI tiên tiến. Phân tích vị trí số trong kết quả xổ số miền Bắc để dự đoán chính xác. Thống kê soi cầu MB, cầu bạch thủ miễn phí.'
            ]
        };
    }

    /**
     * Tạo title SEO tối ưu
     */
    generateSEOTitle(variation = 0) {
        const titles = this.contentTemplates.titles;
        return titles[variation % titles.length];
    }

    /**
     * Tạo description SEO tối ưu
     */
    generateSEODescription(variation = 0) {
        const descriptions = this.contentTemplates.descriptions;
        return descriptions[variation % descriptions.length];
    }

    /**
     * Tạo keywords string
     */
    generateKeywordsString() {
        return [
            ...this.keywords.primary,
            ...this.keywords.secondary,
            ...this.keywords.longTail
        ].join(', ');
    }

    /**
     * Tạo nội dung SEO cho section
     */
    generateSectionContent(sectionType, data = {}) {
        const sections = {
            introduction: {
                title: 'Soi Cầu Vị Trí XSMB - Phương Pháp Dự Đoán Tiên Tiến',
                content: `Soi cầu vị trí XSMB là phương pháp phân tích vị trí của từng chữ số trong kết quả xổ số miền Bắc. 
                Thuật toán AI của chúng tôi sử dụng machine learning để tìm ra các pattern nhất quán, 
                giúp dự đoán 2 số cuối giải đặc biệt với độ chính xác cao.`,
                keywords: ['soi cầu vị trí XSMB', 'thuật toán AI', 'dự đoán xổ số miền bắc']
            },
            advantages: {
                title: 'Ưu Điểm Của Soi Cầu Vị Trí XSMB',
                content: `Soi cầu vị trí XSMB mang lại nhiều ưu điểm vượt trội so với các phương pháp truyền thống. 
                Thuật toán AI phân tích dữ liệu lịch sử 30 ngày, tự động cập nhật pattern, 
                đạt độ chính xác > 75% trong việc dự đoán kết quả xổ số.`,
                keywords: ['ưu điểm soi cầu vị trí', 'thuật toán AI XSMB', 'độ chính xác cao']
            },
            statistics: {
                title: 'Thống Kê Vị Trí XSMB Hôm Nay',
                content: `Thống kê vị trí XSMB được cập nhật liên tục dựa trên kết quả xổ số miền Bắc mới nhất. 
                Chúng tôi phân tích các vị trí số xuất hiện nhiều nhất, tìm ra các cầu bạch thủ, 
                cầu lô kẹp có khả năng về cao trong ngày.`,
                keywords: ['thống kê vị trí XSMB', 'cầu bạch thủ', 'cầu lô kẹp']
            },
            methods: {
                title: 'Các Phương Pháp Soi Cầu Vị Trí XSMB',
                content: `Có nhiều phương pháp soi cầu vị trí XSMB khác nhau, mỗi phương pháp có ưu điểm riêng. 
                Soi cầu bạch thủ dự đoán 2 số cuối giải đặc biệt, cầu lô kẹp tìm các cặp số kẹp nhau, 
                thống kê vị trí phân tích vị trí số xuất hiện nhiều nhất.`,
                keywords: ['phương pháp soi cầu vị trí', 'soi cầu bạch thủ', 'cầu lô kẹp XSMB']
            }
        };

        return sections[sectionType] || sections.introduction;
    }

    /**
     * Tạo FAQ content
     */
    generateFAQContent() {
        return [
            {
                question: 'Soi cầu vị trí XSMB là gì?',
                answer: 'Soi cầu vị trí XSMB là phương pháp phân tích vị trí của từng chữ số trong kết quả xổ số miền Bắc để tìm ra các pattern nhất quán, giúp dự đoán kết quả xổ số với độ chính xác cao.',
                keywords: ['soi cầu vị trí XSMB', 'phương pháp phân tích', 'pattern nhất quán']
            },
            {
                question: 'Độ chính xác của soi cầu vị trí XSMB là bao nhiêu?',
                answer: 'Thuật toán AI của chúng tôi đạt độ chính xác > 75% trong việc dự đoán 2 số cuối giải đặc biệt, dựa trên phân tích dữ liệu lịch sử và pattern recognition.',
                keywords: ['độ chính xác soi cầu vị trí', 'thuật toán AI', 'dự đoán giải đặc biệt']
            },
            {
                question: 'Có cần đăng ký để sử dụng soi cầu vị trí XSMB không?',
                answer: 'Không, bạn có thể sử dụng hoàn toàn miễn phí mà không cần đăng ký tài khoản. Chúng tôi cung cấp dịch vụ soi cầu vị trí XSMB miễn phí 100%.',
                keywords: ['soi cầu vị trí miễn phí', 'không cần đăng ký', 'dịch vụ miễn phí']
            },
            {
                question: 'Soi cầu vị trí XSMB có khác gì so với soi cầu thông thường?',
                answer: 'Soi cầu vị trí XSMB phân tích vị trí cụ thể của từng chữ số trong kết quả xổ số, trong khi soi cầu thông thường chỉ dựa trên tổng hợp. Phương pháp này cho độ chính xác cao hơn.',
                keywords: ['soi cầu vị trí vs thông thường', 'phân tích vị trí cụ thể', 'độ chính xác cao']
            },
            {
                question: 'Làm thế nào để sử dụng soi cầu vị trí XSMB hiệu quả?',
                answer: 'Để sử dụng hiệu quả, bạn nên kết hợp nhiều phương pháp soi cầu, theo dõi thống kê vị trí thường xuyên, và chọn các cầu có độ tin cậy cao. Tránh đặt cược quá nhiều vào một cầu duy nhất.',
                keywords: ['sử dụng soi cầu hiệu quả', 'kết hợp phương pháp', 'độ tin cậy cao']
            }
        ];
    }

    /**
     * Tạo structured data
     */
    generateStructuredData(pageData = {}) {
        return {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": pageData.title || "Soi Cầu Vị Trí XSMB",
            "description": pageData.description || "Soi cầu vị trí XSMB với thuật toán AI",
            "url": pageData.url || "https://yourdomain.com/seo-soi-cau-vi-tri",
            "mainEntity": {
                "@type": "SoftwareApplication",
                "name": "Soi Cầu Vị Trí XSMB",
                "description": "Ứng dụng soi cầu vị trí xổ số miền Bắc với AI",
                "applicationCategory": "GameApplication",
                "operatingSystem": "Web Browser",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "VND"
                }
            },
            "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Trang chủ",
                        "item": "https://yourdomain.com"
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Soi Cầu",
                        "item": "https://yourdomain.com/soi-cau"
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": "Soi Cầu Vị Trí XSMB",
                        "item": "https://yourdomain.com/seo-soi-cau-vi-tri"
                    }
                ]
            },
            "author": {
                "@type": "Organization",
                "name": "Dàn Đề Wukong"
            },
            "datePublished": new Date().toISOString(),
            "dateModified": new Date().toISOString()
        };
    }

    /**
     * Tạo meta tags
     */
    generateMetaTags(pageData = {}) {
        return {
            title: pageData.title || this.generateSEOTitle(),
            description: pageData.description || this.generateSEODescription(),
            keywords: this.generateKeywordsString(),
            ogTitle: pageData.title || this.generateSEOTitle(),
            ogDescription: pageData.description || this.generateSEODescription(),
            ogImage: "https://yourdomain.com/images/soi-cau-vi-tri-og.jpg",
            twitterTitle: pageData.title || this.generateSEOTitle(),
            twitterDescription: pageData.description || this.generateSEODescription(),
            twitterImage: "https://yourdomain.com/images/soi-cau-vi-tri-twitter.jpg"
        };
    }

    /**
     * Tạo internal links
     */
    generateInternalLinks() {
        return [
            {
                text: 'Soi Cầu XSMB',
                url: '/soi-cau-xsmb',
                anchor: 'soi-cau-xsmb'
            },
            {
                text: 'Dự Đoán Xổ Số Miền Bắc',
                url: '/du-doan-xsmb',
                anchor: 'du-doan-xsmb'
            },
            {
                text: 'Thống Kê XSMB',
                url: '/thong-ke-xsmb',
                anchor: 'thong-ke-xsmb'
            },
            {
                text: 'Cầu Bạch Thủ',
                url: '/cau-bach-thu',
                anchor: 'cau-bach-thu'
            },
            {
                text: 'Soi Cầu Hôm Nay',
                url: '/soi-cau-hom-nay',
                anchor: 'soi-cau-hom-nay'
            }
        ];
    }

    /**
     * Tạo sitemap data
     */
    generateSitemapData() {
        return {
            url: 'https://yourdomain.com/seo-soi-cau-vi-tri',
            lastmod: new Date().toISOString(),
            changefreq: 'daily',
            priority: 0.9,
            images: [
                {
                    loc: 'https://yourdomain.com/images/soi-cau-vi-tri.jpg',
                    caption: 'Soi Cầu Vị Trí XSMB',
                    title: 'Soi Cầu Vị Trí XSMB - Dự Đoán Xổ Số Miền Bắc'
                }
            ]
        };
    }

    /**
     * Tạo robots.txt content
     */
    generateRobotsTxt() {
        return `User-agent: *
Allow: /
Allow: /seo-soi-cau-vi-tri
Allow: /soi-cau-*
Allow: /du-doan-*

Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/

Sitemap: https://yourdomain.com/sitemap.xml
Sitemap: https://yourdomain.com/sitemap-images.xml`;
    }

    /**
     * Tạo performance monitoring script
     */
    generatePerformanceScript() {
        return `
            // Performance monitoring for SEO
            window.addEventListener('load', function() {
                // Core Web Vitals
                if (typeof performance !== 'undefined' && performance.timing) {
                    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                    console.log('Page load time:', loadTime + 'ms');
                    
                    // Send to analytics
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'page_load_time', {
                            'custom_parameter_1': loadTime,
                            'page_title': '${this.generateSEOTitle()}'
                        });
                    }
                }
                
                // Track user engagement
                let engagementTime = 0;
                const startTime = Date.now();
                
                document.addEventListener('click', function() {
                    engagementTime = Date.now() - startTime;
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'user_engagement', {
                            'engagement_time': engagementTime
                        });
                    }
                });
            });
        `;
    }
}

// Export singleton instance
const seoContentGenerator = new SEOContentGenerator();

export default seoContentGenerator;
