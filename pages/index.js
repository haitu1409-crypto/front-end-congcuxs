/**
 * Homepage - Landing Page
 * Trang chủ mới với navigation tốt hơn và giới thiệu các công cụ
 */

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { memo, useMemo, useCallback } from 'react';
import Layout from '../components/Layout';
import TodayPredictions from '../components/TodayPredictions';
import styles from '../styles/Home.module.css';
import EnhancedSEOHead from '../components/EnhancedSEOHead';
import { getPageSEO } from '../config/seoConfig';
import { getAllKeywordsForPage } from '../config/keywordVariations';
// ✅ Optimized: Import all icons at once (better than 10 dynamic imports)
import { Dice6, Target, BarChart3, Star, Zap, CheckCircle, Heart, Smartphone, Sparkles, Calendar, Activity, TrendingUp, Award, Percent } from 'lucide-react';

// ✅ Lazy load LatestXSMBResults to avoid hydration mismatch
const LatestXSMBResults = dynamic(() => import('../components/LatestXSMBResults'), {
    loading: () => (
        <div style={{ 
            minHeight: '400px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: '#fff',
            borderRadius: '8px',
            margin: '20px 0',
            contain: 'layout style' 
        }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    border: '4px solid #f3f3f3', 
                    borderTop: '4px solid #667eea', 
                    borderRadius: '50%', 
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 10px'
                }}></div>
                <p>Đang tải kết quả xổ số...</p>
            </div>
        </div>
    ),
    ssr: false
});

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

