/**
 * Position Detail Box Component for Loto
 * Hiển thị chi tiết đường cầu khi click vào số trong bảng soi cầu vị trí Lô tô
 * Layout: Mỗi bảng nằm trên một hàng riêng (vertical stacking)
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styles from '../styles/positionDetailBoxLoto.module.css';
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

const PositionDetailBoxLoto = ({
    selectedNumber,
    selectedPrediction, // Prediction cụ thể được click
    positionData,
    onClose,
    isVisible,
    lotteryData,
    additionalTables = null
}) => {
    const [lotteryResults, setLotteryResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const tableContainerRef = useRef(null);
    // State để track các số đang được highlight với màu nào
    const [highlightedDigits, setHighlightedDigits] = useState(new Map());

    // Lấy lifetime (số lần liên tiếp) từ selectedPrediction
    // Nếu không có, dùng analysisDays như cũ
    const lifetime = selectedPrediction?.lifetime || selectedPrediction?.consecutiveDays || null;
    const analysisDays = positionData?.analysisDays || 0;
    
    // Tính số ngày dữ liệu cần thiết dựa trên lifetime
    // 3 lần = 4 ngày, 4 lần = 5 ngày, ..., 10 lần = 11 ngày
    // Với logic mới, requiredDays đã đúng, không cần thêm computedAdditionalTables
    const requiredDays = lifetime ? (lifetime + 1) : analysisDays;
    const totalResultDays = requiredDays; // Sử dụng trực tiếp requiredDays, không thêm ngày dư

    if (!isVisible || !selectedNumber || !positionData) {
        return null;
    }

    // Lấy dữ liệu kết quả xổ số dựa trên requiredDays (từ lifetime hoặc analysisDays)
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
    }, [requiredDays, positionData?.analysisDate, totalResultDays, lifetime]);

    // Debug để hiểu cấu trúc prediction
    console.log('🔍 Selected Prediction:', selectedPrediction);
    console.log('🔍 Lifetime:', lifetime, 'RequiredDays:', requiredDays, 'TotalResultDays:', totalResultDays);
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

    // Tạo element cho số "cầu cho ngày hôm sau" trong box thông tin - Memoized
    const createCauHomsauElement = useCallback((tableIndex, digitIndex) => {
        // Số "cầu cho ngày hôm sau" có 2 chữ số, digitIndex: 0 hoặc 1
        return {
            elementId: `cau-homsau-${tableIndex}-digit-${digitIndex}`,
            isVirtual: false,
            isCauHomsau: true,
            tableIndex,
            digitIndex,
            position: `(cau-homsau-${tableIndex}-${digitIndex})`
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

    // Helper function để lấy số tại một vị trí từ data
    const getNumberAtPositionForHighlight = useCallback((data, position) => {
        if (!position || !data) return null;
        const { prize, elementIndex, digitIndex } = position;
        let prizeArray = [];
        if (prize === 0) prizeArray = data.specialPrize ? [data.specialPrize] : [];
        else if (prize === 1) prizeArray = data.firstPrize ? [data.firstPrize] : [];
        else if (prize === 2) prizeArray = data.secondPrize || [];
        else if (prize === 3) prizeArray = data.threePrizes || [];
        else if (prize === 4) prizeArray = data.fourPrizes || [];
        else if (prize === 5) prizeArray = data.fivePrizes || [];
        else if (prize === 6) prizeArray = data.sixPrizes || [];
        else if (prize === 7) prizeArray = data.sevenPrizes || [];
        if (elementIndex >= prizeArray.length) return null;
        const number = prizeArray[elementIndex];
        if (!number || digitIndex >= number.length) return null;
        return number[digitIndex];
    }, []);

    // Cập nhật highlightedDigits khi selectedPrediction thay đổi - Memoized để tránh tính toán lại
    const highlightedDigitsMap = useMemo(() => {
        // Lấy position strings từ selectedPrediction (hỗ trợ cả 2 format)
        const pos1Str = selectedPrediction?.position1 || selectedPrediction?.position;
        const pos2Str = selectedPrediction?.position2 || selectedPrediction?.secondPosition;
        
        if (!selectedPrediction || !position1 || !position2 || !pos1Str || !pos2Str || lotteryResults.length === 0) {
            return new Map();
        }

        const newHighlighted = new Map();
        const totalTables = lotteryResults.length;
        const blueColor = '#2563eb'; // Màu xanh dương cho position highlights
        const seaBlueColor = '#0ea5e9'; // Màu xanh nước biển cho số đã về
        
        // Chỉ highlight position1 và position2 ở mỗi bảng với màu xanh dương
        for (let i = 0; i < totalTables; i++) {
            const pos1Key = `table-${i}-prize-${position1.prize}-element-${position1.elementIndex}-digit-${position1.digitIndex}`;
            const pos2Key = `table-${i}-prize-${position2.prize}-element-${position2.elementIndex}-digit-${position2.digitIndex}`;
            newHighlighted.set(pos1Key, { color: blueColor, type: 'source', isPosition: true });
            newHighlighted.set(pos2Key, { color: blueColor, type: 'source', isPosition: true });
        }
        
        // Highlight các số có 2 số cuối trùng với "cầu cho ngày hôm sau" trong bảng ngày sau đó
        const direction = selectedPrediction?.direction;
        if (direction) {
            for (let i = 0; i < totalTables; i++) {
                const currentData = lotteryResults[i];
                if (!currentData) continue;
                
                // Tính "cầu cho ngày hôm sau" từ position1 và position2 của bảng hiện tại
                const pos1Number = getNumberAtPositionForHighlight(currentData, position1);
                const pos2Number = getNumberAtPositionForHighlight(currentData, position2);
                
                if (pos1Number !== null && pos2Number !== null) {
                    let cauHomsau = null;
                    if (direction === 'ltr') {
                        cauHomsau = pos2Number + pos1Number;
                    } else if (direction === 'rtl') {
                        cauHomsau = pos1Number + pos2Number;
                    }
                    
                    if (cauHomsau) {
                        // Tìm bảng ngày sau đó (tableIndex - 1, vì bảng mới nhất ở index 0)
                        const nextDayTableIndex = i - 1;
                        if (nextDayTableIndex >= 0 && nextDayTableIndex < totalTables) {
                            const nextDayData = lotteryResults[nextDayTableIndex];
                            if (nextDayData) {
                                const cauHomsauReverse = cauHomsau.split('').reverse().join('');
                                
                                // Helper function để highlight 2 số cuối của một số
                                const highlightLastTwoDigits = (number, prize, elementIndex) => {
                                    if (number && number.length >= 2) {
                                        const digit3Index = number.length - 2;
                                        const digit4Index = number.length - 1;
                                        const key3 = `table-${nextDayTableIndex}-prize-${prize}-element-${elementIndex}-digit-${digit3Index}`;
                                        const key4 = `table-${nextDayTableIndex}-prize-${prize}-element-${elementIndex}-digit-${digit4Index}`;
                                        newHighlighted.set(key3, { color: seaBlueColor, type: 'target', isCauDaVe: true });
                                        newHighlighted.set(key4, { color: seaBlueColor, type: 'target', isCauDaVe: true });
                                    }
                                };
                                
                                // Duyệt qua từng giải và từng số trong giải
                                // Giải đặc biệt
                                if (nextDayData.specialPrize) {
                                    const lastTwo = nextDayData.specialPrize.slice(-2).padStart(2, '0');
                                    if (lastTwo === cauHomsau || lastTwo === cauHomsauReverse) {
                                        highlightLastTwoDigits(nextDayData.specialPrize, 0, 0);
                                    }
                                }
                                
                                // Giải nhất
                                if (nextDayData.firstPrize) {
                                    const lastTwo = nextDayData.firstPrize.slice(-2).padStart(2, '0');
                                    if (lastTwo === cauHomsau || lastTwo === cauHomsauReverse) {
                                        highlightLastTwoDigits(nextDayData.firstPrize, 1, 0);
                                    }
                                }
                                
                                // Giải nhì
                                if (nextDayData.secondPrize) {
                                    nextDayData.secondPrize.forEach((number, elementIndex) => {
                                        const lastTwo = number.slice(-2).padStart(2, '0');
                                        if (lastTwo === cauHomsau || lastTwo === cauHomsauReverse) {
                                            highlightLastTwoDigits(number, 2, elementIndex);
                                        }
                                    });
                                }
                                
                                // Giải ba
                                if (nextDayData.threePrizes) {
                                    nextDayData.threePrizes.forEach((number, elementIndex) => {
                                        const lastTwo = number.slice(-2).padStart(2, '0');
                                        if (lastTwo === cauHomsau || lastTwo === cauHomsauReverse) {
                                            highlightLastTwoDigits(number, 3, elementIndex);
                                        }
                                    });
                                }
                                
                                // Giải tư
                                if (nextDayData.fourPrizes) {
                                    nextDayData.fourPrizes.forEach((number, elementIndex) => {
                                        const lastTwo = number.slice(-2).padStart(2, '0');
                                        if (lastTwo === cauHomsau || lastTwo === cauHomsauReverse) {
                                            highlightLastTwoDigits(number, 4, elementIndex);
                                        }
                                    });
                                }
                                
                                // Giải năm
                                if (nextDayData.fivePrizes) {
                                    nextDayData.fivePrizes.forEach((number, elementIndex) => {
                                        const lastTwo = number.slice(-2).padStart(2, '0');
                                        if (lastTwo === cauHomsau || lastTwo === cauHomsauReverse) {
                                            highlightLastTwoDigits(number, 5, elementIndex);
                                        }
                                    });
                                }
                                
                                // Giải sáu
                                if (nextDayData.sixPrizes) {
                                    nextDayData.sixPrizes.forEach((number, elementIndex) => {
                                        const lastTwo = number.slice(-2).padStart(2, '0');
                                        if (lastTwo === cauHomsau || lastTwo === cauHomsauReverse) {
                                            highlightLastTwoDigits(number, 6, elementIndex);
                                        }
                                    });
                                }
                                
                                // Giải bảy
                                if (nextDayData.sevenPrizes) {
                                    nextDayData.sevenPrizes.forEach((number, elementIndex) => {
                                        const lastTwo = number.slice(-2).padStart(2, '0');
                                        if (lastTwo === cauHomsau || lastTwo === cauHomsauReverse) {
                                            highlightLastTwoDigits(number, 7, elementIndex);
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
        
        return newHighlighted;
    }, [selectedPrediction?.position1, selectedPrediction?.position2, selectedPrediction?.position, selectedPrediction?.secondPosition, selectedPrediction?.direction, position1, position2, lotteryResults, getNumberAtPositionForHighlight]);

    // Sync với state để trigger re-render khi cần
    useEffect(() => {
        setHighlightedDigits(highlightedDigitsMap);
    }, [highlightedDigitsMap]);

    // Helper function để tạo highlight style - Memoized để tránh tạo object mới mỗi lần
    const getHighlightStyle = useCallback((highlightInfo) => {
        if (!highlightInfo) return {};
        const style = {
            backgroundColor: highlightInfo.color,
            color: '#ffffff',
            border: `2px solid ${highlightInfo.color}`,
            borderRadius: '4px',
            padding: '2px 4px',
            fontWeight: 'bold'
        };
        // Chỉ thêm box-shadow cho các highlight không phải là cầu đã về (màu xanh nước biển)
        if (!highlightInfo.isCauDaVe) {
            style.boxShadow = `0 0 8px ${highlightInfo.color}`;
        }
        return style;
    }, []);

    // Tính toán arrows ở top level - không được đặt trong renderHighlightedTable()
    const arrows = useMemo(() => {
        // Hỗ trợ cả 2 format position
        const pos1Str = selectedPrediction?.position1 || selectedPrediction?.position;
        const pos2Str = selectedPrediction?.position2 || selectedPrediction?.secondPosition;
        
        if (!pos1Str || !pos2Str || !position1 || !position2) {
            return null;
        }
        
        if (lotteryResults.length === 0) {
            return null;
        }

        const arrowElements = [];
        const blueColor = '#2563eb'; // Màu xanh dương cho arrows nối position1 và position2
        
        // Chỉ nối position1 và position2 trong cùng 1 bảng
        for (let tableIndex = 0; tableIndex < lotteryResults.length; tableIndex++) {
            const sourcePos1 = createElementFromPosition(position1, tableIndex);
            const sourcePos2 = createElementFromPosition(position2, tableIndex);
            
            if (sourcePos1 && sourcePos2) {
                // Nối từ position1 đến position2 trong cùng bảng
                arrowElements.push(
                    <CellConnectionArrow
                        key={`arrow-pos1-to-pos2-${tableIndex}-${pos1Str}-${pos2Str}`}
                        sourceElement={sourcePos1}
                        targetElement={sourcePos2}
                        tableContainerRef={tableContainerRef}
                        color={blueColor}
                    />
                );
            }
        }
        
        return arrowElements.length > 0 ? arrowElements : null;
    }, [selectedPrediction?.position1, selectedPrediction?.position2, selectedPrediction?.position, selectedPrediction?.secondPosition, position1, position2, lotteryResults.length, createElementFromPosition, tableContainerRef]);

    // Function để kiểm tra xem có nên highlight số không
    const shouldHighlight = (prizeRow, elementIndex, digitIndex, tableIndex) => {
        // Kiểm tra prediction cụ thể được click
        const pos1 = parsePosition(selectedPrediction.position1);
        const pos2 = parsePosition(selectedPrediction.position2);

        if (!pos1 && !pos2) return false;

        const match1 = pos1 &&
            pos1.prize === prizeRow &&
            pos1.elementIndex === elementIndex &&
            pos1.digitIndex === digitIndex;

        const match2 = pos2 &&
            pos2.prize === prizeRow &&
            pos2.elementIndex === elementIndex &&
            pos2.digitIndex === digitIndex;

        return match1 || match2;
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

        // Function to get day of week
        const getDayOfWeek = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString.split('/').reverse().join('-'));
            const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
            return days[date.getDay()];
        };

        // Function để extract tất cả 2 số cuối từ tất cả các giải
        const extractLastTwoDigits = (data) => {
            const lastTwoDigits = [];
            
            // Giải đặc biệt
            if (data.specialPrize) {
                const lastTwo = data.specialPrize.slice(-2).padStart(2, '0');
                lastTwoDigits.push(lastTwo);
            }
            
            // Giải nhất
            if (data.firstPrize) {
                const lastTwo = data.firstPrize.slice(-2).padStart(2, '0');
                lastTwoDigits.push(lastTwo);
            }
            
            // Giải nhì
            data.secondPrize?.forEach(prize => {
                if (prize) {
                    const lastTwo = prize.slice(-2).padStart(2, '0');
                    lastTwoDigits.push(lastTwo);
                }
            });
            
            // Giải ba
            data.threePrizes?.forEach(prize => {
                if (prize) {
                    const lastTwo = prize.slice(-2).padStart(2, '0');
                    lastTwoDigits.push(lastTwo);
                }
            });
            
            // Giải tư
            data.fourPrizes?.forEach(prize => {
                if (prize) {
                    const lastTwo = prize.slice(-2).padStart(2, '0');
                    lastTwoDigits.push(lastTwo);
                }
            });
            
            // Giải năm
            data.fivePrizes?.forEach(prize => {
                if (prize) {
                    const lastTwo = prize.slice(-2).padStart(2, '0');
                    lastTwoDigits.push(lastTwo);
                }
            });
            
            // Giải sáu
            data.sixPrizes?.forEach(prize => {
                if (prize) {
                    const lastTwo = prize.slice(-2).padStart(2, '0');
                    lastTwoDigits.push(lastTwo);
                }
            });
            
            // Giải bảy
            data.sevenPrizes?.forEach(prize => {
                if (prize) {
                    const lastTwo = prize.slice(-2).padStart(2, '0');
                    lastTwoDigits.push(lastTwo);
                }
            });
            
            return lastTwoDigits;
        };

        // Function để lấy số tại một vị trí cụ thể từ data
        const getNumberAtPosition = (data, position) => {
            if (!position) return null;
            
            const { prize, elementIndex, digitIndex } = position;
            
            let prizeArray = [];
            if (prize === 0) {
                prizeArray = data.specialPrize ? [data.specialPrize] : [];
            } else if (prize === 1) {
                prizeArray = data.firstPrize ? [data.firstPrize] : [];
            } else if (prize === 2) {
                prizeArray = data.secondPrize || [];
            } else if (prize === 3) {
                prizeArray = data.threePrizes || [];
            } else if (prize === 4) {
                prizeArray = data.fourPrizes || [];
            } else if (prize === 5) {
                prizeArray = data.fivePrizes || [];
            } else if (prize === 6) {
                prizeArray = data.sixPrizes || [];
            } else if (prize === 7) {
                prizeArray = data.sevenPrizes || [];
            }
            
            if (elementIndex >= prizeArray.length) return null;
            const number = prizeArray[elementIndex];
            if (!number || digitIndex >= number.length) return null;
            
            return number[digitIndex];
        };

        // Function để render box thông tin cầu và bảng lô tô
        const renderLotoInfoBox = (data, tableIndex) => {
            const lastTwoDigits = extractLastTwoDigits(data);
            // Giữ unique nhưng giữ nguyên thứ tự (đã được sắp xếp từ giải đặc biệt đến giải 7)
            const uniqueLastTwo = [];
            const seen = new Set();
            for (const num of lastTwoDigits) {
                if (!seen.has(num)) {
                    seen.add(num);
                    uniqueLastTwo.push(num);
                }
            }
            
            // Tính toán "cầu cho ngày hôm sau" (ghép từ position1 và position2 của bảng này)
            let cauHomsau = null;
            if (position1 && position2 && selectedPrediction?.direction) {
                const pos1Number = getNumberAtPosition(data, position1);
                const pos2Number = getNumberAtPosition(data, position2);
                
                if (pos1Number !== null && pos2Number !== null) {
                    const direction = selectedPrediction.direction;
                    if (direction === 'ltr') {
                        // LTR: pos2 + pos1
                        cauHomsau = pos2Number + pos1Number;
                    } else if (direction === 'rtl') {
                        // RTL: pos1 + pos2
                        cauHomsau = pos1Number + pos2Number;
                    }
                }
            }
            
            // Tính toán "cầu hôm trước đã về" (tìm tất cả các số có 2 số cuối trùng với số đã được ghép từ position1 và position2 của bảng trước đó hoặc số ngược)
            let cauDaVe = [];
            if (tableIndex < lotteryResults.length - 1 && position1 && position2 && selectedPrediction?.direction) {
                const previousData = lotteryResults[tableIndex + 1];
                const prevPos1Number = getNumberAtPosition(previousData, position1);
                const prevPos2Number = getNumberAtPosition(previousData, position2);
                
                if (prevPos1Number !== null && prevPos2Number !== null) {
                    const direction = selectedPrediction.direction;
                    let prevCau = null;
                    if (direction === 'ltr') {
                        prevCau = prevPos2Number + prevPos1Number;
                    } else if (direction === 'rtl') {
                        prevCau = prevPos1Number + prevPos2Number;
                    }
                    
                    if (prevCau) {
                        const prevCauReverse = prevCau.split('').reverse().join('');
                        
                        // Tìm tất cả các số có 2 số cuối trùng với prevCau hoặc số ngược trong bảng hiện tại
                        // Giải đặc biệt
                        if (data.specialPrize) {
                            const lastTwo = data.specialPrize.slice(-2).padStart(2, '0');
                            if (lastTwo === prevCau || lastTwo === prevCauReverse) {
                                cauDaVe.push(lastTwo);
                            }
                        }
                        
                        // Giải nhất
                        if (data.firstPrize) {
                            const lastTwo = data.firstPrize.slice(-2).padStart(2, '0');
                            if (lastTwo === prevCau || lastTwo === prevCauReverse) {
                                cauDaVe.push(lastTwo);
                            }
                        }
                        
                        // Giải nhì
                        if (data.secondPrize) {
                            data.secondPrize.forEach(prize => {
                                if (prize) {
                                    const lastTwo = prize.slice(-2).padStart(2, '0');
                                    if (lastTwo === prevCau || lastTwo === prevCauReverse) {
                                        cauDaVe.push(lastTwo);
                                    }
                                }
                            });
                        }
                        
                        // Giải ba
                        if (data.threePrizes) {
                            data.threePrizes.forEach(prize => {
                                if (prize) {
                                    const lastTwo = prize.slice(-2).padStart(2, '0');
                                    if (lastTwo === prevCau || lastTwo === prevCauReverse) {
                                        cauDaVe.push(lastTwo);
                                    }
                                }
                            });
                        }
                        
                        // Giải tư
                        if (data.fourPrizes) {
                            data.fourPrizes.forEach(prize => {
                                if (prize) {
                                    const lastTwo = prize.slice(-2).padStart(2, '0');
                                    if (lastTwo === prevCau || lastTwo === prevCauReverse) {
                                        cauDaVe.push(lastTwo);
                                    }
                                }
                            });
                        }
                        
                        // Giải năm
                        if (data.fivePrizes) {
                            data.fivePrizes.forEach(prize => {
                                if (prize) {
                                    const lastTwo = prize.slice(-2).padStart(2, '0');
                                    if (lastTwo === prevCau || lastTwo === prevCauReverse) {
                                        cauDaVe.push(lastTwo);
                                    }
                                }
                            });
                        }
                        
                        // Giải sáu
                        if (data.sixPrizes) {
                            data.sixPrizes.forEach(prize => {
                                if (prize) {
                                    const lastTwo = prize.slice(-2).padStart(2, '0');
                                    if (lastTwo === prevCau || lastTwo === prevCauReverse) {
                                        cauDaVe.push(lastTwo);
                                    }
                                }
                            });
                        }
                        
                        // Giải bảy
                        if (data.sevenPrizes) {
                            data.sevenPrizes.forEach(prize => {
                                if (prize) {
                                    const lastTwo = prize.slice(-2).padStart(2, '0');
                                    if (lastTwo === prevCau || lastTwo === prevCauReverse) {
                                        cauDaVe.push(lastTwo);
                                    }
                                }
                            });
                        }
                    }
                }
            }
            
            // Chia uniqueLastTwo thành các hàng (7 cột mỗi hàng)
            const rows = [];
            for (let i = 0; i < uniqueLastTwo.length; i += 7) {
                rows.push(uniqueLastTwo.slice(i, i + 7));
            }
            
            return (
                <div className={styles.lotoInfoBox}>
                    <div className={styles.lotoInfoDesc}>
                        <p><b>Thông tin cầu ({data.date || ''})</b></p>
                        {cauHomsau && (
                            <p>Loto cầu cho ngày hôm sau: <b 
                                className={styles.cauHomsau}
                                id={`cau-homsau-${tableIndex}`}
                                data-element-id={`cau-homsau-${tableIndex}`}
                                style={{ 
                                    display: 'inline-block',
                                    padding: '2px 4px'
                                }}
                            >
                                {cauHomsau.split('').map((digit, idx) => (
                                    <span 
                                        key={idx}
                                        id={`cau-homsau-${tableIndex}-digit-${idx}`}
                                        data-element-id={`cau-homsau-${tableIndex}-digit-${idx}`}
                                        style={{ display: 'inline-block' }}
                                    >
                                        {digit}
                                    </span>
                                ))}
                            </b></p>
                        )}
                        {cauDaVe.length > 0 && (
                            <p>Loto cầu hôm trước đã về: {cauDaVe.map((cau, idx) => (
                                <React.Fragment key={idx}>
                                    {idx > 0 && ', '}
                                    <b className={styles.cauDaVe}>{cau}</b>
                                </React.Fragment>
                            ))}</p>
                        )}
                    </div>
                    <table className={styles.lotoTable}>
                        <tbody>
                            <tr>
                                <th colSpan="7">Lô tô</th>
                            </tr>
                            {rows.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((number, colIndex) => {
                                        const isCauLoto = cauHomsau === number || cauDaVe.includes(number);
                                        return (
                                            <td 
                                                key={colIndex} 
                                                className={isCauLoto ? styles.cauLoto : ''}
                                            >
                                                {number}
                                            </td>
                                        );
                                    })}
                                    {/* Điền các ô trống nếu hàng không đủ 7 cột */}
                                    {row.length < 7 && Array(7 - row.length).fill(null).map((_, idx) => (
                                        <td key={`empty-${idx}`}></td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        };

        // Function để render 1 bảng kết quả
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
                <div key={tableIndex} className={styles.tableWithInfo}>
                    <div className={styles.singleTable}>
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
                                                    className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(0, 0, index, tableIndex) ? styles.highlighted : ''}`}
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
                    {/* Box thông tin cầu và bảng lô tô bên phải */}
                    {renderLotoInfoBox(data, tableIndex)}
                </div>
            );
        };

        const predictionLabel = selectedPrediction?.targetPrizeLabel || 'Lô tô';
        
        // Hiển thị thông tin về biên độ
        const lifetimeText = lifetime 
            ? ` (Biên độ ${lifetime} ngày với ${requiredDays} ngày dữ liệu)`
            : '';

        return (
            <div className={styles.highlightedTable}>
                {/* Lotto Prediction Section */}
                <div className={styles.lottoPrediction}>
                    <p className={styles.lottoPredictionText}>
                        Theo cầu này{lifetimeText}, dự đoán ngày <span className={styles.predictionDate}>{positionData.analysisDate || '23/10/2025'}</span> {predictionLabel} sẽ về
                        <span className={styles.lottoNumber}> {selectedNumber || '90'}</span> hoặc <span className={styles.lottoNumber}>{selectedNumber ? selectedNumber.split('').reverse().join('') : '09'}</span>
                    </p>
                </div>

                {/* Phần kết luận và bảng kết quả */}
                <div className={styles.conclusionAndTables} ref={tableContainerRef} style={{ position: 'relative' }}>
                    {/* Render các bảng kết quả - Mỗi bảng nằm trên một hàng riêng */}
                    {/* Thứ tự: Ngày mới ở trên, ngày cũ ở dưới */}
                    <div className={styles.tablesContainer} style={{ position: 'relative' }}>
                        {lotteryResults.map((data, index) => renderSingleTable(data, index))}
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
    console.log('🎨 Rendering PositionDetailBoxLoto');
    
    return (
        <div className={styles.detailBox}>
            <div className={styles.content}>
                {renderHighlightedTable()}
            </div>
        </div>
    );
};

export default PositionDetailBoxLoto;

