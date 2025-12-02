/**
 * Layout Component
 * Wrapper chung cho tất cả pages với Navigation và Footer
 * Tối ưu cho UX/UI và Accessibility
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { Home, Target, BarChart3, Star, HelpCircle, Newspaper, Menu, X, CheckCircle, Zap, Heart, TrendingUp, Settings, Calendar, Activity, Award, Percent, ChevronDown, MessageCircle, Filter } from 'lucide-react';
import Image from 'next/image';
import RouterErrorBoundary, { useRouterErrorHandler } from './RouterErrorBoundary';
import DesktopHeader from './DesktopHeader';
import DropdownMenu from './DropdownMenu';
import AuthButton from './Auth/AuthButton';
import AuthModal from './Auth/AuthModal';
import styles from '../styles/Layout.module.css';

export default function Layout({ children, className = '' }) {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login');

    // ✅ Add router error handling
    useRouterErrorHandler();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
        setOpenDropdown(null);
    }, [router.pathname]);

    useEffect(() => {
        const handleAuthModalOpened = (event) => {
            setIsMenuOpen(false);
            setOpenDropdown(null);
            setAuthModalMode(event?.detail?.mode || 'login');
            setIsAuthModalOpen(true);
        };

        if (typeof window !== 'undefined') {
            window.addEventListener('auth-modal-opened', handleAuthModalOpened);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('auth-modal-opened', handleAuthModalOpened);
            }
        };
    }, []);

    // Optimize navigation - prevent default behavior for smooth transitions
    const handleLinkClick = useCallback((e) => {
        // Don't prevent default for external links or special cases
        if (e.target.closest('a[href^="http"]') || e.target.closest('a[download]')) {
            return;
        }

        // Preload the page for faster navigation
        const href = e.target.closest('a')?.href;
        if (href && href !== window.location.href) {
            // Prefetch the page
            router.prefetch(href).catch(err => {
                console.log('Prefetch failed:', err);
            });
        }
    }, [router]);

    // Prevent scroll when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('mobile-menu-open');
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('mobile-menu-open');
        }
        return () => {
            document.body.style.overflow = '';
            document.body.classList.remove('mobile-menu-open');
        };
    }, [isMenuOpen]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Thống kê submenu items
    const thongKeMenu = {
        label: 'Thống Kê',
        icon: Activity,
        description: 'Xem các thống kê chi tiết',
        submenu: [
            { href: '/thongke/lo-gan', label: 'Lô Gan', icon: TrendingUp },
            { href: '/thongke/giai-dac-biet', label: 'Giải Đặc Biệt', icon: Award },
            { href: '/thongke/giai-dac-biet-tuan', label: 'Giải Đặc Biệt Tuần', icon: Calendar },
            { href: '/thongke/dau-duoi', label: 'Đầu Đuôi', icon: Percent },
            { href: '/thongke/tan-suat-loto', label: 'Tần Suất Lô Tô', icon: BarChart3 },
            { href: '/thongke/tan-suat-locap', label: 'Tần Suất Lô Cặp', icon: Target }
        ]
    };

    // Soi Cầu submenu items
    const soiCauMenu = {
        label: 'Soi Cầu',
        icon: Target,
        description: 'Soi cầu bạch thủ miền Bắc',
        submenu: [
            { href: '/soi-cau-mien-bac-ai', label: 'Soi Cầu AI', icon: BarChart3, isNew: true },
            { href: '/soi-cau-dac-biet-mien-bac', label: 'Soi Cầu Đặc Biệt', icon: Target, isNew: true },
            { href: '/soi-cau-loto-mien-bac', label: 'Soi Cầu Lô Tô', icon: Target, isNew: true }
        ]
    };

    const congCuXoSoMenu = {
        label: 'Công Cụ Xổ Số',
        icon: Star,
        description: 'Bộ công cụ tạo dàn số nhanh chóng',
        submenu: [
            { href: '/dan-9x0x', label: 'Dàn 9x-0x', icon: Target, isNew: true },
            { href: '/loc-dan-de', label: 'Lọc Dàn Đề', icon: Filter, isNew: true },
            { href: '/dan-2d', label: 'Dàn 2D', icon: Target },
            { href: '/dan-3d4d', label: 'Dàn 3D/4D', icon: BarChart3 },
            { href: '/dan-dac-biet', label: 'Dàn Đặc Biệt', icon: Star },
            { href: '/soi-cau-bac-cau', label: 'Vẽ Đường Cầu', icon: Target, isNew: true }
        ]
    };

    const navLinks = [
        { href: '/', label: 'Trang chủ', icon: Home, description: 'Trang chủ chính' },
        { href: '/ket-qua-xo-so-mien-bac', label: 'Kết Quả Xổ Số', icon: Calendar, description: 'Xem kết quả xổ số 3 miền mới nhất' },
        { isDropdown: true, ...congCuXoSoMenu },
        { isDropdown: true, ...soiCauMenu },
        { isDropdown: true, ...thongKeMenu },
        { href: '/chat', label: 'Group Diễn Đàn', icon: MessageCircle, description: 'Group chat - Trò chuyện với mọi người', isNew: true },
        { href: '/tin-tuc', label: 'Tin Tức', icon: Newspaper, description: 'Tin tức xổ số mới nhất' }
    ];

    return (
        <RouterErrorBoundary>
            <div className={styles.layout}>
                {/* Skip to content for accessibility */}
                <a href="#main-content" className={styles.skipToContent}>
                    Đi đến nội dung chính
                </a>

                {/* Desktop Header Box - Chỉ hiển thị trên desktop */}
                <DesktopHeader />

                {/* Header / Navigation */}
                <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
                    <nav className={styles.nav}>
                        <div className={styles.navContainer}>
                            {/* Logo - Sử dụng ảnh con khỉ */}
                            <Link href="/" className={styles.logo}>
                                <div className={styles.logoIcon}>
                                    <Image
                                        src="/imgs/monkey.png"
                                        alt="Dàn Đề Wukong"
                                        width={32}
                                        height={32}
                                        className={styles.logoImage}
                                        priority
                                        fetchPriority="high"
                                        sizes="32px"
                                    />
                                </div>
                                <span className={styles.logoText}>
                                    <span className={styles.logoTextMain}>Dàn Đề Wukong</span>
                                    <span className={styles.logoTextSub}>Công cụ chuyên nghiệp</span>
                                </span>
                            </Link>

                            {/* Desktop Navigation */}
                            <div className={styles.desktopNav} onClick={handleLinkClick}>
                                {navLinks.map((link, index) => {
                                    // Handle dropdown menu
                                    if (link.isDropdown) {
                                        return (
                                            <DropdownMenu
                                                key={`dropdown-${index}`}
                                                items={[
                                                    { label: link.label, icon: link.icon },
                                                    ...link.submenu
                                                ]}
                                            />
                                        );
                                    }

                                    // Handle regular links
                                    const IconComponent = link.icon;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`${styles.navLink} ${router.pathname === link.href ? styles.active : ''
                                                }`}
                                            prefetch={false} // Disable automatic prefetch
                                            title={link.description}
                                        >
                                            <IconComponent size={16} className={styles.navIcon} />
                                            <span>{link.label}</span>
                                            {link.isNew && <span className={styles.newBadge}>NEW</span>}
                                        </Link>
                                    );
                                })}
                                
                                {/* Auth Button - Desktop */}
                                <div className={styles.desktopAuthButton}>
                                    <AuthButton variant="desktop" />
                                </div>
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                className={`${styles.menuButton} ${isMenuOpen ? styles.menuButtonOpen : ''}`}
                                onClick={toggleMenu}
                                aria-label="Toggle menu"
                                aria-expanded={isMenuOpen}
                            >
                                {isMenuOpen ? (
                                    <X size={24} className={styles.menuIcon} />
                                ) : (
                                    <Menu size={24} className={styles.menuIcon} />
                                )}
                            </button>
                        </div>

                        {/* Mobile Navigation */}
                        {isMenuOpen && (
                            <>
                                {/* Mobile Overlay */}
                                <div
                                    className={`${styles.mobileOverlay} ${styles.mobileOverlayOpen}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    onTouchStart={() => setIsMenuOpen(false)}
                                    aria-hidden="false"
                                    role="button"
                                    tabIndex={-1}
                                />

                                {/* Mobile Navigation */}
                                <div className={`${styles.mobileNav} ${isMenuOpen ? styles.mobileNavOpen : ''}`}>
                                <div className={styles.mobileNavContent} onClick={handleLinkClick}>
                                        {/* Auth Button - Mobile (top) */}
                                        <div className={styles.mobileAuthButton}>
                                            <AuthButton variant="mobile" />
                                        </div>

                                        {navLinks.map((link, index) => {
                                            // Handle dropdown menu in mobile
                                            if (link.isDropdown) {
                                                const IconComponent = link.icon;
                                                const isOpen = openDropdown === link.label;
                                                return (
                                                    <div key={`mobile-dropdown-${index}`}>
                                                        <div className={styles.mobileDropdownWrapper}>
                                                            <div 
                                                                className={styles.mobileDropdownHeader}
                                                                onClick={() => setOpenDropdown(isOpen ? null : link.label)}
                                                            >
                                                            <div className={styles.mobileNavLinkContent}>
                                                                <div className={styles.mobileNavLinkHeader}>
                                                                    <IconComponent size={20} className={styles.mobileNavIcon} />
                                                                    <span className={styles.mobileNavLinkLabel}>{link.label}</span>
                                                                        <ChevronDown size={16} className={`${styles.mobileDropdownIcon} ${isOpen ? styles.rotate : ''}`} />
                                                                </div>
                                                            </div>
                                                            </div>
                                                            {isOpen && (
                                                            <div className={styles.mobileDropdownSubmenu}>
                                                                {link.submenu.map((subItem, subIndex) => {
                                                                    const SubIconComponent = subItem.icon;
                                                                    return (
                                                                        <Link
                                                                            key={subIndex}
                                                                            href={subItem.href}
                                                                            className={`${styles.mobileNavSubLink} ${router.pathname === subItem.href ? styles.active : ''}`}
                                                                            onClick={() => {
                                                                                setIsMenuOpen(false);
                                                                                setOpenDropdown(null);
                                                                            }}
                                                                        >
                                                                            <SubIconComponent size={18} className={styles.mobileNavSubIcon} />
                                                                            <span>{subItem.label}</span>
                                                                        </Link>
                                                                    );
                                                                })}
                                                            </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            }

                                            // Handle regular links
                                            const IconComponent = link.icon;
                                            return (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    className={`${styles.mobileNavLink} ${router.pathname === link.href ? styles.active : ''
                                                        }`}
                                                    onClick={() => setIsMenuOpen(false)}
                                                    prefetch={false} // Disable automatic prefetch
                                                >
                                                    <div className={styles.mobileNavLinkContent}>
                                                        <div className={styles.mobileNavLinkHeader}>
                                                            <IconComponent size={20} className={styles.mobileNavIcon} />
                                                            <span className={styles.mobileNavLinkLabel}>{link.label}</span>
                                                            {link.isNew && <span className={styles.mobileNewBadge}>NEW</span>}
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </nav>
                </header>

                {/* Main Content */}
                <main id="main-content" className={`${styles.main} ${className}`}>
                    {children}
                </main>

                {/* Footer */}
                <footer className={styles.footer}>
                    <div className={styles.footerContainer}>
                        {/* Footer Top */}
                        <div className={styles.footerTop}>
                            {/* About Section */}
                            <div className={styles.footerSection}>
                                <h3 className={styles.footerTitle}>
                                    <Image
                                        src="/imgs/monkey.png"
                                        alt="Dàn Đề Wukong"
                                        width={24}
                                        height={24}
                                        style={{ display: 'inline', marginRight: '8px' }}
                                        loading="lazy"
                                        fetchPriority="low"
                                    />
                                    Dàn Đề Wukong
                                </h3>
                                <p className={styles.footerDescription}>
                                    Bộ công cụ tạo dàn số và thống kê xổ số 3 miền chuyên nghiệp hàng đầu Việt Nam.
                                    Miễn phí, nhanh chóng, chính xác 100% - Thương hiệu Wukong.
                                </p>
                                <div className={styles.footerBadges}>
                                    <span className={styles.footerBadge}>
                                        <CheckCircle size={12} style={{ marginRight: '4px' }} />
                                        Miễn phí
                                    </span>
                                    <span className={styles.footerBadge}>
                                        <Zap size={12} style={{ marginRight: '4px' }} />
                                        Nhanh chóng
                                    </span>
                                    <span className={styles.footerBadge}>
                                        <Target size={12} style={{ marginRight: '4px' }} />
                                        Chính xác
                                    </span>
                                </div>
                            </div>

                            {/* Tools Section */}
                            <div className={styles.footerSection}>
                                <h4 className={styles.footerSectionTitle}>Công cụ</h4>
                                <ul className={styles.footerLinks}>
                                    <li>
                                        <Link href="/ket-qua-xo-so-mien-bac" className={styles.footerLink}>
                                            Kết Quả Xổ Số
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/" className={styles.footerLink}>
                                            Dàn 9x-0x
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/dan-2d" className={styles.footerLink}>
                                            Dàn 2D
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/dan-3d4d" className={styles.footerLink}>
                                            Dàn 3D/4D
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/dan-dac-biet" className={styles.footerLink}>
                                            Dàn Đặc Biệt
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/thong-ke" className={styles.footerLink}>
                                            Thống Kê 3 Miền
                                        </Link>
                                    </li>
                                </ul>
                            </div>

                            {/* Support Section */}
                            <div className={styles.footerSection}>
                                <h4 className={styles.footerSectionTitle}>Hỗ trợ</h4>
                                <ul className={styles.footerLinks}>
                                    <li>
                                        <Link href="/soi-cau-mien-bac-ai" className={styles.footerLink}>
                                            Soi Cầu AI
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/soi-cau-bac-cau" className={styles.footerLink}>
                                            Vẽ Đường Cầu
                                        </Link>
                                    </li>
                                    <li>
                                        <a href="#main-content" className={styles.footerLink}>
                                            Hướng dẫn sử dụng
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Footer Bottom */}
                        <div className={styles.footerBottom}>
                            <p className={styles.copyright}>
                                © {new Date().getFullYear()} Dàn Đề Wukong (TDDW). Made with <Heart size={12} style={{ display: 'inline', margin: '0 2px' }} /> in Vietnam.
                            </p>
                            <p className={styles.disclaimer}>
                                Công cụ miễn phí cho mục đích giải trí và nghiên cứu.
                            </p>
                            {/* DMCA Badge */}
                            <div className={styles.dmcaContainer}>
                                <a 
                                    href="//www.dmca.com/Protection/Status.aspx?ID=66ebf140-1580-488b-897e-a251a37c14a6" 
                                    title="DMCA.com Protection Status" 
                                    className="dmca-badge"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <img 
                                        src="https://images.dmca.com/Badges/dmca_protected_25_120.png?ID=66ebf140-1580-488b-897e-a251a37c14a6" 
                                        alt="DMCA.com Protection Status"
                                    />
                                </a>
                            </div>
                            {/* ✅ SEO Keywords Footer (giống RBK strategy) */}
                            <div className={styles.seoKeywords}>
                                TDDW | Tạo dàn đề Wukong | Tao dan de wukong | TDDW.Pro | WK | TDD | DDW | 
                                Tạo dàn số TDDW | Soi cầu TDDW | Chốt số TDDW | TDDW hôm nay | 
                                Cầu lô TDDW | Dự đoán TDDW | Thống kê TDDW | TDDW miễn phí
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authModalMode}
            />
            {/* DMCA Badge Script */}
            <Script 
                src="https://images.dmca.com/Badges/DMCABadgeHelper.min.js"
                strategy="lazyOnload"
            />
        </RouterErrorBoundary>
    );
}

