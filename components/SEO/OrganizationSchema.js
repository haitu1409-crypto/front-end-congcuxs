/**
 * Organization Schema Component
 * Structured data for search engines to understand website/organization
 * Helps with brand recognition and rich snippets
 */

import React from 'react';

export default function OrganizationSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Dàn Đề Wukong",
        "alternateName": [
            "TaoDanDeWukong",
            "Tạo Dàn Đề Wukong",
            "Wukong Pro"
        ],
        "url": "https://taodandewukong.pro",
        "logo": {
            "@type": "ImageObject",
            "url": "https://taodandewukong.pro/imgs/wukong.png",
            "width": 512,
            "height": 512
        },
        "image": "https://taodandewukong.pro/imgs/wukong.png",
        "description": "Công cụ tạo dàn đề chuyên nghiệp #1 Việt Nam. Miễn phí 100%, không quảng cáo. Hỗ trợ: Dàn 9x-0x, 2D, 3D, 4D, Ghép lô xiên, Bảng tính chào, Thống kê xổ số.",
        "slogan": "Công cụ tạo dàn đề chuyên nghiệp hàng đầu Việt Nam",
        "foundingDate": "2024",
        "founder": {
            "@type": "Organization",
            "name": "Wukong Team"
        },
        "email": "support@taodandewukong.pro",
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "VN",
            "addressLocality": "Vietnam"
        },
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "availableLanguage": ["Vietnamese", "vi"],
            "areaServed": "VN"
        },
        "sameAs": [
            "https://facebook.com/taodandewukong",
            "https://youtube.com/@taodandewukong",
            "https://tiktok.com/@taodandewukong"
        ],
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "1250",
            "bestRating": "5",
            "worstRating": "1"
        },
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "VND",
            "availability": "https://schema.org/InStock",
            "url": "https://taodandewukong.pro"
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}


