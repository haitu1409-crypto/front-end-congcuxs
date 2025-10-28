/**
 * Component hiển thị 3 bảng kết quả XSMB mới nhất với button xem thêm
 */

import React, { useState } from 'react';
import styles from '../styles/XSMBSimpleTable.module.css';
import { useXSMBLatest10 } from '../hooks/useXSMBNext';

const XSMBLatest10Table = ({ page = 1, limit = 10, onPaginationChange }) => {
    const [displayedCount, setDisplayedCount] = useState(3);
    const { data: apiData, pagination, loading, error } = useXSMBLatest10({ page, limit });

    // Notify parent component of pagination changes
    React.useEffect(() => {
        if (pagination && onPaginationChange) {
            onPaginationChange(pagination);
        }
    }, [pagination, onPaginationChange]);

    // Debug log
    React.useEffect(() => {
        console.log('XSMBLatest10 data:', apiData);
        console.log('Pagination:', pagination);
        console.log('Loading:', loading);
        console.log('Error:', error);
    }, [apiData, pagination, loading, error]);

    // Use API data if available, otherwise show empty state
    const data = apiData;

    // Handle load more button
    const handleLoadMore = () => {
        setDisplayedCount(prev => Math.min(prev + 3, data?.length || 0));
    };

    // Get displayed data
    const displayedData = data?.slice(0, displayedCount) || [];

    // Loading state
    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingMessage}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải dữ liệu kết quả xổ số...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorMessage}>
                    <h3>Lỗi tải dữ liệu</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // No data state
    if (!data || !Array.isArray(data) || data.length === 0) {
        return (
            <div className={styles.container}>
                <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    background: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    borderRadius: '4px',
                    margin: '20px 0',
                    fontSize: '14px',
                    color: '#856404'
                }}>
                    <h3 style={{ marginTop: 0 }}>Đang tải dữ liệu...</h3>
                    <p>Vui lòng đợi trong giây lát hoặc kiểm tra kết nối API.</p>
                    <p style={{ marginTop: '10px', fontSize: '12px' }}>
                        API: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/xsmb/results/latest10
                    </p>
                </div>
            </div>
        );
    }

    // Function to format date
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Function to get day of week
    const getDayOfWeek = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const days = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
        return days[date.getDay()];
    };

    return (
        <div className={styles.container}>

            {displayedData.map((result, index) => {
                const {
                    drawDate,
                    specialPrize,
                    firstPrize,
                    secondPrize = [],
                    threePrizes = [],
                    fourPrizes = [],
                    fivePrizes = [],
                    sixPrizes = [],
                    sevenPrizes = [],
                    maDB = ''
                } = result;

                const formattedDate = formatDate(drawDate);
                const dayOfWeek = getDayOfWeek(drawDate);

                return (
                    <div key={index} style={{ marginBottom: '30px', borderBottom: '2px solid #ddd', paddingBottom: '20px' }}>
                        {/* Container for result table and Đầu/Đuôi tables */}
                        <div className={styles.horizontalLayout}>
                            {/* Main result table */}
                            <div className={styles.mainTableContainer}>
                                <table className={styles.ketqua} cellSpacing="1" cellPadding="9">
                                    <thead>
                                        <tr>
                                            <th colSpan="13" className={styles.kqcell + ' ' + styles.kq_ngay}>
                                                {dayOfWeek} - {formattedDate}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Giải đặc biệt */}
                                        {specialPrize && Array.isArray(specialPrize) && specialPrize.length > 0 && (
                                            <tr>
                                                <td className={styles.leftcol}>ĐB</td>
                                                <td colSpan="12" className={styles.kqcell + ' ' + styles.kq_0}>
                                                    {specialPrize[0]}
                                                </td>
                                            </tr>
                                        )}

                                        {/* Giải nhất */}
                                        {firstPrize && Array.isArray(firstPrize) && firstPrize.length > 0 && (
                                            <tr>
                                                <td className={styles.leftcol}>1</td>
                                                <td colSpan="12" className={styles.kqcell + ' ' + styles.kq_1}>
                                                    {firstPrize[0]}
                                                </td>
                                            </tr>
                                        )}

                                        {/* Giải nhì */}
                                        {secondPrize.length > 0 && (
                                            <tr>
                                                <td className={styles.leftcol}>2</td>
                                                {secondPrize.map((number, idx) => (
                                                    <td key={idx} colSpan={12 / secondPrize.length} className={styles.kqcell + ' ' + styles[`kq_${idx + 2}`]}>
                                                        {number}
                                                    </td>
                                                ))}
                                            </tr>
                                        )}

                                        {/* Giải ba */}
                                        {threePrizes.length > 0 && (
                                            <>
                                                <tr>
                                                    <td rowSpan="2" className={styles.leftcol}>3</td>
                                                    {threePrizes.slice(0, 3).map((number, idx) => (
                                                        <td key={idx} colSpan="4" className={styles.kqcell + ' ' + styles[`kq_${idx + 4}`]}>
                                                            {number}
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    {threePrizes.slice(3, 6).map((number, idx) => (
                                                        <td key={idx} colSpan="4" className={styles.kqcell + ' ' + styles[`kq_${idx + 7}`]}>
                                                            {number}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </>
                                        )}

                                        {/* Giải tư */}
                                        {fourPrizes.length > 0 && (
                                            <tr>
                                                <td className={styles.leftcol}>4</td>
                                                {fourPrizes.map((number, idx) => (
                                                    <td key={idx} colSpan="3" className={styles.kqcell + ' ' + styles[`kq_${idx + 10}`]}>
                                                        {number}
                                                    </td>
                                                ))}
                                            </tr>
                                        )}

                                        {/* Giải năm */}
                                        {fivePrizes.length > 0 && (
                                            <>
                                                <tr>
                                                    <td rowSpan="2" className={styles.leftcol}>5</td>
                                                    {fivePrizes.slice(0, 3).map((number, idx) => (
                                                        <td key={idx} colSpan="4" className={styles.kqcell + ' ' + styles[`kq_${idx + 14}`]}>
                                                            {number}
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    {fivePrizes.slice(3, 6).map((number, idx) => (
                                                        <td key={idx} colSpan="4" className={styles.kqcell + ' ' + styles[`kq_${idx + 17}`]}>
                                                            {number}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </>
                                        )}

                                        {/* Giải sáu */}
                                        {sixPrizes.length > 0 && (
                                            <tr>
                                                <td className={styles.leftcol}>6</td>
                                                {sixPrizes.map((number, idx) => (
                                                    <td key={idx} colSpan="4" className={styles.kqcell + ' ' + styles[`kq_${idx + 20}`]}>
                                                        {number}
                                                    </td>
                                                ))}
                                            </tr>
                                        )}

                                        {/* Giải bảy */}
                                        {sevenPrizes.length > 0 && (
                                            <tr>
                                                <td className={styles.leftcol}>7</td>
                                                {sevenPrizes.map((number, idx) => (
                                                    <td key={idx} colSpan="3" className={styles.kqcell + ' ' + styles[`kq_${idx + 23}`]}>
                                                        {number}
                                                    </td>
                                                ))}
                                            </tr>
                                        )}

                                        {/* Mã đặc biệt */}
                                        {maDB && (
                                            <tr>
                                                <td className={styles.leftcol}>ĐB</td>
                                                <td colSpan="12" className={styles.kqcell + ' ' + styles.kq_maDB}>
                                                    {maDB}
                                                </td>
                                            </tr>
                                        )}

                                        <tr className={styles.lastrow}>
                                            <td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Đầu and Đuôi tables container */}
                            <div className={styles.sideTablesContainer}>
                                {/* Loto Đầu Table */}
                                <table className={styles.dau}>
                                    <tbody>
                                        <tr>
                                            <th>Đầu</th>
                                            <th>&nbsp;</th>
                                        </tr>
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                                            <tr key={digit}>
                                                <td className={styles.dauDigitCol}>{digit}</td>
                                                <td className={styles[`dau_${digit}`] + ' ' + styles.dauDataCol}>
                                                    {(() => {
                                                        const lotoNumbers = [];
                                                        // Collect all numbers from all prizes
                                                        const allNumbers = [
                                                            ...(result.specialPrize || []),
                                                            ...(result.firstPrize || []),
                                                            ...(result.secondPrize || []),
                                                            ...(result.threePrizes || []),
                                                            ...(result.fourPrizes || []),
                                                            ...(result.fivePrizes || []),
                                                            ...(result.sixPrizes || []),
                                                            ...(result.sevenPrizes || [])
                                                        ];
                                                        // Get 2 last digits and check if they start with the digit
                                                        allNumbers.forEach(num => {
                                                            if (num) {
                                                                const last2 = num.toString().slice(-2);
                                                                if (last2.startsWith(digit.toString())) {
                                                                    lotoNumbers.push(last2);
                                                                }
                                                            }
                                                        });
                                                        // Remove duplicates and sort
                                                        const uniqueNumbers = [...new Set(lotoNumbers)].sort((a, b) => a - b);
                                                        return uniqueNumbers.length > 0 ? uniqueNumbers.join(', ') : '';
                                                    })()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Loto Đuôi Table */}
                                <table className={styles.dit}>
                                    <tbody>
                                        <tr>
                                            <th>Đuôi</th>
                                            <th>&nbsp;</th>
                                        </tr>
                                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                                            <tr key={digit}>
                                                <td className={styles.ditDigitCol}>{digit}</td>
                                                <td className={styles[`dit_${digit}`] + ' ' + styles.ditDataCol}>
                                                    {(() => {
                                                        const lotoNumbers = [];
                                                        // Collect all numbers from all prizes
                                                        const allNumbers = [
                                                            ...(result.specialPrize || []),
                                                            ...(result.firstPrize || []),
                                                            ...(result.secondPrize || []),
                                                            ...(result.threePrizes || []),
                                                            ...(result.fourPrizes || []),
                                                            ...(result.fivePrizes || []),
                                                            ...(result.sixPrizes || []),
                                                            ...(result.sevenPrizes || [])
                                                        ];
                                                        // Get 2 last digits and check if they end with the digit
                                                        allNumbers.forEach(num => {
                                                            if (num) {
                                                                const last2 = num.toString().slice(-2);
                                                                if (last2.endsWith(digit.toString())) {
                                                                    lotoNumbers.push(last2);
                                                                }
                                                            }
                                                        });
                                                        // Remove duplicates and sort
                                                        const uniqueNumbers = [...new Set(lotoNumbers)].sort((a, b) => a - b);
                                                        return uniqueNumbers.length > 0 ? uniqueNumbers.join(', ') : '';
                                                    })()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Load More Button */}
            {displayedCount < (data?.length || 0) && (
                <div className={styles.loadMoreContainer}>
                    <button
                        onClick={handleLoadMore}
                        className={styles.loadMoreButton}
                    >
                        Xem thêm 3 kết quả ({displayedCount + 3 <= (data?.length || 0) ? 3 : (data?.length || 0) - displayedCount} kết quả)
                    </button>
                </div>
            )}

            {/* Show all loaded message */}
            {displayedCount >= (data?.length || 0) && data && data.length > 3 && (
                <div className={styles.allLoadedMessage}>
                    Đã hiển thị tất cả {data.length} kết quả
                </div>
            )}
        </div>
    );
};

export default XSMBLatest10Table;
