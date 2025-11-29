import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiService from '../services/apiService';
import styles from '../styles/SoiCauHistory.module.css';

const getCurrentMonthYear = () => {
    const now = new Date();
    return {
        month: (now.getMonth() + 1).toString().padStart(2, '0'),
        year: now.getFullYear().toString()
    };
};

const PositionSoiCauLotoHistory = ({
    limit = 30,
    days = 4,
    refreshTrigger = 0,
    mobileModalControlled = false,
    mobileModalOpen = false,
    onMobileModalClose = () => {},
}) => {
    const [allHistory, setAllHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear().month);
    const [selectedYear, setSelectedYear] = useState(getCurrentMonthYear().year);

    // Fetch history for Position Soi Cau Loto
    const fetchHistory = useCallback(async (bypassCache = false) => {
        try {
            setLoading(true);
            setError(null);

            console.log('📥 Fetching history...', { limit, days, bypassCache });

            // Khi refreshTrigger > 0 hoặc bypassCache = true, không dùng cache để đảm bảo lấy dữ liệu mới nhất
            const response = await apiService.getPositionSoiCauLotoHistory({
                limit: limit.toString(),
                days: days.toString()
            }, {
                useCache: !bypassCache
            });

            if (response.success) {
                console.log('✅ History fetched successfully:', response.data.history?.length || 0, 'records');
                setAllHistory(response.data.history || []);
            } else {
                throw new Error(response.message || 'Lỗi khi tải lịch sử soi cầu lô tô');
            }
        } catch (err) {
            console.error('Position Soi Cau Loto History fetch error:', err);
            setError(err.message || 'Không thể tải lịch sử');
        } finally {
            setLoading(false);
        }
    }, [limit, days]);

    // Load history khi component mount hoặc limit/days thay đổi
    useEffect(() => {
        fetchHistory(false);
    }, [limit, days]); // Chỉ phụ thuộc vào limit và days

    // Refresh history khi refreshTrigger thay đổi
    useEffect(() => {
        if (refreshTrigger > 0) {
            console.log('🔄 Refreshing history due to update trigger:', refreshTrigger);
            
            // Gọi API trực tiếp để bypass cache và đảm bảo lấy dữ liệu mới nhất
            const refreshHistory = async () => {
                try {
                    setLoading(true);
                    setError(null);

                    const response = await apiService.getPositionSoiCauLotoHistory({
                        limit: limit.toString(),
                        days: days.toString()
                    }, {
                        useCache: false // Bypass cache để lấy dữ liệu mới nhất
                    });

                    if (response.success) {
                        console.log('✅ History refreshed successfully:', response.data.history?.length || 0, 'records');
                        setAllHistory(response.data.history || []);
                    } else {
                        throw new Error(response.message || 'Lỗi khi tải lịch sử soi cầu lô tô');
                    }
                } catch (err) {
                    console.error('Position Soi Cau Loto History refresh error:', err);
                    setError(err.message || 'Không thể tải lịch sử');
                } finally {
                    setLoading(false);
                }
            };

            refreshHistory();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger]); // Chỉ phụ thuộc vào refreshTrigger

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

    // Render actual result with appropriate styling
    const renderActualResult = (actualResult, resultClass, matchedNumbers = [], specialPrizeLastTwo = null) => {
        const getResultClass = (className) => {
            switch (className) {
                case 'hit':
                    return styles.matchedNumber;
                case 'miss':
                    return styles.missResult;
                case 'waiting':
                default:
                    return styles.waitingResult;
            }
        };

        if (resultClass === 'hit' && matchedNumbers.length > 0) {
            // Parse actualResult nếu có format "Trúng: X | Tất cả: Y | Trúng A/B"
            if (actualResult.includes('Trúng:') && actualResult.includes('Trúng ')) {
                const parts = actualResult.split(' | ');
                const trungPart = parts.find(p => p.startsWith('Trúng:'));
                const trungCountPart = parts.find(p => p.startsWith('Trúng '));
                
                const trungNumbersStr = trungPart ? trungPart.replace('Trúng: ', '') : '';
                const trungCount = trungCountPart ? trungCountPart.replace('Trúng ', '') : '';
                
                // Tách các số trúng và highlight số giải đặc biệt
                const trungNumbers = trungNumbersStr.split(', ').map(num => num.trim());
                
                return (
                    <span className={getResultClass(resultClass)}>
                        ✓ Trúng ({trungCount}):{' '}
                        <strong>
                            {trungNumbers.map((num, index) => {
                                const isSpecial = specialPrizeLastTwo && num === specialPrizeLastTwo;
                                return (
                                    <span key={index}>
                                        {index > 0 && ', '}
                                        <span style={isSpecial ? { color: '#dc2626', fontWeight: 700 } : {}}>
                                            {num}
                                        </span>
                                    </span>
                                );
                            })}
                        </strong>
                    </span>
                );
            }
            
            return (
                <span className={getResultClass(resultClass)}>
                    {actualResult} ✓ ({matchedNumbers.join(', ')})
                </span>
            );
        }

        if (resultClass === 'miss' && actualResult && actualResult !== '--') {
            // Parse actualResult nếu có format "X, Y, Z | Trúng 0/B"
            if (actualResult.includes('Trúng ')) {
                const parts = actualResult.split(' | ');
                const trungCountPart = parts.find(p => p.startsWith('Trúng '));
                const trungCount = trungCountPart ? trungCountPart.replace('Trúng ', '') : '';
                
                return (
                    <span className={getResultClass(resultClass)}>
                        ✗ Không trúng ({trungCount})
                    </span>
                );
            }
            
            return (
                <span className={getResultClass(resultClass)}>
                    ✗ Không trúng
                </span>
            );
        }

        return (
            <span className={getResultClass(resultClass)}>
                {actualResult}
            </span>
        );
    };

    const headingText = isMobile
        ? `Dự đoán soi cầu lô tô (${selectedMonth}/${selectedYear})`
        : `Lịch sử dự đoán soi cầu lô tô ${selectedMonth}/${selectedYear} (${days} ngày phân tích)`;

    const months = useMemo(() => (
        Array.from({ length: 12 }, (_, i) => ({
            value: (i + 1).toString().padStart(2, '0'),
            label: `Tháng ${i + 1}`
        }))
    ), []);

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 2;
        return Array.from({ length: 3 }, (_, i) => {
            const year = startYear + i;
            return {
                value: year.toString(),
                label: year.toString()
            };
        });
    }, []);

    const filteredHistory = useMemo(() => {
        if (!allHistory || allHistory.length === 0) return [];
        return allHistory.filter(record => {
            if (!record.date) return false;
            const [day, month, year] = record.date.split('/');
            return month === selectedMonth && year === selectedYear;
        });
    }, [allHistory, selectedMonth, selectedYear]);

    const historySection = useMemo(() => {
        if (loading) {
            return (
                <div className={styles.tablesRow}>
                    <div>
                        <div className={styles.headerRow}>
                            <h3 className={styles.historyTitle}>{headingText}</h3>
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
                        <div className={styles.tableWrapper}>
                            <div className={styles.loadingContainer}>
                                Đang tải lịch sử...
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className={styles.tablesRow}>
                    <div>
                        <div className={styles.headerRow}>
                            <h3 className={styles.historyTitle}>{headingText}</h3>
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
                        <div className={styles.tableWrapper}>
                            <div className={styles.errorContainer}>
                                Lỗi: {error}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (!filteredHistory || filteredHistory.length === 0) {
            return (
                <div className={styles.tablesRow}>
                    <div>
                        <div className={styles.headerRow}>
                            <h3 className={styles.historyTitle}>
                                {headingText} (0 bản ghi)
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
                        <div className={styles.tableWrapper}>
                            <div className={styles.noDataContainer}>
                                Chưa có dữ liệu lịch sử
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.tablesRow}>
                <div>
                    <div className={styles.headerRow}>
                        <h3 className={styles.historyTitle}>
                            {headingText} ({filteredHistory.length} bản ghi)
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
                    <div className={styles.tableWrapper}>
                        <table className={styles.historyTable}>
                            <thead>
                                <tr>
                                    <th>{isMobile ? 'Ngày' : 'NGÀY'}</th>
                                    <th>{isMobile ? 'Dự đoán' : 'DỰ ĐOÁN'}</th>
                                    <th>{isMobile ? 'Kết quả' : 'ĐỐI CHIẾU KẾT QUẢ'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredHistory.map((record, index) => (
                                    <tr key={index} data-status={record.resultClass}>
                                        <td className={styles.date}>
                                            {record.date}
                                            {record.analysisDays && record.analysisDays !== days && (
                                                <span style={{ fontSize: '11px', color: '#666', display: 'block' }}>
                                                    ({record.analysisDays} ngày)
                                                </span>
                                            )}
                                        </td>
                                        <td className={styles.predictions}>
                                            {record.predictionsCount > 0 ? (
                                                <>
                                                    <strong>{record.predictionsCount} số:</strong> {record.predictions}
                                                </>
                                            ) : (
                                                '--'
                                            )}
                                        </td>
                                        <td>
                                            {renderActualResult(
                                                record.actualResult,
                                                record.resultClass,
                                                record.matchedNumbers || [],
                                                record.specialPrizeLastTwo || null
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }, [filteredHistory, headingText, isMobile, loading, error, days, months, years, selectedMonth, selectedYear]);

    return (
        <div className={styles.historyModalContainer}>
            {isMobile ? (
                mobileModalControlled ? (
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
                                    <h3 className={styles.modalTitle}>Lịch sử dự đoán soi cầu lô tô</h3>
                                    <button
                                        className={styles.modalCloseButton}
                                        onClick={handleCloseModal}
                                        aria-label="Đóng lịch sử"
                                    >
                                        ×
                                    </button>
                                </div>
                                    <div className={styles.modalBody}>
                                        {historySection}
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    <>
                        <button
                            type="button"
                            className={styles.mobileHistoryTrigger}
                            onClick={() => setIsHistoryModalOpen(true)}
                        >
                            <span className={styles.mobileHistoryTriggerText}>
                                Xem lịch sử soi cầu lô tô
                            </span>
                            <span className={styles.mobileHistoryTriggerIcon} aria-hidden="true">
                                ➜
                            </span>
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
                                        <h3 className={styles.modalTitle}>Lịch sử dự đoán soi cầu lô tô</h3>
                                        <button
                                            className={styles.modalCloseButton}
                                            onClick={handleCloseModal}
                                            aria-label="Đóng lịch sử"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <div className={styles.modalBody}>
                                        {historySection}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )
            ) : (
                historySection
            )}
        </div>
    );
};

export default PositionSoiCauLotoHistory;

