import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Layout from '../../components/Layout';
import styles from '../../styles/giaidacbiet.module.css';
import ThongKe from '../../components/ThongKe';
import CongCuHot from '../../components/CongCuHot';
import UpdateButton from '../../components/UpdateButton';
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

    const [metadata, setMetadata] = useState(initialMetadata || {});
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
            setMetadata(data.metadata || {});
        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra khi lấy dữ liệu Miền Bắc.');
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

    const toggleContent = useCallback(() => {
        setIsExpanded(prev => !prev);
    }, []);

    useEffect(() => {
        fetchSpecialPrizeStatsMB(days);
    }, [days, fetchSpecialPrizeStatsMB]);

    // Hàm cập nhật thống kê
    const handleUpdateStats = async () => {
        try {
            // Gọi API cập nhật
            const result = await apiMB.updateSpecialStats(days);

            if (result.success) {
                // Sau khi cập nhật thành công, lấy lại dữ liệu
                setLoading(true);
                setError(null);
                try {
                    const data = await apiMB.getSpecialStats(days);
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
    const pageDescription = `Xem danh sách giải đặc biệt Miền Bắc trong ${metadata.filterType || ''}.`;

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
                        <Link className={`${styles.actionTK} ${router.pathname.startsWith('/thongke/giai-dac-biet') ? styles.active : ''}`} href="giai-dac-biet">Thống Kê Giải Đặc Biệt </Link>
                        <Link className={`${styles.actionTK} ${router.pathname.startsWith('/thongke/dau-duoi') ? styles.active : ''}`} href="dau-duoi">Thống Kê Đầu Đuôi </Link>
                        <Link className={`${styles.actionTK} ${router.pathname.startsWith('/thongke/giai-dac-biet-tuan') ? styles.active : ''}`} href="giai-dac-biet-tuan">Thống Kê Giải Đặc Biệt Tuần </Link>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className="metadata">
                        <p className={styles.title}>Danh sách giải đặc biệt từ {metadata.startDate || ''} đến {metadata.endDate || ''}</p>
                    </div>

                    <div className={styles.group_Select}>
                        <div className={styles.selectGroup}>
                            <label className={styles.options}>Chọn thời gian: </label>
                            <select className={styles.select} value={days} onChange={handleDaysChange}
                                aria-label="Chọn thời gian để xem thống kê giải đặc biệt"
                            >
                                <option value={10}>10 ngày</option>
                                <option value={20}>20 ngày</option>
                                <option value={30}>30 ngày</option>
                                <option value={60}>2 tháng</option>
                                <option value={90}>3 tháng</option>
                                <option value={180}>6 tháng</option>
                                <option value={270}>9 tháng</option>
                                <option value={365}>1 năm</option>
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

                    {loading && (
                        <div className={styles.tableContainer}>
                            <SkeletonTableDaysOfWeek />
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
                    <h2 className={styles.heading}>TAODANDEWUKONG.PRO nơi thống kê giải ĐB, kết quả xổ số Miền Bắc theo tuần, tháng và năm nhanh, chính xác và hoàn toàn miễn phí.</h2>
                    <div className={`${styles.contentWrapper} ${isExpanded ? styles.expanded : styles.collapsed}`}>
                        <h3 className={styles.h3}>Thống Kê giải ĐB. Thống kê kết quả xổ số</h3>
                        <p className={styles.desc}>Thống Kê giải đặc biệt là phương pháp thống kê chỉ duy nhất giải đặc biệt trong bảng kết quả xổ số có nhiều giải khác nhau.</p>
                        <p className={styles.desc}>Thống kê giải đặc biệt là một trong những cách thống kê nhanh và tiện lợi dành cho những người chơi xổ số chỉ quan tâm duy nhất đến giải đặc biệt.</p>
                        <h3 className={styles.h3}>Thống kê giải đặc biệt gồm có:</h3>
                        <p className={styles.desc}><strong className={styles.strong}>- TK giải đặc biệt theo tuần:</strong> là thống kê giải đặc biệt theo mỗi tuần. Trong 1 năm có 53 tuần, nghĩa là sẽ có 53 lần thống kê tuần của giải đặc biệt.</p>
                        <p className={styles.desc}><strong className={styles.strong}>- TK giải đặc biệt theo tháng:</strong> là thống kê giải đặc biệt theo mỗi tháng. Mỗi năm có 12 tháng, nghĩa là sẽ có 12 lần thống kê tháng giải đặc biệt.</p>
                        <p className={styles.desc}><strong className={styles.strong}>- TK giải đặc biệt theo năm:</strong> là thống kê giải đặc biệt theo từng năm.</p>
                        <h3 className={styles.h3}>Tại sao lại cần TK giải đặc biệt?</h3>
                        <p className={styles.desc}>Nhiều người chơi sẽ thường theo dõi TK giải đặc biệt và quan sát số ngày về để nâng cao xác suất trúng thưởng.</p>
                        <p className={styles.desc}>Về cơ bản, TK giải đặc biệt là một cách thức để người chơi có thể dự đoán kết quả xổ số. Tuy nhiên, việc quay xổ số có tính chất hoàn toàn ngẫu nhiên và không dựa trên bất kỳ quy luật. Chính vì vậy, bạn khó có thể dự đoán được kết quả chính xác và có cơ may trúng thưởng</p>
                        <p className={styles.desc}>Do vậy, bạn không nên quá phụ thuộc vào TK giải đặc biệt xổ số Miền Bắc mà chỉ nên đánh xổ số với tinh thần giải trí, thoải mái.</p>
                        <h3 className={styles.h3}>Thống kê giải đặc biệt Miền Bắc có những gì? Bảng 2 số cuối giải đặc biệt lâu về nhất</h3>
                        <p className={styles.desc}>– Bảng TK KQXSMB thông tin của 10 cặp 2 số cuối kết quả giải đặc biệt lâu chưa về nhất hôm nay.</p>
                        <h3 className={styles.h3}>Bảng đầu đuôi giải đặc biệt Miền Bắc lâu chưa về</h3>
                        <p className={styles.desc}>– Thống kê cho người xem nắm thông tin các số hàng chục và hàng đơn vị của KQXS Miền Bắc chưa về trong thời gian gần đây.</p>
                        <h3 className={styles.h3}>Bảng thống kê giải đặc biệt ngày này năm xưa</h3>
                        <p className={styles.desc}>– Cung cấp cho người xem thông tin các giải đặc biệt về cùng ngày hôm đó trong những năm trước đó.</p>
                        <p className={styles.desc}>Thông tin của TK giải ĐB luôn được cập nhật ngay sau khi có kết quả xổ số trong ngày, mọi thông số đều đảm bảo sự chính xác tuyệt đối cho người xem theo dõi</p>
                        <p className={styles.desc}>Xổ Số VN luôn mang đến cho bạn những thông tin chính xác và kịp thời. Với tính năng TK giải đặc biệt này, người chơi sẽ có thêm thông tin để tham khảo và chọn cho mình con số may mắn, mang đến cơ hội trúng thưởng cao hơn.</p>
                        <p className={styles.desc}>TK giải đặc biệt. TK KQXSMB. TK giải đặc biệt XSMB. TK giải đặc biệt XSMB theo tuần, tháng, năm được tổng hợp nhanh chóng và chính xác tại <a className={styles.action} href='/'>TAODANDEWUKONG.PRO</a></p>
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
