/**
 * Position Soi Cau Component
 * Component cho thuật toán soi cầu dựa trên vị trí số
 */

import React, { useState, useCallback, useEffect } from 'react';
import apiService from '../services/apiService';
import PositionDetailBox from './PositionDetailBox';
import styles from '../styles/positionSoiCau.module.css';

// Component hiển thị kết quả ngày trước với highlight
const YesterdayResult = ({ predictions = [], selectedDate, selectedDays }) => {
    const [yesterdayResult, setYesterdayResult] = useState(null);
    const [yesterdayPredictions, setYesterdayPredictions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchYesterdayData = async () => {
            try {
                setLoading(true);

                // Tính ngày trước ngày được chọn
                const selectedDateObj = new Date(`${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`);
                const yesterday = new Date(selectedDateObj);
                yesterday.setDate(yesterday.getDate() - 1);

                const dateStr = yesterday.toISOString().split('T')[0];
                const dateFormatted = yesterday.toLocaleDateString('vi-VN');

                console.log('🔍 Fetching data for:', {
                    selectedDate: `${selectedDate.day}/${selectedDate.month}/${selectedDate.year}`,
                    yesterdayDate: dateFormatted,
                    dateStr: dateStr
                });

                // Fetch kết quả xổ số ngày trước đó
                const resultResponse = await apiService.fetchWithCache(`/api/xsmb/results`, {
                    params: { date: dateStr, limit: 1, isComplete: true },
                    useCache: false
                });

                if (resultResponse.success && resultResponse.data.results.length > 0) {
                    setYesterdayResult(resultResponse.data.results[0]);
                }

                // Fetch dự đoán ngày trước đó
                const predictionResponse = await apiService.getPositionSoiCau({
                    date: dateFormatted,
                    days: selectedDays || 2
                });

                if (predictionResponse && predictionResponse.predictions) {
                    setYesterdayPredictions(predictionResponse.predictions);
                }
            } catch (error) {
                console.error('Error fetching yesterday data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (selectedDate && selectedDate.day && selectedDate.month && selectedDate.year) {
            fetchYesterdayData();
        }
    }, [selectedDate, selectedDays]);

    // Tính ngày trước ngày được chọn để hiển thị
    const selectedDateObj = selectedDate ? new Date(`${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`) : new Date();
    const yesterday = new Date(selectedDateObj);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('vi-VN');

    // Lấy 2 số cuối giải đặc biệt để highlight
    const specialPrize = yesterdayResult?.specialPrize?.[0] || '';
    const lastTwoDigits = specialPrize.slice(-2);

    // Function để check xem số có nên highlight không
    const shouldHighlight = (number) => {
        if (!lastTwoDigits || lastTwoDigits.length < 2) return false;
        if (!number || number === null || number === undefined) return false;
        const numberStr = number.toString().padStart(2, '0');
        return numberStr === lastTwoDigits;
    };

    if (loading) {
        return (
            <>
                <h3 className={styles.h3}>Dự đoán với kết quả ngày trước</h3>
                <div className={styles.detailedAnalysis}>
                    <div className={styles.analysisSection}>
                        <p>Đang tải kết quả...</p>
                    </div>
                </div>
            </>
        );
    }

    if (!yesterdayResult) {
        return (
            <>
                <h3 className={styles.h3}>Dự đoán với kết quả ngày trước</h3>
                <div className={styles.detailedAnalysis}>
                    <div className={styles.analysisSection}>
                        <p>Không có dữ liệu kết quả ngày {yesterdayStr}</p>
                    </div>
                </div>
            </>
        );
    }

    // Debug log để xem cấu trúc predictions
    console.log('🔍 YesterdayResult yesterdayPredictions:', yesterdayPredictions);
    console.log('🔍 First prediction structure:', yesterdayPredictions[0]);

    return (
        <>
            <h3 className={styles.h3}>Dự đoán với kết quả ngày trước</h3>
            <div className={styles.detailedAnalysis}>
                <div className={styles.analysisSection}>
                    <h4>Dự đoán ngày {yesterdayStr}</h4>
                    <p>Highlight các số trùng với 2 số cuối giải đặc biệt ({lastTwoDigits})</p>
                </div>

                <div className={styles.analysisSection}>
                    <h4>Các số dự đoán</h4>
                    <div className={styles.numbersGrid}>
                        {yesterdayPredictions
                            .map((prediction, index) => {
                                // Lấy số từ prediction object
                                const number = prediction.number || prediction.predictedNumber || prediction.value;

                                return {
                                    ...prediction,
                                    displayNumber: number,
                                    originalIndex: index
                                };
                            })
                            .filter(prediction => prediction.displayNumber && prediction.displayNumber !== 'N/A')
                            .sort((a, b) => {
                                // Sắp xếp theo số (từ nhỏ đến lớn)
                                const numA = parseInt(a.displayNumber) || 0;
                                const numB = parseInt(b.displayNumber) || 0;
                                return numA - numB;
                            })
                            .map((prediction, index) => {
                                return (
                                    <div
                                        key={`${prediction.originalIndex}-${index}`}
                                        className={`${styles.numberBox} ${shouldHighlight(prediction.displayNumber) ? styles.active : ''}`}
                                        title={`Vị trí: ${prediction.position1 || prediction.position} + ${prediction.position2 || prediction.secondPosition} (${Math.round((prediction.successRate || prediction.accuracy || 1) * 100)}%)`}
                                    >
                                        {prediction.displayNumber}
                                    </div>
                                );
                            })}
                    </div>
                </div>
            </div>
        </>
    );
};

// Skeleton Loading Components
const SkeletonRow = () => (
    <tr>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
    </tr>
);

const SkeletonTable = () => (
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
);

const PositionSoiCau = ({ initialData, initialDate, initialDays }) => {
    const [positionData, setPositionData] = useState(initialData || {});
    const [selectedDate, setSelectedDate] = useState({
        day: initialDate ? new Date(initialDate).getDate().toString().padStart(2, '0') : new Date().getDate().toString().padStart(2, '0'),
        month: initialDate ? (new Date(initialDate).getMonth() + 1).toString().padStart(2, '0') : (new Date().getMonth() + 1).toString().padStart(2, '0'),
        year: initialDate ? new Date(initialDate).getFullYear().toString() : new Date().getFullYear().toString(),
    });
    const [selectedDays, setSelectedDays] = useState(initialDays || 2);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [suggestedDate, setSuggestedDate] = useState(null);

    // State cho detail box
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [selectedPrediction, setSelectedPrediction] = useState(null); // Lưu prediction cụ thể được click
    const [selectedPredictionId, setSelectedPredictionId] = useState(null); // Lưu ID của prediction được click
    const [showDetailBox, setShowDetailBox] = useState(false);
    const [lotteryData, setLotteryData] = useState(null);
    const [selectedDateButton, setSelectedDateButton] = useState('23/10/2025');

    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const years = Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => (2000 + i).toString());
    const dayOptions = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25, 30];

    const fetchPositionSoiCau = useCallback(async (date, days) => {
        setLoading(true);
        setError(null);
        setSuggestedDate(null);

        try {
            // Thêm delay nhỏ để tránh rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));

            const response = await apiService.getPositionSoiCau({ date, days });
            setPositionData(response);

            if (response.metadata?.message) {
                setError(response.metadata.message);
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

    const handleDateChange = useCallback((field) => (e) => {
        setSelectedDate((prev) => ({ ...prev, [field]: e.target.value }));
    }, []);

    const handleDaysChange = useCallback((e) => {
        const newDays = parseInt(e.target.value);
        if (dayOptions.includes(newDays)) {
            setSelectedDays(newDays);
        }
    }, [dayOptions]);

    const handleSuggestedDate = () => {
        if (suggestedDate) {
            const date = new Date(suggestedDate);
            setSelectedDate({
                day: date.getDate().toString().padStart(2, '0'),
                month: (date.getMonth() + 1).toString().padStart(2, '0'),
                year: date.getFullYear().toString()
            });
        }
    };

    // Handler cho click vào số trong bảng dự đoán
    const handleNumberClick = useCallback((prediction, predictionIndex) => {
        setSelectedNumber(prediction.predictedNumber);
        setSelectedPrediction(prediction); // Lưu prediction cụ thể được click
        setSelectedPredictionId(predictionIndex); // Lưu index của prediction được click
        setShowDetailBox(true);
    }, []);

    // Handler để đóng detail box
    const handleCloseDetailBox = useCallback(() => {
        setShowDetailBox(false);
        setSelectedNumber(null);
        setSelectedPrediction(null);
        setSelectedPredictionId(null);
    }, []);

    // Handler cho click vào date button
    const handleDateButtonClick = useCallback((dateValue) => {
        setSelectedDateButton(dateValue);
        // Parse date và update selectedDate
        const [day, month, year] = dateValue.split('/');
        setSelectedDate({
            day: day,
            month: month,
            year: year
        });
    }, []);

    // Tạo dữ liệu mẫu cho detail box
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

    // Set dữ liệu mẫu khi component mount
    React.useEffect(() => {
        if (!lotteryData) {
            setLotteryData(getSampleLotteryData());
        }
    }, [lotteryData, getSampleLotteryData]);

    useEffect(() => {
        const date = `${selectedDate.day}/${selectedDate.month}/${selectedDate.year}`;
        if (new Date(`${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`).toString() !== 'Invalid Date') {
            // Debounce API call để tránh rate limiting
            const timeoutId = setTimeout(() => {
                fetchPositionSoiCau(date, selectedDays);
            }, 300); // 300ms delay

            return () => clearTimeout(timeoutId);
        } else {
            setError('Ngày không hợp lệ');
        }
    }, [selectedDate.day, selectedDate.month, selectedDate.year, selectedDays, fetchPositionSoiCau]);

    const pageTitle = 'Soi Cầu Bạch Thủ Đặc Biệt Theo Ngày';
    const pageDescription = `Soi cầu bạch thủ dựa trên phân tích vị trí số trong kết quả xổ số ${selectedDays} ngày gần nhất.`;

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


                {/* Bảng thống kê số lần xuất hiện */}
                {positionData.tableStatistics && (
                    <div className={styles.statisticsTable}>
                        <h2 className={styles.heading}>Thống kê cầu lặp</h2>
                        <div className={styles.groupedTableWrapper}>
                            {(() => {
                                // Tạo danh sách tất cả số
                                const allNumbers = [];
                                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(tens => {
                                    const numbers = positionData.tableStatistics[`Đầu ${tens}`] || [];
                                    numbers.forEach(item => {
                                        allNumbers.push({
                                            number: item.number,
                                            count: item.count
                                        });
                                    });
                                });

                                // Nhóm số theo số lần xuất hiện
                                const groupedByCount = {};
                                allNumbers.forEach(item => {
                                    if (!groupedByCount[item.count]) {
                                        groupedByCount[item.count] = [];
                                    }
                                    groupedByCount[item.count].push(item);
                                });

                                // Sắp xếp các nhóm theo số lần xuất hiện giảm dần
                                const sortedGroups = Object.keys(groupedByCount)
                                    .sort((a, b) => parseInt(b) - parseInt(a))
                                    .map(count => ({
                                        count: parseInt(count),
                                        numbers: groupedByCount[count].sort((a, b) => a.number - b.number)
                                    }));

                                return sortedGroups.map((group, groupIndex) => (
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
                                ));
                            })()}
                        </div>
                    </div>
                )}

                <h2 className={styles.heading}>Kết quả soi cầu ngày {positionData.analysisDate || '22/10/2025'} tìm được {positionData.predictions?.length || 0} cầu có độ dài = {positionData.analysisDays || 2} ngày (max)</h2>

                {/* Date selection buttons */}
                <div className={styles.dateButtonsContainer}>
                    <ul className={`${styles.biendoDate} d-flex justify-content-center gap`}>
                        {(() => {
                            const today = new Date();
                            const dateButtons = [];

                            // Tạo 6 button cho 6 ngày gần nhất
                            for (let i = 0; i < 6; i++) {
                                const date = new Date(today);
                                date.setDate(date.getDate() - i);
                                const dateStr = date.toLocaleDateString('vi-VN');
                                const dayMonth = `${date.getDate()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

                                let label;
                                if (i === 0) label = 'Hôm nay';
                                else if (i === 1) label = 'Hôm qua';
                                else label = dayMonth;

                                dateButtons.push(
                                    <li
                                        key={dateStr}
                                        className={`${styles.item} btn btn-outline-primary text-light ${selectedDateButton === dateStr ? 'active' : ''}`}
                                        data-value={dateStr}
                                        onClick={() => handleDateButtonClick(dateStr)}
                                    >
                                        <span>{label}</span>
                                    </li>
                                );
                            }

                            return dateButtons;
                        })()}
                    </ul>
                </div>
                {loading && <SkeletonTable />}
                {!loading && positionData.predictions && positionData.predictions.length > 0 && (
                    <div className={styles.predictionsGrid}>
                        <div className={styles.numbersGrid}>
                            {positionData.predictions
                                .sort((a, b) => parseInt(a.predictedNumber) - parseInt(b.predictedNumber))
                                .map((prediction, index) => (
                                    <div
                                        key={index}
                                        className={`${styles.numberBox} ${selectedPredictionId === index ? styles.active : ''}`}
                                        title={`Vị trí: ${prediction.position1} + ${prediction.position2} (${prediction.confidence}%)`}
                                        onClick={() => handleNumberClick(prediction, index)}
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
                )}

                {/* Detail Box hiển thị ngay dưới phần hướng dẫn */}
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
                    <YesterdayResult
                        predictions={positionData.predictions || []}
                        selectedDate={selectedDate}
                        selectedDays={selectedDays}
                    />
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

export default PositionSoiCau;
