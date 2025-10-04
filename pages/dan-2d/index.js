/**
 * Dàn 2D Page - Optimized
 * Compact design với Layout mới
 */

import Link from 'next/link';
import Layout from '../../components/Layout';
import Dan2DGenerator from '../../components/DanDe/Dan2DGenerator';
import SEOOptimized from '../../components/SEOOptimized';
import { Target } from 'lucide-react';
import styles from '../../styles/Dan2D.module.css';

export default function Dan2DPage() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const breadcrumbs = [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Dàn Đề 2D', url: `${siteUrl}/dan-2d` }
    ];

    return (
        <>
            <SEOOptimized 
                pageType="dan-2d"
                breadcrumbs={breadcrumbs}
            />

            <Layout>
                <div className={styles.pageContainer}>
                    <header className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>
                            <Target size={20} style={{ display: 'inline', marginRight: '8px' }} />
                            Tạo Dàn Đề 2D
                        </h1>
                        <p className={styles.pageDescription}>
                            Phân loại theo mức độ xuất hiện • Hỗ trợ chuyển 1D
                        </p>
                    </header>

                    <main className={styles.mainContent}>
                        <Dan2DGenerator />
                    </main>

                    <section className={styles.guideSection}>
                        <h2 className={styles.guideTitle}>Hướng Dẫn Sử Dụng</h2>
                        <div className={styles.guideGrid}>
                            <div className={styles.guideItem}>
                                <h3>1. Nhập Số 2D</h3>
                                <p>Nhập số 2 chữ số vào ô text: <code>12,34,56</code></p>
                            </div>
                            <div className={styles.guideItem}>
                                <h3>2. Xem Kết Quả</h3>
                                <p>Kết quả phân loại theo mức độ xuất hiện</p>
                            </div>
                            <div className={styles.guideItem}>
                                <h3>3. Copy Dàn</h3>
                                <p>Nhấn Copy để sao chép kết quả</p>
                            </div>
                        </div>
                    </section>
                </div>
            </Layout>
        </>
    );
}

