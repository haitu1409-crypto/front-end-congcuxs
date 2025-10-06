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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003';

    const breadcrumbs = [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Dàn Đề 3D/4D', url: `${siteUrl}/dan-3d4d` }
    ];

    const faqData = [
        {
            question: 'Dàn đề 3D và 4D khác nhau như thế nào?',
            answer: 'Dàn đề 3D là tập hợp số có 3 chữ số (000-999), phù hợp cho lô đề 3 số. Dàn đề 4D là tập hợp số có 4 chữ số (0000-9999), phù hợp cho lô đề 4 số. Mỗi loại có tỷ lệ trúng và thưởng khác nhau.'
        },
        {
            question: 'Cách tạo dàn đề 3D/4D hiệu quả nhất?',
            answer: 'Sử dụng công cụ tạo dàn đề 3D/4D chuyên nghiệp với thuật toán Fisher-Yates, kết hợp với thống kê xổ số để chọn số có khả năng trúng cao nhất.'
        },
        {
            question: 'Dàn đề 3D/4D phù hợp cho loại xổ số nào?',
            answer: 'Dàn đề 3D phù hợp cho lô đề 3 số, xổ số miền Bắc, miền Nam, miền Trung. Dàn đề 4D phù hợp cho lô đề 4 số và các hình thức chơi có thưởng cao.'
        },
        {
            question: 'Tỷ lệ trúng dàn đề 3D/4D như thế nào?',
            answer: 'Dàn đề 3D có tỷ lệ trúng 1/1000, dàn đề 4D có tỷ lệ trúng 1/10000. Tuy tỷ lệ thấp nhưng thưởng rất cao, phù hợp cho người chơi có kinh nghiệm.'
        }
    ];

    return (
        <>
            <SEOOptimized
                pageType="dan-3d4d"
                customTitle="Tạo Dàn Đề 3D/4D Chuyên Nghiệp - Công Cụ Cao Thủ 2024"
                customDescription="Tạo dàn đề 3D (000-999) và 4D (0000-9999) chuyên nghiệp cho cao thủ. Công cụ miễn phí, thuật toán Fisher-Yates chuẩn quốc tế, phù hợp cho lô đề 3 số, 4 số và xổ số 3 miền."
                customKeywords="tạo dàn đề 3D, tạo dàn đề 4D, dàn đề 3D, dàn đề 4D, công cụ tạo dàn đề 3D, công cụ tạo dàn đề 4D, lô đề 3 số, lô đề 4 số, xổ số 3D, xổ số 4D, cao thủ xổ số, dàn đề chuyên nghiệp"
                breadcrumbs={breadcrumbs}
                faq={faqData}
            />

            <Layout>
                <div className={styles.pageContainer}>
                    <header className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>
                            <BarChart3 size={20} style={{ display: 'inline', marginRight: '8px' }} />
                            Tạo Dàn Đề 3D/4D Chuyên Nghiệp - Công Cụ Cao Thủ 2024
                        </h1>
                        <p className={styles.pageDescription}>
                            Tạo dàn đề 3D (000-999) và 4D (0000-9999) chuyên nghiệp cho cao thủ • Thuật toán Fisher-Yates chuẩn quốc tế • Phù hợp cho lô đề 3 số, 4 số • Miễn phí 100%
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

