/**
 * SEO Head Component
 * Component tối ưu SEO cho trang dàn đề
 */

import Head from 'next/head';

const SEOHead = ({
    title = "Tạo Dàn Đề Online Miễn Phí | Công Cụ Lọc Dàn Đề Chuyên Nghiệp #1 Việt Nam",
    description = "Công cụ tạo dàn đề 9x-0x online miễn phí hàng đầu Việt Nam. Tạo dàn đề ngẫu nhiên, lọc dàn đề từ cao thủ, chọn bộ số đặc biệt, thêm số mong muốn, loại bỏ kép bằng. Công cụ dàn đề chuyên nghiệp nhất 2024.",
    keywords = "tạo dàn đề, tạo dàn đề online, công cụ tạo dàn đề, tạo dàn đề miễn phí, dàn đề 9x-0x, lọc dàn đề, bộ số đặc biệt, dàn đề ngẫu nhiên, tạo dàn lô số, công cụ lô số, số mong muốn, loại bỏ số, kép bằng, dàn đề chuyên nghiệp, cao thủ lô số, cách tạo dàn đề 9x-0x, tạo dàn đề có chọn số mong muốn, lọc dàn đề từ cao thủ, bộ số đặc biệt lô số, công cụ tạo dàn đề online miễn phí, tạo dàn đề loại bỏ kép bằng, dàn đề chuyên nghiệp nhất, tạo dàn đề Việt Nam, công cụ lô số Việt Nam, dàn đề online Việt",
    canonical = "https://your-domain.com",
    image = "/og-image.png"
}) => {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Công Cụ Tạo Dàn Đề Online Miễn Phí",
        "description": description,
        "url": canonical,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Web Browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "VND"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1250"
        },
        "featureList": [
            "Tạo dàn đề ngẫu nhiên 9x-0x",
            "Lọc dàn đề chuyên nghiệp từ cao thủ",
            "Chọn bộ số đặc biệt lô số",
            "Thêm số mong muốn vào dàn",
            "Loại bỏ số không mong muốn",
            "Loại bỏ kép bằng tự động",
            "Công cụ hoàn toàn miễn phí"
        ],
        "author": {
            "@type": "Organization",
            "name": "Dàn Đề Pro Việt Nam",
            "url": "https://your-domain.com"
        },
        "keywords": keywords,
        "inLanguage": "vi-VN",
        "isAccessibleForFree": true,
        "datePublished": "2024-01-01",
        "dateModified": "2024-12-01",
        "mainEntity": {
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "Làm thế nào để tạo dàn đề 9x-0x?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Sử dụng công cụ tạo dàn đề online miễn phí của chúng tôi. Chọn số lượng dàn, thêm số mong muốn (tối đa 40 số), loại bỏ số không mong muốn (tối đa 5 số), chọn bộ số đặc biệt và nhấn 'Tạo Dàn' để có kết quả ngay lập tức."
                    }
                },
                {
                    "@type": "Question",
                    "name": "Công cụ lọc dàn đề hoạt động như thế nào?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Công cụ lọc dàn đề cho phép bạn nhập dàn đề từ nhiều cao thủ khác nhau, sau đó lọc và tối ưu hóa để tạo ra dàn đề cuối cùng tốt nhất với các cấp độ từ 8s đến 95s."
                    }
                }
            ]
        }
    };

    return (
        <Head>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content="Dàn Đề Pro" />
            <meta name="robots" content="index, follow" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />

            {/* Canonical URL */}
            <link rel="canonical" href={canonical} />

            {/* Open Graph Meta Tags */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonical} />
            <meta property="og:image" content={image} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:site_name" content="Dàn Đề Pro" />
            <meta property="og:locale" content="vi_VN" />

            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Additional Meta Tags */}
            <meta name="theme-color" content="#1e40af" />
            <meta name="msapplication-TileColor" content="#1e40af" />
            <meta name="format-detection" content="telephone=no" />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            <meta name="apple-mobile-web-app-title" content="Tạo Dàn Đề" />

            {/* SEO Meta Tags */}
            <meta name="revisit-after" content="1 days" />
            <meta name="distribution" content="global" />
            <meta name="rating" content="general" />
            <meta name="language" content="Vietnamese" />
            <meta name="geo.region" content="VN" />
            <meta name="geo.country" content="Vietnam" />

            {/* Performance Hints */}
            <meta httpEquiv="x-dns-prefetch-control" content="on" />
            <link rel="dns-prefetch" href="//fonts.googleapis.com" />
            <link rel="dns-prefetch" href="//www.google-analytics.com" />

            {/* Preload Critical Resources */}
            <link rel="preload" href="/og-image.png" as="image" />

            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            {/* Preconnect for performance */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

            {/* Favicon */}
            <link rel="icon" href="/favicon.ico" />
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        </Head>
    );
};

export default SEOHead;
