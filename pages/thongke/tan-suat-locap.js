
import React, { useState, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import UpdateButton from '../../components/UpdateButton';
import { useRouter } from 'next/router';
import { apiMB } from '../api/kqxsMB';
import styles from '../../styles/tansuatLoCap.module.css';
import ThongKe from '../../components/ThongKe';
import CongCuHot from '../../components/CongCuHot';
import Link from 'next/link';
import StatisticsSEO from '../../components/StatisticsSEO';
const statisticsFAQs = require('../../config/statisticsFAQs');

// Skeleton Loading Component
const SkeletonRow = () => (
    <tr>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
    </tr>
);

const SkeletonTable = () => (
    <table className={styles.tableTanSuatLoto}>
        <thead>
            <tr>
                <th>Cặp số</th>
                <th>Số lần xuất hiện</th>
                <th>Số lần xuất hiện số 1</th>
                <th>Số lần xuất hiện số 2</th>
                <th>Tỷ lệ</th>
            </tr>
        </thead>
        <tbody>
            {Array(10).fill().map((_, index) => <SkeletonRow key={index} />)}
        </tbody>
    </table>
);

const TanSuatLoCap = ({ initialStats, initialMetadata, initialDays }) => {
    const router = useRouter();
    const [stats, setStats] = useState(initialStats || []);
    const [metadata, setMetadata] = useState(initialMetadata || {});
    const [days, setDays] = useState(initialDays || 30);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleContent = () => {
        setIsExpanded(!isExpanded);
    };

    const fetchTanSuatLoCapStats = useCallback(async (days) => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching Tần Suất Lô Cặp stats with days:', days);

            const data = await apiMB.getTanSuatLoCapStats(days);

            setStats(data.statistics);
            setMetadata(data.metadata);
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

    // Hàm cập nhật thống kê
    const handleUpdateStats = async () => {
        try {
            // Gọi API cập nhật
            const result = await apiMB.updateTanSuatLoCapStats(days);
            
            if (result.success) {
                // Sau khi cập nhật thành công, lấy lại dữ liệu
                setLoading(true);
                setError(null);
                try {
                    const data = await apiMB.getTanSuatLoCapStats(days);
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

    useEffect(() => {
        fetchTanSuatLoCapStats(days);
    }, [days, fetchTanSuatLoCapStats]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercentage = (scrollTop / windowHeight) * 100;
            const scrollToTopBtn = document.getElementById('scrollToTopBtn');

            if (scrollPercentage > 50) {
                scrollToTopBtn.style.display = 'block';
            } else {
                scrollToTopBtn.style.display = 'none';
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getMessage = () => {
        return `Thống kê Tần Suất Lô Cặp trong ${metadata.totalDraws || 0} lần quay Xổ số Miền Bắc`;
    };

    const getTitle = () => {
        return `Thống kê Tần Suất Lô Cặp Xổ Số Miền Bắc`;
    };

    const pageTitle = getTitle();
    const pageDescription = `Xem bảng thống kê Tần Suất Lô Cặp Xổ số Miền Bắc trong ${metadata.filterType || ''}. Cập nhật dữ liệu từ ${metadata.startDate || ''} đến ${metadata.endDate || ''}.`;

    // Tính ngưỡng highlight (trung bình + 1 độ lệch chuẩn)
    const counts = stats.map(stat => stat.count);
    const mean = counts.reduce((sum, count) => sum + count, 0) / counts.length;
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / counts.length;
    const stdDev = Math.sqrt(variance);
    const highlightThreshold = mean + stdDev;

    return (
        <Layout>
            <StatisticsSEO 
                pageType="tan-suat-locap"
                metadata={metadata}
                faq={statisticsFAQs['tan-suat-locap']}
                customDescription={pageDescription}
            />

            <div className={styles.container}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>{pageTitle}</h1>
                    <div className={styles.actionBtn}>
                        <Link className={styles.actionTK} href="/thongke/dau-duoi">
                            Thống Kê Đầu Đuôi
                        </Link>
                        <Link
                            className={`${styles.actionTK} ${router.pathname.startsWith('/thongke/tan-suat-locap') ? styles.active : ''}`}
                            href="/thongke/tan-suat-locap"
                        >
                            Tần Suất Lô Cặp
                        </Link>
                        <Link className={styles.actionTK} href="/thongke/giai-dac-biet">
                            Thống Kê Giải Đặc Biệt
                        </Link>
                    </div>
                </div>
                <div className={styles.content}>
                    <div>
                        <div className={styles.group_Select}>
                            <div className={styles.selectGroup}>
                                <label className={styles.options}>Chọn thời gian:</label>
                                <select className={styles.seclect} value={days} onChange={handleDaysChange}
                                    aria-label="Chọn thời gian để xem thống kê tần suất lô cặp"
                                >
                                    <option value={30}>30 ngày</option>
                                    <option value={60}>60 ngày</option>
                                    <option value={90}>90 ngày</option>
                                    <option value={120}>120 ngày</option>
                                    <option value={180}>6 tháng</option>
                                    <option value={365}>1 năm</option>
                                </select>
                            </div>

                            <div className={styles.dateTimeContainer}>
                                <span className={styles.dateTime}><span>Ngày bắt đầu:</span> {metadata.startDate || 'N/A'}</span>
                                <span className={styles.dateTime}><span>Ngày kết thúc:</span> {metadata.endDate || 'N/A'}</span>
                            </div>
                        </div>

                        {loading && (
                            <div className={styles.tableContainer}>
                                <div className={styles.tableWrapper}>
                                    <div className={styles.tableTitle}>Thống kê các cặp số xuất hiện nhiều</div>
                                    <SkeletonTable />
                                </div>
                            </div>
                        )}

                        {error && <p className={styles.error}>{error}</p>}

                        {!loading && !error && stats.length > 0 && (
                            <div className={styles.tableContainer}>
                                <div className={styles.tableWrapper}>
                                    <div className={styles.tableTitle}>Thống kê 90 cặp số</div>
                                    <table className={styles.tableTanSuatLoto}>
                                        <caption className={styles.caption}>Thống kê Tần Suất Lô Cặp Miền Bắc trong {days} ngày</caption>
                                        <thead>
                                            <tr>
                                                <th>Cặp số</th>
                                                <th>Số lần xuất hiện</th>
                                                <th>Số lần xuất hiện số 1</th>
                                                <th>Số lần xuất hiện số 2</th>
                                                <th>Tỷ lệ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.map((stat, index) => {
                                                // Kiểm tra stat và stat.pair có tồn tại
                                                if (!stat || !stat.pair) {
                                                    return null;
                                                }
                                                const [xx, yy] = stat.pair.split('-');
                                                return (
                                                    <tr key={index}>
                                                        <td>{stat.pair}</td>
                                                        <td><span className={styles.countNumber}>{stat.count}</span></td>
                                                        <td>{xx}: <span className={styles.countNumber}>{stat.xxCount}</span> lần</td>
                                                        <td>{yy}: <span className={styles.countNumber}>{stat.yyCount}</span> lần</td>
                                                        <td>
                                                            <div className={styles.appearance}>
                                                                <div
                                                                    className={styles.progressBar}
                                                                    style={{ width: `${parseFloat(stat.percentage) || 0}%` }}
                                                                ></div>
                                                                <span>{stat.percentage}</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {!loading && !error && stats.length === 0 && metadata.message && (
                            <p className={styles.noData}>{metadata.message}</p>
                        )}
                    </div>
                </div>

                <div className={styles.Group_Content}>
                    <h2 className={styles.heading}>TAODANDEWUKONG.PRO - Thống Kê Tần Suất Lô Cặp Chính Xác Nhất</h2>
                    <div className={`${styles.contentWrapper} ${isExpanded ? styles.expanded : styles.collapsed}`}>
                        <h3 className={styles.h3}>Thống Kê Tần Suất Lô Cặp Là Gì?</h3>
                        <p className={styles.desc}>
                            Thống kê Tần Suất Lô Cặp là bảng thống kê số lần xuất hiện của các cặp số loto (dạng XX-YY, ví dụ: 00-55, 01-10, 12-21,...) trong kết quả xổ số trong một khoảng thời gian nhất định (30, 60, 90, 120, 180 ngày hoặc 1 năm). Đây là công cụ hữu ích giúp người chơi nhận biết các cặp số xuất hiện nhiều hoặc ít để đưa ra quyết định chơi loto hiệu quả hơn.
                        </p>
                        <h3 className={styles.h3}>Thông Tin Trong Thống Kê Tần Suất Lô Cặp:</h3>
                        <p className={styles.desc}>- Tần suất xuất hiện của các cặp loto (00-55, 01-10, 12-21,...).</p>
                        <p className={styles.desc}>- Số lần xuất hiện riêng lẻ của từng số trong cặp (ví dụ: 00: 6 lần, 99: 4 lần).</p>
                        <p className={styles.desc}>- Phần trăm xuất hiện của từng cặp số, đi kèm số lần xuất hiện tổng cộng.</p>
                        <p className={styles.desc}>- Khoảng thời gian thống kê (30 ngày, 60 ngày,..., 1 năm), cùng với ngày bắt đầu và ngày kết thúc.</p>
                        <h3 className={styles.h3}>Ý Nghĩa Của Thống Kê Tần Suất Lô Cặp:</h3>
                        <p className={styles.desc}>- Giúp người chơi nhận biết xu hướng xuất hiện của các cặp loto, từ đó chọn cặp số may mắn để chơi.</p>
                        <p className={styles.desc}>- Thanh ngang màu cam thể hiện trực quan tỷ lệ xuất hiện, giúp người chơi dễ dàng nhận biết cặp số nào xuất hiện nhiều nhất hoặc ít nhất.</p>
                        <h3 className={styles.h3}>Lợi Ích Của Thống Kê Tần Suất Lô Cặp:</h3>
                        <p className={styles.desc}>- Cung cấp dữ liệu chính xác, cập nhật nhanh chóng từ kết quả xổ số.</p>
                        <p className={styles.desc}>- Giúp người chơi có thêm thông tin để tăng cơ hội trúng thưởng.</p>
                        <p className={styles.desc}>
                            TAODANDEWUKONG.PRO cung cấp công cụ thống kê Tần Suất Lô Cặp hoàn toàn miễn phí. Chúc bạn may mắn!
                        </p>
                        <p className={styles.desc}>
                            Thống kê Tần Suất Lô Cặp. Xem thống kê Tần Suất Lô Cặp hôm nay nhanh và chính xác nhất tại <a className={styles.action} href='/'>TAODANDEWUKONG.PRO.</a>
                        </p>
                    </div>
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
            </div>
            <div>
                <ThongKe />
                <CongCuHot />
            </div>
        </Layout>
    );
};

export async function getServerSideProps(context) {
    // Đảm bảo route luôn được tạo, ngay cả khi có lỗi
    try {
        const days = 30;

        let data = null;
        try {
            data = await apiMB.getTanSuatLoCapStats(days);
        } catch (apiError) {
            console.error('API call failed in getServerSideProps:', apiError.message);
            // Tiếp tục với data null thay vì throw error
        }

        // Đảm bảo data tồn tại và có cấu trúc hợp lệ
        if (!data || typeof data !== 'object') {
            console.warn('API returned invalid data, using defaults');
            return {
                props: {
                    initialStats: [],
                    initialMetadata: {
                        totalDraws: 0,
                        filterType: `${days} ngày`,
                        startDate: 'N/A',
                        endDate: 'N/A',
                    },
                    initialDays: days,
                },
            };
        }

        return {
            props: {
                initialStats: Array.isArray(data.statistics) ? data.statistics : [],
                initialMetadata: data.metadata && typeof data.metadata === 'object' ? data.metadata : {
                    totalDraws: 0,
                    filterType: `${days} ngày`,
                    startDate: 'N/A',
                    endDate: 'N/A',
                },
                initialDays: days,
            },
        };
    } catch (error) {
        console.error('Unexpected error in getServerSideProps:', error.message, error.stack);
        // LUÔN trả về props hợp lệ để tránh 404 - không bao giờ throw error
        return {
            props: {
                initialStats: [],
                initialMetadata: {
                    totalDraws: 0,
                    filterType: '30 ngày',
                    startDate: 'N/A',
                    endDate: 'N/A',
                },
                initialDays: 30,
            },
        };
    }
}

export default TanSuatLoCap;












