import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout';
import styles from '../../styles/giaidacbiet.module.css';
// Removed unused imports - ThongKe and CongCuHot only render empty divs
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

const GiaiDacBiet = ({ initialStats, initialMetadata, initialDays }) => {
    const [stats, setStats] = useState(initialStats || []);
    const router = useRouter();

    // ✅ FIX CLS: Ensure metadata always has default values to prevent shift
    const [metadata, setMetadata] = useState(initialMetadata || {
        startDate: 'N/A',
        endDate: 'N/A',
        filterType: ''
    });
    const [days, setDays] = useState(initialDays || 60);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

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

    // Hàm tính toán các thông tin từ 2 số cuối của giải đặc biệt - Memoized
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

    // Hàm gọi API cho Miền Bắc
    const fetchSpecialPrizeStatsMB = useCallback(async (days) => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiMB.getSpecialStats(days);
            setStats(data.statistics || []);
            // ✅ FIX CLS: Ensure metadata always has default values
            setMetadata({
                startDate: data.metadata?.startDate || 'N/A',
                endDate: data.metadata?.endDate || 'N/A',
                filterType: data.metadata?.filterType || '',
                ...data.metadata
            });
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi lấy dữ liệu Miền Bắc.');
            setStats([]);
            // ✅ FIX CLS: Keep default metadata values even on error
            setMetadata({
                startDate: 'N/A',
                endDate: 'N/A',
                filterType: ''
            });
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDaysChange = useCallback((selectedDays) => {
        setDays(selectedDays);
    }, []);

    const toggleContent = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    // Fetch dữ liệu khi days thay đổi hoặc khi component mount lần đầu
    // Điều này đảm bảo dữ liệu luôn được cập nhật mới nhất khi truy cập trang
    useEffect(() => {
        fetchSpecialPrizeStatsMB(days);
    }, [days, fetchSpecialPrizeStatsMB]);

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

    // Hàm tổ chức dữ liệu theo ngày trong tuần (7 cột: Thứ 2 đến CN) - Memoized
    const weeks = useMemo(() => {
        const rows = [];
        let currentRow = Array(7).fill(null);

        // Group stats by date first
        const statsByDate = {};
        stats.forEach(stat => {
            if (!stat.drawDate) return;
            const normalizedDate = stat.drawDate.replace(/\s/g, '').replace(/\/+/g, '/');
            const [day, month, year] = normalizedDate.split('/');
            if (!day || !month || !year) return;
            const dateKey = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
            if (!statsByDate[dateKey]) {
                statsByDate[dateKey] = [];
            }
            statsByDate[dateKey].push(stat);
        });

        // Get all dates and sort them
        const allDates = Object.keys(statsByDate).sort((a, b) => {
            const [dayA, monthA, yearA] = a.split('/');
            const [dayB, monthB, yearB] = b.split('/');
            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);
            return dateA - dateB; // Sort ascending (oldest first)
        });

        // Process each date in order
        allDates.forEach(dateStr => {
            const [day, month, year] = dateStr.split('/');
            const date = new Date(year, month - 1, day);
            const dayOfWeekIndex = (date.getDay() + 6) % 7; // Adjust so Monday = 0

            // If new week starts (Monday), push current row and start new one
            if (dayOfWeekIndex === 0 && currentRow.some(slot => slot !== null)) {
                rows.push(currentRow);
                currentRow = Array(7).fill(null);
            }

            // Add stats to current row
            currentRow[dayOfWeekIndex] = {
                stats: statsByDate[dateStr],
                date: dateStr
            };
        });

        // Push the last row if it has data
        if (currentRow.some(slot => slot !== null)) {
            rows.push(currentRow);
        }

        return rows;
    }, [stats]);

    const getTitle = () => {
        return `Danh sách giải đặc biệt MIỀN BẮC`;
    };

    const pageTitle = getTitle();
    // ✅ FIX CLS: Ensure description always has valid values
    const pageDescription = `Xem danh sách giải đặc biệt Miền Bắc trong ${metadata?.filterType || ''}.`;

    return (
        <Layout>
            <StatisticsSEO 
                pageType="giai-dac-biet"
                metadata={{
                    startDate: metadata.startDate,
                    endDate: metadata.endDate
                }}
                faq={statisticsFAQs['giai-dac-biet']}
                customDescription={pageDescription}
            />

            <div className={styles.container}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>{pageTitle}</h1>
                    <div className={styles.actionBtn}>
                        <Link className={`${styles.actionTK} ${router.pathname.startsWith('/thongke/giai-dac-biet') ? styles.active : ''}`} href="giai-dac-biet">Giải Đặc Biệt </Link>
                        <Link className={`${styles.actionTK} ${router.pathname.startsWith('/thongke/dau-duoi') ? styles.active : ''}`} href="dau-duoi">Đầu Đuôi </Link>
                        <Link className={`${styles.actionTK} ${router.pathname.startsWith('/thongke/giai-dac-biet-tuan') ? styles.active : ''}`} href="giai-dac-biet-tuan">Giải Đặc Biệt Tuần </Link>
                    </div>
                </div>

                <div className={styles.content}>
                    {/* ✅ FIX CLS: Reserve space for metadata */}
                    <div className={styles.metadata}>
                        <p className={styles.metadataTitle}>Danh sách giải đặc biệt từ <span className={styles.dateValue}>{metadata?.startDate || 'N/A'}</span> đến <span className={styles.dateValue}>{metadata?.endDate || 'N/A'}</span></p>
                    </div>

                    <div className={styles.group_Select}>
                        <div className={styles.selectGroup}>
                            <label className={styles.options}>Chọn thời gian: </label>
                            <div className={styles.buttonGroup}>
                                <button
                                    className={`${styles.timeButton} ${days === 10 ? styles.active : ''}`}
                                    onClick={() => handleDaysChange(10)}
                                    aria-label="Chọn 10 ngày"
                                >
                                    10 ngày
                                </button>
                                <button
                                    className={`${styles.timeButton} ${days === 20 ? styles.active : ''}`}
                                    onClick={() => handleDaysChange(20)}
                                    aria-label="Chọn 20 ngày"
                                >
                                    20 ngày
                                </button>
                                <button
                                    className={`${styles.timeButton} ${days === 30 ? styles.active : ''}`}
                                    onClick={() => handleDaysChange(30)}
                                    aria-label="Chọn 30 ngày"
                                >
                                    30 ngày
                                </button>
                                <button
                                    className={`${styles.timeButton} ${days === 60 ? styles.active : ''}`}
                                    onClick={() => handleDaysChange(60)}
                                    aria-label="Chọn 2 tháng"
                                >
                                    2 tháng
                                </button>
                                <button
                                    className={`${styles.timeButton} ${days === 90 ? styles.active : ''}`}
                                    onClick={() => handleDaysChange(90)}
                                    aria-label="Chọn 3 tháng"
                                >
                                    3 tháng
                                </button>
                                <button
                                    className={`${styles.timeButton} ${days === 180 ? styles.active : ''}`}
                                    onClick={() => handleDaysChange(180)}
                                    aria-label="Chọn 6 tháng"
                                >
                                    6 tháng
                                </button>
                                <button
                                    className={`${styles.timeButton} ${days === 270 ? styles.active : ''}`}
                                    onClick={() => handleDaysChange(270)}
                                    aria-label="Chọn 9 tháng"
                                >
                                    9 tháng
                                </button>
                                <button
                                    className={`${styles.timeButton} ${days === 365 ? styles.active : ''}`}
                                    onClick={() => handleDaysChange(365)}
                                    aria-label="Chọn 1 năm"
                                >
                                    1 năm
                                </button>
                            </div>
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

                    {loading && (
                        <div className={styles.tableContainer}>
                            <div className={styles.skeletonWrapper}>
                                <SkeletonTableDaysOfWeek />
                            </div>
                        </div>
                    )}

                    {error && <p className={styles.error}>{error}</p>}

                    {!loading && !error && stats.length > 0 && (
                        <div className={styles.tableContainer}>
                            <table className={styles.table} aria-label="Bảng thống kê giải đặc biệt">
                                <caption className={styles.caption}>Thống kê Giải Đặc Biệt Miền Bắc trong {days} ngày</caption>
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

                    {!loading && !error && stats.length === 0 && metadata.message && (
                        <p className={styles.noData}>{metadata.message}</p>
                    )}
                </div>

                <div className={styles.Group_Content}>
                    <h2 className={styles.heading}>Thống kê giải đặc biệt Miền Bắc - Cập nhật nhanh, chính xác, miễn phí</h2>
                    <div className={`${styles.contentWrapper} ${isExpanded ? styles.expanded : styles.collapsed}`}>
                        <h3 className={styles.h3}>Thống kê giải đặc biệt là gì?</h3>
                        <p className={styles.desc}>Thống kê giải đặc biệt là phương pháp phân tích kết quả giải đặc biệt trong bảng kết quả xổ số. Đây là công cụ hữu ích giúp người chơi theo dõi và phân tích xu hướng số xuất hiện.</p>
                        
                        <h3 className={styles.h3}>Các loại thống kê giải đặc biệt</h3>
                        <p className={styles.desc}><strong className={styles.strong}>Theo tuần:</strong> Thống kê giải đặc biệt theo từng tuần trong năm (53 tuần/năm).</p>
                        <p className={styles.desc}><strong className={styles.strong}>Theo tháng:</strong> Thống kê giải đặc biệt theo từng tháng (12 tháng/năm).</p>
                        <p className={styles.desc}><strong className={styles.strong}>Theo năm:</strong> Thống kê giải đặc biệt theo từng năm để đánh giá xu hướng dài hạn.</p>
                        
                        <h3 className={styles.h3}>Tính năng chính</h3>
                        <p className={styles.desc}><strong className={styles.strong}>Bảng 2 số cuối lâu về nhất:</strong> Hiển thị 10 cặp 2 số cuối giải đặc biệt lâu chưa xuất hiện nhất.</p>
                        <p className={styles.desc}><strong className={styles.strong}>Thống kê đầu đuôi:</strong> Phân tích số hàng chục và hàng đơn vị của giải đặc biệt chưa về gần đây.</p>
                        <p className={styles.desc}><strong className={styles.strong}>Ngày này năm xưa:</strong> Xem lại các giải đặc biệt đã về cùng ngày trong các năm trước.</p>
                        
                        <h3 className={styles.h3}>Lưu ý quan trọng</h3>
                        <p className={styles.desc}>Thống kê giải đặc biệt chỉ mang tính chất tham khảo. Kết quả xổ số là ngẫu nhiên, không có quy luật cố định. Người chơi nên tham gia với tinh thần giải trí, không nên phụ thuộc hoàn toàn vào thống kê.</p>
                        
                        <p className={styles.desc}>Dữ liệu được cập nhật tự động ngay sau mỗi kỳ quay thưởng, đảm bảo tính chính xác và kịp thời. Thống kê giải đặc biệt Miền Bắc tại <a className={styles.action} href='/'>TAODANDEWUKONG.PRO</a> giúp bạn có thêm thông tin để tham khảo khi chọn số.</p>
                    </div>
                    <button
                        className={styles.toggleBtn}
                        onClick={toggleContent}
                    >
                        {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                    </button>
                </div>
            </div>

            {/* ✅ Removed empty ThongKe and CongCuHot components - they only render empty divs */}

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
        const days = 60;
        const data = await apiMB.getSpecialStats(days);

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
                initialDays: 60,
            },
        };
    }
}

export default GiaiDacBiet;
