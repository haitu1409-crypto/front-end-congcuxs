/**
 * Dàn Đề 9x-0x Page
 * Chuyển toàn bộ logic từ trang chủ sang page chuyên dụng
 */

import Link from 'next/link';
import Head from 'next/head';
import Layout from '../components/Layout';
import MobileNavbar from '../components/MobileNavbar';
import { Target, BarChart3, Star, Zap, CheckCircle } from 'lucide-react';
import styles from '../styles/Dan9x0x.module.css';
import SEOOptimized from '../components/SEOOptimized';
import SEOAnalytics from '../components/SEOAnalytics';
import PageSpeedOptimizer from '../components/PageSpeedOptimizer';
import PerformanceMonitor from '../components/PerformanceMonitor';
import { getPageSEO } from '../config/seoConfig';

// ✅ Lazy load SEO components
const AuthorBio = dynamic(() => import('../components/SEO/AuthorBio'), {
    loading: () => null,
    ssr: false
});

const DefinitionSnippet = dynamic(() =>
    import('../components/SEO/FeaturedSnippet').then(mod => ({ default: mod.DefinitionSnippet })),
    { ssr: false, loading: () => null }
);
// import WukongSlider from '../components/WukongSlider';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

// Lazy load heavy components for better PageSpeed
const DanDeGenerator = dynamic(() => import('../components/DanDeGenerator'), {
    loading: () => <div className={styles.loadingSkeleton}>Đang tải công cụ...</div>,
    ssr: false
});

const DanDeFilter = dynamic(() => import('../components/DanDeFilter'), {
    loading: () => <div className={styles.loadingSkeleton}>Đang tải bộ lọc...</div>,
    ssr: false
});

const GuideSection = dynamic(() => import('../components/GuideSection'), {
    loading: () => <div className={styles.loadingSkeleton}>Đang tải hướng dẫn...</div>,
    ssr: false
});

// Lazy load Features section for better performance
const FeaturesSection = dynamic(() => import('../components/FeaturesSection'), {
    loading: () => <div className={styles.loadingSkeleton}>Đang tải tính năng...</div>,
    ssr: false // Disable SSR to avoid hydration errors
});

