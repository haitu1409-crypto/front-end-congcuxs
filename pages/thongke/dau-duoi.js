import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout';
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


const DauDuoi = ({ initialDauStats, initialDuoiStats, initialSpecialDauDuoiStats, initialMetadata, initialDays }) => {
    const router = useRouter();
    const [dauStats, setDauStats] = useState(initialDauStats || []);
    const [duoiStats, setDuoiStats] = useState(initialDuoiStats || []);
    // ✅ FIX CLS: Ensure metadata always has default values to prevent shift
    const [metadata, setMetadata] = useState(initialMetadata || {
        startDate: 'N/A',
        endDate: 'N/A',
        totalDraws: 0
    });
    const [days, setDays] = useState(initialDays || 30);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [specialDauDuoiStats, setSpecialDauDuoiStats] = useState(initialSpecialDauDuoiStats || []);
    const [specialDays, setSpecialDays] = useState(initialDays || 30);
    // ✅ FIX CLS: Ensure specialMetadata always has default values
    const [specialMetadata, setSpecialMetadata] = useState(initialMetadata || {
        startDate: 'N/A',
        endDate: 'N/A',
        totalDraws: 0
    });
    const [specialLoading, setSpecialLoading] = useState(false);
    const [specialError, setSpecialError] = useState(null);

    const [dauStatsByDate, setDauStatsByDate] = useState({});
    const [dauByDateDays, setDauByDateDays] = useState(initialDays || 30);
    // ✅ FIX CLS: Ensure dauByDateMetadata always has default values
    const [dauByDateMetadata, setDauByDateMetadata] = useState(initialMetadata || {
        startDate: 'N/A',
        endDate: 'N/A'
    });
    const [dauByDateLoading, setDauByDateLoading] = useState(false);
    const [dauByDateError, setDauByDateError] = useState(null);

    const [duoiStatsByDate, setDuoiStatsByDate] = useState({});
    const [duoiByDateDays, setDuoiByDateDays] = useState(initialDays || 30);
    // ✅ FIX CLS: Ensure duoiByDateMetadata always has default values
    const [duoiByDateMetadata, setDuoiByDateMetadata] = useState(initialMetadata || {
        startDate: 'N/A',
        endDate: 'N/A'
    });
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
            // ✅ FIX CLS: Ensure metadata always has default values
            setMetadata({
                startDate: data.metadata?.startDate || 'N/A',
                endDate: data.metadata?.endDate || 'N/A',
                totalDraws: data.metadata?.totalDraws || 0,
                ...data.metadata
            });
        } catch (err) {
            const errorMessage = err.message || 'Có lỗi xảy ra khi lấy dữ liệu.';
            setError(errorMessage);
            setDauStats([]);
            setDuoiStats([]);
            // ✅ FIX CLS: Keep default metadata values even on error
            setMetadata({
                startDate: 'N/A',
                endDate: 'N/A',
                totalDraws: 0
            });
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
            // ✅ FIX CLS: Ensure specialMetadata always has default values
            setSpecialMetadata({
                startDate: specialData.metadata?.startDate || 'N/A',
                endDate: specialData.metadata?.endDate || 'N/A',
                totalDraws: specialData.metadata?.totalDraws || 0,
                ...specialData.metadata
            });
        } catch (err) {
            const errorMessage = err.message || 'Có lỗi xảy ra khi lấy dữ liệu.';
            setSpecialError(errorMessage);
            setSpecialDauDuoiStats([]);
            // ✅ FIX CLS: Keep default metadata values even on error
            setSpecialMetadata({
                startDate: 'N/A',
                endDate: 'N/A',
                totalDraws: 0
            });
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
            // ✅ FIX CLS: Ensure metadata always has default values
            setDauByDateMetadata({
                startDate: data.metadata?.startDate || 'N/A',
                endDate: data.metadata?.endDate || 'N/A',
                ...data.metadata
            });
        } catch (err) {
            const errorMessage = err.message || 'Có lỗi xảy ra khi lấy dữ liệu.';
            setDauByDateError(errorMessage);
            setDauStatsByDate({});
            // ✅ FIX CLS: Keep default metadata values even on error
            setDauByDateMetadata({
                startDate: 'N/A',
                endDate: 'N/A'
            });
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
            // ✅ FIX CLS: Ensure metadata always has default values
            setDuoiByDateMetadata({
                startDate: data.metadata?.startDate || 'N/A',
                endDate: data.metadata?.endDate || 'N/A',
                ...data.metadata
            });
        } catch (err) {
            const errorMessage = err.message || 'Có lỗi xảy ra khi lấy dữ liệu.';
            setDuoiByDateError(errorMessage);
            setDuoiStatsByDate({});
            // ✅ FIX CLS: Keep default metadata values even on error
            setDuoiByDateMetadata({
                startDate: 'N/A',
                endDate: 'N/A'
            });
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

    // Fetch dữ liệu khi days thay đổi hoặc khi component mount lần đầu
    // Điều này đảm bảo dữ liệu luôn được cập nhật mới nhất khi truy cập trang
    useEffect(() => {
        fetchDauDuoiStats(days);
    }, [days, fetchDauDuoiStats]);

    useEffect(() => {
        fetchSpecialDauDuoiStats(specialDays);
    }, [specialDays, fetchSpecialDauDuoiStats]);

    useEffect(() => {
        fetchDauStatsByDate(dauByDateDays);
    }, [dauByDateDays, fetchDauStatsByDate]);

    useEffect(() => {
        fetchDuoiStatsByDate(duoiByDateDays);
    }, [duoiByDateDays, fetchDuoiStatsByDate]);

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
    // ✅ FIX CLS: Ensure description always has valid values
    const pageDescription = `Xem thống kê Đầu Đuôi loto Xổ số Miền Bắc trong ${days} ngày. Cập nhật mới nhất ${metadata?.startDate && metadata?.endDate && metadata.startDate !== 'N/A' && metadata.endDate !== 'N/A' ? `từ ${metadata.startDate} đến ${metadata.endDate}` : 'hàng ngày'}.`;

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
                        <Link className={`${styles.actionTK} ${router.pathname.startsWith('/thongke/giai-dac-biet-tuan') ? styles.active : ''}`} href="/thongke/giai-dac-biet-tuan">Giải Đặc Biệt Tuần</Link>
                    </div>
                </div>

                <div className={styles.content}>
                    {/* Bảng 1: Thống kê Đầu/Đuôi Loto (tất cả các giải) */}
                    <div>

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
                                    <option value={270}>9 tháng</option>
                                    <option value={365}>1 năm</option>
                                </select>
                            </div>

                            {/* ✅ FIX CLS: Reserve space for dateTimeContainer */}
                            <div className={styles.dateTimeContainer}>
                                <span className={styles.dateTime}>
                                    <span>Ngày bắt đầu:</span> <span className={styles.dateValue}>{metadata?.startDate || 'N/A'}</span>
                                </span>
                                <span className={styles.dateTime}>
                                    <span>Ngày kết thúc:</span> <span className={styles.dateValue}>{metadata?.endDate || 'N/A'}</span>
                                </span>
                            </div>
                        </div>

                        {/* ✅ FIX CLS: Fixed height container with proper min-height */}
                        <div className={styles.tableContainer}>
                            {loading && (
                                <div className={styles.skeletonWrapper}>
                                    <SkeletonTable />
                                </div>
                            )}
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
                            {!loading && !error && combinedDauDuoiStats.length === 0 && metadata?.message && (
                                <p className={styles.noData}>{metadata.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.content}>
                    {/* Bảng 2: Thống kê Đầu/Đuôi giải Đặc Biệt */}
                    {/* ✅ FIX CLS: Fixed height container for special table */}
                    <div className={styles.tableContainer}>
                        {specialLoading && (
                            <div className={styles.skeletonWrapper}>
                                <SkeletonSpecialTable />
                            </div>
                        )}
                        {specialError && <p className={styles.error}>{specialError}</p>}
                        {!specialLoading && !specialError && memoizedSpecialDauDuoiStats.length > 0 && (
                            <div className="mt-8">
                            <div className="metadata">
                                <h2 className={styles.title2}>{getSpecialMessage()}</h2>
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
                                        <option value={270}>9 tháng</option>
                                        <option value={365}>1 năm</option>
                                    </select>
                                </div>

                                {/* ✅ FIX CLS: Reserve space for dateTimeContainer */}
                                <div className={styles.dateTimeContainer}>
                                    <span className={styles.dateTime}>
                                        <span>Ngày bắt đầu:</span> <span className={styles.dateValue}>{specialMetadata?.startDate || 'N/A'}</span>
                                    </span>
                                    <span className={styles.dateTime}>
                                        <span>Ngày kết thúc:</span> <span className={styles.dateValue}>{specialMetadata?.endDate || 'N/A'}</span>
                                    </span>
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
                        {!specialLoading && !specialError && memoizedSpecialDauDuoiStats.length === 0 && specialMetadata?.message && (
                            <p className={styles.noData}>{specialMetadata.message}</p>
                        )}
                    </div>
                </div>

                <div className={styles.content}>
                    {/* Bảng 3: Thống kê Đầu Loto theo ngày */}
                    <div>
                        <div className="metadata">
                            <h2 className={styles.title2}>{getDauByDateMessage()}</h2>
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
                                    <option value={270}>9 tháng</option>
                                    <option value={365}>1 năm</option>
                                </select>
                            </div>

                            {/* ✅ FIX CLS: Reserve space for dateTimeContainer */}
                            <div className={styles.dateTimeContainer}>
                                <span className={styles.dateTime}>
                                    <span>Ngày bắt đầu:</span> <span className={styles.dateValue}>{dauByDateMetadata?.startDate || 'N/A'}</span>
                                </span>
                                <span className={styles.dateTime}>
                                    <span>Ngày kết thúc:</span> <span className={styles.dateValue}>{dauByDateMetadata?.endDate || 'N/A'}</span>
                                </span>
                            </div>
                        </div>

                        {/* ✅ FIX CLS: Fixed height container for dau by date table */}
                        <div className={styles.tableContainer}>
                            {dauByDateLoading && (
                                <div className={styles.skeletonWrapper}>
                                    <SkeletonTableByDate type="dau" />
                                </div>
                            )}
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
                            {!dauByDateLoading && !dauByDateError && dauStatsByDateArray.data.length === 0 && dauByDateMetadata?.message && (
                                <p className={styles.noData}>{dauByDateMetadata.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.content}>
                    {/* Bảng 4: Thống kê Đuôi Loto theo ngày */}
                    <div>
                        <div className="metadata">
                            <h2 className={styles.title2}>{getDuoiByDateMessage()}</h2>
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
                                    <option value={270}>9 tháng</option>
                                    <option value={365}>1 năm</option>
                                </select>
                            </div>

                            {/* ✅ FIX CLS: Reserve space for dateTimeContainer */}
                            <div className={styles.dateTimeContainer}>
                                <span className={styles.dateTime}>
                                    <span>Ngày bắt đầu:</span> <span className={styles.dateValue}>{duoiByDateMetadata?.startDate || 'N/A'}</span>
                                </span>
                                <span className={styles.dateTime}>
                                    <span>Ngày kết thúc:</span> <span className={styles.dateValue}>{duoiByDateMetadata?.endDate || 'N/A'}</span>
                                </span>
                            </div>
                        </div>

                        {/* ✅ FIX CLS: Fixed height container for duoi by date table */}
                        <div className={styles.tableContainer}>
                            {duoiByDateLoading && (
                                <div className={styles.skeletonWrapper}>
                                    <SkeletonTableByDate type="duoi" />
                                </div>
                            )}
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
                            {!duoiByDateLoading && !duoiByDateError && duoiStatsByDateArray.data.length === 0 && duoiByDateMetadata?.message && (
                                <p className={styles.noData}>{duoiByDateMetadata.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.Group_Content}>
                    <h2 className={styles.heading}>Thống kê đầu đuôi Miền Bắc - Phân tích tần suất số xuất hiện</h2>
                    <div className={`${styles.contentWrapper} ${isExpanded ? styles.expanded : styles.collapsed}`}>
                        <h3 className={styles.h3}>Thống kê đầu đuôi là gì?</h3>
                        <p className={styles.desc}>Thống kê đầu đuôi là phương pháp phân tích tần suất xuất hiện của chữ số đầu (hàng chục) và chữ số cuối (hàng đơn vị) trong 2 số cuối của các giải xổ số. Công cụ này giúp người chơi nhận biết xu hướng số xuất hiện để tham khảo khi chọn số.</p>
                        
                        <h3 className={styles.h3}>Thông tin trong bảng thống kê</h3>
                        <p className={styles.desc}><strong className={styles.strong}>Đầu số:</strong> Thống kê tần suất của chữ số đầu tiên trong 2 số cuối (Đầu 0 đến Đầu 9).</p>
                        <p className={styles.desc}><strong className={styles.strong}>Đuôi số:</strong> Thống kê tần suất của chữ số cuối cùng trong 2 số cuối (Đuôi 0 đến Đuôi 9).</p>
                        <p className={styles.desc}><strong className={styles.strong}>Phần trăm và số lần:</strong> Mỗi đầu/đuôi hiển thị số lần xuất hiện và phần trăm tương ứng, kèm thanh biểu đồ trực quan để dễ so sánh.</p>
                        <p className={styles.desc}><strong className={styles.strong}>Khoảng thời gian:</strong> Chọn từ 30 ngày, 60 ngày, 90 ngày, 120 ngày, 6 tháng, 9 tháng hoặc 1 năm để phân tích.</p>
                        
                        <h3 className={styles.h3}>Tính năng chính</h3>
                        <p className={styles.desc}><strong className={styles.strong}>Thống kê đầu đuôi tất cả giải:</strong> Phân tích đầu đuôi từ tất cả các giải trong bảng kết quả.</p>
                        <p className={styles.desc}><strong className={styles.strong}>Thống kê đầu đuôi giải đặc biệt:</strong> Phân tích riêng đầu đuôi của giải đặc biệt.</p>
                        <p className={styles.desc}><strong className={styles.strong}>Thống kê theo ngày:</strong> Xem chi tiết số lần xuất hiện của từng đầu/đuôi theo từng ngày trong khoảng thời gian đã chọn.</p>
                        
                        <h3 className={styles.h3}>Cách sử dụng</h3>
                        <p className={styles.desc}>Chọn khoảng thời gian muốn phân tích từ menu dropdown. Bảng thống kê sẽ hiển thị tần suất và phần trăm xuất hiện của từng đầu/đuôi. Thanh biểu đồ màu xanh giúp bạn dễ dàng nhận biết số nào xuất hiện nhiều hoặc ít nhất.</p>
                        
                        <h3 className={styles.h3}>Lưu ý quan trọng</h3>
                        <p className={styles.desc}>Thống kê đầu đuôi chỉ mang tính chất tham khảo. Kết quả xổ số là ngẫu nhiên, không có quy luật cố định. Người chơi nên tham gia với tinh thần giải trí, không nên phụ thuộc hoàn toàn vào thống kê.</p>
                        
                        <p className={styles.desc}>Dữ liệu được cập nhật tự động ngay sau mỗi kỳ quay thưởng, đảm bảo tính chính xác và kịp thời. Thống kê đầu đuôi Miền Bắc tại <a className={styles.action} href='/'>TAODANDEWUKONG.PRO</a> giúp bạn có thêm thông tin để tham khảo khi chọn số.</p>
                    </div>
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

                {/* ✅ FIX CLS: Reserve space for lazy loaded components */}
                <div className={styles.lazyComponentsContainer}>
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
