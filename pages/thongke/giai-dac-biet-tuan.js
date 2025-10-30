import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Layout from '../../components/Layout';
import UpdateButton from '../../components/UpdateButton';
import styles from '../../styles/giaidacbiettuan.module.css';
import ThongKe from '../../components/ThongKe';
import CongCuHot from '../../components/CongCuHot';
import { apiMB } from '../api/kqxsMB';
import Link from 'next/link';
import { useRouter } from 'next/router';
import StatisticsSEO from '../../components/StatisticsSEO';
const statisticsFAQs = require('../../config/statisticsFAQs');

// Skeleton Loading Component cho bảng 7 cột (Thứ 2 đến CN)
const SkeletonRowDaysOfWeek = () => (
    <tr>
        {Array(7).fill().map((_, index) => (
            <td key={index}><div className={styles.skeleton}></div></td>
        ))}
    </tr>
);

const SkeletonTableDaysOfWeek = () => (
    <table className={styles.table} aria-label="Bảng skeleton cho thống kê giải đặc biệt">
        <thead>
            <tr>
                <th>Thứ 2</th>
                <th>Thứ 3</th>
                <th>Thứ 4</th>
                <th>Thứ 5</th>
                <th>Thứ 6</th>
                <th>Thứ 7</th>
                <th>CN</th>
            </tr>
        </thead>
        <tbody>
            {Array(5).fill().map((_, index) => <SkeletonRowDaysOfWeek key={index} />)}
        </tbody>
    </table>
);

