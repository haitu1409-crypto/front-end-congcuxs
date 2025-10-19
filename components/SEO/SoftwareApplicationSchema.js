/**
 * SoftwareApplication Schema Component
 * Tells search engines this is a web application
 * Can appear in app search results
 */

import React from 'react';

export default function SoftwareApplicationSchema({ pageName = 'home' }) {
    const baseSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Dàn Đề Wukong",
        "applicationCategory": "UtilityApplication",
        "applicationSubCategory": "Calculator",
        "operatingSystem": "Web Browser, iOS, Android, Windows, macOS",
        "url": "https://taodandewukong.pro",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "VND"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1250",
            "bestRating": "5",
            "worstRating": "1"
        },
        "author": {
            "@type": "Organization",
            "name": "Wukong Team"
        },
        "datePublished": "2024-01-01",
        "dateModified": new Date().toISOString().split('T')[0],
        "softwareVersion": "2.0",
        "screenshot": "https://taodandewukong.pro/imgs/wukong.png",
        "license": "https://taodandewukong.pro/terms"
    };

    // Customize description based on page
    const descriptions = {
        home: "Công cụ tạo dàn đề chuyên nghiệp #1 Việt Nam. Miễn phí 100%, không quảng cáo.",
        dan9x0x: "Tạo dàn 9x-0x ngẫu nhiên với thuật toán Fisher-Yates. Cắt dàn, lọc dàn, nuôi dàn khung.",
        dan2d: "Tạo dàn 2D (00-99) chuyên nghiệp. Bạch thủ, song thủ, lô đá. Lấy nhanh dàn đề.",
        dan3d4d: "Tạo dàn 3D-4D, ghép lotto 3-4 càng. Tách dàn AB-BC-CD tự động.",
        danDacBiet: "Lọc ghép dàn đề thông minh. Tạo dàn theo đầu, đuôi, tổng. Dàn 36-50 số.",
        thongKe: "Thống kê xổ số 3 miền XSMB XSMN XSMT. Phân tích tần suất, số nóng số lạnh.",
    };

    const features = {
        home: [
            "Tạo dàn 9x-0x ngẫu nhiên",
            "Tạo dàn 2D, 3D, 4D",
            "Lọc ghép dàn đề",
            "Nuôi dàn khung 3-5 ngày",
            "Ghép lô xiên 2-3-4 càng",
            "Bảng tính chào gấp thếp",
            "Thống kê xổ số 3 miền",
            "Miễn phí 100%"
        ],
        dan9x0x: [
            "Tạo dàn 90 số ngẫu nhiên",
            "Cắt dàn theo ý muốn",
            "Lọc dàn thông minh",
            "Nuôi dàn khung 3-5 ngày",
            "Thuật toán Fisher-Yates chuẩn"
        ],
        dan2d: [
            "Tạo dàn 00-99",
            "Phân loại bạch thủ, song thủ",
            "Lô đá, xiên quay",
            "Lấy nhanh dàn đặc biệt",
            "Chuyển đổi 1D sang 2D"
        ],
        dan3d4d: [
            "Tạo dàn 3 càng, 4 càng",
            "Ghép lotto tự động",
            "Tách dàn AB-BC-CD",
            "Dàn từ giải đặc biệt"
        ],
        danDacBiet: [
            "Lọc ghép dàn đề",
            "Tạo dàn theo đầu đuôi tổng",
            "Dàn chạm, bộ",
            "Lấy nhanh 36-50 số",
            "Dàn bất tử"
        ],
        thongKe: [
            "Thống kê XSMB XSMN XSMT",
            "Phân tích tần suất",
            "Số nóng số lạnh",
            "Bảng thống kê chi tiết",
            "Cập nhật realtime"
        ]
    };

    const schema = {
        ...baseSchema,
        "description": descriptions[pageName] || descriptions.home,
        "featureList": features[pageName] || features.home
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}




