import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import apiService from '../services/apiService';
import styles from '../styles/soi-cau.module.css';

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
            setHistory(cachedData.soiCau.history || []);
            setBachThuDeResults(cachedData.bachThuDe.predictions || []);
            setBachThuDeCombined(cachedData.bachThuDe.combinedPrediction || '');
            setBachThuDeHistory(cachedData.bachThuDe.history || []);
            return;
        }

        setLoadingSoiCau(true);
        setError(null);
        try {
            console.log(`🔄 Fetching fresh data for ${date} (optimized)`);
            // Fetch cả soi cầu và bạch thủ đề song song
            console.log('📅 Fetching data for date:', date, 'days:', days);
            const [soiCauResponse, bachThuDeResponse] = await Promise.all([
                apiService.getSoiCauBachThu({ date, days }),
                apiService.getBachThuDe({ date, days })
            ]);

            // Set soi cầu data
            setSoiCauResults(soiCauResponse.predictions || []);
            setCombinedPrediction(soiCauResponse.combinedPrediction || '');
            setAdditionalSuggestions(soiCauResponse.additionalSuggestions || []);
            setHistory(soiCauResponse.history || []);

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

    const pageTitle = 'Soi cầu bạch thủ miền Bắc - phương pháp truyền thống';
    const pageDescription = `Dự đoán bạch thủ lô miền Bắc hôm nay (${metadata.predictionFor || ''}) dựa trên nhiều phương pháp, sử dụng kết quả xổ số từ ${metadata.dataFrom || ''} đến ${metadata.dataTo || ''}.`;

    return (
        <Layout>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://yourdomain.com/soi-cau" />
                <meta property="og:image" content="https://yourdomain.com/images/soi-cau-bach-thu.jpg" />
                <link rel="canonical" href="https://yourdomain.com/soi-cau" />
            </Head>

            <div className={styles.container}>
                <div className={styles.titleGroup}>
                    <h1 className={styles.title}>{pageTitle}</h1>
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
                                                    <td>{entry.predictions.filter(p => p.number).map(p => p.number).join(', ') || ''}</td>
                                                    <td>
                                                        {entry.actualNumbers.length > 0 ? (
                                                            entry.actualNumbers.map((num, idx) => (
                                                                <span key={idx} className={styles.matchedNumber}>
                                                                    {num}{idx < entry.actualNumbers.length - 1 ? ', ' : ''}
                                                                </span>
                                                            ))
                                                        ) : ''}
                                                    </td>
                                                    <td className={entry.isHit ? styles.hit : styles.miss}>
                                                        {entry.isHit ? 'Trúng' : 'Trượt'}
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
                        <h2 className={styles.heading}>Phương pháp soi cầu</h2>
                        <div className={styles.contentWrapper}>
                            <h3 className={styles.h3}>Phương pháp Pascal</h3>
                            <p className={styles.desc}>Ghép 2 số cuối của giải đặc biệt và giải nhất, cộng các số liền kề đến khi còn 2 số.</p>
                            <h3 className={styles.h3}>Phương pháp Hình Quả Trám</h3>
                            <p className={styles.desc}>Tìm mẫu A-B-A hoặc B-A-B trong các giải, số ở giữa là bạch thủ lô.</p>
                            <h3 className={styles.h3}>Phương pháp Tần suất lô cặp</h3>
                            <p className={styles.desc}>Chọn số từ cặp số có tần suất xuất hiện cao nhất.</p>
                            <h3 className={styles.h3}>Phương pháp Lô gan kết hợp</h3>
                            <p className={styles.desc}>Chọn số gần đạt ngưỡng gan nhưng có tần suất cao.</p>
                            <h3 className={styles.h3}>Phương pháp Lô rơi</h3>
                            <p className={styles.desc}>Chọn số xuất hiện liên tục trong 2-3 ngày gần nhất ở cùng vị trí giải.</p>
                            <h3 className={styles.h3}>Cách sử dụng:</h3>
                            <p className={styles.desc}>
                                - Chọn ngày và số ngày dữ liệu để phân tích.<br />
                                - Xem kết quả từ các phương pháp và số gợi ý bổ sung.<br />
                                - Kiểm tra lịch sử dự đoán để đánh giá độ chính xác.<br />
                                - Nếu không có dữ liệu, thử ngày gợi ý từ hệ thống.
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

