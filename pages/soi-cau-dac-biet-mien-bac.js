/**
 * Position Soi Cau Page
 * Trang soi cầu dựa trên vị trí số
 */

import React, { useState, useMemo } from 'react';
import Layout from '../components/Layout';
import EnhancedSEOHead from '../components/EnhancedSEOHead';
import { getPageSEO } from '../config/seoConfig';
import PositionSoiCau from '../components/PositionSoiCau';
import apiService from '../services/apiService';

const INITIAL_DATA_CACHE_TTL = 60 * 1000; // 60s để giảm áp lực SSR
const FALLBACK_CACHE_TTL = 20 * 1000; // fallback nên refresh nhanh hơn
const initialDataCache = new Map();

const FALLBACK_DATA_TEMPLATE = {
    totalResults: 3,
    patternsFound: 15,
    consistentPatterns: 8,
    metadata: {
        successRate: 75
    },
    predictions: [
        { predictedNumber: "08", position1: "(6-1-1)", position2: "(7-3-1)", confidence: 50 },
        { predictedNumber: "11", position1: "(2-0-0)", position2: "(4-1-0)", confidence: 50 },
        { predictedNumber: "12", position1: "(2-0-0)", position2: "(2-1-0)", confidence: 50 },
        { predictedNumber: "13", position1: "(2-0-0)", position2: "(5-2-3)", confidence: 50 },
        { predictedNumber: "15", position1: "(2-0-0)", position2: "(3-2-1)", confidence: 50 },
        { predictedNumber: "17", position1: "(2-0-0)", position2: "(3-5-2)", confidence: 50 },
        { predictedNumber: "18", position1: "(2-0-0)", position2: "(7-3-1)", confidence: 50 },
        { predictedNumber: "19", position1: "(2-0-0)", position2: "(6-0-1)", confidence: 50 },
        { predictedNumber: "21", position1: "(3-4-2)", position2: "(4-1-0)", confidence: 50 },
        { predictedNumber: "22", position1: "(3-4-2)", position2: "(4-0-0)", confidence: 50 },
        { predictedNumber: "23", position1: "(3-4-2)", position2: "(5-2-3)", confidence: 50 },
        { predictedNumber: "25", position1: "(3-4-2)", position2: "(5-4-0)", confidence: 50 },
        { predictedNumber: "27", position1: "(3-4-2)", position2: "(3-5-2)", confidence: 50 },
        { predictedNumber: "28", position1: "(3-4-2)", position2: "(7-3-1)", confidence: 50 },
        { predictedNumber: "29", position1: "(3-4-2)", position2: "(6-0-1)", confidence: 50 }
    ],
    tableStatistics: {
        "Đầu 0": [{ number: 8, count: 3 }],
        "Đầu 1": [{ number: 11, count: 2 }, { number: 12, count: 1 }],
        "Đầu 2": [{ number: 21, count: 2 }, { number: 22, count: 1 }],
        "Đầu 3": [],
        "Đầu 4": [],
        "Đầu 5": [],
        "Đầu 6": [],
        "Đầu 7": [],
        "Đầu 8": [],
        "Đầu 9": []
    }
};

const viVNDateFormatter = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
});

const createFallbackData = (analysisDate, analysisDays) => ({
    ...FALLBACK_DATA_TEMPLATE,
    analysisDate,
    analysisDays,
    metadata: { ...FALLBACK_DATA_TEMPLATE.metadata },
    predictions: FALLBACK_DATA_TEMPLATE.predictions.map(prediction => ({ ...prediction })),
    tableStatistics: Object.entries(FALLBACK_DATA_TEMPLATE.tableStatistics).reduce((acc, [key, value]) => {
        acc[key] = value.map(entry => ({ ...entry }));
        return acc;
    }, {})
});

const getCachedInitialProps = (key) => {
    const cached = initialDataCache.get(key);
    if (!cached) return null;
    if (cached.expiresAt < Date.now()) {
        initialDataCache.delete(key);
        return null;
    }
    return cached.payload;
};

