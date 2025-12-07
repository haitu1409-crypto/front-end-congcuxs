/**
 * Kết Quả Xổ Số Page
 * Trang hiển thị danh sách kết quả xổ số với phân trang
 * SEO Optimized with competitive keywords
 * Auto-refresh enabled to show latest results
 */

import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import XSMBLatest10Table from '../components/XSMBLatest10Table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../styles/KQXS.module.css';
import { getPageSEO, generateFAQSchema } from '../config/seoConfig';
import EnhancedSEOHead from '../components/EnhancedSEOHead';
import { isWithinLiveWindow } from '../utils/lotteryUtils';

const LiveResult = dynamic(() => import('../components/LiveResult'), {
    loading: () => (
        <div className={styles.liveFallback}>
            <div className={styles.spinner}></div>
            <p>Đang tải kết quả trực tiếp...</p>
        </div>
    ),
    ssr: false
});

const KQXSPage = memo(function KQXSPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isLiveWindow, setIsLiveWindow] = useState(false);

    // ✅ Use ref to store interval ID and avoid re-creating interval
    const intervalRef = useRef(null);

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

    // ✅ Optimized: Check live window periodically with useRef to prevent re-creation
    useEffect(() => {
        const checkLiveWindow = () => {
            setIsLiveWindow(isWithinLiveWindow());
        };

        // Check immediately
        checkLiveWindow();

        // Clear existing interval if any
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Set interval based on current state
        const interval = isLiveWindow ? 5000 : 30000;
        intervalRef.current = setInterval(checkLiveWindow, interval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isLiveWindow]);

    // Note: Auto-refresh is handled by useXSMBLatest10 hook
    // No need for manual refresh since the hook fetches latest data on mount
    // and can be configured with refreshInterval if needed

    // ✅ Cache siteUrl to avoid recalculating
    const siteUrl = useMemo(() =>
        process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro',
        []
    );

    // ✅ Memoize SEO config to avoid recalculating on every render
    const seoConfig = useMemo(() => getPageSEO('kqxs'), []);

    // ✅ Memoize date calculations to avoid recalculating on every render
    const { today, dayOfWeek } = useMemo(() => {
        const now = new Date();
        return {
            today: now.toLocaleDateString('vi-VN'),
            dayOfWeek: ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][now.getDay()]
        };
    }, []);

    // ✅ Memoize page titles and description
    const pageTitle = useMemo(() =>
        `XSMB - Kết Quả Xổ Số Miền Bắc Đài Truyền Thống Hôm Nay ${today} | SXMB - KQXSMB - XSTD Nhanh Nhất 2025`,
        [today]
    );

    const h1Title = useMemo(() =>
        `XSMB - Kết Quả Xổ Số Miền Bắc Đài Truyền Thống Hôm Nay ${today}`,
        [today]
    );

    const pageDescription = useMemo(() =>
        `XSMB - Kết quả xổ số miền Bắc đài truyền thống (xsmb, sxmb, kqxsmb, xstd) hôm nay ${today} nhanh nhất, chính xác nhất. Tường thuật trực tiếp lúc 18h15 từ trường quay số 53E Hàng Bài, Hoàn Kiếm, Hà Nội. Xem XSMB 30 ngày, XSMB hôm qua, XSMB ${dayOfWeek}. Tốt hơn xosodaiphat, xoso.com.vn, xskt.com.vn. Miễn phí 100%!`,
        [today, dayOfWeek]
    );

    // ✅ Memoize FAQ data to avoid recreating on every render
    const faqData = useMemo(() => [
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
            answer: `Có, bạn có thể xem XSMB 30 ngày gần nhất tại ${siteUrl}/ket-qua-xo-so-mien-bac. Trang này hiển thị kết quả xổ số miền Bắc với phân trang, mỗi trang 10 kết quả, sắp xếp từ mới nhất đến cũ nhất.`
        },
        {
            question: 'XSMB khác với SXMB, KQXSMB, XSTD như thế nào?',
            answer: 'XSMB, SXMB, KQXSMB, XSTD đều là các cách viết khác nhau của cùng một khái niệm: Kết quả Xổ số Miền Bắc. XSTD là Xổ số Thủ đô. Tất cả đều chỉ kết quả xổ số miền Bắc hàng ngày.'
        },
        {
            question: 'Xem XSMB ở đâu tốt nhất?',
            answer: 'Taodandewukong.pro cung cấp kết quả XSMB nhanh nhất, chính xác nhất, tốt hơn xosodaiphat, xoso.com.vn, xskt.com.vn. Hoàn toàn miễn phí, không cần đăng ký, cập nhật tự động sau khi quay số.'
        }
    ], [siteUrl]);

    // ✅ FIX: Structured data với useMemo để tránh hydration error
    // ✅ Optimized: Use cached siteUrl and memoized values
    const structuredData = useMemo(() => {
        const normalizedDate = new Date();
        normalizedDate.setHours(0, 0, 0, 0);
        const deterministicDate = normalizedDate.toISOString();

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
                    '@id': `${siteUrl}/ket-qua-xo-so-mien-bac`
                },
                'keywords': seoConfig.keywords.slice(0, 50).join(', ')
            },
            generateFAQSchema(faqData),
            {
                '@context': 'https://schema.org',
                '@type': 'Dataset',
                'name': 'Kết Quả Xổ Số Miền Bắc (XSMB)',
                'description': 'Kết quả xổ số miền Bắc (XSMB, SXMB, KQXSMB, XSTD) được cập nhật hàng ngày lúc 18h15',
                'url': `${siteUrl}/ket-qua-xo-so-mien-bac`,
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
    }, [pageTitle, pageDescription, seoConfig.keywords, siteUrl, faqData]);

    return (
        <>
            <EnhancedSEOHead
                pageType="kqxs"
                title={pageTitle}
                description={pageDescription}
                keywords={seoConfig.keywords.join(', ')}
                canonical={`${seoConfig.canonical}`}
                ogImage={`${siteUrl}/imgs/xsmb.png`}
                structuredData={structuredData}
            />

            <Layout>
                <div className={styles.container}>
                    {isLiveWindow && (
                        <div className={styles.liveSection}>
                            <LiveResult showChatPreview={true} />
                        </div>
                    )}

                    {/* Header Section - ✅ LCP Element: Add fetchpriority hint */}
                    <h1 className={styles.pageTitle} style={{ contain: 'layout style paint' }}>
                        {h1Title}
                    </h1>

                    {/* Results Section - ✅ FIX CLS: Container with reserved space */}
                    <div className={styles.resultsSection}>
                        <XSMBLatest10Table
                            page={currentPage}
                            limit={10}
                            onPaginationChange={handlePaginationChange}
                            key={currentPage} // Force re-render when page changes
                        />
                    </div>

                    {/* Pagination - Optimized with CSS module */}
                    <div className={styles.pagination}>
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={styles.paginationButton}
                            aria-label="Trang trước"
                        >
                            <ChevronLeft size={20} />
                            Trước
                        </button>

                        <span className={styles.paginationInfo}>
                            Trang {currentPage} / {totalPages}
                        </span>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={styles.paginationButton}
                            aria-label="Trang sau"
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