const ThongKeNhanh = dynamic(() => import('../components/ThongKeNhanh'), {
    ssr: false,
    loading: () => <div style={{ minHeight: '140px', background: '#fff', border: '1px solid #C4D2E3', margin: '10px 0', contain: 'layout style' }}></div>
});

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

    // ✅ FIX: Structured data với useMemo để tránh hydration error
    const structuredData = useMemo(() => {
        // Normalize date để deterministic (set về 00:00:00)
        const normalizedDate = new Date();
        normalizedDate.setHours(0, 0, 0, 0);
        const deterministicDate = normalizedDate.toISOString();
        
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://taodandewukong.pro';
        
        return [
            // SoftwareApplication Schema
            {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Dàn Đề Wukong",
                "alternateName": [
                    "Tạo Dàn Đề Online", 
                    "Tạo Dàn Số Wukong", 
                    "Tạo Mức Số",
                    "TDDW", // ✅ SHORT ABBREVIATION (giống RBK)
                    "TDDW.Pro",
                    "WK", // Wukong
                    "TDD", // Tạo Dàn Đề
                    "DDW" // Dàn Đề Wukong
                ],
                "description": "Bộ công cụ tạo dàn số chuyên nghiệp hàng đầu Việt Nam. Dàn đề 9x-0x, Dàn 2D, Dàn 3D/4D, Dàn đặc biệt, Thống kê xổ số 3 miền. Tốt hơn kangdh, giaimasohoc, sieuketqua. Miễn phí 100%, thuật toán Fisher-Yates chuẩn quốc tế.",
                "url": siteUrl,
                "applicationCategory": "UtilitiesApplication",
                "operatingSystem": "Web Browser",
                "browserRequirements": "Requires JavaScript. Requires HTML5.",
                "softwareVersion": "1.0.0",
                "datePublished": "2024-01-01",
                "dateModified": deterministicDate, // FIX: Deterministic date
                "author": {
                    "@type": "Organization",
                    "name": "Dàn Đề Wukong",
                    "url": siteUrl
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "Dàn Đề Wukong",
                    "logo": {
                        "@type": "ImageObject",
                        "url": `${siteUrl}/imgs/wukong.png`
                    }
                },
                "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "VND",
                    "availability": "https://schema.org/InStock"
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
                    "Lưu trữ kết quả",
                    "Tốt hơn kangdh, giaimasohoc"
                ],
                "screenshot": [
                    `${siteUrl}/imgs/dan9x0x (1).png`,
                    `${siteUrl}/imgs/dan2d1d (1).png`,
                    `${siteUrl}/imgs/dan3d4d (1).png`
                ],
                "downloadUrl": siteUrl,
                "installUrl": siteUrl,
                "softwareRequirements": "Web Browser with JavaScript enabled"
            },
            
            // Organization Schema
            {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Dàn Đề Wukong",
                "url": siteUrl,
                "logo": `${siteUrl}/imgs/wukong.png`,
                "description": "Công cụ tạo dàn đề, tạo dàn số chuyên nghiệp hàng đầu Việt Nam. Tốt hơn kangdh, giaimasohoc, sieuketqua. Miễn phí 100%.",
                "sameAs": [
                    siteUrl
                ],
                "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "Customer Support",
                    "availableLanguage": "Vietnamese"
                }
            },
            
            // WebSite Schema với SearchAction
            {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Dàn Đề Wukong",
                "url": siteUrl,
                "description": "Tạo dàn đề, tạo dàn số online miễn phí. Công cụ chuyên nghiệp tốt hơn kangdh, giaimasohoc, sieuketqua.",
                "publisher": {
                    "@type": "Organization",
                    "name": "Dàn Đề Wukong",
                    "logo": {
                        "@type": "ImageObject",
                        "url": `${siteUrl}/imgs/wukong.png`
                    }
                },
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                        "@type": "EntryPoint",
                        "urlTemplate": `${siteUrl}/tim-kiem?q={search_term_string}`
                    },
                    "query-input": "required name=search_term_string"
                }
            },
            
            // BreadcrumbList Schema
            {
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Trang chủ",
                        "item": siteUrl
                    }
                ]
            }
            // FAQ schema is automatically generated by SEOOptimized component from faq prop
        ];
    }, [faqData]);

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
                structuredData={structuredData}
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
                            Công Cụ Xổ Số Wukong
                        </h1>
                        <div className={styles.heroActions}>
                            {/* Group 1 */}
                            <Link href="/dan-9x0x" className={styles.heroSecondaryButton} prefetch={false}>
                                <span>Tạo Dàn Đề 9x-0x</span>
                            </Link>
                            <Link href="/loc-dan-de" className={styles.heroSecondaryButton} prefetch={false}>
                                <span>Lọc Dàn Đề 9x-0x</span>
                            </Link>
                            <Link href="/dan-2d" className={styles.heroSecondaryButton} prefetch={false}>
                                <span>Dàn 2D/1D</span>
                            </Link>
                            <Link href="/dan-3d4d" className={styles.heroSecondaryButton} prefetch={false}>
                                <span>Dàn 3D/4D</span>
                            </Link>

                            {/* Group 2 */}
                            <Link href="/ket-qua-xo-so-mien-bac" className={styles.heroSecondaryButton} prefetch={false}>
                                <span>Kết Quả Xổ Số</span>
                            </Link>
                            <Link href="/soi-cau-dac-biet-mien-bac" className={styles.heroSecondaryButton} prefetch={false}>
                                <span>Soi Cầu Đặc Biệt</span>
                            </Link>
                            <Link href="/soi-cau-mien-bac-ai" className={styles.heroSecondaryButton} prefetch={false}>
                                <span>Soi Cầu AI</span>
                            </Link>
                            <Link href="/dan-dac-biet" className={styles.heroSecondaryButton} prefetch={false}>
                                <span>Dàn Đặc Biệt</span>
                            </Link>

                            {/* Group 3 */}
                            <Link href="/thongke/lo-gan" className={styles.heroSecondaryButton} prefetch={false}>
                                <span>Lô Gan</span>
                            </Link>
                            <Link href="/thongke/dau-duoi" className={styles.heroSecondaryButton} prefetch={false}>
                                <span>Đầu Đuôi</span>
                            </Link>
                            <Link href="/thongke/giai-dac-biet" className={styles.heroSecondaryButton} prefetch={false}>
                                <span>Giải ĐB</span>
                            </Link>
                            <Link href="/thongke/giai-dac-biet-tuan" className={styles.heroSecondaryButton} prefetch={false}>
                                <span>ĐB Tuần</span>
                            </Link>

                            {/* Group 4 */}
                            <Link href="/thongke/tan-suat-loto" className={styles.heroSecondaryButton} prefetch={false}>
                                <span>Tần Suất Lô Tô</span>
                            </Link>
                            <Link href="/thongke/tan-suat-locap" className={styles.heroSecondaryButton} prefetch={false}>
                                <span>Tần Suất Lô Cặp</span>
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
                            {/* Thống kê nhanh */}
                            <ThongKeNhanh />

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
                    
                    {/* ✅ SEO Keywords Section (giống RBK strategy - keywords cuối trang) */}
                    <div style={{ 
                        marginTop: '40px', 
                        padding: '20px', 
                        background: '#f8f9fa', 
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#666',
                        lineHeight: '1.8',
                        textAlign: 'center'
                    }}>
                        <strong>TDDW</strong> - Tạo Dàn Đề Wukong | 
                        <strong>TDDW.Pro</strong> | 
                        Tạo dàn số <strong>TDDW</strong> | 
                        Soi cầu <strong>TDDW</strong> | 
                        Chốt số <strong>TDDW</strong> | 
                        <strong>TDDW</strong> hôm nay | 
                        Cầu lô <strong>TDDW</strong> | 
                        Dự đoán <strong>TDDW</strong> | 
                        Thống kê <strong>TDDW</strong> | 
                        <strong>TDDW</strong> miễn phí | 
                        Tạo dàn đề online <strong>TDDW</strong> | 
                        <strong>TDDW</strong> công cụ xổ số | 
                        <strong>TDDW</strong> loto | 
                        <strong>TDDW</strong> lô đề | 
                        <strong>TDDW</strong> tốt hơn kangdh | 
                        <strong>TDDW</strong> vs giaimasohoc | 
                        <strong>WK</strong> tool | 
                        <strong>WK</strong> soi cầu | 
                        <strong>TDD</strong> công cụ | 
                        Dàn đề <strong>WK</strong> | 
                        Mức số <strong>TDDW</strong> | 
                        Tạo mức số <strong>TDDW</strong> | 
                        Lập dàn số <strong>TDDW</strong> | 
                        <strong>TDDW</strong> 2025 | 
                        <strong>TDDW</strong> mới nhất | 
                        TDDW xổ số miền bắc | 
                        TDDW kết quả xổ số | 
                        TDDW thống kê 3 miền
                    </div>
                </div>
            </Layout>
        </>
    );
});

// ✅ Export memoized component
export default Home;