const GiaiDacBietTheoTuan = ({ initialStats, initialMetadata, initialMonth, initialYear }) => {
    const router = useRouter();
    const [stats, setStats] = useState(initialStats || []);
    const [metadata, setMetadata] = useState(initialMetadata || {});
    const [month, setMonth] = useState(initialMonth || new Date().getMonth() + 1);
    const [year, setYear] = useState(initialYear || new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const abortControllerRef = useRef(null);
    
    // Toggle states cho các thông tin hiển thị
    const [showDate, setShowDate] = useState(true);
    const [showTotal, setShowTotal] = useState(false);
    const [showHead, setShowHead] = useState(false);
    const [showTail, setShowTail] = useState(false);
    const [showEvenOdd, setShowEvenOdd] = useState(false);
    const [showSet, setShowSet] = useState(false);
    
    // State để lưu các td đang được highlight
    const [highlightedCells, setHighlightedCells] = useState(new Set());
    
    // Hàm xử lý click vào td để toggle highlight
    const handleCellClick = (weekIndex, dayIndex) => {
        const cellKey = `${weekIndex}-${dayIndex}`;
        setHighlightedCells(prev => {
            const newSet = new Set(prev);
            if (newSet.has(cellKey)) {
                newSet.delete(cellKey);
            } else {
                newSet.add(cellKey);
            }
            return newSet;
        });
    };

    // Hàm gọi API cho Miền Bắc
    const fetchSpecialPrizeStatsByWeekMB = useCallback(async (month, year) => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiMB.getSpecialStatsByWeek(month, year);
            setStats(data.statistics || []);
            setMetadata(data.metadata || {});
            if (!data.statistics || data.statistics.length === 0) {
                setError(`Không có dữ liệu giải đặc biệt cho Miền Bắc trong tháng ${month}/${year}.`);
            }
        } catch (err) {
            setError(`Không có dữ liệu giải đặc biệt cho Miền Bắc trong tháng ${month}/${year}.`);
            setStats([]);
            setMetadata({});
        } finally {
            setLoading(false);
        }
    }, []);

    const handleMonthChange = useCallback((e) => {
        const selectedMonth = Number(e.target.value);
        setMonth(selectedMonth);
    }, []);

    const handleYearChange = useCallback((e) => {
        const selectedYear = Number(e.target.value);
        setYear(selectedYear);
    }, []);

    // Hàm cập nhật thống kê
    const handleUpdateStats = async () => {
        try {
            // Gọi API cập nhật
            const result = await apiMB.updateSpecialStatsByWeek(month, year);
            
            if (result.success) {
                // Sau khi cập nhật thành công, lấy lại dữ liệu
                setLoading(true);
                setError(null);
                try {
                    const data = await apiMB.getSpecialStatsByWeek(month, year);
                    setStats(data.statistics || []);
                    setMetadata(data.metadata || {});
                    if (!data.statistics || data.statistics.length === 0) {
                        setError(`Không có dữ liệu giải đặc biệt cho Miền Bắc trong tháng ${month}/${year}.`);
                    }
                } catch (err) {
                    setError(`Không có dữ liệu giải đặc biệt cho Miền Bắc trong tháng ${month}/${year}.`);
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

    const toggleContent = () => {
        setIsExpanded(!isExpanded);
    };

    useEffect(() => {
        fetchSpecialPrizeStatsByWeekMB(month, year);
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [month, year, fetchSpecialPrizeStatsByWeekMB]);

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

    // Hàm tổ chức dữ liệu theo ngày trong tuần (tối ưu hóa) - Memoized
    const weeks = useMemo(() => {
        const daysInMonth = new Date(year, month, 0).getDate();
        const rows = [];
        let currentRow = Array(7).fill(null);

        // Cache normalized stats to avoid repeated processing
        const normalizedStats = stats.map(stat => {
            if (!stat.drawDate) return null;
            try {
                const normalizedDate = stat.drawDate.replace(/\s/g, '').replace(/\/+/g, '/');
                const [dayApi, monthApi, yearApi] = normalizedDate.split('/');
                if (!dayApi || !monthApi || !yearApi) return null;
                return {
                    ...stat,
                    normalizedDate: `${dayApi.padStart(2, '0')}/${monthApi.padStart(2, '0')}/${yearApi}`
                };
            } catch {
                return null;
            }
        }).filter(Boolean);

        // Process each day in the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dayOfWeekIndex = (date.getDay() + 6) % 7; // Adjust so Monday = 0
            const displayDate = `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

            // Find matching stats for the current date
            const matchingStats = normalizedStats
                .filter(s => s.normalizedDate === displayDate)
                .map(s => ({ ...s, drawDate: displayDate }));

            if (dayOfWeekIndex === 0 && currentRow.some(slot => slot !== null)) {
                rows.push(currentRow);
                currentRow = Array(7).fill(null);
            }

            currentRow[dayOfWeekIndex] = matchingStats.length > 0 ? { stats: matchingStats, date: displayDate } : null;
        }

        if (currentRow.some(slot => slot !== null)) {
            rows.push(currentRow);
        }

        return rows;
    }, [stats, year, month]);

    // Hàm tính toán các thông tin từ 2 số cuối của giải đặc biệt - Memoized với useCallback
    const calculateSpecialInfo = useCallback((number) => {
        const lastTwo = number.slice(-2);
        const firstDigit = parseInt(lastTwo[0]);
        const secondDigit = parseInt(lastTwo[1]);
        const total = firstDigit + secondDigit;
        const isEven = total % 2 === 0;
        
        return {
            lastTwo,        // 2 số cuối (Bộ)
            total,          // Tổng 2 số
            head: firstDigit,   // Đầu
            tail: secondDigit,  // Đuôi
            evenOdd: isEven ? 'C' : 'L'  // Chẵn lẻ
        };
    }, []);

    const getTitle = () => {
        return `Thống kê giải đặc biệt theo tuần MIỀN BẮC tháng ${month}/${year}`;
    };

    const pageTitle = getTitle();
    const pageDescription = `Xem thống kê giải đặc biệt theo tuần Miền Bắc trong tháng ${month}/${year}.`;

    return (
        <Layout>
            <StatisticsSEO 
                pageType="giai-dac-biet-tuan"
                metadata={{
                    startDate: metadata.startDate,
                    endDate: metadata.endDate
                }}
                faq={statisticsFAQs['giai-dac-biet-tuan']}
                customDescription={pageDescription}
            />

            <div className={styles.container}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>{pageTitle}</h1>
                    <div className={styles.actionBtn}>
                        <Link className={styles.actionTK} href="giai-dac-biet">Thống Kê Giải Đặc Biệt </Link>
                        <Link className={`${styles.actionTK} ${router.pathname.startsWith('/thongke/dau-duoi') ? styles.active : ''}`} href="dau-duoi">Thống Kê Đầu Đuôi </Link>
                        <Link className={`${styles.actionTK} ${router.pathname.startsWith('/thongke/giai-dac-biet-tuan') ? styles.active : ''}`} href="giai-dac-biet-tuan">Thống Kê Giải Đặc Biệt Tuần </Link>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className="metadata">
                        <p className={styles.title}>Thống kê giải đặc biệt từ {metadata.startDate || ''} đến {metadata.endDate || ''}</p>
                    </div>

                    {/* Bộ lọc: Tháng, Năm */}
                    <div className={styles.group_Select}>
                        <div className={styles.selectGroup}>
                            <label className={styles.options}>Chọn tháng: </label>
                            <select className={styles.select} value={month} onChange={handleMonthChange}
                                aria-label="Chọn tháng để xem thống kê giải đặc biệt tuần"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m}>{`Tháng ${m}`}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.selectGroup}>
                            <label className={styles.options}>Chọn năm: </label>
                            <select className={styles.select} value={year} onChange={handleYearChange}
                                aria-label="Chọn năm để xem thống kê giải đặc biệt tuần"
                            >
                                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Button cập nhật dữ liệu */}
                        <div className={styles.updateButtonWrapper}>
                            <UpdateButton 
                                onUpdate={handleUpdateStats}
                                label="Cập nhật dữ liệu"
                            />
                        </div>
                    </div>

                    {/* Toggle Buttons */}
                    <div className={styles.toggleButtons}>
                        <div className={styles.toggleItem}>
                            <input type="checkbox" id="is-date" checked={showDate} onChange={(e) => setShowDate(e.target.checked)} />
                            <label htmlFor="is-date">Ngày</label>
                        </div>
                        <div className={styles.toggleItem}>
                            <input type="checkbox" id="is-total" checked={showTotal} onChange={(e) => setShowTotal(e.target.checked)} />
                            <label htmlFor="is-total">Tổng</label>
                        </div>
                        <div className={styles.toggleItem}>
                            <input type="checkbox" id="is-head" checked={showHead} onChange={(e) => setShowHead(e.target.checked)} />
                            <label htmlFor="is-head">Đầu</label>
                        </div>
                        <div className={styles.toggleItem}>
                            <input type="checkbox" id="is-tail" checked={showTail} onChange={(e) => setShowTail(e.target.checked)} />
                            <label htmlFor="is-tail">Đuôi</label>
                        </div>
                        <div className={styles.toggleItem}>
                            <input type="checkbox" id="is-even" checked={showEvenOdd} onChange={(e) => setShowEvenOdd(e.target.checked)} />
                            <label htmlFor="is-even">Chẵn lẻ</label>
                        </div>
                        <div className={styles.toggleItem}>
                            <input type="checkbox" id="set" checked={showSet} onChange={(e) => setShowSet(e.target.checked)} />
                            <label htmlFor="set">Bộ</label>
                        </div>
                    </div>

                    {/* Bảng kết quả */}
                    {loading && <SkeletonTableDaysOfWeek />}

                    {error && <p className={styles.error}>{error}</p>}

                    {!loading && !error && (
                        <div className={styles.tableContainer}>
                            <table className={styles.table} aria-label="Bảng thống kê giải đặc biệt theo tuần">
                                <caption className={styles.caption}>Thống kê Giải Đặc Biệt Tuần Miền Bắc</caption>
                                <thead>
                                    <tr>
                                        <th>Thứ 2</th>
                                        <th>Thứ 3</th>
                                        <th>Thứ 4</th>
                                        <th>Thứ 5</th>
                                        <th>Thứ 6</th>
                                        <th>Thứ 7</th>
                                        <th>CN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {weeks.length > 0 ? (
                                        weeks.map((week, weekIndex) => (
                                            <tr key={weekIndex}>
                                                {week.map((slot, dayIndex) => {
                                                    const cellKey = `${weekIndex}-${dayIndex}`;
                                                    const isHighlighted = highlightedCells.has(cellKey);
                                                    return (
                                                    <td 
                                                        key={dayIndex}
                                                        onClick={() => handleCellClick(weekIndex, dayIndex)}
                                                        className={isHighlighted ? styles.highlightedCell : ''}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {slot && slot.stats ? (
                                                            <div className={styles.entry}>
                                                                {slot.stats.map((stat, statIndex) => {
                                                                    const info = calculateSpecialInfo(stat.number);
                                                                    return (
                                                                        <div key={statIndex} className={styles.statItem}>
                                                                            <div className={styles.number}>
                                                                                {stat.number.slice(0, -2)}
                                                                                <span className={styles.lastTwo}>
                                                                                    {stat.number.slice(-2)}
                                                                                </span>
                                                                            </div>
                                                                            {showDate && <div className={styles.date}>{slot.date}</div>}
                                                                            {showTotal && <div>{info.total}</div>}
                                                                            {showHead && <div>{info.head}</div>}
                                                                            {showTail && <div>{info.tail}</div>}
                                                                            {showEvenOdd && <div>{info.evenOdd}</div>}
                                                                            {showSet && <div>{info.lastTwo}</div>}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : null}
                                                    </td>
                                                    );
                                                })}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className={styles.noData}>
                                                Không có dữ liệu giải đặc biệt trong khoảng thời gian đã chọn.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Phần nội dung mô tả */}
                <div className={styles.Group_Content}>
                    <h2 className={styles.heading}>Thống kê giải đặc biệt theo tuần tại Xổ số Miền Bắc</h2>
                    <div className={`${styles.contentWrapper} ${isExpanded ? styles.expanded : styles.collapsed}`}>
                        <h3 className={styles.h3}>Thống Kê giải đặc biệt theo ngày trong tuần</h3>
                        <p className={styles.desc}>Chức năng này cho phép người dùng xem thống kê giải đặc biệt theo các ngày trong tuần (Thứ 2, Thứ 3, ..., Chủ Nhật) trong một tháng, đồng thời có thể chọn từng tháng trong năm để xem giải đặc biệt tương ứng.</p>
                        <p className={styles.desc}>Thống kê được hiển thị theo các ngày trong tuần, mỗi ô hiển thị giải đặc biệt đã xuất hiện trong ngày đó của tháng đã chọn, cùng với thông tin về ngày xổ số.</p>
                        <h3 className={styles.h3}>Lợi ích của việc thống kê theo ngày trong tuần</h3>
                        <p className={styles.desc}>Người chơi có thể theo dõi xu hướng của giải đặc biệt theo từng ngày trong tuần, từ đó đưa ra nhận định và lựa chọn số may mắn phù hợp.</p>
                        <p className={styles.desc}>Chức năng này đặc biệt hữu ích cho những ai muốn phân tích chi tiết hơn về giải đặc biệt trong một khoảng thời gian ngắn (theo ngày trong tuần).</p>
                    </div>
                    <button
                        className={styles.toggleBtn}
                        onClick={toggleContent}
                    >
                        {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                    </button>
                </div>
            </div>

            <div>
                <ThongKe />
                <CongCuHot />
            </div>
            <button
                id="scrollToTopBtn"
                className={styles.scrollToTopBtn}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                title="Quay lại đầu trang"
            >
                ↑
            </button>
        </Layout>
    );
};

// Fetch dữ liệu phía server (SSR)
export async function getServerSideProps() {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const data = await apiMB.getSpecialStatsByWeek(month, year);

        return {
            props: {
                initialStats: data.statistics || [],
                initialMetadata: data.metadata || {},
                initialMonth: month,
                initialYear: year,
            },
        };
    } catch (error) {
        return {
            props: {
                initialStats: [],
                initialMetadata: { message: 'Không có dữ liệu giải đặc biệt trong khoảng thời gian đã chọn.' },
                initialMonth: new Date().getMonth() + 1,
                initialYear: new Date().getFullYear(),
            },
        };
    }
}

export default GiaiDacBietTheoTuan;
