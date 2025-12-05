/**
 * Dropdown Menu Component
 * Menu dropdown cho navigation với submenu
 */

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronDown } from 'lucide-react';
import styles from '../styles/DropdownMenu.module.css';

export default function DropdownMenu({ items }) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdown on route change
    useEffect(() => {
        setIsOpen(false);
    }, [router.pathname]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    // ✅ Check if any submenu item is active (items.slice(1) are submenu items)
    const isAnySubmenuActive = items.slice(1).some(item => {
        if (!item.href) return false;
        
        // ✅ Use asPath for accurate matching (handles dynamic routes and query params)
        const currentPath = router.asPath.split('?')[0]; // Remove query params
        const itemPath = item.href.split('?')[0];
        
        // Normalize paths (remove trailing slashes)
        const normalizedCurrent = currentPath.replace(/\/$/, '') || '/';
        const normalizedItem = itemPath.replace(/\/$/, '') || '/';
        
        // Debug: Log để kiểm tra (có thể xóa sau)
        if (process.env.NODE_ENV === 'development' && items[0].label === 'Thống Kê') {
            console.log('🔍 Active Check:', {
                parent: items[0].label,
                item: item.label,
                itemHref: item.href,
                currentPath,
                itemPath,
                normalizedCurrent,
                normalizedItem,
                pathname: router.pathname,
                asPath: router.asPath
            });
        }
        
        // Check exact match
        if (normalizedCurrent === normalizedItem) {
            if (process.env.NODE_ENV === 'development' && items[0].label === 'Thống Kê') {
                console.log('✅ Exact match:', item.label);
            }
            return true;
        }
        
        // Check if current path starts with item path (for nested routes)
        // Example: /thongke/lo-gan starts with /thongke/lo-gan
        if (normalizedCurrent.startsWith(normalizedItem + '/')) {
            if (process.env.NODE_ENV === 'development' && items[0].label === 'Thống Kê') {
                console.log('✅ StartsWith match:', item.label);
            }
            return true;
        }
        
        // Check pathname as fallback (for dynamic routes)
        if (router.pathname === item.href) {
            if (process.env.NODE_ENV === 'development' && items[0].label === 'Thống Kê') {
                console.log('✅ Pathname match:', item.label);
            }
            return true;
        }
        
        // Check route segments match (for dynamic routes like /thongke/[slug])
        const currentSegments = normalizedCurrent.split('/').filter(Boolean);
        const itemSegments = normalizedItem.split('/').filter(Boolean);
        
        if (itemSegments.length > 0 && currentSegments.length >= itemSegments.length) {
            // Check if all item segments match current segments
            // Example: ['thongke', 'lo-gan'] matches ['thongke', 'lo-gan']
            const matches = itemSegments.every((segment, idx) => 
                currentSegments[idx] === segment
            );
            if (matches) {
                if (process.env.NODE_ENV === 'development' && items[0].label === 'Thống Kê') {
                    console.log('✅ Segments match:', item.label);
                }
                return true;
            }
        }
        
        return false;
    });

    return (
        <div className={styles.dropdown} ref={dropdownRef}>
            <button
                className={`${styles.dropdownToggle} ${isOpen || isAnySubmenuActive ? styles.active : ''}`}
                onClick={toggleDropdown}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <span className={styles.dropdownLabel}>{items[0].label}</span>
                <ChevronDown 
                    size={16} 
                    className={`${styles.dropdownIcon} ${isOpen ? styles.rotate : ''}`} 
                />
            </button>

            {isOpen && (
                <div className={styles.dropdownMenu}>
                    {items.slice(1).map((item, index) => {
                        if (!item.href) return null;
                        
                        // ✅ Use asPath for accurate matching (handles dynamic routes)
                        const currentPath = router.asPath.split('?')[0]; // Remove query params
                        const itemPath = item.href.split('?')[0];
                        
                        // Normalize paths (remove trailing slashes)
                        const normalizedCurrent = currentPath.replace(/\/$/, '');
                        const normalizedItem = itemPath.replace(/\/$/, '');
                        
                        // Check exact match
                        let isActive = normalizedCurrent === normalizedItem;
                        
                        // Check if current path starts with item path (for nested routes)
                        if (!isActive && normalizedCurrent.startsWith(normalizedItem + '/')) {
                            isActive = true;
                        }
                        
                        // Check pathname as fallback
                        if (!isActive && router.pathname === item.href) {
                            isActive = true;
                        }
                        
                        // Check route segments match (for dynamic routes)
                        if (!isActive) {
                            const currentSegments = normalizedCurrent.split('/').filter(Boolean);
                            const itemSegments = normalizedItem.split('/').filter(Boolean);
                            
                            if (itemSegments.length > 0 && currentSegments.length >= itemSegments.length) {
                                const matches = itemSegments.every((segment, idx) => 
                                    currentSegments[idx] === segment
                                );
                                if (matches) isActive = true;
                            }
                        }
                        
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={`${styles.dropdownMenuItem} ${isActive ? styles.active : ''}`}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.icon && (
                                    <item.icon size={16} className={styles.dropdownMenuIcon} />
                                )}
                                <span className={styles.dropdownMenuLabel}>{item.label}</span>
                                {item.isNew && <span className={styles.dropdownBadge}>NEW</span>}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

























