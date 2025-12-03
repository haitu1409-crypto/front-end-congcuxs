/**
 * Kết Quả Xổ Số Live Page
 * Trang hiển thị kết quả xổ số real-time với Socket.io
 * Layout giống LatestXSMBResults với tính năng live từ kqxs LiveResult
 */

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LiveResult from '../components/LiveResult';
import { isWithinLiveWindow, getTodayFormatted } from '../utils/lotteryUtils';
import { getPageSEO } from '../config/seoConfig';
import EnhancedSEOHead from '../components/EnhancedSEOHead';

const KQXSLivePage = () => {
    const [inLiveWindow, setInLiveWindow] = useState(false);
    const today = getTodayFormatted();

    // Check live window periodically
    useEffect(() => {
        const checkLiveWindow = () => {
            setInLiveWindow(isWithinLiveWindow());
        };

        checkLiveWindow();
        const interval = setInterval(checkLiveWindow, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, []);

    // SEO Configuration
    const seoConfig = getPageSEO('kqxs-live');
    const pageTitle = `XSMB Live - Kết Quả Xổ Số Miền Bắc Trực Tiếp ${today} | XSTD Nhanh Nhất 2025`;

    return (
        <Layout>
            <EnhancedSEOHead
                title={pageTitle}
                description={`Xem kết quả xổ số miền Bắc trực tiếp ${today}. Cập nhật real-time, nhanh chóng và chính xác nhất.`}
                keywords="xsmb live, kết quả xổ số miền bắc trực tiếp, xsmb hôm nay, sxmb live, kqxs mb trực tiếp"
                canonicalUrl={`/kqxs-live`}
            />

            <div style={{ padding: '20px 0' }}>
                {inLiveWindow ? (
                    <LiveResult station="xsmb" />
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        background: '#f9f9f9',
                        borderRadius: '8px',
                        margin: '20px 0'
                    }}>
                        <h2 style={{ color: '#666', marginBottom: '16px' }}>
                            Không trong khung giờ phát trực tiếp
                        </h2>
                        <p style={{ color: '#999', marginBottom: '20px' }}>
                            Khung giờ phát trực tiếp: 18:10 - 18:33 (Giờ Việt Nam)
                        </p>
                        <p style={{ color: '#999' }}>
                            Hiện tại: {new Date().toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
                        </p>
                        <LiveResult station="xsmb" />
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default KQXSLivePage;















