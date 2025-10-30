import React, { useState, useCallback, useEffect, useMemo, lazy, Suspense, startTransition } from 'react';
import Layout from '../../components/Layout';
import UpdateButton from '../../components/UpdateButton';
import { apiMB } from '../api/kqxsMB';
import styles from '../../styles/dauduoi.module.css';
import ThongKe from '../../components/ThongKe';
import CongCuHot from '../../components/CongCuHot';
import Link from 'next/link';
import { useRouter } from 'next/router';
import StatisticsSEO from '../../components/StatisticsSEO';
const statisticsFAQs = require('../../config/statisticsFAQs');

// Skeleton Loading Component cho bảng Đầu/Đuôi
const SkeletonRow = () => (
    <tr>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
    </tr>
);

const SkeletonTable = () => (
    <table className={styles.tableDauDuoi}>
        <thead>
            <tr>
                <th>Số</th>
                <th>Đầu</th>
                <th>Đuôi</th>
            </tr>
        </thead>
        <tbody>
            {Array(5).fill().map((_, index) => <SkeletonRow key={index} />)}
        </tbody>
    </table>
);

// Skeleton cho bảng Đặc Biệt
const SkeletonSpecialTable = () => (
    <table className={styles.tableSpecialDauDuoi}>
        <thead>
            <tr>
                <th>Số</th>
                <th>Đầu Đặc Biệt</th>
                <th>Đuôi Đặc Biệt</th>
            </tr>
        </thead>
        <tbody>
            {Array(5).fill().map((_, index) => <SkeletonRow key={index} />)}
        </tbody>
    </table>
);

// Skeleton Loading Component cho bảng Đầu/Đuôi theo ngày
const SkeletonRowByDate = () => (
    <tr>
        {Array(11).fill().map((_, index) => (
            <td key={index} className="py-2 px-4"><div className={styles.skeleton}></div></td>
        ))}
    </tr>
);

const SkeletonTableByDate = (props) => (
    <table className={styles.tableDauDuoiByDate}>
        <thead>
            <tr>
                <th>Ngày</th>
                {Array(10).fill().map((_, index) => (
                    <th key={index}>{props.type === 'dau' ? `Đầu ${index} ` : `Đuôi ${index} `}</th>
                ))}
            </tr>
        </thead>
        <tbody>
            {Array(5).fill().map((_, index) => <SkeletonRowByDate key={index} />)}
        </tbody>
    </table>
);

// Lazy load DescriptionContent
const DescriptionContent = lazy(() => import('./DescriptionDauDuoi'));

