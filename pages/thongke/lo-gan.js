import React, { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import Layout from '../../components/Layout';
import UpdateButton from '../../components/UpdateButton';
import { apiMB } from '../api/kqxsMB';
import styles from '../../styles/logan.module.css';
import ThongKe from '../../components/ThongKe';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CongCuHot from '../../components/CongCuHot';
import StatisticsSEO from '../../components/StatisticsSEO';
const statisticsFAQs = require('../../config/statisticsFAQs');

// Skeleton Loading Component
const SkeletonRow = () => (
    <tr>
        <td className={styles.number}><div className={styles.skeleton}></div></td>
        <td className={styles.date}><div className={styles.skeleton}></div></td>
        <td className={styles.gapDraws}><div className={styles.skeleton}></div></td>
        <td className={styles.maxGap}><div className={styles.skeleton}></div></td>
    </tr>
);

const SkeletonTable = () => (
    <table className={styles.tableLoGan}>
        <thead>
            <tr>
                <th>Số</th>
                <th>Ngày ra cuối</th>
                <th>Ngày gan</th>
                <th>Gan max</th>
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

    // Fetch API
    const fetchLoGanStats = useCallback(async (days) => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiMB.getLoGanStats(days);
            setStats(data.statistics || []);
            setMetadata(data.metadata || {});
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

    // Hàm cập nhật thống kê
    const handleUpdateStats = async () => {
        try {
            // Gọi API cập nhật
            const result = await apiMB.updateLoGanStats(days);
            
            if (result.success) {
                // Sau khi cập nhật thành công, lấy lại dữ liệu
                setLoading(true);
                setError(null);
                try {
                    const data = await apiMB.getLoGanStats(days);
                    setStats(data.statistics || []);
                    setMetadata(data.metadata || {});
                } catch (err) {
                    setError(err.message || 'Có lỗi xảy ra khi lấy dữ liệu.');
                    setStats([]);
                    setMetadata({});
                } finally {
                    setLoading(false);
                }
            } else {
                throw new Error('Cập nhật không thành công');
            }
        } catch (error) {
            console.error('Error updating stats:', error);
            throw error; // Re-throw để UpdateButton xử lý
        }
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
            maxGap: stat.maxGap || 0,
        }));
    }, [stats]);

    useEffect(() => {
        fetchLoGanStats(days);
    }, [days, fetchLoGanStats]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercentage = (scrollTop / windowHeight) * 100;
            const scrollBtn = document.getElementById('scrollToTopBtn');
            if (scrollPercentage > 50) {
                scrollBtn.style.display = 'block';
            } else {
                scrollBtn.style.display = 'none';
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getTitle = () => {
        const daysText = days === 6 ? 'Dưới 7 ngày' :
            days === 7 ? 'Từ 7 đến 14 ngày' :
                days === 14 ? 'Từ 14 đến 28 ngày' :
                    days === 30 ? 'Trong 30 ngày' : 'Trong 60 ngày';
        return (
            <>
                Thống kê Lô Gan Xổ Số<br></br>
                <span className={styles.highlightProvince}>Miền Bắc</span><br></br>
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
                Thống kê Lô Gan trong<br></br>
                <span className={styles.highlightDraws}>{daysText}</span> Xổ số <span className={styles.highlightProvince}>Miền Bắc</span>
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
                <div className={styles.titleGroup}>
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
                    <div className="metadata">
                        <h2 className={styles.title}>{getMessage()}</h2>
                    </div>

                    <div className={styles.groupSelect}>
                        <div className={styles.selectGroup}>
                            <label className={styles.options}>Chọn thời gian:</label>
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

                    <div>
                        <p className={styles.dateTime}>
                            <span>Ngày bắt đầu:</span> {metadata.startDate || 'N/A'}
                        </p>
                        <p className={styles.dateTime}>
                            <span>Ngày kết thúc:</span> {metadata.endDate || 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Button cập nhật dữ liệu */}
                <UpdateButton 
                    onUpdate={handleUpdateStats}
                    label="Cập nhật dữ liệu"
                />

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
                                    <th>Gan max</th>
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
                                        <td className={`${styles.maxGap} ${stat.maxGap > 20 ? styles.highlight : ''}`}>
                                            {stat.maxGap} <span>ngày</span>
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
                        Thống kê lô gan Miền Bắc (hay còn gọi là lô khan Miền Bắc, số rắn) là thống kê những cặp số lô tô (2 số cuối) lâu chưa về trên bảng kết quả Miền Bắc trong một khoảng thời gian, ví dụ như 5 ngày hoặc hơn. Đây là những con loto gan lì không chịu xuất hiện. Số ngày gan (kỳ gan) là số lần mở thưởng mà bộ số đó chưa về tính đến hôm nay.
                    </p>
                    {isExpanded && (
                        <Suspense fallback={<div>Loading...</div>}>
                            <DescriptionContent />
                        </Suspense>
                    )}
                    <button
                        className={styles.toggleBtn}
                        onClick={toggleContent}
                    >
                        {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                    </button>
                </div>

                <button
                    id="scrollToTopBtn"
                    className={styles.scrollToTopBtn}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    title="Quay lại đầu trang"
                >
                    ↑
                </button>

                <div>
                    <div className='congcuhot'>
                        <ThongKe />
                        <CongCuHot />
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
