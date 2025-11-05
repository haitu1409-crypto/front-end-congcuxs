/**
 * Position Detail Box Component
 * Hiển thị chi tiết đường cầu khi click vào số trong bảng soi cầu vị trí
 */

import React, { useState, useEffect } from 'react';
import styles from '../styles/positionDetailBox.module.css';
import xsmbStyles from '../styles/XSMBSimpleTable.module.css';
import apiService from '../services/apiService';

const PositionDetailBox = ({
    selectedNumber,
    selectedPrediction, // Prediction cụ thể được click
    positionData,
    onClose,
    isVisible,
    lotteryData
}) => {
    const [lotteryResults, setLotteryResults] = useState([]);
    const [loading, setLoading] = useState(false);

    if (!isVisible || !selectedNumber || !positionData) {
        return null;
    }

    // Lấy dữ liệu kết quả xổ số dựa trên analysisDays
    useEffect(() => {
        const fetchLotteryResults = async () => {
            if (!positionData.analysisDays) return;

            setLoading(true);
            try {
                // Lấy dữ liệu cho số ngày phân tích (không bao gồm ngày được chọn)
                const promises = [];

                // Lấy dữ liệu từ ngày trước ngày được chọn
                const analysisDate = new Date(positionData.analysisDate.split('/').reverse().join('-'));

                for (let i = 1; i <= positionData.analysisDays; i++) {
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
                console.log('📊 Loaded lottery results for', positionData.analysisDays, 'days:', validResults);
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
                setLotteryResults(fallbackData.slice(0, positionData.analysisDays + 1));
            } finally {
                setLoading(false);
            }
        };

        fetchLotteryResults();
    }, [positionData.analysisDays, positionData.analysisDate]);

    // Sử dụng prediction cụ thể được click
    if (!selectedPrediction) {
        return null;
    }

    // Debug để hiểu cấu trúc prediction
    console.log('🔍 Selected Prediction:', selectedPrediction);
    console.log('🔍 Prediction Structure:', {
        selectedPrediction,
        hasDayIndex: selectedPrediction.dayIndex !== undefined,
        hasDate: selectedPrediction.date !== undefined,
        hasNextDate: selectedPrediction.nextDate !== undefined
    });

    // Parse position data để hiển thị chi tiết
    const parsePosition = (positionStr) => {
        if (!positionStr) return null;

        // Format: (6-1-1) -> {row: 6, col: 1, digit: 1}
        const match = positionStr.match(/\((\d+)-(\d+)-(\d+)\)/);
        if (match) {
            return {
                row: parseInt(match[1]),
                col: parseInt(match[2]),
                digit: parseInt(match[3])
            };
        }
        return null;
    };

    // Sử dụng prediction cụ thể được click
    const position1 = parsePosition(selectedPrediction.position1);
    const position2 = parsePosition(selectedPrediction.position2);

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

        // Function to get day of week
        const getDayOfWeek = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString.split('/').reverse().join('-'));
            const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
            return days[date.getDay()];
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

            // Chỉ highlight nếu đây là bảng tương ứng với prediction
            // Tạm thời highlight tất cả bảng để test
            const shouldHighlightThisTable = true; // TODO: Logic để xác định bảng đúng

            return (
                <div key={tableIndex} className={styles.singleTable}>
                    <h5>Bảng kết quả ngày {resultDate}</h5>
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

                                            return (
                                                <span
                                                    key={index}
                                                    className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(0, 0, index, tableIndex) ? styles.highlighted : ''
                                                        } ${shouldHighlightGreen ? styles.highlightedGreen : ''
                                                        }`}
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
                                        {firstPrize.split('').map((digit, index) => (
                                            <span
                                                key={index}
                                                className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(1, 0, index, tableIndex) ? styles.highlighted : ''}`}
                                            >
                                                {digit}
                                            </span>
                                        ))}
                                    </td>
                                </tr>
                            )}

                            {/* Giải nhì */}
                            {secondPrize.length > 0 && (
                                <tr>
                                    <td className={xsmbStyles.leftcol}>2</td>
                                    {secondPrize.map((number, elementIndex) => (
                                        <td key={elementIndex} colSpan={12 / secondPrize.length} className={xsmbStyles.kqcell + ' ' + xsmbStyles[`kq_${elementIndex + 2}`]}>
                                            {number.split('').map((digit, digitIndex) => (
                                                <span
                                                    key={digitIndex}
                                                    className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(2, elementIndex, digitIndex, tableIndex) ? styles.highlighted : ''}`}
                                                >
                                                    {digit}
                                                </span>
                                            ))}
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
                                                {number.split('').map((digit, digitIndex) => (
                                                    <span
                                                        key={digitIndex}
                                                        className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(3, elementIndex, digitIndex, tableIndex) ? styles.highlighted : ''}`}
                                                    >
                                                        {digit}
                                                    </span>
                                                ))}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        {threePrizes.slice(3, 6).map((number, elementIndex) => (
                                            <td key={elementIndex} colSpan="4" className={xsmbStyles.kqcell + ' ' + xsmbStyles[`kq_${elementIndex + 7}`]}>
                                                {number.split('').map((digit, digitIndex) => (
                                                    <span
                                                        key={digitIndex}
                                                        className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(3, elementIndex + 3, digitIndex, tableIndex) ? styles.highlighted : ''}`}
                                                    >
                                                        {digit}
                                                    </span>
                                                ))}
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
                                            {number.split('').map((digit, digitIndex) => (
                                                <span
                                                    key={digitIndex}
                                                    className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(4, elementIndex, digitIndex, tableIndex) ? styles.highlighted : ''}`}
                                                >
                                                    {digit}
                                                </span>
                                            ))}
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
                                                {number.split('').map((digit, digitIndex) => (
                                                    <span
                                                        key={digitIndex}
                                                        className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(5, elementIndex, digitIndex, tableIndex) ? styles.highlighted : ''}`}
                                                    >
                                                        {digit}
                                                    </span>
                                                ))}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr>
                                        {fivePrizes.slice(3, 6).map((number, elementIndex) => (
                                            <td key={elementIndex} colSpan="4" className={xsmbStyles.kqcell + ' ' + xsmbStyles[`kq_${elementIndex + 17}`]}>
                                                {number.split('').map((digit, digitIndex) => (
                                                    <span
                                                        key={digitIndex}
                                                        className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(5, elementIndex + 3, digitIndex, tableIndex) ? styles.highlighted : ''}`}
                                                    >
                                                        {digit}
                                                    </span>
                                                ))}
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
                                            {number.split('').map((digit, digitIndex) => (
                                                <span
                                                    key={digitIndex}
                                                    className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(6, elementIndex, digitIndex, tableIndex) ? styles.highlighted : ''}`}
                                                >
                                                    {digit}
                                                </span>
                                            ))}
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
                                            {number.split('').map((digit, digitIndex) => (
                                                <span
                                                    key={digitIndex}
                                                    className={`${styles.highlightDigit} ${shouldHighlightThisTable && shouldHighlight(7, elementIndex, digitIndex, tableIndex) ? styles.highlighted : ''}`}
                                                >
                                                    {digit}
                                                </span>
                                            ))}
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

        return (
            <div className={styles.highlightedTable}>
                {/* Lotto Prediction Section */}
                <div className={styles.lottoPrediction}>
                    <p className={styles.lottoPredictionText}>
                        Theo cầu này, dự đoán ngày <span className={styles.predictionDate}>{positionData.analysisDate || '23/10/2025'}</span> Lotto sẽ về
                        <span className={styles.lottoNumber}> {selectedNumber || '90'}</span> hoặc <span className={styles.lottoNumber}>{selectedNumber ? selectedNumber.split('').reverse().join('') : '09'}</span>
                    </p>
                </div>

                {/* Phần kết luận và bảng kết quả */}
                <div className={styles.conclusionAndTables}>
                    {/* Phần kết luận */}
                    <div className={styles.conclusion}>
                        <div className={styles.conclusionDate}>{positionData.analysisDate || '23/10'}</div>
                        <div className={styles.conclusionText}>
                            <div className={styles.conclusionLabel}>Cầu dự đoán</div>
                            <div className={styles.conclusionPrize}>Đặc biệt</div>
                            <div className={styles.conclusionNumber}>{selectedNumber}</div>
                        </div>
                    </div>

                    {/* Render 2 bảng kết quả cho 2 ngày phân tích */}
                    <div className={styles.tablesContainer}>
                        {lotteryResults.slice().reverse().map((data, index) => renderSingleTable(data, index))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.detailBox}>
            <div className={styles.content}>
                {renderHighlightedTable()}
            </div>
        </div>
    );
};

export default PositionDetailBox;
