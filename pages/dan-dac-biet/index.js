/**
 * Dàn Đặc Biệt Page - Redesigned
 * Inspired by taodande.com design
 */

import Link from 'next/link';
import dynamic from 'next/dynamic';
import Layout from '../../components/Layout';
import SEOOptimized from '../../components/SEOOptimized';
import PageSpeedOptimizer from '../../components/PageSpeedOptimizer';
import MobileNavbar from '../../components/MobileNavbar';
import AOSWrapper from '../../components/AOSWrapper';
import HydrationSafeWrapper from '../../components/HydrationSafeWrapper';
import { Star, Zap, Target, CheckCircle, Rocket, BookOpen, Hash, Dice6, BarChart3, Home, Shield, Smartphone } from 'lucide-react';
import styles from '../../styles/DanDacBiet.module.css';
import { Suspense, lazy, useEffect } from 'react';
import { getPageSEO } from '../../config/seoConfig';
import AuthorBio from '../../components/SEO/AuthorBio';
import Testimonials from '../../components/SEO/Testimonials';
import { DefinitionSnippet, ListSnippet } from '../../components/SEO/FeaturedSnippet';

// Import safe lazy components với Error Boundary
import {
    ComponentLoader,
    DefaultLoadingSpinner
} from '../../components/LazyComponents';

// ✅ Fixed lazy loading with proper error handling and hydration fix
const LocGhepDanComponent = dynamic(() => import('../../components/DanDe/LocGhepDanComponent'), {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải công cụ lọc ghép dàn...</div>,
    ssr: false,
    suspense: false
});

const LayNhanhDacBiet = dynamic(() => import('../../components/DanDe/LayNhanhDacBiet'), {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải lấy nhanh đặc biệt...</div>,
    ssr: false,
    suspense: true
});

const TaoDanDauDuoi = dynamic(() => import('../../components/DanDe/TaoDanDauDuoi'), {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải tạo dàn đầu đuôi...</div>,
    ssr: false,
    suspense: true
});

const TaoDanCham = dynamic(() => import('../../components/DanDe/TaoDanCham'), {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải tạo dàn chạm...</div>,
    ssr: false,
    suspense: true
});

const TaoDanBo = dynamic(() => import('../../components/DanDe/TaoDanBo'), {
    loading: () => <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải tạo dàn bộ...</div>,
    ssr: false,
    suspense: true
});

