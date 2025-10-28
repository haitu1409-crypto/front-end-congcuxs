/**
 * Position Soi Cau Page
 * Trang soi cầu dựa trên vị trí số
 */

import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import PositionSoiCau from '../components/PositionSoiCau';
import apiService from '../services/apiService';

const PositionSoiCauPage = ({ initialData, initialDate, initialDays }) => {
    const pageTitle = 'Soi Cầu Vị Trí - Dự Đoán Dựa Trên Vị Trí Số';
    const pageDescription = 'Thuật toán soi cầu tiên tiến dựa trên phân tích vị trí số trong kết quả xổ số. Tìm kiếm pattern nhất quán để dự đoán 2 số cuối giải đặc biệt.';

    return (
        <Layout>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://yourdomain.com/soi-cau-vi-tri" />
                <meta property="og:image" content="https://yourdomain.com/images/soi-cau-vi-tri.jpg" />
                <link rel="canonical" href="https://yourdomain.com/soi-cau-vi-tri" />

                {/* SEO Keywords */}
                <meta name="keywords" content="soi cầu vị trí, soi cầu bạch thủ, dự đoán xổ số, phân tích vị trí số, pattern xổ số, thuật toán soi cầu" />

                {/* Additional SEO */}
                <meta name="robots" content="index, follow" />
                <meta name="author" content="Dàn Đề Wukong" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </Head>

            <PositionSoiCau
                initialData={initialData}
                initialDate={initialDate}
                initialDays={initialDays}
            />
        </Layout>
    );
};

export async function getServerSideProps() {
    try {
        const currentTime = new Date();
        const isAfterResultTime = currentTime.getHours() >= 18 && currentTime.getMinutes() >= 40;
        let defaultDate;

        if (isAfterResultTime) {
            defaultDate = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
        } else {
            defaultDate = currentTime;
        }

        const defaultDays = 2;
        const formattedDate = defaultDate.toLocaleDateString('vi-VN').replace(/\//g, '/');

        // Fallback data để tránh lỗi API
        const fallbackData = {
            analysisDate: formattedDate,
            analysisDays: defaultDays,
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

        try {
            // Thử gọi API, nhưng sử dụng fallback nếu có lỗi
            const positionData = await apiService.getPositionSoiCau({
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

export default PositionSoiCauPage;
