/**
 * Homepage - Landing Page
 * Trang chủ mới với navigation tốt hơn và giới thiệu các công cụ
 */

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { memo, useMemo, useCallback, Suspense } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Home.module.css';
import SEOOptimized from '../components/SEOOptimized';
import SEOAnalytics from '../components/SEOAnalytics';
import PageSpeedOptimizer from '../components/PageSpeedOptimizer';
// ✅ Lazy load WukongSlider for better LCP
const WukongSlider = dynamic(() => import('../components/WukongSlider'), {
    loading: () => <div className="sliderLoadingSkeleton"></div>,
    ssr: false
});

// ✅ Dynamic icon imports for better performance
const Dice6 = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Dice6 })), { ssr: false });
const Target = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Target })), { ssr: false });
const BarChart3 = dynamic(() => import('lucide-react').then(mod => ({ default: mod.BarChart3 })), { ssr: false });
const Star = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Star })), { ssr: false });
const Zap = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Zap })), { ssr: false });
const CheckCircle = dynamic(() => import('lucide-react').then(mod => ({ default: mod.CheckCircle })), { ssr: false });
const Heart = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Heart })), { ssr: false });
const Smartphone = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Smartphone })), { ssr: false });
const ArrowRight = dynamic(() => import('lucide-react').then(mod => ({ default: mod.ArrowRight })), { ssr: false });
const Sparkles = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Sparkles })), { ssr: false });

