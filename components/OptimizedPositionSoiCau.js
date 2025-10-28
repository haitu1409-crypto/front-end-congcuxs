/**
 * Optimized Position Soi Cau Component
 * Component tối ưu hóa với React.memo, useMemo, useCallback và lazy loading
 */

import React, { useState, useCallback, useEffect, useMemo, memo } from 'react';
import dynamic from 'next/dynamic';
import optimizedApiService from '../services/optimizedApiService';
import styles from '../styles/positionSoiCau.module.css';

// Lazy load components
const PositionDetailBox = dynamic(() => import('./PositionDetailBox'), {
    loading: () => <div className={styles.skeleton}></div>,
    ssr: false
});

// Memoized skeleton components
const SkeletonRow = memo(() => (
    <tr>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
    </tr>
));

const SkeletonTable = memo(() => (
    <div className={styles.tableWrapper}>
        <table className={styles.tablePositionSoiCau}>
            <thead>
                <tr>
                    <th>Dự đoán</th>
                    <th>Vị trí 1</th>
                    <th>Vị trí 2</th>
                    <th>Độ tin cậy</th>
                </tr>
            </thead>
            <tbody>
                {Array(5).fill().map((_, index) => <SkeletonRow key={index} />)}
            </tbody>
        </table>
    </div>
));

// Memoized date options
const DateOptions = memo(() => {
    const days = useMemo(() =>
        Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0')), []
    );

    const months = useMemo(() =>
        Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')), []
    );

    const years = useMemo(() =>
        Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => (2000 + i).toString()), []
    );

    const dayOptions = useMemo(() =>
        [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25, 30], []
    );

    return { days, months, years, dayOptions };
});

