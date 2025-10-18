/**
 * Today Predictions Component - Optimized
 * Hiển thị 5 bài viết dự đoán xổ số miền bắc hôm nay
 * - Performance optimized với React.memo và useMemo
 * - SEO optimized với structured data, meta tags
 * - Accessibility compliant (WCAG 2.1)
 * - Mobile-first responsive design
 */

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import Head from 'next/head';
import { Calendar, TrendingUp, Target, Star, Zap, BarChart3, Sparkles } from 'lucide-react';
import styles from '../styles/TodayPredictions.module.css';

// Memoized PredictionCard component để tránh re-render không cần thiết
const PredictionCard = memo(({ pred, predictionDate, formattedDate }) => {
    const IconComponent = pred.icon;

    return (
        <article
            className={styles.predictionCard}
            style={{
                '--card-gradient': pred.gradient,
                '--card-color': pred.color
            }}
            itemScope
            itemType="https://schema.org/Article"
            data-prediction-type={pred.id}
            aria-labelledby={`prediction-title-${pred.id}`}
        >
            <header className={styles.cardHeader}>
                <div className={styles.cardIcon} aria-hidden="true">
                    <IconComponent size={20} />
                </div>
                <div>
                    <h3
                        className={styles.cardTitle}
                        id={`prediction-title-${pred.id}`}
                        itemProp="headline"
                    >
                        {pred.title}
                    </h3>
                    <p className={styles.cardSubtitle}>
                        <time dateTime={predictionDate} itemProp="datePublished">
                            {pred.subtitle}
                        </time>
                    </p>
                </div>
            </header>

            <div
                className={styles.cardContent}
                itemProp="articleBody"
                dangerouslySetInnerHTML={{ __html: pred.content }}
            />

            {/* Hidden SEO content */}
            <meta itemProp="keywords" content={pred.keywords} />
            <meta itemProp="author" content="Dàn Đề Wukong" />
            <div style={{ display: 'none' }} itemProp="description">
                {pred.title} ngày {formattedDate} - {pred.keywords}.
                Dự đoán xổ số miền bắc chính xác, cập nhật hàng ngày từ chuyên gia Dàn Đề Wukong.
            </div>
        </article>
    );
});

PredictionCard.displayName = 'PredictionCard';

