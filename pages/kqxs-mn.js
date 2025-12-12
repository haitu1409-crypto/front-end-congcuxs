/**
 * Kết Quả Xổ Số Miền Nam Page
 * Trang hiển thị danh sách kết quả xổ số miền nam với phân trang
 * SEO Optimized with competitive keywords
 * Auto-refresh enabled to show latest results
 */

import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import XSMNLatest10Table from '../components/XSMNLatest10Table';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../styles/KQXS.module.css';
import { getPageSEO, generateFAQSchema } from '../config/seoConfig';
import EnhancedSEOHead from '../components/EnhancedSEOHead';
import { isWithinLiveWindowXSMN } from '../utils/lotteryUtils';

const LiveResultXSMN = dynamic(() => import('../components/LiveResultXSMN'), {
    loading: () => (
        <div className={styles.liveFallback}>
            <div className={styles.spinner}></div>
            <p>Đang tải kết quả trực tiếp...</p>
        </div>
    ),
    ssr: false
});

const KQXSMNPage = memo(function KQXSMNPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pagination, setPagination] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isLiveWindow, setIsLiveWindow] = useState(false);

    const intervalRef = useRef(null);

    const handlePageChange = useCallback((newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [totalPages]);

    const handlePaginationChange = useCallback((paginationData) => {
        setPagination(paginationData);
        setTotalPages(paginationData?.totalPages || 1);
        setLastUpdated(new Date());
    }, []);

    useEffect(() => {
        const checkLiveWindow = () => {
            setIsLiveWindow(isWithinLiveWindowXSMN());
        };

        checkLiveWindow();

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        const interval = isLiveWindow ? 5000 : 30000;
        intervalRef.current = setInterval(checkLiveWindow, interval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isLiveWindow]);

    const siteUrl = useMemo(() =>
        process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro',
        []
    );

    const seoConfig = useMemo(() => getPageSEO('kqxs-xsmn'), []);

    const { today, dayOfWeek } = useMemo(() => {
        const now = new Date();
        return {
            today: now.toLocaleDateString('vi-VN'),
            dayOfWeek: ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][now.getDay()]
        };
    }, []);

    const pageTitle = useMemo(() =>
        `XSMN - Kết Quả Xổ Số Miền Nam Hôm Nay ${today} | SXMN - KQXSMN Nhanh Nhất 2025`,
        [today]
    );

    const h1Title = useMemo(() =>
        `XSMN - Kết Quả Xổ Số Miền Nam Hôm Nay ${today}`,
        [today]
    );

    const pageDescription = useMemo(() =>
        `XSMN - Kết quả xổ số miền Nam (xsmn, sxmn, kqxsmn) hôm nay ${today} nhanh nhất, chính xác nhất. Tường thuật trực tiếp từ các tỉnh miền Nam. Xem XSMN 30 ngày, XSMN hôm qua, XSMN ${dayOfWeek}. Miễn phí 100%!`,
        [today, dayOfWeek]
    );

    const faqData = useMemo(() => [
        {
            question: 'XSMN là gì?',
            answer: 'XSMN là viết tắt của Xổ số Miền Nam. Đây là kết quả xổ số được quay thưởng hàng ngày tại các tỉnh miền Nam Việt Nam.'
        },
        {
            question: 'XSMN có bao nhiêu tỉnh mỗi ngày?',
            answer: 'XSMN có từ 3-4 tỉnh quay số mỗi ngày, tùy thuộc vào ngày trong tuần. Ví dụ: Chủ nhật có 4 tỉnh (TP.HCM, Long An, Bình Phước, Hậu Giang).'
        },
        {
            question: 'XSMN có giải 8 không?',
            answer: 'Có, XSMN có giải 8 (G8) với 2 số cuối, khác với XSMB không có giải 8.'
        },
        {
            question: 'Có thể xem XSMN 30 ngày không?',
            answer: `Có, bạn có thể xem XSMN 30 ngày gần nhất tại ${siteUrl}/ket-qua-xo-so-mien-nam. Trang này hiển thị kết quả xổ số miền Nam với phân trang, mỗi trang 10 kết quả, sắp xếp từ mới nhất đến cũ nhất.`
        },
        {
            question: 'Xem XSMN ở đâu tốt nhất?',
            answer: 'Taodandewukong.pro cung cấp kết quả XSMN nhanh nhất, chính xác nhất. Hoàn toàn miễn phí, không cần đăng ký, cập nhật tự động sau khi quay số.'
        }
    ], [siteUrl]);

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
                    '@id': `${siteUrl}/ket-qua-xo-so-mien-nam`
                },
                'keywords': seoConfig.keywords.slice(0, 50).join(', ')
            },
            generateFAQSchema(faqData),
            {
                '@context': 'https://schema.org',
                '@type': 'Dataset',
                'name': 'Kết Quả Xổ Số Miền Nam (XSMN)',
                'description': 'Kết quả xổ số miền Nam (XSMN, SXMN, KQXSMN) được cập nhật hàng ngày',
                'url': `${siteUrl}/ket-qua-xo-so-mien-nam`,
                'temporalCoverage': '2025-01-01/..',
                'spatialCoverage': 'Miền Nam, Việt Nam',
                'keywords': 'xsmn, sxmn, kqxsmn, kết quả xổ số miền nam',
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
                pageType="kqxs-xsmn"
                title={pageTitle}
                description={pageDescription}
                keywords={seoConfig.keywords.join(', ')}
                canonical={`${seoConfig.canonical}`}
                ogImage={`${siteUrl}/imgs/xsmn.png`}
                structuredData={structuredData}
            />

            <Layout>
                <div className={styles.container}>
                    {isLiveWindow && (
                        <div className={styles.liveSection}>
                            <LiveResultXSMN showChatPreview={true} />
                        </div>
                    )}

                    <h1 className={styles.pageTitle} style={{ contain: 'layout style paint' }}>
                        {h1Title}
                    </h1>

                    <div className={styles.resultsSection}>
                        <XSMNLatest10Table
                            page={currentPage}
                            limit={10}
                            onPaginationChange={handlePaginationChange}
                            key={currentPage}
                        />
                    </div>

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

                    <div className={styles.infoSection}>
                        <div className={styles.infoCard}>
                            <h3>Thông Tin XSMN - Kết Quả Xổ Số Miền Nam</h3>
                            <ul>
                                <li><strong>XSMN hôm nay:</strong> Hiển thị 10 kết quả XSMN mới nhất mỗi trang</li>
                                <li><strong>Sắp xếp:</strong> Từ mới nhất đến cũ nhất (XSMN mới nhất ở đầu)</li>
                                <li><strong>XSMN trực tiếp:</strong> Dữ liệu được cập nhật tự động từ nguồn chính thức sau khi quay số</li>
                                <li><strong>Phân trang:</strong> Hỗ trợ xem XSMN 30 ngày, XSMN 90 ngày, XSMN hôm qua</li>
                                <li><strong>XSMN theo thứ:</strong> Xem XSMN thứ 2, thứ 3, thứ 4, thứ 5, thứ 6, thứ 7, chủ nhật</li>
                            </ul>
                        </div>

                        <div className={styles.infoCard}>
                            <h3>Lịch Quay Số XSMN - Xổ Số Miền Nam</h3>
                            <ul>
                                <li><strong>Miền Nam (XSMN/SXMN/KQXSMN):</strong> Hàng ngày lúc <strong>16h15</strong></li>
                                <li><strong>Số tỉnh:</strong> 3-4 tỉnh mỗi ngày tùy theo ngày trong tuần</li>
                                <li><strong>Địa điểm:</strong> Các tỉnh thành miền Nam Việt Nam</li>
                                <li><strong>Tường thuật XSMN:</strong> Tự động sau khi quay số, cập nhật nhanh nhất</li>
                                <li><strong>Nguồn dữ liệu:</strong> Chính thức từ các công ty xổ số miền Nam</li>
                                <li><strong>Thời gian cập nhật:</strong> Tự động ngay sau khi có kết quả quay số</li>
                            </ul>
                        </div>

                        <div className={styles.infoCard}>
                            <h3>Ưu Điểm XSMN Tại Taodandewukong.pro</h3>
                            <ul>
                                <li>✅ <strong>Nhanh nhất:</strong> Cập nhật XSMN ngay sau khi quay số</li>
                                <li>✅ <strong>Chính xác:</strong> Kết quả XSMN chính xác 100%, đối chiếu từ nguồn chính thức</li>
                                <li>✅ <strong>Đầy đủ:</strong> Hiển thị đầy đủ tất cả giải: Đặc biệt, Nhất, Nhì, Ba, Tư, Năm, Sáu, Bảy, Tám</li>
                                <li>✅ <strong>Nhiều tỉnh:</strong> Hiển thị kết quả từ 3-4 tỉnh cùng lúc</li>
                                <li>✅ <strong>Phân trang thông minh:</strong> Dễ dàng xem XSMN 30 ngày, XSMN hôm qua, XSMN theo từng ngày</li>
                                <li>✅ <strong>Miễn phí 100%:</strong> Không cần đăng ký, không có quảng cáo popup</li>
                                <li>✅ <strong>Responsive:</strong> Xem XSMN trên mọi thiết bị: mobile, tablet, desktop</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
});

KQXSMNPage.displayName = 'KQXSMNPage';

export default KQXSMNPage;








