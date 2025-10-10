/**
 * Mobile Navbar Component - Reusable
 * Navbar mobile ngang cho tất cả các page dàn đề
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
import styles from '../styles/MobileNavbar.module.css';

export default function MobileNavbar({
    currentPage = 'dan-9x0x',
    showCurrentPageItems = true
}) {
    const router = useRouter();
    const [activeNavItem, setActiveNavItem] = useState('generator');

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

    // Mobile navbar handlers
    const handleNavItemClick = useCallback((itemId) => {
        setActiveNavItem(itemId);

        // Handle navigation to other pages
        if (itemId.startsWith('page-')) {
            const page = itemId.replace('page-', '');

            // Special handling for dan-9x0x-loc
            if (page === 'dan-9x0x-loc') {
                router.push('/dan-9x0x#filter');
                return;
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
            const targetUrl = `/dan-dac-biet${section ? `#${section}` : ''}`;
            // ✅ Fix router abort errors - add error handling
            try {
                router.push(targetUrl);
            } catch (error) {
                console.warn('Router push failed, using window.location:', error);
                window.location.href = targetUrl;
            }
            return;
        }

        // Scroll to section based on itemId (for current page)
        if (itemId === 'generator') {
            const generatorSection = document.querySelector('[data-section="generator"]');
            if (generatorSection) {
                generatorSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (itemId === 'filter') {
            const filterSection = document.querySelector('[data-section="filter"]');
            if (filterSection) {
                filterSection.scrollIntoView({ behavior: 'smooth' });
            }
        } else if (itemId === 'guide') {
            const guideSection = document.querySelector('[data-section="guide"]');
            if (guideSection) {
                guideSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [router]);

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
                id: 'page-dan-9x0x-loc',
                label: 'Lọc Dàn Siêu Cấp',
                icon: Filter,
                href: '/dan-9x0x#filter'
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
            },
            {
                id: 'page-thong-ke',
                label: 'Thống Kê XS',
                icon: TrendingUp,
                href: '/thong-ke'
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
            return [
                { id: 'generator', label: 'Tạo Dàn 9x0x', icon: Dice6 },
                { id: 'filter', label: 'Lọc Siêu Cấp', icon: Filter },
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
    );
}
