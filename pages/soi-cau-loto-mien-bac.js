/**
 * Position Soi Cau Loto Page
 * Trang soi cầu lô tô theo vị trí
 */

import React, { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import EnhancedSEOHead from '../components/EnhancedSEOHead';
import { getPageSEO } from '../config/seoConfig';
import apiService from '../services/apiService';

const DynamicPositionSoiCauLoto = dynamic(() => import('../components/PositionSoiCauLoto'), {
    loading: () => (
        <div className="positionSoiCauLoading">
            Đang tải dữ liệu soi cầu...
        </div>
    )
});

const LATEST_DATE_CACHE_TTL = 60 * 1000; // 60s cache to cut down duplicate API calls
let cachedLatestDate = {
    expiresAt: 0,
    value: null
};

const fetchWithTimeout = async (url, options = {}, timeout = 3000) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal
        });
    } finally {
        clearTimeout(timer);
    }
};

const parseLatestDateResponse = (data) => {
    if (!data?.success || !data?.latestDate) {
        return null;
    }

    const [day, month, year] = data.latestDate.split('/').map(Number);
    if (!day || !month || !year) {
        return null;
    }

    const parsedDate = new Date(year, month - 1, day);
    parsedDate.setHours(0, 0, 0, 0);
    return parsedDate;
};

const getLatestSoiCauDate = async () => {
    const now = Date.now();
    if (cachedLatestDate.value && cachedLatestDate.expiresAt > now) {
        return new Date(cachedLatestDate.value);
    }

    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const apiEndpoint = `${apiUrl}/api/position-soicau-loto/latest-date`;
        const latestSoiCauResponse = await fetchWithTimeout(apiEndpoint, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (latestSoiCauResponse.ok) {
            const data = await latestSoiCauResponse.json();
            const parsedDate = parseLatestDateResponse(data);

            if (parsedDate) {
                cachedLatestDate = {
                    value: parsedDate.toISOString(),
                    expiresAt: now + LATEST_DATE_CACHE_TTL
                };
                return parsedDate;
            }
        }
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.warn('[getLatestSoiCauDate] Failed to fetch latest date', error.message);
        }
    }

    return null;
};

const isAfterResultCutoff = (date) => {
    const hour = date.getHours();
    const minutes = date.getMinutes();
    return hour > 18 || (hour === 18 && minutes >= 40);
};