const setCachedInitialProps = (key, payload, ttl = INITIAL_DATA_CACHE_TTL) => {
    initialDataCache.set(key, {
        payload,
        expiresAt: Date.now() + ttl
    });
};

const buildInitialProps = (initialData, dateISO, days) => ({
    initialData,
    initialDate: dateISO,
    initialDays: days
});

const PositionSoiCauPage = ({ initialData, initialDate, initialDays }) => {
    const [isMobileHistoryModalOpen, setIsMobileHistoryModalOpen] = useState(false);

    // ✅ SEO Configuration
    const siteUrl = useMemo(() => 
        process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro',
        []
    );

    const seoConfig = useMemo(() => getPageSEO('soi-cau-vi-tri'), []);

    // ✅ Breadcrumbs
    const breadcrumbs = useMemo(() => [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Soi Cầu Đặc Biệt Miền Bắc', url: `${siteUrl}/soi-cau-dac-biet-mien-bac` }
    ], [siteUrl]);

    // ✅ FAQ Data
    const faqData = useMemo(() => [
        {
            question: 'Soi cầu đặc biệt miền bắc là gì?',
            answer: 'Soi cầu đặc biệt miền bắc là phương pháp phân tích vị trí số trong kết quả xổ số để tìm pattern nhất quán và dự đoán 2 số cuối giải đặc biệt XSMB một cách chính xác.'
        },
        {
            question: 'Cách sử dụng công cụ soi cầu đặc biệt miền bắc?',
            answer: 'Chọn ngày phân tích và số ngày cần xem (mặc định 30 ngày). Hệ thống sẽ tự động phân tích vị trí số trong các giải và đưa ra dự đoán dựa trên pattern nhất quán tìm được.'
        },
        {
            question: 'Soi cầu đặc biệt có chính xác không?',
            answer: 'Công cụ sử dụng thuật toán phân tích vị trí số tiên tiến, tìm kiếm pattern nhất quán trong lịch sử kết quả. Độ chính xác phụ thuộc vào pattern tìm được và số ngày phân tích.'
        },
        {
            question: 'Có thể soi cầu cho bao nhiêu ngày?',
            answer: 'Bạn có thể chọn số ngày phân tích từ 7 đến 90 ngày. Số ngày càng nhiều thì dữ liệu phân tích càng đầy đủ, nhưng cần cân nhắc với độ mới của dữ liệu.'
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
                "name": "Soi Cầu Đặc Biệt Miền Bắc - Dàn Đề Wukong",
                "description": "Công cụ soi cầu đặc biệt miền bắc dựa trên phân tích vị trí số trong kết quả xổ số. Tìm kiếm pattern nhất quán để dự đoán 2 số cuối giải đặc biệt XSMB.",
                "url": `${siteUrl}/soi-cau-dac-biet-mien-bac`,
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
                }
            },
            {
                "@context": "https://schema.org",
                "@type": "HowTo",
                "name": "Cách sử dụng công cụ soi cầu đặc biệt miền bắc",
                "description": "Hướng dẫn chi tiết cách soi cầu đặc biệt để dự đoán 2 số cuối giải đặc biệt XSMB",
                "step": [
                    {
                        "@type": "HowToStep",
                        "position": 1,
                        "name": "Chọn ngày phân tích",
                        "text": "Chọn ngày bạn muốn phân tích (mặc định là ngày gần nhất có dữ liệu)"
                    },
                    {
                        "@type": "HowToStep",
                        "position": 2,
                        "name": "Chọn số ngày phân tích",
                        "text": "Chọn số ngày cần phân tích (từ 7 đến 90 ngày). Số ngày càng nhiều thì dữ liệu càng đầy đủ."
                    },
                    {
                        "@type": "HowToStep",
                        "position": 3,
                        "name": "Xem kết quả dự đoán",
                        "text": "Hệ thống sẽ tự động phân tích và hiển thị các số dự đoán dựa trên pattern nhất quán tìm được, kèm theo độ tin cậy."
                    }
                ]
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
                        "name": "Soi Cầu Đặc Biệt Miền Bắc",
                        "item": `${siteUrl}/soi-cau-dac-biet-mien-bac`
                    }
                ]
            }
            // FAQ schema is automatically generated by SEOOptimized component from faq prop
        ];
    }, [siteUrl, faqData]);

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

            <div className="mobileHistoryTriggerWrapper">
                <button
                    type="button"
                    className="mobileHistoryTrigger"
                    onClick={() => setIsMobileHistoryModalOpen(true)}
                >
                    <span className="mobileHistoryTriggerText">
                        Xem lịch sử soi cầu vị trí
                    </span>
                    <span
                        className="mobileHistoryTriggerIcon"
                        aria-hidden="true"
                    >
                        ➜
                    </span>
                </button>
            </div>

            <PositionSoiCau
                initialData={initialData}
                initialDate={initialDate}
                initialDays={initialDays}
                mobileHistoryModalOpen={isMobileHistoryModalOpen}
                onCloseMobileHistoryModal={() => setIsMobileHistoryModalOpen(false)}
                mobileHistoryModalControlled
            />

            <style jsx>{`
                .mobileHistoryTriggerWrapper {
                }

                .mobileHistoryTrigger {
                    width: 100%;
                    border-radius: 12px;
                    border: none;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #fff;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    box-shadow: 0 12px 24px rgba(118, 75, 162, 0.35);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .mobileHistoryTrigger:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 16px 30px rgba(118, 75, 162, 0.45);
                }

                .mobileHistoryTrigger:active {
                    transform: translateY(0);
                    box-shadow: 0 8px 18px rgba(118, 75, 162, 0.35);
                }

                .mobileHistoryTriggerText {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                }

                .mobileHistoryTriggerIcon {
                    margin-left: 10px;
                    display: inline-flex;
                    align-items: center;
                    animation: mobileHistoryIconPulse 1s ease-in-out infinite;
                }

                @keyframes mobileHistoryIconPulse {
                    0%, 100% {
                        opacity: 1;
                        transform: translateX(0);
                    }
                    50% {
                        opacity: 0.3;
                        transform: translateX(4px);
                    }
                }

                @media (min-width: 769px) {
                    .mobileHistoryTriggerWrapper {
                        display: none;
                    }
                }
            `}            </style>
        </Layout>
        </>
    );
};

