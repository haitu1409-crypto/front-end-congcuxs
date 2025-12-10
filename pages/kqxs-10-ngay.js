/**
 * Trang hiển thị 10 kết quả XSMB mới nhất trong 1 trang
 */

import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import XSMBLatest10Table from '../components/XSMBLatest10Table';
import { Calendar, RefreshCw } from 'lucide-react';
import styles from '../styles/KQXS.module.css';

export default function KQXS10NgayPage() {
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Handle refresh
    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            window.location.reload();
        }, 1000);
    };

    return (
        <>
            <Head>
                <title>10 Kết Quả XSMB Mới Nhất - Dàn Đề Wukong</title>
                <meta name="description" content="Xem 10 kết quả xổ số miền Bắc mới nhất. Cập nhật trực tiếp, chính xác 100%." />
                <meta name="keywords" content="kết quả xổ số, xsmb, 10 kết quả mới nhất, xổ số miền bắc" />
                <meta name="robots" content="index, follow" />
                <meta name="googlebot" content="index, follow" />
                <meta name="bingbot" content="index, follow" />
                <meta name="coccocbot" content="index, follow" />
                <link rel="canonical" href={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro'}/kqxs-10-ngay`} />
                <meta property="og:title" content="10 Kết Quả XSMB Mới Nhất - Dàn Đề Wukong" />
                <meta property="og:description" content="Xem 10 kết quả xổ số miền Bắc mới nhất. Cập nhật trực tiếp, chính xác 100%." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro'}/kqxs-10-ngay`} />
            </Head>

            <Layout>
                <div className={styles.container}>
                    {/* Header Section */}
                    <div className={styles.header}>
                        <div className={styles.headerContent}>
                            <h1 className={styles.title}>
                                <Calendar className={styles.titleIcon} />
                                10 Kết Quả XSMB Mới Nhất
                            </h1>
                            <p className={styles.subtitle}>
                                Xem 10 kết quả xổ số miền Bắc (XSMB) mới nhất, sắp xếp từ mới đến cũ
                            </p>
                        </div>

                        {/* Controls */}
                        <div className={styles.controls}>
                            <button
                                className={styles.refreshButton}
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                            >
                                <RefreshCw className={`${styles.refreshIcon} ${isRefreshing ? styles.spinning : ''}`} />
                                {isRefreshing ? 'Đang tải...' : 'Làm mới'}
                            </button>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className={styles.resultsSection}>
                        <XSMBLatest10Table />
                    </div>

                    {/* Info Section */}
                    <div className={styles.infoSection}>
                        <div className={styles.infoCard}>
                            <h3>Thông tin quan trọng</h3>
                            <ul>
                                <li>Hiển thị 10 kết quả XSMB mới nhất từ database</li>
                                <li>Sắp xếp từ mới nhất đến cũ nhất</li>
                                <li>Dữ liệu được cập nhật tự động từ nguồn chính thức</li>
                                <li>Hỗ trợ làm mới thủ công bằng nút "Làm mới"</li>
                            </ul>
                        </div>

                        <div className={styles.infoCard}>
                            <h3>Lịch quay số</h3>
                            <ul>
                                <li><strong>Miền Bắc (XSMB):</strong> Hàng ngày lúc 18h15</li>
                                <li><strong>Thời gian cập nhật:</strong> Tự động sau khi quay số</li>
                                <li><strong>Nguồn dữ liệu:</strong> Chính thức từ Công ty Xổ số</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
}
