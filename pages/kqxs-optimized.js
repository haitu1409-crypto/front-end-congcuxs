/**
 * Optimized Kết Quả Xổ Số Page
 * Trang kết quả xổ số tối ưu SEO và hiệu suất
 */

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../components/Layout';
import SEOOptimizedXSMB from '../components/SEOOptimizedXSMB';
import styles from '../styles/KQXS.module.css';

// Lazy load components
const XSMBLatest10Table = dynamic(() => import('../components/XSMBLatest10Table'), {
    loading: () => <div className={styles.loadingMessage}>Đang tải kết quả...</div>,
    ssr: false
});

const KQXSOptimizedPage = ({ initialData, initialPagination }) => {
    const router = useRouter();
    const [data, setData] = useState(initialData || []);
    const [pagination, setPagination] = useState(initialPagination || {});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Generate structured data for the page
    const pageStructuredData = useMemo(() => {
        return {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Kết quả xổ số miền Bắc - Dàn Đề Wukong",
            "description": "Xem kết quả xổ số miền Bắc mới nhất, cập nhật trực tiếp từ Công ty Xổ số Điện toán Việt Nam",
            "url": "https://taodandewukong.pro/ket-qua-xo-so-mien-bac",
            "mainEntity": {
                "@type": "ItemList",
                "name": "Danh sách kết quả xổ số miền Bắc",
                "numberOfItems": pagination.totalResults || 0,
                "itemListElement": data.slice(0, 10).map((item, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "item": {
                        "@type": "LotteryGame",
                        "name": `Kết quả xổ số miền Bắc ngày ${item.drawDate}`,
                        "datePublished": item.drawDate
                    }
                }))
            },
            "publisher": {
                "@type": "Organization",
                "name": "Dàn Đề Wukong",
                "url": "https://taodandewukong.pro"
            }
        };
    }, [data, pagination]);

    // Generate FAQ structured data
    const faqStructuredData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Kết quả xổ số miền Bắc được công bố khi nào?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Kết quả xổ số miền Bắc được công bố hàng ngày lúc 18h30, trừ chủ nhật. Kết quả được cập nhật trực tiếp trên website Dàn Đề Wukong."
                }
            },
            {
                "@type": "Question",
                "name": "Có bao nhiêu giải thưởng trong xổ số miền Bắc?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Xổ số miền Bắc có 7 giải thưởng: Giải Đặc biệt (1 giải), Giải Nhất (1 giải), Giải Nhì (2 giải), Giải Ba (6 giải), Giải Tư (4 giải), Giải Năm (6 giải), Giải Sáu (3 giải), Giải Bảy (4 giải)."
                }
            },
            {
                "@type": "Question",
                "name": "Làm thế nào để tra cứu kết quả xổ số miền Bắc?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Bạn có thể tra cứu kết quả xổ số miền Bắc trên website Dàn Đề Wukong bằng cách chọn ngày muốn xem hoặc xem kết quả mới nhất. Kết quả được cập nhật tự động và chính xác 100%."
                }
            }
        ]
    };

    // Handle pagination change
    const handlePaginationChange = (newPagination) => {
        setPagination(newPagination);
    };

    // Handle refresh
    const handleRefresh = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/xsmb/latest?limit=10');
            const result = await response.json();
            if (result.success) {
                setData(result.data);
                setPagination(result.pagination);
            }
        } catch (err) {
            setError('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                {/* Basic Meta Tags */}
                <title>Kết quả xổ số miền Bắc mới nhất - Dàn Đề Wukong</title>
                <meta name="description" content="Xem kết quả xổ số miền Bắc mới nhất, cập nhật trực tiếp từ Công ty Xổ số Điện toán Việt Nam. Tra cứu kết quả theo ngày, thống kê và phân tích." />
                <meta name="keywords" content="kết quả xổ số miền bắc, xsmb, xổ số miền bắc, kết quả xsmb, tra cứu xổ số, thống kê xổ số" />

                {/* Open Graph Meta Tags */}
                <meta property="og:title" content="Kết quả xổ số miền Bắc mới nhất - Dàn Đề Wukong" />
                <meta property="og:description" content="Xem kết quả xổ số miền Bắc mới nhất, cập nhật trực tiếp từ Công ty Xổ số Điện toán Việt Nam." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://taodandewukong.pro/ket-qua-xo-so-mien-bac" />
                <meta property="og:site_name" content="Dàn Đề Wukong" />
                <meta property="og:locale" content="vi_VN" />

                {/* Twitter Card Meta Tags */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Kết quả xổ số miền Bắc mới nhất" />
                <meta name="twitter:description" content="Xem kết quả xổ số miền Bắc mới nhất, cập nhật trực tiếp từ Công ty Xổ số Điện toán Việt Nam." />

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
                <link rel="canonical" href="https://taodandewukong.pro/ket-qua-xo-so-mien-bac" />

                {/* Alternate Language Versions */}
                <link rel="alternate" hrefLang="vi" href="https://taodandewukong.pro/ket-qua-xo-so-mien-bac" />

                {/* Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(pageStructuredData)
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(faqStructuredData)
                    }}
                />
            </Head>

            <Layout>
                <div className={styles.container}>
                    {/* Header Section */}
                    <header className={styles.header}>
                        <h1 style={{
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: '#333',
                            marginBottom: '15px',
                            textAlign: 'center'
                        }}>
                            Kết Quả Xổ Số Miền Bắc
                        </h1>
                        <p style={{
                            fontSize: '18px',
                            color: '#666',
                            textAlign: 'center',
                            marginBottom: '20px'
                        }}>
                            Cập nhật trực tiếp từ Công ty Xổ số Điện toán Việt Nam
                        </p>

                        {/* Refresh Button */}
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <button
                                onClick={handleRefresh}
                                disabled={loading}
                                style={{
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    padding: '12px 24px',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    fontWeight: 'bold',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.6 : 1,
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {loading ? 'Đang tải...' : 'Làm mới kết quả'}
                            </button>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main>
                        {error && (
                            <div style={{
                                backgroundColor: '#f8d7da',
                                color: '#721c24',
                                padding: '15px',
                                borderRadius: '6px',
                                marginBottom: '20px',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        <XSMBLatest10Table
                            onPaginationChange={handlePaginationChange}
                        />
                    </main>

                    {/* SEO Content Section */}
                    <section style={{
                        marginTop: '50px',
                        padding: '30px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '12px',
                        lineHeight: '1.8'
                    }}>
                        <h2 style={{
                            fontSize: '24px',
                            marginBottom: '20px',
                            color: '#333',
                            textAlign: 'center'
                        }}>
                            Thông tin về kết quả xổ số miền Bắc
                        </h2>

                        <div style={{ fontSize: '16px', color: '#555' }}>
                            <p>
                                <strong>Kết quả xổ số miền Bắc</strong> được công bố hàng ngày lúc 18h30,
                                trừ chủ nhật. Xổ số miền Bắc là một trong những loại hình xổ số phổ biến nhất
                                tại Việt Nam với tổng giá trị giải thưởng lên đến hàng tỷ đồng.
                            </p>

                            <p>
                                <strong>Dàn Đề Wukong</strong> cung cấp kết quả xổ số miền Bắc chính xác,
                                cập nhật nhanh nhất để người chơi có thể tra cứu và tham khảo.
                                Chúng tôi cam kết mang đến thông tin chính xác 100% từ nguồn chính thức.
                            </p>

                            <h3 style={{ fontSize: '20px', marginTop: '25px', marginBottom: '15px', color: '#333' }}>
                                Các giải thưởng trong xổ số miền Bắc:
                            </h3>
                            <ul style={{ paddingLeft: '20px' }}>
                                <li><strong>Giải Đặc biệt:</strong> 1 giải, giá trị cao nhất</li>
                                <li><strong>Giải Nhất:</strong> 1 giải</li>
                                <li><strong>Giải Nhì:</strong> 2 giải</li>
                                <li><strong>Giải Ba:</strong> 6 giải</li>
                                <li><strong>Giải Tư:</strong> 4 giải</li>
                                <li><strong>Giải Năm:</strong> 6 giải</li>
                                <li><strong>Giải Sáu:</strong> 3 giải</li>
                                <li><strong>Giải Bảy:</strong> 4 giải</li>
                            </ul>
                        </div>
                    </section>
                </div>
            </Layout>
        </>
    );
};

export default KQXSOptimizedPage;
