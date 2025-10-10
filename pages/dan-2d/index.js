/**
 * Dàn 2D Page - Optimized
 * Compact design với Layout mới
 */

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { memo, useMemo } from 'react';
import Layout from '../../components/Layout';
import SEOOptimized from '../../components/SEOOptimized';
import PageSpeedOptimizer from '../../components/PageSpeedOptimizer';
import MobileNavbar from '../../components/MobileNavbar';
import styles from '../../styles/Dan2D.module.css';

// ✅ Dynamic icon import for better performance
const Target = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Target })), { ssr: false });

// Lazy load heavy component for better PageSpeed
const Dan2DGenerator = dynamic(() => import('../../components/DanDe/Dan2DGenerator'), {
    loading: () => <div className={styles.loadingSkeleton}>Đang tải công cụ dàn 2D...</div>,
    ssr: false
});

// ✅ Memoized Dan2D Page component
const Dan2DPage = memo(function Dan2DPage() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003';

    // ✅ Memoized breadcrumbs
    const breadcrumbs = useMemo(() => [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Dàn Đề 2D', url: `${siteUrl}/dan-2d` }
    ], [siteUrl]);

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

    // HowTo Schema cho dan-2d
    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "Cách tạo dàn đề 2D chuyên nghiệp",
        "description": "Hướng dẫn chi tiết cách tạo dàn đề 2D từ 00-99 với phân loại theo mức độ xuất hiện",
        "image": "https://taodandewukong.pro/imgs/dan2d1d (1).png",
        "totalTime": "PT2M",
        "estimatedCost": {
            "@type": "MonetaryAmount",
            "currency": "VND",
            "value": "0"
        },
        "supply": [
            {
                "@type": "HowToSupply",
                "name": "Máy tính hoặc điện thoại có kết nối internet"
            }
        ],
        "tool": [
            {
                "@type": "HowToTool",
                "name": "Công cụ tạo dàn đề 2D Tôn Ngộ Không"
            }
        ],
        "step": [
            {
                "@type": "HowToStep",
                "name": "Truy cập công cụ",
                "text": "Vào trang công cụ tạo dàn đề 2D tại taodandewukong.pro/dan-2d",
                "image": "https://taodandewukong.pro/imgs/dan2d1d (1).png",
                "url": "https://taodandewukong.pro/dan-2d"
            },
            {
                "@type": "HowToStep",
                "name": "Nhập số 2D",
                "text": "Nhập các số 2D (00-99) vào ô text, mỗi số cách nhau bằng dấu phẩy hoặc xuống dòng",
                "image": "https://taodandewukong.pro/imgs/dan2d1d (1).png"
            },
            {
                "@type": "HowToStep",
                "name": "Chọn chế độ phân loại",
                "text": "Chọn chế độ phân loại theo mức độ xuất hiện: Mức 1 (ít xuất hiện), Mức 2 (trung bình), Mức 3 (nhiều xuất hiện)",
                "image": "https://taodandewukong.pro/imgs/dan2d1d (1).png"
            },
            {
                "@type": "HowToStep",
                "name": "Tạo dàn đề",
                "text": "Nhấn nút 'Tạo Dàn Đề' để tạo dàn đề 2D theo thuật toán Fisher-Yates",
                "image": "https://taodandewukong.pro/imgs/dan2d1d (1).png"
            },
            {
                "@type": "HowToStep",
                "name": "Xuất kết quả",
                "text": "Xuất kết quả ra file Excel hoặc copy để sử dụng",
                "image": "https://taodandewukong.pro/imgs/dan2d1d (1).png"
            }
        ]
    };

    return (
        <>
            <SEOOptimized
                pageType="dan-2d"
                customTitle="Tạo Dàn Đề 2D Chuyên Nghiệp - Công Cụ Miễn Phí"
                customDescription="Tạo dàn đề 2D (00-99) chuyên nghiệp với phân loại theo mức độ xuất hiện, hỗ trợ chuyển đổi 1D sang 2D. Công cụ miễn phí, nhanh chóng, chính xác cho xổ số 3 miền."
                customKeywords="tạo dàn đề 2D, dàn đề 2D, công cụ tạo dàn đề 2D, dàn đề 00-99, lô đề 2 số, xổ số 2D, chuyển đổi 1D sang 2D, phân loại dàn đề 2D, thống kê dàn đề 2D, mẹo chơi dàn đề 2D"
                breadcrumbs={breadcrumbs}
                faq={faqData}
                structuredData={howToSchema}
            />
            <PageSpeedOptimizer />

            <Layout>
                <div className={styles.pageContainer}>
                    {/* Mobile Navbar */}
                    <MobileNavbar currentPage="dan-2d" showCurrentPageItems={false} />

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

                        <div className={styles.relatedTools}>
                            <h3>Công cụ liên quan:</h3>
                            <p>
                                Để có thêm thông tin về <Link href="/dan-3d4d">dàn đề 3D/4D</Link>,
                                <Link href="/dan-dac-biet">dàn đề đặc biệt</Link>, hoặc
                                <Link href="/thong-ke">thống kê xổ số 3 miền</Link> để phân tích hiệu quả hơn.
                            </p>
                        </div>

                        <div className={styles.detailedGuide}>
                            <h3>Hướng dẫn chi tiết tạo dàn đề 2D chuyên nghiệp</h3>
                            <div className={styles.guideContent}>
                                <h4>1. Tìm hiểu về dàn đề 2D</h4>
                                <p>
                                    Dàn đề 2D là tập hợp các số có 2 chữ số từ 00 đến 99, được sử dụng rộng rãi trong
                                    lô đề và xổ số. Khác với dàn đề 3D hay 4D, dàn đề 2D có tỷ lệ trúng cao hơn và
                                    phù hợp với người chơi mới bắt đầu. Công cụ tạo dàn đề 2D của chúng tôi sử dụng
                                    thuật toán Fisher-Yates chuẩn quốc tế để đảm bảo tính ngẫu nhiên và công bằng.
                                </p>

                                <h4>2. Phân loại theo mức độ xuất hiện</h4>
                                <p>
                                    Hệ thống phân tích và phân loại các số theo 3 mức độ: Mức 1 (ít xuất hiện),
                                    Mức 2 (trung bình), và Mức 3 (nhiều xuất hiện). Việc phân loại này dựa trên
                                    thống kê thực tế từ kết quả xổ số 3 miền, giúp người chơi có cái nhìn toàn diện
                                    về xu hướng số học.
                                </p>

                                <h4>3. Chiến lược chơi hiệu quả</h4>
                                <p>
                                    Để tối ưu hóa tỷ lệ trúng, người chơi nên kết hợp dàn đề 2D với thống kê xổ số
                                    và phân tích xu hướng. Tránh chơi quá nhiều số cùng lúc, tập trung vào các số
                                    có tần suất xuất hiện ổn định. Luôn có kế hoạch tài chính rõ ràng và không
                                    chơi vượt quá khả năng kinh tế.
                                </p>

                                <h4>4. Lợi ích của công cụ</h4>
                                <p>
                                    Công cụ tạo dàn đề 2D miễn phí 100%, không giới hạn số lần sử dụng. Hỗ trợ
                                    xuất kết quả ra file Excel, copy nhanh, và lưu trữ lịch sử. Giao diện thân thiện,
                                    hoạt động mượt mà trên mọi thiết bị từ máy tính đến điện thoại di động.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </Layout>
        </>
    );
});

// ✅ Export memoized component
export default Dan2DPage;