export async function getServerSideProps() {
    try {
        const currentTime = new Date();
        const isAfterResultTime = currentTime.getHours() >= 18 && currentTime.getMinutes() >= 40;
        const defaultDate = isAfterResultTime
            ? new Date(currentTime.getTime() + 24 * 60 * 60 * 1000)
            : currentTime;

        const defaultDays = 2;
        const formattedDate = viVNDateFormatter.format(defaultDate);
        const cacheKey = `${formattedDate}:${defaultDays}`;

        const cached = getCachedInitialProps(cacheKey);
        if (cached) {
            return { props: cached };
        }

        const buildAndCache = (data, ttl = INITIAL_DATA_CACHE_TTL) => {
            const payload = buildInitialProps(data, defaultDate.toISOString(), defaultDays);
            setCachedInitialProps(cacheKey, payload, ttl);
            return payload;
        };

        try {
            const positionData = await apiService.getPositionSoiCau({
                date: formattedDate,
                days: defaultDays
            });

            return {
                props: buildAndCache(positionData || createFallbackData(formattedDate, defaultDays))
            };
        } catch (apiError) {
            console.warn('Không thể lấy dữ liệu ban đầu, sử dụng dữ liệu mẫu:', apiError.message);
            return {
                props: buildAndCache(createFallbackData(formattedDate, defaultDays), FALLBACK_CACHE_TTL)
            };
        }
    } catch (error) {
        console.error('Lỗi trong getServerSideProps:', error.message);
        const safeDate = new Date();
        return {
            props: buildInitialProps(createFallbackData(viVNDateFormatter.format(safeDate), 2), safeDate.toISOString(), 2),
        };
    }
}

export default PositionSoiCauPage;
