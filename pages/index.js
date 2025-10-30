/**
 * Homepage - Landing Page
 * Trang chủ mới với navigation tốt hơn và giới thiệu các công cụ
 */

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { memo, useMemo, useCallback } from 'react';
import Layout from '../components/Layout';
import LatestXSMBResults from '../components/LatestXSMBResults';
import TodayPredictions from '../components/TodayPredictions';
import styles from '../styles/Home.module.css';
import EnhancedSEOHead from '../components/EnhancedSEOHead';
import { getPageSEO } from '../config/seoConfig';
import { getAllKeywordsForPage } from '../config/keywordVariations';
// ✅ Optimized: Import all icons at once (better than 10 dynamic imports)
import { Dice6, Target, BarChart3, Star, Zap, CheckCircle, Heart, Smartphone, ArrowRight, Sparkles, Calendar, Activity, TrendingUp, Award, Percent } from 'lucide-react';

// ✅ Lazy load SEO components for better performance with CLS fixes
const AuthorBio = dynamic(() => import('../components/SEO/AuthorBio'), {
    loading: () => <div style={{ minHeight: '200px', contain: 'layout style' }}></div>,
    ssr: false
});

const Testimonials = dynamic(() => import('../components/SEO/Testimonials'), {
    loading: () => <div style={{ minHeight: '300px', contain: 'layout style' }}></div>,
    ssr: false
});

const DirectAnswer = dynamic(() =>
    import('../components/SEO/FeaturedSnippet').then(mod => ({ default: mod.DirectAnswer })),
    { ssr: false, loading: () => <div style={{ minHeight: '200px', contain: 'layout style' }}></div> }
);

const ListSnippet = dynamic(() =>
    import('../components/SEO/FeaturedSnippet').then(mod => ({ default: mod.ListSnippet })),
    { ssr: false, loading: () => <div style={{ minHeight: '250px', contain: 'layout style' }}></div> }
);

const TableSnippet = dynamic(() =>
    import('../components/SEO/FeaturedSnippet').then(mod => ({ default: mod.TableSnippet })),
    { ssr: false, loading: () => <div style={{ minHeight: '300px', contain: 'layout style' }}></div> }
);

