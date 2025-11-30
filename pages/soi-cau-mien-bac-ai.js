import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
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
import EnhancedSEOHead from '../components/EnhancedSEOHead';
import { getPageSEO, generateFAQSchema } from '../config/seoConfig';
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
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);


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
    // QUAN TRỌNG: Nhận date và type làm parameters để tránh closure stale values
    const loadPredictions = useCallback(async (targetDate = null, targetType = null) => {
        try {
            setLoading(true);
            setError(null);

            // Sử dụng parameters nếu có, nếu không dùng state hiện tại
            const dateToLoad = targetDate || selectedDate;
            const typeToLoad = targetType || selectedType;

            console.log(`🔄 Loading predictions for date: ${dateToLoad}, type: ${typeToLoad}`);

            // TỐI ƯU: Chỉ gọi 1 API duy nhất để lấy tất cả dữ liệu
            // Thêm timestamp để bypass browser cache (không phải server cache)
            const response = await fetchWithRetry(`${API_BASE_URL}/api/soicau-page/date/${dateToLoad}?refresh=true&_t=${Date.now()}`);
            const data = await response.json();

            // QUAN TRỌNG: Kiểm tra xem date trong response có khớp với date đang request không
            // Tránh trường hợp response trả về dữ liệu của date khác do race condition
            const responseDate = data.data?.predictionDate || data.data?.drawDate;
            const expectedDate = dateToLoad;
            
            if (responseDate && formatDate(new Date(responseDate)) !== expectedDate) {
                console.warn(`⚠️ Date mismatch: requested ${expectedDate}, got ${formatDate(new Date(responseDate))}, ignoring response`);
                return; // Ignore response if date doesn't match
            }

            // QUAN TRỌNG: Kiểm tra cả data.success và data.data (phải khác null)
            if (data.success && data.data !== null && data.data !== undefined) {
                // Lấy predictions từ data chính
                if (data.data.predictions && data.data.predictions.ensemble) {
                    const ensemblePredictions = data.data.predictions.ensemble[typeToLoad] || [];
                    if (ensemblePredictions.length > 0) {
                        setCurrentPredictions({
                            method: 'ensemble',
                            type: typeToLoad,
                            predictions: ensemblePredictions
                        });
                        console.log(`✅ Loaded ${ensemblePredictions.length} predictions for ${dateToLoad}`);
                    } else {
                        console.warn('⚠️ No ensemble predictions found for type:', typeToLoad);
                        setCurrentPredictions(null);
                    }
                } else {
                    console.warn('⚠️ No predictions object found in data');
                    setCurrentPredictions(null);
                }

                // Lấy extended features từ data chính
                setExtendedFeatures(data.data.extendedFeatures || null);
                setLstmStats(data.data.lstmStats || {});
            } else {
                // Không có dữ liệu (data.data === null hoặc undefined)
                console.warn('⚠️ No data available for date:', dateToLoad, data.message || 'No data available');
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
                    // Giảm limit cho lo xuống 20 (thay vì 30) để không quá nhiều predictions
                    // Với lo, 20 predictions đã đủ để người chơi lựa chọn và dễ theo dõi
                    limit: selectedType === 'lo' ? 20 : 20
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ Soi cầu generated and saved successfully:', result.data);

                // Immediately load predictions from API to ensure consistency
                // Truyền date và type trực tiếp để tránh stale closure
                await loadPredictions(currentProcessingDate, selectedType);

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
            // Thêm refresh=true để bypass cache và timestamp để bypass browser cache
            const response = await fetchWithRetry(`${API_BASE_URL}/api/soicau-page/date/${date}?refresh=true&_t=${Date.now()}`);

            // Backend giờ trả về 200 ngay cả khi không có dữ liệu
            if (!response.ok) {
                console.log(`⚠️ API returned ${response.status}, treating as no data`);
                setCurrentPredictions(null);
                setDataDescription(null);
                return false;
            }

            const result = await response.json();
            console.log('📊 Data check result:', result);

            // Kiểm tra cả result.success và result.data (phải khác null và undefined)
            if (result.success && result.data !== null && result.data !== undefined) {
                // Kiểm tra thêm xem có predictions không
                const hasPredictions = result.data.predictions && 
                                     result.data.predictions.ensemble && 
                                     result.data.predictions.ensemble[selectedType] &&
                                     result.data.predictions.ensemble[selectedType].length > 0;
                
                if (hasPredictions) {
                    // Data exists với predictions, set data description but don't load predictions yet
                    console.log('✅ Data exists with predictions for date:', date);
                    setDataDescription({
                        predictionDate: date,
                        dataSource: `Dữ liệu đã có sẵn`,
                        explanation: `Dữ liệu dự đoán cho ngày ${formatDisplayDate(date)} đã được tạo trước đó`
                    });
                    // Don't set currentPredictions here, let user click "Soi Cầu" button hoặc tự động load
                    return true;
                } else {
                    // Data object exists nhưng không có predictions
                    console.log(`📋 Data object exists but no predictions for date ${date}`);
                    setCurrentPredictions(null);
                    setDataDescription(null);
                    return false;
                }
            } else {
                // No data exists (result.data is null hoặc undefined)
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
    }, [selectedType]);


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
                // QUAN TRỌNG: Truyền date và type trực tiếp để tránh stale closure
                if (hasData) {
                    await loadPredictions(initialDate, selectedType);
                } else {
                    // Đảm bảo không có predictions nếu không có dữ liệu
                    setCurrentPredictions(null);
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
        console.log(`📅 Date changed from ${selectedDate} to ${date}`);
        
        // Clear previous data immediately when changing date
        setDataDescription(null);
        setCurrentPredictions(null);
        setExtendedFeatures(null);
        setLstmStats({});
        
        // Update state
        setSelectedDate(date);
        setCurrentProcessingDate(date);
        setActiveTab('predictions');
        
        // Check if data exists for new date (with refresh to bypass cache)
        // QUAN TRỌNG: Truyền date trực tiếp vào checkDataExists
        const hasData = await checkDataExists(date);
        setHasDataForSelectedDate(hasData);

        // If data exists, load predictions immediately
        // QUAN TRỌNG: Truyền date và type trực tiếp vào loadPredictions để tránh stale closure
        if (hasData) {
            await loadPredictions(date, selectedType);
        } else {
            // Đảm bảo không có predictions nếu không có dữ liệu
            setCurrentPredictions(null);
        }
    };

    // Handle method change
    const handleMethodChange = (method) => {
        setSelectedMethod(method);
        // Load predictions for new method - truyền date và type trực tiếp
        loadPredictions(selectedDate, selectedType);
    };

    // Handle type change
    const handleTypeChange = (type) => {
        setSelectedType(type);
        // Load predictions for new type - truyền date và type trực tiếp
        loadPredictions(selectedDate, type);
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

    // ✅ SEO Configuration
    const siteUrl = useMemo(() => 
        process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro',
        []
    );

    const seoConfig = useMemo(() => getPageSEO('soi-cau-mien-bac-ai'), []);

    // ✅ Breadcrumbs
    const breadcrumbs = useMemo(() => [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Soi Cầu Miền Bắc', url: `${siteUrl}/soi-cau-mien-bac-ai` }
    ], [siteUrl]);

    // ✅ FAQ Data
    const faqData = useMemo(() => [
        {
            question: 'Soi cầu miền bắc hôm nay là gì?',
            answer: 'Soi cầu miền bắc hôm nay là công cụ dự đoán xổ số miền Bắc (XSMB) sử dụng trí tuệ nhân tạo (AI) với nhiều phương pháp tiên tiến như CDM, EFDM, Collaborative Filtering, Advanced, và Ensemble để đưa ra dự đoán chính xác nhất.'
        },
        {
            question: 'Có những phương pháp soi cầu nào?',
            answer: 'Hệ thống tích hợp 5 phương pháp: CDM (AI cơ bản), EFDM (Extended Flexible), Collaborative Filtering (tìm ngày tương tự), Advanced (7 phương pháp AI), và Ensemble (kết hợp tất cả để cho kết quả chính xác nhất).'
        },
        {
            question: 'Soi cầu miền bắc có chính xác không?',
            answer: 'Công cụ sử dụng AI tiên tiến với phương pháp Ensemble kết hợp tất cả các phương pháp để đảm bảo độ chính xác cao nhất. Độ chính xác phụ thuộc vào pattern tìm được và dữ liệu lịch sử.'
        },
        {
            question: 'Soi cầu miền bắc có miễn phí không?',
            answer: 'Có, công cụ soi cầu miền bắc hoàn toàn miễn phí 100%, không cần đăng ký tài khoản, không giới hạn số lần sử dụng. Bạn có thể sử dụng ngay lập tức.'
        }
    ], []);

    // ✅ Structured Data
    const structuredData = useMemo(() => {
        const normalizedDate = new Date();
        normalizedDate.setHours(0, 0, 0, 0);
        const deterministicDate = normalizedDate.toISOString();

        return [
            {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "Soi Cầu Miền Bắc - Dàn Đề Wukong",
                "description": "Công cụ soi cầu miền bắc miễn phí chính xác nhất. Dự đoán XSMB hôm nay với AI. Soi cầu bạch thủ, lô gan, thống kê vị trí XSMB.",
                "url": `${siteUrl}/soi-cau-mien-bac-ai`,
                "applicationCategory": "UtilitiesApplication",
                "operatingSystem": "Web Browser",
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "VND"
                },
                "author": {
                    "@type": "Organization",
                    "name": "Dàn Đề Wukong",
                    "url": siteUrl
                },
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.8",
                    "ratingCount": "1250"
                }
            },
            {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Trang chủ",
                        "item": siteUrl
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Soi Cầu Miền Bắc",
                        "item": `${siteUrl}/soi-cau-mien-bac-ai`
                    }
                ]
            },
            generateFAQSchema(faqData)
        ];
    }, [siteUrl, faqData]);

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
        <>
            {/* ✅ Enhanced SEO Head */}
            <EnhancedSEOHead
                pageType="tool"
                customTitle={seoConfig.title}
                customDescription={seoConfig.description}
                customKeywords={seoConfig.keywords.join(', ')}
                canonicalUrl={seoConfig.canonical}
                ogImage={seoConfig.image}
                breadcrumbs={breadcrumbs}
                faq={faqData}
                structuredData={structuredData}
            />

            <Layout>
                <PerformanceMonitor />

            <div className={styles.container}>

                <div className={styles.header}>
                    <h1 className={styles.title}>Soi Cầu AI Dàn 2X Miền Bắc - Dự Đoán XSMB Hôm Nay</h1>
                    <p className={styles.subtitle}>
                        Soi cầu bạch thủ đề miền bắc theo phương pháp AI tiên tiến. Dự đoán XSMB hôm nay, soi cầu MB công nghệ trí tệ nhân tạo
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
                            {/* Chỉ hiển thị nút "Soi Cầu" khi:
                                - Có dữ liệu (hasDataForSelectedDate)
                                - Và CHƯA có predictions đang hiển thị (currentPredictions === null)
                                - Hoặc đang loading (để có thể cancel/reload)
                            */}
                            {hasDataForSelectedDate && !currentPredictions && !loading && (
                                <button
                                    className={styles.generateButton}
                                    onClick={generateSoiCau}
                                    disabled={loading || !hasDataForSelectedDate}
                                >
                                    {loading ? 'Đang tạo soi cầu...' : 'Soi Cầu'}
                                </button>
                            )}
                            {/* Hiển thị nút khi đang loading để user biết đang xử lý */}
                            {hasDataForSelectedDate && loading && (
                                <button
                                    className={styles.generateButton}
                                    disabled={true}
                                >
                                    Đang tải dữ liệu...
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.predictionsContent}>


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

                <div className={styles.mobileHistoryTriggerWrapper}>
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
                </div>

                {/* Soi Cau History Components - Always visible */}
                <SoiCauHistoryDe
                    limit={14}
                    days={14}
                    mobileModalControlled
                    mobileModalOpen={isHistoryModalOpen}
                    onMobileModalClose={() => setIsHistoryModalOpen(false)}
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
        </>
    );
};

export default SoiCauBayesian;