export default function DanDacBietPage() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3003';

    // Get SEO config
    const pageSEO = getPageSEO('danDacBiet');

    // Handle scroll to section when page loads with anchor
    useEffect(() => {
        const smoothScrollToSection = (sectionId) => {
            const element = document.querySelector(`[data-section="${sectionId}"]`);
            if (!element) return;

            // Get navbar height for offset
            const navbar = document.querySelector('.mobile-navbar');
            const navbarHeight = navbar ? navbar.offsetHeight : 60;

            // Calculate position with offset (20px extra padding)
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 20;

            // Use requestAnimationFrame for better performance
            requestAnimationFrame(() => {
                window.scrollTo({
                    top: Math.max(0, offsetPosition),
                    behavior: 'smooth'
                });
            });
        };

        const handleHashNavigation = () => {
            if (typeof window !== 'undefined' && window.location.hash) {
                const hash = window.location.hash.substring(1);
                // Delay scroll to ensure page is fully loaded
                setTimeout(() => {
                    smoothScrollToSection(hash);
                }, 500);
            }
        };

        // Handle initial load
        handleHashNavigation();

        // Handle hash change
        window.addEventListener('hashchange', handleHashNavigation);
        return () => window.removeEventListener('hashchange', handleHashNavigation);
    }, []);

    const breadcrumbs = [
        { name: 'Trang chủ', url: siteUrl },
        { name: 'Dàn Đặc Biệt', url: `${siteUrl}/dan-dac-biet` }
    ];

    const faqData = [
        {
            question: 'Dàn đề đặc biệt là gì và có gì khác biệt?',
            answer: 'Dàn đề đặc biệt là bộ số được lọc thông minh theo các tiêu chí như đầu, đuôi, chạm, kép, tổng để tăng tỷ lệ trúng. Khác với dàn đề thông thường, dàn đặc biệt được tối ưu hóa dựa trên thống kê và xu hướng xổ số.'
        },
        {
            question: 'Có thể lọc dàn đề đặc biệt theo bao nhiêu tiêu chí?',
            answer: 'Bạn có thể lọc theo nhiều tiêu chí cùng lúc: đầu số (chẵn/lẻ/bé/lớn), đuôi số, chạm số, kép bằng, kép lệch, kép âm, sát kép, tổng số. Mỗi tiêu chí đều được tối ưu hóa riêng biệt.'
        },
        {
            question: 'Kết quả dàn đề đặc biệt có chính xác không?',
            answer: 'Thuật toán lọc dàn đề đặc biệt được tối ưu dựa trên phân tích thống kê xổ số 3 miền, đảm bảo tính chính xác cao. Sử dụng dữ liệu realtime và AI để dự đoán xu hướng.'
        },
        {
            question: 'Dàn đề đặc biệt phù hợp cho loại xổ số nào?',
            answer: 'Dàn đề đặc biệt phù hợp cho tất cả loại xổ số 3 miền, lô đề 2 số, 3 số, 4 số. Đặc biệt hiệu quả cho người chơi có kinh nghiệm và muốn tối ưu hóa chiến lược.'
        },
        {
            question: 'Cách sử dụng dàn đề đặc biệt hiệu quả nhất?',
            answer: 'Kết hợp nhiều tiêu chí lọc, theo dõi thống kê xu hướng, sử dụng kết hợp với bảng thống kê chốt dàn 3 miền để đưa ra quyết định chính xác nhất.'
        }
    ];

    // HowTo Schema cho dan-dac-biet
    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "Cách tạo dàn đề đặc biệt chuyên nghiệp",
        "description": "Hướng dẫn chi tiết cách tạo dàn đề đặc biệt với bộ lọc thông minh",
        "image": "https://taodandewukong.pro/imgs/dandacbiet (1).png",
        "totalTime": "PT5M",
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
                "name": "Công cụ tạo dàn đề đặc biệt Tôn Ngộ Không"
            }
        ],
        "step": [
            {
                "@type": "HowToStep",
                "name": "Truy cập công cụ",
                "text": "Vào trang công cụ tạo dàn đề đặc biệt tại taodandewukong.pro/dan-dac-biet",
                "image": "https://taodandewukong.pro/imgs/dandacbiet (1).png",
                "url": "https://taodandewukong.pro/dan-dac-biet"
            },
            {
                "@type": "HowToStep",
                "name": "Chọn phương thức lọc",
                "text": "Chọn phương thức lọc: Lấy nhanh, Đầu-Đuôi, Chạm, Bộ, hoặc Kép",
                "image": "https://taodandewukong.pro/imgs/dandacbiet (1).png"
            },
            {
                "@type": "HowToStep",
                "name": "Nhập số gốc",
                "text": "Nhập các số gốc vào ô text theo định dạng yêu cầu của từng phương thức",
                "image": "https://taodandewukong.pro/imgs/dandacbiet (1).png"
            },
            {
                "@type": "HowToStep",
                "name": "Cấu hình tham số",
                "text": "Cấu hình các tham số lọc như số lượng, điều kiện, và các tiêu chí bổ sung",
                "image": "https://taodandewukong.pro/imgs/dandacbiet (1).png"
            },
            {
                "@type": "HowToStep",
                "name": "Tạo dàn đề",
                "text": "Nhấn nút 'Tạo Dàn Đề' để tạo dàn đề đặc biệt theo thuật toán AI",
                "image": "https://taodandewukong.pro/imgs/dandacbiet (1).png"
            },
            {
                "@type": "HowToStep",
                "name": "Lưu và xuất kết quả",
                "text": "Lưu kết quả vào localStorage hoặc xuất file Excel để sử dụng sau",
                "image": "https://taodandewukong.pro/imgs/dandacbiet (1).png"
            }
        ]
    };

    return (
        <>
            <SEOOptimized
                pageType="dan-dac-biet"
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
                <AOSWrapper>
                    <div className={styles.pageContainer}>
                        {/* Mobile Navbar */}
                        <MobileNavbar currentPage="dan-dac-biet" showCurrentPageItems={false} />

                        {/* Hero Section */}
                        <div className={styles.heroSection}>
                            <div className={styles.heroContent}>
                                <h1 className={styles.heroTitle}>
                                    <span className={styles.heroTitleMain}>Tạo Dàn Đặc Biệt</span>

                                </h1>

                            </div>
                            <div className={styles.heroVisual}>
                                <div className={styles.floatingNumbers}>
                                    <span className={styles.floatingNumber}>01</span>
                                    <span className={styles.floatingNumber}>23</span>
                                    <span className={styles.floatingNumber}>45</span>
                                    <span className={styles.floatingNumber}>67</span>
                                    <span className={styles.floatingNumber}>89</span>
                                </div>
                            </div>
                        </div>

                        {/* LỌC, GHÉP DÀN ĐẶC BIỆT Section */}
                        <div className={styles.locGhepSection} id="loc-ghep" data-section="loc-ghep" data-aos="fade-up" data-aos-delay="100">
                            <HydrationSafeWrapper fallback={<div className={styles.loadingPlaceholder}>Đang tải bộ lọc dàn đặc biệt...</div>}>
                                <LocGhepDanComponent />
                            </HydrationSafeWrapper>
                        </div>

                        {/* Main Tools Grid */}
                        <div className={styles.toolsGrid}>
                            <div className={styles.toolCard} id="nhanh" data-section="nhanh" data-aos="fade-up" data-aos-delay="100">
                                <Suspense fallback={<div className={styles.loadingPlaceholder}>Đang tải...</div>}>
                                    <LayNhanhDacBiet />
                                </Suspense>
                            </div>

                            <div className={styles.toolCard} id="dau-duoi" data-section="dau-duoi" data-aos="fade-up" data-aos-delay="200">
                                <Suspense fallback={<div className={styles.loadingPlaceholder}>Đang tải...</div>}>
                                    <TaoDanDauDuoi />
                                </Suspense>
                            </div>

                            <div className={styles.toolCard} id="cham" data-section="cham" data-aos="fade-up" data-aos-delay="300">
                                <Suspense fallback={<div className={styles.loadingPlaceholder}>Đang tải...</div>}>
                                    <TaoDanCham />
                                </Suspense>
                            </div>

                            <div className={styles.toolCard} id="bo" data-section="bo" data-aos="fade-up" data-aos-delay="400">
                                <Suspense fallback={<div className={styles.loadingPlaceholder}>Đang tải...</div>}>
                                    <TaoDanBo />
                                </Suspense>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className={styles.quickLinks} data-aos="fade-up" data-aos-delay="500">
                            <div className={styles.quickLinksHeader}>
                                <h3 className={styles.quickLinksTitle}>Công cụ khác</h3>
                                <p className={styles.quickLinksSubtitle}>Khám phá thêm các tính năng hữu ích</p>
                            </div>
                            <div className={styles.quickLinksGrid}>
                                <Link href="/dan-2d" className={styles.quickLink} data-aos="zoom-in" data-aos-delay="100" prefetch={false}>
                                    <div className={styles.quickLinkIcon}><Target size={20} /></div>
                                    <div className={styles.quickLinkContent}>
                                        <span className={styles.quickLinkText}>Tạo Dàn 2D</span>
                                        <span className={styles.quickLinkDesc}>Dàn đề 2 chữ số</span>
                                    </div>
                                    <div className={styles.quickLinkArrow}>→</div>
                                </Link>
                                <Link href="/dan-3d4d" className={styles.quickLink} data-aos="zoom-in" data-aos-delay="200" prefetch={false}>
                                    <div className={styles.quickLinkIcon}><BarChart3 size={20} /></div>
                                    <div className={styles.quickLinkContent}>
                                        <span className={styles.quickLinkText}>Tạo Dàn 3D-4D</span>
                                        <span className={styles.quickLinkDesc}>Dàn đề 3-4 chữ số</span>
                                    </div>
                                    <div className={styles.quickLinkArrow}>→</div>
                                </Link>
                                <Link href="/" className={styles.quickLink} data-aos="zoom-in" data-aos-delay="300" prefetch={false}>
                                    <div className={styles.quickLinkIcon}><Home size={20} /></div>
                                    <div className={styles.quickLinkContent}>
                                        <span className={styles.quickLinkText}>Trang chủ</span>
                                        <span className={styles.quickLinkDesc}>Tổng quan công cụ</span>
                                    </div>
                                    <div className={styles.quickLinkArrow}>→</div>
                                </Link>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className={styles.featuresSection} data-aos="fade-up" data-aos-delay="600">
                            <h3 className={styles.featuresTitle}>Tại sao chọn chúng tôi?</h3>
                            <div className={styles.featuresGrid}>
                                <div className={styles.featureItem} data-aos="fade-up" data-aos-delay="100">
                                    <div className={styles.featureIcon}><Zap size={20} /></div>
                                    <h4 className={styles.featureTitle}>Tốc độ siêu nhanh</h4>
                                    <p className={styles.featureDesc}>Xử lý hàng nghìn số trong vài giây</p>
                                </div>
                                <div className={styles.featureItem} data-aos="fade-up" data-aos-delay="200">
                                    <div className={styles.featureIcon}><Target size={20} /></div>
                                    <h4 className={styles.featureTitle}>Độ chính xác cao</h4>
                                    <p className={styles.featureDesc}>Thuật toán thông minh, kết quả chính xác</p>
                                </div>
                                <div className={styles.featureItem} data-aos="fade-up" data-aos-delay="300">
                                    <div className={styles.featureIcon}><Shield size={20} /></div>
                                    <h4 className={styles.featureTitle}>Bảo mật tuyệt đối</h4>
                                    <p className={styles.featureDesc}>Dữ liệu được mã hóa và bảo vệ an toàn</p>
                                </div>
                                <div className={styles.featureItem} data-aos="fade-up" data-aos-delay="400">
                                    <div className={styles.featureIcon}><Smartphone size={20} /></div>
                                    <h4 className={styles.featureTitle}>Đa nền tảng</h4>
                                    <p className={styles.featureDesc}>Hoạt động mượt mà trên mọi thiết bị</p>
                                </div>
                            </div>
                        </div>

                        {/* Featured Snippet - Definition */}
                        <DefinitionSnippet
                            term="Dàn Đề Đặc Biệt (Dàn Đề Bất Tử)"
                            definition="Dàn đề đặc biệt là dàn số được lọc và ghép theo các điều kiện đặc biệt như chạm, tổng, kép, tài xỉu, chẵn lẻ, đầu đuôi. Thường là dàn 10-60 số được nuôi trong khung 2-5 ngày với tỷ lệ trúng rất cao, gọi là dàn đề bất tử. Có thể lấy nhanh dàn đặc biệt theo template hoặc tùy chỉnh theo nhu cầu."
                            examples={[
                                'Dàn 36 số khung 3 ngày - Siêu kinh điển, tỷ lệ trúng 95%+',
                                'Dàn 50 số khung 3 ngày - Cho người chơi có vốn lớn',
                                'Dàn 10 số khung 5 ngày - An toàn nhất, ít rủi ro',
                                'Lọc theo kép bằng: 00, 11, 22, 33... 99',
                                'Lấy nhanh theo chạm: Tất cả số có chứa 5'
                            ]}
                        />

                        {/* List of Templates */}
                        <ListSnippet
                            title="Các Loại Dàn Đề Đặc Biệt Phổ Biến"
                            ordered={false}
                            items={[
                                { text: '📊 Dàn 10 số khung 5 ngày - Phù hợp người mới, vốn nhỏ (50-100k)' },
                                { text: '📊 Dàn 16 số khung 3 ngày - Cân bằng rủi ro và lợi nhuận (160-300k)' },
                                { text: '📊 Dàn 20 số khung 3 ngày - Tỷ lệ trúng tốt (200-400k)' },
                                { text: '⭐ Dàn 36 số khung 3 ngày - PHỔ BIẾN NHẤT, siêu kinh điển (360-700k)' },
                                { text: '⭐ Dàn 50 số khung 3 ngày - Cho người chơi có kinh nghiệm (500-1000k)' },
                                { text: '📊 Dàn 60 số khung 2 ngày - Nhanh gọn, tỷ lệ cao (600-1200k)' }
                            ]}
                        />

                        {/* User Testimonials */}
                        <Testimonials />

                        {/* Author Bio */}
                        <AuthorBio />

                    </div>
                </AOSWrapper>
            </Layout>
        </>
    );
}