// ✅ Memoized Homepage component for better performance
const Home = memo(function Home() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    // Get SEO config for homepage
    const pageSEO = getPageSEO('home');

    // ✅ Get all keyword variations for homepage
    const allKeywords = getAllKeywordsForPage('home');

    // ✅ Memoized data arrays to prevent unnecessary re-renders
    const breadcrumbs = useMemo(() => [
        { name: 'Trang chủ', url: siteUrl }
    ], [siteUrl]);

    const faqData = useMemo(() => [
        {
            question: 'Dàn Đề Wukong có những công cụ gì?',
            answer: 'Chúng tôi cung cấp đầy đủ bộ công cụ tạo dàn đề chuyên nghiệp: Dàn đề 9x-0x, Dàn đề 2D, Dàn đề 3D/4D, Dàn đề đặc biệt, Thống kê xổ số 3 miền, và nhiều công cụ hỗ trợ khác. Tất cả đều miễn phí 100%.'
        },
        {
            question: 'Các công cụ có chính xác và đáng tin cậy không?',
            answer: 'Tất cả công cụ sử dụng thuật toán Fisher-Yates chuẩn quốc tế, đảm bảo tính ngẫu nhiên tuyệt đối và chính xác 100%. Đây là thuật toán được sử dụng rộng rãi trong các ứng dụng chuyên nghiệp.'
        },
        {
            question: 'Có cần đăng ký tài khoản để sử dụng không?',
            answer: 'Không, tất cả công cụ đều hoàn toàn miễn phí, không cần đăng ký tài khoản, không giới hạn số lần sử dụng. Bạn có thể sử dụng ngay lập tức.'
        },
        {
            question: 'Công cụ phù hợp cho loại xổ số nào?',
            answer: 'Các công cụ phù hợp cho tất cả loại xổ số 3 miền (miền Bắc, miền Nam, miền Trung), lô số, và các hình thức chơi xổ số khác. Được thiết kế chuyên nghiệp cho người chơi Việt Nam.'
        },
        {
            question: 'Dàn đề 9x-0x phù hợp cho loại xổ số nào?',
            answer: 'Dàn đề 9x-0x phù hợp cho tất cả loại xổ số 3 miền (miền Bắc, miền Nam, miền Trung), lô số 2 số, 3 số, và các hình thức chơi khác. Có thể tùy chỉnh số lượng dàn theo nhu cầu.'
        },
        {
            question: 'Tại sao nên chọn công cụ tạo dàn đề này?',
            answer: 'Công cụ được thiết kế chuyên nghiệp với giao diện thân thiện, tốc độ xử lý nhanh (0.1 giây), thuật toán chuẩn quốc tế, hoàn toàn miễn phí và không có quảng cáo phiền phức.'
        }
    ], []);

    const tools = useMemo(() => [
        {
            icon: Dice6,
            title: 'Dàn Đề 9x-0x',
            description: 'Tạo dàn đề 9x-0x ngẫu nhiên với 10 cấp độ rút dần từ 95 xuống 8 số',
            link: '/dan-9x0x',
            badge: 'Phổ biến'
        },
        {
            icon: Target,
            title: 'Dàn Đề 2D',
            description: 'Tạo dàn đề 2D (00-99) với phân loại theo mức độ xuất hiện, hỗ trợ chuyển đổi 1D',
            link: '/dan-2d',
            badge: 'Mới'
        },
        {
            icon: BarChart3,
            title: 'Dàn Đề 3D/4D',
            description: 'Tạo dàn đề 3D (000-999) và 4D (0000-9999), công cụ chuyên nghiệp cho cao thủ',
            link: '/dan-3d4d',
            badge: 'Pro'
        },
        {
            icon: Star,
            title: 'Dàn Đề Đặc Biệt',
            description: 'Bộ lọc thông minh theo đầu, đuôi, tổng, chạm, kép. Lấy nhanh dàn đề may mắn',
            link: '/dan-dac-biet',
            badge: 'Đặc biệt'
        },
        {
            icon: Sparkles,
            title: 'Soi Cầu AI',
            description: '5 thuật toán AI cao cấp: LSTM, Transformer, Bayesian, Genetic, ARIMA',
            link: '/soi-cau-ai',
            badge: 'AI'
        }
    ], []);

    const features = [
        {
            icon: Zap,
            title: 'Nhanh Chóng',
            description: 'Xử lý tức thì, kết quả trong 0.1 giây'
        },
        {
            icon: CheckCircle,
            title: 'Chính Xác',
            description: 'Thuật toán chuẩn, kết quả chính xác 100%'
        },
        {
            icon: Heart,
            title: 'Miễn Phí',
            description: 'Hoàn toàn miễn phí, không giới hạn'
        },
        {
            icon: Smartphone,
            title: 'Mọi Thiết Bị',
            description: 'Hoạt động mượt trên mọi thiết bị'
        }
    ];

    // SoftwareApplication Schema cho homepage
    const softwareApplicationSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Dàn Đề Wukong",
        "alternateName": "Tạo Dàn Đề Online",
        "description": "Bộ công cụ tạo dàn số chuyên nghiệp hàng đầu Việt Nam. Dàn đề 9x-0x, Dàn 2D, Dàn 3D/4D, Dàn đặc biệt, Thống kê xổ số 3 miền. Miễn phí 100%, thuật toán Fisher-Yates chuẩn quốc tế.",
        "url": "https://taodandewukong.pro",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Web Browser",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "softwareVersion": "1.0.0",
        "datePublished": "2024-01-01",
        "dateModified": new Date().toISOString(),
        "author": {
            "@type": "Organization",
            "name": "Dàn Đề Wukong"
        },
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "VND"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1250",
            "bestRating": "5",
            "worstRating": "1"
        },
        "featureList": [
            "Tạo dàn số 9x-0x ngẫu nhiên",
            "Tạo dàn số 2D (00-99)",
            "Tạo dàn số 3D/4D",
            "Ghép dàn số đặc biệt",
            "Thống kê xổ số 3 miền",
            "Thuật toán Fisher-Yates chuẩn quốc tế",
            "Miễn phí 100%",
            "Xuất file Excel",
            "Lưu trữ kết quả"
        ],
        "screenshot": [
            "https://taodandewukong.pro/imgs/dan9x0x (1).png",
            "https://taodandewukong.pro/imgs/dan2d1d (1).png",
            "https://taodandewukong.pro/imgs/dan3d4d (1).png"
        ],
        "downloadUrl": "https://taodandewukong.pro",
        "installUrl": "https://taodandewukong.pro",
        "softwareRequirements": "Web Browser with JavaScript enabled"
    };

    return (
        <>
            {/* ✅ Enhanced SEO with multi-search engine optimization */}
            <EnhancedSEOHead
                pageType="home"
                customTitle={pageSEO.title}
                customDescription={pageSEO.description}
                customKeywords={allKeywords.join(', ')}
                canonicalUrl={pageSEO.canonical}
                ogImage={pageSEO.image}
                breadcrumbs={breadcrumbs}
                faq={faqData}
                structuredData={softwareApplicationSchema}
            />

            <Layout>
                <div className={styles.container}>
                    {/* Hero Section - Landing Page */}
                    <header className={styles.header}>
                        <div className={styles.heroBadge}>
                            <Sparkles className={styles.heroBadgeIcon} />
                            <span>Bộ công cụ chuyên nghiệp</span>
                        </div>
                        <h1 className={styles.mainTitle}>
                            Công Cụ Xổ Số, <span className={styles.heroTitleHighlight}>Tạo Dàn ĐỀ Wukong</span>
                        </h1>
                        <div className={styles.heroActions}>
                            <Link href="/dan-9x0x" className={styles.heroPrimaryButton}>
                                <Dice6 className={styles.heroButtonIcon} />
                                <span>Tạo Dàn Đề 9x-0x</span>
                                <ArrowRight className={styles.heroButtonArrow} />
                            </Link>
                            <Link href="/dan-2d" className={styles.heroSecondaryButton}>
                                <Target className={styles.heroButtonIcon} />
                                <span>Dàn 2D</span>
                            </Link>
                            <Link href="/kqxs" className={styles.heroSecondaryButton}>
                                <Calendar className={styles.heroButtonIcon} />
                                <span>Kết Quả Xổ Số</span>
                            </Link>
                            <Link href="/dan-3d4d" className={styles.heroSecondaryButton}>
                                <BarChart3 className={styles.heroButtonIcon} />
                                <span>Dàn 3D/4D</span>
                            </Link>
                            <Link href="/dan-dac-biet" className={styles.heroSecondaryButton}>
                                <Star className={styles.heroButtonIcon} />
                                <span>Dàn Đặc Biệt</span>
                            </Link>
                            <Link href="/soi-cau" className={styles.heroSecondaryButton}>
                                <Target className={styles.heroButtonIcon} />
                                <span>Soi Cầu</span>
                            </Link>
                            <Link href="/soicau-bayesian" className={styles.heroSecondaryButton}>
                                <Sparkles className={styles.heroButtonIcon} />
                                <span>Soi Cầu AI</span>
                            </Link>
                            <Link href="/thongke/lo-gan" className={styles.heroSecondaryButton}>
                                <TrendingUp className={styles.heroButtonIcon} />
                                <span>Lô Gan</span>
                            </Link>
                            <Link href="/thongke/giai-dac-biet" className={styles.heroSecondaryButton}>
                                <Award className={styles.heroButtonIcon} />
                                <span>Giải ĐB</span>
                            </Link>
                            <Link href="/thongke/giai-dac-biet-tuan" className={styles.heroSecondaryButton}>
                                <Calendar className={styles.heroButtonIcon} />
                                <span>ĐB Tuần</span>
                            </Link>
                            <Link href="/thongke/dau-duoi" className={styles.heroSecondaryButton}>
                                <Percent className={styles.heroButtonIcon} />
                                <span>Đầu Đuôi</span>
                            </Link>
                            <Link href="/thongke/Tan-Suat-Lo-to" className={styles.heroSecondaryButton}>
                                <Activity className={styles.heroButtonIcon} />
                                <span>Tần Suất Lô</span>
                            </Link>
                            <Link href="/thongke/Tan-Suat-Lo-Cap" className={styles.heroSecondaryButton}>
                                <Target className={styles.heroButtonIcon} />
                                <span>Tần Suất Cặp</span>
                            </Link>
                        </div>
                    </header>

                    {/* Main Content Layout - 2 Columns */}
                    <div className={styles.mainContentLayout}>
                        {/* Left Column - Main Content */}
                        <div className={styles.leftColumn}>
                            {/* Latest XSMB Results */}
                            <LatestXSMBResults />

                            {/* Today Predictions - Mobile Only */}
                            <div className={styles.mobileOnlyTodayPredictions}>
                                <TodayPredictions />
                            </div>

                            {/* Featured Snippet - Direct Answer */}
                            <DirectAnswer
                                question="Tạo Dàn Đề (Tao Dan De) Là Gì?"
                                answer="Tạo dàn đề (tao dan de) là phương pháp chọn ra một tập hợp các con số (dàn đề) để đánh lô đề hoặc xổ số, dựa trên các tiêu chí như tổng, chạm, đầu, đuôi, kép nhằm tăng khả năng trúng thưởng. Ứng dụng tạo dàn đề giúp bạn tạo tự động các tổ hợp số 2D (00-99), 3D (000-999), 4D (0000-9999), ghép lô xiên, và lọc dàn theo nhiều điều kiện đặc biệt một cách nhanh chóng, chính xác 100% với thuật toán Fisher-Yates chuẩn quốc tế."
                            />

                            {/* Featured Snippet - How To List */}
                            <ListSnippet
                                title="Cách Tạo Dàn Đề Online Miễn Phí"
                                ordered={true}
                                items={[
                                    { label: 'Bước 1', text: 'Truy cập công cụ tạo dàn số TaoDanDe tại taodandewukong.pro' },
                                    { label: 'Bước 2', text: 'Chọn loại dàn cần tạo: Dàn 2D (00-99), Dàn 3D (000-999), Dàn 4D (0000-9999), Dàn 9x-0x, hoặc Ghép lô xiên' },
                                    { label: 'Bước 3', text: 'Nhập các số vào ô text (có thể copy/paste) hoặc click nút "Tạo Ngẫu Nhiên"' },
                                    { label: 'Bước 4', text: 'Áp dụng bộ lọc nếu cần: Lọc theo chạm, tổng, kép, tài xỉu, chẵn lẻ, đầu đuôi' },
                                    { label: 'Bước 5', text: 'Click "Tạo Dàn" hoặc "Lọc Ghép Dàn" để xem kết quả' },
                                    { label: 'Bước 6', text: 'Copy kết quả hoặc xuất file Excel để sử dụng' }
                                ]}
                            />

                            {/* Featured Snippet - Comparison Table */}
                            <TableSnippet
                                title="So Sánh Các Loại Dàn Đề"
                                headers={['Loại Dàn', 'Số Lượng', 'Độ Khó', 'Tỷ Lệ Trúng', 'Phù Hợp Cho']}
                                rows={[
                                    ['Dàn 2D', '100 số (00-99)', 'Dễ', '1/100', 'Người mới bắt đầu'],
                                    ['Dàn 3D', '1,000 số (000-999)', 'Trung bình', '1/1,000', 'Người chơi trung cấp'],
                                    ['Dàn 4D', '10,000 số (0000-9999)', 'Khó', '1/10,000', 'Cao thủ xổ số'],
                                    ['Dàn 9x-0x', '70-95 số', 'Dễ', 'Cao (nuôi)', 'Chiến lược nuôi dàn'],
                                    ['Dàn 36 số', '36 số', 'Trung bình', 'Rất cao', 'Phổ biến nhất'],
                                    ['Lô Xiên 2-3-4', 'Tùy chỉnh', 'Trung bình', 'Cao', 'Tất cả mọi người']
                                ]}
                            />

                            {/* Features Section - Compact */}
                            <section className={styles.features} aria-label="Tính năng nổi bật">
                                <div className={styles.featuresGrid}>
                                    {features.map((feature, idx) => {
                                        const IconComponent = feature.icon;
                                        return (
                                            <div key={idx} className={styles.featureItem}>
                                                <div className={styles.featureIcon}>
                                                    <IconComponent size={20} />
                                                </div>
                                                <h3>{feature.title}</h3>
                                                <p>{feature.description}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* News Section */}
                            <section className={styles.newsSection}>
                                <div className={styles.newsHeader}>
                                    <h2>Tin Tức Mới Nhất</h2>
                                    <Link href="/tin-tuc" className={styles.newsLink}>
                                        Xem tất cả →
                                    </Link>
                                </div>
                                <div className={styles.newsGrid}>
                                    <div className={styles.newsCard}>
                                        <h3>Hướng dẫn sử dụng công cụ tạo dàn số hiệu quả</h3>
                                        <p>Khám phá các mẹo và chiến thuật để tối ưu hóa việc sử dụng công cụ tạo dàn số...</p>
                                        <Link href="/content" className={styles.newsReadMore}>Đọc thêm</Link>
                                    </div>
                                    <div className={styles.newsCard}>
                                        <h3>Thống kê xổ số 3 miền tháng gần đây</h3>
                                        <p>Phân tích chi tiết xu hướng và tần suất xuất hiện của các số trong xổ số...</p>
                                        <Link href="/thong-ke" className={styles.newsReadMore}>Xem thống kê</Link>
                                    </div>
                                </div>
                            </section>

                            {/* User Testimonials - Social Proof */}
                            <Testimonials />

                            {/* Author Bio - E-E-A-T Signal */}
                            <AuthorBio
                                name="Đội Ngũ Chuyên Gia TaoDanDe"
                                title="Chuyên Gia Tạo Dàn Đề & Xổ Số"
                                experience="10+"
                                users="100,000+"
                                description="Đội ngũ chuyên gia với hơn 10 năm kinh nghiệm trong lĩnh vực xổ số và lô số. Phát triển các công cụ tạo dàn số, tạo mức số, nuôi dàn khung 3-5 ngày chuyên nghiệp phục vụ hơn 100,000 người chơi trên toàn quốc."
                            />
                        </div>

                        {/* Right Column - Today Predictions (Desktop Only) */}
                        <div className={styles.rightColumn}>
                            <div className={styles.desktopOnlyTodayPredictions}>
                                <TodayPredictions />
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
});

// ✅ Export memoized component
export default Home;

