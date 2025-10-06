/**
 * Layout Component
 * Wrapper chung cho tất cả pages với Navigation và Footer
 * Tối ưu cho UX/UI và Accessibility
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, Target, BarChart3, Star, HelpCircle, Newspaper, Menu, X, CheckCircle, Zap, Heart, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import styles from '../styles/Layout.module.css';

export default function Layout({ children, className = '' }) {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

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
    }, [router.pathname]);

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
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const navLinks = [
        { href: '/', label: 'Trang chủ', icon: Home },
        { href: '/dan-2d', label: 'Dàn 2D', icon: Target },
        { href: '/dan-3d4d', label: 'Dàn 3D/4D', icon: BarChart3 },
        { href: '/dan-dac-biet', label: 'Dàn Đặc Biệt', icon: Star },
        { href: '/thong-ke', label: 'Lập Thống Kê', icon: TrendingUp },
        { href: '/content', label: 'Hướng dẫn & Mẹo chơi', icon: HelpCircle },
        { href: '/tin-tuc', label: 'Tin Tức', icon: Newspaper }
    ];

    return (
        <div className={styles.layout}>
            {/* Skip to content for accessibility */}
            <a href="#main-content" className={styles.skipToContent}>
                Đi đến nội dung chính
            </a>

            {/* Header / Navigation */}
            <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
                <nav className={styles.nav}>
                    <div className={styles.navContainer}>
                        {/* Logo - Sử dụng ảnh con khỉ */}
                        <Link href="/" className={styles.logo}>
                            <div className={styles.logoIcon}>
                                <Image
                                    src="/imgs/monkey.png"
                                    alt="Dàn Đề Tôn Ngộ Không"
                                    width={32}
                                    height={32}
                                    className={styles.logoImage}
                                    priority
                                    sizes="32px"
                                />
                            </div>
                            <span className={styles.logoText}>
                                <span className={styles.logoTextMain}>Dàn Đề Tôn Ngộ Không</span>
                                <span className={styles.logoTextSub}>Công cụ chuyên nghiệp</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className={styles.desktopNav} onClick={handleLinkClick}>
                            {navLinks.map((link) => {
                                const IconComponent = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`${styles.navLink} ${router.pathname === link.href ? styles.active : ''
                                            }`}
                                        prefetch={false} // Disable automatic prefetch
                                    >
                                        <IconComponent size={16} className={styles.navIcon} />
                                        <span>{link.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className={`${styles.menuButton} ${isMenuOpen ? styles.menuButtonOpen : ''}`}
                            onClick={toggleMenu}
                            aria-label="Toggle menu"
                            aria-expanded={isMenuOpen}
                        >
                            <span className={styles.menuButtonLine}></span>
                            <span className={styles.menuButtonLine}></span>
                            <span className={styles.menuButtonLine}></span>
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    <div className={`${styles.mobileNav} ${isMenuOpen ? styles.mobileNavOpen : ''}`}>
                        <div className={styles.mobileNavContent} onClick={handleLinkClick}>
                            {navLinks.map((link) => {
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
                                        <IconComponent size={20} className={styles.mobileNavIcon} />
                                        <span>{link.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
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
                                    alt="Dàn Đề Tôn Ngộ Không"
                                    width={24}
                                    height={24}
                                    style={{ display: 'inline', marginRight: '8px' }}
                                    loading="lazy"
                                />
                                Dàn Đề Tôn Ngộ Không
                            </h3>
                            <p className={styles.footerDescription}>
                                Bộ công cụ tạo dàn đề và thống kê xổ số 3 miền chuyên nghiệp hàng đầu Việt Nam.
                                Miễn phí, nhanh chóng, chính xác 100% - Thương hiệu Tôn Ngộ Không.
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
                                    <Link href="/content" className={styles.footerLink}>
                                        Hướng dẫn & Mẹo chơi
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
                            © {new Date().getFullYear()} Dàn Đề Tôn Ngộ Không. Made with <Heart size={12} style={{ display: 'inline', margin: '0 2px' }} /> in Vietnam.
                        </p>
                        <p className={styles.disclaimer}>
                            Công cụ miễn phí cho mục đích giải trí và nghiên cứu.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div
                    className={styles.mobileOverlay}
                    onClick={() => setIsMenuOpen(false)}
                    aria-hidden="true"
                />
            )}
        </div>
    );
}

