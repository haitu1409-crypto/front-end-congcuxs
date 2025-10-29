import React, { useState, useEffect, useCallback } from 'react';
import { fetchWithRetry } from '../utils/apiUtils';
import styles from '../styles/SoiCauHistory.module.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const SoiCauHistoryDe = ({ limit = 14, days = 14 }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) {
        return (
            <div className={styles.tablesRow}>
                <div>
                    <h2 className={styles.heading}>
                        Lịch sử dự đoán bạch thủ đề ({days} ngày trước)
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
                        Lịch sử dự đoán bạch thủ đề ({days} ngày trước)
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
                        Lịch sử dự đoán bạch thủ đề ({days} ngày trước)
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
                    Lịch sử dự đoán bạch thủ đề ({days} ngày trước)
                </h2>
                <div className={styles.tableWrapper}>
                    <table className={styles.historyTable}>
                        <thead>
                            <tr>
                                <th>Ngày</th>
                                <th>Dự đoán đề</th>
                                <th>Nuôi khung</th>
                                <th>Kết quả thực tế</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((record, index) => (
                                <tr key={index} data-status={record.resultClass}>
                                    <td className={styles.date}>{record.date}</td>
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
};

export default SoiCauHistoryDe;
