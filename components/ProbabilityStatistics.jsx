import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';

// API Service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const ProbabilityStatistics = ({ date, showAllMethods = false }) => {
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch probability statistics
    const fetchStatistics = useCallback(async () => {
        if (!date) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/api/soicau-page/probability-stats/${date}`);
            const result = await response.json();

            if (result.success) {
                setStatistics(result.data);
            } else {
                throw new Error(result.message || 'Lỗi khi tải thống kê xác suất');
            }
        } catch (err) {
            console.error('Probability statistics fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [date]);

    useEffect(() => {
        fetchStatistics();
    }, [fetchStatistics]);

    // Format percentage
    const formatPercentage = (value) => {
        return parseFloat(value).toFixed(2) + '%';
    };

    // Format number
    const formatNumber = (value) => {
        return parseFloat(value).toFixed(2);
    };

    // Get frequency color based on value
    const getFrequencyColor = (frequency) => {
        if (frequency > 0.05) return '#28a745'; // High frequency - green
        if (frequency > 0.03) return '#17a2b8'; // Medium frequency - blue
        if (frequency > 0.01) return '#ffc107'; // Low frequency - yellow
        return '#dc3545'; // Very low frequency - red
    };

    // Render number statistics
    const renderNumberStatistics = () => {
        if (!statistics?.numberStatistics) return null;

        const numberStats = statistics.numberStatistics;
        const sortedNumbers = Object.entries(numberStats)
            .sort((a, b) => b[1].totalAppearances - a[1].totalAppearances)
            .slice(0, 20);

        return (
            <div className="number-stats">
                <h4>📊 Top 20 Số Xuất Hiện Nhiều Nhất</h4>
                <div className="stats-grid">
                    {sortedNumbers.map(([number, stats]) => (
                        <div key={number} className="stat-card">
                            <div className="stat-number">{number}</div>
                            <div className="stat-details">
                                <div className="stat-item">
                                    <span className="stat-label">Tổng lần:</span>
                                    <span className="stat-value">{stats.totalAppearances}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Tần suất:</span>
                                    <span
                                        className="stat-value"
                                        style={{ color: getFrequencyColor(stats.frequency) }}
                                    >
                                        {formatPercentage(stats.frequency * 100)}
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Đề:</span>
                                    <span className="stat-value">{stats.deAppearances}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Lô:</span>
                                    <span className="stat-value">{stats.loAppearances}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Gap TB:</span>
                                    <span className="stat-value">{formatNumber(stats.averageGap)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render position statistics
    const renderPositionStatistics = () => {
        if (!statistics?.positionStatistics) return null;

        const positionStats = statistics.positionStatistics;
        const specialPrizeStats = positionStats.specialPrize || {};
        const firstPrizeStats = positionStats.firstPrize || {};

        const topSpecialPrize = Object.entries(specialPrizeStats)
            .sort((a, b) => b[1].appearances - a[1].appearances)
            .slice(0, 10);

        const topFirstPrize = Object.entries(firstPrizeStats)
            .sort((a, b) => b[1].appearances - a[1].appearances)
            .slice(0, 10);

        return (
            <div className="position-stats">
                <h4>🎯 Thống Kê Theo Vị Trí</h4>

                <div className="position-section">
                    <h5>Giải Đặc Biệt</h5>
                    <div className="stats-grid">
                        {topSpecialPrize.map(([number, stats]) => (
                            <div key={number} className="stat-card">
                                <div className="stat-number">{number}</div>
                                <div className="stat-details">
                                    <div className="stat-item">
                                        <span className="stat-label">Lần xuất hiện:</span>
                                        <span className="stat-value">{stats.appearances}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Tần suất:</span>
                                        <span className="stat-value">{formatPercentage(stats.frequency * 100)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="position-section">
                    <h5>Giải Nhất</h5>
                    <div className="stats-grid">
                        {topFirstPrize.map(([number, stats]) => (
                            <div key={number} className="stat-card">
                                <div className="stat-number">{number}</div>
                                <div className="stat-details">
                                    <div className="stat-item">
                                        <span className="stat-label">Lần xuất hiện:</span>
                                        <span className="stat-value">{stats.appearances}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Tần suất:</span>
                                        <span className="stat-value">{formatPercentage(stats.frequency * 100)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Render day of week statistics
    const renderDayOfWeekStatistics = () => {
        if (!statistics?.dayOfWeekStatistics) return null;

        const dayStats = statistics.dayOfWeekStatistics;
        const dayNames = {
            '0': 'Chủ nhật',
            '1': 'Thứ hai',
            '2': 'Thứ ba',
            '3': 'Thứ tư',
            '4': 'Thứ năm',
            '5': 'Thứ sáu',
            '6': 'Thứ bảy'
        };

        return (
            <div className="day-stats">
                <h4>📅 Thống Kê Theo Ngày Trong Tuần</h4>
                <div className="stats-grid">
                    {Object.entries(dayStats).map(([day, stats]) => (
                        <div key={day} className="stat-card">
                            <div className="stat-day">{dayNames[day]}</div>
                            <div className="stat-details">
                                <div className="stat-item">
                                    <span className="stat-label">Tổng lần quay:</span>
                                    <span className="stat-value">{stats.totalDraws}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Số đề phổ biến:</span>
                                    <span className="stat-value">
                                        {Object.entries(stats.deNumbers)
                                            .sort((a, b) => b[1] - a[1])
                                            .slice(0, 3)
                                            .map(([num, count]) => `${num}(${count})`)
                                            .join(', ')
                                        }
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Số lô phổ biến:</span>
                                    <span className="stat-value">
                                        {Object.entries(stats.loNumbers)
                                            .sort((a, b) => b[1] - a[1])
                                            .slice(0, 3)
                                            .map(([num, count]) => `${num}(${count})`)
                                            .join(', ')
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render monthly statistics
    const renderMonthlyStatistics = () => {
        if (!statistics?.monthlyStatistics) return null;

        const monthlyStats = statistics.monthlyStatistics;
        const sortedMonths = Object.entries(monthlyStats)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 6);

        return (
            <div className="monthly-stats">
                <h4>📆 Thống Kê Theo Tháng (6 tháng gần nhất)</h4>
                <div className="stats-grid">
                    {sortedMonths.map(([month, stats]) => (
                        <div key={month} className="stat-card">
                            <div className="stat-month">{month}</div>
                            <div className="stat-details">
                                <div className="stat-item">
                                    <span className="stat-label">Tổng lần quay:</span>
                                    <span className="stat-value">{stats.totalDraws}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Số đề phổ biến:</span>
                                    <span className="stat-value">
                                        {Object.entries(stats.deNumbers)
                                            .sort((a, b) => b[1] - a[1])
                                            .slice(0, 3)
                                            .map(([num, count]) => `${num}(${count})`)
                                            .join(', ')
                                        }
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Số lô phổ biến:</span>
                                    <span className="stat-value">
                                        {Object.entries(stats.loNumbers)
                                            .sort((a, b) => b[1] - a[1])
                                            .slice(0, 3)
                                            .map(([num, count]) => `${num}(${count})`)
                                            .join(', ')
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render overview
    const renderOverview = () => {
        if (!statistics) return null;

        return (
            <div className="overview">
                <h4>📈 Tổng Quan Thống Kê</h4>
                <div className="overview-grid">
                    <div className="overview-card">
                        <div className="overview-title">Ngày phân tích</div>
                        <div className="overview-value">{moment(statistics.targetDate).format('DD/MM/YYYY')}</div>
                    </div>
                    <div className="overview-card">
                        <div className="overview-title">Số ngày lịch sử</div>
                        <div className="overview-value">{statistics.historicalDays}</div>
                    </div>
                    <div className="overview-card">
                        <div className="overview-title">Thời gian tính toán</div>
                        <div className="overview-value">{moment(statistics.calculatedAt).format('HH:mm:ss')}</div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="probability-statistics">
                <div className="loading">Đang tải thống kê xác suất...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="probability-statistics">
                <div className="error">Lỗi: {error}</div>
            </div>
        );
    }

    if (!statistics) {
        return (
            <div className="probability-statistics">
                <div className="no-data">Chưa có dữ liệu thống kê xác suất</div>
            </div>
        );
    }

    return (
        <div className="probability-statistics">
            <div className="stats-header">
                <h3>📊 Thống Kê Xác Suất Chi Tiết</h3>
                <p>Phân tích dữ liệu lịch sử {statistics.historicalDays} ngày</p>
            </div>

            {/* Navigation Tabs */}
            <div className="stats-tabs">
                <button
                    className={`stats-tab ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Tổng Quan
                </button>
                <button
                    className={`stats-tab ${activeTab === 'numbers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('numbers')}
                >
                    Theo Số
                </button>
                <button
                    className={`stats-tab ${activeTab === 'positions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('positions')}
                >
                    Theo Vị Trí
                </button>
                <button
                    className={`stats-tab ${activeTab === 'days' ? 'active' : ''}`}
                    onClick={() => setActiveTab('days')}
                >
                    Theo Ngày
                </button>
                <button
                    className={`stats-tab ${activeTab === 'months' ? 'active' : ''}`}
                    onClick={() => setActiveTab('months')}
                >
                    Theo Tháng
                </button>
            </div>

            {/* Tab Content */}
            <div className="stats-content">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'numbers' && renderNumberStatistics()}
                {activeTab === 'positions' && renderPositionStatistics()}
                {activeTab === 'days' && renderDayOfWeekStatistics()}
                {activeTab === 'months' && renderMonthlyStatistics()}
            </div>

            <style jsx>{`
                .probability-statistics {
                    margin: 20px 0;
                    padding: 20px;
                    background: #f8f9fa;
                    border-radius: 8px;
                    border: 1px solid #e9ecef;
                }

                .stats-header {
                    margin-bottom: 20px;
                }

                .stats-header h3 {
                    margin: 0 0 10px 0;
                    color: #333;
                }

                .stats-header p {
                    margin: 0;
                    color: #666;
                    font-size: 14px;
                }

                .stats-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    border-bottom: 1px solid #dee2e6;
                }

                .stats-tab {
                    padding: 10px 20px;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.3s ease;
                }

                .stats-tab:hover {
                    background: #f8f9fa;
                }

                .stats-tab.active {
                    border-bottom-color: #007bff;
                    color: #007bff;
                    font-weight: 600;
                }

                .stats-content {
                    min-height: 200px;
                }

                .loading, .error, .no-data {
                    text-align: center;
                    padding: 40px;
                    color: #666;
                }

                .error {
                    color: #dc3545;
                }

                .overview-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                }

                .overview-card {
                    background: white;
                    padding: 15px;
                    border-radius: 6px;
                    border: 1px solid #e9ecef;
                    text-align: center;
                }

                .overview-title {
                    font-size: 14px;
                    color: #666;
                    margin-bottom: 5px;
                }

                .overview-value {
                    font-size: 18px;
                    font-weight: 600;
                    color: #333;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 15px;
                }

                .stat-card {
                    background: white;
                    padding: 15px;
                    border-radius: 6px;
                    border: 1px solid #e9ecef;
                    transition: transform 0.2s ease;
                }

                .stat-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }

                .stat-number, .stat-day, .stat-month {
                    font-size: 18px;
                    font-weight: 600;
                    color: #007bff;
                    margin-bottom: 10px;
                    text-align: center;
                }

                .stat-details {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }

                .stat-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .stat-label {
                    font-size: 12px;
                    color: #666;
                }

                .stat-value {
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                }

                .position-section {
                    margin-bottom: 30px;
                }

                .position-section h5 {
                    margin: 0 0 15px 0;
                    color: #333;
                    font-size: 16px;
                }

                @media (max-width: 768px) {
                    .stats-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .overview-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .stats-tabs {
                        flex-wrap: wrap;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProbabilityStatistics;
