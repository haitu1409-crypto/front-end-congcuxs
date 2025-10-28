import React from 'react';

// API Service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const ProbabilityStatistics = ({ date, showAllMethods = false }) => {
    const [statistics, setStatistics] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    // Fetch probability statistics
    const fetchStatistics = async () => {
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
    };

    React.useEffect(() => {
        if (date) {
            fetchStatistics();
        }
    }, [date]);

    if (loading) {
        return React.createElement('div', {
            style: { padding: '20px', textAlign: 'center' }
        }, 'Đang tải thống kê xác suất...');
    }

    if (error) {
        return React.createElement('div', {
            style: { padding: '20px', textAlign: 'center', color: '#dc3545' }
        }, `Lỗi: ${error}`);
    }

    if (!statistics) {
        return React.createElement('div', {
            style: { padding: '20px', textAlign: 'center', color: '#666' }
        }, 'Chưa có dữ liệu thống kê xác suất');
    }

    return React.createElement('div', {
        style: {
            margin: '20px 0',
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
        }
    }, [
        React.createElement('div', {
            key: 'header',
            style: { marginBottom: '20px' }
        }, [
            React.createElement('h3', {
                key: 'title',
                style: { margin: '0 0 10px 0', color: '#333' }
            }, '📊 Thống Kê Xác Suất Chi Tiết'),
            React.createElement('p', {
                key: 'subtitle',
                style: { margin: '0', color: '#666', fontSize: '14px' }
            }, `Phân tích dữ liệu lịch sử ${statistics.historicalDays} ngày`)
        ]),

        React.createElement('div', {
            key: 'overview',
            style: {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
            }
        }, [
            React.createElement('div', {
                key: 'date',
                style: {
                    background: 'white',
                    padding: '15px',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    textAlign: 'center'
                }
            }, [
                React.createElement('div', {
                    key: 'date-label',
                    style: { fontSize: '14px', color: '#666', marginBottom: '5px' }
                }, 'Ngày phân tích'),
                React.createElement('div', {
                    key: 'date-value',
                    style: { fontSize: '18px', fontWeight: '600', color: '#333' }
                }, new Date(statistics.targetDate).toLocaleDateString('vi-VN'))
            ]),

            React.createElement('div', {
                key: 'days',
                style: {
                    background: 'white',
                    padding: '15px',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    textAlign: 'center'
                }
            }, [
                React.createElement('div', {
                    key: 'days-label',
                    style: { fontSize: '14px', color: '#666', marginBottom: '5px' }
                }, 'Số ngày lịch sử'),
                React.createElement('div', {
                    key: 'days-value',
                    style: { fontSize: '18px', fontWeight: '600', color: '#333' }
                }, statistics.historicalDays)
            ]),

            React.createElement('div', {
                key: 'time',
                style: {
                    background: 'white',
                    padding: '15px',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef',
                    textAlign: 'center'
                }
            }, [
                React.createElement('div', {
                    key: 'time-label',
                    style: { fontSize: '14px', color: '#666', marginBottom: '5px' }
                }, 'Thời gian tính toán'),
                React.createElement('div', {
                    key: 'time-value',
                    style: { fontSize: '18px', fontWeight: '600', color: '#333' }
                }, new Date(statistics.calculatedAt).toLocaleTimeString('vi-VN'))
            ])
        ])
    ]);
};

export default ProbabilityStatistics;