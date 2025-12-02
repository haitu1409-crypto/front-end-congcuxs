import React, { useState, useCallback, useEffect, useMemo, lazy, Suspense, useRef } from 'react';
import Layout from '../../components/Layout';
import { apiMB } from '../api/kqxsMB';
import styles from '../../styles/logan.module.css';
import Link from 'next/link';
import { useRouter } from 'next/router';
import StatisticsSEO from '../../components/StatisticsSEO';
const statisticsFAQs = require('../../config/statisticsFAQs');

// Lazy load non-critical components
const ThongKe = lazy(() => import('../../components/ThongKe'));
const CongCuHot = lazy(() => import('../../components/CongCuHot'));

// Skeleton Loading Component
const SkeletonRow = () => (
    <tr>
        <td className={styles.number}><div className={styles.skeleton}></div></td>
        <td className={styles.date}><div className={styles.skeleton}></div></td>
        <td className={styles.gapDraws}><div className={styles.skeleton}></div></td>
    </tr>
);

const SkeletonTable = () => (
    <table className={styles.tableLoGan}>
        <thead>
            <tr>
                <th>Số</th>
                <th>Ngày ra cuối</th>
                <th>Ngày gan</th>
            </tr>
        </thead>
        <tbody>
            {Array(5).fill().map((_, index) => (
                <SkeletonRow key={`skeleton-${index}`} />
            ))}
        </tbody>
    </table>
);

// Lazy load DescriptionContent
const DescriptionContent = lazy(() => import('./DescriptionContent'));

