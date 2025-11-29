/**
 * Position Soi Cau History Component
 * Hiển thị lịch sử dự đoán soi cầu vị trí dưới dạng bảng đầy đủ
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiService from '../services/apiService';
import styles from '../styles/PositionSoiCauHistory.module.css';

const PositionSoiCauHistory = ({
    limit = 30,
    days = 2,
    refreshTrigger = 0,
    mobileModalControlled = false,
    mobileModalOpen = false,
    onMobileModalClose = () => {},
}) => {
    const [allHistory, setAllHistory] = useState([]); // Store all fetched history
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    
    // Get current month/year as default
    const getCurrentMonthYear = () => {
        const now = new Date();
        return {
            month: (now.getMonth() + 1).toString().padStart(2, '0'),
            year: now.getFullYear().toString()
        };
    };
    
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear().month);
    const [selectedYear, setSelectedYear] = useState(getCurrentMonthYear().year);

    // Fetch history
    const fetchHistory = useCallback(async (bypassCache = false) => {
        try {
            setLoading(true);
            setError(null);

            const response = await apiService.getPositionSoiCauHistory({
                limit: limit.toString(),
                days: days.toString()
            }, {
                useCache: !bypassCache
            });

            if (response.success) {
                setAllHistory(response.data.history || []);
            } else {
                throw new Error(response.message || 'Lỗi khi tải lịch sử');
            }
        } catch (err) {
            console.error('Position Soi Cau History fetch error:', err);
            setError(err.message || 'Không thể tải lịch sử');
        } finally {
            setLoading(false);
        }
    }, [limit, days]);

    useEffect(() => {
        fetchHistory(false);
    }, [limit, days, fetchHistory]);

    useEffect(() => {
        if (refreshTrigger > 0) {
            fetchHistory(true);
        }
    }, [refreshTrigger, fetchHistory]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!isMobile) {
            setIsHistoryModalOpen(false);
            if (mobileModalControlled && mobileModalOpen) {
                onMobileModalClose();
            }
        }
    }, [isMobile, mobileModalControlled, mobileModalOpen, onMobileModalClose]);

    const isModalOpen = isMobile && (mobileModalControlled ? mobileModalOpen : isHistoryModalOpen);

    const handleCloseModal = useCallback(() => {
        if (mobileModalControlled) {
            onMobileModalClose();
        } else {
            setIsHistoryModalOpen(false);
        }
    }, [mobileModalControlled, onMobileModalClose]);

    useEffect(() => {
        if (!isMobile) return;
        if (typeof document === 'undefined') return;

        document.body.style.overflow = isModalOpen ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobile, isModalOpen]);

    useEffect(() => {
        if (!isModalOpen) return;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                handleCloseModal();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, handleCloseModal]);
    
    // Filter history by selected month/year
    const history = useMemo(() => {
        if (!allHistory || allHistory.length === 0) return [];
        
        return allHistory.filter(record => {
            if (!record.date) return false;
            
            // Parse date from DD/MM/YYYY format
            const [day, month, year] = record.date.split('/');
            
            return month === selectedMonth && year === selectedYear;
        });
    }, [allHistory, selectedMonth, selectedYear]);
    
    // Generate month and year options
    const months = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => {
            const monthNum = i + 1;
            return {
                value: monthNum.toString().padStart(2, '0'),
                label: `Tháng ${monthNum}`
            };
        });
    }, []);
    
    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 2; // Show last 3 years
        return Array.from({ length: 3 }, (_, i) => {
            const year = startYear + i;
            return {
                value: year.toString(),
                label: year.toString()
            };
        });
    }, []);

    // Render actual result as button
    const renderActualResult = (actualResult, resultClass, matchedNumbers = [], specialPrizeLastTwo = null, record = {}) => {
        const handleResultClick = () => {
            // Có thể mở modal chi tiết nếu cần
            console.log('Xem chi tiết kết quả:', record);
        };

        if (resultClass === 'hit' && matchedNumbers.length > 0) {
            return (
                <button 
                    className={`${styles.resultButton} ${styles.hitButton}`}
                    onClick={handleResultClick}
                    title="Click để xem chi tiết"
                >
                    ✓ Trúng: <strong>{matchedNumbers.join(', ')}</strong>
                </button>
            );
        }

        if (resultClass === 'miss' && actualResult && actualResult !== '--') {
            return (
                <button 
                    className={`${styles.resultButton} ${styles.missButton}`}
                    onClick={handleResultClick}
                    title="Click để xem chi tiết"
                >
                    ✗ Không trúng
                </button>
            );
        }

        return (
            <button 
                className={`${styles.resultButton} ${styles.waitingButton}`}
                onClick={handleResultClick}
                title="Click để xem chi tiết"
                disabled
            >
                {actualResult}
            </button>
        );
    };

    // Render full history table
    if (loading && allHistory.length === 0) {
        return (
            <div className={styles.historyContainer}>
                <h3 className={styles.historyTitle}>Lịch sử dự đoán theo tháng</h3>
                <div className={styles.loadingText}>Đang tải...</div>
            </div>
        );
    }

    if (error && allHistory.length === 0) {
        return (
            <div className={styles.historyContainer}>
                <h3 className={styles.historyTitle}>Lịch sử dự đoán theo tháng</h3>
                <div className={styles.errorText}>Lỗi: {error}</div>
            </div>
        );
    }

    const historyContent = (
        <>
            <div className={styles.headerRow}>
                <h3 className={styles.historyTitle}>
                    Lịch sử dự đoán tháng {selectedMonth}/{selectedYear} ({history.length} bản ghi)
                </h3>
                <div className={styles.monthYearSelectors}>
                    <select
                        className={styles.monthSelector}
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        {months.map(month => (
                            <option key={month.value} value={month.value}>
                                {month.label}
                            </option>
                        ))}
                    </select>
                    <select
                        className={styles.yearSelector}
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        {years.map(year => (
                            <option key={year.value} value={year.value}>
                                {year.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className={styles.loadingContainer}>Đang tải lịch sử...</div>
            ) : error ? (
                <div className={styles.errorContainer}>Lỗi: {error}</div>
            ) : !history || history.length === 0 ? (
                <div className={styles.noDataContainer}>Chưa có dữ liệu lịch sử</div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.historyTable}>
                        <thead>
                            <tr>
                                <th>NGÀY</th>
                                <th>DỰ ĐOÁN</th>
                                <th>KẾT QUẢ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((record, index) => (
                                <tr key={index} data-status={record.resultClass}>
                                    <td className={styles.date}>
                                        {record.date}
                                        {record.analysisDays && record.analysisDays !== days && (
                                            <span className={styles.daysNote}>
                                                ({record.analysisDays} ngày)
                                            </span>
                                        )}
                                    </td>
                                    <td className={styles.predictions}>
                                        {record.predictionsCount > 0 ? (
                                            <>
                                                <strong>{record.predictionsCount} số:</strong>{' '}
                                                {record.predictions.split(', ').map((num, idx, arr) => {
                                                    const isHit = (record.matchedNumbers || []).includes(num);
                                                    return (
                                                        <span
                                                            key={`${record.date}-${num}-${idx}`}
                                                            className={isHit ? styles.predictionHit : ''}
                                                        >
                                                            {num}{idx < arr.length - 1 && ','}
                                                        </span>
                                                    );
                                                })}
                                            </>
                                        ) : (
                                            '--'
                                        )}
                                    </td>
                                    <td className={styles.resultCell}>
                                        {renderActualResult(
                                            record.actualResult,
                                            record.resultClass,
                                            record.matchedNumbers || [],
                                            record.specialPrizeLastTwo || null,
                                            record
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );

    return (
        <div className={styles.historyContainer}>
            {isMobile && !mobileModalControlled ? (
                <>
                    <button
                        className={styles.mobileHistoryTrigger}
                        onClick={() => setIsHistoryModalOpen(true)}
                        type="button"
                    >
                        Xem lịch sử soi cầu vị trí ({selectedMonth}/{selectedYear})
                    </button>

                    {isModalOpen && (
                        <div
                            className={`${styles.modalOverlay} ${styles.modalOverlayMobile}`}
                            role="dialog"
                            aria-modal="true"
                            onClick={handleCloseModal}
                        >
                            <div
                                className={`${styles.modalContent} ${styles.modalContentMobile}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={styles.modalHeader}>
                                    <h3 className={styles.modalTitle}>Lịch sử dự đoán</h3>
                                    <button
                                        className={styles.modalCloseButton}
                                        onClick={handleCloseModal}
                                        aria-label="Đóng lịch sử"
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className={styles.modalBody}>
                                    {historyContent}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : isMobile && mobileModalControlled ? (
                isModalOpen && (
                    <div
                        className={`${styles.modalOverlay} ${styles.modalOverlayMobile}`}
                        role="dialog"
                        aria-modal="true"
                        onClick={handleCloseModal}
                    >
                        <div
                            className={`${styles.modalContent} ${styles.modalContentMobile}`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <h3 className={styles.modalTitle}>Lịch sử dự đoán</h3>
                                <button
                                    className={styles.modalCloseButton}
                                    onClick={handleCloseModal}
                                    aria-label="Đóng lịch sử"
                                >
                                    ×
                                </button>
                            </div>
                            <div className={styles.modalBody}>
                                {historyContent}
                            </div>
                        </div>
                    </div>
                )
            ) : (
                historyContent
            )}
        </div>
    );
};

export default PositionSoiCauHistory;

