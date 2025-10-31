import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import Head from 'next/head';
// Optimized date handling - using native Date for better performance
const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

const formatDisplayDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
};

// CSS Modules
import styles from '../styles/soicauBayesian.module.css';

// Components
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import PerformanceMonitor from '../components/PerformanceMonitor';
import SoiCauHistoryDe from '../components/SoiCauHistoryDe';

// Utils
import { fetchWithRetry, handle429Error } from '../utils/apiUtils';

// API Service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const SoiCauBayesian = () => {
    // State management
    const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
    const [selectedMethod, setSelectedMethod] = useState('ensemble'); // Always use ensemble
    // Force method to ensemble - no user choice
    const FORCED_METHOD = 'ensemble';
    const [selectedType, setSelectedType] = useState('de');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('predictions'); // Chỉ có tab predictions
    const [currentPredictions, setCurrentPredictions] = useState(null);
    const [dataDescription, setDataDescription] = useState(null);
    const [dataCreationLoading, setDataCreationLoading] = useState(false);
    // State để track ngày hiện tại đang được xử lý
    const [currentProcessingDate, setCurrentProcessingDate] = useState(formatDate(new Date()));
    // State để track xem có dữ liệu cho ngày được chọn không
    const [hasDataForSelectedDate, setHasDataForSelectedDate] = useState(false);
    // Thêm states mới
    const [extendedFeatures, setExtendedFeatures] = useState(null);
    const [lstmStats, setLstmStats] = useState({});


    // Fetch soi cầu by date
    const fetchSoiCauByDate = useCallback(async (date) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetchWithRetry(`${API_BASE_URL}/api/soicau-page/date/${date}`);
            const result = await response.json();

            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.message || 'Không tìm thấy soi cầu cho ngày này');
            }
        } catch (err) {
            console.error('Soi cầu fetch error:', err);
            setError(handle429Error(err));
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch predictions
    const fetchPredictions = useCallback(async (method, type, date, limit = 20) => {
        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                date: date
            });

            const response = await fetchWithRetry(`${API_BASE_URL}/api/soicau-page/predictions/${method}/${type}?${params}`);
            const result = await response.json();

            if (result.success) {
                // API trả về array predictions, cần wrap thành object
                return {
                    method: method,
                    type: type,
                    predictions: result.data.predictions || result.data
                };
            } else {
                throw new Error(result.message || 'Lỗi khi tải predictions');
            }
        } catch (err) {
            console.error('Predictions fetch error:', err);
            setError(handle429Error(err));
            return null;
        }
    }, []);

    // Fetch history
    const fetchHistory = useCallback(async (limit = 30, days = 30) => {
        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                days: days.toString()
            });

            const response = await fetchWithRetry(`${API_BASE_URL}/api/soicau-page/history?${params}`);
            const result = await response.json();

            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.message || 'Lỗi khi tải lịch sử');
            }
        } catch (err) {
            console.error('History fetch error:', err);
            setError(handle429Error(err));
            return null;
        }
    }, []);

    // Fetch accuracy stats
    const fetchAccuracyStats = useCallback(async (days = 30) => {
        try {
            const params = new URLSearchParams({
                days: days.toString()
            });

            const response = await fetchWithRetry(`${API_BASE_URL}/api/soicau-page/accuracy?${params}`);
            const result = await response.json();

            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.message || 'Lỗi khi tải thống kê độ chính xác');
            }
        } catch (err) {
            console.error('Accuracy stats fetch error:', err);
            setError(handle429Error(err));
            return null;
        }
    }, []);

    // Load predictions for selected date and method - ALWAYS use ensemble
    const loadPredictions = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // TỐI ƯU: Chỉ gọi 1 API duy nhất để lấy tất cả dữ liệu
            const response = await fetchWithRetry(`${API_BASE_URL}/api/soicau-page/date/${selectedDate}`);
            const data = await response.json();

            if (data.success && data.data) {
                // Lấy predictions từ data chính
                if (data.data.predictions && data.data.predictions.ensemble) {
                    const ensemblePredictions = data.data.predictions.ensemble[selectedType] || [];
                    setCurrentPredictions({
                        method: 'ensemble',
                        type: selectedType,
                        predictions: ensemblePredictions
                    });
                }

                // Lấy extended features từ data chính
                setExtendedFeatures(data.data.extendedFeatures || null);
                setLstmStats(data.data.lstmStats || {});
                console.log('✅ Predictions loaded from single API call');
            } else {
                console.warn('⚠️ No data available:', data.message || 'No data available');
                setCurrentPredictions(null);
                setExtendedFeatures(null);
                setLstmStats({});
            }
        } catch (err) {
            console.error('Load predictions error:', err);
            setError(handle429Error(err));
            setCurrentPredictions(null);
        } finally {
            setLoading(false);
        }
    }, [FORCED_METHOD, selectedType, selectedDate, fetchPredictions]);

    // Generate soi cầu manually (create and save new predictions)
    const generateSoiCau = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🎯 Generating soi cầu for date:', currentProcessingDate);

            // Generate new predictions and save to database
            const response = await fetchWithRetry(`${API_BASE_URL}/api/soicau-page/generate-soicau`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                },
                body: JSON.stringify({
                    date: currentProcessingDate,
                    method: FORCED_METHOD, // Always use ensemble
                    type: selectedType,
                    // Tăng limit cho lo để có nhiều dữ liệu hơn (lo cần nhiều predictions hơn đề)
                    limit: selectedType === 'lo' ? 50 : 20
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Soi cầu generated and saved successfully:', result.data);

                // Immediately load predictions from API to ensure consistency
                await loadPredictions();

                // Refresh data description để hiển thị thông tin mới
                if (result.data.cached) {
                    setDataDescription({
                        predictionDate: currentProcessingDate,
                        dataSource: `Dữ liệu đã có sẵn`,
                        explanation: `Kết quả soi cầu cho ngày ${formatDisplayDate(currentProcessingDate)} đã tồn tại trong hệ thống`
                    });
                } else {
                    setDataDescription({
                        predictionDate: currentProcessingDate,
                        dataSource: `🧠 Ultra Advanced AI Soi Cầu v2.0`,
                        explanation: `Kết quả soi cầu cực kỳ cao siêu cho ngày ${formatDisplayDate(currentProcessingDate)} với 10 phương pháp AI, Neural Networks, Quantum Computing, Genetic Algorithm, Chaos Theory và Fractal Analysis`
                    });
                }

                // Refresh dashboard data
                // await fetchDashboardData(); // Đã xóa dashboard
            } else {
                throw new Error(result.message || 'Lỗi khi tạo soi cầu');
            }
        } catch (err) {
            console.error('Generate soi cầu error:', err);
            setError(handle429Error(err));
            alert('Lỗi khi tạo soi cầu: ' + handle429Error(err));
        } finally {
            setLoading(false);
        }
    }, [currentProcessingDate, selectedMethod, selectedType]);

    // Create data collection manually using selected date
    const createDataCollection = useCallback(async () => {
        // Prevent multiple calls
        if (dataCreationLoading) {
            console.log('⚠️ Data creation already in progress, skipping...');
            return;
        }

        try {
            setDataCreationLoading(true);
            setError(null);

            // Use the current processing date to ensure we get the correct date
            const targetDate = currentProcessingDate;
            console.log('🎯 Current processing date:', currentProcessingDate);
            const targetDateObj = new Date(targetDate);
            const yesterday = new Date(targetDateObj);
            yesterday.setDate(yesterday.getDate() - 1);

            // Create data description based on selected date
            const dataDescription = {
                predictionDate: targetDate,
                dataSource: `${formatDisplayDate(yesterday)} trở về trước`,
                explanation: `Dữ liệu dự đoán cho ngày ${formatDisplayDate(targetDate)} được tạo từ dữ liệu lịch sử từ ${formatDisplayDate(yesterday)} trở về trước (chưa bao gồm kết quả ${formatDisplayDate(yesterday)})`
            };

            console.log('🎯 Creating data collection for date:', targetDate);
            console.log('📊 Data description:', dataDescription);

            const response = await fetchWithRetry(`${API_BASE_URL}/api/soicau-page/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: targetDate,
                    days: 30,
                    topK: 5
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Data collection created successfully:', result.data);
                setDataDescription(dataDescription);

                // Update selected date to the target date
                setSelectedDate(targetDate);
                setActiveTab('predictions');

                // Clear current predictions to show that data is ready
                setCurrentPredictions(null);

                if (result.cached) {
                    alert(`✅ Dữ liệu đã tồn tại cho ngày ${formatDisplayDate(targetDate)}!\n\n📊 Bộ dữ liệu đã có sẵn. Nhấn nút "Soi Cầu" để xem kết quả dự đoán.`);
                } else {
                    alert(`✅ Tạo bộ dữ liệu thành công cho ngày ${formatDisplayDate(targetDate)}!\n\n📊 Bộ dữ liệu đã được tạo. Nhấn nút "Soi Cầu" để xem kết quả dự đoán.`);
                }

                // Không cần gọi checkDataExists nữa vì dữ liệu đã được tạo thành công
                // Chỉ cần set dataDescription để hiển thị thông tin
                setHasDataForSelectedDate(true);
            } else {
                throw new Error(result.message || 'Lỗi khi tạo bộ dữ liệu');
            }
        } catch (err) {
            console.error('Create data collection error:', err);
            setError(handle429Error(err));
            setHasDataForSelectedDate(false);

            // Hiển thị thông báo lỗi chi tiết hơn
            let errorMessage = 'Lỗi khi tạo bộ dữ liệu: ' + err.message;
            if (err.message.includes('Không tìm thấy dữ liệu lịch sử')) {
                errorMessage = `Không thể tạo bộ dữ liệu cho ngày ${formatDisplayDate(targetDate)}.\n\nLý do: Không có dữ liệu lịch sử xổ số cho khoảng thời gian cần thiết.\n\nVui lòng chọn ngày khác hoặc kiểm tra xem database có đủ dữ liệu không.`;
            }

            alert(errorMessage);
        } finally {
            setDataCreationLoading(false);
        }
    }, [dataCreationLoading, currentProcessingDate]);

    // Check if data exists for selected date
    const checkDataExists = useCallback(async (date) => {
        try {
            console.log('🔍 Checking data exists for date:', date);
            const response = await fetchWithRetry(`${API_BASE_URL}/api/soicau-page/date/${date}`);

            // Backend giờ trả về 200 ngay cả khi không có dữ liệu
            if (!response.ok) {
                console.log(`⚠️ API returned ${response.status}, treating as no data`);
                setCurrentPredictions(null);
                setDataDescription(null);
                return false;
            }

            const result = await response.json();
            console.log('📊 Data check result:', result);

            // Kiểm tra cả result.success và result.data (và result.hasData)
            if (result.success && result.data && result.data !== null) {
                // Data exists, set data description but don't load predictions yet
                console.log('✅ Data exists for date:', date);
                setDataDescription({
                    predictionDate: date,
                    dataSource: `Dữ liệu đã có sẵn`,
                    explanation: `Dữ liệu dự đoán cho ngày ${formatDisplayDate(date)} đã được tạo trước đó`
                });
                // Don't set currentPredictions here, let user click "Soi Cầu" button
                setCurrentPredictions(null);
                return true;
            } else {
                // No data exists (result.data is null hoặc result.hasData === false)
                console.log(`📋 No data found for date ${date}: ${result.message || 'No data available'}`);
                setCurrentPredictions(null);
                setDataDescription(null);
                return false;
            }
        } catch (err) {
            console.error('❌ Check data exists error:', err);
            // Xử lý lỗi một cách graceful - không crash app
            setCurrentPredictions(null);
            setDataDescription(null);
            return false;
        }
    }, []);


    // Initial load
    useEffect(() => {
        // fetchDashboardData(); // Đã xóa dashboard
        const initialDate = formatDate(new Date());
        setCurrentProcessingDate(initialDate);
        // Check if data exists for current selected date and load predictions immediately
        const checkInitialData = async () => {
            try {
                const hasData = await checkDataExists(initialDate);
                setHasDataForSelectedDate(hasData);

                // If data exists, load predictions immediately
                if (hasData) {
                    await loadPredictions();
                }
            } catch (err) {
                console.error('Error checking initial data:', err);
            } finally {
                setLoading(false); // Quan trọng: set loading = false sau khi kiểm tra xong
            }
        };
        checkInitialData();
    }, []); // Only run once on mount

    // Handle date change
    const handleDateChange = async (date) => {
        setSelectedDate(date);
        setCurrentProcessingDate(date);
        setActiveTab('predictions');
        // Clear previous data when changing date
        setDataDescription(null);
        setCurrentPredictions(null);
        // Check if data exists for new date
        const hasData = await checkDataExists(date);
        setHasDataForSelectedDate(hasData);

        // If data exists, load predictions immediately
        if (hasData) {
            await loadPredictions();
        }
    };

    // Handle method change
    const handleMethodChange = (method) => {
        setSelectedMethod(method);
        // Load predictions for new method
        loadPredictions();
    };

    // Handle type change
    const handleTypeChange = (type) => {
        setSelectedType(type);
        // Load predictions for new type
        loadPredictions();
    };

    // Format percentage
    const formatPercentage = (value) => {
        return parseFloat(value).toFixed(2) + '%';
    };

    // Get method display name
    const getMethodDisplayName = (method) => {
        const names = {
            cdm: 'CDM (AI cơ bản)',
            efdm: 'EFDM (Extended Flexible)',
            cf: 'Collaborative Filtering',
            ensemble: '🎯 Ensemble (Kết hợp tất cả phương pháp AI)',
            advanced: '🤖 Advanced Soi Cầu (7 phương pháp AI)'
        };
        return names[method] || method;
    };

    // Get type display name
    const getTypeDisplayName = (type) => {
        return type === 'de' ? 'Đề (2 số cuối giải đặc biệt)' : 'Lô (2 số cuối tất cả giải)';
    };

    // Render prediction card with statistical confidence - Memoized for performance
    const renderPredictionCard = useCallback((prediction, index, key, isHit = false) => {
        const isTop3 = index < 3;
        const cardClass = isTop3 ? styles.topPrediction : styles.prediction;
        const hitClass = isHit ? styles.hit : '';

        // Safe access to extendedFeatures with proper null checks
        const hotCold = (extendedFeatures && extendedFeatures.hotCold && extendedFeatures.hotCold[prediction.number])
            ? extendedFeatures.hotCold[prediction.number]
            : 'normal';
        const badgeClass = hotCold === 'hot' ? styles.hotBadge : hotCold === 'cold' ? styles.coldBadge : '';

        // Tính độ tin cậy dựa trên xác suất - Cập nhật cho realistic scoring
        const probability = parseFloat(prediction.percentage) || 0;
        let confidenceLevel = 'Thấp';
        let confidenceColor = '#dc3545';

        if (probability >= 10.0) {
            confidenceLevel = 'Rất Cao';
            confidenceColor = '#28a745';
        } else if (probability >= 7.0) {
            confidenceLevel = 'Cao';
            confidenceColor = '#17a2b8';
        } else if (probability >= 4.0) {
            confidenceLevel = 'Trung Bình';
            confidenceColor = '#ffc107';
        } else if (probability >= 2.0) {
            confidenceLevel = 'Thấp-Trung Bình';
            confidenceColor = '#fd7e14';
        }

        // Hiển thị thông tin độc đáo nếu có
        const uniquenessInfo = prediction.uniqueness ? (
            <div style={{
                fontSize: '10px',
                color: prediction.uniqueness > 1.2 ? '#e74c3c' : prediction.uniqueness > 1.0 ? '#f39c12' : '#95a5a6',
                marginTop: '2px',
                fontWeight: 'bold'
            }}>
                {prediction.uniqueness > 1.2 ? '🔥' : prediction.uniqueness > 1.0 ? '⭐' : '💫'}
                {(prediction.uniqueness * 100).toFixed(0)}%
            </div>
        ) : null;

        // Hiển thị special note nếu có
        const specialNote = prediction.specialNote ? (
            <div style={{
                fontSize: '9px',
                color: '#7f8c8d',
                marginTop: '2px',
                fontStyle: 'italic'
            }}>
                {prediction.specialNote}
            </div>
        ) : null;

        return (
            <div key={key} className={`${cardClass} ${hitClass}`}>
                <div className={styles.predictionNumber}>
                    {prediction.number}
                </div>
                <div className={styles.predictionPercentage}>
                    {formatPercentage(prediction.percentage)}
                </div>
                {isTop3 && (
                    <div className={styles.topBadge}>
                        Top {index + 1}
                    </div>
                )}
                {isHit && (
                    <div className={styles.hitBadge}>
                        Trúng
                    </div>
                )}
                <div className={badgeClass}>{hotCold}</div>
                <div style={{
                    fontSize: '11px',
                    color: confidenceColor,
                    marginTop: '4px',
                    fontWeight: 'bold'
                }}>
                    ⭐ {confidenceLevel}
                </div>
                {uniquenessInfo}
                {specialNote}
            </div>
        );
    }, [extendedFeatures, styles]);



    // Memoized predictions render to keep hooks order stable
    const memoizedPredictionCards = useMemo(() => {
        if (!currentPredictions || !currentPredictions.predictions) return null;
        return currentPredictions.predictions.map((prediction, index) =>
            renderPredictionCard(prediction, index, `${prediction.number}-${index}`)
        );
    }, [currentPredictions, renderPredictionCard]);

    // Render extended features
    const renderExtendedFeatures = () => {
        if (!extendedFeatures || !extendedFeatures.hotCold) return null;
        return (
            <div className={styles.extendedSection}>
                <h4>📊 Extended Features</h4>
                <div>Top Hot: {Object.keys(extendedFeatures.hotCold).filter(n => extendedFeatures.hotCold[n] === 'hot').slice(0, 5).join(', ')}</div>
                <div>Top Cold: {Object.keys(extendedFeatures.hotCold).filter(n => extendedFeatures.hotCold[n] === 'cold').slice(0, 5).join(', ')}</div>
                {/* Tương tự cho positionStats */}
            </div>
        );
    }

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
    }

    return (
        <Layout>
            <PerformanceMonitor />
            <Head>
                <title>Soi Cầu Miền Bắc - Soi Cầu MB - Dự Đoán XSMB Hôm Nay Miễn Phí | Soi Cầu AI</title>
                <meta name="description" content="Soi cầu miền bắc miễn phí chính xác nhất. Dự đoán XSMB hôm nay, soi cầu MB, soi cầu miền bắc với AI. Soi cầu bạch thủ, lô gan, thống kê vị trí XSMB. Soi cầu chính xác 100%." />
                <meta name="keywords" content="soi cầu miền bắc, soi cau mien bac, soi cầu MB, soi cau MB, dự đoán XSMB, du doan XSMB, soi cầu XSMB, soi cầu miễn phí, soi cầu chính xác, soi cầu bạch thủ, lô gan XSMB, thống kê vị trí MB, cầu MB, dự đoán kết quả xổ số, soi cầu AI, soi cau AI" />
                <meta name="robots" content="index, follow" />
                <meta name="author" content="Soi Cầu AI" />
                <meta property="og:title" content="Soi Cầu Miền Bắc - Soi Cầu MB - Dự Đoán XSMB Hôm Nay Miễn Phí" />
                <meta property="og:description" content="Soi cầu miền bắc miễn phí chính xác nhất. Dự đoán XSMB hôm nay với AI. Soi cầu bạch thủ, lô gan, thống kê vị trí XSMB." />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Soi Cầu Miền Bắc - Soi Cầu MB - Dự Đoán XSMB Hôm Nay" />
                <meta name="twitter:description" content="Soi cầu miền bắc miễn phí chính xác nhất. Dự đoán XSMB hôm nay với AI." />
                <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.taodandewukong.pro'}/soicau-bayesian`} />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "WebPage",
                            "name": "Soi Cầu Miền Bắc - Soi Cầu MB - Dự Đoán XSMB Hôm Nay",
                            "description": "Soi cầu miền bắc miễn phí chính xác nhất. Dự đoán XSMB hôm nay với AI. Soi cầu bạch thủ, lô gan, thống kê vị trí XSMB.",
                            "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.taodandewukong.pro'}/soicau-bayesian`,
                            "mainEntity": {
                                "@type": "Service",
                                "name": "Soi Cầu AI",
                                "description": "Dịch vụ soi cầu miền bắc miễn phí sử dụng AI",
                                "provider": {
                                    "@type": "Organization",
                                    "name": "Soi Cầu AI"
                                },
                                "areaServed": {
                                    "@type": "Country",
                                    "name": "Vietnam"
                                }
                            },
                            "keywords": "soi cầu miền bắc, soi cau mien bac, soi cầu MB, dự đoán XSMB, soi cầu XSMB, soi cầu miễn phí, soi cầu AI"
                        })
                    }}
                />
            </Head>

            <div className={styles.container}>

                <div className={styles.header}>
                    <h1 className={styles.title}>Soi Cầu Miền Bắc - Soi Cầu MB - Dự Đoán XSMB Hôm Nay</h1>
                    <p className={styles.subtitle}>
                        Soi cầu miền bắc miễn phí chính xác nhất với AI. Dự đoán XSMB hôm nay, soi cầu MB, soi cầu bạch thủ, lô gan. Soi cầu chính xác 100%.
                    </p>
                </div>



                {/* Predictions Tab */}
                <div className={styles.predictions}>
                    <div className={styles.predictionsHeader}>
                        <div className={styles.dateSelector}>
                            <label>Chọn ngày:</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                max={formatDate(new Date())}
                            />
                        </div>

                        {/* Type selector - ĐỀ hoặc LÔ */}
                        <div className={styles.typeSelector}>
                            <label>Loại dự đoán:</label>
                            <select
                                value={selectedType}
                                onChange={(e) => handleTypeChange(e.target.value)}
                            >
                                <option value="de">🎯 Đề (2 số cuối giải đặc biệt)</option>
                                <option value="lo">🎲 Lô (2 số cuối tất cả giải)</option>
                            </select>
                        </div>

                        {/* Hidden - Always use ensemble for final results */}
                        <div style={{ display: 'none' }}>
                            <label>Phương pháp:</label>
                            <select value={FORCED_METHOD} onChange={() => { }}>
                                <option value="ensemble">🎯 Ensemble (Tổng hợp AI)</option>
                            </select>
                        </div>

                        <div className={styles.actionButtons}>
                            {!hasDataForSelectedDate && (
                                <button
                                    className={styles.generateButton}
                                    onClick={createDataCollection}
                                    disabled={dataCreationLoading || loading}
                                >
                                    {dataCreationLoading ? 'Đang tạo bộ dữ liệu...' : 'Tạo Bộ Dữ Liệu'}
                                </button>
                            )}
                            <button
                                className={styles.generateButton}
                                onClick={generateSoiCau}
                                disabled={loading || !hasDataForSelectedDate}
                            >
                                {loading ? 'Đang tạo soi cầu...' : 'Soi Cầu'}
                            </button>
                        </div>
                    </div>

                    <div className={styles.predictionsContent}>
                        <div className={styles.predictionsHeader}>
                            <div>
                                <h3>🎯 Dự Đoán XSMB Hôm Nay - Soi Cầu Miền Bắc - {getTypeDisplayName(selectedType)}</h3>
                                <p>📅 Ngày: {formatDisplayDate(selectedDate)}</p>
                                <p style={{ color: '#28a745', fontSize: '14px', marginTop: '8px' }}>
                                    ✨ Soi cầu miễn phí với AI: Tích hợp CDM, EFDM, CF, Advanced (7 methods), LSTM
                                </p>
                            </div>
                        </div>


                        {/* Predictions will be loaded here */}
                        {currentPredictions && currentPredictions.predictions ? (
                            <>
                                <div className={styles.predictionGrid}>
                                    {memoizedPredictionCards}
                                </div>

                                {/* Extended Features */}
                                {renderExtendedFeatures()}


                            </>
                        ) : hasDataForSelectedDate ? (
                            <div className={styles.noData}>
                                <h3>📊 Bộ Dữ Liệu Đã Sẵn Sàng</h3>
                                <p>Bộ dữ liệu cho ngày {formatDisplayDate(currentProcessingDate)} đã có sẵn.</p>
                                <p>Nhấn nút "Soi Cầu" ở trên để xem kết quả dự đoán.</p>
                            </div>
                        ) : (
                            <div className={styles.noData}>
                                <h3>Chưa có dữ liệu dự đoán</h3>
                                <p>Nhấn nút "Tạo Bộ Dữ Liệu" ở trên để tạo dữ liệu cho ngày {formatDisplayDate(currentProcessingDate)}</p>
                                <p>Sau khi tạo bộ dữ liệu, nhấn nút "Soi Cầu" để xem kết quả dự đoán.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Soi Cau History Components - Always visible */}
                <SoiCauHistoryDe
                    limit={14}
                    days={14}
                />

                {/* SEO Content - Giải thích về soi cầu miền bắc */}
                <div className={styles.seoContent} style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>Soi Cầu Miền Bắc - Dự Đoán XSMB Hôm Nay Miễn Phí</h2>
                    <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#333' }}>
                        <p><strong>Soi cầu miền bắc</strong> (soi cầu MB, soi cầu XSMB) là công cụ dự đoán xổ số miền Bắc miễn phí sử dụng trí tuệ nhân tạo (AI). Hệ thống soi cầu AI của chúng tôi tích hợp nhiều phương pháp tiên tiến:</p>
                        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <li><strong>Soi cầu CDM:</strong> Phương pháp AI cơ bản cho soi cầu đề và lô</li>
                            <li><strong>Soi cầu EFDM:</strong> Phương pháp mở rộng với phân tích linh hoạt</li>
                            <li><strong>Soi cầu Collaborative Filtering:</strong> Tìm kiếm các ngày tương tự trong lịch sử</li>
                            <li><strong>Soi cầu Advanced:</strong> Tích hợp 7 phương pháp AI cao cấp</li>
                            <li><strong>Soi cầu Ensemble:</strong> Kết hợp tất cả phương pháp để cho kết quả chính xác nhất</li>
                        </ul>
                        <p style={{ marginTop: '15px' }}><strong>Dự đoán XSMB hôm nay</strong> bao gồm:</p>
                        <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                            <li><strong>Soi cầu đề:</strong> Dự đoán 2 số cuối giải đặc biệt XSMB</li>
                            <li><strong>Soi cầu lô:</strong> Dự đoán 2 số cuối tất cả các giải XSMB</li>
                            <li><strong>Soi cầu bạch thủ:</strong> Dự đoán số có khả năng cao nhất</li>
                            <li><strong>Lô gan:</strong> Thống kê số chưa ra trong nhiều ngày</li>
                            <li><strong>Thống kê vị trí:</strong> Phân tích số xuất hiện ở các vị trí khác nhau</li>
                        </ul>
                        <p style={{ marginTop: '15px' }}>Soi cầu miền bắc của chúng tôi hoàn toàn <strong>miễn phí</strong> và sử dụng công nghệ AI tiên tiến để đảm bảo độ chính xác cao nhất. Hãy thử nghiệm <strong>soi cầu MB</strong> ngay hôm nay!</p>
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default SoiCauBayesian;
