/**
 * Dàn 3D/4D Page - Optimized
 * Compact design với Layout mới
 */

import { useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import Dan3DGenerator from '../../components/DanDe/Dan3DGenerator';
import Dan4DGenerator from '../../components/DanDe/Dan4DGenerator';
import SEOOptimized from '../../components/SEOOptimized';
import { BarChart3 } from 'lucide-react';
import styles from '../../styles/Dan3D4D.module.css';

export default function Dan3D4DPage() {
    const [selectedType, setSelectedType] = useState('3D');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const breadcrumbs = [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Dàn Đề 3D/4D', url: `${siteUrl}/dan-3d4d` }
    ];

    return (
        <>
            <SEOOptimized 
                pageType="dan-3d4d"
                breadcrumbs={breadcrumbs}
            />

            <Layout>
                <div className={styles.pageContainer}>
                    <header className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>
                            <BarChart3 size={20} style={{ display: 'inline', marginRight: '8px' }} />
                            Tạo Dàn Đề 3D/4D
                        </h1>
                        <p className={styles.pageDescription}>
                            3D (000-999) • 4D (0000-9999) • Chuyên nghiệp
                        </p>
                    </header>

                    <main className={styles.mainContent}>
                        {/* Type Selector */}
                        <div className={styles.typeSelector}>
                            <button
                                className={`${styles.typeButton} ${selectedType === '3D' ? styles.active : ''}`}
                                onClick={() => setSelectedType('3D')}
                            >
                                Dàn 3D
                            </button>
                            <button
                                className={`${styles.typeButton} ${selectedType === '4D' ? styles.active : ''}`}
                                onClick={() => setSelectedType('4D')}
                            >
                                Dàn 4D
                            </button>
                        </div>

                        {/* Generator Component */}
                        {selectedType === '3D' ? <Dan3DGenerator /> : <Dan4DGenerator />}
                    </main>

                    <section className={styles.guideSection}>
                        <h2 className={styles.guideTitle}>Hướng Dẫn Sử Dụng</h2>
                        <div className={styles.guideGrid}>
                            <div className={styles.guideItem}>
                                <h3>1. Nhập Số {selectedType}</h3>
                                <p>Nhập số {selectedType === '3D' ? '3' : '4'} chữ số vào ô text</p>
                            </div>
                            <div className={styles.guideItem}>
                                <h3>2. Phân Tích</h3>
                                <p>Xem kết quả theo mức độ xuất hiện</p>
                            </div>
                            <div className={styles.guideItem}>
                                <h3>3. Copy</h3>
                                <p>Nhấn Copy để sao chép kết quả</p>
                            </div>
                        </div>
                    </section>
                </div>
            </Layout>
        </>
    );
}

