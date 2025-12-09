/**
 * Page Thống Kê Giải Đặc Biệt - Hiển Thị Dạng Năm
 * Hiển thị bảng thống kê giải đặc biệt theo dạng lưới 12 tháng (12 cột: Tháng 1-12, 31 dòng: Ngày 1-31)
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout';
import StatisticsSEO from '../../components/StatisticsSEO';
import styles from '../../styles/giaiDacBietThang.module.css';
import { apiMB } from '../api/kqxsMB';
import Link from 'next/link';
import { useRouter } from 'next/router';
const statisticsFAQs = require('../../config/statisticsFAQs');

// Skeleton Loading Component cho bảng 12 cột (Tháng 1 đến Tháng 12)
const SkeletonRowMonths = () => (
    <tr>
        {Array(12).fill().map((_, index) => (
            <td key={index}><div className={styles.skeleton}></div></td>
        ))}
    </tr>
);

const SkeletonTableMonths = () => (
    <table className={styles.table} aria-label="Bảng skeleton cho thống kê giải đặc biệt theo năm">
        <thead>
            <tr>
                <th>Tháng 1</th>
                <th>Tháng 2</th>
                <th>Tháng 3</th>
                <th>Tháng 4</th>
                <th>Tháng 5</th>
                <th>Tháng 6</th>
                <th>Tháng 7</th>
                <th>Tháng 8</th>
                <th>Tháng 9</th>
                <th>Tháng 10</th>
                <th>Tháng 11</th>
                <th>Tháng 12</th>
            </tr>
        </thead>
        <tbody>
            {Array(5).fill().map((_, index) => <SkeletonRowMonths key={index} />)}
        </tbody>
    </table>
);

const GiaiDacBietThang = ({ initialStats, initialMetadata, initialDays }) => {
    const [stats, setStats] = useState(initialStats || []);
    const router = useRouter();
    
    // ✅ FIX CLS: Ensure metadata always has default values to prevent shift
    const [metadata, setMetadata] = useState(initialMetadata || {
        startDate: 'N/A',
        endDate: 'N/A',
        filterType: ''
    });
    const [days, setDays] = useState(initialDays || 365);
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
    const [highlightedCells, setHighlightedCells] = useState(new Set());

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

    // Memoized style objects để tránh tạo mới mỗi render
    const numberStyle = useMemo(() => ({ padding: 0, margin: 0, fontSize: '1rem' }), []);
    const dateTextStyle = useMemo(() => ({ fontSize: '0.65rem' }), []);
    const infoTextStyle = useMemo(() => ({ fontSize: '0.75rem' }), []);
    const emptyCellStyle = useMemo(() => ({ minHeight: '44px', width: '100%' }), []);

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

    // Hàm tổ chức dữ liệu theo năm (12 cột: Tháng 1 đến Tháng 12) với lưới 31 dòng - Memoized
    const months = useMemo(() => {
        // Group stats theo năm/tháng/ngày
        const statsByYearMonthDay = {};

        stats.forEach(stat => {
            if (!stat.drawDate) return;
            const normalizedDate = stat.drawDate.replace(/\s/g, '').replace(/\/+/g, '/');
            const [dayStr, monthStr, yearStr] = normalizedDate.split('/');
            if (!dayStr || !monthStr || !yearStr) return;

            const monthNum = parseInt(monthStr, 10);
            const yearNum = parseInt(yearStr, 10);
            const dayNum = parseInt(dayStr, 10);

            // Kiểm tra tính hợp lệ
            if (isNaN(monthNum) || isNaN(yearNum) || isNaN(dayNum)) return;
            if (monthNum < 1 || monthNum > 12) return;
            if (dayNum < 1 || dayNum > 31) return;

            const key = `${yearNum}-${monthNum}-${dayNum}`;
            if (!statsByYearMonthDay[key]) {
                statsByYearMonthDay[key] = [];
            }
            statsByYearMonthDay[key].push({
                ...stat,
                _day: dayNum,
                _month: monthNum,
                _year: yearNum
            });
        });

        // Tạo cấu trúc lưới: mỗi năm có 31 dòng x 12 cột
        const yearsData = {};
        const allYears = new Set();

        // Lấy tất cả năm có dữ liệu
        Object.keys(statsByYearMonthDay).forEach(key => {
            const [year] = key.split('-');
            allYears.add(parseInt(year, 10));
        });

        // Tạo lưới cho mỗi năm: 31 dòng x 12 cột
        allYears.forEach(yearNum => {
            // Tạo 31 dòng
            const gridRows = [];
            for (let day = 1; day <= 31; day++) {
                // Mỗi dòng có 12 ô (12 tháng)
                const row = [];
                for (let month = 1; month <= 12; month++) {
                    const key = `${yearNum}-${month}-${day}`;
                    const dayStats = statsByYearMonthDay[key] || null;
                    row.push(dayStats);
                }
                gridRows.push(row);
            }
            yearsData[yearNum] = gridRows;
        });

        // Sắp xếp theo năm và trả về
        const sortedYears = Array.from(allYears).sort((a, b) => a - b);
        return sortedYears.map(yearNum => ({
            year: yearNum,
            grid: yearsData[yearNum] // 31 dòng x 12 cột
        }));
    }, [stats]);

    const handleCellClick = useCallback((year, month, day, hasData) => {
        if (!hasData) return;
        const key = `${year}-${month}-${day}`;
        setHighlightedCells(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    }, []);

    // Memoize table className để tránh tạo lại mỗi lần render
    const tableClassName = useMemo(() => {
        return `${styles.table} monthMode`;
    }, [styles.table]);

    const getTitle = () => {
        return `Thống kê giải đặc biệt MIỀN BẮC - Hiển thị theo năm`;
    };

    const pageTitle = getTitle();
    // ✅ FIX CLS: Ensure description always has valid values
    const pageDescription = `Xem thống kê giải đặc biệt Miền Bắc theo dạng lưới 12 tháng (12 cột x 31 dòng) trong ${metadata?.filterType || ''}.`;

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
                customTitle={pageTitle}
            />

            <div className={styles.container}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>{pageTitle}</h1>
                    <div className={styles.actionBtn}>
                        <Link className={`${styles.actionTK} ${router.pathname.startsWith('/thongke/giai-dac-biet') ? styles.active : ''}`} href="/thongke/giai-dac-biet">Đặc Biệt</Link>
                        <Link className={`${styles.actionTK} ${router.pathname.startsWith('/thongke/giai-dac-biet-nam') ? styles.active : ''}`} href="/thongke/giai-dac-biet-nam">Đặc Biệt Năm</Link>
                        <Link className={`${styles.actionTK} ${router.pathname.startsWith('/thongke/dau-duoi') ? styles.active : ''}`} href="/thongke/dau-duoi">Đầu Đuôi</Link>
                    </div>
                </div>

                <div className={styles.content}>
                    {/* ✅ FIX CLS: Reserve space for metadata */}
                    <div className={styles.metadata}>
                        <p className={styles.metadataTitle}>Thống kê giải đặc biệt từ <span className={styles.dateValue}>{metadata?.startDate || 'N/A'}</span> đến <span className={styles.dateValue}>{metadata?.endDate || 'N/A'}</span></p>
                        {metadata.coverageStatus === 'partial' && metadata.coverageMessage && (
                            <p
                                style={{
                                    marginTop: '8px',
                                    color: '#c2410c',
                                    fontStyle: 'italic',
                                    fontSize: '14px'
                                }}
                            >
                                {metadata.coverageMessage}
                            </p>
                        )}
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
                    <div className={styles.toggleButtons} style={{ marginBottom: '15px' }}>
                        <div className={styles.toggleItem}>
                            <input type="checkbox" id="thang-is-date" checked={showDate} onChange={(e) => setShowDate(e.target.checked)} />
                            <label htmlFor="thang-is-date">Ngày</label>
                        </div>
                        <div className={styles.toggleItem}>
                            <input type="checkbox" id="thang-is-total" checked={showTotal} onChange={(e) => setShowTotal(e.target.checked)} />
                            <label htmlFor="thang-is-total">Tổng</label>
                        </div>
                        <div className={styles.toggleItem}>
                            <input type="checkbox" id="thang-is-head" checked={showHead} onChange={(e) => setShowHead(e.target.checked)} />
                            <label htmlFor="thang-is-head">Đầu</label>
                        </div>
                        <div className={styles.toggleItem}>
                            <input type="checkbox" id="thang-is-tail" checked={showTail} onChange={(e) => setShowTail(e.target.checked)} />
                            <label htmlFor="thang-is-tail">Đuôi</label>
                        </div>
                        <div className={styles.toggleItem}>
                            <input type="checkbox" id="thang-is-even" checked={showEvenOdd} onChange={(e) => setShowEvenOdd(e.target.checked)} />
                            <label htmlFor="thang-is-even">Chẵn lẻ</label>
                        </div>
                        <div className={styles.toggleItem}>
                            <input type="checkbox" id="thang-set" checked={showSet} onChange={(e) => setShowSet(e.target.checked)} />
                            <label htmlFor="thang-set">Bộ</label>
                        </div>
                    </div>

                    {loading && (
                        <div className={styles.tableContainer}>
                            <div className={styles.skeletonWrapper}>
                                <SkeletonTableMonths />
                            </div>
                        </div>
                    )}

                    {error && <p className={styles.error}>{error}</p>}

                    {!loading && !error && stats.length > 0 && (
                        <div className={`${styles.tableContainer} ${styles.monthTableContainer}`} style={{ position: 'relative' }}>
                            <table
                                className={tableClassName}
                                    aria-label="Bảng thống kê giải đặc biệt theo năm"
                                style={{
                                    fontSize: '0.85rem'
                                }}
                            >
                                <caption className={styles.caption}>
                                    Thống kê Giải Đặc Biệt Miền Bắc theo dạng lưới 12 tháng (12 cột x 31 dòng) trong {days} ngày
                                </caption>
                                <thead>
                                    <tr>
                                        <th>Tháng 1</th>
                                        <th>Tháng 2</th>
                                        <th>Tháng 3</th>
                                        <th>Tháng 4</th>
                                        <th>Tháng 5</th>
                                        <th>Tháng 6</th>
                                        <th>Tháng 7</th>
                                        <th>Tháng 8</th>
                                        <th>Tháng 9</th>
                                        <th>Tháng 10</th>
                                        <th>Tháng 11</th>
                                        <th>Tháng 12</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {months.length > 0 ? (
                                        <React.Fragment>
                                            {months.map((yearData, yearIndex) => {
                                                const { year, grid } = yearData; // grid là 31 dòng x 12 cột

                                                return (
                                                    <React.Fragment key={`year-${year}`}>
                                                        {months.length > 1 && (
                                                            <tr>
                                                                <td colSpan={12} style={{
                                                                    backgroundColor: '#f0f0f0',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '16px',
                                                                    padding: '12px',
                                                                    textAlign: 'center'
                                                                }}>
                                                                    Năm {year}
                                                                </td>
                                                            </tr>
                                                        )}
                                                        {grid.map((row, dayIndex) => {
                                                            const day = dayIndex + 1; // Ngày từ 1-31
                                                            return (
                                                                <tr key={`day-${day}`}>
                                                                    {row.map((dayStats, monthIndex) => {
                                                                        const month = monthIndex + 1; // Tháng từ 1-12
                                                                        // dayStats có thể là null (không có dữ liệu) hoặc array stats
                                                                        const slot = dayStats && dayStats.length > 0 ? { stats: dayStats, month, year, day } : null;
                                                                        const cellKey = `${year}-${month}-${day}`;
                                                                        const isHighlighted = highlightedCells.has(cellKey);

                                                                        return (
                                                                            <td
                                                                                key={monthIndex}
                                                                                data-month-index={monthIndex}
                                                                                data-year={year}
                                                                                data-day-index={dayIndex}
                                                                                data-day={day}
                                                                                onClick={() => handleCellClick(year, month, day, !!slot)}
                                                                                className={`${slot ? styles.clickableCell : ''} ${isHighlighted ? styles.highlightedCell : ''}`}
                                                                            >
                                                                                {slot && slot.stats ? (
                                                                                    <div className={styles.entry}>
                                                                                        {slot.stats.map((stat, statIndex) => {
                                                                                            const info = calculateSpecialInfo(stat.number);

                                                                                            return (
                                                                                                <div
                                                                                                    key={statIndex}
                                                                                                    className={styles.statItem}
                                                                                                >
                                                                                                    <div
                                                                                                        className={styles.number}
                                                                                                        style={numberStyle}
                                                                                                    >
                                                                                                        {stat.number.slice(0, -2)}
                                                                                                        <span
                                                                                                            className={styles.lastTwo}
                                                                                                        >
                                                                                                            {stat.number.slice(-2)}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                    {showDate && stat.drawDate && (
                                                                                                        <div
                                                                                                            className={styles.date}
                                                                                                            style={dateTextStyle}
                                                                                                        >
                                                                                                            {stat.drawDate}
                                                                                                        </div>
                                                                                                    )}
                                                                                                    {showTotal && info && (
                                                                                                        <div style={infoTextStyle}>{info.total}</div>
                                                                                                    )}
                                                                                                    {showHead && info && (
                                                                                                        <div style={infoTextStyle}>{info.head}</div>
                                                                                                    )}
                                                                                                    {showTail && info && (
                                                                                                        <div style={infoTextStyle}>{info.tail}</div>
                                                                                                    )}
                                                                                                    {showEvenOdd && info && (
                                                                                                        <div style={infoTextStyle}>{info.evenOdd}</div>
                                                                                                    )}
                                                                                                    {showSet && info && (
                                                                                                        <div style={infoTextStyle}>{info.lastTwo}</div>
                                                                                                    )}
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className={styles.emptyCellPlaceholder} style={emptyCellStyle}>&nbsp;</div>
                                                                                )}
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            );
                                                        })}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </React.Fragment>
                                    ) : (
                                        <tr>
                                            <td colSpan={12} className={styles.noData}>
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
                    <h2 className={styles.heading}>Thống kê giải đặc biệt Miền Bắc theo năm - Hiển thị dạng lưới 12 tháng</h2>
                    <div className={`${styles.contentWrapper} ${isExpanded ? styles.expanded : styles.collapsed}`}>
                        <h3 className={styles.h3}>Thống kê giải đặc biệt theo năm là gì?</h3>
                        <p className={styles.desc}>
                            Thống kê giải đặc biệt theo năm là phương pháp hiển thị kết quả giải đặc biệt dưới dạng lưới với 12 cột (tương ứng 12 tháng) và 31 dòng (tương ứng 31 ngày trong tháng). 
                            Giúp người chơi dễ dàng theo dõi và phân tích xu hướng số xuất hiện trong cả năm.
                        </p>
                        
                        <h3 className={styles.h3}>Ưu điểm của hiển thị dạng năm</h3>
                        <p className={styles.desc}>
                            <strong className={styles.strong}>Dễ so sánh:</strong> Có thể so sánh kết quả cùng ngày giữa các tháng trong cả năm.
                        </p>
                        <p className={styles.desc}>
                            <strong className={styles.strong}>Phân tích xu hướng:</strong> Nhận biết được tháng nào có nhiều kết quả hơn, tháng nào ít hơn trong năm.
                        </p>
                        <p className={styles.desc}>
                            <strong className={styles.strong}>Tìm pattern:</strong> Dễ dàng phát hiện các pattern lặp lại theo chu kỳ tháng trong năm.
                        </p>
                        
                        <h3 className={styles.h3}>Tính năng chính</h3>
                        <p className={styles.desc}>
                            <strong className={styles.strong}>Lưới 12x31:</strong> Hiển thị dữ liệu trong lưới 12 cột (tháng) x 31 dòng (ngày), mỗi ô tương ứng với một ngày cụ thể trong năm.
                        </p>
                        <p className={styles.desc}>
                            <strong className={styles.strong}>Toggle thông tin:</strong> Bật/tắt hiển thị ngày, tổng, đầu, đuôi, chẵn lẻ, bộ để tùy chỉnh theo nhu cầu.
                        </p>
                        <p className={styles.desc}>
                            <strong className={styles.strong}>Màu 2 số cuối:</strong> Tùy chỉnh màu sắc cho 2 chữ số cuối của giải đặc biệt.
                        </p>
                        <p className={styles.desc}>
                            <strong className={styles.strong}>Chế độ OLED:</strong> Chế độ tối giúp giảm mỏi mắt khi xem lâu.
                        </p>
                        
                        <h3 className={styles.h3}>Lưu ý quan trọng</h3>
                        <p className={styles.desc}>
                            Thống kê giải đặc biệt chỉ mang tính chất tham khảo. Kết quả xổ số là ngẫu nhiên, không có quy luật cố định. 
                            Người chơi nên tham gia với tinh thần giải trí, không nên phụ thuộc hoàn toàn vào thống kê.
                        </p>
                        
                        <p className={styles.desc}>
                            Dữ liệu được cập nhật tự động ngay sau mỗi kỳ quay thưởng, đảm bảo tính chính xác và kịp thời. 
                            Thống kê giải đặc biệt Miền Bắc theo năm tại <a className={styles.action} href='/'>TAODANDEWUKONG.PRO</a> giúp bạn có thêm thông tin để tham khảo khi chọn số.
                        </p>
                    </div>
                    <button
                        className={styles.toggleBtn}
                        onClick={toggleContent}
                    >
                        {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                    </button>
                </div>
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
        const days = 365;
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
                initialDays: 365,
            },
        };
    }
}

export default GiaiDacBietThang;