// Memoized statistics table
const StatisticsTable = memo(({ tableStatistics }) => {
    if (!tableStatistics) return null;

    const groupedStats = useMemo(() => {
        const allNumbers = [];
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(tens => {
            const numbers = tableStatistics[`Đầu ${tens}`] || [];
            numbers.forEach(item => {
                allNumbers.push({
                    number: item.number,
                    count: item.count
                });
            });
        });

        const groupedByCount = {};
        allNumbers.forEach(item => {
            if (!groupedByCount[item.count]) {
                groupedByCount[item.count] = [];
            }
            groupedByCount[item.count].push(item);
        });

        return Object.keys(groupedByCount)
            .sort((a, b) => parseInt(b) - parseInt(a))
            .map(count => ({
                count: parseInt(count),
                numbers: groupedByCount[count].sort((a, b) => a.number - b.number)
            }));
    }, [tableStatistics]);

    return (
        <div className={styles.statisticsTable}>
            <h2 className={styles.heading}>Thống kê cầu lặp</h2>
            <div className={styles.groupedTableWrapper}>
                {groupedStats.map((group, groupIndex) => (
                    <div key={groupIndex} className={styles.countGroup}>
                        <div className={styles.countHeader}>
                            <span className={styles.countLabel}>{group.count} cầu</span>
                        </div>
                        <div className={styles.numbersList}>
                            {group.numbers.map((item, index) => (
                                <div key={index} className={styles.numberItem}>
                                    {item.number.toString().padStart(2, '0')}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

// Memoized predictions grid
const PredictionsGrid = memo(({ predictions, onNumberClick, selectedPredictionId }) => {
    const sortedPredictions = useMemo(() =>
        predictions.sort((a, b) => parseInt(a.predictedNumber) - parseInt(b.predictedNumber)),
        [predictions]
    );

    return (
        <div className={styles.predictionsGrid}>
            <div className={styles.numbersGrid}>
                {sortedPredictions.map((prediction, index) => (
                    <div
                        key={index}
                        className={`${styles.numberBox} ${selectedPredictionId === index ? styles.active : ''}`}
                        title={`Vị trí: ${prediction.position1} + ${prediction.position2} (${prediction.confidence}%)`}
                        onClick={() => onNumberClick(prediction, index)}
                    >
                        {prediction.predictedNumber}
                    </div>
                ))}
            </div>
            <div className={styles.gridInstructions}>
                <ul>
                    <li>Nhấp vào số để xem chi tiết đường cầu</li>
                </ul>
            </div>
        </div>
    );
});

// Memoized date buttons
const DateButtons = memo(({ selectedDateButton, onDateButtonClick }) => {
    const dateButtons = useMemo(() => [
        { value: '23/10/2025', label: 'Hôm nay' },
        { value: '22/10/2025', label: 'Hôm qua' },
        { value: '21/10/2025', label: '21-10' },
        { value: '20/10/2025', label: '20-10' },
        { value: '19/10/2025', label: '19-10' },
        { value: '18/10/2025', label: '18-10' }
    ], []);

    return (
        <div className={styles.dateButtonsContainer}>
            <ul className={`${styles.biendoDate} d-flex justify-content-center gap`}>
                {dateButtons.map((button) => (
                    <li
                        key={button.value}
                        className={`${styles.item} btn btn-outline-primary text-light ${selectedDateButton === button.value ? 'active' : ''}`}
                        data-value={button.value}
                        onClick={() => onDateButtonClick(button.value)}
                    >
                        <span>{button.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
});

const OptimizedPositionSoiCau = ({ initialData, initialDate, initialDays }) => {
    // State management với useMemo cho performance
    const [positionData, setPositionData] = useState(initialData || {});
    const [selectedDate, setSelectedDate] = useState(() => {
        if (initialDate) {
            const date = new Date(initialDate);
            return {
                day: date.getDate().toString().padStart(2, '0'),
                month: (date.getMonth() + 1).toString().padStart(2, '0'),
                year: date.getFullYear().toString(),
            };
        }
        const now = new Date();
        return {
            day: now.getDate().toString().padStart(2, '0'),
            month: (now.getMonth() + 1).toString().padStart(2, '0'),
            year: now.getFullYear().toString(),
        };
    });

    const [selectedDays, setSelectedDays] = useState(initialDays || 2);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [suggestedDate, setSuggestedDate] = useState(null);
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [selectedPrediction, setSelectedPrediction] = useState(null);
    const [selectedPredictionId, setSelectedPredictionId] = useState(null);
    const [showDetailBox, setShowDetailBox] = useState(false);
    const [lotteryData, setLotteryData] = useState(null);
    const [selectedDateButton, setSelectedDateButton] = useState('23/10/2025');

    // Memoized options
    const { days, months, years, dayOptions } = DateOptions();

    // Optimized fetch function với debouncing
    const fetchPositionSoiCau = useCallback(async (date, days) => {
        setLoading(true);
        setError(null);
        setSuggestedDate(null);

        try {
            const response = await optimizedApiService.getOptimizedPositionSoiCau({
                date,
                days
            });

            if (response.success) {
                setPositionData(response.data);
            } else {
                throw new Error(response.error || 'API call failed');
            }

            if (response.data?.metadata?.message) {
                setError(response.data.metadata.message);
            }
        } catch (err) {
            const errorMessage = err.message.includes('429')
                ? 'Quá nhiều yêu cầu, vui lòng chờ 5 giây trước khi thử lại.'
                : err.message.includes('Không đủ dữ liệu')
                    ? `Không đủ dữ liệu cho ${days} ngày phân tích. Vui lòng chọn ngày khác hoặc giảm số ngày.`
                    : err.message || 'Không thể tải dữ liệu soi cầu vị trí. Vui lòng thử lại hoặc chọn ngày khác.';
            setError(errorMessage);
            setPositionData({});

            if (err.message.includes('Không đủ dữ liệu')) {
                setSuggestedDate(err.suggestedDate || null);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Optimized event handlers
    const handleDateChange = useCallback((field) => (e) => {
        setSelectedDate((prev) => ({ ...prev, [field]: e.target.value }));
    }, []);

    const handleDaysChange = useCallback((e) => {
        const newDays = parseInt(e.target.value);
        if (dayOptions.includes(newDays)) {
            setSelectedDays(newDays);
        }
    }, [dayOptions]);

    const handleSuggestedDate = useCallback(() => {
        if (suggestedDate) {
            const date = new Date(suggestedDate);
            setSelectedDate({
                day: date.getDate().toString().padStart(2, '0'),
                month: (date.getMonth() + 1).toString().padStart(2, '0'),
                year: date.getFullYear().toString()
            });
        }
    }, [suggestedDate]);

    const handleNumberClick = useCallback((prediction, predictionIndex) => {
        setSelectedNumber(prediction.predictedNumber);
        setSelectedPrediction(prediction);
        setSelectedPredictionId(predictionIndex);
        setShowDetailBox(true);
    }, []);

    const handleCloseDetailBox = useCallback(() => {
        setShowDetailBox(false);
        setSelectedNumber(null);
        setSelectedPrediction(null);
        setSelectedPredictionId(null);
    }, []);

    const handleDateButtonClick = useCallback((dateValue) => {
        setSelectedDateButton(dateValue);
        const [day, month, year] = dateValue.split('/');
        setSelectedDate({
            day: day,
            month: month,
            year: year
        });
    }, []);

    // Memoized sample data
    const getSampleLotteryData = useCallback(() => {
        return {
            date: "21/10/2025",
            specialPrize: "07081",
            firstPrize: "66797",
            secondPrize: ["13815", "27581"],
            threePrizes: ["00249", "06272", "45716", "96445", "23245", "42742"],
            fourPrizes: ["2280", "1567", "2908", "2876"],
            fivePrizes: ["3679", "0541", "1243", "5257", "5004", "6838"],
            sixPrizes: ["391", "303", "160"],
            sevenPrizes: ["28", "81", "70", "38"],
            maDB: "12PD-14PD-3PD-17PD-18PD-8PD-10PD-11PD",
            loto: {
                "0": "03, 04, 08",
                "1": "15, 16",
                "2": "28",
                "3": "38, 38",
                "4": "41, 42, 43, 45, 45, 49",
                "5": "57",
                "6": "60, 67",
                "7": "70, 72, 76, 79",
                "8": "80, 81, 81, 81",
                "9": "91, 97"
            }
        };
    }, []);

    // Initialize sample data
    useEffect(() => {
        if (!lotteryData) {
            setLotteryData(getSampleLotteryData());
        }
    }, [lotteryData, getSampleLotteryData]);

    // Optimized effect với debouncing
    useEffect(() => {
        const date = `${selectedDate.day}/${selectedDate.month}/${selectedDate.year}`;
        if (new Date(`${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`).toString() !== 'Invalid Date') {
            // Debounce API calls
            const timeoutId = setTimeout(() => {
                fetchPositionSoiCau(date, selectedDays);
            }, 300);

            return () => clearTimeout(timeoutId);
        } else {
            setError('Ngày không hợp lệ');
        }
    }, [selectedDate.day, selectedDate.month, selectedDate.year, selectedDays, fetchPositionSoiCau]);

    // Memoized page content
    const pageTitle = useMemo(() =>
        'Soi Cầu Bạch Thủ Đặc Biệt Theo Ngày', []
    );

    const pageDescription = useMemo(() =>
        `Soi cầu bạch thủ dựa trên phân tích vị trí số trong kết quả xổ số ${selectedDays} ngày gần nhất.`,
        [selectedDays]
    );

    return (
        <div className={styles.container}>
            <div className={styles.titleGroup}>
                <h1 className={styles.title}>{pageTitle}</h1>
                <p className={styles.subtitle}>
                    Thuật toán soi cầu tiên tiến dựa trên phân tích vị trí số trong kết quả xổ số
                </p>
            </div>

            <div className={styles.groupSelect}>
                <div className={styles.selectGroup}>
                    <span className={styles.options}>Ngày:</span>
                    <select className={styles.select} value={selectedDate.day} onChange={handleDateChange('day')}>
                        {days.map((day) => (
                            <option key={day} value={day}>{day}</option>
                        ))}
                    </select>
                    <span className={styles.options}>Tháng:</span>
                    <select className={styles.select} value={selectedDate.month} onChange={handleDateChange('month')}>
                        {months.map((month) => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                    <span className={styles.options}>Năm:</span>
                    <select className={styles.select} value={selectedDate.year} onChange={handleDateChange('year')}>
                        {years.map((year) => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <span className={styles.options}>Số ngày phân tích:</span>
                    <select className={styles.select} value={selectedDays} onChange={handleDaysChange}>
                        {dayOptions.map((day) => (
                            <option key={day} value={day}>{day} ngày</option>
                        ))}
                    </select>
                    {suggestedDate && (
                        <button className={styles.suggestedDateBtn} onClick={handleSuggestedDate}>
                            Dùng ngày gợi ý: {suggestedDate}
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.content}>
                {error && <p className={styles.error}>{error}</p>}

                <StatisticsTable tableStatistics={positionData.tableStatistics} />

                <h2 className={styles.heading}>
                    Kết quả soi cầu ngày {positionData.analysisDate || '22/10/2025'} tìm được {positionData.predictions?.length || 0} cầu có độ dài = {positionData.analysisDays || 2} ngày (max)
                </h2>

                <DateButtons
                    selectedDateButton={selectedDateButton}
                    onDateButtonClick={handleDateButtonClick}
                />

                {loading && <SkeletonTable />}

                {!loading && positionData.predictions && positionData.predictions.length > 0 && (
                    <PredictionsGrid
                        predictions={positionData.predictions}
                        onNumberClick={handleNumberClick}
                        selectedPredictionId={selectedPredictionId}
                    />
                )}

                {showDetailBox && (
                    <PositionDetailBox
                        selectedNumber={selectedNumber}
                        selectedPrediction={selectedPrediction}
                        positionData={positionData}
                        onClose={handleCloseDetailBox}
                        isVisible={showDetailBox}
                        lotteryData={lotteryData}
                    />
                )}

                {!loading && (!positionData.predictions || positionData.predictions.length === 0) && (
                    <p className={styles.noData}>
                        {positionData.consistentPatterns === 0
                            ? 'Không tìm thấy pattern nhất quán trong khoảng thời gian này.'
                            : 'Không có dự đoán nào được tạo ra.'
                        }
                    </p>
                )}

                {positionData.detailedAnalysis && (
                    <>
                        <h3 className={styles.h3}>Phân tích chi tiết</h3>
                        <div className={styles.detailedAnalysis}>
                            <div className={styles.analysisSection}>
                                <h4>Pattern tìm thấy</h4>
                                <p>Tổng cộng {positionData.patternsFound} pattern từ {positionData.totalResults} ngày dữ liệu</p>
                            </div>

                            <div className={styles.analysisSection}>
                                <h4>Pattern nhất quán</h4>
                                <p>{positionData.consistentPatterns} pattern có tính nhất quán cao (≥50% tỷ lệ thành công)</p>
                            </div>

                            {positionData.detailedAnalysis.consistentPatterns && positionData.detailedAnalysis.consistentPatterns.length > 0 && (
                                <div className={styles.analysisSection}>
                                    <h4>Top pattern nhất quán</h4>
                                    <ul>
                                        {positionData.detailedAnalysis.consistentPatterns.slice(0, 3).map((pattern, index) => (
                                            <li key={index}>
                                                <strong>{pattern.positionKey}</strong> -
                                                Tỷ lệ thành công: {Math.round(pattern.successRate * 100)}%
                                                ({pattern.totalOccurrences}/{pattern.totalDays} ngày)
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </>
                )}

                <div className={styles.groupContent}>
                    <h2 className={styles.heading}>Cách hoạt động</h2>
                    <div className={styles.contentWrapper}>
                        <h3 className={styles.h3}>Thuật toán soi cầu vị trí</h3>
                        <p className={styles.desc}>
                            Thuật toán này phân tích vị trí của từng chữ số trong kết quả xổ số và tìm kiếm
                            các pattern nhất quán qua nhiều ngày để dự đoán 2 số cuối giải đặc biệt.
                        </p>

                        <h3 className={styles.h3}>Các bước phân tích</h3>
                        <ol className={styles.stepsList}>
                            <li><strong>Phân tích vị trí:</strong> Xác định vị trí của từng chữ số trong tất cả các giải</li>
                            <li><strong>Tìm pattern:</strong> Tìm các cặp vị trí tạo ra 2 số cuối giải đặc biệt</li>
                            <li><strong>Kiểm tra nhất quán:</strong> Xác minh pattern qua nhiều ngày liên tiếp</li>
                            <li><strong>Dự đoán:</strong> Áp dụng pattern nhất quán cho ngày hiện tại</li>
                        </ol>

                        <h3 className={styles.h3}>Độ tin cậy</h3>
                        <p className={styles.desc}>
                            Độ tin cậy được tính dựa trên tỷ lệ thành công của pattern trong lịch sử.
                            Pattern có độ tin cậy cao hơn sẽ được ưu tiên trong dự đoán.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(OptimizedPositionSoiCau);
