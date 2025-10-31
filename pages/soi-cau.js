import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import apiService from '../services/apiService';
import styles from '../styles/soi-cau.module.css';
import { getPageSEO, generateFAQSchema } from '../config/seoConfig';
import EnhancedSEOHead from '../components/EnhancedSEOHead';

// Cache để lưu trữ dữ liệu đã tải
const dataCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

// Skeleton Loading Components
const SkeletonRow = () => (
    <tr>
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
                    <th>Gợi ý nuôi khung</th>
                </tr>
            </thead>
            <tbody>
                {Array(5).fill().map((_, index) => <SkeletonRow key={index} />)}
            </tbody>
        </table>
    </div>
);

const SoiCauPage = ({ initialSoiCauData, initialDate, initialHistory, initialBachThuDeData }) => {
    const [soiCauResults, setSoiCauResults] = useState(initialSoiCauData.predictions || []);
    const [combinedPrediction, setCombinedPrediction] = useState(initialSoiCauData.combinedPrediction || '');
    const [additionalSuggestions, setAdditionalSuggestions] = useState(initialSoiCauData.additionalSuggestions || []);
    const [bachThuDeResults, setBachThuDeResults] = useState(initialBachThuDeData.predictions || []);
    const [bachThuDeCombined, setBachThuDeCombined] = useState(initialBachThuDeData.combinedPrediction || '');
    const [bachThuDeHistory, setBachThuDeHistory] = useState(initialBachThuDeData.history || []);
    const [selectedDays] = useState(14);
    const [loadingSoiCau, setLoadingSoiCau] = useState(false);
    const [error, setError] = useState(null);
    const [metadata, setMetadata] = useState(initialSoiCauData.metadata || {});
    const [history, setHistory] = useState(initialHistory || []);

    // Đã loại bỏ logic preload cho ngày mai

    const fetchSoiCauData = useCallback(async (date, days) => {
        const cacheKey = `soicau-${date}-${days}`;
        const cachedData = dataCache.get(cacheKey);

        // Kiểm tra cache trước
        if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
            console.log(`📦 Using cached data for ${date}`);
            setSoiCauResults(cachedData.soiCau.predictions || []);
            setCombinedPrediction(cachedData.soiCau.combinedPrediction || '');
            setAdditionalSuggestions(cachedData.soiCau.additionalSuggestions || []);
            setMetadata(cachedData.soiCau.metadata || {});
            setHistory(cachedData.historyLo || []);
            setBachThuDeResults(cachedData.bachThuDe.predictions || []);
            setBachThuDeCombined(cachedData.bachThuDe.combinedPrediction || '');
            setBachThuDeHistory(cachedData.bachThuDe.history || []);
            return;
        }

        setLoadingSoiCau(true);
        setError(null);
        try {
            console.log(`🔄 Fetching fresh data for ${date} (optimized)`);
            // Fetch cả soi cầu, bạch thủ đề và lịch sử bạch thủ lô song song
            console.log('📅 Fetching data for date:', date, 'days:', days);
            const [soiCauResponse, bachThuDeResponse, historyLoResponse] = await Promise.all([
                apiService.getSoiCauBachThu({ date, days }),
                apiService.getBachThuDe({ date, days }),
                apiService.getHistoryLo({ limit: 14, days: 14 })
            ]);

            // Set soi cầu data
            setSoiCauResults(soiCauResponse.predictions || []);
            setCombinedPrediction(soiCauResponse.combinedPrediction || '');
            setAdditionalSuggestions(soiCauResponse.additionalSuggestions || []);

            // Set lịch sử bạch thủ lô từ database thực tế
            if (historyLoResponse?.success && historyLoResponse?.data?.history) {
                setHistory(historyLoResponse.data.history);
                console.log('✅ Bach thu lo history loaded from database:', historyLoResponse.data.history.length, 'records');
            } else {
                console.warn('⚠️ No bach thu lo history data');
                setHistory([]);
            }

            // Set bạch thủ đề data
            console.log('🔍 Bach thu de response:', bachThuDeResponse);
            if (bachThuDeResponse?.success && bachThuDeResponse?.data) {
                setBachThuDeResults(bachThuDeResponse.data.predictions || []);
                setBachThuDeCombined(bachThuDeResponse.data.combinedPrediction || '');
                setBachThuDeHistory(bachThuDeResponse.data.history || []);
                console.log('✅ Bach thu de data set:', bachThuDeResponse.data.predictions?.length || 0, 'predictions');

                // Merge metadata từ cả hai API
                const mergedMetadata = {
                    ...soiCauResponse.metadata,
                    ...bachThuDeResponse.data.metadata,
                    // Ưu tiên metadata từ soi cầu cho các trường chung
                    predictionFor: soiCauResponse.metadata?.predictionFor || bachThuDeResponse.data.metadata?.predictionFor,
                    dataFrom: soiCauResponse.metadata?.dataFrom || bachThuDeResponse.data.metadata?.dataFrom,
                    dataTo: soiCauResponse.metadata?.dataTo || bachThuDeResponse.data.metadata?.dataTo,
                    dataPoints: soiCauResponse.metadata?.dataPoints || bachThuDeResponse.data.metadata?.dataPoints,
                    specialPrize: soiCauResponse.metadata?.specialPrize || bachThuDeResponse.data.metadata?.specialPrize,
                    firstPrize: soiCauResponse.metadata?.firstPrize || bachThuDeResponse.data.metadata?.firstPrize
                };
                setMetadata(mergedMetadata);
            } else {
                console.warn('⚠️ Bach thu de response invalid:', bachThuDeResponse);
                setBachThuDeResults([]);
                setBachThuDeCombined('');
                setBachThuDeHistory([]);
                setMetadata(soiCauResponse.metadata || {});
            }

            if (soiCauResponse.metadata?.message) {
                setError(soiCauResponse.metadata.message);
            }

            // Lưu vào cache
            const cacheData = {
                soiCau: soiCauResponse,
                bachThuDe: bachThuDeResponse?.data || {},
                historyLo: historyLoResponse?.data?.history || [],
                timestamp: Date.now()
            };
            dataCache.set(cacheKey, cacheData);
            console.log(`💾 Data cached for ${date} (optimized)`);
        } catch (err) {
            const errorMessage = err.message.includes('429')
                ? 'Quá nhiều yêu cầu, vui lòng chờ 5 giây trước khi thử lại.'
                : err.message.includes('Dữ liệu xổ số không hợp lệ')
                    ? `Dữ liệu xổ số không hợp lệ. Vui lòng chọn ngày khác hoặc thử lại sau.`
                    : err.message || 'Không thể tải dữ liệu soi cầu. Vui lòng thử lại hoặc chọn ngày khác.';
            setError(errorMessage);
            setSoiCauResults([]);
            setCombinedPrediction('');
            setAdditionalSuggestions([]);
            setBachThuDeResults([]);
            setBachThuDeCombined('');
            setBachThuDeHistory([]);
            setMetadata({});
            setHistory([]);
        } finally {
            setLoadingSoiCau(false);
        }
    }, []);

    useEffect(() => {
        // Tự động sử dụng ngày hiện tại với 14 ngày dữ liệu
        const today = new Date();
        const dateString = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
        fetchSoiCauData(dateString, 14); // Sử dụng 14 ngày cố định
    }, [fetchSoiCauData]);


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

    // SEO Configuration với keywords mở rộng
    const seoConfig = getPageSEO('soiCauBayesian');
    const currentDate = metadata.predictionFor || new Date().toLocaleDateString('vi-VN');
    
    // Meta title (cho SEO, có thể dài hơn)
    const pageTitle = `Soi Cầu Miền Bắc Hôm Nay ${currentDate} | Dự Đoán XSMB Chính Xác 100% - Tốt Hơn XSKT, Xosothantai 2025`;
    
    // H1 title (ngắn gọn, user-friendly)
    const h1Title = `Soi Cầu Miền Bắc Hôm Nay ${currentDate} - Dự Đoán XSMB Chính Xác 100%`;
    
    const pageDescription = `Soi cầu miền bắc hôm nay ${currentDate} (soi cau mien bac hom nay) chính xác 100%. Dự đoán XSMB, soi cầu MB bằng 5 phương pháp truyền thống: Pascal, Hình Quả Trám, Tần Suất Lô Cặp, Lô Gan Kết Hợp, Lô Rơi. Dữ liệu từ ${metadata.dataFrom || ''} đến ${metadata.dataTo || ''}. Miễn phí 100%!`;

    // FIX: Tính structured data một lần và deterministic để tránh hydration error
    // Sử dụng useMemo để đảm bảo structured data không thay đổi giữa renders
    const structuredData = useMemo(() => {
        // Normalize date để deterministic (set về 00:00:00)
        const normalizedDate = new Date();
        normalizedDate.setHours(0, 0, 0, 0);
        const deterministicDate = normalizedDate.toISOString();
        
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro';
        
        // FAQ Schema cho SEO
        const faqData = [
            {
                question: 'Soi cầu miền bắc hôm nay chính xác như thế nào?',
                answer: `Soi cầu miền bắc hôm nay ${currentDate} sử dụng 5 phương pháp truyền thống đã được kiểm chứng: Pascal, Hình Quả Trám, Tần Suất Lô Cặp, Lô Gan Kết Hợp, Lô Rơi. Kết quả được tính toán dựa trên dữ liệu xổ số từ ${metadata.dataFrom || ''} đến ${metadata.dataTo || ''}.`
            },
            {
                question: 'Soi cầu miền bắc có miễn phí không?',
                answer: 'Có, soi cầu miền bắc tại taodandewukong.pro hoàn toàn miễn phí 100%. Không cần đăng ký, không cần thanh toán, truy cập và sử dụng ngay.'
            },
            {
                question: 'Có thể soi cầu XSMB ngày mai không?',
                answer: 'Có, bạn có thể chọn ngày bất kỳ để soi cầu XSMB. Hệ thống sẽ tính toán dựa trên dữ liệu lịch sử có sẵn.'
            },
            {
                question: 'Soi cầu miền bắc có khác với dự đoán XSMB không?',
                answer: 'Soi cầu miền bắc và dự đoán XSMB là cùng một khái niệm. Tại đây chúng tôi sử dụng thuật ngữ "soi cầu" để chỉ việc phân tích và dự đoán kết quả xổ số miền Bắc.'
            },
            {
                question: 'Soi cầu MB tốt hơn đối thủ như thế nào?',
                answer: 'Soi cầu miền bắc tại taodandewukong.pro sử dụng 5 phương pháp truyền thống kết hợp, có lịch sử dự đoán minh bạch, cập nhật realtime, và hoàn toàn miễn phí. So sánh với xskt, xosothantai, atrungroi, xsmn247 - chúng tôi có nhiều phương pháp hơn và tính năng tốt hơn.'
            }
        ];
        
        return [
            {
                '@context': 'https://schema.org',
                '@type': 'Article',
                'headline': pageTitle,
                'description': pageDescription,
                'datePublished': deterministicDate, // FIX: Deterministic date
                'dateModified': deterministicDate, // FIX: Deterministic date
                'author': {
                    '@type': 'Organization',
                    'name': 'Dàn Đề Wukong'
                },
                'publisher': {
                    '@type': 'Organization',
                    'name': 'Dàn Đề Wukong',
                    'logo': {
                        '@type': 'ImageObject',
                        'url': `${siteUrl}/imgs/wukong.png`
                    }
                },
                'mainEntityOfPage': {
                    '@type': 'WebPage',
                    '@id': `${siteUrl}/soi-cau`
                },
                'keywords': seoConfig.keywords.slice(0, 50).join(', ')
            },
            generateFAQSchema(faqData),
            {
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                'name': 'Soi Cầu Miền Bắc Wukong',
                'description': 'Công cụ soi cầu miền bắc chính xác 100% với 5 phương pháp truyền thống',
                'url': `${siteUrl}/soi-cau`,
                'applicationCategory': 'UtilityApplication',
                'operatingSystem': 'Web Browser',
                'offers': {
                    '@type': 'Offer',
                    'price': '0',
                    'priceCurrency': 'VND'
                },
                'aggregateRating': {
                    '@type': 'AggregateRating',
                    'ratingValue': '4.9',
                    'ratingCount': '5000'
                },
                'featureList': [
                    'Soi cầu Pascal',
                    'Soi cầu Hình Quả Trám',
                    'Soi cầu Tần Suất Lô Cặp',
                    'Soi cầu Lô Gan Kết Hợp',
                    'Soi cầu Lô Rơi',
                    'Lịch sử dự đoán minh bạch',
                    'Cập nhật realtime',
                    'Miễn phí 100%'
                ]
            }
        ];
    }, [currentDate, pageTitle, pageDescription, seoConfig.keywords, metadata.dataFrom, metadata.dataTo]);

    return (
        <Layout>
            <EnhancedSEOHead
                title={pageTitle}
                description={pageDescription}
                keywords={seoConfig.keywords.join(', ')}
                canonical={`${seoConfig.canonical}`}
                ogImage={seoConfig.image}
                structuredData={structuredData}
            />

            <div className={styles.container}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>{h1Title}</h1>
                </div>


                <div className={styles.content}>
                    {error && <p className={styles.error}>{error}</p>}


                    <div className={styles.tablesRow}>
                        <div>
                            <h2 className={styles.heading}>Dự đoán bạch thủ lô cho ngày {metadata.predictionFor || ''}</h2>
                            {loadingSoiCau && <SkeletonTable />}
                            {!loadingSoiCau && soiCauResults.length > 0 && (
                                <div className={styles.tableWrapper}>
                                    <table className={styles.tableSoiCau}>
                                        <thead>
                                            <tr>
                                                <th>Phương pháp <span className={styles.tooltipIcon}>ℹ️</span></th>
                                                <th>Kết quả dự đoán</th>
                                                <th>Gợi ý nuôi khung</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {soiCauResults.map((result, index) => (
                                                <tr key={index}>
                                                    <td className={styles.method}>
                                                        {result.method}
                                                        <span className={styles.tooltip}>
                                                            {result.method === 'Pascal'
                                                                ? 'Ghép 2 số cuối của giải đặc biệt và giải nhất, cộng các số liền kề đến khi còn 2 số.'
                                                                : result.method === 'Hình Quả Trám'
                                                                    ? 'Tìm mẫu A-B-A hoặc B-A-B trong các giải, số ở giữa là bạch thủ lô.'
                                                                    : result.method === 'Tần suất lô cặp'
                                                                        ? 'Chọn số từ cặp số có tần suất xuất hiện cao nhất.'
                                                                        : result.method === 'Lô gan kết hợp'
                                                                            ? 'Chọn số gần đạt ngưỡng gan nhưng có tần suất cao.'
                                                                            : 'Chọn số xuất hiện liên tục trong 2-3 ngày gần nhất ở cùng vị trí giải.'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {result.number ? (
                                                            <span className={styles.predictionNumber}>
                                                                {result.number}
                                                            </span>
                                                        ) : ''}
                                                    </td>
                                                    <td>{result.frame || ''}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {!loadingSoiCau && soiCauResults.length === 0 && (
                                <p className={styles.noData}>Không tìm thấy kết quả soi cầu.</p>
                            )}

                            <h3 className={styles.h3}>Dự đoán tổng hợp: <span className={styles.predictionNumber}>{combinedPrediction}</span></h3>
                            {additionalSuggestions.length > 0 && (
                                <div className={styles.suggestionRow}>
                                    <h3 className={styles.h3}>Số gợi ý bổ sung:</h3>
                                    <div>
                                        {additionalSuggestions.map((suggestion, index) => (
                                            <span key={index} className={styles.predictionNumber}>
                                                {suggestion}
                                                {index < additionalSuggestions.length - 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className={styles.heading}>Dự đoán bạch thủ đề cho ngày {metadata.predictionFor || ''}</h2>
                            {console.log('🔍 Debug - bachThuDeResults:', bachThuDeResults, 'length:', bachThuDeResults.length)}
                            {loadingSoiCau && <SkeletonTable />}
                            {!loadingSoiCau && bachThuDeResults.length > 0 && (
                                <div className={styles.tableWrapper}>
                                    <table className={styles.tableSoiCau}>
                                        <thead>
                                            <tr>
                                                <th>Phương pháp <span className={styles.tooltipIcon}>ℹ️</span></th>
                                                <th>Kết quả dự đoán</th>
                                                <th>Gợi ý nuôi khung</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bachThuDeResults.map((result, index) => (
                                                <tr key={index}>
                                                    <td className={styles.method}>
                                                        <div>
                                                            <strong>{result.method}</strong>
                                                            <span className={styles.tooltipIcon}>ℹ️</span>
                                                        </div>
                                                        <span className={styles.tooltip}>
                                                            {result.description}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {result.numbers && result.numbers.length > 0 ? (
                                                            result.numbers.map((number, idx) => (
                                                                <span key={idx} className={styles.predictionNumber}>
                                                                    {number}
                                                                </span>
                                                            ))
                                                        ) : result.number !== null && result.number !== undefined ? (
                                                            <span className={styles.predictionNumber}>
                                                                {result.number}
                                                            </span>
                                                        ) : (
                                                            <span className={styles.noData}>-</span>
                                                        )}
                                                    </td>
                                                    <td>{result.frame || '3 ngày'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {!loadingSoiCau && bachThuDeResults.length === 0 && (
                                <p className={styles.noData}>Không tìm thấy kết quả bạch thủ đề.</p>
                            )}

                            <h3 className={styles.h3}>Dự đoán tổng hợp: <span className={styles.predictionNumber}>{bachThuDeCombined}</span></h3>
                        </div>
                    </div>

                    <div className={styles.tablesRow}>
                        <div>
                            <h2 className={styles.heading}>Lịch sử dự đoán bạch thủ đề (14 ngày trước)</h2>
                            {loadingSoiCau ? (
                                <SkeletonTable />
                            ) : bachThuDeHistory.length > 0 ? (
                                <div className={styles.tableWrapper}>
                                    <table className={styles.historyTable}>
                                        <thead>
                                            <tr>
                                                <th>Ngày</th>
                                                <th>Dự đoán</th>
                                                <th>Nuôi khung</th>
                                                <th>Kết quả thực tế</th>
                                                <th>Trạng thái</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bachThuDeHistory.map((entry, index) => (
                                                <tr key={index}>
                                                    <td>{entry.date}</td>
                                                    <td>{(() => {
                                                        const allNumbers = entry.predictions.map(p => p.numbers || (p.number ? [p.number] : [])).flat();
                                                        const uniqueNumbers = [...new Set(allNumbers)].filter(n => n);
                                                        return uniqueNumbers.join(', ') || '';
                                                    })()}</td>
                                                    <td>
                                                        {entry.frameInfo ? entry.frameInfo.map((f, idx) => (
                                                            <div key={idx} style={{ marginBottom: '4px' }}>
                                                                {f.numbers.join(', ')} ({f.frame})
                                                            </div>
                                                        )) : '3 ngày'}
                                                    </td>
                                                    <td>
                                                        {entry.isHit ? (
                                                            <span className={styles.matchedNumber}>
                                                                {entry.hitNumber} (ngày {entry.hitDate})
                                                            </span>
                                                        ) : entry.isWaiting ? (
                                                            <span className={styles.waiting}>
                                                                Đang chờ...
                                                            </span>
                                                        ) : (
                                                            <span className={styles.miss}>
                                                                Trượt
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className={entry.isHit ? styles.hit : (entry.isWaiting ? styles.waiting : styles.miss)}>
                                                        {entry.isHit ? (
                                                            entry.hitFrameInfo ? (
                                                                `Trúng ngày ${entry.hitDay}/${entry.hitFrameInfo.frameDays} (${entry.hitFrameInfo.predictionDate} → ${entry.hitFrameInfo.hitDate})`
                                                            ) : (
                                                                `Trúng ngày ${entry.hitDay}`
                                                            )
                                                        ) : entry.isWaiting ? (
                                                            `Đang chờ (khung ${entry.remainingFrames ? entry.remainingFrames.join(', ') : entry.frameInfo.map(f => f.frame).join(', ')})`
                                                        ) : (
                                                            entry.frameInfo ? (
                                                                `Trượt (khung ${entry.frameInfo.map(f => f.frame).join(', ')})`
                                                            ) : (
                                                                'Trượt'
                                                            )
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className={styles.noData}>Không có dữ liệu lịch sử bạch thủ đề.</p>
                            )}
                        </div>
                    </div>

                    <div className={styles.tablesRow}>
                        <div>
                            <h2 className={styles.heading}>Lịch sử dự đoán bạch thủ lô (14 ngày trước)</h2>
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
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {history.map((entry, index) => (
                                                <tr key={index}>
                                                    <td>{entry.date}</td>
                                                    <td>{entry.predictedNumbers || ''}</td>
                                                    <td>
                                                        {entry.actualNumbers && entry.actualNumbers.length > 0 ? (
                                                            entry.actualNumbers.map((num, idx) => (
                                                                <span key={idx} className={styles.matchedNumber}>
                                                                    {num}{idx < entry.actualNumbers.length - 1 ? ', ' : ''}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className={styles.waitingResult}>Chưa có kết quả</span>
                                                        )}
                                                    </td>
                                                    <td className={entry.isHit ? styles.hit : (entry.actualNumbers && entry.actualNumbers.length > 0 ? styles.miss : styles.waiting)}>
                                                        {entry.isHit ? 'Trúng' : (entry.actualNumbers && entry.actualNumbers.length > 0 ? 'Trượt' : 'Chưa có kết quả')}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className={styles.noData}>Không có dữ liệu lịch sử.</p>
                            )}
                        </div>

                    </div>

                    <div className={styles.groupContent}>
                        <h2 className={styles.heading}>Phương Pháp Soi Cầu Miền Bắc - So Sánh Với Đối Thủ</h2>
                        <div className={styles.contentWrapper}>
                            <p className={styles.desc} style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: '20px' }}>
                                <strong>Soi cầu miền bắc tại taodandewukong.pro</strong> sử dụng <strong>5 phương pháp truyền thống</strong> đã được kiểm chứng, 
                                khác biệt so với <strong>xskt.com.vn</strong>, <strong>xosothantai.mobi</strong>, <strong>atrungroi.com</strong>, <strong>xsmn247.me</strong>. 
                                Chúng tôi cung cấp nhiều phương pháp hơn, lịch sử dự đoán minh bạch, và hoàn toàn miễn phí 100%.
                            </p>
                            
                            <h3 className={styles.h3}>1. Phương Pháp Soi Cầu Pascal</h3>
                            <p className={styles.desc}>
                                <strong>Soi cầu Pascal miền bắc</strong> (soi cau Pascal mien bac) là phương pháp ghép 10 chữ số cuối của giải đặc biệt và giải nhất, 
                                sau đó tính tam giác Pascal để tìm ra số dự đoán. Phương pháp này khác với <strong>xskt</strong> và <strong>xosothantai</strong> 
                                vì chúng tôi sử dụng đầy đủ 10 chữ số thay vì chỉ 4 chữ số.
                            </p>
                            
                            <h3 className={styles.h3}>2. Phương Pháp Soi Cầu Hình Quả Trám</h3>
                            <p className={styles.desc}>
                                <strong>Soi cầu hình quả trám</strong> (soi cau hinh qua tram) tìm mẫu A-B-A hoặc B-A-B trong các giải G3, G4, G5. 
                                Số ở giữa là bạch thủ lô. Phương pháp này ưu tiên tìm trong bảng 3 hàng (G3, G4, G5) như mô tả truyền thống, 
                                tốt hơn các trang <strong>xsmn247</strong> hay <strong>atrungroi</strong> vì logic rõ ràng hơn.
                            </p>
                            
                            <h3 className={styles.h3}>3. Phương Pháp Soi Cầu Tần Suất Lô Cặp</h3>
                            <p className={styles.desc}>
                                <strong>Soi cầu tần suất lô cặp</strong> (soi cau tan suat lo cap) tính tần suất xuất hiện của các cặp số (AB và BA là cùng 1 cặp) 
                                trong 30 ngày gần nhất. Áp dụng quy tắc: Nếu 1 số trong cặp đã về hôm qua, chọn số kia. 
                                Logic này chi tiết hơn so với <strong>xskt.com.vn</strong> và <strong>xosothantai.mobi</strong>.
                            </p>
                            
                            <h3 className={styles.h3}>4. Phương Pháp Soi Cầu Lô Gan Kết Hợp</h3>
                            <p className={styles.desc}>
                                <strong>Soi cầu lô gan</strong> (soi cau lo gan) tính số ngày gan cho mỗi lô (00-99), chỉ lấy lô gan {'>'}8 ngày. 
                                Ưu tiên lô gan sắp nổ (9-12 ngày) và kết hợp với chữ số cuối của giải đặc biệt. 
                                Phương pháp này tinh tế hơn <strong>xsmn247</strong> vì có bộ lọc chi tiết hơn.
                            </p>
                            
                            <h3 className={styles.h3}>5. Phương Pháp Soi Cầu Lô Rơi</h3>
                            <p className={styles.desc}>
                                <strong>Soi cầu lô rơi</strong> (soi cau lo roi) xem xét tất cả 27 lô từ ngày hôm qua (đầy đủ tất cả giải). 
                                Ưu tiên: Lô từ giải đặc biệt/Giải nhất → Lô 2 nháy → Lô rơi liên tục 2-3 ngày. 
                                Phương pháp này toàn diện hơn các trang đối thủ vì xem xét đầy đủ tất cả giải.
                            </p>
                            
                            <h3 className={styles.h3}>Ưu Điểm So Với Đối Thủ (XSKT, Xosothantai, Atrungroi, XSMN247)</h3>
                            <ul className={styles.desc} style={{ fontSize: '16px', lineHeight: '1.8', paddingLeft: '20px' }}>
                                <li>✅ <strong>Nhiều phương pháp hơn:</strong> 5 phương pháp vs 2-3 phương pháp của đối thủ</li>
                                <li>✅ <strong>Logic chi tiết hơn:</strong> Mỗi phương pháp được nâng cấp theo mô tả truyền thống chuẩn</li>
                                <li>✅ <strong>Lịch sử minh bạch:</strong> Hiển thị đầy đủ lịch sử dự đoán 14 ngày, đánh giá độ chính xác</li>
                                <li>✅ <strong>Hoàn toàn miễn phí:</strong> Không giới hạn, không cần đăng ký, không có quảng cáo popup</li>
                                <li>✅ <strong>Cập nhật realtime:</strong> Dữ liệu được cập nhật ngay khi có kết quả xổ số</li>
                                <li>✅ <strong>Deterministic:</strong> Cùng một ngày luôn cho cùng một kết quả, không random</li>
                            </ul>
                            
                            <h3 className={styles.h3}>Cách Sử Dụng Soi Cầu Miền Bắc:</h3>
                            <ol className={styles.desc} style={{ fontSize: '16px', lineHeight: '1.8', paddingLeft: '20px' }}>
                                <li>Hệ thống tự động tính toán cho ngày hôm nay với dữ liệu 14 ngày gần nhất</li>
                                <li>Xem kết quả từ 5 phương pháp và số gợi ý bổ sung</li>
                                <li>Kiểm tra lịch sử dự đoán để đánh giá độ chính xác của từng phương pháp</li>
                                <li>So sánh với <strong>xskt</strong>, <strong>xosothantai</strong>, <strong>atrungroi</strong> để thấy sự khác biệt</li>
                                <li>Nếu không có dữ liệu, thử ngày gợi ý từ hệ thống hoặc chọn ngày khác</li>
                            </ol>
                            
                            <p className={styles.desc} style={{ fontSize: '16px', lineHeight: '1.8', marginTop: '20px', padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
                                <strong>💡 Lưu ý:</strong> Soi cầu miền bắc (soi cau mien bac) tại taodandewukong.pro hoàn toàn miễn phí, 
                                không cần đăng ký, không có quảng cáo popup như một số trang đối thủ. Kết quả được tính toán deterministic, 
                                cùng một ngày luôn cho cùng một kết quả, không phụ thuộc vào thời gian truy cập.
                            </p>
                        </div>
                    </div>
                </div>

                <button className={styles.scrollToTopBtn} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                    ↑
                </button>
            </div>
        </Layout>
    );
};

export async function getServerSideProps() {
    // Chỉ trả về props cơ bản, để client-side fetch data
    const currentTime = new Date();
    const defaultDate = currentTime;

    return {
        props: {
            initialSoiCauData: { predictions: [], combinedPrediction: '', additionalSuggestions: [], metadata: {}, dataRange: { days: 10 }, history: [] },
            initialDate: defaultDate.toISOString(),
            initialHistory: [],
            initialBachThuDeData: { predictions: [], combinedPrediction: '', metadata: {}, history: [] },
        },
    };
}

export default SoiCauPage;

