/**
 * Dàn 2D Page - Optimized
 * Compact design với Layout mới
 */

import Link from 'next/link';
import Layout from '../../components/Layout';
import SEOOptimized from '../../components/SEOOptimized';
import PageSpeedOptimizer from '../../components/PageSpeedOptimizer';
import { Target } from 'lucide-react';
import styles from '../../styles/Dan2D.module.css';
import dynamic from 'next/dynamic';

// Lazy load heavy component for better PageSpeed
const Dan2DGenerator = dynamic(() => import('../../components/DanDe/Dan2DGenerator'), {
    loading: () => <div className={styles.loadingSkeleton}>Đang tải công cụ dàn 2D...</div>,
    ssr: false
});

export default function Dan2DPage() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003';

    const breadcrumbs = [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Dàn Đề 2D', url: `${siteUrl}/dan-2d` }
    ];

    const faqData = [
        {
            question: 'Dàn đề 2D là gì và phù hợp cho loại xổ số nào?',
            answer: 'Dàn đề 2D là tập hợp các số có 2 chữ số (00-99), phù hợp cho lô đề 2 số, xổ số miền Bắc, miền Nam, miền Trung. Đây là loại dàn đề phổ biến nhất với tỷ lệ trúng cao.'
        },
        {
            question: 'Cách tạo dàn đề 2D hiệu quả nhất?',
            answer: 'Sử dụng công cụ tạo dàn đề 2D với phân loại theo mức độ xuất hiện, kết hợp với thống kê xổ số 3 miền để chọn số có khả năng trúng cao nhất.'
        },
        {
            question: 'Chuyển đổi 1D sang 2D hoạt động như thế nào?',
            answer: 'Chức năng chuyển đổi 1D sang 2D giúp bạn tạo dàn đề 2D từ các số 1 chữ số, tăng tính linh hoạt và đa dạng hóa chiến lược chơi.'
        },
        {
            question: 'Dàn đề 2D có thể sử dụng cho bao nhiêu loại xổ số?',
            answer: 'Dàn đề 2D có thể sử dụng cho tất cả loại xổ số 3 miền, lô đề 2 số, và nhiều hình thức chơi khác. Rất linh hoạt và phổ biến.'
        }
    ];

    return (
        <>
            <SEOOptimized
                pageType="dan-2d"
                customTitle="Tạo Dàn Đề 2D Chuyên Nghiệp - Công Cụ Miễn Phí 2024"
                customDescription="Tạo dàn đề 2D (00-99) chuyên nghiệp với phân loại theo mức độ xuất hiện, hỗ trợ chuyển đổi 1D sang 2D. Công cụ miễn phí, nhanh chóng, chính xác cho xổ số 3 miền."
                customKeywords="tạo dàn đề 2D, dàn đề 2D, công cụ tạo dàn đề 2D, dàn đề 00-99, lô đề 2 số, xổ số 2D, chuyển đổi 1D sang 2D, phân loại dàn đề 2D, thống kê dàn đề 2D, mẹo chơi dàn đề 2D"
                breadcrumbs={breadcrumbs}
                faq={faqData}
            />
            <PageSpeedOptimizer />

            <Layout>
                <div className={styles.pageContainer}>
                    <header className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>
                            <Target size={20} style={{ display: 'inline', marginRight: '8px' }} />
                            Tạo Dàn Đề 2D Chuyên Nghiệp - Công Cụ Miễn Phí 2024
                        </h1>
                        <p className={styles.pageDescription}>
                            Tạo dàn đề 2D (00-99) chuyên nghiệp với phân loại theo mức độ xuất hiện • Hỗ trợ chuyển đổi 1D sang 2D • Thuật toán Fisher-Yates chuẩn quốc tế • Miễn phí 100%
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

