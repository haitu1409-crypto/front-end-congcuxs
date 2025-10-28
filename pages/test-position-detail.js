/**
 * Test Page for Position Detail Box
 * Trang test để kiểm tra tính năng hiển thị chi tiết đường cầu
 */

import React from 'react';
import PositionSoiCau from '../components/PositionSoiCau';

const TestPositionDetail = () => {
    // Dữ liệu mẫu để test
    const mockPositionData = {
        analysisDate: "22/10/2025",
        analysisDays: 3,
        totalResults: 3,
        patternsFound: 15,
        consistentPatterns: 8,
        metadata: {
            successRate: 75
        },
        predictions: [
            {
                predictedNumber: "08",
                position1: "(6-1-1)",
                position2: "(7-3-1)",
                confidence: 50
            },
            {
                predictedNumber: "11",
                position1: "(2-0-0)",
                position2: "(4-1-0)",
                confidence: 50
            },
            {
                predictedNumber: "12",
                position1: "(2-0-0)",
                position2: "(2-1-0)",
                confidence: 50
            },
            {
                predictedNumber: "15",
                position1: "(2-0-0)",
                position2: "(3-2-1)",
                confidence: 50
            },
            {
                predictedNumber: "18",
                position1: "(2-0-0)",
                position2: "(7-3-1)",
                confidence: 50
            },
            {
                predictedNumber: "21",
                position1: "(3-4-2)",
                position2: "(4-1-0)",
                confidence: 50
            },
            {
                predictedNumber: "25",
                position1: "(3-4-2)",
                position2: "(5-4-0)",
                confidence: 50
            },
            {
                predictedNumber: "28",
                position1: "(3-4-2)",
                position2: "(7-3-1)",
                confidence: 50
            },
            {
                predictedNumber: "40",
                position1: "(3-0-3)",
                position2: "(3-1-0)",
                confidence: 50
            },
            {
                predictedNumber: "42",
                position1: "(3-5-0)",
                position2: "(4-0-0)",
                confidence: 50
            },
            {
                predictedNumber: "45",
                position1: "(3-5-0)",
                position2: "(5-4-0)",
                confidence: 50
            },
            {
                predictedNumber: "48",
                position1: "(3-5-0)",
                position2: "(7-3-1)",
                confidence: 50
            },
            {
                predictedNumber: "70",
                position1: "(1-0-4)",
                position2: "(3-1-0)",
                confidence: 50
            },
            {
                predictedNumber: "72",
                position1: "(1-0-4)",
                position2: "(5-3-1)",
                confidence: 50
            },
            {
                predictedNumber: "75",
                position1: "(4-3-2)",
                position2: "(5-4-0)",
                confidence: 50
            },
            {
                predictedNumber: "78",
                position1: "(1-0-4)",
                position2: "(2-0-2)",
                confidence: 50
            },
            {
                predictedNumber: "90",
                position1: "(3-0-4)",
                position2: "(3-1-0)",
                confidence: 50
            },
            {
                predictedNumber: "92",
                position1: "(3-3-0)",
                position2: "(4-0-0)",
                confidence: 50
            },
            {
                predictedNumber: "95",
                position1: "(3-3-0)",
                position2: "(5-4-0)",
                confidence: 50
            },
            {
                predictedNumber: "98",
                position1: "(3-3-0)",
                position2: "(7-3-1)",
                confidence: 50
            }
        ],
        detailedAnalysis: {
            consistentPatterns: [
                {
                    positionKey: "(6-1-1) + (7-3-1)",
                    successRate: 0.75,
                    totalOccurrences: 3,
                    totalDays: 4
                },
                {
                    positionKey: "(2-0-0) + (4-1-0)",
                    successRate: 0.67,
                    totalOccurrences: 2,
                    totalDays: 3
                },
                {
                    positionKey: "(3-4-2) + (7-3-1)",
                    successRate: 0.6,
                    totalOccurrences: 3,
                    totalDays: 5
                }
            ]
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <div style={{ 
                background: 'white', 
                margin: '20px', 
                padding: '20px', 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h1 style={{ 
                    textAlign: 'center', 
                    color: '#1f2937',
                    marginBottom: '30px',
                    fontSize: '2rem',
                    fontWeight: '700'
                }}>
                    Test Position Detail Box
                </h1>
                
                <div style={{
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ color: '#0369a1', margin: '0 0 10px 0' }}>
                        Hướng dẫn sử dụng:
                    </h3>
                    <ul style={{ color: '#0369a1', margin: 0, paddingLeft: '20px' }}>
                        <li>Click vào bất kỳ số nào trong bảng dự đoán bên dưới</li>
                        <li>Detail box sẽ hiển thị thông tin chi tiết về đường cầu</li>
                        <li>Bảng kết quả sẽ highlight các vị trí số tạo ra cầu đó</li>
                        <li>Click ra ngoài hoặc nút X để đóng detail box</li>
                    </ul>
                </div>

                <PositionSoiCau 
                    initialData={mockPositionData}
                    initialDate="22/10/2025"
                    initialDays={3}
                />
            </div>
        </div>
    );
};

export default TestPositionDetail;
