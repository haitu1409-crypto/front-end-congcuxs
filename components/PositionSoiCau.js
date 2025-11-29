/**
 * Position Soi Cau Component
 * Component cho thuật toán soi cầu dựa trên vị trí số
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import apiService from '../services/apiService';
import PositionDetailBox from './PositionDetailBox';
import PositionSoiCauHistory from './PositionSoiCauHistory';
import styles from '../styles/positionSoiCau.module.css';

const parseDatePartsToDate = (parts) => {
    if (!parts?.day || !parts?.month || !parts?.year) return null;
    const dateString = `${parts.year}-${parts.month}-${parts.day}`;
    const dateObj = new Date(dateString);
    return Number.isNaN(dateObj.getTime()) ? null : dateObj;
};

const parseDateStringToParts = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return null;
    const [day, month, year] = dateString.split('/');
    if (!day || !month || !year) return null;
    return {
        day: day.padStart(2, '0'),
        month: month.padStart(2, '0'),
        year: year.padStart(4, '0')
    };
};

// Component hiển thị kết quả ngày trước với highlight
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

const PositionSoiCau = ({
    initialData,
    initialDate,
    initialDays,
    mobileHistoryModalOpen = false,
    onCloseMobileHistoryModal = () => {},
    mobileHistoryModalControlled = false,
}) => {
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
    const [selectedDateButton, setSelectedDateButton] = useState(() => {
        const baseDate = initialDate ? new Date(initialDate) : new Date();
        if (Number.isNaN(baseDate.getTime())) {
            return new Date().toLocaleDateString('vi-VN');
        }
        baseDate.setHours(0, 0, 0, 0);
        return baseDate.toLocaleDateString('vi-VN');
    });
    const [highlightedNumbers, setHighlightedNumbers] = useState([]);
    const [activeNumberKey, setActiveNumberKey] = useState(null); // Track active number in lifetime section
    const [isUpdating, setIsUpdating] = useState(false); // Trạng thái đang cập nhật
    const [updateMessage, setUpdateMessage] = useState(null); // Thông báo kết quả cập nhật
    const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0); // Trigger để refresh lịch sử
    const [latestDateWithData, setLatestDateWithData] = useState(null); // Ngày mới nhất có dữ liệu
    const hasRestoredInitialDate = useRef(false);

    const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    const years = Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => (2000 + i).toString());

    const selectedDateString = useMemo(() => (
        `${selectedDate.day}/${selectedDate.month}/${selectedDate.year}`
    ), [selectedDate.day, selectedDate.month, selectedDate.year]);

    const fetchPositionSoiCau = useCallback(async (date, days, bypassCache = false) => {
        setLoading(true);
        setError(null);
        setSuggestedDate(null);

        try {
            // Thêm delay nhỏ để tránh rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));

            const response = await apiService.getPositionSoiCau({ date, days }, { useCache: !bypassCache });
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
            const response = await apiService.checkAndUpdatePositionSoiCau({
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
                    
                    // Tự động chuyển sang ngày mới được cập nhật để xem kết quả
                    if (response.tomorrowDate) {
                        const [day, month, year] = response.tomorrowDate.split('/');
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
    }, [selectedDays, fetchPositionSoiCau]);

    const sortedFallbackPredictions = useMemo(() => {
        if (!positionData?.predictions) return [];
        return [...positionData.predictions].sort((a, b) => parseInt(a.predictedNumber) - parseInt(b.predictedNumber));
    }, [positionData?.predictions]);

    const highlightedNumbersSet = useMemo(() => {
        if (!highlightedNumbers || highlightedNumbers.length === 0) return new Set();
        return new Set(
            highlightedNumbers
                .filter(Boolean)
                .map(num => String(num).padStart(2, '0'))
        );
    }, [highlightedNumbers]);

    const lifetimeData = positionData?.predictionsByLifetime || {};
    const lifetimeKeys = useMemo(() => {
        return Object.keys(lifetimeData)
            .map(key => Number(key))
            .filter(key => (lifetimeData[key] || []).length > 0)
            .sort((a, b) => b - a);
    }, [lifetimeData]);

    const getConfidenceDisplay = useCallback((prediction) => {
        if (!prediction) return 0;
        if (typeof prediction.confidence === 'number') return Math.round(prediction.confidence);
        if (typeof prediction.confidencePercent === 'number') return Math.round(prediction.confidencePercent);
        if (typeof prediction.successRate === 'number') return Math.round(prediction.successRate * 100);
        if (typeof prediction.accuracy === 'number') return Math.round(prediction.accuracy * 100);
        return 0;
    }, []);

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
        setSelectedDateButton(dateValue);
        // Parse date và update selectedDate
        const [day, month, year] = dateValue.split('/');
        setSelectedDate({
            day: day.padStart(2, '0'),
            month: month.padStart(2, '0'),
            year
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
        if (new Date(`${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`).toString() !== 'Invalid Date') {
            // Debounce API call để tránh rate limiting
            const timeoutId = setTimeout(() => {
                fetchPositionSoiCau(selectedDateString, selectedDays);
            }, 300); // 300ms delay

            return () => clearTimeout(timeoutId);
        } else {
            setError('Ngày không hợp lệ');
        }
    }, [selectedDate.day, selectedDate.month, selectedDate.year, selectedDays, fetchPositionSoiCau]);

    const fetchHighlightNumbers = useCallback(async () => {
        try {
            const isoDate = `${selectedDate.year}-${selectedDate.month}-${selectedDate.day}`;
            const response = await apiService.fetchWithCache('/api/xsmb/results', {
                params: { date: isoDate, limit: 1, isComplete: true },
                useCache: false
            });

            if (response.success && response.data.results.length > 0) {
                const specialPrize = response.data.results[0]?.specialPrize?.[0];
                if (specialPrize && specialPrize.length >= 2) {
                    const lastTwo = specialPrize.slice(-2);
                    setHighlightedNumbers([lastTwo]);
                    return;
                }
            }
            setHighlightedNumbers([]);
        } catch (error) {
            console.error('Error fetching highlight numbers:', error);
            setHighlightedNumbers([]);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchHighlightNumbers();
    }, [fetchHighlightNumbers]);

    // Lấy ngày mới nhất có dữ liệu từ database
    useEffect(() => {
        const fetchLatestDate = async () => {
            try {
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
                
                // Chọn ngày mới nhất
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                let finalLatestDate = today; // Mặc định là hôm nay
                
                if (latestLotteryDate) {
                    // Nếu ngày mới nhất có dữ liệu là hôm qua hoặc trước đó, 
                    // thì ngày mới nhất cho phép chọn là hôm nay (để dự đoán)
                    // Chỉ disable các ngày SAU hôm nay
                    if (latestLotteryDate < today) {
                        finalLatestDate = today;
                    } else {
                        finalLatestDate = latestLotteryDate;
                    }
                }
                
                console.log('[PositionSoiCau] Setting latestDateWithData to:', finalLatestDate.toISOString());
                setLatestDateWithData((prev) => {
                    if (!prev) return finalLatestDate;
                    return finalLatestDate > prev ? finalLatestDate : prev;
                });
            } catch (error) {
                console.error('Không thể lấy ngày mới nhất có dữ liệu:', error);
                // Nếu không lấy được, sử dụng ngày hôm nay làm mặc định
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                setLatestDateWithData((prev) => {
                    if (!prev) return today;
                    return today > prev ? today : prev;
                });
            }
        };
        fetchLatestDate();
    }, []);

    // Điều chỉnh selectedDate nếu nó sau ngày mới nhất có dữ liệu
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
    }, [latestDateWithData]);

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

    useEffect(() => {
        const parsedDate = new Date(
            parseInt(selectedDate.year),
            parseInt(selectedDate.month) - 1,
            parseInt(selectedDate.day)
        );
        if (Number.isNaN(parsedDate.getTime())) return;
        parsedDate.setHours(0, 0, 0, 0);
        const formatted = parsedDate.toLocaleDateString('vi-VN');
        setSelectedDateButton(prev => (prev === formatted ? prev : formatted));
    }, [selectedDate.day, selectedDate.month, selectedDate.year]);

    const dateShortcutButtons = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const buttons = [];

        if (latestDateWithData) {
            const latestDate = new Date(latestDateWithData);
            latestDate.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            if (tomorrow <= latestDate) {
                buttons.push({
                    value: tomorrow.toLocaleDateString('vi-VN'),
                    label: 'Ngày mai',
                    disabled: false
                });
            }
        }

        for (let i = 0; i < 6; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const value = date.toLocaleDateString('vi-VN');

            let label;
            if (i === 0) label = 'Hôm nay';
            else if (i === 1) label = 'Hôm qua';
            else label = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

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

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (hasRestoredInitialDate.current) return;

        let isMounted = true;

        const restoreDateFromStorageAndApi = async () => {
            try {
                const savedDateStr = localStorage.getItem('positionSoiCau_selectedDate');
                let savedDateParts = null;
                if (savedDateStr) {
                    try {
                        const parsed = JSON.parse(savedDateStr);
                        if (parsed?.day && parsed?.month && parsed?.year) {
                            savedDateParts = {
                                day: parsed.day.toString().padStart(2, '0'),
                                month: parsed.month.toString().padStart(2, '0'),
                                year: parsed.year.toString()
                            };
                        }
                    } catch (storageError) {
                        console.warn('[PositionSoiCau] Không thể parse saved date:', storageError);
                    }
                }

                const savedButtonValue = localStorage.getItem('positionSoiCau_selectedDateButton');

                let latestHistoryDateParts = null;
                let latestHistoryDateObj = null;
                try {
                    const historyResponse = await apiService.getPositionSoiCauHistory({
                        limit: '1',
                        days: selectedDays.toString()
                    }, {
                        useCache: false
                    });

                    if (historyResponse?.success) {
                        const latestRecord = historyResponse?.data?.history?.[0];
                        if (latestRecord?.date) {
                            latestHistoryDateParts = parseDateStringToParts(latestRecord.date);
                            latestHistoryDateObj = parseDatePartsToDate(latestHistoryDateParts);
                            if (latestHistoryDateObj) {
                                setLatestDateWithData(prev => {
                                    if (!prev) return new Date(latestHistoryDateObj);
                                    return latestHistoryDateObj > prev ? new Date(latestHistoryDateObj) : prev;
                                });
                            }
                        }
                    }
                } catch (historyError) {
                    console.warn('[PositionSoiCau] Không thể lấy ngày soi cầu mới nhất:', historyError);
                }

                const savedDateObj = parseDatePartsToDate(savedDateParts);

                let finalDateParts = null;
                if (savedDateObj && latestHistoryDateObj) {
                    finalDateParts = latestHistoryDateObj >= savedDateObj
                        ? latestHistoryDateParts
                        : savedDateParts;
                } else if (latestHistoryDateObj) {
                    finalDateParts = latestHistoryDateParts;
                } else if (savedDateObj) {
                    finalDateParts = savedDateParts;
                }

                if (finalDateParts && isMounted) {
                    setSelectedDate(prev => {
                        if (
                            prev.day === finalDateParts.day &&
                            prev.month === finalDateParts.month &&
                            prev.year === finalDateParts.year
                        ) {
                            return prev;
                        }
                        return finalDateParts;
                    });
                    const finalButton = `${finalDateParts.day}/${finalDateParts.month}/${finalDateParts.year}`;
                    setSelectedDateButton(finalButton);
                    localStorage.setItem('positionSoiCau_selectedDate', JSON.stringify(finalDateParts));
                    localStorage.setItem('positionSoiCau_selectedDateButton', finalButton);
                    hasRestoredInitialDate.current = true;
                } else if (savedButtonValue && isMounted) {
                    setSelectedDateButton(savedButtonValue);
                    hasRestoredInitialDate.current = true;
                }
            } catch (restoreError) {
                console.warn('[PositionSoiCau] Restore date failed:', restoreError);
            }
        };

        restoreDateFromStorageAndApi();

        return () => {
            isMounted = false;
        };
    }, [selectedDays]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem('positionSoiCau_selectedDate', JSON.stringify(selectedDate));
        } catch (storageError) {
            console.warn('[PositionSoiCau] Không thể lưu selectedDate:', storageError);
        }
    }, [selectedDate]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem('positionSoiCau_selectedDateButton', selectedDateButton);
        } catch (storageError) {
            console.warn('[PositionSoiCau] Không thể lưu selectedDateButton:', storageError);
        }
    }, [selectedDateButton]);

    const pageTitle = 'Soi Cầu Đặc Biệt Miền Bắc';
    const pageDescription = `Soi cầu bạch thủ dựa trên phân tích vị trí số trong kết quả xổ số ${selectedDays} ngày gần nhất.`;

    const renderLifetimeBlocks = useCallback(() => {
        if (lifetimeKeys.length === 0) return null;

        return (
            <div id="lifetime" className={styles.lifetimeSection}>
                {lifetimeKeys.map(lifetime => {
                    const predictions = (lifetimeData[lifetime] || []).sort(
                        (a, b) => parseInt(a.predictedNumber) - parseInt(b.predictedNumber)
                    );

                    return (
                        <div key={lifetime} className={styles.listStatistic}>
                            <p className={styles.lifetimeTitle}>Biên độ {lifetime} ngày:</p>
                            <div className={styles.lifetimeNumbers}>
                                {predictions.map((prediction, index) => {
                                    const confidenceDisplay = getConfidenceDisplay(prediction);
                                    const normalizedNumber = String(prediction.predictedNumber).padStart(2, '0');
                                    const globalIndex = positionData?.predictions?.findIndex(p =>
                                        String(p.predictedNumber).padStart(2, '0') === normalizedNumber &&
                                        p.position1 === prediction.position1 &&
                                        p.position2 === prediction.position2 &&
                                        (p.direction || 'ltr') === (prediction.direction || 'ltr')
                                    );
                                    const isHit = highlightedNumbersSet.has(normalizedNumber);
                                    const activeKey = `${lifetime}-${prediction.predictedNumber}-${prediction.position1}-${prediction.position2}`;
                                    const isActive = activeNumberKey === activeKey;
                                    
                                    let className = styles.cauxs;
                                    if (isHit) className += ` ${styles.hitPrediction}`;
                                    if (isActive) className += ` ${styles.active}`;

                                    return (
                                        <span
                                            key={`${lifetime}-${prediction.predictedNumber}-${index}`}
                                            className={className}
                                            data-lifetime={lifetime}
                                            title={`Vị trí: ${prediction.position1} + ${prediction.position2} (${confidenceDisplay}%)`}
                                            onClick={() => handleNumberClick(
                                                prediction,
                                                globalIndex !== undefined && globalIndex >= 0 ? globalIndex : index,
                                                lifetime
                                            )}
                                        >
                                            {String(prediction.predictedNumber).padStart(2, '0')}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }, [lifetimeKeys, lifetimeData, getConfidenceDisplay, handleNumberClick, positionData?.predictions, highlightedNumbersSet, activeNumberKey]);

    const renderFallbackNumbersGrid = () => {
        if (lifetimeKeys.length > 0) return null;
        if (sortedFallbackPredictions.length === 0) return null;

        return (
            <div className={styles.numbersGrid}>
                {sortedFallbackPredictions.map((prediction, index) => {
                    const normalizedNumber = String(prediction.predictedNumber).padStart(2, '0');
                    const isHit = highlightedNumbersSet.has(normalizedNumber);
                    const className = `${styles.numberBox} ${selectedPredictionId === index ? styles.active : ''} ${isHit ? styles.hitPrediction : ''}`;

                    return (
                        <div
                            key={`${prediction.predictedNumber}-${index}`}
                            className={className}
                            title={`Vị trí: ${prediction.position1} + ${prediction.position2} (${getConfidenceDisplay(prediction)}%)`}
                            onClick={() => handleNumberClick(prediction, index)}
                        >
                            {prediction.predictedNumber}
                        </div>
                    );
                })}
            </div>
        );
    };

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

                <h2 className={styles.heading}>Kết quả soi cầu ngày {positionData.analysisDate || '22/10/2025'}</h2>

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
                {!loading && renderLifetimeBlocks()}
                {loading && <SkeletonTable />}
                {!loading && positionData.predictions && positionData.predictions.length > 0 && (
                    <div className={styles.predictionsGrid}>
                        {renderFallbackNumbersGrid()}
                        {/* Box hiển thị số lượng số duy nhất */}
                        <div className={styles.statsBox}>
                            <div className={styles.statsItem}>
                                <span className={styles.statsLabel}>Dàn:</span>
                                <span className={styles.statsValue}>
                                    {(() => {
                                        const uniqueNumbers = new Set(
                                            positionData.predictions.map(p => p.predictedNumber)
                                        );
                                        return uniqueNumbers.size;
                                    })()} số
                                </span>
                            </div>
                            <div className={styles.statsItem}>
                                <span className={styles.statsLabel}>Tổng cầu:</span>
                                <span className={styles.statsValue}>{positionData.predictions.length} cầu</span>
                            </div>
                        </div>
                        {/* Danh sách số đã loại bỏ trùng */}
                        {(() => {
                            const uniqueNumbers = Array.from(
                                new Set(positionData.predictions.map(p => p.predictedNumber))
                            ).sort((a, b) => parseInt(a) - parseInt(b));
                            
                            const normalizedNumbers = uniqueNumbers.map(num => String(num).padStart(2, '0'));
                            const numbersString = normalizedNumbers.join(', ');
                            const numbersStringDash = normalizedNumbers.join('-');

                            const handleCopy = (format = 'comma') => {
                                const textToCopy = format === 'comma' ? numbersString : numbersStringDash;
                                navigator.clipboard.writeText(textToCopy).then(() => {
                                    alert(`Đã sao chép ${uniqueNumbers.length} số!`);
                                }).catch(err => {
                                    console.error('Lỗi khi sao chép:', err);
                                    // Fallback cho trình duyệt cũ
                                    const textArea = document.createElement('textarea');
                                    textArea.value = textToCopy;
                                    document.body.appendChild(textArea);
                                    textArea.select();
                                    document.execCommand('copy');
                                    document.body.removeChild(textArea);
                                    alert(`Đã sao chép ${uniqueNumbers.length} số!`);
                                });
                            };

                            return (
                                <div className={styles.numbersListBox}>
                                    <div className={styles.numbersListHeader}>
                                        <h4 className={styles.numbersListTitle}>Danh sách {uniqueNumbers.length} số:</h4>
                                        <div className={styles.copyButtons}>
                                            <button 
                                                className={styles.copyButton}
                                                onClick={() => handleCopy('comma')}
                                                title="Sao chép dạng: 00, 01, 02..."
                                            >
                                                📋 Copy (dấu phẩy)
                                            </button>
                                            <button 
                                                className={styles.copyButton}
                                                onClick={() => handleCopy('dash')}
                                                title="Sao chép dạng: 00-01-02..."
                                            >
                                                📋 Copy (dấu gạch)
                                            </button>
                                        </div>
                                    </div>
                                    <div className={styles.numbersListContent}>
                                        {normalizedNumbers.map((number, index) => {
                                            const isHit = highlightedNumbersSet.has(number);
                                            return (
                                                <span
                                                    key={`${number}-${index}`}
                                                    className={isHit ? styles.numbersListHit : ''}
                                                >
                                                    {number}
                                                    {index < normalizedNumbers.length - 1 && ', '}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })()}
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

                {/* Lịch sử dự đoán 30 ngày */}
                <PositionSoiCauHistory 
                    limit={30} 
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

export default PositionSoiCau;
