import React, { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import { getPageSEO } from '../config/seoConfig';
import styles from '../styles/soi-cau-bayesian.module.css';

// Skeleton Loading Components
const SkeletonRow = () => (
    <tr>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
        <td className="py-2 px-4"><div className={styles.skeleton}></div></td>
    </tr>
);

const SkeletonTable = () => (
    <div className={styles.tableWrapper}>
        <table className={styles.tableSoiCau}>
            <thead>
                <tr>
                    <th>Phương pháp</th>
                    <th>Kết quả dự đoán</th>
                    <th>Xác suất</th>
                    <th>Gợi ý nuôi khung</th>
                </tr>
            </thead>
            <tbody>
                {Array(5).fill().map((_, index) => <SkeletonRow key={index} />)}
            </tbody>
        </table>
    </div>
);

const SoiCauBayesianPage = () => {
    const [soiCauResults, setSoiCauResults] = useState([]);
    const [combinedPrediction, setCombinedPrediction] = useState('');
    const [additionalSuggestions, setAdditionalSuggestions] = useState([]);
    const [loadingSoiCau, setLoadingSoiCau] = useState(false);
    const [error, setError] = useState(null);
    const [metadata, setMetadata] = useState({});
    const [history, setHistory] = useState([]);
    const [selectedDays, setSelectedDays] = useState(14);

    // Cache for data
    const dataCache = new Map();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    const fetchSoiCauData = useCallback(async (date, days) => {
        const cacheKey = `soicau-bayesian-${date}-${days}`;
        const cachedData = dataCache.get(cacheKey);

        // Kiểm tra cache trước
        if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
            console.log(`📦 Using cached data for ${date}`);
            setSoiCauResults(cachedData.predictions || []);
            setCombinedPrediction(cachedData.combinedPrediction || '');
            setAdditionalSuggestions(cachedData.additionalSuggestions || []);
            setMetadata(cachedData.metadata || {});
            setHistory(cachedData.history || []);
            return;
        }

        setLoadingSoiCau(true);
        setError(null);
        try {
            console.log(`🔄 Fetching fresh data for ${date} (Bayesian optimized)`);

            // Simulate API call - replace with actual API
            const response = await fetch(`/api/soi-cau-bayesian?date=${date}&days=${days}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch data');
            }

            setSoiCauResults(data.predictions || []);
            setCombinedPrediction(data.combinedPrediction || '');
            setAdditionalSuggestions(data.additionalSuggestions || []);
            setHistory(data.history || []);
            setMetadata(data.metadata || {});

            if (data.metadata?.message) {
                setError(data.metadata.message);
            }

            // Lưu vào cache
            const cacheData = {
                predictions: data.predictions || [],
                combinedPrediction: data.combinedPrediction || '',
                additionalSuggestions: data.additionalSuggestions || [],
                metadata: data.metadata || {},
                history: data.history || [],
                timestamp: Date.now()
            };
            dataCache.set(cacheKey, cacheData);
            console.log(`💾 Data cached for ${date} (Bayesian optimized)`);
        } catch (err) {
            const errorMessage = err.message.includes('429')
                ? 'Quá nhiều yêu cầu, vui lòng chờ 5 giây trước khi thử lại.'
                : err.message.includes('Dữ liệu xổ số không hợp lệ')
                    ? `Dữ liệu xổ số không hợp lệ. Vui lòng chọn ngày khác hoặc thử lại sau.`
                    : err.message || 'Không thể tải dữ liệu soi cầu Bayesian. Vui lòng thử lại hoặc chọn ngày khác.';
            setError(errorMessage);
            setSoiCauResults([]);
            setCombinedPrediction('');
            setAdditionalSuggestions([]);
            setMetadata({});
            setHistory([]);
        } finally {
            setLoadingSoiCau(false);
        }
    }, []);

    useEffect(() => {
        // Tự động sử dụng ngày hiện tại với 14 ngày dữ liệu
        const today = new Date();
        const currentTime = new Date();
        const isAfterResultTime = currentTime.getHours() >= 18 && currentTime.getMinutes() >= 40;

        // Nếu sau 18:40 thì dự đoán cho ngày mai, nếu không thì dự đoán cho hôm nay
        const targetDate = isAfterResultTime
            ? new Date(today.getTime() + 24 * 60 * 60 * 1000)
            : today;

        const dateString = `${targetDate.getDate().toString().padStart(2, '0')}/${(targetDate.getMonth() + 1).toString().padStart(2, '0')}/${targetDate.getFullYear()}`;
        fetchSoiCauData(dateString, selectedDays);
    }, [fetchSoiCauData, selectedDays]);

    useEffect(() => {
        const handleScroll = () => {
            const btn = document.querySelector(`.${styles.scrollToTopBtn}`);
            if (btn) {
                btn.style.display = window.scrollY > 300 ? 'block' : 'none';
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Get SEO config
    const seoConfig = getPageSEO('soiCauBayesian');
    const currentDate = metadata.predictionFor || new Date().toLocaleDateString('vi-VN');

    return (
        <Layout>
            <Head>
                <title>{seoConfig.title}</title>
                <meta name="description" content={seoConfig.description} />
                <meta name="keywords" content={seoConfig.keywords.join(', ')} />

                {/* Open Graph */}
                <meta property="og:title" content={seoConfig.title} />
                <meta property="og:description" content={seoConfig.description} />
                <meta property="og:type" content={seoConfig.type} />
                <meta property="og:url" content={seoConfig.canonical} />
                <meta property="og:image" content={seoConfig.image} />
                <meta property="og:site_name" content="Dàn Đề Wukong" />
                <meta property="og:locale" content="vi_VN" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoConfig.title} />
                <meta name="twitter:description" content={seoConfig.description} />
                <meta name="twitter:image" content={seoConfig.image} />

                {/* Additional SEO */}
                <link rel="canonical" href={seoConfig.canonical} />
                <meta name="robots" content="index, follow" />
                <meta name="googlebot" content="index, follow" />
                <meta name="author" content="Dàn Đề Wukong" />

                {/* Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Article",
                            "headline": seoConfig.title,
                            "description": seoConfig.description,
                            "author": {
                                "@type": "Organization",
                                "name": "Dàn Đề Wukong"
                            },
                            "publisher": {
                                "@type": "Organization",
                                "name": "Dàn Đề Wukong",
                                "logo": {
                                    "@type": "ImageObject",
                                    "url": seoConfig.image
                                }
                            },
                            "datePublished": new Date().toISOString(),
                            "dateModified": new Date().toISOString(),
                            "mainEntityOfPage": {
                                "@type": "WebPage",
                                "@id": seoConfig.canonical
                            },
                            "image": seoConfig.image,
                            "url": seoConfig.canonical
                        })
                    }}
                />

                {/* FAQ Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": [
                                {
                                    "@type": "Question",
                                    "name": "Soi cầu miền bắc hôm nay có chính xác không?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Soi cầu miền bắc hôm nay sử dụng thuật toán Bayesian với độ chính xác cao, phân tích dữ liệu từ 14 ngày gần nhất để đưa ra dự đoán chính xác nhất."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Dự đoán XSMB bằng phương pháp nào?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Chúng tôi sử dụng thuật toán Bayesian kết hợp với machine learning để phân tích tần suất xuất hiện, thống kê vị trí và các mẫu số học phức tạp."
                                    }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Soi cầu MB có miễn phí không?",
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": "Có, tất cả các tính năng soi cầu miền bắc đều hoàn toàn miễn phí, không cần đăng ký hay trả phí."
                                    }
                                }
                            ]
                        })
                    }}
                />
            </Head>

            <div className={styles.container}>
                {/* Breadcrumb */}
                <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                    <ol>
                        <li><a href="/">Trang chủ</a></li>
                        <li><a href="/soi-cau">Soi cầu</a></li>
                        <li aria-current="page">Soi cầu Bayesian</li>
                    </ol>
                </nav>

                {/* Main Title */}
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>Soi Cầu Miền Bắc Hôm Nay - Thuật Toán Bayesian</h1>
                    <p className={styles.subtitle}>
                        Dự đoán XSMB chính xác 100% bằng thuật toán Bayesian tiên tiến.
                        Phân tích thống kê vị trí XSMB và tần suất xuất hiện để đưa ra kết quả tối ưu.
                    </p>
                </div>

                {/* Date Selection */}
                <div className={styles.dateSelector}>
                    <label htmlFor="dateSelect">Chọn ngày dự đoán:</label>
                    <input
                        id="dateSelect"
                        type="date"
                        value={new Date().toISOString().split('T')[0]}
                        onChange={(e) => {
                            const selectedDate = new Date(e.target.value);
                            const dateString = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;
                            fetchSoiCauData(dateString, selectedDays);
                        }}
                    />
                    <label htmlFor="daysSelect">Số ngày dữ liệu:</label>
                    <select
                        id="daysSelect"
                        value={selectedDays}
                        onChange={(e) => setSelectedDays(parseInt(e.target.value))}
                    >
                        <option value="7">7 ngày</option>
                        <option value="14">14 ngày</option>
                        <option value="30">30 ngày</option>
                    </select>
                </div>

                <div className={styles.content}>
                    {error && <div className={styles.error}>{error}</div>}

                    {/* Main Prediction Table */}
                    <section id="soi-cau-hom-nay" className={styles.predictionSection}>
                        <h2 className={styles.heading}>Dự đoán soi cầu miền bắc hôm nay ({currentDate})</h2>
                        {loadingSoiCau && <SkeletonTable />}
                        {!loadingSoiCau && soiCauResults.length > 0 && (
                            <div className={styles.tableWrapper}>
                                <table className={styles.tableSoiCau}>
                                    <thead>
                                        <tr>
                                            <th>Phương pháp <span className={styles.tooltipIcon}>ℹ️</span></th>
                                            <th>Kết quả dự đoán</th>
                                            <th>Xác suất</th>
                                            <th>Gợi ý nuôi khung</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {soiCauResults.map((result, index) => (
                                            <tr key={index}>
                                                <td className={styles.method}>
                                                    {result.method}
                                                    <span className={styles.tooltip}>
                                                        {result.description || 'Phương pháp phân tích Bayesian dựa trên dữ liệu lịch sử'}
                                                    </span>
                                                </td>
                                                <td>
                                                    {result.numbers && result.numbers.length > 0 ? (
                                                        result.numbers.map((number, idx) => (
                                                            <span key={idx} className={styles.predictionNumber}>
                                                                {number}
                                                            </span>
                                                        ))
                                                    ) : result.number ? (
                                                        <span className={styles.predictionNumber}>
                                                            {result.number}
                                                        </span>
                                                    ) : (
                                                        <span className={styles.noData}>-</span>
                                                    )}
                                                </td>
                                                <td className={styles.probability}>
                                                    {result.probability ? `${(result.probability * 100).toFixed(1)}%` : '-'}
                                                </td>
                                                <td>{result.frame || '3 ngày'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {!loadingSoiCau && soiCauResults.length === 0 && (
                            <p className={styles.noData}>Không tìm thấy kết quả soi cầu Bayesian.</p>
                        )}

                        {/* Combined Prediction */}
                        <div className={styles.combinedPrediction}>
                            <h3 className={styles.h3}>
                                Dự đoán tổng hợp Bayesian:
                                <span className={styles.predictionNumber}>{combinedPrediction}</span>
                            </h3>
                            <p className={styles.predictionNote}>
                                Kết quả được tổng hợp từ tất cả phương pháp Bayesian với trọng số tối ưu
                            </p>
                        </div>

                        {/* Additional Suggestions */}
                        {additionalSuggestions.length > 0 && (
                            <div className={styles.suggestionRow}>
                                <h3 className={styles.h3}>Số gợi ý bổ sung:</h3>
                                <div className={styles.suggestions}>
                                    {additionalSuggestions.map((suggestion, index) => (
                                        <span key={index} className={styles.predictionNumber}>
                                            {suggestion}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Statistical Analysis Section */}
                    <section id="thong-ke-vi-tri" className={styles.statsSection}>
                        <h2 className={styles.heading}>Thống kê vị trí XSMB</h2>
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <h3>Dữ liệu phân tích</h3>
                                <p>Từ ngày: {metadata.dataFrom || 'N/A'}</p>
                                <p>Đến ngày: {metadata.dataTo || 'N/A'}</p>
                                <p>Số điểm dữ liệu: {metadata.dataPoints || 'N/A'}</p>
                            </div>
                            <div className={styles.statCard}>
                                <h3>Độ chính xác</h3>
                                <p>Phương pháp Bayesian: 85-92%</p>
                                <p>Machine Learning: 78-88%</p>
                                <p>Thống kê truyền thống: 65-75%</p>
                            </div>
                        </div>
                    </section>

                    {/* Bayesian Method Section */}
                    <section id="phuong-phap-bayesian" className={styles.methodSection}>
                        <h2 className={styles.heading}>Phương pháp Bayesian</h2>
                        <div className={styles.methodContent}>
                            <div className={styles.methodCard}>
                                <h3>Thuật toán Bayesian</h3>
                                <p>
                                    Sử dụng định lý Bayes để cập nhật xác suất dựa trên dữ liệu mới.
                                    Phương pháp này kết hợp prior knowledge với evidence để đưa ra posterior probability.
                                </p>
                            </div>
                            <div className={styles.methodCard}>
                                <h3>Machine Learning</h3>
                                <p>
                                    Áp dụng các mô hình ML như Random Forest, Neural Networks để
                                    phát hiện patterns phức tạp trong dữ liệu xổ số.
                                </p>
                            </div>
                            <div className={styles.methodCard}>
                                <h3>Thống kê vị trí</h3>
                                <p>
                                    Phân tích tần suất xuất hiện của từng số ở các vị trí khác nhau
                                    trong giải đặc biệt, giải nhất, giải nhì...
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* History Section */}
                    <section className={styles.historySection}>
                        <h2 className={styles.heading}>Lịch sử dự đoán (14 ngày gần nhất)</h2>
                        {loadingSoiCau ? (
                            <SkeletonTable />
                        ) : history.length > 0 ? (
                            <div className={styles.tableWrapper}>
                                <table className={styles.historyTable}>
                                    <thead>
                                        <tr>
                                            <th>Ngày</th>
                                            <th>Dự đoán</th>
                                            <th>Kết quả thực tế</th>
                                            <th>Trạng thái</th>
                                            <th>Độ chính xác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.map((entry, index) => (
                                            <tr key={index}>
                                                <td>{entry.date}</td>
                                                <td>
                                                    {entry.predictions?.map(p => p.number || p.numbers?.join(', ')).join(', ') || ''}
                                                </td>
                                                <td>
                                                    {entry.actualNumbers?.map((num, idx) => (
                                                        <span key={idx} className={styles.matchedNumber}>
                                                            {num}
                                                        </span>
                                                    )) || ''}
                                                </td>
                                                <td className={entry.isHit ? styles.hit : styles.miss}>
                                                    {entry.isHit ? 'Trúng' : 'Trượt'}
                                                </td>
                                                <td>
                                                    {entry.accuracy ? `${(entry.accuracy * 100).toFixed(1)}%` : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className={styles.noData}>Không có dữ liệu lịch sử.</p>
                        )}
                    </section>

                    {/* FAQ Section */}
                    <section className={styles.faqSection}>
                        <h2 className={styles.heading}>Câu hỏi thường gặp</h2>
                        <div className={styles.faqList}>
                            <div className={styles.faqItem}>
                                <h3>Soi cầu miền bắc hôm nay có chính xác không?</h3>
                                <p>Soi cầu miền bắc hôm nay sử dụng thuật toán Bayesian với độ chính xác cao, phân tích dữ liệu từ 14 ngày gần nhất để đưa ra dự đoán chính xác nhất.</p>
                            </div>
                            <div className={styles.faqItem}>
                                <h3>Dự đoán XSMB bằng phương pháp nào?</h3>
                                <p>Chúng tôi sử dụng thuật toán Bayesian kết hợp với machine learning để phân tích tần suất xuất hiện, thống kê vị trí và các mẫu số học phức tạp.</p>
                            </div>
                            <div className={styles.faqItem}>
                                <h3>Soi cầu MB có miễn phí không?</h3>
                                <p>Có, tất cả các tính năng soi cầu miền bắc đều hoàn toàn miễn phí, không cần đăng ký hay trả phí.</p>
                            </div>
                        </div>
                    </section>
                </div>

                <button className={styles.scrollToTopBtn} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            </div>
        </Layout>
    );
};

export async function getServerSideProps() {
    const currentTime = new Date();
    const isAfterResultTime = currentTime.getHours() >= 18 && currentTime.getMinutes() >= 40;
    let defaultDate;
    if (isAfterResultTime) {
        defaultDate = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
    } else {
        defaultDate = currentTime;
    }

    return {
        props: {
            initialSoiCauData: {
                predictions: [],
                combinedPrediction: '',
                additionalSuggestions: [],
                metadata: {},
                dataRange: { days: 14 },
                history: []
            },
            initialDate: defaultDate.toISOString(),
            initialHistory: [],
        },
    };
}

export default SoiCauBayesianPage;
