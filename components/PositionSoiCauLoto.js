/**
 * Position Soi Cau Loto Component
 * Component cho thuật toán soi cầu lô tô theo vị trí số
 */

import React, { useState, useCallback, useEffect, useMemo, useTransition } from 'react';
import apiService from '../services/apiService';
import PositionDetailBoxLoto from './PositionDetailBoxLoto';
import PositionSoiCauLotoHistory from './PositionSoiCauLotoHistory';
import styles from '../styles/positionSoiCau.module.css';

const LOTTERY_PRIZE_FIELDS = [
    { field: 'specialPrize', isSpecial: true },
    { field: 'firstPrize' },
    { field: 'secondPrize' },
    { field: 'threePrizes' },
    { field: 'fourPrizes' },
    { field: 'fivePrizes' },
    { field: 'sixPrizes' },
    { field: 'sevenPrizes' }
];

const normalizeTwoDigitNumber = (value) => {
    if (value === null || value === undefined) return null;
    const normalized = value.toString().trim();
    if (!normalized) return null;
    return normalized.slice(-2).padStart(2, '0');
};

const getConfidencePercent = (prediction = {}) => {
    if (typeof prediction.confidence === 'number') return prediction.confidence;
    const parsedConfidence = Number(prediction.confidence);
    if (!Number.isNaN(parsedConfidence)) return parsedConfidence;

    if (typeof prediction.successRate === 'number') {
        return prediction.successRate * 100;
    }
    if (typeof prediction.accuracy === 'number') {
        return prediction.accuracy * 100;
    }
    return 0;
};

const buildHighlightMapFromLotteryData = (lotteryResult) => {
    if (!lotteryResult) return {};

    const highlightMap = {};

    const addEntry = (number, isSpecial = false) => {
        if (!number) return;
        if (!highlightMap[number]) {
            highlightMap[number] = {
                totalHits: 0,
                hasSpecial: false
            };
        }
        highlightMap[number].totalHits += 1;
        if (isSpecial) {
            highlightMap[number].hasSpecial = true;
        }
    };

    LOTTERY_PRIZE_FIELDS.forEach(({ field, isSpecial }) => {
        const prizeData = lotteryResult[field];
        if (!prizeData) return;
        const entries = Array.isArray(prizeData) ? prizeData : [prizeData];
        entries.forEach(value => {
            const lastTwoDigits = normalizeTwoDigitNumber(value);
            addEntry(lastTwoDigits, Boolean(isSpecial));
        });
    });

    return highlightMap;
};

const parseDatePartsToDate = (parts) => {
    if (!parts?.day || !parts?.month || !parts?.year) return null;
    const dateString = `${parts.year}-${parts.month}-${parts.day}`;
    const dateObj = new Date(dateString);
    return Number.isNaN(dateObj.getTime()) ? null : dateObj;
};

