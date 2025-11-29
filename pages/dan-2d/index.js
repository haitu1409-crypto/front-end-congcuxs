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
import { getPageSEO } from '../../config/seoConfig';
// ✅ Optimized: Import icon directly
import { Target } from 'lucide-react';

// ✅ Lazy load SEO components
const AuthorBio = dynamic(() => import('../../components/SEO/AuthorBio'), {
    loading: () => null,
    ssr: false
});

const DefinitionSnippet = dynamic(() =>
    import('../../components/SEO/FeaturedSnippet').then(mod => ({ default: mod.DefinitionSnippet })),
    { ssr: false, loading: () => null }
);

const DirectAnswer = dynamic(() =>
    import('../../components/SEO/FeaturedSnippet').then(mod => ({ default: mod.DirectAnswer })),
    { ssr: false, loading: () => null }
);

// Lazy load heavy component for better PageSpeed
const Dan2DGenerator = dynamic(() => import('../../components/DanDe/Dan2DGenerator'), {
    loading: () => <div className={styles.loadingSkeleton}>Đang tải công cụ dàn 2D...</div>,
    ssr: false
});

// ✅ Memoized Dan2D Page component
const Dan2DPage = memo(function Dan2DPage() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003';

    // Get SEO config
    const pageSEO = getPageSEO('dan2d');

    // ✅ Memoized breadcrumbs
    const breadcrumbs = useMemo(() => [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Dàn Đề 2D', url: `${siteUrl}/dan-2d` }
    ], [siteUrl]);

    const faqData = [
        {
            question: 'Dàn đề 2D là gì và phù hợp cho loại xổ số nào?',
            answer: 'Dàn đề 2D là tập hợp các số có 2 chữ số (00-99), phù hợp cho lô số 2 số, xổ số miền Bắc, miền Nam, miền Trung. Đây là loại dàn số phổ biến nhất với tỷ lệ trúng cao.'
        },
        {
            question: 'Cách tạo dàn số 2D hiệu quả nhất?',
            answer: 'Sử dụng công cụ tạo dàn số 2D với phân loại theo mức độ xuất hiện, kết hợp với thống kê xổ số 3 miền để chọn số có khả năng trúng cao nhất.'
        },
        {
            question: 'Chuyển đổi 1D sang 2D hoạt động như thế nào?',
            answer: 'Chức năng chuyển đổi 1D sang 2D giúp bạn tạo dàn số 2D từ các số 1 chữ số, tăng tính linh hoạt và đa dạng hóa chiến lược chơi.'
        },
        {
            question: 'Dàn đề 2D có thể sử dụng cho bao nhiêu loại xổ số?',
            answer: 'Dàn đề 2D có thể sử dụng cho tất cả loại xổ số 3 miền, lô số 2 số, và nhiều hình thức chơi khác. Rất linh hoạt và phổ biến.'
        }
    ];

    // HowTo Schema cho dan-2d
    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "Cách tạo dàn số 2D chuyên nghiệp",
        "description": "Hướng dẫn chi tiết cách tạo dàn số 2D từ 00-99 với phân loại theo mức độ xuất hiện",
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
                "name": "Công cụ tạo dàn số 2D Wukong"
            }
        ],
        "author": {
            "@type": "Organization",
            "name": "Dàn Đề Wukong",
            "url": "https://taodandewukong.pro"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Dàn Đề Wukong",
            "url": "https://taodandewukong.pro"
        },
        "step": [
            {
                "@type": "HowToStep",
                "name": "Truy cập công cụ",
                "text": "Vào trang công cụ tạo dàn số 2D tại taodandewukong.pro/dan-2d",
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
                "name": "Tạo dàn số",
                "text": "Nhấn nút 'Tạo Dàn Đề' để tạo dàn số 2D theo thuật toán Fisher-Yates",
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
                customTitle={pageSEO.title}
                customDescription={pageSEO.description}
                customKeywords={pageSEO.keywords.join(', ')}
                canonicalUrl={pageSEO.canonical}
                ogImage={pageSEO.image}
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
                        Công Cụ Tạo Dàn Đề 2D/1D
                    </h1>
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

                    {/* Featured Snippet - Definition */}
                    <DefinitionSnippet
                        term="Dàn 2D (Tạo Mức Số 2D)"
                        definition="Dàn 2D là tập hợp các số có 2 chữ số từ 00 đến 99, được sử dụng để đánh lô số 2 số hoặc xổ số miền Bắc, miền Nam, miền Trung. Đây là loại dàn số phổ biến nhất với tỷ lệ trúng cao (1/100) và dễ chơi. Có thể tạo bạch thủ (1 số), song thủ (2 số), hoặc dàn lớn (10-20 số) tùy theo chiến lược."
                        examples={[
                            'Bạch thủ lô 2D: Chọn 1 số duy nhất, ví dụ: 36',
                            'Song thủ lô 2D: Chọn 2 số, ví dụ: 36, 63',
                            'Dàn 10 số: 01, 05, 09, 15, 25, 35, 45, 55, 65, 75'
                        ]}
                    />

                    {/* Direct Answer - How to */}
                    <DirectAnswer
                        question="Cách Tạo Dàn 2D Hiệu Quả?"
                        answer="Để tạo dàn 2D hiệu quả, bạn nên kết hợp giữa tạo ngẫu nhiên và lọc theo điều kiện. Sử dụng công cụ tạo mức số 2D của chúng tôi, chọn số theo chạm (ví dụ: tất cả số có chứa số 5), theo tổng (ví dụ: tổng = 7 như 16, 25, 34), hoặc theo đầu đuôi (ví dụ: đầu 1 đuôi 5 = 15). Sau đó áp dụng lọc ghép dàn để loại bỏ số trùng và tối ưu hóa dàn số."
                    />

                    {/* Author Bio - E-E-A-T */}
                    <AuthorBio />
                </div>
            </Layout>
        </>
    );
});

// ✅ Export memoized component
export default Dan2DPage;

