/**
 * Kết Quả Xổ Số Page
 * Trang hiển thị danh sách kết quả xổ số với phân trang
 * SEO Optimized with competitive keywords
 * Auto-refresh enabled to show latest results
 */

import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import Layout from '../components/Layout';
import XSMBLatest10Table from '../components/XSMBLatest10Table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../styles/KQXS.module.css';
import { getPageSEO, generateFAQSchema } from '../config/seoConfig';
import EnhancedSEOHead from '../components/EnhancedSEOHead';

const KQXSPage = memo(function KQXSPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Handle page change - Memoized with useCallback
    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            // Scroll to top when page changes
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [totalPages]);

    // Memoize pagination callback
    const handlePaginationChange = useCallback((paginationData) => {
        setPagination(paginationData);
        setTotalPages(paginationData?.totalPages || 1);
        setLastUpdated(new Date()); // Track last update
    }, []);

    // Note: Auto-refresh is handled by useXSMBLatest10 hook
    // No need for manual refresh since the hook fetches latest data on mount
    // and can be configured with refreshInterval if needed

    // SEO Configuration với keywords mở rộng
    const seoConfig = getPageSEO('kqxs');
    const today = new Date().toLocaleDateString('vi-VN');
    const dayOfWeek = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][new Date().getDay()];
    
    // Meta title (cho SEO)
    const pageTitle = `XSMB - Kết Quả Xổ Số Miền Bắc Hôm Nay ${today} | SXMB - KQXSMB - XSTD Nhanh Nhất 2025`;
    
    // H1 title (ngắn gọn, user-friendly)
    const h1Title = `XSMB - Kết Quả Xổ Số Miền Bắc Hôm Nay ${today}`;
    
    const pageDescription = `XSMB - Kết quả xổ số miền Bắc (xsmb, sxmb, kqxsmb, xstd) hôm nay ${today} nhanh nhất, chính xác nhất. Tường thuật trực tiếp lúc 18h15 từ trường quay. Xem XSMB 30 ngày, XSMB hôm qua, XSMB ${dayOfWeek}. Tốt hơn xosodaiphat, xoso.com.vn, xskt.com.vn. Miễn phí 100%!`;

    // FIX: Structured data với useMemo để tránh hydration error
    const structuredData = useMemo(() => {
        const normalizedDate = new Date();
        normalizedDate.setHours(0, 0, 0, 0);
        const deterministicDate = normalizedDate.toISOString();
        
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro';
        
        // FAQ Schema cho SEO
        const faqData = [
            {
                question: 'XSMB là gì?',
                answer: 'XSMB là viết tắt của Xổ số Miền Bắc (hoặc Xổ số Miền Bắc). Đây là kết quả xổ số được quay thưởng hàng ngày lúc 18h15 tại trường quay số 53E Hàng Bài, Hoàn Kiếm, Hà Nội.'
            },
            {
                question: 'XSMB hôm nay quay lúc mấy giờ?',
                answer: 'XSMB quay thưởng hàng ngày lúc 18h15 (hoặc 18h10 theo một số nguồn). Kết quả được tường thuật trực tiếp từ trường quay và cập nhật ngay sau khi quay số.'
            },
            {
                question: 'Có thể xem XSMB 30 ngày không?',
                answer: `Có, bạn có thể xem XSMB 30 ngày gần nhất tại taodandewukong.pro/kqxs. Trang này hiển thị kết quả xổ số miền Bắc với phân trang, mỗi trang 10 kết quả, sắp xếp từ mới nhất đến cũ nhất.`
            },
            {
                question: 'XSMB khác với SXMB, KQXSMB, XSTD như thế nào?',
                answer: 'XSMB, SXMB, KQXSMB, XSTD đều là các cách viết khác nhau của cùng một khái niệm: Kết quả Xổ số Miền Bắc. XSTD là Xổ số Thủ đô. Tất cả đều chỉ kết quả xổ số miền Bắc hàng ngày.'
            },
            {
                question: 'Xem XSMB ở đâu tốt nhất?',
                answer: 'Taodandewukong.pro cung cấp kết quả XSMB nhanh nhất, chính xác nhất, tốt hơn xosodaiphat, xoso.com.vn, xskt.com.vn. Hoàn toàn miễn phí, không cần đăng ký, cập nhật tự động sau khi quay số.'
            }
        ];
        
        return [
            {
                '@context': 'https://schema.org',
                '@type': 'CollectionPage',
                'headline': pageTitle,
                'description': pageDescription,
                'datePublished': deterministicDate,
                'dateModified': deterministicDate,
                'author': {
                    '@type': 'Organization',
                    'name': 'Dàn Đề Wukong'
                },
                'publisher': {
                    '@type': 'Organization',
                    'name': 'Dàn Đề Wukong',
                    'logo': {
                        '@type': 'ImageObject',
                        'url': `${siteUrl}/imgs/wukong.png`
                    }
                },
                'mainEntityOfPage': {
                    '@type': 'WebPage',
                    '@id': `${siteUrl}/kqxs`
                },
                'keywords': seoConfig.keywords.slice(0, 50).join(', ')
            },
            generateFAQSchema(faqData),
            {
                '@context': 'https://schema.org',
                '@type': 'Dataset',
                'name': 'Kết Quả Xổ Số Miền Bắc (XSMB)',
                'description': 'Kết quả xổ số miền Bắc (XSMB, SXMB, KQXSMB, XSTD) được cập nhật hàng ngày lúc 18h15',
                'url': `${siteUrl}/kqxs`,
                'temporalCoverage': '2025-01-01/..',
                'spatialCoverage': 'Hà Nội, Miền Bắc, Việt Nam',
                'keywords': 'xsmb, sxmb, kqxsmb, xstd, kết quả xổ số miền bắc',
                'license': 'https://creativecommons.org/licenses/by/4.0/',
                'provider': {
                    '@type': 'Organization',
                    'name': 'Dàn Đề Wukong',
                    'url': siteUrl
                }
            }
        ];
    }, [pageTitle, pageDescription, seoConfig.keywords]);

    return (
        <>
            <EnhancedSEOHead
                title={pageTitle}
                description={pageDescription}
                keywords={seoConfig.keywords.join(', ')}
                canonical={`${seoConfig.canonical}`}
                ogImage={seoConfig.image}
                structuredData={structuredData}
            />

            <Layout>
                <div className={styles.container}>
                    {/* Header Section */}
                    <h1 style={{ marginBottom: '20px', textAlign: 'center', color: 'rgb(51, 51, 51)' }}>
                        {h1Title}
                    </h1>

                    {/* Results Section */}
                    <div className={styles.resultsSection}>
                        <XSMBLatest10Table
                            page={currentPage}
                            limit={10}
                            onPaginationChange={handlePaginationChange}
                            key={currentPage} // Force re-render when page changes
                        />
                    </div>

                    {/* Pagination */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px',
                        marginTop: '30px',
                        padding: '20px',
                        background: '#f8f9fa',
                        borderRadius: '8px'
                    }}>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            style={{
                                padding: '10px 15px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                background: currentPage === 1 ? '#f0f0f0' : '#fff',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            <ChevronLeft size={20} />
                            Trước
                        </button>

                        <span style={{
                            padding: '10px 20px',
                            fontSize: '16px',
                            fontWeight: '500'
                        }}>
                            Trang {currentPage} / {totalPages}
                        </span>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            style={{
                                padding: '10px 15px',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                background: currentPage === totalPages ? '#f0f0f0' : '#fff',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            Sau
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Info Section - Enhanced với SEO Keywords */}
                    <div className={styles.infoSection}>
                        <div className={styles.infoCard}>
                            <h3>Thông Tin XSMB - Kết Quả Xổ Số Miền Bắc</h3>
                            <ul>
                                <li><strong>XSMB hôm nay:</strong> Hiển thị 10 kết quả XSMB mới nhất mỗi trang</li>
                                <li><strong>Sắp xếp:</strong> Từ mới nhất đến cũ nhất (XSMB mới nhất ở đầu)</li>
                                <li><strong>XSMB trực tiếp:</strong> Dữ liệu được cập nhật tự động từ nguồn chính thức sau khi quay số</li>
                                <li><strong>Phân trang:</strong> Hỗ trợ xem XSMB 30 ngày, XSMB 90 ngày, XSMB hôm qua</li>
                                <li><strong>XSMB theo thứ:</strong> Xem XSMB thứ 2, thứ 3, thứ 4, thứ 5, thứ 6, thứ 7, chủ nhật</li>
                            </ul>
                        </div>

                        <div className={styles.infoCard}>
                            <h3>Lịch Quay Số XSMB - Xổ Số Miền Bắc</h3>
                            <ul>
                                <li><strong>Miền Bắc (XSMB/SXMB/KQXSMB/XSTD):</strong> Hàng ngày lúc <strong>18h15</strong></li>
                                <li><strong>Địa điểm:</strong> Trường quay số 53E Hàng Bài, Hoàn Kiếm, Hà Nội</li>
                                <li><strong>Tường thuật XSMB:</strong> Tự động sau khi quay số, cập nhật nhanh nhất</li>
                                <li><strong>Nguồn dữ liệu:</strong> Chính thức từ Công ty Xổ số Kiến thiết Thủ Đô</li>
                                <li><strong>Thời gian cập nhật:</strong> Tự động ngay sau khi có kết quả quay số</li>
                            </ul>
                        </div>
                        
                        <div className={styles.infoCard}>
                            <h3>Ưu Điểm XSMB Tại Taodandewukong.pro</h3>
                            <ul>
                                <li>✅ <strong>Nhanh nhất:</strong> Cập nhật XSMB ngay sau khi quay số, nhanh hơn <strong>xosodaiphat</strong>, <strong>xoso.com.vn</strong></li>
                                <li>✅ <strong>Chính xác:</strong> Kết quả XSMB chính xác 100%, đối chiếu từ nguồn chính thức</li>
                                <li>✅ <strong>Đầy đủ:</strong> Hiển thị đầy đủ tất cả giải: Đặc biệt, Nhất, Nhì, Ba, Tư, Năm, Sáu, Bảy</li>
                                <li>✅ <strong>Phân trang thông minh:</strong> Dễ dàng xem XSMB 30 ngày, XSMB hôm qua, XSMB theo từng ngày</li>
                                <li>✅ <strong>Miễn phí 100%:</strong> Không cần đăng ký, không có quảng cáo popup như một số trang đối thủ</li>
                                <li>✅ <strong>Responsive:</strong> Xem XSMB trên mọi thiết bị: mobile, tablet, desktop</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
});

KQXSPage.displayName = 'KQXSPage';

export default KQXSPage;