const formatDateForAnalysis = (date) => {
    return date.toLocaleDateString('vi-VN').replace(/\//g, '/');
};

const FALLBACK_TEMPLATE = {
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

const buildFallbackData = (analysisDate, analysisDays) => ({
    ...FALLBACK_TEMPLATE,
    analysisDate,
    analysisDays,
    metadata: { ...FALLBACK_TEMPLATE.metadata },
    predictions: FALLBACK_TEMPLATE.predictions.map(prediction => ({ ...prediction })),
    tableStatistics: Object.entries(FALLBACK_TEMPLATE.tableStatistics).reduce((acc, [key, value]) => {
        acc[key] = value.map(item => ({ ...item }));
        return acc;
    }, {})
});

const PositionSoiCauLotoPage = ({ initialData, initialDate, initialDays }) => {
    const [isMobileHistoryModalOpen, setIsMobileHistoryModalOpen] = useState(false);
    const handleOpenHistory = useCallback(() => setIsMobileHistoryModalOpen(true), []);
    const handleCloseHistory = useCallback(() => setIsMobileHistoryModalOpen(false), []);

    // ✅ SEO Configuration
    const siteUrl = useMemo(() => 
        process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro',
        []
    );

    const seoConfig = useMemo(() => getPageSEO('soi-cau-loto'), []);

    // ✅ Breadcrumbs
    const breadcrumbs = useMemo(() => [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Soi Cầu Lô Tô Miền Bắc', url: `${siteUrl}/soi-cau-loto-mien-bac` }
    ], [siteUrl]);

    // ✅ FAQ Data
    const faqData = useMemo(() => [
        {
            question: 'Soi cầu lô tô miền bắc là gì?',
            answer: 'Soi cầu lô tô miền bắc là phương pháp phân tích vị trí số trong kết quả xổ số để tìm pattern nhất quán và dự đoán các cầu lô mạnh cho XSMB. Công cụ phân tích các số xuất hiện ở các vị trí khác nhau trong các giải để đưa ra dự đoán lô tô chính xác.'
        },
        {
            question: 'Cách sử dụng công cụ soi cầu lô tô miền bắc?',
            answer: 'Chọn ngày phân tích và số ngày cần xem (mặc định 4 ngày). Hệ thống sẽ tự động phân tích vị trí số trong các giải và đưa ra dự đoán các cầu lô dựa trên pattern nhất quán tìm được. Bạn có thể xem thống kê theo đầu số và độ tin cậy của từng dự đoán.'
        },
        {
            question: 'Soi cầu lô tô có chính xác không?',
            answer: 'Công cụ sử dụng thuật toán phân tích vị trí số tiên tiến, tìm kiếm pattern nhất quán trong lịch sử kết quả. Độ chính xác phụ thuộc vào pattern tìm được và số ngày phân tích. Kết quả được hiển thị kèm độ tin cậy để bạn tham khảo.'
        },
        {
            question: 'Có thể soi cầu lô tô cho bao nhiêu ngày?',
            answer: 'Bạn có thể chọn số ngày phân tích từ 2 đến 10 ngày. Số ngày càng nhiều thì dữ liệu phân tích càng đầy đủ, nhưng cần cân nhắc với độ mới của dữ liệu. Mặc định là 4 ngày để cân bằng giữa độ chính xác và tính cập nhật.'
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
                "name": "Soi Cầu Lô Tô Miền Bắc - Dàn Đề Wukong",
                "description": "Công cụ soi cầu lô tô miền bắc dựa trên phân tích vị trí số. Dự đoán lô tô XSMB chính xác, tìm pattern nhất quán.",
                "url": `${siteUrl}/soi-cau-loto-mien-bac`,
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
                "name": "Cách sử dụng công cụ soi cầu lô tô miền bắc",
                "description": "Hướng dẫn chi tiết cách soi cầu lô tô để dự đoán các cầu lô mạnh",
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
                        "text": "Chọn số ngày cần phân tích. Số ngày càng nhiều thì dữ liệu càng đầy đủ."
                    },
                    {
                        "@type": "HowToStep",
                        "position": 3,
                        "name": "Xem kết quả dự đoán",
                        "text": "Hệ thống sẽ tự động phân tích và hiển thị các cầu lô dự đoán dựa trên pattern nhất quán tìm được."
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
                        "name": "Soi Cầu Lô Tô Miền Bắc",
                        "item": `${siteUrl}/soi-cau-loto-mien-bac`
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
                    onClick={handleOpenHistory}
                >
                    <span className="mobileHistoryTriggerText">
                        Xem lịch sử soi cầu lô tô
                    </span>
                    <span
                        className="mobileHistoryTriggerIcon"
                        aria-hidden="true"
                    >
                        ➜
                    </span>
                </button>
            </div>

            <DynamicPositionSoiCauLoto
                initialData={initialData}
                initialDate={initialDate}
                initialDays={initialDays}
                mobileHistoryModalOpen={isMobileHistoryModalOpen}
                onCloseMobileHistoryModal={handleCloseHistory}
                mobileHistoryModalControlled
            />

            <style jsx>{`
                .mobileHistoryTriggerWrapper {
                }

                .positionSoiCauLoading {
                    width: 100%;
                    border-radius: 12px;
                    border: 1px dashed rgba(118, 75, 162, 0.4);
                    padding: 24px;
                    text-align: center;
                    color: #5a2b9a;
                    background: rgba(255, 255, 255, 0.8);
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
            `}</style>
        </Layout>
        </>
    );
};

export async function getServerSideProps() {
    try {
        const currentTime = new Date();
        const isAfterResultTime = currentTime.getHours() >= 18 && currentTime.getMinutes() >= 40;
        const baseDate = isAfterResultTime
            ? new Date(currentTime.getTime() + 24 * 60 * 60 * 1000)
            : currentTime;
        const defaultDate = new Date(baseDate);
        defaultDate.setHours(0, 0, 0, 0);

        const defaultDays = 4;
        const formattedDate = formatDateForAnalysis(defaultDate);

        // Fallback data để tránh lỗi API
        const fallbackData = buildFallbackData(formattedDate, defaultDays);

        try {
            // Thử gọi API, nhưng sử dụng fallback nếu có lỗi
            const positionData = await apiService.getPositionSoiCauLoto({
                date: formattedDate,
                days: defaultDays
            });

            return {
                props: {
                    initialData: positionData || fallbackData,
                    initialDate: defaultDate.toISOString(),
                    initialDays: defaultDays,
                },
            };
        } catch (apiError) {
            console.warn('Không thể lấy dữ liệu ban đầu, sử dụng dữ liệu mẫu:', apiError.message);
            return {
                props: {
                    initialData: fallbackData,
                    initialDate: defaultDate.toISOString(),
                    initialDays: defaultDays,
                },
            };
        }
    } catch (error) {
        console.error('Lỗi trong getServerSideProps:', error.message);
        return {
            props: {
                initialData: {},
                initialDate: new Date().toISOString(),
                initialDays: 2,
            },
        };
    }
}

export default PositionSoiCauLotoPage;
