/**
 * Mobile Navbar Component - Reusable
 * Navbar mobile ngang cho tất cả các page dàn số
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    Dice6,
    Target,
    BarChart3,
    Info,
    Filter,
    Settings,
    Zap as ZapIcon,
    Hash,
    Layers,
    TrendingUp
} from 'lucide-react';
import AuthButton from './Auth/AuthButton';
import styles from '../styles/MobileNavbar.module.css';

export default function MobileNavbar({
    currentPage = 'dan-9x0x',
    showCurrentPageItems = true
}) {
    const router = useRouter();
    const [activeNavItem, setActiveNavItem] = useState('generator');

    // Helper: Smooth scroll to section with navbar offset
    const smoothScrollToSection = useCallback((sectionId) => {
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
    }, []);

    // Auto update active nav item based on scroll position
    useEffect(() => {
        const handleScroll = () => {
            const sections = [
                { id: 'generator', element: document.querySelector('[data-section="generator"]') },
                { id: 'filter', element: document.querySelector('[data-section="filter"]') },
                { id: 'guide', element: document.querySelector('[data-section="guide"]') }
            ];

            const scrollPosition = window.scrollY + 100; // Offset for better UX

            // Only update active nav item for current page sections
            // Don't update for external links since they're external links
            for (let i = sections.length - 1; i >= 0; i--) {
                const section = sections[i];
                if (section.element && section.element.offsetTop <= scrollPosition) {
                    setActiveNavItem(section.id);
                    break;
                }
            }
        };

        // Throttle scroll event for better performance
        let ticking = false;
        const throttledHandleScroll = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', throttledHandleScroll);
        return () => window.removeEventListener('scroll', throttledHandleScroll);
    }, []);

    // Reset scroll position when route changes
    useEffect(() => {
        const handleRouteChangeStart = () => {
            // Reset scroll to top immediately when navigation starts
            window.scrollTo({ top: 0, behavior: 'instant' });
        };

        const handleRouteChangeComplete = () => {
            // Ensure scroll is at top when navigation completes (backup)
            window.scrollTo({ top: 0, behavior: 'instant' });
        };

        router.events?.on('routeChangeStart', handleRouteChangeStart);
        router.events?.on('routeChangeComplete', handleRouteChangeComplete);
        
        return () => {
            router.events?.off('routeChangeStart', handleRouteChangeStart);
            router.events?.off('routeChangeComplete', handleRouteChangeComplete);
        };
    }, [router]);

    // Mobile navbar handlers
    const handleNavItemClick = useCallback((itemId) => {
        setActiveNavItem(itemId);

        // Handle navigation to other pages
        if (itemId.startsWith('page-')) {
            const page = itemId.replace('page-', '');

            // ✅ Reset scroll immediately before navigation
            if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                // Clear any scroll position from sessionStorage
                try {
                    sessionStorage.removeItem(`scrollPosition_${router.pathname}`);
                } catch (e) {}
            }

            // ✅ Fix router abort errors - add error handling
            try {
                router.push(`/${page}`);
            } catch (error) {
                console.warn('Router push failed, using window.location:', error);
                window.location.href = `/${page}`;
            }
            return;
        }

        // Handle navigation to dan-dac-biet page with specific sections
        if (itemId.startsWith('dac-biet-')) {
            const section = itemId.replace('dac-biet-', '');

            // Use shallow routing for hash navigation to avoid route change errors
            if (router.pathname === '/dan-dac-biet') {
                // Already on dan-dac-biet page, just scroll to section
                smoothScrollToSection(section);
            } else {
                // Navigate to dan-dac-biet page, then scroll after load
                // Scroll reset will be handled by routeChangeStart event
                router.push('/dan-dac-biet').then(() => {
                    setTimeout(() => smoothScrollToSection(section), 500);
                }).catch((err) => {
                    // Fallback to window.location if router fails
                    if (!err.cancelled) {
                        console.warn('Router push failed, using window.location:', err);
                        window.location.href = `/dan-dac-biet#${section}`;
                    }
                });
            }
            return;
        }

        // Scroll to section based on itemId (for current page)
        if (itemId === 'generator') {
            smoothScrollToSection('generator');
        } else if (itemId === 'filter') {
            smoothScrollToSection('filter');
        } else if (itemId === 'guide') {
            smoothScrollToSection('guide');
        }
    }, [router, smoothScrollToSection]);

    // Define navbar items based on current page
    const getNavbarItems = () => {
        const baseItems = [
            {
                id: 'page-dan-9x0x',
                label: 'Tạo Dàn 9x0x',
                icon: Dice6,
                href: '/dan-9x0x'
            },
            {
                id: 'page-loc-dan-de',
                label: 'Lọc Dàn Đề',
                icon: Filter,
                href: '/loc-dan-de'
            },
            {
                id: 'page-dan-2d',
                label: 'Tạo Dàn 2D',
                icon: Target,
                href: '/dan-2d'
            },
            {
                id: 'page-dan-3d4d',
                label: 'Tạo Dàn 3D/4D',
                icon: BarChart3,
                href: '/dan-3d4d'
            }
        ];

        const danDacBietItems = [
            {
                id: 'dac-biet-loc-ghep',
                label: 'Lọc Ghép Dàn',
                icon: Settings
            },
            {
                id: 'dac-biet-nhanh',
                label: 'Lấy Nhanh Dàn',
                icon: ZapIcon
            },
            {
                id: 'dac-biet-dau-duoi',
                label: 'Tạo Dàn Đầu Đuôi',
                icon: Hash
            },
            {
                id: 'dac-biet-cham',
                label: 'Tạo Dàn Chạm',
                icon: Target
            },
            {
                id: 'dac-biet-bo',
                label: 'Tạo Dàn Bộ',
                icon: Layers
            }
        ];

        // Add current page specific items if needed
        if (showCurrentPageItems && currentPage === 'dan-9x0x') {
            const locDanDeItem = baseItems.find(item => item.id === 'page-loc-dan-de');
            return [
                { id: 'generator', label: 'Tạo Dàn 9x0x', icon: Dice6 },
                ...(locDanDeItem ? [locDanDeItem] : []),
                { id: 'guide', label: 'Hướng Dẫn', icon: Info },
                ...danDacBietItems
            ];
        }

        // For other pages, show all page links + dan-dac-biet items
        return [
            ...baseItems,
            ...danDacBietItems
        ];
    };

    const navbarItems = getNavbarItems();

    return (
        <>
            <div className={styles.mobileNavbar}>
                <div className={styles.mobileNavbarContainer}>
                    {navbarItems.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = activeNavItem === item.id ||
                            (item.href && router.pathname === item.href);

                        return (
                            <button
                                key={item.id}
                                className={`${styles.mobileNavbarItem} ${isActive ? styles.active : ''}`}
                                onClick={() => handleNavItemClick(item.id)}
                            >
                                <IconComponent className={styles.mobileNavbarIcon} />
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