const Logan = ({ initialStats, initialMetadata, initialDays }) => {
    const router = useRouter();
    const [stats, setStats] = useState(initialStats || []);
    const [metadata, setMetadata] = useState(initialMetadata || {});
    const [days, setDays] = useState(initialDays || 6);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const scrollBtnRef = useRef(null);
    const scrollTimeoutRef = useRef(null);

    // Fetch API
    const fetchLoGanStats = useCallback(async (days) => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiMB.getLoGanStats(days);
            // Đảm bảo metadata được cập nhật đúng
            if (data && data.metadata) {
                setMetadata(data.metadata);
            } else {
                setMetadata({});
            }
            setStats(data.statistics || []);
        } catch (err) {
            const errorMessage = err.message || 'Có lỗi xảy ra khi lấy dữ liệu.';
            setError(errorMessage);
            setStats([]);
            setMetadata({});
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDaysChange = useCallback((e) => {
        const selectedDays = Number(e.target.value);
        setDays(selectedDays);
    }, []);

    const toggleContent = () => {
        setIsExpanded(!isExpanded);
    };

    // Memoize bảng dữ liệu
    const tableData = useMemo(() => {
        if (!stats || !Array.isArray(stats)) {
            return [];
        }
        return stats.map((stat, index) => ({
            id: `logan-${index}-${stat.number || index}`,
            number: stat.number?.toString().padStart(2, '0') || index.toString().padStart(2, '0'),
            lastAppeared: stat.lastAppeared || '',
            gapDraws: stat.gapDraws || 0,
        }));
    }, [stats]);

    useEffect(() => {
        fetchLoGanStats(days);
    }, [days, fetchLoGanStats]);

    // Optimized scroll handler with debounce and CSS-based visibility
    useEffect(() => {
        const handleScroll = () => {
            if (scrollTimeoutRef.current) {
                cancelAnimationFrame(scrollTimeoutRef.current);
            }
            
            scrollTimeoutRef.current = requestAnimationFrame(() => {
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercentage = (scrollTop / windowHeight) * 100;
                
                if (scrollBtnRef.current) {
                    if (scrollPercentage > 50) {
                        scrollBtnRef.current.classList.add(styles.scrollBtnVisible);
                    } else {
                        scrollBtnRef.current.classList.remove(styles.scrollBtnVisible);
                    }
                }
            });
        };
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeoutRef.current) {
                cancelAnimationFrame(scrollTimeoutRef.current);
            }
        };
    }, []);

    const getTitle = () => {
        const daysText = days === 6 ? 'Dưới 7 ngày' :
            days === 7 ? 'Từ 7 đến 14 ngày' :
                days === 14 ? 'Từ 14 đến 28 ngày' :
                    days === 30 ? 'Trong 30 ngày' : 'Trong 60 ngày';
        return (
            <>
                Thống kê Lô Gan Xổ Số{' '}
                <span className={styles.highlightProvince}>Miền Bắc</span>{' '}
                <span className={styles.highlightDraws}>{daysText}</span>
            </>
        );
    };

    const getMessage = () => {
        const daysText = days === 6 ? 'Dưới 7 ngày' :
            days === 7 ? 'Từ 7 đến 14 ngày' :
                days === 14 ? 'Từ 14 đến 28 ngày' :
                    days === 30 ? 'Trong 30 ngày' : 'Trong 60 ngày';
        return (
            <>
                Thống kê Lô Gan trong{' '}
                <span className={styles.highlightDraws}>{daysText}</span> Xổ số{' '}
                <span className={styles.highlightProvince}>Miền Bắc</span>
            </>
        );
    };

    const pageTitle = `Lô gan miền Bắc - Thống kê Lô Gan XSMB - Lo gan MB`;
    const pageDescription = `Xem bảng thống kê Lô Gan Miền Bắc lâu chưa về nhất. Cập nhật dữ liệu từ ${metadata.startDate} đến ${metadata.endDate || 'hàng ngày'}.`;

    return (
        <Layout>
            <StatisticsSEO 
                pageType="lo-gan"
                metadata={{
                    startDate: metadata.startDate,
                    endDate: metadata.endDate
                }}
                faq={statisticsFAQs['lo-gan']}
                customDescription={pageDescription}
            />

            <div className={styles.container}>
                <div className={styles.titleGroup} data-lcp="true">
                    <h1 className={styles.title}>{getTitle()}</h1>
                    <div className={styles.actionBtn}>
                        <Link className={styles.actionTK} href="/thongke/dau-duoi">
                            Thống Kê Đầu Đuôi
                        </Link>
                        <Link
                            className={`${styles.actionTK} ${router.pathname.startsWith('/thongke/lo-gan') ? styles.active : ''}`}
                            href="/thongke/lo-gan"
                        >
                            Thống Kê Lô Gan
                        </Link>
                        <Link className={styles.actionTK} href="/thongke/giai-dac-biet">
                            Thống Kê Giải Đặc Biệt
                        </Link>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className={styles.groupSelect}>
                        <div className={styles.selectGroup}>
                            <label className={styles.options}>Thời gian:</label>
                            <select
                                className={styles.selectBox}
                                value={days}
                                onChange={handleDaysChange}
                                aria-label="Chọn thời gian để xem thống kê lô gan"
                            >
                                <option value={6}>6 ngày</option>
                                <option value={7}>7 đến 14 ngày</option>
                                <option value={14}>14 đến 28 ngày</option>
                                <option value={30}>30 ngày</option>
                                <option value={60}>60 ngày</option>
                            </select>
                    </div>

                    <div className={styles.dateTimeContainer}>
                        <span className={styles.dateTime}>
                            <span>Ngày bắt đầu:</span> {metadata.startDate || 'N/A'}
                        </span>
                        <span className={styles.dateTime}>
                            <span>Ngày kết thúc:</span> {metadata.endDate || 'N/A'}
                        </span>
                    </div>
                    </div>
                </div>

                {/* Fixed height container to prevent CLS */}
                <div className={styles.tableContainer}>
                    {loading && <SkeletonTable />}
                    {error && <p className={styles.error}>{error}</p>}
                    {!loading && !error && tableData.length > 0 && (
                        <table className={styles.tableLoGan}>
                            <caption className={styles.caption}>
                                Thống kê lô gan Miền Bắc trong {days} ngày
                            </caption>
                            <thead>
                                <tr>
                                    <th>Số</th>
                                    <th>Ngày ra cuối</th>
                                    <th>Ngày gan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((stat) => (
                                    <tr key={stat.id}>
                                        <td className={`${styles.number} ${styles.highlight}`}>
                                            {stat.number}
                                        </td>
                                        <td className={styles.date}>{stat.lastAppeared}</td>
                                        <td className={`${styles.gapDraws} ${stat.gapDraws > 10 ? styles.highlight : ''}`}>
                                            {stat.gapDraws} <span>ngày</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {!loading && !error && tableData.length === 0 && metadata.message && (
                        <p className={styles.noData}>{metadata.message}</p>
                    )}
                </div>

                <div className={styles.groupContent}>
                    <h2 className={styles.heading}>TAODANDEWUKONG.PRO - Thống Kê Lô Gan Chính Xác Nhất</h2>
                    <h3 className={styles.h3}>Thống kê Lô Gan Miền Bắc là gì?</h3>
                    <p className={styles.desc}>
                        Thống kê lô gan Miền Bắc là danh sách các cặp số (2 số cuối) đã lâu chưa xuất hiện trong kết quả xổ số. Số ngày gan là số ngày mà cặp số đó chưa về tính từ lần cuối cùng xuất hiện đến hôm nay. Ví dụ: nếu một cặp số có 30 ngày gan nghĩa là đã 30 ngày kể từ lần cuối cặp số đó về.
                    </p>
                    {isExpanded && (
                        <Suspense fallback={<div>Loading...</div>}>
                            <DescriptionContent />
                        </Suspense>
                    )}
                    <button
                        className={styles.toggleBtn}
                        onClick={toggleContent}
                        aria-expanded={isExpanded}
                    >
                        {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                    </button>
                </div>

                <button
                    ref={scrollBtnRef}
                    className={styles.scrollToTopBtn}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    title="Quay lại đầu trang"
                    aria-label="Quay lại đầu trang"
                >
                    ↑
                </button>

                <div>
                    <div className='congcuhot'>
                        <Suspense fallback={null}>
                            <ThongKe />
                            <CongCuHot />
                        </Suspense>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export async function getServerSideProps() {
    try {
        const days = 30;

        const data = await apiMB.getLoGanStats(days);

        console.log('Server-side stats:', data.statistics); // Debug dữ liệu server
        return {
            props: {
                initialStats: data.statistics || [],
                initialMetadata: data.metadata || {},
                initialDays: days,
            },
        };
    } catch (error) {
        console.error('Error in getServerSideProps:', error.message);
        return {
            props: {
                initialStats: [],
                initialMetadata: {},
                initialDays: 30,
            },
        };
    }
}

export default Logan;