export default function Dan9x0xPage() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

    // Get SEO config
    const pageSEO = getPageSEO('dan9x0x');

    // Handle scroll to section when page loads with anchor
    useEffect(() => {
        const handleHashNavigation = () => {
            if (typeof window !== 'undefined' && window.location.hash) {
                const hash = window.location.hash.substring(1);
                const element = document.querySelector(`[data-section="${hash}"]`);
                if (element) {
                    // Delay scroll to ensure page is fully loaded
                    setTimeout(() => {
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }, 500);
                }
            }
        };

        // Handle initial load
        handleHashNavigation();

        // Handle hash change
        window.addEventListener('hashchange', handleHashNavigation);
        return () => window.removeEventListener('hashchange', handleHashNavigation);
    }, []);


    // Register mobile-optimized service worker
    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (isMobile) {
                navigator.serviceWorker.register('/sw-mobile.js')
                    .then((registration) => {
                        console.log('Mobile SW registered:', registration);
                    })
                    .catch((error) => {
                        console.log('Mobile SW registration failed:', error);
                    });
            }
        }
    }, []);

    const breadcrumbs = [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Dàn Đề 9x-0x', url: `${siteUrl}/dan-9x0x` }
    ];

    const faqData = [
        {
            question: 'Công cụ tạo dàn số 9x-0x ngẫu nhiên có miễn phí không?',
            answer: 'Có, công cụ tạo dàn số 9x-0x ngẫu nhiên và lọc dàn số tổng hợp hoàn toàn miễn phí 100%, không giới hạn số lần sử dụng, không cần đăng ký tài khoản.'
        },
        {
            question: 'Dàn đề 9x-0x được tạo có chính xác không?',
            answer: 'Công cụ sử dụng thuật toán Fisher-Yates chuẩn quốc tế, đảm bảo tính ngẫu nhiên tuyệt đối và chính xác 100% cho dàn số 9x-0x. Đây là thuật toán được sử dụng rộng rãi trong các ứng dụng chuyên nghiệp.'
        },
        {
            question: 'Bộ lọc dàn số tổng hợp hoạt động như thế nào?',
            answer: 'Bộ lọc dàn số tổng hợp sử dụng thuật toán thông minh để phân tích và lọc các số có khả năng trúng cao nhất từ dàn số 9x-0x, dựa trên thống kê và xu hướng xổ số 3 miền.'
        },
        {
            question: 'Có thể lưu và xuất dàn số không?',
            answer: 'Có, bạn có thể lưu dàn số 9x-0x và kết quả lọc vào bộ nhớ tạm, xuất ra file Excel, hoặc chia sẻ qua mạng xã hội. Tất cả hoàn toàn miễn phí.'
        },
        {
            question: 'Dàn đề 9x-0x phù hợp cho loại xổ số nào?',
            answer: 'Dàn đề 9x-0x phù hợp cho tất cả loại xổ số 3 miền (miền Bắc, miền Nam, miền Trung), lô số, và các hình thức chơi xổ số khác. Đây là loại dàn số phổ biến và hiệu quả nhất.'
        },
        {
            question: 'Cách sử dụng công cụ tạo dàn số 9x-0x hiệu quả?',
            answer: 'Chọn số lượng dàn phù hợp (10-20 dàn), sử dụng bộ lọc tổng hợp để tối ưu kết quả, kết hợp với thống kê xổ số 3 miền để tăng tỷ lệ trúng. Công cụ hỗ trợ nhiều tùy chọn lọc thông minh.'
        }
    ];

    // Schema Markup for SEO
    const lotterySchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Tạo Dàn Đề 9x-0x Chuyên Nghiệp",
        "description": "Công cụ tạo dàn số 9x-0x ngẫu nhiên với thuật toán Fisher-Yates chuẩn quốc tế. Bộ lọc dàn số tổng hợp thông minh, miễn phí 100%.",
        "applicationCategory": "GameApplication",
        "operatingSystem": "Web Browser",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "VND"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "1250"
        },
        "featureList": [
            "Tạo dàn số 9x-0x ngẫu nhiên",
            "Bộ lọc dàn số tổng hợp",
            "Thuật toán Fisher-Yates chuẩn quốc tế",
            "Miễn phí 100%",
            "Responsive design"
        ]
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "Cách tạo dàn số 9x-0x ngẫu nhiên chuyên nghiệp",
        "description": "Hướng dẫn chi tiết cách tạo dàn số 9x-0x ngẫu nhiên với thuật toán Fisher-Yates",
        "image": "https://taodandewukong.pro/imgs/dan9x0x (1).png",
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
                "name": "Công cụ tạo dàn số 9x-0x Wukong"
            }
        ],
        "step": [
            {
                "@type": "HowToStep",
                "name": "Truy cập công cụ",
                "text": "Vào trang công cụ tạo dàn số 9x-0x tại taodandewukong.pro/dan-9x0x",
                "image": "https://taodandewukong.pro/imgs/dan9x0x (1).png",
                "url": "https://taodandewukong.pro/dan-9x0x"
            },
            {
                "@type": "HowToStep",
                "name": "Chọn số lượng dàn số",
                "text": "Chọn số lượng dàn số muốn tạo (từ 1 đến 100 dàn số)",
                "image": "https://taodandewukong.pro/imgs/dan9x0x (1).png"
            },
            {
                "@type": "HowToStep",
                "name": "Chọn số lượng số mỗi dàn",
                "text": "Chọn số lượng số trong mỗi dàn số (từ 3 đến 10 số)",
                "image": "https://taodandewukong.pro/imgs/dan9x0x (1).png"
            },
            {
                "@type": "HowToStep",
                "name": "Tạo dàn số ngẫu nhiên",
                "text": "Nhấn nút 'Tạo Dàn Đề Ngẫu Nhiên' để tạo dàn số theo thuật toán Fisher-Yates",
                "image": "https://taodandewukong.pro/imgs/dan9x0x (1).png"
            },
            {
                "@type": "HowToStep",
                "name": "Xuất kết quả",
                "text": "Xuất kết quả ra file Excel hoặc copy để sử dụng",
                "image": "https://taodandewukong.pro/imgs/dan9x0x (1).png"
            }
        ]
    };

    return (
        <>
            <SEOOptimized
                pageType="dan-9x0x"
                customTitle={pageSEO.title}
                customDescription={pageSEO.description}
                customKeywords={pageSEO.keywords.join(', ')}
                canonicalUrl={pageSEO.canonical}
                ogImage={pageSEO.image}
                breadcrumbs={breadcrumbs}
                faq={faqData}
                structuredData={[lotterySchema, breadcrumbSchema, faqSchema, howToSchema]}
            />

            {/* Core Web Vitals & Mobile SEO Optimization */}
            <Head>
                {/* Mobile-first viewport optimization */}
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="Tạo Dàn Đề 9x-0x" />

                {/* Mobile SEO optimization */}
                <meta name="format-detection" content="telephone=no" />
                <meta name="theme-color" content="#3b82f6" />
                <meta name="msapplication-TileColor" content="#3b82f6" />
                <meta name="msapplication-navbutton-color" content="#3b82f6" />

                {/* Preload critical resources for mobile */}
                {/* <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" /> */}
                {/* <link rel="preload" href="/styles/critical.css" as="style" /> */}
                {/* <link rel="preload" href="/api/dande/generate" as="fetch" crossOrigin="anonymous" /> */}

                {/* DNS prefetch for external resources */}
                <link rel="dns-prefetch" href="//fonts.googleapis.com" />
                <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />

                {/* Resource hints */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

                {/* Mobile-optimized critical CSS */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                        .hero { min-height: 60vh; }
                        .loadingSkeleton { 
                            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                            background-size: 200% 100%;
                            animation: loading 1.5s infinite;
                        }
                        @keyframes loading {
                            0% { background-position: 200% 0; }
                            100% { background-position: -200% 0; }
                        }
                        /* Mobile touch optimization */
                        @media (hover: none) and (pointer: coarse) {
                            .button, .input, .specialSetItem, .touchSelectionItem, .sumSelectionItem {
                                min-height: 44px;
                                touch-action: manipulation;
                            }
                        }
                        /* Prevent zoom on input focus (iOS) */
                        @media screen and (max-width: 768px) {
                            input[type="text"], input[type="number"], textarea {
                                font-size: 16px;
                            }
                        }
                    `
                }} />
            </Head>

            <PageSpeedOptimizer />
            <PerformanceMonitor />

            <Layout>
                <div className={styles.container}>
                    {/* Hero Section */}
                    <section className={styles.hero}>
                        <div className={styles.heroContent}>
                            <div className={styles.heroBadge}>
                                <Star className={styles.heroBadgeIcon} />
                                <span>Công cụ chuyên nghiệp</span>
                            </div>
                            <h1 className={styles.heroTitle}>
                                Tạo dàn đề 9x-0x | <span className={styles.heroTitleHighlight}>Lọc Dàn Đề Siêu Cấp</span>
                            </h1>
                            <p className={styles.heroDescription}>
                                Công cụ tạo dàn số 9x-0x ngẫu nhiên với thuật toán Fisher-Yates chuẩn quốc tế.
                                Bộ lọc dàn số tổng hợp thông minh, miễn phí 100%, chính xác cho xổ số 3 miền.
                            </p>
                            <div className={styles.heroFeatures}>
                                <div className={styles.heroFeature}>
                                    <CheckCircle className={styles.heroFeatureIcon} />
                                    <span>Miễn phí 100%</span>
                                </div>
                                <div className={styles.heroFeature}>
                                    <Zap className={styles.heroFeatureIcon} />
                                    <span>Nhanh chóng</span>
                                </div>
                                <div className={styles.heroFeature}>
                                    <Target className={styles.heroFeatureIcon} />
                                    <span>Chính xác</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Mobile Navbar */}
                    <MobileNavbar currentPage="dan-9x0x" showCurrentPageItems={false} />

                    {/* Wukong Slider */}
                    {/* <WukongSlider /> */}

                    {/* Main Generator Section */}
                    <main className={styles.main} id="generator" data-section="generator">
                        <h2 className={styles.sectionTitles} style={{ textAlign: 'center', marginBottom: 'var(--spacing-4)' }}>
                            {/* <Filter size={20} style={{ display: 'inline', marginRight: '8px' }} /> */}
                            Tạo Dàn Đề 9X-0X Ngẫu Nhiên
                        </h2>
                        <DanDeGenerator />
                    </main>




                    {/* DanDeFilter Component */}
                    <div data-section="filter" className={styles.main2}>
                        <h2 className={styles.sectionTitles} style={{ textAlign: 'center', marginBottom: 'var(--spacing-4)' }}>
                            Lọc Dàn Đề Siêu Cấp
                        </h2>
                        <DanDeFilter />
                    </div>

                    {/* Features Section - Lazy loaded with SSR */}
                    <FeaturesSection />

                    {/* GuideSection Component */}
                    <div data-section="guide" className={styles.guideWrapper}>
                        <GuideSection />
                    </div>

                    {/* Quick Links Section */}
                    <section className={styles.quickLinks}>
                        <h2 className={styles.quickLinksTitle}>Công cụ khác</h2>
                        <div className={styles.quickLinksGrid}>
                            <Link href="/dan-2d" className={styles.quickLinkCard}>
                                <Target className={styles.quickLinkIcon} />
                                <h3>Dàn 2D</h3>
                                <p>Dàn đề 2 chữ số (00-99)</p>
                            </Link>
                            <Link href="/dan-3d4d" className={styles.quickLinkCard}>
                                <BarChart3 className={styles.quickLinkIcon} />
                                <h3>Dàn 3D/4D</h3>
                                <p>Dàn đề 3-4 chữ số</p>
                            </Link>
                            <Link href="/dan-dac-biet" className={styles.quickLinkCard}>
                                <Star className={styles.quickLinkIcon} />
                                <h3>Dàn Đặc Biệt</h3>
                                <p>Bộ lọc dàn số thông minh</p>
                            </Link>
                            <Link href="/thong-ke" className={styles.quickLinkCard}>
                                <BarChart3 className={styles.quickLinkIcon} />
                                <h3>Thống Kê</h3>
                                <p>Thống kê xổ số 3 miền</p>
                            </Link>
                        </div>
                    </section>

                    {/* Featured Snippet - Definition */}
                    <DefinitionSnippet
                        term="Dàn 9x-0x (Dàn Đề Bất Tử)"
                        definition="Dàn 9x-0x là dàn số lớn gồm 70-95 số, được tạo ngẫu nhiên với 10 cấp độ rút dần. Thường dùng cho chiến thuật nuôi dàn khung 3-5 ngày hoặc đánh chào (gấp thếp). Có thể cắt dàn 9x và lọc dàn 9x để giảm số lượng nhưng vẫn giữ tỷ lệ trúng cao. Gọi là dàn số bất tử vì tỷ lệ trúng rất cao khi nuôi đúng cách."
                        examples={[
                            'Dàn 90 số khung 3 ngày - Chiến lược nuôi phổ biến',
                            'Cắt dàn 9x còn 60-70 số - Giảm vốn, vẫn hiệu quả',
                            'Lọc dàn 9x theo chạm/tổng - Tăng độ chính xác'
                        ]}
                    />

                    {/* Author Bio - E-E-A-T */}
                    <AuthorBio />
                </div>
            </Layout>

            <SEOAnalytics />
        </>
    );
}
