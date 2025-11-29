import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchWithRetry } from '../utils/apiUtils';
import styles from '../styles/SoiCauHistory.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const SoiCauHistoryDe = ({
    limit = 14,
    days = 14,
    mobileModalControlled = false,
    mobileModalOpen = false,
    onMobileModalClose = () => {},
}) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

    // Fetch detailed history for DE type
    const fetchDetailedHistory = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                limit: limit.toString(),
                days: days.toString(),
                type: 'de'
            });

            const response = await fetchWithRetry(`${API_BASE_URL}/api/soicau-page/history-detailed?${params}`);
            const result = await response.json();

            if (result.success) {
                setHistory(result.data.history || []);
            } else {
                throw new Error(result.message || 'Lỗi khi tải lịch sử đề');
            }
        } catch (err) {
            console.error('DE History fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [limit, days]);

    useEffect(() => {
        fetchDetailedHistory();
    }, [fetchDetailedHistory]);

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

    // Render framing strategy - chỉ hiển thị "3 ngày"
    const renderFramingStrategy = (framingStrategy) => {
        return (
            <div className={styles.framingStrategy}>
                <div className={styles.framingItem}>
                    3 ngày
                </div>
            </div>
        );
    };

    // Render actual result with appropriate styling
    const renderActualResult = (actualResult, resultClass) => {
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

        return (
            <span className={getResultClass(resultClass)}>
                {actualResult}
            </span>
        );
    };

    const formatDateDisplay = useCallback((dateStr) => {
        if (!dateStr) return '--';
        const parts = dateStr.split('/');
        if (parts.length < 3) return dateStr;
        return `${parts[0]}/${parts[1]}`;
    }, []);

    const historySection = useMemo(() => {
        if (loading) {
            return (
                <div className={styles.tablesRow}>
                    <div>
                        <h2 className={styles.heading}>
                            {isMobile ? 'Dàn 2X khung 3 ngày' : `Lịch sử soi cầu AI dàn 2X khung 3 ngày (${days} ngày gần nhất)`}
                        </h2>
                        <div className={styles.tableWrapper}>
                            <div className={styles.loadingContainer}>
                                Đang tải lịch sử đề...
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
                        <h2 className={styles.heading}>
                            Lịch sử soi cầu AI dàn 2X khung 3 ngày ({days} ngày gần nhất)
                        </h2>
                        <div className={styles.tableWrapper}>
                            <div className={styles.errorContainer}>
                                Lỗi: {error}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (!history || history.length === 0) {
            return (
                <div className={styles.tablesRow}>
                    <div>
                        <h2 className={styles.heading}>
                            Lịch sử soi cầu AI dàn 2X khung 3 ngày ({days} ngày gần nhất)
                        </h2>
                        <div className={styles.tableWrapper}>
                            <div className={styles.noDataContainer}>
                                Chưa có dữ liệu lịch sử đề
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.tablesRow}>
                <div>
                    <h2 className={styles.heading}>
                        {isMobile ? 'Dàn 2X khung 3 ngày' : `Lịch sử soi cầu AI dàn 2X khung 3 ngày (${days} ngày gần nhất)`}
                    </h2>
                    <div className={styles.tableWrapper}>
                        <table className={styles.historyTable}>
                            <thead>
                                <tr>
                                    <th>{isMobile ? 'Ngày' : 'NGÀY'}</th>
                                    <th>{isMobile ? 'Dàn đề' : 'DÀN ĐỀ 20 SỐ'}</th>
                                    <th>{isMobile ? 'Nuôi khung' : 'NUÔI KHUNG 3 NGÀY'}</th>
                                    <th>{isMobile ? 'Kết quả' : 'ĐỐI CHIẾU KẾT QUẢ'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((record, index) => (
                                    <tr key={index} data-status={record.resultClass}>
                                        <td className={styles.date}>{formatDateDisplay(record.date)}</td>
                                        <td className={styles.predictions}>{record.predictions}</td>
                                        <td>{renderFramingStrategy(record.framingStrategy)}</td>
                                        <td>{renderActualResult(record.actualResult, record.resultClass)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }, [days, error, history, loading, formatDateDisplay]);

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

export default SoiCauHistoryDe;
