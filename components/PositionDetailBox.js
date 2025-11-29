/**
 * Position Detail Box Component
 * Hiển thị chi tiết đường cầu khi click vào số trong bảng soi cầu vị trí
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styles from '../styles/positionDetailBox.module.css';
import xsmbStyles from '../styles/XSMBSimpleTable.module.css';
import apiService from '../services/apiService';
import CellConnectionArrow from './CellConnectionArrow';

// Màu sắc cho 4 mũi tên
const ARROW_COLORS = [
    '#c80505', // Đỏ - Group 1
    '#2563eb', // Xanh dương - Group 2
    '#059669', // Xanh lá - Group 3
    '#7c3aed', // Tím - Group 4
];

const PositionDetailBox = ({
    selectedNumber,
    selectedPrediction, // Prediction cụ thể được click
    positionData,
    onClose,
    isVisible,
    lotteryData,
    variant = 'special',
    additionalTables = null
}) => {
    const [lotteryResults, setLotteryResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const tableContainerRef = useRef(null);
    // State để track các số đang được highlight với màu nào
    const [highlightedDigits, setHighlightedDigits] = useState(new Map());

    const lifetime = selectedPrediction?.lifetime || selectedPrediction?.consecutiveDays || 1;
    const requiredDays = Math.max(lifetime + 1, 2);
    const computedAdditionalTables = variant === 'loto'
        ? (additionalTables !== null ? additionalTables : (requiredDays > 2 ? 1 : 0))
        : (additionalTables || 0);
    const totalResultDays = Math.max(requiredDays + computedAdditionalTables, requiredDays);
    const tablesToRender = useMemo(() => {
        if (!lotteryResults || lotteryResults.length === 0) return [];
        return lotteryResults.slice(0, requiredDays);
    }, [lotteryResults, requiredDays]);
    const displayedTables = useMemo(() => tablesToRender.slice().reverse(), [tablesToRender]);

    if (!isVisible || !selectedNumber || !positionData) {
        return null;
    }

    // Lấy dữ liệu kết quả xổ số dựa trên analysisDays
    useEffect(() => {
        const fetchLotteryResults = async () => {
            if (!requiredDays) return;

            setLoading(true);
            try {
                // Lấy dữ liệu cho số ngày phân tích (không bao gồm ngày được chọn)
                const promises = [];

                // Lấy dữ liệu từ ngày trước ngày được chọn
                const analysisDate = new Date(positionData.analysisDate.split('/').reverse().join('-'));

                for (let i = 1; i <= totalResultDays; i++) {
                    const date = new Date(analysisDate);
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD

                    promises.push(
                        apiService.fetchWithCache(`/api/xsmb/results`, {
                            params: { date: dateStr, limit: 1, isComplete: true },
                            useCache: false // Disable cache to get fresh data
                        })
                    );
                }

                const results = await Promise.all(promises);
                const validResults = results
                    .filter(result => result.success && result.data.results.length > 0)
                    .map(result => result.data.results[0])
                    .map(result => ({
                        date: new Date(result.drawDate).toLocaleDateString('vi-VN'),
                        specialPrize: result.specialPrize?.[0] || '',
                        firstPrize: result.firstPrize?.[0] || '',
                        secondPrize: result.secondPrize || [],
                        threePrizes: result.threePrizes || [],
                        fourPrizes: result.fourPrizes || [],
                        fivePrizes: result.fivePrizes || [],
                        sixPrizes: result.sixPrizes || [],
                        sevenPrizes: result.sevenPrizes || []
                    }));

                setLotteryResults(validResults);
                console.log('📊 Loaded lottery results for', totalResultDays, 'days:', validResults);
            } catch (error) {
                console.error('❌ Error fetching lottery results:', error);
                // Fallback to sample data if API fails
                const fallbackData = [
                    {
                        date: "21/10/2025",
                        specialPrize: "07081",
                        firstPrize: "66797",
                        secondPrize: ["13815", "27581"],
                        threePrizes: ["00249", "06272", "45716", "96445", "23245", "42742"],
                        fourPrizes: ["2280", "1567", "2908", "2876"],
                        fivePrizes: ["3679", "0541", "1243", "5257", "5004", "6838"],
                        sixPrizes: ["391", "303", "160"],
                        sevenPrizes: ["28", "81", "70", "38"]
                    },
                    {
                        date: "20/10/2025",
                        specialPrize: "32372",
                        firstPrize: "39001",
                        secondPrize: ["85080", "13074"],
                        threePrizes: ["39550", "70090", "41050", "80771", "34896", "86195"],
                        fourPrizes: ["1305", "1952", "9864", "1984"],
                        fivePrizes: ["7522", "5300", "6671", "0408", "1568", "7407"],
                        sixPrizes: ["314", "489", "496"],
                        sevenPrizes: ["59", "97", "74", "61"]
                    },
                    {
                        date: "19/10/2025",
                        specialPrize: "12966",
                        firstPrize: "83647",
                        secondPrize: ["24249", "24402"],
                        threePrizes: ["90577", "20176", "71938", "60207", "66327", "56028"],
                        fourPrizes: ["6053", "6618", "4370", "9212"],
                        fivePrizes: ["0850", "3511", "7941", "1264", "4826", "8778"],
                        sixPrizes: ["380", "566", "969"],
                        sevenPrizes: ["22", "60", "48", "55"]
                    }
                ];
                setLotteryResults(fallbackData.slice(0, totalResultDays + 1));
            } finally {
                setLoading(false);
            }
        };

        fetchLotteryResults();
    }, [requiredDays, positionData?.analysisDate, totalResultDays]);

    // Debug để hiểu cấu trúc prediction
    console.log('🔍 Selected Prediction:', selectedPrediction);
    console.log('🔍 isVisible:', isVisible, 'selectedNumber:', selectedNumber, 'positionData:', positionData);

    // Kiểm tra selectedPrediction - chỉ return null nếu không có selectedPrediction
    if (!selectedPrediction) {
        console.log('⚠️ No selectedPrediction, returning null');
        return null;
    }

    console.log('🔍 Prediction Structure:', {
        selectedPrediction,
        position1: selectedPrediction?.position1,
        position2: selectedPrediction?.position2,
        hasDayIndex: selectedPrediction?.dayIndex !== undefined,
        hasDate: selectedPrediction?.date !== undefined,
        hasNextDate: selectedPrediction?.nextDate !== undefined
    });

    // Parse position data để hiển thị chi tiết - Memoized để tránh parse lại
    const parsePosition = useCallback((positionStr) => {
        if (!positionStr) return null;

        // Format: (6-1-1) -> {prize: 6, elementIndex: 1, digitIndex: 1}
        // Trong context này: row = prize (giải), col = elementIndex (số thứ mấy trong giải), digit = digitIndex (vị trí chữ số)
        const match = positionStr.match(/\((\d+)-(\d+)-(\d+)\)/);
        if (match) {
            return {
                prize: parseInt(match[1]),           // Giải (0-7)
                elementIndex: parseInt(match[2]),    // Số thứ mấy trong giải (0-based)
                digitIndex: parseInt(match[3])        // Vị trí chữ số trong số (0-based)
            };
        }
        return null;
    }, []);

    // Tạo element object cho CellConnectionArrow từ position - Memoized
    const createElementFromPosition = useCallback((position, tableIndex) => {
        if (!position) return null;

        // Tạo unique ID cho element này để CellConnectionArrow có thể tìm được
        // Format: table-{tableIndex}-prize-{prize}-element-{elementIndex}-digit-{digitIndex}
        const elementId = `table-${tableIndex}-prize-${position.prize}-element-${position.elementIndex}-digit-${position.digitIndex}`;

        return {
            elementId,
            prize: position.prize,
            elementIndex: position.elementIndex,
            digitIndex: position.digitIndex,
            tableIndex,
            isVirtual: false,
            position: `(${position.prize}-${position.elementIndex}-${position.digitIndex})`
        };
    }, []);

    // Tạo element cho 2 số cuối giải đặc biệt ở bảng cụ thể - Memoized
    const createSpecialPrizeLastTwoDigitsElement = useCallback((tableIndex, digitIndex) => {
        // digitIndex: 0 = số thứ 4, 1 = số thứ 5 (2 số cuối)
        const elementId = `table-${tableIndex}-prize-0-element-0-digit-${3 + digitIndex}`;
        return {
            elementId,
            prize: 0,
            elementIndex: 0,
            digitIndex: 3 + digitIndex, // 2 số cuối = index 3 và 4
            tableIndex,
            isVirtual: false,
            position: `(0-0-${3 + digitIndex})`
        };
    }, []);

    // Tạo element cho số dự đoán (conclusionNumber) - Memoized
    const createPredictionElement = useCallback((digitIndex) => {
        // Số dự đoán có 2 chữ số, digitIndex: 0 hoặc 1
        return {
            elementId: `prediction-digit-${digitIndex}`,
            isVirtual: false,
            isPrediction: true,
            digitIndex,
            position: `(prediction-${digitIndex})`
        };
    }, []);

    // Sử dụng prediction cụ thể được click - Memoized để tránh parse lại
    // Hỗ trợ cả position1/position2 và position/secondPosition
    const position1 = useMemo(() => {
        const posStr = selectedPrediction?.position1 || selectedPrediction?.position;
        return posStr ? parsePosition(posStr) : null;
    }, [selectedPrediction?.position1, selectedPrediction?.position, parsePosition]);

    const position2 = useMemo(() => {
        const posStr = selectedPrediction?.position2 || selectedPrediction?.secondPosition;
        return posStr ? parsePosition(posStr) : null;
    }, [selectedPrediction?.position2, selectedPrediction?.secondPosition, parsePosition]);

    // Cập nhật highlightedDigits khi selectedPrediction thay đổi - Memoized để tránh tính toán lại
    // Helper function để tạo highlight style - Memoized để tránh tạo object mới mỗi lần
    const getHighlightStyle = useCallback((highlightInfo) => {
        if (!highlightInfo) return {};
        return {
            backgroundColor: highlightInfo.color,
            color: '#ffffff',
            border: `2px solid ${highlightInfo.color}`,
            borderRadius: '4px',
            padding: '2px 4px',
            fontWeight: 'bold',
            boxShadow: `0 0 8px ${highlightInfo.color}`
        };
    }, []);

    const highlightedDigitsMap = useMemo(() => {
        const pos1Str = selectedPrediction?.position1 || selectedPrediction?.position;
        const pos2Str = selectedPrediction?.position2 || selectedPrediction?.secondPosition;

        if (!selectedPrediction || !position1 || !position2 || !pos1Str || !pos2Str || displayedTables.length < 2) {
            return new Map();
        }

        const highlighted = new Map();
        const tablesCount = displayedTables.length;
        const transitions = Math.min(lifetime, tablesCount - 1);

        if (transitions < 1) {
            return highlighted;
        }

        const transitionColors = [
            [ARROW_COLORS[0], ARROW_COLORS[1]],
            [ARROW_COLORS[2], ARROW_COLORS[3]],
            ['#f97316', '#0ea5e9']
        ];

        for (let i = 0; i < transitions; i++) {
            const sourceIndex = i;
            const targetIndex = i + 1;
            const [color1, color2] = transitionColors[i % transitionColors.length];

            const source1Key = `table-${sourceIndex}-prize-${position1.prize}-element-${position1.elementIndex}-digit-${position1.digitIndex}`;
            highlighted.set(source1Key, { color: color1, type: 'source' });
            const target1Key = `table-${targetIndex}-prize-0-element-0-digit-3`;
            highlighted.set(target1Key, { color: color1, type: 'target' });

            const source2Key = `table-${sourceIndex}-prize-${position2.prize}-element-${position2.elementIndex}-digit-${position2.digitIndex}`;
            highlighted.set(source2Key, { color: color2, type: 'source' });
            const target2Key = `table-${targetIndex}-prize-0-element-0-digit-4`;
            highlighted.set(target2Key, { color: color2, type: 'target' });
        }

        const finalTableIndex = transitions;
        const source3Key = `table-${finalTableIndex}-prize-${position1.prize}-element-${position1.elementIndex}-digit-${position1.digitIndex}`;
        highlighted.set(source3Key, { color: ARROW_COLORS[2], type: 'source' });
        highlighted.set('prediction-digit-0', { color: ARROW_COLORS[2], type: 'target' });

        const source4Key = `table-${finalTableIndex}-prize-${position2.prize}-element-${position2.elementIndex}-digit-${position2.digitIndex}`;
        highlighted.set(source4Key, { color: ARROW_COLORS[3], type: 'source' });
        highlighted.set('prediction-digit-1', { color: ARROW_COLORS[3], type: 'target' });

        return highlighted;
    }, [
        selectedPrediction?.position1,
        selectedPrediction?.position2,
        selectedPrediction?.position,
        selectedPrediction?.secondPosition,
        position1,
        position2,
        displayedTables.length,
        lifetime
    ]);

    const renderPredictionDigits = useCallback(() => {
        if (!selectedNumber) return null;
        return selectedNumber.split('').map((digit, index) => {
            const elementId = `prediction-digit-${index}`;
            const highlightInfo = highlightedDigitsMap.get(elementId);
            const baseStyle = {
                display: 'inline-block',
                position: 'relative',
                zIndex: 1001
            };
            const highlightStyle = highlightInfo
                ? {
                    ...baseStyle,
                    ...getHighlightStyle(highlightInfo),
                    padding: '4px 8px'
                }
                : baseStyle;
            return (
                <span
                    key={index}
                    data-element-id={elementId}
                    data-prediction-digit-index={index}
                    style={highlightStyle}
                >
                    {digit}
                </span>
            );
        });
    }, [selectedNumber, highlightedDigitsMap, getHighlightStyle]);

    // Sync với state để trigger re-render khi cần
    useEffect(() => {
        setHighlightedDigits(highlightedDigitsMap);
    }, [highlightedDigitsMap]);

    // Tính toán arrows ở top level - không được đặt trong renderHighlightedTable()
    const arrows = useMemo(() => {
        // Hỗ trợ cả 2 format position
        const pos1Str = selectedPrediction?.position1 || selectedPrediction?.position;
        const pos2Str = selectedPrediction?.position2 || selectedPrediction?.secondPosition;

        if (!pos1Str || !pos2Str || !position1 || !position2) {
            return null;
        }

        // Với cầu 2 lần liên tiếp, chỉ highlight số, không vẽ mũi tên
        if ((selectedPrediction?.lifetime || selectedPrediction?.consecutiveDays || 1) >= 2) {
            return null;
        }

        const tables = displayedTables;
        if (tables.length < 2) {
            return null;
        }

        const transitions = Math.min(lifetime, tables.length - 1);
        if (transitions < 1) {
            return null;
        }

        const transitionColors = [
            [ARROW_COLORS[0], ARROW_COLORS[1]],
            [ARROW_COLORS[2], ARROW_COLORS[3]],
            ['#f97316', '#0ea5e9']
        ];
        const arrowElements = [];

        for (let i = 0; i < transitions; i++) {
            const sourceIndex = i;
            const targetIndex = i + 1;
            const [color1, color2] = transitionColors[i % transitionColors.length];

            const source1 = createElementFromPosition(position1, sourceIndex);
            const target1 = createSpecialPrizeLastTwoDigitsElement(targetIndex, 0);
            if (source1 && target1) {
                arrowElements.push(
                    <CellConnectionArrow
                        key={`arrow-step-${i}-pos1-${selectedNumber}`}
                        sourceElement={source1}
                        targetElement={target1}
                        tableContainerRef={tableContainerRef}
                        color={color1}
                    />
                );
            }

            const source2 = createElementFromPosition(position2, sourceIndex);
            const target2 = createSpecialPrizeLastTwoDigitsElement(targetIndex, 1);
            if (source2 && target2) {
                arrowElements.push(
                    <CellConnectionArrow
                        key={`arrow-step-${i}-pos2-${selectedNumber}`}
                        sourceElement={source2}
                        targetElement={target2}
                        tableContainerRef={tableContainerRef}
                        color={color2}
                    />
                );
            }
        }

        const finalTableIndex = transitions;
        const source3 = createElementFromPosition(position1, finalTableIndex);
        const target3 = createPredictionElement(0);
        if (source3 && target3) {
            arrowElements.push(
                <CellConnectionArrow
                    key={`arrow-final-pos1-${selectedNumber}`}
                    sourceElement={source3}
                    targetElement={target3}
                    tableContainerRef={tableContainerRef}
                    color={ARROW_COLORS[2]}
                />
            );
        }

        const source4 = createElementFromPosition(position2, finalTableIndex);
        const target4 = createPredictionElement(1);
        if (source4 && target4) {
            arrowElements.push(
                <CellConnectionArrow
                    key={`arrow-final-pos2-${selectedNumber}`}
                    sourceElement={source4}
                    targetElement={target4}
                    tableContainerRef={tableContainerRef}
                    color={ARROW_COLORS[3]}
                />
            );
        }

        return arrowElements.length > 0 ? arrowElements : null;
    }, [
        selectedPrediction?.position1,
        selectedPrediction?.position2,
        selectedPrediction?.position,
        selectedPrediction?.secondPosition,
        selectedNumber,
        position1,
        position2,
        displayedTables,
        lifetime,
        createElementFromPosition,
        createSpecialPrizeLastTwoDigitsElement,
        createPredictionElement,
        tableContainerRef
    ]);

    // Debug log để kiểm tra dữ liệu
    console.log('🔍 Position Data:', {
        selectedNumber,
        selectedPrediction: selectedPrediction,
        position1: selectedPrediction.position1,
        position2: selectedPrediction.position2,
        parsedPosition1: position1,
        parsedPosition2: position2
    });

    // Debug chi tiết parsed positions
    console.log('🔍 Parsed Details:', {
        position1: position1 ? `Row: ${position1.row}, Col: ${position1.col}, Digit: ${position1.digit}` : 'null',
        position2: position2 ? `Row: ${position2.row}, Col: ${position2.col}, Digit: ${position2.digit}` : 'null'
    });

    // Debug lottery data structure
    console.log('🔍 Lottery Data Structure:', {
        fourPrizes: lotteryData?.fourPrizes,
        sevenPrizes: lotteryData?.sevenPrizes,
        note: 'Need to understand how to map element to actual position in table'
    });

    // Function để highlight số trong bảng kết quả
    const highlightNumberInTable = (row, col, digit) => {
        // Logic để highlight số trong bảng kết quả
        // Sẽ được implement trong component cha
        console.log(`Highlighting: Row ${row}, Col ${col}, Digit ${digit}`);
    };

    // Function để kiểm tra xem có nên highlight số không
    const shouldHighlight = (prizeRow, elementIndex, digitIndex, tableIndex) => {
        // Kiểm tra prediction cụ thể được click
        const pos1 = parsePosition(selectedPrediction.position1);
        const pos2 = parsePosition(selectedPrediction.position2);

        if (!pos1 && !pos2) return false;

        // Kiểm tra cả 2 vị trí tạo cầu
        // Format: (prize-element-index) -> prize = giải, element = số thứ mấy trong giải, index = vị trí chữ số trong số
        // Cần tìm: giải đúng, số thứ đúng trong giải, và chữ số ở vị trí đúng

        // Logic chính xác theo back-end:
        // position.row = prize (giải)
        // position.col = element (số thứ mấy trong giải, 0-based)
        // position.digit = index (vị trí chữ số trong số, 0-based)

        const match1 = pos1 &&
            pos1.row === prizeRow &&
            pos1.col === elementIndex &&
            pos1.digit === digitIndex;

        const match2 = pos2 &&
            pos2.row === prizeRow &&
            pos2.col === elementIndex &&
            pos2.digit === digitIndex;

        // Debug log khi có match
        if (match1 || match2) {
            console.log('🎯 FOUND EXACT MATCH:', {
                prizeRow,
                elementIndex,
                digitIndex,
                tableIndex,
                selectedPrediction: selectedPrediction,
                position1: pos1 ? `${pos1.row}-${pos1.col}-${pos1.digit}` : 'null',
                position2: pos2 ? `${pos2.row}-${pos2.col}-${pos2.digit}` : 'null',
                match1,
                match2,
                note: 'Highlighting exact position with correct element logic'
            });
            return true; // Tìm thấy match, highlight ngay
        }

        return false; // Không tìm thấy match nào
    };

    // Function để tạo bảng kết quả với highlight sử dụng thiết kế từ XSMBSimpleTable
    const renderHighlightedTable = () => {
        if (loading) {
            return (
                <div className={styles.loading}>
                    <p>Đang tải dữ liệu kết quả xổ số...</p>
                </div>
            );
        }

        if (lotteryResults.length === 0) {
            return (
                <div className={styles.noData}>
                    <p>Không có dữ liệu kết quả xổ số</p>
                </div>
            );
        }

        const tablesSubset = displayedTables;
        if (tablesSubset.length === 0) {
            return (
                <div className={styles.noData}>
                    <p>Không có dữ liệu kết quả xổ số</p>
                </div>
            );
        }

        const getDayOfWeek = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString.split('/').reverse().join('-'));
            const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
            return days[date.getDay()];
        };

        const renderSingleTable = (data, tableIndex) => {
            const {
                date: resultDate,
                specialPrize,
                firstPrize,
                secondPrize = [],
                threePrizes = [],
                fourPrizes = [],
                fivePrizes = [],
                sixPrizes = [],
                sevenPrizes = []
            } = data;

            const shouldHighlightThisTable = true;

            return (
                <div key={tableIndex} className={styles.singleTable}>
                    <table className={xsmbStyles.ketqua} cellSpacing="1" cellPadding="9">
                        <thead>
                            <tr>
                                <th colSpan="13" className={xsmbStyles.kqcell + ' ' + xsmbStyles.kq_ngay}>
                                    {resultDate ? `Thứ ${getDayOfWeek(resultDate)} - ${resultDate}` : 'Kết quả XSMB'}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Giải đặc biệt */}
                            {specialPrize && (
                                <tr>
                                    <td className={xsmbStyles.leftcol}>ĐB</td>
                                    <td colSpan="12" className={xsmbStyles.kqcell + ' ' + xsmbStyles.kq_0}>
                                        {specialPrize.split('').map((digit, index) => {
                                            // Highlight last 2 digits in green for first table (tableIndex === 0)
                                            const isLastTwoDigits = index >= specialPrize.length - 2;
                                            const shouldHighlightGreen = shouldHighlightThisTable && tableIndex === 0 && isLastTwoDigits;

                                            // Tạo data attributes để CellConnectionArrow có thể tìm được
                                            const elementId = `table-${tableIndex}-prize-0-element-0-digit-${index}`;
                                            const highlightInfo = highlightedDigitsMap.get(elementId);
                                            const highlightStyle = getHighlightStyle(highlightInfo);

                                            return (
                                                <span
                                                    key={index}
                                                    data-element-id={elementId}
                                                    data-prize="0"
                                                    data-element-index="0"
                                                    data-digit-index={index}
                                                    data-table-index={tableIndex}
                                                    className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(0, 0, index, tableIndex) ? styles.highlighted : ''
                                                        } ${shouldHighlightGreen ? styles.highlightedGreen : ''
                                                        }`}
                                                    style={highlightStyle}
                                                >
                                                    {digit}
                                                </span>
                                            );
                                        })}
                                    </td>
                                </tr>
                            )}

                            {/* Giải nhất */}
                            {firstPrize && (
                                <tr>
                                    <td className={xsmbStyles.leftcol}>1</td>
                                    <td colSpan="12" className={xsmbStyles.kqcell + ' ' + xsmbStyles.kq_1}>
                                        {firstPrize.split('').map((digit, index) => {
                                            const elementId = `table-${tableIndex}-prize-1-element-0-digit-${index}`;
                                            const highlightInfo = highlightedDigitsMap.get(elementId);
                                            const highlightStyle = getHighlightStyle(highlightInfo);
                                            return (
                                                <span
                                                    key={index}
                                                    data-element-id={elementId}
                                                    data-prize="1"
                                                    data-element-index="0"
                                                    data-digit-index={index}
                                                    data-table-index={tableIndex}
                                                    className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(1, 0, index, tableIndex) ? styles.highlighted : ''}`}
                                                    style={highlightStyle}
                                                >
                                                    {digit}
                                                </span>
                                            );
                                        })}
                                    </td>
                                </tr>
                            )}

                            {/* Giải nhì */}
                            {secondPrize.length > 0 && (
                                <tr>
                                    <td className={xsmbStyles.leftcol}>2</td>
                                    {secondPrize.map((number, elementIndex) => (
                                        <td key={elementIndex} colSpan={12 / secondPrize.length} className={xsmbStyles.kqcell + ' ' + xsmbStyles[`kq_${elementIndex + 2}`]}>
                                            {number.split('').map((digit, digitIndex) => {
                                                const elementId = `table-${tableIndex}-prize-2-element-${elementIndex}-digit-${digitIndex}`;
                                                const highlightInfo = highlightedDigitsMap.get(elementId);
                                                const highlightStyle = getHighlightStyle(highlightInfo);
                                                return (
                                                    <span
                                                        key={digitIndex}
                                                        data-element-id={elementId}
                                                        data-prize="2"
                                                        data-element-index={elementIndex}
                                                        data-digit-index={digitIndex}
                                                        data-table-index={tableIndex}
                                                        className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(2, elementIndex, digitIndex, tableIndex) ? styles.highlighted : ''}`}
                                                        style={highlightStyle}
                                                    >
                                                        {digit}
                                                    </span>
                                                );
                                            })}
                                        </td>
                                    ))}
                                </tr>
                            )}

                            {/* Giải ba */}
                            {threePrizes.length > 0 && (
                                <>
                                    <tr>
                                        <td rowSpan="2" className={xsmbStyles.leftcol}>3</td>
                                        {threePrizes.slice(0, 3).map((number, elementIndex) => (
                                            <td key={elementIndex} colSpan="4" className={xsmbStyles.kqcell + ' ' + xsmbStyles[`kq_${elementIndex + 4}`]}>
                                                {number.split('').map((digit, digitIndex) => {
                                                    const elementId = `table-${tableIndex}-prize-3-element-${elementIndex}-digit-${digitIndex}`;
                                                    const highlightInfo = highlightedDigitsMap.get(elementId);
                                                    const highlightStyle = getHighlightStyle(highlightInfo);
                                                    return (
                                                        <span
                                                            key={digitIndex}
                                                            data-element-id={elementId}
                                                            data-prize="3"
                                                            data-element-index={elementIndex}
                                                            data-digit-index={digitIndex}
                                                            data-table-index={tableIndex}
                                                            className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(3, elementIndex, digitIndex, tableIndex) ? styles.highlighted : ''}`}
                                                            style={highlightStyle}
                                                        >
                                                            {digit}
                                                        </span>
                                                    );
                                                })}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        {threePrizes.slice(3, 6).map((number, elementIndex) => (
                                            <td key={elementIndex} colSpan="4" className={xsmbStyles.kqcell + ' ' + xsmbStyles[`kq_${elementIndex + 7}`]}>
                                                {number.split('').map((digit, digitIndex) => {
                                                    const actualElementIndex = elementIndex + 3;
                                                    const elementId = `table-${tableIndex}-prize-3-element-${actualElementIndex}-digit-${digitIndex}`;
                                                    const highlightInfo = highlightedDigitsMap.get(elementId);
                                                    const highlightStyle = getHighlightStyle(highlightInfo);
                                                    return (
                                                        <span
                                                            key={digitIndex}
                                                            data-element-id={elementId}
                                                            data-prize="3"
                                                            data-element-index={actualElementIndex}
                                                            data-digit-index={digitIndex}
                                                            data-table-index={tableIndex}
                                                            className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(3, actualElementIndex, digitIndex, tableIndex) ? styles.highlighted : ''}`}
                                                            style={highlightStyle}
                                                        >
                                                            {digit}
                                                        </span>
                                                    );
                                                })}
                                            </td>
                                        ))}
                                    </tr>
                                </>
                            )}

                            {/* Giải tư */}
                            {fourPrizes.length > 0 && (
                                <tr>
                                    <td className={xsmbStyles.leftcol}>4</td>
                                    {fourPrizes.map((number, elementIndex) => (
                                        <td key={elementIndex} colSpan="3" className={xsmbStyles.kqcell + ' ' + xsmbStyles[`kq_${elementIndex + 10}`]}>
                                            {number.split('').map((digit, digitIndex) => {
                                                const elementId = `table-${tableIndex}-prize-4-element-${elementIndex}-digit-${digitIndex}`;
                                                const highlightInfo = highlightedDigitsMap.get(elementId);
                                                const highlightStyle = getHighlightStyle(highlightInfo);
                                                return (
                                                    <span
                                                        key={digitIndex}
                                                        data-element-id={elementId}
                                                        data-prize="4"
                                                        data-element-index={elementIndex}
                                                        data-digit-index={digitIndex}
                                                        data-table-index={tableIndex}
                                                        className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(4, elementIndex, digitIndex, tableIndex) ? styles.highlighted : ''}`}
                                                        style={highlightStyle}
                                                    >
                                                        {digit}
                                                    </span>
                                                );
                                            })}
                                        </td>
                                    ))}
                                </tr>
                            )}

                            {/* Giải năm */}
                            {fivePrizes.length > 0 && (
                                <>
                                    <tr>
                                        <td rowSpan="2" className={xsmbStyles.leftcol}>5</td>
                                        {fivePrizes.slice(0, 3).map((number, elementIndex) => (
                                            <td key={elementIndex} colSpan="4" className={xsmbStyles.kqcell + ' ' + xsmbStyles[`kq_${elementIndex + 14}`]}>
                                                {number.split('').map((digit, digitIndex) => {
                                                    const elementId = `table-${tableIndex}-prize-5-element-${elementIndex}-digit-${digitIndex}`;
                                                    const highlightInfo = highlightedDigitsMap.get(elementId);
                                                    const highlightStyle = getHighlightStyle(highlightInfo);
                                                    return (
                                                        <span
                                                            key={digitIndex}
                                                            data-element-id={elementId}
                                                            data-prize="5"
                                                            data-element-index={elementIndex}
                                                            data-digit-index={digitIndex}
                                                            data-table-index={tableIndex}
                                                            className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(5, elementIndex, digitIndex, tableIndex) ? styles.highlighted : ''}`}
                                                            style={highlightStyle}
                                                        >
                                                            {digit}
                                                        </span>
                                                    );
                                                })}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        {fivePrizes.slice(3, 6).map((number, elementIndex) => (
                                            <td key={elementIndex} colSpan="4" className={xsmbStyles.kqcell + ' ' + xsmbStyles[`kq_${elementIndex + 17}`]}>
                                                {number.split('').map((digit, digitIndex) => {
                                                    const actualElementIndex = elementIndex + 3;
                                                    const elementId = `table-${tableIndex}-prize-5-element-${actualElementIndex}-digit-${digitIndex}`;
                                                    const highlightInfo = highlightedDigitsMap.get(elementId);
                                                    const highlightStyle = getHighlightStyle(highlightInfo);
                                                    return (
                                                        <span
                                                            key={digitIndex}
                                                            data-element-id={elementId}
                                                            data-prize="5"
                                                            data-element-index={actualElementIndex}
                                                            data-digit-index={digitIndex}
                                                            data-table-index={tableIndex}
                                                            className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(5, actualElementIndex, digitIndex, tableIndex) ? styles.highlighted : ''}`}
                                                            style={highlightStyle}
                                                        >
                                                            {digit}
                                                        </span>
                                                    );
                                                })}
                                            </td>
                                        ))}
                                    </tr>
                                </>
                            )}

                            {/* Giải sáu */}
                            {sixPrizes.length > 0 && (
                                <tr>
                                    <td className={xsmbStyles.leftcol}>6</td>
                                    {sixPrizes.map((number, elementIndex) => (
                                        <td key={elementIndex} colSpan="4" className={xsmbStyles.kqcell + ' ' + xsmbStyles[`kq_${elementIndex + 20}`]}>
                                            {number.split('').map((digit, digitIndex) => {
                                                const elementId = `table-${tableIndex}-prize-6-element-${elementIndex}-digit-${digitIndex}`;
                                                const highlightInfo = highlightedDigitsMap.get(elementId);
                                                const highlightStyle = getHighlightStyle(highlightInfo);
                                                return (
                                                    <span
                                                        key={digitIndex}
                                                        data-element-id={elementId}
                                                        data-prize="6"
                                                        data-element-index={elementIndex}
                                                        data-digit-index={digitIndex}
                                                        data-table-index={tableIndex}
                                                        className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(6, elementIndex, digitIndex, tableIndex) ? styles.highlighted : ''}`}
                                                        style={highlightStyle}
                                                    >
                                                        {digit}
                                                    </span>
                                                );
                                            })}
                                        </td>
                                    ))}
                                </tr>
                            )}

                            {/* Giải bảy */}
                            {sevenPrizes.length > 0 && (
                                <tr>
                                    <td className={xsmbStyles.leftcol}>7</td>
                                    {sevenPrizes.map((number, elementIndex) => (
                                        <td key={elementIndex} colSpan="3" className={xsmbStyles.kqcell + ' ' + xsmbStyles[`kq_${elementIndex + 23}`]}>
                                            {number.split('').map((digit, digitIndex) => {
                                                const elementId = `table-${tableIndex}-prize-7-element-${elementIndex}-digit-${digitIndex}`;
                                                const highlightInfo = highlightedDigitsMap.get(elementId);
                                                const highlightStyle = getHighlightStyle(highlightInfo);
                                                return (
                                                    <span
                                                        key={digitIndex}
                                                        data-element-id={elementId}
                                                        data-prize="7"
                                                        data-element-index={elementIndex}
                                                        data-digit-index={digitIndex}
                                                        data-table-index={tableIndex}
                                                        className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(7, elementIndex, digitIndex, tableIndex) ? styles.highlighted : ''}`}
                                                        style={highlightStyle}
                                                    >
                                                        {digit}
                                                    </span>
                                                );
                                            })}
                                        </td>
                                    ))}
                                </tr>
                            )}

                            <tr className={xsmbStyles.lastrow}>
                                <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            );
        };

        const predictionLabel = selectedPrediction?.targetPrizeLabel
            || (variant === 'loto' ? 'Lô tô' : 'Đặc biệt');

        return (
            <div className={styles.highlightedTable}>
                {/* Lotto Prediction Section */}
                <div className={styles.lottoPrediction}>
                    <p className={styles.lottoPredictionText}>
                        Theo cầu này, dự đoán ngày <span className={styles.predictionDate}>{positionData.analysisDate || '23/10/2025'}</span> {predictionLabel} sẽ về
                        <span className={styles.lottoNumber}> {selectedNumber || '90'}</span> hoặc <span className={styles.lottoNumber}>{selectedNumber ? selectedNumber.split('').reverse().join('') : '09'}</span>
                    </p>
                </div>

                {/* Phần kết luận và bảng kết quả */}
                <div className={styles.conclusionAndTables} ref={tableContainerRef} style={{ position: 'relative' }}>
                    {/* Phần kết luận */}
                    {lifetime >= 2 ? (
                        <div className={styles.hiddenPredictionAnchor} data-prediction-element="true">
                            {renderPredictionDigits()}
                        </div>
                    ) : (
                        <div className={styles.conclusion}>
                            <div className={styles.conclusionDate}>{positionData.analysisDate || '23/10'}</div>
                            <div className={styles.conclusionText}>
                                <div className={styles.conclusionLabel}>Cầu dự đoán</div>
                                <div className={styles.conclusionPrize}>{predictionLabel}</div>
                                <div className={styles.conclusionNumber} data-prediction-element="true">
                                    {renderPredictionDigits()}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className={styles.tablesContainer} style={{ position: 'relative' }}>
                        {tablesSubset.map((data, index) => renderSingleTable(data, index))}
                    </div>

                    {/* Vẽ 4 mũi tên theo logic đúng:
                        Group 1,2: Từ position1 và position2 ở bảng 0 -> đến 2 số cuối giải đặc biệt ở bảng 1
                        Group 3,4: Từ position1 và position2 ở bảng 1 -> đến số dự đoán */}
                    {arrows}
                </div>
            </div>
        );
    };

    // Đảm bảo component luôn render, ngay cả khi không có position1/position2
    console.log('🎨 Rendering PositionDetailBox');

    return (
        <div className={styles.detailBox}>
            <div className={styles.content}>
                {renderHighlightedTable()}
            </div>
        </div>
    );
};

export default PositionDetailBox;
