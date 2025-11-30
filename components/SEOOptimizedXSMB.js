/**
 * SEO Optimized XSMB Component
 * Component tối ưu SEO cho kết quả xổ số
 */

import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import styles from '../styles/XSMBSimpleTable.module.css';

// Lazy load components
const XSMBSimpleTable = dynamic(() => import('./XSMBSimpleTable'), {
    loading: () => <div className={styles.loadingMessage}>Đang tải...</div>,
    ssr: false
});

const SEOOptimizedXSMB = ({
    data,
    date,
    title,
    description,
    canonicalUrl,
    structuredData
}) => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Generate structured data for lottery results
    const generateStructuredData = useMemo(() => {
        if (!data) return null;

        const structuredData = {
            "@context": "https://schema.org",
            "@type": "LotteryGame",
            "name": "Xổ Số Miền Bắc",
            "description": "Kết quả xổ số miền Bắc chính thức",
            "url": canonicalUrl || `https://taodandewukong.pro/kqxs/${date}`,
            "datePublished": data.drawDate || new Date().toISOString(),
            "publisher": {
                "@type": "Organization",
                "name": "Dàn Đề Wukong",
                "url": "https://taodandewukong.pro"
            },
            "gameResult": {
                "@type": "GameResult",
                "date": data.drawDate,
                "prizes": [
                    {
                        "@type": "Prize",
                        "name": "Giải Đặc Biệt",
                        "number": data.specialPrize
                    },
                    {
                        "@type": "Prize",
                        "name": "Giải Nhất",
                        "number": data.firstPrize
                    }
                ]
            }
        };

        return structuredData;
    }, [data, date, canonicalUrl]);

    // Generate breadcrumb structured data
    const breadcrumbStructuredData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Trang chủ",
                "item": "https://taodandewukong.pro"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Kết quả xổ số",
                "item": "https://taodandewukong.pro/kqxs"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": title || `Kết quả ngày ${date}`,
                "item": canonicalUrl
            }
        ]
    };

    // Generate FAQ structured data
    const faqStructuredData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Kết quả xổ số miền Bắc ngày nào được công bố?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Kết quả xổ số miền Bắc được công bố hàng ngày lúc 18h30, trừ chủ nhật."
                }
            },
            {
                "@type": "Question",
                "name": "Có bao nhiêu giải thưởng trong xổ số miền Bắc?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Xổ số miền Bắc có 7 giải thưởng: Đặc biệt, Nhất, Nhì, Ba, Tư, Năm, Sáu, Bảy."
                }
            }
        ]
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getDayOfWeek = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return days[date.getDay()];
    };

    return (
        <>
            <Head>
                {/* Basic Meta Tags */}
                <title>{title || `Kết quả xổ số miền Bắc ngày ${date} - Dàn Đề Wukong`}</title>
                <meta name="description" content={description || `Xem kết quả xổ số miền Bắc ngày ${date}. Cập nhật trực tiếp, chính xác 100% từ Công ty Xổ số Điện toán Việt Nam.`} />
                <meta name="keywords" content={`kết quả xổ số miền bắc, xsmb ngày ${date}, xổ số miền bắc, kết quả xsmb, ${getDayOfWeek(date)}`} />

                {/* Open Graph Meta Tags */}
                <meta property="og:title" content={title || `Kết quả xổ số miền Bắc ngày ${date}`} />
                <meta property="og:description" content={description || `Xem kết quả xổ số miền Bắc ngày ${date}. Cập nhật trực tiếp, chính xác 100%.`} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:site_name" content="Dàn Đề Wukong" />
                <meta property="og:locale" content="vi_VN" />

                {/* Twitter Card Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={title || `Kết quả xổ số miền Bắc ngày ${date}`} />
                <meta name="twitter:description" content={description || `Xem kết quả xổ số miền Bắc ngày ${date}. Cập nhật trực tiếp, chính xác 100%.`} />

                {/* Additional SEO Meta Tags */}
                <meta name="robots" content="index, follow" />
                <meta name="googlebot" content="index, follow" />
                <meta name="author" content="Dàn Đề Wukong" />
                <meta name="publisher" content="Dàn Đề Wukong" />
                <meta name="copyright" content="Dàn Đề Wukong" />
                <meta name="language" content="vi" />
                <meta name="geo.region" content="VN" />
                <meta name="geo.country" content="Vietnam" />

                {/* Canonical URL */}
                <link rel="canonical" href={canonicalUrl} />

                {/* Alternate Language Versions */}
                <link rel="alternate" hrefLang="vi" href={canonicalUrl} />

                {/* Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(generateStructuredData)
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(breadcrumbStructuredData)
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(faqStructuredData)
                    }}
                />
            </Head>

            <div className={styles.container}>
                {/* Breadcrumb */}
                <nav aria-label="breadcrumb" style={{ marginBottom: '20px' }}>
                    <ol style={{
                        display: 'flex',
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        fontSize: '14px',
                        color: '#666'
                    }}>
                        <li><a href="/" style={{ color: '#007bff', textDecoration: 'none' }}>Trang chủ</a></li>
                        <li style={{ margin: '0 8px' }}>›</li>
                        <li><a href="/ket-qua-xo-so-mien-bac" style={{ color: '#007bff', textDecoration: 'none' }}>Kết quả xổ số</a></li>
                        <li style={{ margin: '0 8px' }}>›</li>
                        <li style={{ color: '#333' }}>{title || `Ngày ${date}`}</li>
                    </ol>
                </nav>

                {/* Page Header */}
                <header style={{ marginBottom: '30px', textAlign: 'center' }}>
                    <h1 style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        color: '#333',
                        marginBottom: '10px',
                        lineHeight: '1.2'
                    }}>
                        {title || `Kết quả xổ số miền Bắc ngày ${date}`}
                    </h1>
                    <p style={{
                        fontSize: '16px',
                        color: '#666',
                        margin: 0
                    }}>
                        {formatDate(date)} - Cập nhật trực tiếp từ Công ty Xổ số Điện toán Việt Nam
                    </p>
                </header>

                {/* Main Content */}
                <main>
                    {isClient && data && (
                        <XSMBSimpleTable
                            data={data}
                            date={date}
                            showLoto={true}
                            autoFetch={false}
                        />
                    )}
                </main>

                {/* Additional SEO Content */}
                <section style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <h2 style={{ fontSize: '20px', marginBottom: '15px', color: '#333' }}>
                        Thông tin về kết quả xổ số miền Bắc
                    </h2>
                    <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#555' }}>
                        <p>
                            Kết quả xổ số miền Bắc được công bố hàng ngày lúc 18h30, trừ chủ nhật.
                            Xổ số miền Bắc có 7 giải thưởng với tổng giá trị giải thưởng lên đến hàng tỷ đồng.
                        </p>
                        <p>
                            Dàn Đề Wukong cung cấp kết quả xổ số miền Bắc chính xác, cập nhật nhanh nhất
                            để người chơi có thể tra cứu và tham khảo.
                        </p>
                    </div>
                </section>
            </div>
        </>
    );
};

export default SEOOptimizedXSMB;
