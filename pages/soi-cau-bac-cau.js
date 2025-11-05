/**
 * Page Vẽ Đường Cầu
 * Hiển thị bảng thống kê với định vị chính xác từng chữ số trong mỗi ô để vẽ đường cầu
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import styles from '../styles/giaidacbiet.module.css';
import soiCauStyles from '../styles/soiCauBacCau.module.css';
import ThongKe from '../components/ThongKe';
import CongCuHot from '../components/CongCuHot';
import UpdateButton from '../components/UpdateButton';
import CellConnectionArrow from '../components/CellConnectionArrow';
import { apiMB } from './api/kqxsMB';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Skeleton Loading Component
const SkeletonRowDaysOfWeek = () => (
    <tr>
        {Array(7).fill().map((_, index) => (
            <td key={index}><div className={styles.skeleton}></div></td>
        ))}
    </tr>
);

const SkeletonTableDaysOfWeek = () => (
    <table className={styles.table} aria-label="Bảng skeleton cho vẽ đường cầu">
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

// Màu sắc cho từng group (khai báo bên ngoài component để tránh recreate mỗi lần render)
const GROUP_COLORS = [
    { bg: '#ff6b6b', border: '#c80505', name: 'Đỏ' },
    { bg: '#4ecdc4', border: '#00a896', name: 'Xanh lá' },
    { bg: '#ffab47', border: '#ff9500', name: 'Cam' },
    { bg: '#a78bfa', border: '#7c3aed', name: 'Tím' },
    { bg: '#60a5fa', border: '#2563eb', name: 'Xanh dương' },
    { bg: '#f472b6', border: '#db2777', name: 'Hồng' },
    { bg: '#34d399', border: '#059669', name: 'Xanh lá nhạt' },
    { bg: '#fbbf24', border: '#d97706', name: 'Vàng' },
    { bg: '#84cc16', border: '#65a30d', name: 'Xanh chanh' },
    { bg: '#ec4899', border: '#be185d', name: 'Hồng đậm' },
    { bg: '#14b8a6', border: '#0d9488', name: 'Teal' },
    { bg: '#f59e0b', border: '#c2410c', name: 'Vàng cam' }
];

const SoiCauBacCau = ({ initialStats, initialMetadata, initialDays }) => {
    const [stats, setStats] = useState(initialStats || []);
    const router = useRouter();
    const [metadata, setMetadata] = useState(initialMetadata || {});
    const [days, setDays] = useState(initialDays || 90);
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

    // State cho màu 2 chữ số cuối - Tách thành 2 states để tối ưu performance
    const [lastTwoColor, setLastTwoColor] = useState('#c80505');
    const [lastTwoColorDisplay, setLastTwoColorDisplay] = useState('#c80505'); // Hiển thị ngay trong color picker
    const [isOledMode, setIsOledMode] = useState(false);
    const [viewMode, setViewMode] = useState('week'); // 'week' hoặc 'month'
    
    // Debounce timer ref để tối ưu performance khi đổi màu
    const colorChangeTimerRef = useRef(null);

    // State cho kết nối mũi tên giữa các ô - cho phép chọn nhiều groups
    const [selectedGroups, setSelectedGroups] = useState([]); // Mảng các groups: [{ groupId, elements: [...], color }, ...]
    const [currentGroupId, setCurrentGroupId] = useState(0); // ID của group hiện tại đang chọn
    const tableContainerRef = useRef(null);

    // Hàm xử lý click vào ô trống để tạo anchor point
    const handleEmptyCellClick = useCallback((weekIndexOrDayIndex, dayIndexOrMonthIndex, year = null, month = null, day = null) => {
        // Phân biệt week mode và month mode
        let cellKey;
        let weekIndex, dayIndex;
        let isMonthMode = false;
        
        if (viewMode === 'month' && year !== null && month !== null && day !== null) {
            // Month mode: tham số là (dayIndex, monthIndex, year, month, day)
            isMonthMode = true;
            cellKey = `${year}-${month}-${day}`;
        } else {
            // Week mode: tham số là (weekIndex, dayIndex)
            weekIndex = weekIndexOrDayIndex;
            dayIndex = dayIndexOrMonthIndex;
            cellKey = `${weekIndex}-${dayIndex}`;
        }
        
        // Tìm group hiện tại (nếu có)
        const currentGroupIndex = selectedGroups.findIndex(g => g.groupId === currentGroupId);
        
        if (currentGroupIndex >= 0) {
            // Group đã tồn tại, kiểm tra xem ô này đã có virtual anchor chưa
            const currentGroup = selectedGroups[currentGroupIndex];
            const existingVirtualIndex = currentGroup.elements.findIndex(
                el => el.isVirtual && el.cellKey === cellKey
            );
            
            const newGroups = [...selectedGroups];
            
            if (existingVirtualIndex >= 0) {
                // Nếu đã có, bỏ chọn
                newGroups[currentGroupIndex].elements = currentGroup.elements.filter((_, idx) => idx !== existingVirtualIndex);
                
                // Nếu group rỗng thì xóa group luôn
                if (newGroups[currentGroupIndex].elements.length === 0) {
                    newGroups.splice(currentGroupIndex, 1);
                }
            } else {
                // Chưa có, tạo mới
                const virtualElement = {
                    cellKey,
                    weekIndex: isMonthMode ? undefined : weekIndex,
                    dayIndex: isMonthMode ? undefined : dayIndex,
                    year: isMonthMode ? year : undefined,
                    month: isMonthMode ? month : undefined,
                    day: isMonthMode ? day : undefined,
                    isVirtual: true, // Đánh dấu là element ảo
                    virtualIndex: Date.now(), // Dùng timestamp làm unique ID
                    numberIndex: 0,
                    digitIndex: 0,
                    prize: 0,
                    elementIndex: 0,
                    globalIndex: -1, // Dùng số âm để phân biệt với element thật
                    position: isMonthMode ? `(V-${year}-${month}-${day})` : `(V-${weekIndex}-${dayIndex})` // Virtual position
                };
                newGroups[currentGroupIndex].elements = [...currentGroup.elements, virtualElement];
            }
            
            setSelectedGroups(newGroups);
        } else {
            // Group chưa tồn tại, tạo mới với virtual anchor
            const virtualElement = {
                cellKey,
                weekIndex: isMonthMode ? undefined : weekIndex,
                dayIndex: isMonthMode ? undefined : dayIndex,
                year: isMonthMode ? year : undefined,
                month: isMonthMode ? month : undefined,
                day: isMonthMode ? day : undefined,
                isVirtual: true,
                virtualIndex: Date.now(),
                numberIndex: 0,
                digitIndex: 0,
                prize: 0,
                elementIndex: 0,
                globalIndex: -1,
                position: isMonthMode ? `(V-${year}-${month}-${day})` : `(V-${weekIndex}-${dayIndex})`
            };
            const color = GROUP_COLORS[currentGroupId % GROUP_COLORS.length];
            setSelectedGroups([...selectedGroups, {
                groupId: currentGroupId,
                elements: [virtualElement],
                color
            }]);
        }
    }, [selectedGroups, currentGroupId]);

    // Hàm xử lý click vào chữ số để highlight và chọn nhiều phần tử cho mũi tên
    const handleDigitClick = useCallback((position, weekIndex, dayIndex, cellData) => {
        const cellKey = `${weekIndex}-${dayIndex}`;
        const element = {
            cellKey,
            weekIndex,
            dayIndex,
            numberIndex: position.numberIndex || 0,
            digitIndex: position.digitIndex,
            prize: position.prize,
            elementIndex: position.elementIndex,
            globalIndex: position.globalIndex,
            position: position.position
        };

        // Tìm group hiện tại (nếu có)
        const currentGroupIndex = selectedGroups.findIndex(g => g.groupId === currentGroupId);
        
        if (currentGroupIndex >= 0) {
            // Group đã tồn tại, thêm/xóa element trong group này
            const currentGroup = selectedGroups[currentGroupIndex];
            const elementIndex = currentGroup.elements.findIndex(
                el => el.globalIndex === element.globalIndex
            );

            const newGroups = [...selectedGroups];
            
            if (elementIndex >= 0) {
                // Nếu đã chọn, bỏ chọn (xóa khỏi group)
                newGroups[currentGroupIndex].elements = currentGroup.elements.filter((_, idx) => idx !== elementIndex);
                
                // Nếu group rỗng thì xóa group luôn
                if (newGroups[currentGroupIndex].elements.length === 0) {
                    newGroups.splice(currentGroupIndex, 1);
                }
            } else {
                // Nếu chưa chọn, thêm vào group hiện tại
                newGroups[currentGroupIndex].elements = [...currentGroup.elements, element];
            }
            
            setSelectedGroups(newGroups);
        } else {
            // Group chưa tồn tại, tạo mới
            const color = GROUP_COLORS[currentGroupId % GROUP_COLORS.length];
            setSelectedGroups([...selectedGroups, {
                groupId: currentGroupId,
                elements: [element],
                color
            }]);
        }
    }, [selectedGroups, currentGroupId]);

    // Map để lookup nhanh globalIndex -> group info (O(1) thay vì O(n*m))
    const globalIndexToGroupMap = useMemo(() => {
        const map = new Map();
        selectedGroups.forEach((group, groupIdx) => {
            group.elements.forEach((el, elIdx) => {
                if (el.globalIndex !== undefined && el.globalIndex >= 0) {
                    map.set(el.globalIndex, { group, groupIdx, elIdx });
                }
            });
        });
        return map;
    }, [selectedGroups]);

    // Set để kiểm tra highlight nhanh (O(1) thay vì O(n*m))
    const highlightedDigitsSet = useMemo(() => {
        const set = new Set();
        selectedGroups.forEach(group => {
            group.elements.forEach(el => {
                if (el.globalIndex !== undefined && el.globalIndex >= 0) {
                    set.add(el.globalIndex);
                }
            });
        });
        return set;
    }, [selectedGroups]);

    // Hàm kiểm tra xem chữ số có nên highlight không - Tối ưu với Set lookup O(1)
    const shouldHighlightDigit = useCallback((position) => {
        return highlightedDigitsSet.has(position.globalIndex);
    }, [highlightedDigitsSet]);

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

    // Hàm gọi API - chỉ lấy từ cache, không tự động tính toán
    const fetchSoiCauBacCauStats = useCallback(async (days) => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiMB.getSoiCauBacCauStats(days);
            setStats(data.statistics || []);
            setMetadata(data.metadata || {});
        } catch (err) {
            // Nếu là lỗi 404 (không có cache), hiển thị message yêu cầu cập nhật
            if (err.message && err.message.includes('Không có dữ liệu')) {
                            setError('Chưa có dữ liệu cho khoảng thời gian này. Vui lòng nhấn nút "Cập nhật dữ liệu" để tính toán.');
            } else {
                setError(err.message || 'Có lỗi xảy ra khi lấy dữ liệu vẽ đường cầu.');
            }
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
        fetchSoiCauBacCauStats(days);
    }, [days, fetchSoiCauBacCauStats]);

    // Cleanup debounce timer khi unmount để tránh memory leak
    useEffect(() => {
        return () => {
            if (colorChangeTimerRef.current) {
                clearTimeout(colorChangeTimerRef.current);
            }
        };
    }, []);

    // Hàm cập nhật thống kê
    const handleUpdateStats = async () => {
        try {
            const result = await apiMB.updateSoiCauBacCauStats(days);

            if (result.success) {
                setLoading(true);
                setError(null);
                try {
                    const data = await apiMB.getSoiCauBacCauStats(days);
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
            throw error;
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
            
            // Kiểm tra nếu ô cuối cùng (cột CN - dayIndex = 6) trong dòng cuối cùng đã có dữ liệu
            const lastCellHasData = currentRow[6] !== null && currentRow[6].stats;
            if (lastCellHasData) {
                // Chỉ thêm một dòng rỗng mới khi ô cuối cùng đã có dữ liệu
                rows.push(Array(7).fill(null));
            }
        }

        return rows;
    }, [stats]);

    // Hàm tổ chức dữ liệu theo tháng (12 cột: Tháng 1 đến Tháng 12) với lưới 31 dòng - Memoized
    const months = useMemo(() => {
        if (viewMode !== 'month') return [];

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
    }, [stats, viewMode]);

    // Memoize style objects để tránh tạo lại mỗi lần render
    const baseDigitStyle = useMemo(() => ({
        cursor: 'pointer',
        padding: 0,
        margin: 0,
        borderRadius: '3px',
        transition: 'background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease',
        position: 'relative',
        display: 'inline-block'
    }), []);

    // Hàm render số với highlight chữ số cụ thể - Tối ưu với memoization
    const renderNumberWithHighlights = useCallback((number, positions, prize, elementIndex, weekIndex, dayIndex, cellData) => {
        if (!positions || !Array.isArray(positions) || positions.length === 0) {
            // Nếu không có positions, render số bình thường với màu 2 số cuối
            const numberLength = number.length;
            return number.split('').map((digit, index) => {
                const isLastTwo = index >= numberLength - 2;
                return (
                    <span 
                        key={index}
                        className={isLastTwo ? styles.lastTwo : ''}
                    >
                        {digit}
                    </span>
                );
            });
        }

        return number.split('').map((digit, digitIndex) => {
            // Tìm position tương ứng với digitIndex trong cellPosition
            const position = positions.find(p => 
                p.cellPosition && p.cellPosition.digitIndex === digitIndex
            );
            
            if (!position) {
                return <span key={digitIndex}>{digit}</span>;
            }
            
            const isHighlighted = position && shouldHighlightDigit({
                prize,
                elementIndex,
                digitIndex,
                globalIndex: position.globalIndex
            });

            // Tìm group chứa element này - Tối ưu với Map lookup O(1)
            const groupInfo = globalIndexToGroupMap.get(position.globalIndex);
            const foundGroup = groupInfo?.group || null;
            const selectedIndex = groupInfo ? groupInfo.elIdx : -1;
            const isSelected = groupInfo !== undefined;
            
            // Màu sắc theo group
            let backgroundColor = 'transparent';
            let borderColor = 'none';
            if (isSelected && foundGroup) {
                backgroundColor = foundGroup.color.bg;
                borderColor = foundGroup.color.border;
            } else if (isHighlighted) {
                backgroundColor = '#fff3cd'; // Vàng nhạt khi highlight
            }

            // Check if this is in the last two digits of the number
            const isLastTwo = digitIndex >= number.length - 2;

            // Tối ưu: Sử dụng CSS variable cho màu 2 số cuối thay vì inline style
            // CSS variable được set ở table level, không cần re-render từng chữ số
            const digitStyle = {
                ...baseDigitStyle,
                backgroundColor,
                // Không set color inline cho 2 số cuối - dùng CSS variable từ table
                fontWeight: isSelected ? '700' : isHighlighted ? '600' : '600',
                border: borderColor !== 'none' ? `2px solid ${borderColor}` : 'none',
                zIndex: isSelected ? 1003 : 1002,
                boxShadow: isSelected ? `0 0 4px ${borderColor}` : 'none'
            };

            return (
                <span
                    key={digitIndex}
                    data-digit-index={digitIndex}
                    data-global-index={position.globalIndex}
                    className={isLastTwo && !isSelected && !isHighlighted ? styles.lastTwo : ''}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDigitClick({
                            ...position,
                            prize,
                            elementIndex,
                            digitIndex,
                            numberIndex: position.cellPosition?.numberIndex || 0
                        }, weekIndex, dayIndex, cellData);
                    }}
                    style={digitStyle}
                    title={
                        position 
                            ? `Vị trí: ${position.position}, Global Index: ${position.globalIndex}${isSelected && foundGroup ? ` (Group ${foundGroup.groupId + 1}, ${selectedIndex + 1}/${foundGroup.elements.length})` : ''}`
                            : ''
                    }
                >
                    {digit}
                </span>
            );
        });
    }, [globalIndexToGroupMap, shouldHighlightDigit, handleDigitClick, baseDigitStyle, styles.lastTwo]);

    // Memoize table className để tránh tạo lại mỗi lần render
    const tableClassName = useMemo(() => {
        return `${styles.table} ${soiCauStyles.table} ${isOledMode ? styles.oledMode : ''} ${viewMode === 'month' ? 'monthMode' : ''}`;
    }, [isOledMode, viewMode, styles.table, soiCauStyles.table, styles.oledMode]);

    const pageTitle = 'Vẽ Đường Cầu - Định Vị Chính Xác Từng Chữ Số';
    const pageDescription = `Vẽ đường cầu với định vị chính xác từng chữ số trong ${days} ngày.`;

    return (
        <Layout>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://yourdomain.com/soi-cau-bac-cau" />
                <meta name="robots" content="index, follow" />
            </Head>

            <div className={styles.container}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>{pageTitle}</h1>
                    <div className={styles.actionBtn}>
                        <Link className={`${styles.actionTK} ${router.pathname.startsWith('/soi-cau-bac-cau') ? styles.active : ''}`} href="/soi-cau-bac-cau">Vẽ Đường Cầu</Link>
                        <Link className={`${styles.actionTK} ${router.pathname.startsWith('/thongke/giai-dac-biet') ? styles.active : ''}`} href="/thongke/giai-dac-biet">Thống Kê Giải Đặc Biệt</Link>
                    </div>
                </div>

                <div className={styles.content}>
                    <div className="metadata">
                        <p className={styles.title}>Bảng vẽ đường cầu từ {metadata.startDate || ''} đến {metadata.endDate || ''}</p>
                    </div>

                    <div className={styles.group_Select}>
                        <div className={styles.selectGroup}>
                            <label className={styles.options}>Chọn số ngày: </label>
                            <select 
                                className={styles.select} 
                                value={days} 
                                onChange={handleDaysChange}
                                aria-label="Chọn số ngày để xem vẽ đường cầu"
                            >
                                <option value={90}>90 ngày</option>
                                <option value={120}>120 ngày</option>
                                <option value={150}>150 ngày</option>
                                <option value={180}>180 ngày</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>
                                    Chế độ hiển thị:
                                </label>
                                <button
                                    onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: viewMode === 'week' ? '#c80505' : '#ffffff',
                                        color: viewMode === 'week' ? '#ffffff' : '#000000',
                                        border: `2px solid ${viewMode === 'week' ? '#c80505' : '#e5e7eb'}`,
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s ease',
                                        minWidth: '120px'
                                    }}
                                    title={viewMode === 'week' ? 'Đang hiển thị theo tuần - Click để chuyển sang tháng' : 'Đang hiển thị theo tháng - Click để chuyển sang tuần'}
                                >
                                    {viewMode === 'week' ? '📅 Theo Tuần' : '📆 Theo Tháng'}
                                </button>
                            </div>
                            <div className={styles.updateButtonWrapper}>
                                <UpdateButton
                                    onUpdate={handleUpdateStats}
                                    label="Cập nhật dữ liệu"
                                />
                            </div>
                        </div>
                    </div>

                    {loading && (
                        <div className={styles.tableContainer}>
                            <SkeletonTableDaysOfWeek />
                        </div>
                    )}

                    {error && <p className={styles.error}>{error}</p>}

                    {!loading && !error && stats.length > 0 && (
                        <>
                            {/* UI chọn group và quản lý groups */}
                            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Chọn Group:</label>
                                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                            {Array.from({ length: 12 }).map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setCurrentGroupId(idx)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: currentGroupId === idx ? GROUP_COLORS[idx].bg : '#fff',
                                                        color: currentGroupId === idx ? '#fff' : GROUP_COLORS[idx].bg,
                                                        border: `2px solid ${GROUP_COLORS[idx].border}`,
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold',
                                                        fontSize: '12px',
                                                        minWidth: '50px'
                                                    }}
                                                >
                                                    {idx + 1}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {selectedGroups.length > 0 && (
                                        <button
                                            onClick={() => {
                                                setSelectedGroups([]);
                                            }}
                                            style={{
                                                padding: '8px 16px',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: 'bold',
                                                fontSize: '14px'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                                        >
                                            Xóa tất cả groups
                                        </button>
                                    )}
                                </div>
                                {selectedGroups.length > 0 && (
                                    <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '12px' }}>Đã tạo:</span>
                                        {selectedGroups.map(group => (
                                            <div 
                                                key={group.groupId} 
                                                style={{ 
                                                    display: 'flex', 
                                                    gap: '5px', 
                                                    alignItems: 'center',
                                                    padding: '4px 8px',
                                                    backgroundColor: group.color.bg,
                                                    color: 'white',
                                                    borderRadius: '4px',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                <span>Group {group.groupId + 1}</span>
                                                <span>({group.elements.length})</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* Toggle Buttons */}
                            <div className={styles.toggleButtons} style={{ marginBottom: '15px' }}>
                                <div className={styles.toggleItem}>
                                    <input type="checkbox" id="soicau-is-date" checked={showDate} onChange={(e) => setShowDate(e.target.checked)} />
                                    <label htmlFor="soicau-is-date">Ngày</label>
                                </div>
                                <div className={styles.toggleItem}>
                                    <input type="checkbox" id="soicau-is-total" checked={showTotal} onChange={(e) => setShowTotal(e.target.checked)} />
                                    <label htmlFor="soicau-is-total">Tổng</label>
                                </div>
                                <div className={styles.toggleItem}>
                                    <input type="checkbox" id="soicau-is-head" checked={showHead} onChange={(e) => setShowHead(e.target.checked)} />
                                    <label htmlFor="soicau-is-head">Đầu</label>
                                </div>
                                <div className={styles.toggleItem}>
                                    <input type="checkbox" id="soicau-is-tail" checked={showTail} onChange={(e) => setShowTail(e.target.checked)} />
                                    <label htmlFor="soicau-is-tail">Đuôi</label>
                                </div>
                                <div className={styles.toggleItem}>
                                    <input type="checkbox" id="soicau-is-even" checked={showEvenOdd} onChange={(e) => setShowEvenOdd(e.target.checked)} />
                                    <label htmlFor="soicau-is-even">Chẵn lẻ</label>
                                </div>
                                <div className={styles.toggleItem}>
                                    <input type="checkbox" id="soicau-set" checked={showSet} onChange={(e) => setShowSet(e.target.checked)} />
                                    <label htmlFor="soicau-set">Bộ</label>
                                </div>
                            </div>

                            {/* Control Buttons - Màu 2 chữ số cuối và Dark Mode */}
                            <div style={{ 
                                marginBottom: '15px', 
                                padding: '12px', 
                                backgroundColor: '#f5f5f5', 
                                borderRadius: '8px',
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                justifyContent: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <label style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>
                                        Màu 2 số cuối:
                                    </label>
                                    <input
                                        type="color"
                                        value={lastTwoColorDisplay}
                                        onChange={(e) => {
                                            const newColor = e.target.value;
                                            // Cập nhật ngay để UI phản hồi nhanh
                                            setLastTwoColorDisplay(newColor);
                                            
                                            // Debounce việc cập nhật màu thực sự (tránh re-render quá nhiều)
                                            if (colorChangeTimerRef.current) {
                                                clearTimeout(colorChangeTimerRef.current);
                                            }
                                            colorChangeTimerRef.current = setTimeout(() => {
                                                setLastTwoColor(newColor);
                                            }, 150); // 150ms debounce
                                        }}
                                        style={{
                                            width: '50px',
                                            height: '38px',
                                            border: '2px solid #e5e7eb',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            backgroundColor: '#ffffff'
                                        }}
                                        title="Chọn màu cho 2 chữ số cuối"
                                    />
                                    <button
                                        onClick={() => {
                                            const defaultColor = '#c80505';
                                            setLastTwoColorDisplay(defaultColor);
                                            if (colorChangeTimerRef.current) {
                                                clearTimeout(colorChangeTimerRef.current);
                                            }
                                            setLastTwoColor(defaultColor);
                                        }}
                                        style={{
                                            padding: '6px 12px',
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: '500'
                                        }}
                                        title="Đặt lại màu mặc định"
                                    >
                                        Mặc định
                                    </button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <label style={{ fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>
                                        Chế độ OLED:
                                    </label>
                                    <button
                                        onClick={() => setIsOledMode(!isOledMode)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: isOledMode ? '#000000' : '#ffffff',
                                            color: isOledMode ? '#ffffff' : '#000000',
                                            border: `2px solid ${isOledMode ? '#ffffff' : '#000000'}`,
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            transition: 'all 0.3s ease',
                                            minWidth: '100px'
                                        }}
                                        title={isOledMode ? 'Tắt chế độ OLED' : 'Bật chế độ OLED'}
                                    >
                                        {isOledMode ? 'Tắt OLED' : 'Bật OLED'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className={styles.tableContainer} ref={tableContainerRef} style={{ position: 'relative', overflow: 'visible' }}>
                            <table 
                                className={tableClassName}
                                aria-label="Bảng vẽ đường cầu"
                                style={{ 
                                    '--lastTwoColor': lastTwoColor,
                                    fontSize: viewMode === 'month' ? '0.85rem' : undefined
                                }}
                            >
                                <caption className={styles.caption}>
                                    Vẽ Đường Cầu trong {days} ngày - Chọn Group (1-12), click vào các chữ số để thêm vào group, mũi tên sẽ nối từng cặp trong cùng group
                                </caption>
                                <thead>
                                    <tr>
                                        {viewMode === 'week' ? (
                                            <>
                                                <th>Thứ 2</th>
                                                <th>Thứ 3</th>
                                                <th>Thứ 4</th>
                                                <th>Thứ 5</th>
                                                <th>Thứ 6</th>
                                                <th>Thứ 7</th>
                                                <th>CN</th>
                                            </>
                                        ) : (
                                            <>
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
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {viewMode === 'week' && weeks.length > 0 ? (
                                        weeks.map((week, weekIndex) => (
                                            <tr key={weekIndex}>
                                                {week.map((slot, dayIndex) => {
                                                    const cellKey = `${weekIndex}-${dayIndex}`;
                                                    
                                                    // Kiểm tra xem ô này có virtual anchor không
                                                    const hasVirtualAnchor = selectedGroups.some(group => 
                                                        group.elements.some(el => el.isVirtual && el.cellKey === cellKey)
                                                    );
                                                    const virtualAnchorGroup = selectedGroups.find(group => 
                                                        group.elements.some(el => el.isVirtual && el.cellKey === cellKey)
                                                    );
                                                    
                                                    // Kiểm tra xem ô này có chứa chữ số đã chọn không
                                                    const hasSelectedDigit = slot && slot.stats && selectedGroups.some(group => {
                                                        const prizes = slot.stats[0]?.prizes || {};
                                                        const specialPrize = prizes.specialPrize?.[0];
                                                        if (!specialPrize?.positions) return false;
                                                        
                                                        return specialPrize.positions.some(pos => 
                                                            group.elements.some(el => !el.isVirtual && el.globalIndex === pos.globalIndex)
                                                        );
                                                    });
                                                    const selectedDigitGroup = slot && slot.stats && selectedGroups.find(group => {
                                                        const prizes = slot.stats[0]?.prizes || {};
                                                        const specialPrize = prizes.specialPrize?.[0];
                                                        if (!specialPrize?.positions) return false;
                                                        
                                                        return specialPrize.positions.some(pos => 
                                                            group.elements.some(el => !el.isVirtual && el.globalIndex === pos.globalIndex)
                                                        );
                                                    });
                                                    
                                                    // Xác định màu background
                                                    let cellBackgroundColor = 'transparent';
                                                    if (hasVirtualAnchor && virtualAnchorGroup) {
                                                        cellBackgroundColor = virtualAnchorGroup.color.bg;
                                                    } else if (hasSelectedDigit && selectedDigitGroup) {
                                                        // Convert hex to rgba với opacity 25%
                                                        const hexColor = selectedDigitGroup.color.bg;
                                                        const r = parseInt(hexColor.slice(1, 3), 16);
                                                        const g = parseInt(hexColor.slice(3, 5), 16);
                                                        const b = parseInt(hexColor.slice(5, 7), 16);
                                                        cellBackgroundColor = `rgba(${r}, ${g}, ${b}, 0.25)`;
                                                    }
                                                    
                                                    return (
                                                        <td
                                                            key={dayIndex}
                                                            data-week-index={weekIndex}
                                                            data-day-index={dayIndex}
                                                            onClick={(e) => {
                                                                if (!slot || !slot.stats) {
                                                                    handleEmptyCellClick(weekIndex, dayIndex);
                                                                }
                                                            }}
                                                            style={{ 
                                                                cursor: (!slot || !slot.stats) ? 'pointer' : 'default',
                                                                position: 'relative',
                                                                backgroundColor: cellBackgroundColor,
                                                                minHeight: '60px', // Đảm bảo các ô trống có chiều cao tối thiểu
                                                                padding: '8px' // Thêm padding để dễ click hơn
                                                            }}
                                                        >
                                                            {hasVirtualAnchor && (
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    top: '50%',
                                                                    left: '50%',
                                                                    transform: 'translate(-50%, -50%)',
                                                                    width: '32px',
                                                                    height: '32px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: '#ff0000',
                                                                    zIndex: 10,
                                                                    pointerEvents: 'none',
                                                                    opacity: 1
                                                                }} />
                                                            )}
                                                            {slot && slot.stats ? (
                                                                <div className={styles.entry}>
                                                                    {slot.stats.map((stat, statIndex) => {
                                                                        const prizes = stat.prizes || {};
                                                                        // Hiển thị giải đặc biệt
                                                                        const specialPrize = prizes.specialPrize?.[0];
                                                                        
                                                                        // Nếu không có specialPrize nhưng có số trong info, hiển thị số
                                                                        const displayNumber = specialPrize?.number || stat.info?.lastTwoDigits || '';
                                                                        
                                                                        // Tính toán thông tin từ số giải đặc biệt
                                                                        const info = displayNumber && specialPrize?.number 
                                                                            ? calculateSpecialInfo(specialPrize.number)
                                                                            : null;
                                                                        
                                                                        return (
                                                                            <div key={statIndex} className={styles.statItem}>
                                                                                {displayNumber && (
                                                                                    <div className={styles.number} style={{ padding: 0, margin: 0 }}>
                                                                                        {specialPrize && specialPrize.number ? (
                                                                                            renderNumberWithHighlights(
                                                                                                specialPrize.number,
                                                                                                specialPrize.positions || [],
                                                                                                0, // prize
                                                                                                0, // elementIndex
                                                                                                weekIndex,
                                                                                                dayIndex,
                                                                                                slot
                                                                                            )
                                                                                        ) : (
                                                                                            <>
                                                                                                {displayNumber.slice(0, -2)}
                                                                                                <span 
                                                                                                    className={styles.lastTwo}
                                                                                                >
                                                                                                    {displayNumber.slice(-2)}
                                                                                                </span>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                                {showDate && <div className={styles.date}>{slot.date}</div>}
                                                                                {showTotal && info && <div>{info.total}</div>}
                                                                                {showHead && info && <div>{info.head}</div>}
                                                                                {showTail && info && <div>{info.tail}</div>}
                                                                                {showEvenOdd && info && <div>{info.evenOdd}</div>}
                                                                                {showSet && info && <div>{info.lastTwo}</div>}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                // Placeholder cho ô trống để đảm bảo có chiều cao
                                                                <div style={{ minHeight: '44px', width: '100%' }}>&nbsp;</div>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))
                                    ) : viewMode === 'month' && months.length > 0 ? (
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
                                                                    const cellKey = `${year}-${month}-${day}`;
                                                                    // dayStats có thể là null (không có dữ liệu) hoặc array stats
                                                                    const slot = dayStats && dayStats.length > 0 ? { stats: dayStats, month, year, day } : null;
                                                            
                                                            // Kiểm tra virtual anchor và selected digit (tương tự như week mode)
                                                            const hasVirtualAnchor = selectedGroups.some(group => 
                                                                group.elements.some(el => el.isVirtual && el.cellKey === cellKey)
                                                            );
                                                            const virtualAnchorGroup = selectedGroups.find(group => 
                                                                group.elements.some(el => el.isVirtual && el.cellKey === cellKey)
                                                            );
                                                            
                                                            const hasSelectedDigit = slot && slot.stats && slot.stats.length > 0 && selectedGroups.some(group => {
                                                                const prizes = slot.stats[0]?.prizes || {};
                                                                const specialPrize = prizes.specialPrize?.[0];
                                                                if (!specialPrize?.positions) return false;
                                                                return specialPrize.positions.some(pos => 
                                                                    group.elements.some(el => !el.isVirtual && el.globalIndex === pos.globalIndex)
                                                                );
                                                            });
                                                            const selectedDigitGroup = slot && slot.stats && slot.stats.length > 0 && selectedGroups.find(group => {
                                                                const prizes = slot.stats[0]?.prizes || {};
                                                                const specialPrize = prizes.specialPrize?.[0];
                                                                if (!specialPrize?.positions) return false;
                                                                return specialPrize.positions.some(pos => 
                                                                    group.elements.some(el => !el.isVirtual && el.globalIndex === pos.globalIndex)
                                                                );
                                                            });
                                                            
                                                            let cellBackgroundColor = 'transparent';
                                                            if (hasVirtualAnchor && virtualAnchorGroup) {
                                                                cellBackgroundColor = virtualAnchorGroup.color.bg;
                                                            } else if (hasSelectedDigit && selectedDigitGroup) {
                                                                const hexColor = selectedDigitGroup.color.bg;
                                                                const r = parseInt(hexColor.slice(1, 3), 16);
                                                                const g = parseInt(hexColor.slice(3, 5), 16);
                                                                const b = parseInt(hexColor.slice(5, 7), 16);
                                                                cellBackgroundColor = `rgba(${r}, ${g}, ${b}, 0.25)`;
                                                            }
                                                            
                                                            return (
                                                                <td
                                                                    key={monthIndex}
                                                                    data-month-index={monthIndex}
                                                                    data-year={year}
                                                                    data-day-index={dayIndex}
                                                                    data-day={day}
                                                                    onClick={(e) => {
                                                                        if (!slot || !slot.stats) {
                                                                            // dayIndex là index của dòng (0-30), monthIndex là index của cột (0-11)
                                                                            // Trong month mode: truyền (dayIndex, monthIndex, year, month, day)
                                                                            const monthActual = monthIndex + 1; // Tháng thực tế (1-12)
                                                                            handleEmptyCellClick(dayIndex, monthIndex, year, monthActual, day);
                                                                        }
                                                                    }}
                                                                    style={{ 
                                                                        cursor: (!slot || !slot.stats) ? 'pointer' : 'default',
                                                                        position: 'relative',
                                                                        backgroundColor: cellBackgroundColor,
                                                                        minHeight: '60px',
                                                                        padding: '8px',
                                                                        // Căn giữa theo chiều dọc nếu không có date, căn trên nếu có date
                                                                        verticalAlign: showDate ? 'top' : 'middle',
                                                                        textAlign: 'center' // Giữ text align center
                                                                    }}
                                                                >
                                                                    {hasVirtualAnchor && (
                                                                        <div style={{
                                                                            position: 'absolute',
                                                                            top: '50%',
                                                                            left: '50%',
                                                                            transform: 'translate(-50%, -50%)',
                                                                            width: '32px',
                                                                            height: '32px',
                                                                            borderRadius: '50%',
                                                                            backgroundColor: '#ff0000',
                                                                            zIndex: 10,
                                                                            pointerEvents: 'none',
                                                                            opacity: 1
                                                                        }} />
                                                                    )}
                                                                    {slot && slot.stats ? (
                                                                        <div 
                                                                            className={styles.entry}
                                                                            style={{ 
                                                                                // Căn giữa nếu không có date, căn trên nếu có date
                                                                                alignItems: showDate ? 'flex-start' : 'center',
                                                                                justifyContent: showDate ? 'flex-start' : 'center',
                                                                                alignContent: showDate ? 'flex-start' : 'center',
                                                                                height: showDate ? 'auto' : '100%',
                                                                                minHeight: showDate ? 'auto' : '50px'
                                                                            }}
                                                                        >
                                                                            {slot.stats.map((stat, statIndex) => {
                                                                                const prizes = stat.prizes || {};
                                                                                // Hiển thị giải đặc biệt
                                                                                const specialPrize = prizes.specialPrize?.[0];
                                                                                
                                                                                // Nếu không có specialPrize nhưng có số trong info, hiển thị số
                                                                                const displayNumber = specialPrize?.number || stat.info?.lastTwoDigits || '';
                                                                                
                                                                                // Tính toán thông tin từ số giải đặc biệt
                                                                                const info = displayNumber && specialPrize?.number 
                                                                                    ? calculateSpecialInfo(specialPrize.number)
                                                                                    : null;
                                                                                
                                                                                return (
                                                                                    <div 
                                                                                        key={statIndex} 
                                                                                        className={styles.statItem}
                                                                                        style={{
                                                                                            // Căn giữa theo chiều dọc nếu không có date
                                                                                            justifyContent: showDate ? 'flex-start' : 'center',
                                                                                            alignItems: 'center',
                                                                                            minHeight: showDate ? 'auto' : '100%'
                                                                                        }}
                                                                                    >
                                                                                        {displayNumber && (
                                                                                            <div 
                                                                                                className={styles.number} 
                                                                                                style={{ 
                                                                                                    padding: 0, 
                                                                                                    margin: 0,
                                                                                                    fontSize: viewMode === 'month' ? '1.3rem' : undefined
                                                                                                }}
                                                            >
                                                                                                {specialPrize && specialPrize.number ? (
                                                                                                    renderNumberWithHighlights(
                                                                                                        specialPrize.number,
                                                                                                        specialPrize.positions || [],
                                                                                                        0, // prize
                                                                                                        0, // elementIndex
                                                                                                        dayIndex,
                                                                                                        monthIndex,
                                                                                                        slot
                                                                                                    )
                                                                                                ) : (
                                                                                                    <>
                                                                                                        {displayNumber.slice(0, -2)}
                                                                                                        <span 
                                                                                                            className={styles.lastTwo}
                                                                                                        >
                                                                                                            {displayNumber.slice(-2)}
                                                                                                        </span>
                                                                                                    </>
                                                                                                )}
                                                                                            </div>
                                                                                        )}
                                                                                        {showDate && stat.drawDate && (
                                                                                            <div 
                                                                                                className={styles.date}
                                                                                                style={{ fontSize: viewMode === 'month' ? '0.75rem' : undefined }}
                                                                                            >
                                                                                                {stat.drawDate}
                                                                                            </div>
                                                                                        )}
                                                                                        {showTotal && info && (
                                                                                            <div style={{ fontSize: viewMode === 'month' ? '0.75rem' : undefined }}>{info.total}</div>
                                                                                        )}
                                                                                        {showHead && info && (
                                                                                            <div style={{ fontSize: viewMode === 'month' ? '0.75rem' : undefined }}>{info.head}</div>
                                                                                        )}
                                                                                        {showTail && info && (
                                                                                            <div style={{ fontSize: viewMode === 'month' ? '0.75rem' : undefined }}>{info.tail}</div>
                                                                                        )}
                                                                                        {showEvenOdd && info && (
                                                                                            <div style={{ fontSize: viewMode === 'month' ? '0.75rem' : undefined }}>{info.evenOdd}</div>
                                                                                        )}
                                                                                        {showSet && info && (
                                                                                            <div style={{ fontSize: viewMode === 'month' ? '0.75rem' : undefined }}>{info.lastTwo}</div>
                                                                                        )}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{ minHeight: '44px', width: '100%' }}>&nbsp;</div>
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
                                            <td colSpan={viewMode === 'week' ? 7 : 12} className={styles.noData}>
                                                Không có dữ liệu vẽ đường cầu trong khoảng thời gian đã chọn.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {/* Component vẽ mũi tên nối giữa các phần tử trong từng group */}
                            {selectedGroups.map(group => 
                                group.elements.length >= 2 && group.elements.map((element, index) => {
                                    if (index === group.elements.length - 1) return null; // Không vẽ mũi tên cho phần tử cuối
                                    
                                    return (
                                        <CellConnectionArrow
                                            key={`arrow-group-${group.groupId}-${index}-${index + 1}`}
                                            sourceElement={element}
                                            targetElement={group.elements[index + 1]}
                                            tableContainerRef={tableContainerRef}
                                            color={group.color.border}
                                        />
                                    );
                                })
                            )}
                            </div>
                        </>
                    )}

                    {!loading && !error && stats.length === 0 && metadata.message && (
                        <p className={styles.noData}>{metadata.message}</p>
                    )}
                </div>

                <div className={styles.Group_Content}>
                    <h2 className={styles.heading}>Vẽ Đường Cầu - Định Vị Chính Xác Từng Chữ Số</h2>
                    <div className={`${styles.contentWrapper} ${isExpanded ? styles.expanded : styles.collapsed}`}>
                        <h3 className={styles.h3}>Giới thiệu Vẽ Đường Cầu</h3>
                        <p className={styles.desc}>
                            Vẽ Đường Cầu là phương pháp phân tích xổ số với định vị chính xác từng chữ số trong mỗi ô của bảng kết quả để vẽ các đường cầu kết nối.
                            Mỗi chữ số có vị trí duy nhất được xác định bởi: giải, phần tử trong giải, vị trí trong số, và global index.
                        </p>
                        <h3 className={styles.h3}>Định vị chính xác</h3>
                        <p className={styles.desc}>
                            Với {days} ngày, mỗi chữ số trong bảng có vị trí đặc biệt duy nhất. Click vào chữ số để highlight và vẽ đường cầu kết nối giữa các điểm.
                        </p>
                        <h3 className={styles.h3}>Cách sử dụng</h3>
                        <p className={styles.desc}>
                            - Chọn Group (1-12) để bắt đầu, mỗi group có màu riêng<br />
                            - Click vào ô để highlight toàn bộ ô<br />
                            - Click vào chữ số cụ thể (1 trong 5 chữ số) để thêm vào group hiện tại<br />
                            - Click vào ô trống để tạo "điểm tựa" (anchor point) với màu của group<br />
                            - Click lại phần tử đã chọn để bỏ chọn khỏi group<br />
                            - Mũi tên sẽ tự động nối các điểm trong cùng group theo thứ tự<br />
                            - Thông tin vị trí hiển thị khi hover vào chữ số
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
        const days = 90;
        const data = await apiMB.getSoiCauBacCauStats(days);

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
                initialDays: 90,
            },
        };
    }
}

export default SoiCauBacCau;