const TodayPredictions = () => {
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasFetched, setHasFetched] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [isToday, setIsToday] = useState(true);

    // Load visibility state from localStorage with error handling
    useEffect(() => {
        try {
            const saved = localStorage.getItem('predictions-visible');
            if (saved !== null) {
                setIsVisible(saved === 'true');
            }
        } catch (err) {
            console.warn('localStorage not available:', err);
        }
    }, []);

    useEffect(() => {
        // Prevent duplicate fetches in React Strict Mode (development)
        if (!hasFetched) {
            setHasFetched(true);
            fetchTodayPrediction();
        }
    }, [hasFetched]);

    // Memoized toggle function để tránh re-render không cần thiết
    const toggleVisibility = useCallback(() => {
        setIsVisible(prev => {
            const newValue = !prev;
            try {
                localStorage.setItem('predictions-visible', newValue.toString());
            } catch (err) {
                console.warn('Cannot save to localStorage:', err);
            }
            return newValue;
        });
    }, []);

    const fetchTodayPrediction = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            console.log('🔍 Fetching today prediction from:', `${apiUrl}/api/predictions/today`);

            const response = await fetch(`${apiUrl}/api/predictions/today`);

            // Handle rate limiting
            if (response.status === 429) {
                console.warn('⚠️ Rate limited, retrying in 2 seconds...');
                setTimeout(() => {
                    setHasFetched(false); // Retry
                }, 2000);
                return;
            }

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server không trả về JSON');
            }

            const result = await response.json();
            console.log('📊 Prediction result:', result);

            if (result.success) {
                setPrediction(result.data);
                setIsToday(result.isToday !== false); // Default to true if not specified
                console.log('✅ Prediction loaded successfully', result.isToday ? '(Hôm nay)' : '(Bài mới nhất)');
            } else {
                console.warn('⚠️ No prediction available:', result.message);
                setError('Chưa có dự đoán nào');
            }
        } catch (err) {
            console.error('❌ Error fetching prediction:', err);
            setError('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // Memoized date formatter
    const formatDate = useCallback((dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }, []);

    // Memoized formatted date để tránh tính toán lại
    const formattedDate = useMemo(() =>
        prediction ? formatDate(prediction.predictionDate) : '',
        [prediction, formatDate]
    );

    // Memoized predictions array để tránh re-create mỗi lần render
    const predictions = useMemo(() => {
        if (!prediction) return [];
        const dateText = `Ngày ${formatDate(prediction.predictionDate)}`;
        return [
            {
                id: 'lotto',
                title: `Cầu Lotto đẹp nhất`,
                subtitle: dateText,
                content: prediction.lottoContent,
                icon: Target,
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#667eea',
                keywords: 'cầu lotto, lotto đẹp, số lotto, dự đoán lotto, lotto miền bắc'
            },
            {
                id: 'special',
                title: `Cầu Đặc biệt đẹp nhất`,
                subtitle: dateText,
                content: prediction.specialContent,
                icon: Star,
                gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: '#f093fb',
                keywords: 'cầu đặc biệt, đề đặc biệt, số đặc biệt, dự đoán đặc biệt, xsmb đặc biệt'
            },
            {
                id: 'double-jump',
                title: `Cầu 2 nháy đẹp nhất`,
                subtitle: dateText,
                content: prediction.doubleJumpContent,
                icon: Zap,
                gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: '#fa709a',
                keywords: 'cầu 2 nháy, lô 2 nháy, số nháy, dự đoán 2 nháy, xsmb 2 nháy'
            },
            {
                id: 'top-table',
                title: `Bảng lô top`,
                subtitle: dateText,
                content: prediction.topTableContent,
                icon: BarChart3,
                gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: '#4facfe',
                keywords: 'bảng lô top, lô hot, lô nhiều người chơi, thống kê lô, lô đề'
            },
            {
                id: 'wukong',
                title: `Dự đoán wukong`,
                subtitle: dateText,
                content: prediction.wukongContent,
                icon: Sparkles,
                gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                color: '#43e97b',
                keywords: 'dự đoán wukong, bạch thủ lô, song thủ lô, lô xiên 2, lô kép'
            }
        ];
    }, [prediction, formatDate]);

    // Memoized structured data cho SEO
    const structuredData = useMemo(() => {
        if (!prediction || predictions.length === 0) return {};
        return {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": `Dự Đoán Xổ Số Miền Bắc Ngày ${formatDate(prediction.predictionDate)}`,
            "description": `Dự đoán xổ số miền bắc hôm nay ${formatDate(prediction.predictionDate)}: Cầu lotto đẹp, cầu đặc biệt, bảng lô top, dự đoán wukong chính xác nhất`,
            "datePublished": prediction.predictionDate,
            "author": {
                "@type": "Organization",
                "name": "Dàn Đề Wukong"
            },
            "publisher": {
                "@type": "Organization",
                "name": "Dàn Đề Wukong",
                "logo": {
                    "@type": "ImageObject",
                    "url": `${process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro'}/imgs/monkey.png`
                }
            },
            "mainEntity": {
                "@type": "ItemList",
                "itemListElement": predictions.map((pred, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
                    "name": pred.title,
                    "description": pred.keywords
                }))
            }
        };
    }, [prediction, predictions, formatDate]);

    // SEO meta data
    const seoData = useMemo(() => {
        const timeContext = isToday ? 'Hôm Nay' : `Ngày ${formattedDate}`;
        return {
            title: `Dự Đoán Xổ Số Miền Bắc ${timeContext} - Chuẩn Xác Nhất`,
            description: `Dự đoán XSMB ${formattedDate}: Cầu lotto đẹp, cầu đặc biệt, cầu 2 nháy, bảng lô top, dự đoán wukong. Cập nhật hàng ngày, độ chính xác cao ✓`,
            keywords: 'dự đoán xsmb, dự đoán xổ số miền bắc, cầu lotto, cầu đặc biệt, cầu 2 nháy, bảng lô top, dự đoán wukong, soi cầu miền bắc, dàn đề wukong',
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro'}`,
            image: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro'}/imgs/monkey.png`,
        };
    }, [formattedDate, isToday]);

    // Early returns after all hooks have been called (Rules of Hooks)
    // Don't render anything if there's an error or no prediction
    if (error || !prediction) {
        return null;
    }

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingState}>
                    <div className={styles.loadingSpinner}></div>
                    <span>Đang tải dự đoán hôm nay...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                {/* Primary Meta Tags */}
                <title>{seoData.title}</title>
                <meta name="title" content={seoData.title} />
                <meta name="description" content={seoData.description} />
                <meta name="keywords" content={seoData.keywords} />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content={seoData.url} />
                <meta property="og:title" content={seoData.title} />
                <meta property="og:description" content={seoData.description} />
                <meta property="og:image" content={seoData.image} />
                <meta property="og:locale" content="vi_VN" />
                <meta property="og:site_name" content="Dàn Đề Wukong" />

                {/* Twitter */}
                <meta property="twitter:card" content="summary_large_image" />
                <meta property="twitter:url" content={seoData.url} />
                <meta property="twitter:title" content={seoData.title} />
                <meta property="twitter:description" content={seoData.description} />
                <meta property="twitter:image" content={seoData.image} />

                {/* Additional SEO */}
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
                <meta name="googlebot" content="index, follow" />
                <link rel="canonical" href={seoData.url} />

                {/* Preconnect for performance */}
                <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'} />
                <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'} />

                {/* JSON-LD Structured Data cho SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            </Head>

            <section
                className={styles.container}
                itemScope
                itemType="https://schema.org/Article"
                aria-label="Dự đoán xổ số miền bắc hôm nay"
            >
                <header className={styles.header}>
                    <div className={styles.headerContent}>
                        <div className={styles.headerLeft}>
                            <TrendingUp size={20} className={styles.headerIcon} aria-hidden="true" />
                            <h2 className={styles.headerTitle} itemProp="headline">
                                Dự Đoán XỔ SỐ MIỀN BẮC {isToday ? '' : formattedDate}
                            </h2>
                            <p className={styles.headerSubtitle}>
                                <Calendar size={14} aria-hidden="true" />
                                <time dateTime={prediction.predictionDate} itemProp="datePublished">
                                    {isToday ? `${formattedDate}` : formattedDate}
                                </time>
                            </p>
                        </div>
                        <button
                            className={styles.toggleButton}
                            onClick={toggleVisibility}
                            aria-label={isVisible ? 'Ẩn dự đoán' : 'Xem dự đoán'}
                            title={isVisible ? 'Ẩn dự đoán' : 'Xem dự đoán'}
                        >
                            {isVisible ? 'Ẩn' : 'Xem'}
                        </button>
                    </div>
                </header>

                {isVisible && (
                    <div className={styles.predictionsGrid} itemProp="articleBody">
                        {predictions.map((pred) => (
                            <PredictionCard
                                key={pred.id}
                                pred={pred}
                                predictionDate={prediction.predictionDate}
                                formattedDate={formattedDate}
                            />
                        ))}
                    </div>
                )}
            </section>
        </>
    );
};

export default TodayPredictions;

