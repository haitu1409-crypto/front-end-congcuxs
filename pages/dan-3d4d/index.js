/**
 * Dàn 3D/4D Page - Optimized
 * Compact design với Layout mới
 */

import { useState, memo, useMemo, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Layout from '../../components/Layout';
import SEOOptimized from '../../components/SEOOptimized';
import PageSpeedOptimizer from '../../components/PageSpeedOptimizer';
import MobileNavbar from '../../components/MobileNavbar';
import styles from '../../styles/Dan3D4D.module.css';
import { getPageSEO } from '../../config/seoConfig';
import AuthorBio from '../../components/SEO/AuthorBio';
import { DefinitionSnippet, TableSnippet } from '../../components/SEO/FeaturedSnippet';

// ✅ Dynamic icon import for better performance
const BarChart3 = dynamic(() => import('lucide-react').then(mod => ({ default: mod.BarChart3 })), { ssr: false });

// Lazy load heavy components for better PageSpeed
const Dan3DGenerator = dynamic(() => import('../../components/DanDe/Dan3DGenerator'), {
    loading: () => <div className={styles.loadingSkeleton}>Đang tải công cụ dàn 3D...</div>,
    ssr: false
});

const Dan4DGenerator = dynamic(() => import('../../components/DanDe/Dan4DGenerator'), {
    loading: () => <div className={styles.loadingSkeleton}>Đang tải công cụ dàn 4D...</div>,
    ssr: false
});

// ✅ Memoized Dan3D4D Page component
const Dan3D4DPage = memo(function Dan3D4DPage() {
    const [selectedType, setSelectedType] = useState('3D');
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003';

    // Get SEO config
    const pageSEO = getPageSEO('dan3d4d');

    // ✅ Memoized type change handler
    const handleTypeChange = useCallback((type) => {
        setSelectedType(type);
    }, []);

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

    // HowTo Schema cho dan-3d4d
    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "Cách tạo dàn đề 3D/4D chuyên nghiệp",
        "description": "Hướng dẫn chi tiết cách tạo dàn đề 3D (000-999) và 4D (0000-9999) cho cao thủ",
        "image": "https://taodandewukong.pro/imgs/dan3d4d (1).png",
        "totalTime": "PT3M",
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
                "name": "Công cụ tạo dàn đề 3D/4D Tôn Ngộ Không"
            }
        ],
        "step": [
            {
                "@type": "HowToStep",
                "name": "Truy cập công cụ",
                "text": "Vào trang công cụ tạo dàn đề 3D/4D tại taodandewukong.pro/dan-3d4d",
                "image": "https://taodandewukong.pro/imgs/dan3d4d (1).png",
                "url": "https://taodandewukong.pro/dan-3d4d"
            },
            {
                "@type": "HowToStep",
                "name": "Chọn loại dàn đề",
                "text": "Chọn tạo dàn đề 3D (000-999) hoặc dàn đề 4D (0000-9999) tùy theo nhu cầu",
                "image": "https://taodandewukong.pro/imgs/dan3d4d (1).png"
            },
            {
                "@type": "HowToStep",
                "name": "Nhập số gốc",
                "text": "Nhập các số gốc vào ô text, mỗi số cách nhau bằng dấu phẩy hoặc xuống dòng",
                "image": "https://taodandewukong.pro/imgs/dan3d4d (1).png"
            },
            {
                "@type": "HowToStep",
                "name": "Chọn số lượng dàn đề",
                "text": "Chọn số lượng dàn đề muốn tạo (tối đa 1000 dàn đề)",
                "image": "https://taodandewukong.pro/imgs/dan3d4d (1).png"
            },
            {
                "@type": "HowToStep",
                "name": "Tạo dàn đề",
                "text": "Nhấn nút 'Tạo Dàn Đề' để tạo dàn đề 3D/4D theo thuật toán Fisher-Yates",
                "image": "https://taodandewukong.pro/imgs/dan3d4d (1).png"
            },
            {
                "@type": "HowToStep",
                "name": "Xuất kết quả",
                "text": "Xuất kết quả ra file Excel hoặc copy để sử dụng",
                "image": "https://taodandewukong.pro/imgs/dan3d4d (1).png"
            }
        ]
    };

    return (
        <>
            <SEOOptimized
                pageType="dan-3d4d"
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
                    <MobileNavbar currentPage="dan-3d4d" showCurrentPageItems={false} />

                    <header className={styles.pageHeader}>
                        <h1 className={styles.pageTitle}>
                            <BarChart3 size={20} style={{ display: 'inline', marginRight: '8px' }} />
                            Tạo Dàn Đề 3D/4D Chuyên Nghiệp - Công Cụ Cao Thủ 2025
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
                                onClick={() => handleTypeChange('3D')}
                            >
                                Dàn 3D
                            </button>
                            <button
                                className={`${styles.typeButton} ${selectedType === '4D' ? styles.active : ''}`}
                                onClick={() => handleTypeChange('4D')}
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

                        <div className={styles.relatedTools}>
                            <h3>Công cụ liên quan:</h3>
                            <p>
                                Kết hợp với <Link href="/dan-2d">dàn đề 2D</Link>,
                                <Link href="/dan-dac-biet">dàn đề đặc biệt</Link>, và
                                <Link href="/thong-ke">thống kê xổ số 3 miền</Link> để có chiến lược chơi toàn diện.
                            </p>
                        </div>

                        <div className={styles.detailedGuide}>
                            <h3>Hướng dẫn chi tiết tạo dàn đề 3D/4D cho cao thủ</h3>
                            <div className={styles.guideContent}>
                                <h4>1. Dàn đề 3D vs 4D - Sự khác biệt</h4>
                                <p>
                                    Dàn đề 3D bao gồm các số từ 000 đến 999 (1000 số), phù hợp cho lô đề 3 số và
                                    xổ số miền Bắc. Dàn đề 4D từ 0000 đến 9999 (10000 số), dành cho lô đề 4 số và
                                    các hình thức chơi có thưởng cao. Tỷ lệ trúng dàn 3D là 1/1000, dàn 4D là 1/10000,
                                    nhưng thưởng tương ứng rất lớn.
                                </p>

                                <h4>2. Chiến lược cho cao thủ</h4>
                                <p>
                                    Dàn đề 3D/4D đòi hỏi kinh nghiệm và vốn lớn. Cao thủ thường kết hợp nhiều
                                    phương pháp: phân tích thống kê, theo dõi xu hướng, sử dụng bảng chốt dàn 3 miền.
                                    Quan trọng là có kế hoạch quản lý vốn chặt chẽ và không chơi theo cảm tính.
                                </p>

                                <h4>3. Thuật toán Fisher-Yates</h4>
                                <p>
                                    Công cụ sử dụng thuật toán Fisher-Yates chuẩn quốc tế, đảm bảo mỗi số có cơ hội
                                    xuất hiện ngang nhau. Thuật toán này được sử dụng trong các hệ thống xổ số chính
                                    thức trên thế giới, đảm bảo tính công bằng và ngẫu nhiên tuyệt đối.
                                </p>

                                <h4>4. Lưu ý quan trọng</h4>
                                <p>
                                    Dàn đề 3D/4D chỉ phù hợp với người chơi có kinh nghiệm và vốn dự phòng.
                                    Luôn bắt đầu với số tiền nhỏ để làm quen, không bao giờ chơi bằng tiền vay mượn.
                                    Sử dụng kết hợp với thống kê xổ số để có cái nhìn toàn diện về xu hướng.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Featured Snippet - Definition */}
                    <DefinitionSnippet
                        term="Dàn 3D-4D (Tạo Dàn 3 Càng)"
                        definition="Dàn 3D là tập hợp số có 3 chữ số (000-999), Dàn 4D là số có 4 chữ số (0000-9999). Thường dùng cho lô đề 3 càng, 4 càng hoặc giải đặc biệt. Có thể tách dàn nhanh thành AB-BC-CD (ví dụ: 1234 → AB=12, BC=23, CD=34) hoặc ghép lotto 4 càng để tăng khả năng trúng."
                        examples={[
                            'Dàn 3D: 123, 456, 789 (3 chữ số)',
                            'Dàn 4D: 1234, 5678 (4 chữ số)',
                            'Tách AB-BC-CD: 12345 → 12, 23, 34, 45'
                        ]}
                    />

                    {/* Comparison Table */}
                    <TableSnippet
                        title="So Sánh Dàn 3D vs Dàn 4D"
                        headers={['Tiêu Chí', 'Dàn 3D', 'Dàn 4D']}
                        rows={[
                            ['Số lượng', '1,000 số (000-999)', '10,000 số (0000-9999)'],
                            ['Tỷ lệ trúng', '1/1,000', '1/10,000'],
                            ['Tiền thưởng', 'Trung bình', 'Rất cao'],
                            ['Độ khó', 'Trung bình', 'Khó'],
                            ['Phù hợp', 'Người chơi trung cấp', 'Cao thủ xổ số'],
                            ['Chiến lược', 'Nuôi 3-5 ngày', 'Chơi đặc biệt']
                        ]}
                    />

                    {/* Author Bio */}
                    <AuthorBio />
                </div>
            </Layout>
        </>
    );
});

// ✅ Export memoized component
export default Dan3D4DPage;