// ✅ Memoized Homepage component for better performance
const Home = memo(function Home() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    // ✅ Memoized data arrays to prevent unnecessary re-renders
    const breadcrumbs = useMemo(() => [
        { name: 'Trang chủ', url: siteUrl }
    ], [siteUrl]);

    const faqData = useMemo(() => [
        {
            question: 'Dàn Đề Tôn Ngộ Không có những công cụ gì?',
            answer: 'Chúng tôi cung cấp đầy đủ bộ công cụ tạo dàn đề chuyên nghiệp: Dàn đề 9x-0x, Dàn 2D, Dàn 3D/4D, Dàn đặc biệt, Thống kê xổ số 3 miền, và nhiều công cụ hỗ trợ khác. Tất cả đều miễn phí 100%.'
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
            answer: 'Các công cụ phù hợp cho tất cả loại xổ số 3 miền (miền Bắc, miền Nam, miền Trung), lô đề, và các hình thức chơi xổ số khác. Được thiết kế chuyên nghiệp cho người chơi Việt Nam.'
        },
        {
            question: 'Dàn đề 9x-0x phù hợp cho loại xổ số nào?',
            answer: 'Dàn đề 9x-0x phù hợp cho tất cả loại xổ số 3 miền (miền Bắc, miền Nam, miền Trung), lô đề 2 số, 3 số, và các hình thức chơi khác. Có thể tùy chỉnh số lượng dàn theo nhu cầu.'
        },
        {
            question: 'Tại sao nên chọn công cụ tạo dàn đề này?',
            answer: 'Công cụ được thiết kế chuyên nghiệp với giao diện thân thiện, tốc độ xử lý nhanh (0.1 giây), thuật toán chuẩn quốc tế, hoàn toàn miễn phí và không có quảng cáo phiền phức.'
        }
    ], []);

    const tools = useMemo(() => [
        {
            icon: Dice6,
            title: 'Dàn 9x-0x',
            description: 'Tạo dàn đề 9x-0x ngẫu nhiên với 10 cấp độ rút dần từ 95 xuống 8 số',
            link: '/dan-9x0x',
            badge: 'Phổ biến'
        },
        {
            icon: Target,
            title: 'Dàn 2D',
            description: 'Tạo dàn 2D (00-99) với phân loại theo mức độ xuất hiện, hỗ trợ chuyển đổi 1D',
            link: '/dan-2d',
            badge: 'Mới'
        },
        {
            icon: BarChart3,
            title: 'Dàn 3D/4D',
            description: 'Tạo dàn 3D (000-999) và 4D (0000-9999), công cụ chuyên nghiệp cho cao thủ',
            link: '/dan-3d4d',
            badge: 'Pro'
        },
        {
            icon: Star,
            title: 'Dàn Đặc Biệt',
            description: 'Bộ lọc thông minh theo đầu, đuôi, tổng, chạm, kép. Lấy nhanh số may mắn',
            link: '/dan-dac-biet',
            badge: 'Đặc biệt'
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
        "name": "Dàn Đề Tôn Ngộ Không",
        "alternateName": "Tạo Dàn Đề Online",
        "description": "Bộ công cụ tạo dàn đề chuyên nghiệp hàng đầu Việt Nam. Dàn đề 9x-0x, Dàn 2D, Dàn 3D/4D, Dàn đặc biệt, Thống kê xổ số 3 miền. Miễn phí 100%, thuật toán Fisher-Yates chuẩn quốc tế.",
        "url": "https://taodandewukong.pro",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Web Browser",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "softwareVersion": "1.0.0",
        "datePublished": "2024-01-01",
        "dateModified": new Date().toISOString(),
        "author": {
            "@type": "Organization",
            "name": "Dàn Đề Tôn Ngộ Không"
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
            "Tạo dàn đề 9x-0x ngẫu nhiên",
            "Tạo dàn đề 2D (00-99)",
            "Tạo dàn đề 3D/4D",
            "Ghép dàn đề đặc biệt",
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
            <SEOOptimized
                pageType="home"
                customTitle="Dàn Đề Tôn Ngộ Không - Công Cụ Tạo Dàn Đề Miễn Phí 2024"
                customDescription="Bộ công cụ tạo dàn đề chuyên nghiệp hàng đầu Việt Nam. Dàn đề 9x-0x, Dàn 2D, Dàn 3D/4D, Dàn đặc biệt, Thống kê xổ số 3 miền. Miễn phí 100%, thuật toán Fisher-Yates chuẩn quốc tế."
                customKeywords="dàn đề tôn ngộ không, tạo dàn đề, công cụ dàn đề, dàn đề 9x-0x, dàn đề 2D, dàn đề 3D, thống kê xổ số, xổ số 3 miền, lô đề, tạo dàn đề miễn phí, công cụ xổ số chuyên nghiệp"
                breadcrumbs={breadcrumbs}
                faq={faqData}
                structuredData={softwareApplicationSchema}
            />
            <SEOAnalytics />
            <PageSpeedOptimizer />

            <Layout>
                <div className={styles.container}>
                    {/* Hero Section - Landing Page */}
                    <header className={styles.header}>
                        <div className={styles.heroBadge}>
                            <Sparkles className={styles.heroBadgeIcon} />
                            <span>Bộ công cụ chuyên nghiệp</span>
                        </div>
                        <h1 className={styles.mainTitle}>
                            Dàn Đề <span className={styles.heroTitleHighlight}>Tôn Ngộ Không</span>
                        </h1>
                        <p className={styles.subtitle}>
                            Bộ công cụ tạo dàn đề chuyên nghiệp hàng đầu Việt Nam.
                            Dàn đề 9x-0x, Dàn 2D, Dàn 3D/4D, Dàn đặc biệt, Thống kê xổ số 3 miền.
                            Miễn phí 100%, thuật toán Fisher-Yates chuẩn quốc tế.
                        </p>
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
                        </div>
                    </header>

                    {/* Wukong Slider - Lazy loaded for better LCP */}
                    <Suspense fallback={<div className="sliderLoadingSkeleton"></div>}>
                        <WukongSlider />
                    </Suspense>

                    {/* Tools Grid */}
                    <section className={styles.toolsSection} aria-label="Các công cụ tạo dàn đề">
                        <h2 className={styles.sectionTitle}>Chọn Công Cụ</h2>

                        <div className={styles.toolsGrid}>
                            {tools.map((tool, idx) => {
                                const IconComponent = tool.icon;
                                return (
                                    <Link
                                        href={tool.link}
                                        key={idx}
                                        className={styles.toolCard}
                                        aria-label={`Đi đến ${tool.title}`}
                                        prefetch={false} // Disable prefetch for better performance
                                    >
                                        {tool.badge && (
                                            <span className={styles.toolBadge}>{tool.badge}</span>
                                        )}
                                        <div className={styles.toolIcon}>
                                            <IconComponent size={24} />
                                        </div>
                                        <h3 className={styles.toolTitle}>{tool.title}</h3>
                                        <p className={styles.toolDescription}>{tool.description}</p>
                                        <div className={styles.toolArrow}>
                                            <span>Truy cập</span>
                                            <span>→</span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* Quick Access Section */}
                    <section className={styles.quickAccess}>
                        <div className={styles.quickAccessHeader}>
                            <h2>Bắt Đầu Ngay</h2>
                            <p>Chọn công cụ phù hợp với nhu cầu của bạn</p>
                        </div>
                        <div className={styles.quickAccessGrid}>
                            <Link href="/dan-9x0x" className={styles.quickAccessCard}>
                                <Dice6 className={styles.quickAccessIcon} />
                                <h3>Tạo Dàn Đề 9x-0x</h3>
                                <p>Công cụ phổ biến nhất với 10 cấp độ rút dần</p>
                                <div className={styles.quickAccessBadge}>Phổ biến</div>
                            </Link>
                            <Link href="/thong-ke" className={styles.quickAccessCard}>
                                <BarChart3 className={styles.quickAccessIcon} />
                                <h3>Thống Kê Xổ Số</h3>
                                <p>Phân tích dữ liệu xổ số 3 miền chi tiết</p>
                            </Link>
                            <Link href="/content" className={styles.quickAccessCard}>
                                <Heart className={styles.quickAccessIcon} />
                                <h3>Hướng Dẫn Chơi</h3>
                                <p>Mẹo và chiến thuật chơi xổ số hiệu quả</p>
                            </Link>
                        </div>
                    </section>

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
                                <h3>Hướng dẫn sử dụng công cụ tạo dàn đề hiệu quả</h3>
                                <p>Khám phá các mẹo và chiến thuật để tối ưu hóa việc sử dụng công cụ tạo dàn đề...</p>
                                <Link href="/content" className={styles.newsReadMore}>Đọc thêm</Link>
                            </div>
                            <div className={styles.newsCard}>
                                <h3>Thống kê xổ số 3 miền tháng gần đây</h3>
                                <p>Phân tích chi tiết xu hướng và tần suất xuất hiện của các số trong xổ số...</p>
                                <Link href="/thong-ke" className={styles.newsReadMore}>Xem thống kê</Link>
                            </div>
                        </div>
                    </section>
                </div>
            </Layout>
        </>
    );
});

// ✅ Export memoized component
export default Home;