// Component hiển thị kết quả ngày trước với highlight
const YesterdayResult = React.memo(({ predictions = [], selectedDate, selectedDays }) => {
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

                const [resultResponse, predictionResponse] = await Promise.all([
                    apiService.fetchWithCache(`/api/xsmb/results`, {
                        params: { date: dateStr, limit: 1, isComplete: true },
                        useCache: true
                    }),
                    apiService.getPositionSoiCauLoto({
                        date: dateFormatted,
                        days: selectedDays || 2
                    })
                ]);

                if (resultResponse?.success && resultResponse?.data?.results?.length > 0) {
                    setYesterdayResult(resultResponse.data.results[0]);
                }

                if (predictionResponse?.predictions) {
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

    const highlightMap = useMemo(() => buildHighlightMapFromLotteryData(yesterdayResult), [yesterdayResult]);
    const specialLastTwoDigits = useMemo(() => {
        if (!yesterdayResult?.specialPrize?.length) return '--';
        return normalizeTwoDigitNumber(yesterdayResult.specialPrize[0]);
    }, [yesterdayResult]);

    const getHighlightClasses = (number) => {
        const normalized = normalizeTwoDigitNumber(number);
        const highlightInfo = normalized ? highlightMap[normalized] : null;
        const classes = [styles.numberBox];
        if (highlightInfo) {
            classes.push(styles.numberBoxHit);
        }
        if (highlightInfo?.hasSpecial) {
            classes.push(styles.numberBoxSpecialHit);
        }
        return classes.join(' ').trim();
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

    return (
        <>
            <h3 className={styles.h3}>Dự đoán với kết quả ngày trước</h3>
            <div className={styles.detailedAnalysis}>
                <div className={styles.analysisSection}>
                    <h4>Dự đoán ngày {yesterdayStr}</h4>
                    <p>
                        Highlight các số trùng với 2 số cuối tất cả giải (giải đặc biệt:
                        <span style={{ color: '#b91c1c', fontWeight: 600, marginLeft: 4 }}>
                            {specialLastTwoDigits || '--'}
                        </span>
                        )
                    </p>
                </div>

                <div className={styles.analysisSection}>
                    <h4>Các số dự đoán</h4>
                    <div className={styles.numbersGrid}>
                        {yesterdayPredictions
                            .map((prediction, index) => {
                                const confidencePercent = getConfidencePercent(prediction);
                                const number = prediction.number || prediction.predictedNumber || prediction.value;

                                return {
                                    ...prediction,
                                    displayNumber: number,
                                    confidencePercent,
                                    originalIndex: index
                                };
                            })
                            .filter(prediction => prediction.displayNumber && prediction.displayNumber !== 'N/A')
                            .sort((a, b) => {
                                const numA = parseInt(a.displayNumber, 10) || 0;
                                const numB = parseInt(b.displayNumber, 10) || 0;
                                return numA - numB;
                            })
                            .map((prediction, index) => (
                                <div
                                    key={`${prediction.originalIndex}-${index}`}
                                    className={getHighlightClasses(prediction.displayNumber)}
                                    title={`Vị trí: ${prediction.position1 || prediction.position} + ${prediction.position2 || prediction.secondPosition} (${Math.round(prediction.confidencePercent)}%)`}
                                >
                                    {prediction.displayNumber}
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </>
    );
});

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

const PositionSoiCauLoto = ({
    initialData,
    initialDate,
    initialDays,
    mobileHistoryModalOpen = false,
    onCloseMobileHistoryModal = () => {},
    mobileHistoryModalControlled = false,
}) => {
    // Khởi tạo selectedDate từ initialDate (không dùng localStorage để tránh hydration mismatch)
    const getInitialSelectedDateFromProps = () => {
        if (initialDate) {
            const date = new Date(initialDate);
            return {
                day: date.getDate().toString().padStart(2, '0'),
                month: (date.getMonth() + 1).toString().padStart(2, '0'),
                year: date.getFullYear().toString(),
            };
        }
        const today = new Date();
        return {
            day: today.getDate().toString().padStart(2, '0'),
            month: (today.getMonth() + 1).toString().padStart(2, '0'),
            year: today.getFullYear().toString(),
        };
    };

    const [positionData, setPositionData] = useState(initialData || {});
    const [selectedDate, setSelectedDate] = useState(getInitialSelectedDateFromProps);
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
    const [drawHighlightMap, setDrawHighlightMap] = useState({});
    const [activeNumberKey, setActiveNumberKey] = useState(null); // Track active number in lifetime section
    // Khởi tạo selectedDateButton từ selectedDate (không dùng localStorage để tránh hydration mismatch)
    const getInitialSelectedDateButtonFromProps = () => {
        const initial = getInitialSelectedDateFromProps();
        return `${initial.day}/${initial.month}/${initial.year}`;
    };

    const [selectedDateButton, setSelectedDateButton] = useState(getInitialSelectedDateButtonFromProps);
    const [isPending, startTransition] = useTransition();
    const [latestDateWithData, setLatestDateWithData] = useState(null); // Ngày mới nhất có dữ liệu
    const [isUpdating, setIsUpdating] = useState(false); // Trạng thái đang cập nhật
    const [updateMessage, setUpdateMessage] = useState(null); // Thông báo kết quả cập nhật
    const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0); // Trigger để refresh lịch sử

    const days = useMemo(() => Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0')), []);
    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')), []);
    const years = useMemo(() => Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => (2000 + i).toString()), []);

    const selectedDateString = useMemo(() => `${selectedDate.day}/${selectedDate.month}/${selectedDate.year}`, [selectedDate.day, selectedDate.month, selectedDate.year]);

    const fetchPositionSoiCau = useCallback(async (date, days, bypassCache = false) => {
        setLoading(true);
        setError(null);
        setSuggestedDate(null);

        try {
            // Thêm delay nhỏ để tránh rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));

            const response = await apiService.getPositionSoiCauLoto({ date, days }, { useCache: !bypassCache });
            startTransition(() => {
                setPositionData(response);

                if (response.metadata?.message) {
                    setError(response.metadata.message);
                }
            });
        } catch (err) {
            let errorMessage;
            if (err.message.includes('429')) {
                errorMessage = 'Quá nhiều yêu cầu, vui lòng chờ 5 giây trước khi thử lại.';
            } else if (err.message.includes('Không đủ dữ liệu')) {
                errorMessage = `Không đủ dữ liệu cho ${days} ngày phân tích. Vui lòng chọn ngày khác hoặc giảm số ngày.`;
            } else if (err.message.includes('HTTP 400')) {
                errorMessage = `Không đủ dữ liệu lịch sử cho ${days} ngày phân tích. Vui lòng chọn ít ngày hơn hoặc gần ngày hiện tại hơn.`;
            } else {
                errorMessage = err.message || 'Không thể tải dữ liệu soi cầu vị trí. Vui lòng thử lại hoặc chọn ngày khác.';
            }
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
        setSelectedDate((prev) => {
            const newDate = { ...prev, [field]: e.target.value };
            
            // Nếu đã có latestDateWithData, kiểm tra và điều chỉnh ngày nếu cần
            if (latestDateWithData) {
                const selectedDateObj = new Date(
                    parseInt(newDate.year),
                    parseInt(newDate.month) - 1,
                    parseInt(newDate.day)
                );
                const latestDate = new Date(latestDateWithData);
                latestDate.setHours(0, 0, 0, 0);
                selectedDateObj.setHours(0, 0, 0, 0);
                
                // Nếu ngày được chọn sau ngày mới nhất, điều chỉnh về ngày mới nhất
                if (selectedDateObj > latestDate) {
                    return {
                        day: latestDate.getDate().toString().padStart(2, '0'),
                        month: (latestDate.getMonth() + 1).toString().padStart(2, '0'),
                        year: latestDate.getFullYear().toString()
                    };
                }
                
                // Nếu thay đổi tháng hoặc năm, kiểm tra ngày có hợp lệ không
                if (field === 'month' || field === 'year') {
                    const latestYear = latestDate.getFullYear();
                    const latestMonth = latestDate.getMonth() + 1;
                    const latestDay = latestDate.getDate();
                    const checkYear = parseInt(newDate.year);
                    const checkMonth = parseInt(newDate.month);
                    const checkDay = parseInt(newDate.day);
                    
                    // Nếu năm hoặc tháng lớn hơn mới nhất, điều chỉnh về mới nhất
                    if (checkYear > latestYear || (checkYear === latestYear && checkMonth > latestMonth)) {
                        return {
                            day: latestDay.toString().padStart(2, '0'),
                            month: latestMonth.toString().padStart(2, '0'),
                            year: latestYear.toString()
                        };
                    }
                    
                    // Nếu cùng năm và tháng nhưng ngày lớn hơn, điều chỉnh về ngày mới nhất
                    if (checkYear === latestYear && checkMonth === latestMonth && checkDay > latestDay) {
                        return {
                            ...newDate,
                            day: latestDay.toString().padStart(2, '0')
                        };
                    }
                }
            }
            
            return newDate;
        });
    }, [latestDateWithData]);


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

    // Handler để kiểm tra và cập nhật soi cầu tự động
    const handleCheckAndUpdate = useCallback(async () => {
        setIsUpdating(true);
        setUpdateMessage(null);
        setError(null);

        try {
            const response = await apiService.checkAndUpdateSoiCau({
                days: selectedDays
            });

            if (response.success) {
                if (response.alreadyExists) {
                    setUpdateMessage({
                        type: 'info',
                        text: `Đã có soi cầu cho ngày ${response.tomorrowDate}. Không cần cập nhật.`
                    });
                } else {
                    setUpdateMessage({
                        type: 'success',
                        text: `Đã cập nhật soi cầu cho ngày ${response.tomorrowDate} thành công! (${response.predictionsCount} dự đoán)`
                    });
                    
                    // Cập nhật latestDateWithData nếu cần
                    if (response.tomorrowDate) {
                        const [day, month, year] = response.tomorrowDate.split('/');
                        const tomorrowDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        setLatestDateWithData(tomorrowDate);
                        
                        // Tự động chuyển sang ngày mới được cập nhật để xem kết quả
                        setSelectedDate({
                            day: day,
                            month: month,
                            year: year
                        });
                        
                        // Cập nhật selectedDateButton
                        setSelectedDateButton(response.tomorrowDate);
                        
                        // Force refresh dữ liệu với bypass cache để đảm bảo lấy dữ liệu mới nhất
                        setTimeout(() => {
                            console.log('🔄 Force refreshing position data for:', response.tomorrowDate);
                            fetchPositionSoiCau(response.tomorrowDate, selectedDays, true);
                        }, 500); // Delay nhỏ để đảm bảo state đã được cập nhật
                    }
                }
                
                // Trigger refresh lịch sử dự đoán (cả khi alreadyExists và khi cập nhật mới)
                // Để đảm bảo hiển thị dữ liệu mới nhất, đặc biệt là khi có kết quả xổ số mới
                setHistoryRefreshTrigger(prev => {
                    const newValue = prev + 1;
                    console.log('🔄 Triggering history refresh:', newValue);
                    return newValue;
                });
            } else {
                setUpdateMessage({
                    type: 'warning',
                    text: response.message || 'Kết quả xổ số hôm nay chưa có hoặc chưa đầy đủ.'
                });
            }
        } catch (err) {
            console.error('Lỗi khi cập nhật soi cầu:', err);
            setUpdateMessage({
                type: 'error',
                text: err.message || 'Không thể cập nhật soi cầu. Vui lòng thử lại sau.'
            });
        } finally {
            setIsUpdating(false);
        }
    }, [selectedDays]);

    // Handler cho click vào số trong bảng dự đoán
    const handleNumberClick = useCallback((prediction, predictionIndex, lifetimeKey = null) => {
        setSelectedNumber(prediction.predictedNumber);
        setSelectedPrediction(prediction); // Lưu prediction cụ thể được click
        setSelectedPredictionId(predictionIndex); // Lưu index của prediction được click
        setShowDetailBox(true);
        
        // Create unique key for active state tracking in lifetime section
        if (lifetimeKey !== null) {
            const activeKey = `${lifetimeKey}-${prediction.predictedNumber}-${prediction.position1}-${prediction.position2}`;
            setActiveNumberKey(activeKey);
        } else {
            setActiveNumberKey(null);
        }
    }, []);

    // Handler để đóng detail box
    const handleCloseDetailBox = useCallback(() => {
        setShowDetailBox(false);
        setSelectedNumber(null);
        setSelectedPrediction(null);
        setSelectedPredictionId(null);
        setActiveNumberKey(null); // Clear active state when closing detail box
    }, []);

    // Handler cho click vào date button
    const handleDateButtonClick = useCallback((dateValue) => {
        if (!latestDateWithData) {
            // Nếu chưa có dữ liệu, cho phép chọn
            setSelectedDateButton(dateValue);
            const [day, month, year] = dateValue.split('/');
            setSelectedDate({
                day: day,
                month: month,
                year: year
            });
            return;
        }
        
        // Parse date và kiểm tra
        const [day, month, year] = dateValue.split('/');
        const buttonDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        buttonDate.setHours(0, 0, 0, 0);
        
        const latestDate = new Date(latestDateWithData);
        latestDate.setHours(0, 0, 0, 0);
        
        // Nếu ngày button sau ngày mới nhất, không cho chọn
        if (buttonDate > latestDate) {
            return;
        }
        
        setSelectedDateButton(dateValue);
        setSelectedDate({
            day: day,
            month: month,
            year: year
        });
    }, [latestDateWithData]);

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

    // Lấy ngày mới nhất có dữ liệu từ database (ưu tiên ngày soi cầu mới nhất, sau đó mới đến kết quả xổ số)
    useEffect(() => {
        const fetchLatestDate = async () => {
            try {
                // Ưu tiên lấy ngày soi cầu mới nhất
                let latestSoiCauDate = null;
                try {
                    const soiCauResponse = await apiService.getLatestSoiCauDate({ useCache: false });
                    if (soiCauResponse?.success && soiCauResponse?.latestDate) {
                        const [day, month, year] = soiCauResponse.latestDate.split('/');
                        latestSoiCauDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        latestSoiCauDate.setHours(0, 0, 0, 0);
                        console.log('[PositionSoiCauLoto] Latest soi cau date:', soiCauResponse.latestDate);
                    }
                } catch (e) {
                    console.warn('Không thể lấy ngày soi cầu mới nhất:', e);
                }
                
                // Lấy ngày kết quả xổ số mới nhất
                let latestLotteryDate = null;
                try {
                    const response = await apiService.fetchWithCache('/api/xsmb/results/latest', {
                        useCache: true
                    });
                    if (response?.success && response?.data?.drawDate) {
                        latestLotteryDate = new Date(response.data.drawDate);
                        latestLotteryDate.setHours(0, 0, 0, 0);
                    }
                } catch (e) {
                    console.warn('Không thể lấy ngày xổ số mới nhất:', e);
                }
                
                // Chọn ngày mới nhất giữa soi cầu và xổ số
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                let finalLatestDate = today; // Mặc định là hôm nay
                
                if (latestSoiCauDate && latestLotteryDate) {
                    // Chọn ngày mới nhất giữa hai ngày
                    finalLatestDate = latestSoiCauDate > latestLotteryDate ? latestSoiCauDate : latestLotteryDate;
                } else if (latestSoiCauDate) {
                    finalLatestDate = latestSoiCauDate;
                } else if (latestLotteryDate) {
                    // Nếu ngày mới nhất có dữ liệu là hôm qua hoặc trước đó, 
                    // thì ngày mới nhất cho phép chọn là hôm nay (để dự đoán)
                    // Chỉ disable các ngày SAU hôm nay
                    if (latestLotteryDate < today) {
                        finalLatestDate = today;
                    } else {
                        finalLatestDate = latestLotteryDate;
                    }
                }
                
                console.log('[PositionSoiCauLoto] Setting latestDateWithData to:', finalLatestDate.toISOString());
                setLatestDateWithData(finalLatestDate);
            } catch (error) {
                console.error('Không thể lấy ngày mới nhất có dữ liệu:', error);
                // Nếu không lấy được, sử dụng ngày hôm nay làm mặc định
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                setLatestDateWithData(today);
            }
        };
        fetchLatestDate();
    }, []);

    // Điều chỉnh selectedDate nếu nó sau ngày mới nhất có dữ liệu
    // Chỉ điều chỉnh khi selectedDate SAU latestDate (không điều chỉnh khi bằng)
    // Logic này được xử lý chủ yếu trong handleDateChange, useEffect này chỉ để đảm bảo khi latestDateWithData thay đổi
    useEffect(() => {
        if (!latestDateWithData) return;
        
        const selectedDateObj = new Date(
            parseInt(selectedDate.year),
            parseInt(selectedDate.month) - 1,
            parseInt(selectedDate.day)
        );
        selectedDateObj.setHours(0, 0, 0, 0);
        
        const latestDate = new Date(latestDateWithData);
        latestDate.setHours(0, 0, 0, 0);
        
        // Chỉ điều chỉnh khi selectedDate SAU latestDate (cho phép chọn ngày latestDate)
        if (selectedDateObj > latestDate) {
            setSelectedDate({
                day: latestDate.getDate().toString().padStart(2, '0'),
                month: (latestDate.getMonth() + 1).toString().padStart(2, '0'),
                year: latestDate.getFullYear().toString()
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [latestDateWithData]); // Chỉ chạy khi latestDateWithData thay đổi, logic điều chỉnh ngày chủ yếu trong handleDateChange

    // Helper function để kiểm tra xem một ngày có bị vô hiệu hóa không
    const isDateDisabled = useCallback((day, month, year) => {
        if (!latestDateWithData) return false; // Nếu chưa có dữ liệu, không disable
        
        const checkDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        checkDate.setHours(0, 0, 0, 0);
        
        const latestDate = new Date(latestDateWithData);
        latestDate.setHours(0, 0, 0, 0);
        
        // Disable nếu ngày được chọn SAU ngày mới nhất (không bao gồm ngày mới nhất)
        // Cho phép chọn ngày mới nhất (có thể là hôm nay để dự đoán)
        return checkDate > latestDate;
    }, [latestDateWithData]);

    // Helper function để kiểm tra xem một option trong select có bị vô hiệu hóa không
    const isDayOptionDisabled = useCallback((day) => {
        if (!latestDateWithData) return false;
        return isDateDisabled(day, selectedDate.month, selectedDate.year);
    }, [latestDateWithData, selectedDate.month, selectedDate.year, isDateDisabled]);

    const isMonthOptionDisabled = useCallback((month) => {
        if (!latestDateWithData) return false;
        // Kiểm tra xem tháng này có ngày nào hợp lệ không
        const latestYear = latestDateWithData.getFullYear();
        const latestMonth = latestDateWithData.getMonth() + 1;
        const latestDay = latestDateWithData.getDate();
        
        const checkYear = parseInt(selectedDate.year);
        const checkMonth = parseInt(month);
        
        // Nếu năm được chọn lớn hơn năm mới nhất, disable tất cả tháng
        if (checkYear > latestYear) return true;
        // Nếu năm bằng năm mới nhất nhưng tháng lớn hơn tháng mới nhất, disable
        if (checkYear === latestYear && checkMonth > latestMonth) return true;
        // Nếu năm và tháng bằng, kiểm tra xem có ngày nào hợp lệ không
        if (checkYear === latestYear && checkMonth === latestMonth) {
            // Chỉ enable các ngày <= latestDay
            return false; // Tháng này có ngày hợp lệ
        }
        return false;
    }, [latestDateWithData, selectedDate.year]);

    const isYearOptionDisabled = useCallback((year) => {
        if (!latestDateWithData) return false;
        const latestYear = latestDateWithData.getFullYear();
        return parseInt(year) > latestYear;
    }, [latestDateWithData]);

    // Khôi phục selectedDate và selectedDateButton từ localStorage hoặc ngày soi cầu mới nhất sau khi component mount (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const restoreDate = async () => {
                try {
                    // Luôn kiểm tra API để lấy ngày mới nhất
                    console.log('[PositionSoiCauLoto] Checking latest soi cau date from API...');
                    const latestResponse = await apiService.getLatestSoiCauDate({ useCache: false });
                    
                    let savedDate = null;
                    const savedDateStr = localStorage.getItem('positionSoiCauLoto_selectedDate');
                    if (savedDateStr) {
                        try {
                            savedDate = JSON.parse(savedDateStr);
                        } catch (e) {
                            console.warn('Failed to parse saved date from localStorage:', e);
                        }
                    }
                    
                    // So sánh và chọn ngày mới nhất
                    let finalDate = null;
                    
                    if (latestResponse?.success && latestResponse?.latestDate) {
                        const [day, month, year] = latestResponse.latestDate.split('/');
                        const latestDateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                        
                        if (savedDate) {
                            const savedDateObj = new Date(parseInt(savedDate.year), parseInt(savedDate.month) - 1, parseInt(savedDate.day));
                            // Chọn ngày mới nhất giữa localStorage và API
                            if (latestDateObj >= savedDateObj) {
                                finalDate = { day, month, year };
                                console.log('[PositionSoiCauLoto] Using latest date from API:', latestResponse.latestDate);
                            } else {
                                finalDate = savedDate;
                                console.log('[PositionSoiCauLoto] Using saved date from localStorage:', `${savedDate.day}/${savedDate.month}/${savedDate.year}`);
                            }
                        } else {
                            finalDate = { day, month, year };
                            console.log('[PositionSoiCauLoto] Using latest date from API (no localStorage):', latestResponse.latestDate);
                        }
                    } else if (savedDate) {
                        // Nếu API không có dữ liệu, dùng localStorage
                        const savedDateObj = new Date(parseInt(savedDate.year), parseInt(savedDate.month) - 1, parseInt(savedDate.day));
                        const today = new Date();
                        today.setHours(23, 59, 59, 999);
                        const maxFutureDate = new Date(today);
                        maxFutureDate.setDate(maxFutureDate.getDate() + 7);
                        if (savedDateObj <= maxFutureDate) {
                            finalDate = savedDate;
                            console.log('[PositionSoiCauLoto] Using saved date from localStorage (no API data):', `${savedDate.day}/${savedDate.month}/${savedDate.year}`);
                        }
                    }
                    
                    // Cập nhật state nếu có ngày hợp lệ
                    if (finalDate) {
                        setSelectedDate(finalDate);
                        const dateString = `${finalDate.day}/${finalDate.month}/${finalDate.year}`;
                        setSelectedDateButton(dateString);
                        // Lưu vào localStorage
                        localStorage.setItem('positionSoiCauLoto_selectedDate', JSON.stringify(finalDate));
                        localStorage.setItem('positionSoiCauLoto_selectedDateButton', dateString);
                    }
                } catch (e) {
                    console.warn('[PositionSoiCauLoto] Failed to restore date:', e);
                }
            };
            
            restoreDate();
        }
    }, []); // Chỉ chạy một lần sau khi mount

    // Lưu selectedDate và selectedDateButton vào localStorage mỗi khi thay đổi
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('positionSoiCauLoto_selectedDate', JSON.stringify(selectedDate));
            } catch (e) {
                console.warn('Failed to save selectedDate to localStorage:', e);
            }
        }
    }, [selectedDate]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem('positionSoiCauLoto_selectedDateButton', selectedDateButton);
            } catch (e) {
                console.warn('Failed to save selectedDateButton to localStorage:', e);
            }
        }
    }, [selectedDateButton]);

    useEffect(() => {
        const date = selectedDateString;
        if (new Date(`${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`).toString() !== 'Invalid Date') {
            // Debounce API call để tránh rate limiting
            const timeoutId = setTimeout(() => {
                fetchPositionSoiCau(date, selectedDays);
            }, 300); // 300ms delay

            return () => clearTimeout(timeoutId);
        } else {
            setError('Ngày không hợp lệ');
        }
    }, [selectedDate.day, selectedDate.month, selectedDate.year, selectedDays, fetchPositionSoiCau, selectedDateString]);

    useEffect(() => {
        const parsedDate = parseDatePartsToDate(selectedDate);
        if (!parsedDate) {
            setDrawHighlightMap({});
            return;
        }

        let isSubscribed = true;

        const fetchLotteryResultsForHighlight = async () => {
            try {
                const dateStr = parsedDate.toISOString().split('T')[0];
                const response = await apiService.fetchWithCache('/api/xsmb/results', {
                    params: { date: dateStr, limit: 1, isComplete: true },
                    useCache: true
                });

                if (!isSubscribed) return;

                if (response.success && response.data?.results?.length > 0) {
                    setDrawHighlightMap(buildHighlightMapFromLotteryData(response.data.results[0]));
                } else {
                    setDrawHighlightMap({});
                }
            } catch (fetchError) {
                if (isSubscribed) {
                    console.error('Không thể tải kết quả xổ số để highlight:', fetchError);
                    setDrawHighlightMap({});
                }
            }
        };

        fetchLotteryResultsForHighlight();

        return () => {
            isSubscribed = false;
        };
    }, [selectedDate]);

    const groupedStatistics = useMemo(() => {
        if (!positionData?.tableStatistics) return [];

        const groupedByCount = {};

        for (let tens = 0; tens <= 9; tens++) {
            const entries = positionData.tableStatistics[`Đầu ${tens}`] || [];
            entries.forEach(item => {
                if (!groupedByCount[item.count]) {
                    groupedByCount[item.count] = [];
                }
                groupedByCount[item.count].push({
                    number: item.number,
                    count: item.count
                });
            });
        }

        return Object.keys(groupedByCount)
            .sort((a, b) => parseInt(b, 10) - parseInt(a, 10))
            .map(count => ({
                count: parseInt(count, 10),
                numbers: groupedByCount[count].sort((a, b) => a.number - b.number)
            }));
    }, [positionData?.tableStatistics]);

    const dateShortcutButtons = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const buttons = [];
        
        // Thêm button "Ngày mai" nếu có dữ liệu cho ngày mai (tức là đã cập nhật)
        if (latestDateWithData) {
            const latestDate = new Date(latestDateWithData);
            latestDate.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            
            // Nếu ngày mai <= latestDateWithData, có nghĩa là đã có dữ liệu cho ngày mai
            if (tomorrow <= latestDate) {
                const tomorrowValue = tomorrow.toLocaleDateString('vi-VN');
                buttons.push({
                    value: tomorrowValue,
                    label: 'Ngày mai',
                    disabled: false
                });
            }
        }
        
        // Thêm các buttons từ hôm nay trở về trước
        for (let i = 0; i < 6; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const value = date.toLocaleDateString('vi-VN');
            
            // Xác định label
            let label;
            if (i === 0) {
                label = 'Hôm nay';
            } else if (i === 1) {
                label = 'Hôm qua';
            } else {
                label = `${date.getDate()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            }

            // Kiểm tra xem ngày này có sau ngày mới nhất có dữ liệu không
            let disabled = false;
            if (latestDateWithData) {
                const latestDate = new Date(latestDateWithData);
                latestDate.setHours(0, 0, 0, 0);
                disabled = date > latestDate;
            }

            buttons.push({
                value,
                label,
                disabled
            });
        }
        
        return buttons;
    }, [latestDateWithData]);

    const hasTomorrowButton = useMemo(
        () => dateShortcutButtons.some(button => button.label === 'Ngày mai'),
        [dateShortcutButtons]
    );

    const sortedPredictions = useMemo(() => {
        if (!positionData?.predictions) return [];
        
        // Loại bỏ trùng lặp dựa trên predictedNumber
        // Với mỗi số, giữ lại prediction có confidence cao nhất (hoặc lifetime cao nhất nếu có)
        const predictionsMap = new Map();
        
        [...positionData.predictions]
            .map(prediction => ({
                ...prediction,
                confidencePercent: getConfidencePercent(prediction)
            }))
            .forEach(prediction => {
                const normalizedNumber = normalizeTwoDigitNumber(prediction.predictedNumber);
                if (!normalizedNumber) return;
                
                const existing = predictionsMap.get(normalizedNumber);
                if (!existing) {
                    predictionsMap.set(normalizedNumber, prediction);
                } else {
                    // Giữ lại prediction có confidence cao hơn, hoặc lifetime cao hơn
                    const existingConfidence = existing.confidencePercent || 0;
                    const currentConfidence = prediction.confidencePercent || 0;
                    const existingLifetime = existing.lifetime || existing.consecutiveDays || 0;
                    const currentLifetime = prediction.lifetime || prediction.consecutiveDays || 0;
                    
                    if (currentLifetime > existingLifetime || 
                        (currentLifetime === existingLifetime && currentConfidence > existingConfidence)) {
                        predictionsMap.set(normalizedNumber, prediction);
                    }
                }
            });
        
        // Chuyển Map thành array và sort theo số
        return Array.from(predictionsMap.values())
            .sort((a, b) => parseInt(a.predictedNumber, 10) - parseInt(b.predictedNumber, 10));
    }, [positionData?.predictions]);

    const numberHighlightClassMap = useMemo(() => {
        const map = {};
        Object.entries(drawHighlightMap || {}).forEach(([number, info]) => {
            const classes = [styles.numberBox];
            if (info) {
                classes.push(styles.numberBoxHit);
            }
            if (info?.hasSpecial) {
                classes.push(styles.numberBoxSpecialHit);
            }
            map[number] = classes.join(' ');
        });
        return map;
    }, [drawHighlightMap]);

    const pageTitle = 'Soi Cầu Bạch Thủ Lô Miền Bắc';
    const pageDescription = `Soi cầu lô tô dựa trên phân tích vị trí số trong kết quả xổ số ${selectedDays} ngày gần nhất.`;

    return (
        <div className={styles.container}>
            <div className={styles.titleGroup}>
                <h1 className={styles.title}>{pageTitle}</h1>
            </div>

            <div className={styles.groupSelect}>
                <div className={styles.selectGroup}>
                    <div className={styles.selectItem}>
                        <span className={styles.options}>Ngày:</span>
                        <select className={styles.select} value={selectedDate.day} onChange={handleDateChange('day')}>
                            {days.map((day) => {
                                const disabled = isDayOptionDisabled(day);
                                return (
                                    <option key={day} value={day} disabled={disabled}>
                                        {day}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div className={styles.selectItem}>
                        <span className={styles.options}>Tháng:</span>
                        <select className={styles.select} value={selectedDate.month} onChange={handleDateChange('month')}>
                            {months.map((month) => {
                                const disabled = isMonthOptionDisabled(month);
                                return (
                                    <option key={month} value={month} disabled={disabled}>
                                        {month}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div className={styles.selectItem}>
                        <span className={styles.options}>Năm:</span>
                        <select className={styles.select} value={selectedDate.year} onChange={handleDateChange('year')}>
                            {years.map((year) => {
                                const disabled = isYearOptionDisabled(year);
                                return (
                                    <option key={year} value={year} disabled={disabled}>
                                        {year}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    {suggestedDate && (
                        <div className={styles.suggestedDateContainer}>
                            <button className={styles.suggestedDateBtn} onClick={handleSuggestedDate}>
                                Dùng ngày gợi ý: {suggestedDate}
                            </button>
                        </div>
                    )}
                    <div className={styles.updateButtonContainer}>
                        <button 
                            className={styles.updateButton} 
                            onClick={handleCheckAndUpdate}
                            disabled={isUpdating}
                            title="Kiểm tra kết quả xổ số hôm nay và tự động tính toán soi cầu cho ngày mai"
                        >
                            {isUpdating ? 'Đang cập nhật...' : 'Cập nhật'}
                        </button>
                    </div>
                </div>
            </div>
            {updateMessage && (
                <div className={`${styles.updateMessage} ${styles[`updateMessage_${updateMessage.type}`]}`}>
                    {updateMessage.text}
                </div>
            )}

            <div className={styles.content}>
                {error && <p className={styles.error}>{error}</p>}


                {/* Bảng thống kê số lần xuất hiện */}
                {positionData.tableStatistics && groupedStatistics && groupedStatistics.length > 0 && (
                    <div className={styles.statisticsTable}>
                        <h2 className={styles.heading}>Thống kê cầu lặp</h2>
                        <div className={styles.groupedTableWrapper}>
                            {groupedStatistics.map((group, groupIndex) => (
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
                )}

                <h2 className={styles.heading}>Kết quả soi cầu loto ({positionData.analysisDate || '22/10/2025'})</h2>

                {/* Date selection buttons */}
                <div className={styles.dateButtonsContainer}>
                    <ul className={`${styles.biendoDate} ${hasTomorrowButton ? styles.biendoDateHasTomorrow : ''} d-flex justify-content-center gap`}>
                        {dateShortcutButtons.map(button => (
                            <li
                                key={button.value}
                                className={`${styles.item} btn btn-outline-primary text-light ${selectedDateButton === button.value ? 'active' : ''} ${button.disabled ? 'disabled' : ''}`}
                                data-value={button.value}
                                onClick={() => !button.disabled && handleDateButtonClick(button.value)}
                                style={button.disabled ? { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
                            >
                                <span>{button.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={styles.gridInstructions}>
                    <ul>
                        <li>Nhấp vào số để xem chi tiết đường cầu</li>
                    </ul>
                </div>
                {(loading || isPending) && <SkeletonTable />}
                
                {/* Hiển thị predictions theo nhóm lifetime (3-10 lần liên tiếp) */}
                {!loading && !isPending && positionData.predictionsByLifetime && Object.keys(positionData.predictionsByLifetime).length > 0 && (
                    <div id="lifetime" className={styles.lifetimeSection}>
                        {[10, 9, 8, 7, 6, 5, 4, 3].map(lifetime => {
                            const predictions = positionData.predictionsByLifetime[lifetime] || [];
                            if (predictions.length === 0) return null;

                            return (
                                <div key={lifetime} className={styles.listStatistic}>
                                    <p className={styles.lifetimeTitle}>Biên độ {lifetime} ngày:</p>
                                    <div className={styles.lifetimeNumbers}>
                                        {predictions.map((prediction, index) => {
                                            const normalizedNumber = normalizeTwoDigitNumber(prediction.predictedNumber);
                                            const isHit = normalizedNumber && drawHighlightMap[normalizedNumber];
                                            const isSpecial = normalizedNumber && drawHighlightMap[normalizedNumber]?.hasSpecial;
                                            
                                            // Create unique key for active state
                                            const activeKey = `${lifetime}-${prediction.predictedNumber}-${prediction.position1}-${prediction.position2}`;
                                            const isActive = activeNumberKey === activeKey;
                                            
                                            let classNames = styles.cauxs;
                                            if (isHit) classNames += ` ${styles.orange}`;
                                            if (isSpecial) classNames += ` ${styles.red}`;
                                            if (isActive) classNames += ` ${styles.active}`;

                                            const confidenceDisplay = Math.round(
                                                prediction.confidencePercent ?? getConfidencePercent(prediction)
                                            );

                                            return (
                                                <span
                                                    key={`${lifetime}-${index}`}
                                                    className={classNames}
                                                    data-lifetime={lifetime}
                                                    title={`Vị trí: ${prediction.position1} + ${prediction.position2} (${confidenceDisplay}%)`}
                                                    onClick={() => {
                                                        // Đảm bảo prediction có lifetime property
                                                        const predictionWithLifetime = {
                                                            ...prediction,
                                                            lifetime: lifetime,
                                                            consecutiveDays: lifetime
                                                        };
                                                        
                                                        // Tìm index trong sortedPredictions để highlight đúng
                                                        const globalIndex = sortedPredictions.findIndex(p => 
                                                            p.predictedNumber === prediction.predictedNumber &&
                                                            p.position1 === prediction.position1 &&
                                                            p.position2 === prediction.position2
                                                        );
                                                        if (globalIndex >= 0) {
                                                            handleNumberClick(predictionWithLifetime, globalIndex, lifetime);
                                                        } else {
                                                            handleNumberClick(predictionWithLifetime, 0, lifetime);
                                                        }
                                                    }}
                                                >
                                                    {prediction.predictedNumber}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && !isPending && positionData.predictions && positionData.predictions.length > 0 && (
                    <div className={styles.predictionsGrid}>
                        <h3 className={styles.gridTitle}>
                            Dự đoán tổng hợp ngày {positionData.analysisDate || `${selectedDate.day}/${selectedDate.month}/${selectedDate.year}`}
                        </h3>
                        <div className={styles.numbersGrid}>
                            {sortedPredictions.map((prediction, index) => {
                                const normalizedNumber = normalizeTwoDigitNumber(prediction.predictedNumber);
                                const baseClass = normalizedNumber && numberHighlightClassMap[normalizedNumber]
                                    ? numberHighlightClassMap[normalizedNumber]
                                    : styles.numberBox;
                                const classNames = selectedPredictionId === index
                                    ? `${baseClass} ${styles.active}`
                                    : baseClass;
                                const confidenceDisplay = Math.round(
                                    prediction.confidencePercent ?? getConfidencePercent(prediction)
                                );

                                return (
                                    <div
                                        key={index}
                                        className={classNames}
                                        title={`Vị trí: ${prediction.position1} + ${prediction.position2} (${confidenceDisplay}%)`}
                                        onClick={() => handleNumberClick(prediction, index)}
                                    >
                                        {prediction.predictedNumber}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Detail Box hiển thị ngay dưới phần hướng dẫn */}
                {showDetailBox && (
                    <PositionDetailBoxLoto
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

                {/* Lịch sử dự đoán */}
                <PositionSoiCauLotoHistory
                    limit={31}
                    days={selectedDays}
                    refreshTrigger={historyRefreshTrigger}
                    mobileModalControlled={mobileHistoryModalControlled}
                    mobileModalOpen={mobileHistoryModalOpen}
                    onMobileModalClose={onCloseMobileHistoryModal}
                />

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

export default PositionSoiCauLoto;