const DauDuoi = ({ initialDauStats, initialDuoiStats, initialSpecialDauDuoiStats, initialMetadata, initialDays }) => {
    const router = useRouter();
    const [dauStats, setDauStats] = useState(initialDauStats || []);
    const [duoiStats, setDuoiStats] = useState(initialDuoiStats || []);
    const [metadata, setMetadata] = useState(initialMetadata || {});
    const [days, setDays] = useState(initialDays || 30);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [specialDauDuoiStats, setSpecialDauDuoiStats] = useState(initialSpecialDauDuoiStats || []);
    const [specialDays, setSpecialDays] = useState(initialDays || 30);
    const [specialMetadata, setSpecialMetadata] = useState(initialMetadata || {});
    const [specialLoading, setSpecialLoading] = useState(false);
    const [specialError, setSpecialError] = useState(null);

    const [dauStatsByDate, setDauStatsByDate] = useState({});
    const [dauByDateDays, setDauByDateDays] = useState(initialDays || 30);
    const [dauByDateMetadata, setDauByDateMetadata] = useState(initialMetadata || {});
    const [dauByDateLoading, setDauByDateLoading] = useState(false);
    const [dauByDateError, setDauByDateError] = useState(null);

    const [duoiStatsByDate, setDuoiStatsByDate] = useState({});
    const [duoiByDateDays, setDuoiByDateDays] = useState(initialDays || 30);
    const [duoiByDateMetadata, setDuoiByDateMetadata] = useState(initialMetadata || {});
    const [duoiByDateLoading, setDuoiByDateLoading] = useState(false);
    const [duoiByDateError, setDuoiByDateError] = useState(null);

    const [isExpanded, setIsExpanded] = useState(false);

    const toggleContent = () => {
        setIsExpanded(!isExpanded);
    };

    // Memoize combinedDauDuoiStats
    const combinedDauDuoiStats = useMemo(() => {
        if (!dauStats || !Array.isArray(dauStats) || !duoiStats || !Array.isArray(duoiStats)) {
            return [];
        }
        return dauStats.map((dauStat, index) => ({
            number: index,
            dauCount: dauStat.count || 0,
            dauPercentage: dauStat.percentage || '0%',
            duoiCount: duoiStats[index]?.count || 0,
            duoiPercentage: duoiStats[index]?.percentage || '0%',
        }));
    }, [dauStats, duoiStats]);

    // Memoize specialDauDuoiStats
    const memoizedSpecialDauDuoiStats = useMemo(() => {
        if (!specialDauDuoiStats || !Array.isArray(specialDauDuoiStats)) {
            return [];
        }
        return specialDauDuoiStats.map(stat => ({
            number: stat.number,
            dauCount: stat.dauCount || 0,
            dauPercentage: stat.dauPercentage || '0',
            duoiCount: stat.duoiCount || 0,
            duoiPercentage: stat.duoiPercentage || '0',
        }));
    }, [specialDauDuoiStats]);

    // Memoize dauStatsByDateArray with totals calculation
    const dauStatsByDateArray = useMemo(() => {
        if (!dauStatsByDate || typeof dauStatsByDate !== 'object') {
            return { data: [], totals: Array(10).fill(0) };
        }
        const totals = Array(10).fill(0);
        const data = Object.entries(dauStatsByDate).map(([date, stats]) => {
            const row = { date, stats: Array(10).fill(0) };
            if (Array.isArray(stats)) {
                stats.forEach((count, index) => {
                    row.stats[index] = count;
                    totals[index] += count;
                });
            }
            return row;
        });
        return { data, totals };
    }, [dauStatsByDate]);

    // Memoize duoiStatsByDateArray with totals calculation
    const duoiStatsByDateArray = useMemo(() => {
        if (!duoiStatsByDate || typeof duoiStatsByDate !== 'object') {
            return { data: [], totals: Array(10).fill(0) };
        }
        const totals = Array(10).fill(0);
        const data = Object.entries(duoiStatsByDate).map(([date, stats]) => {
            const row = { date, stats: Array(10).fill(0) };
            if (Array.isArray(stats)) {
                stats.forEach((count, index) => {
                    row.stats[index] = count;
                    totals[index] += count;
                });
            }
            return row;
        });
        return { data, totals };
    }, [duoiStatsByDate]);

    // Fetch API
    const fetchDauDuoiStats = useCallback(async (days) => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiMB.getDauDuoiStats(days);
            setDauStats(data.dauStats || []);
            setDuoiStats(data.duoiStats || []);
            setMetadata(data.metadata || {});
        } catch (err) {
            const errorMessage = err.message || 'Có lỗi xảy ra khi lấy dữ liệu.';
            setError(errorMessage);
            setDauStats([]);
            setDuoiStats([]);
            setMetadata({});
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSpecialDauDuoiStats = useCallback(async (specialDays) => {
        setSpecialLoading(true);
        setSpecialError(null);
        try {
            const specialData = await apiMB.getDauDuoiStats(specialDays);
            setSpecialDauDuoiStats(specialData.specialDauDuoiStats || []);
            setSpecialMetadata(specialData.metadata || {});
        } catch (err) {
            const errorMessage = err.message || 'Có lỗi xảy ra khi lấy dữ liệu.';
            setSpecialError(errorMessage);
            setSpecialDauDuoiStats([]);
            setSpecialMetadata({});
        } finally {
            setSpecialLoading(false);
        }
    }, []);

    const fetchDauStatsByDate = useCallback(async (dauByDateDays) => {
        setDauByDateLoading(true);
        setDauByDateError(null);
        try {
            const data = await apiMB.getDauDuoiStatsByDate(dauByDateDays);
            setDauStatsByDate(data.dauStatsByDate || {});
            setDauByDateMetadata(data.metadata || {});
        } catch (err) {
            const errorMessage = err.message || 'Có lỗi xảy ra khi lấy dữ liệu.';
            setDauByDateError(errorMessage);
            setDauStatsByDate({});
            setDauByDateMetadata({});
        } finally {
            setDauByDateLoading(false);
        }
    }, []);

    const fetchDuoiStatsByDate = useCallback(async (duoiByDateDays) => {
        setDuoiByDateLoading(true);
        setDuoiByDateError(null);
        try {
            const data = await apiMB.getDauDuoiStatsByDate(duoiByDateDays);
            setDuoiStatsByDate(data.duoiStatsByDate || {});
            setDuoiByDateMetadata(data.metadata || {});
        } catch (err) {
            const errorMessage = err.message || 'Có lỗi xảy ra khi lấy dữ liệu.';
            setDuoiByDateError(errorMessage);
            setDuoiStatsByDate({});
            setDuoiByDateMetadata({});
        } finally {
            setDuoiByDateLoading(false);
        }
    }, []);

    const handleDaysChange = useCallback((e) => {
        const selectedDays = Number(e.target.value);
        setDays(selectedDays);
    }, []);

    const handleSpecialDaysChange = useCallback((e) => {
        const selectedSpecialDays = Number(e.target.value);
        setSpecialDays(selectedSpecialDays);
    }, []);

    const handleDauByDateDaysChange = useCallback((e) => {
        const selectedDauByDateDays = Number(e.target.value);
        setDauByDateDays(selectedDauByDateDays);
    }, []);

    const handleDuoiByDateDaysChange = useCallback((e) => {
        const selectedDuoiByDateDays = Number(e.target.value);
        setDuoiByDateDays(selectedDuoiByDateDays);
    }, []);

    // Hàm cập nhật thống kê
    const handleUpdateStats = async () => {
        try {
            // Gọi API cập nhật
            const result = await apiMB.updateDauDuoiStats(days);
            
            if (result.success) {
                // Sau khi cập nhật thành công, lấy lại dữ liệu
                setLoading(true);
                setError(null);
                try {
                    const data = await apiMB.getDauDuoiStats(days);
                    setDauStats(data.dauStats || []);
                    setDuoiStats(data.duoiStats || []);
                    setMetadata(data.metadata || {});
                } catch (err) {
                    setError(err.message || 'Có lỗi xảy ra khi lấy dữ liệu.');
                    setDauStats([]);
                    setDuoiStats([]);
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

    // Combine multiple API calls to prevent rate limiting
    useEffect(() => {
        // Check if we have initial data from SSR
        const hasInitialData = initialDauStats && initialDauStats.length > 0;
        
        if (hasInitialData) {
            // Already have data from SSR, don't fetch again
            return;
        }
        
        // Fetch all data together in sequence to avoid rate limiting
        const fetchAllData = async () => {
            try {
                await Promise.all([
                    fetchDauDuoiStats(days),
                    fetchSpecialDauDuoiStats(specialDays),
                    fetchDauStatsByDate(dauByDateDays),
                    fetchDuoiStatsByDate(duoiByDateDays)
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        
        // Wrap in startTransition to prevent hydration warnings
        startTransition(() => {
            fetchAllData();
        });
    }, []); // Only run once on mount

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
        return (
            <>
                Thống kê Đầu / Đuôi Loto trong<br></br>
                <span className={styles.highlightDraws}>{metadata.totalDraws || 0} lần quay</span> Xổ số <span className={styles.highlightProvince}>Miền Bắc</span>
            </>
        );
    };

    const getSpecialMessage = () => {
        return (
            <>
                Thống kê Đầu / Đuôi Giải Đặc Biệt trong<br></br>
                <span className={styles.highlightDraws}>{specialMetadata.totalDraws || 0} lần quay</span> Xổ số <span className={styles.highlightProvince}>Miền Bắc</span>
            </>
        );
    };

    const getDauByDateMessage = () => {
        return (
            <>
                Thống kê Đầu Loto theo ngày - Xổ số<br></br>
                <span className={styles.highlightProvince}>Miền Bắc</span>
            </>
        );
    };

    const getDuoiByDateMessage = () => {
        return (
            <>
                Thống kê Đuôi Loto theo ngày - Xổ số<br></br>
                <span className={styles.highlightProvince}>Miền Bắc</span>
            </>
        );
    };

    const getTitle = () => {
        return (
            <>
                Thống kê Đầu Đuôi Loto Xổ Số <span className={styles.highlightProvince}>Miền Bắc</span>
            </>
        );
    };

    const pageTitle = `Thống kê Đầu Đuôi Loto Xổ Số Miền Bắc`;
    const pageDescription = `Xem thống kê Đầu Đuôi loto Xổ số Miền Bắc trong ${days} ngày. Cập nhật mới nhất ${metadata.startDate && metadata.endDate ? `từ ${metadata.startDate} đến ${metadata.endDate}` : 'hàng ngày'}.`;

    return (
        <Layout>
            <StatisticsSEO 
                pageType="dau-duoi"
                metadata={{
                    startDate: metadata.startDate,
                    endDate: metadata.endDate,
                    totalDraws: metadata.totalDraws
                }}
                faq={statisticsFAQs['dau-duoi']}
                customDescription={pageDescription}
            />

            <div className={styles.container}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>{getTitle()}</h1>
                    <div className={styles.actionBtn}>
                        <Link className={styles.actionTK} href="/thongke/giai-dac-biet">Thống Kê Giải Đặc Biệt</Link>
                        <Link className={`${styles.actionTK} ${router.pathname.startsWith('/thongke/dau-duoi') ? styles.active : ''}`} href="/thongke/dau-duoi">Thống Kê Đầu Đuôi</Link>
                        <Link className={`${styles.actionTK} ${router.pathname.startsWith('/thongke/giai-dac-biet-tuan') ? styles.active : ''}`} href="/thongke/giai-dac-biet-tuan">Thống Kê Giải Đặc Biệt Tuần</Link>
                    </div>
                </div>

                <div className={styles.content}>
                    {/* Bảng 1: Thống kê Đầu/Đuôi Loto (tất cả các giải) */}
                    <div>
                        <div className="metadata">
                            <h2 className={styles.title}>{getMessage()}</h2>
                            <p className={styles.updateTime}>
                                Cập nhật lúc: {new Date().toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>

                        <div className={styles.group_Select}>
                            <div className={styles.selectGroup}>
                                <label className={styles.options}>Chọn thời gian:</label>
                                <select
                                    className={styles.selectBox}
                                    value={days}
                                    onChange={handleDaysChange}
                                    aria-label="Chọn khoảng thời gian thống kê đầu đuôi loto"
                                >
                                    <option value={30}>30 ngày</option>
                                    <option value={60}>60 ngày</option>
                                    <option value={90}>90 ngày</option>
                                    <option value={120}>120 ngày</option>
                                    <option value={180}>6 tháng</option>
                                    <option value={365}>1 năm</option>
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
                        {!loading && !error && combinedDauDuoiStats.length > 0 && (
                            <div>
                                <table className={styles.tableDauDuoi}>
                                    <caption className={styles.caption}>Thống kê Đầu Đuôi Loto Miền Bắc trong {days} ngày</caption>
                                    <thead>
                                        <tr>
                                            <th>Số</th>
                                            <th>Đầu Loto</th>
                                            <th>Đuôi Loto</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {combinedDauDuoiStats.map((stat, index) => (
                                            <tr key={index}>
                                                <td>{stat.number}</td>
                                                <td>
                                                    <div className={styles.appearance}>
                                                        <div
                                                            className={styles.progressBar}
                                                            style={{ width: `${parseFloat(stat.dauPercentage)}%` }}
                                                        ></div>
                                                        <span>{stat.dauPercentage} ({stat.dauCount})</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className={styles.appearance}>
                                                        <div
                                                            className={styles.progressBar}
                                                            style={{ width: `${parseFloat(stat.duoiPercentage)}%` }}
                                                        ></div>
                                                        <span>{stat.duoiPercentage} ({stat.duoiCount})</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {!loading && !error && combinedDauDuoiStats.length === 0 && metadata.message && (
                            <p className={styles.noData}>{metadata.message}</p>
                        )}
                    </div>
                </div>

                <div className={styles.content}>
                    {/* Bảng 2: Thống kê Đầu/Đuôi giải Đặc Biệt */}
                    {specialLoading && <SkeletonSpecialTable />}
                    {specialError && <p className={styles.error}>{specialError}</p>}
                    {!specialLoading && !specialError && memoizedSpecialDauDuoiStats.length > 0 && (
                        <div className="mt-8">
                            <div className="metadata">
                                <h2 className={`${styles.title} ${styles.title2}`}>{getSpecialMessage()}</h2>
                            </div>

                            <div className={styles.group_Select}>
                                <div className={styles.selectGroup}>
                                    <label className={styles.options}>Chọn thời gian:</label>
                                    <select
                                        className={styles.selectBox}
                                        value={specialDays}
                                        onChange={handleSpecialDaysChange}
                                        aria-label="Chọn khoảng thời gian thống kê đầu đuôi giải đặc biệt"
                                    >
                                        <option value={30}>30 ngày</option>
                                        <option value={60}>60 ngày</option>
                                        <option value={90}>90 ngày</option>
                                        <option value={120}>120 ngày</option>
                                        <option value={180}>6 tháng</option>
                                        <option value={365}>1 năm</option>
                                    </select>
                                </div>

                                <div>
                                    <p className={styles.dateTime}>
                                        <span>Ngày bắt đầu:</span> {specialMetadata.startDate || 'N/A'}
                                    </p>
                                    <p className={styles.dateTime}>
                                        <span>Ngày kết thúc:</span> {specialMetadata.endDate || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <table className={styles.tableSpecialDauDuoi}>
                                <caption className={styles.caption}>Thống kê Đầu Đuôi Giải Đặc Biệt Miền Bắc trong {specialDays} ngày</caption>
                                <thead>
                                    <tr>
                                        <th>Số</th>
                                        <th>Đầu Đặc Biệt</th>
                                        <th>Đuôi Đặc Biệt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {memoizedSpecialDauDuoiStats.map((stat, index) => (
                                        <tr key={index}>
                                            <td>{stat.number}</td>
                                            <td>
                                                <div className={styles.appearance}>
                                                    <div
                                                        className={styles.progressBar}
                                                        style={{ width: `${parseFloat(stat.dauPercentage) || 0}%` }}
                                                    ></div>
                                                    <span>{stat.dauPercentage || '0'} ({stat.dauCount || 0})</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.appearance}>
                                                    <div
                                                        className={styles.progressBar}
                                                        style={{ width: `${parseFloat(stat.duoiPercentage) || 0}%` }}
                                                    ></div>
                                                    <span>{stat.duoiPercentage || '0'} ({stat.duoiCount || 0})</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {!specialLoading && !specialError && memoizedSpecialDauDuoiStats.length === 0 && specialMetadata.message && (
                        <p className={styles.noData}>{specialMetadata.message}</p>
                    )}
                </div>

                <div className={styles.content}>
                    {/* Bảng 3: Thống kê Đầu Loto theo ngày */}
                    <div>
                        <div className="metadata">
                            <h2 className={styles.title}>{getDauByDateMessage()}</h2>
                        </div>

                        <div className={styles.group_Select}>
                            <div className={styles.selectGroup}>
                                <label className={styles.options}>Chọn thời gian:</label>
                                <select
                                    className={styles.selectBox}
                                    value={dauByDateDays}
                                    onChange={handleDauByDateDaysChange}
                                    aria-label="Chọn khoảng thời gian thống kê đầu loto theo ngày"
                                >
                                    <option value={30}>30 ngày</option>
                                    <option value={60}>60 ngày</option>
                                    <option value={90}>90 ngày</option>
                                    <option value={120}>120 ngày</option>
                                    <option value={180}>6 tháng</option>
                                    <option value={365}>1 năm</option>
                                </select>
                            </div>

                            <div>
                                <p className={styles.dateTime}>
                                    <span>Ngày bắt đầu:</span> {dauByDateMetadata.startDate || 'N/A'}
                                </p>
                                <p className={styles.dateTime}>
                                    <span>Ngày kết thúc:</span> {dauByDateMetadata.endDate || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {dauByDateLoading && <SkeletonTableByDate type="dau" />}
                        {dauByDateError && <p className={styles.error}>{dauByDateError}</p>}
                        {!dauByDateLoading && !dauByDateError && dauStatsByDateArray.data.length > 0 && (
                            <div>
                                <table className={styles.tableDauDuoiByDate}>
                                    <caption className={styles.caption}>Thống kê Đầu Loto theo ngày Miền Bắc trong {dauByDateDays} ngày</caption>
                                    <thead>
                                        <tr>
                                            <th>Ngày</th>
                                            {Array(10).fill().map((_, index) => (
                                                <th key={index}>Đầu {index}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dauStatsByDateArray.data.map((row, rowIndex) => (
                                            <tr key={row.date}>
                                                <td>{row.date}</td>
                                                {row.stats.map((count, colIndex) => (
                                                    <td
                                                        key={colIndex}
                                                        className={count >= 4 ? styles.highlight : ''}
                                                    >
                                                        {count} lần
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                        <tr className={styles.totalRow}>
                                            <td>Tổng</td>
                                            {dauStatsByDateArray.totals.map((total, index) => (
                                                <td
                                                    key={index}
                                                    className={total >= 4 ? styles.highlight : ''}
                                                >
                                                    {total}
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {!dauByDateLoading && !dauByDateError && dauStatsByDateArray.data.length === 0 && dauByDateMetadata.message && (
                            <p className={styles.noData}>{dauByDateMetadata.message}</p>
                        )}
                    </div>
                </div>

                <div className={styles.content}>
                    {/* Bảng 4: Thống kê Đuôi Loto theo ngày */}
                    <div>
                        <div className="metadata">
                            <h2 className={styles.title}>{getDuoiByDateMessage()}</h2>
                        </div>

                        <div className={styles.group_Select}>
                            <div className={styles.selectGroup}>
                                <label className={styles.options}>Chọn thời gian:</label>
                                <select
                                    className={styles.selectBox}
                                    value={duoiByDateDays}
                                    onChange={handleDuoiByDateDaysChange}
                                    aria-label="Chọn khoảng thời gian thống kê đuôi loto theo ngày"
                                >
                                    <option value={30}>30 ngày</option>
                                    <option value={60}>60 ngày</option>
                                    <option value={90}>90 ngày</option>
                                    <option value={120}>120 ngày</option>
                                    <option value={180}>6 tháng</option>
                                    <option value={365}>1 năm</option>
                                </select>
                            </div>

                            <div>
                                <p className={styles.dateTime}>
                                    <span>Ngày bắt đầu:</span> {duoiByDateMetadata.startDate || 'N/A'}
                                </p>
                                <p className={styles.dateTime}>
                                    <span>Ngày kết thúc:</span> {duoiByDateMetadata.endDate || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {duoiByDateLoading && <SkeletonTableByDate type="duoi" />}
                        {duoiByDateError && <p className={styles.error}>{duoiByDateError}</p>}
                        {!duoiByDateLoading && !duoiByDateError && duoiStatsByDateArray.data.length > 0 && (
                            <div>
                                <table className={styles.tableDauDuoiByDate}>
                                    <caption className={styles.caption}>Thống kê Đuôi Loto theo ngày Miền Bắc trong {duoiByDateDays} ngày</caption>
                                    <thead>
                                        <tr>
                                            <th>Ngày</th>
                                            {Array(10).fill().map((_, index) => (
                                                <th key={index}>Đuôi {index}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {duoiStatsByDateArray.data.map((row, rowIndex) => (
                                            <tr key={row.date}>
                                                <td>{row.date}</td>
                                                {row.stats.map((count, colIndex) => (
                                                    <td
                                                        key={colIndex}
                                                        className={count >= 4 ? styles.highlight : ''}
                                                    >
                                                        {count} lần
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                        <tr className={styles.totalRow}>
                                            <td>Tổng</td>
                                            {duoiStatsByDateArray.totals.map((total, index) => (
                                                <td
                                                    key={index}
                                                    className={total >= 4 ? styles.highlight : ''}
                                                >
                                                    {total}
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {!duoiByDateLoading && !duoiByDateError && duoiStatsByDateArray.data.length === 0 && duoiByDateMetadata.message && (
                            <p className={styles.noData}>{duoiByDateMetadata.message}</p>
                        )}
                    </div>
                </div>

                <div className={styles.Group_Content}>
                    <h2 className={styles.heading}>TAODANDEWUKONG.PRO - Thống Kê Đầu Đuôi Loto Chính Xác Nhất</h2>
                    <h3 className={styles.h3}>Thống Kê Đầu Đuôi Loto Là Gì?</h3>
                    <p className={styles.desc}>
                        Thống kê Đầu Đuôi loto là bảng thống kê tần suất xuất hiện của các chữ số đầu (Đầu) và chữ số cuối (Đuôi) trong 2 số cuối của các giải xổ số trong một khoảng thời gian nhất định (30 hoặc 60 ngày). Đây là công cụ hữu ích giúp người chơi nhận biết các chữ số nào đang xuất hiện nhiều hoặc ít để đưa ra quyết định chơi loto hiệu quả hơn.
                    </p>
                    <Suspense fallback={<div>Loading...</div>}>
                        <div className={`${styles.contentWrapper} ${isExpanded ? styles.expanded : styles.collapsed}`}>
                            <DescriptionContent />
                        </div>
                    </Suspense>
                    <button className={styles.toggleBtn} onClick={toggleContent}>
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
                    <ThongKe />
                    <CongCuHot />
                </div>
            </div>
        </Layout>
    );
};

export async function getServerSideProps() {
    // Disable SSR to prevent rate limiting issues
    // Data will be fetched client-side with proper rate limiting handling
    return {
        props: {
            initialDauStats: [],
            initialDuoiStats: [],
            initialSpecialDauDuoiStats: [],
            initialMetadata: {},
            initialDays: 30,
            initialDauStatsByDate: {},
            initialDuoiStatsByDate: {},
        },
    };
    
    // Original SSR code (disabled due to rate limiting):
    // try {
    //     const days = 30;
    //     const data = await apiMB.getDauDuoiStats(days);
    //     const dateData = await apiMB.getDauDuoiStatsByDate(days);
    //     return {
    //         props: {
    //             initialDauStats: data.dauStatistics || [],
    //             initialDuoiStats: data.duoiStatistics || [],
    //             initialSpecialDauDuoiStats: data.specialDauDuoiStats || [],
    //             initialMetadata: data.metadata || {},
    //             initialDays: days,
    //             initialDauStatsByDate: dateData.dauStatsByDate || {},
    //             initialDuoiStatsByDate: dateData.duoiStatsByDate || {},
    //         },
    //     };
    // } catch (error) {
    //     console.error('Error in getServerSideProps:', error.message);
    //     return {
    //         props: {
    //             initialDauStats: [],
    //             initialDuoiStats: [],
    //             initialSpecialDauDuoiStats: [],
    //             initialMetadata: {},
    //             initialDays: 30,
    //             initialDauStatsByDate: {},
    //             initialDuoiStatsByDate: {},
    //         },
    //     };
    // }
}

export default DauDuoi;
