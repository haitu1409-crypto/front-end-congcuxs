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
    const hoverTimeoutRef = useRef(null);

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

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    // Close dropdown on route change
    useEffect(() => {
        setIsOpen(false);
    }, [router.pathname]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    // Check if parent item has href (for direct navigation)
    const parentItem = items[0];
    const hasParentHref = parentItem?.href;

    // ✅ Check if any submenu item is active (items.slice(1) are submenu items)
    const isAnySubmenuActive = items.slice(1).some(item => {
        if (!item.href) return false;
        
        // ✅ Use asPath for accurate matching (handles dynamic routes and query params)
        const currentPath = router.asPath.split('?')[0]; // Remove query params
        const itemPath = item.href.split('?')[0];
        
        // Normalize paths (remove trailing slashes)
        const normalizedCurrent = currentPath.replace(/\/$/, '') || '/';
        const normalizedItem = itemPath.replace(/\/$/, '') || '/';
        
        // Special handling for XSMB/XSMN routes
        if (item.href === '/ket-qua-xo-so-mien-bac') {
            // Match /kqxs or /ket-qua-xo-so-mien-bac
            if (router.pathname === '/kqxs' || normalizedCurrent === normalizedItem) {
                return true;
            }
        }
        
        if (item.href === '/kqxs-xsmn') {
            // Match /kqxs-xsmn
            if (router.pathname === '/kqxs-xsmn' || normalizedCurrent === normalizedItem) {
                return true;
            }
        }
        
        // Check exact match
        if (normalizedCurrent === normalizedItem) {
            return true;
        }
        
        // Check if current path starts with item path (for nested routes)
        if (normalizedCurrent.startsWith(normalizedItem + '/')) {
            return true;
        }
        
        // Check pathname as fallback (for dynamic routes)
        if (router.pathname === item.href) {
            return true;
        }
        
        // Check route segments match (for dynamic routes like /thongke/[slug])
        const currentSegments = normalizedCurrent.split('/').filter(Boolean);
        const itemSegments = normalizedItem.split('/').filter(Boolean);
        
        if (itemSegments.length > 0 && currentSegments.length >= itemSegments.length) {
            const matches = itemSegments.every((segment, idx) => 
                currentSegments[idx] === segment
            );
            if (matches) {
                return true;
            }
        }
        
        return false;
    });
    
    // Check if parent item is active
    const isParentActive = hasParentHref && (
        router.pathname === parentItem.href || 
        router.asPath === parentItem.href ||
        (parentItem.href === '/ket-qua-xo-so-mien-bac' && router.pathname === '/kqxs')
    );

    const handleMouseEnter = () => {
        // Clear any pending close timeout
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        // Add small delay to allow moving to submenu
        hoverTimeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 200);
    };

    return (
        <div
            className={styles.dropdown}
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {hasParentHref ? (
                <Link
                    href={parentItem.href}
                    className={`${styles.dropdownToggle} ${isOpen || isAnySubmenuActive || isParentActive ? styles.active : ''}`}
                    onClick={(e) => {
                        // If clicking on chevron, toggle dropdown instead
                        if (e.target.closest(`.${styles.dropdownIcon}`)) {
                            e.preventDefault();
                            toggleDropdown();
                        }
                    }}
                >
                    <span className={styles.dropdownLabel}>{items[0].label}</span>
                    <ChevronDown 
                        size={16} 
                        className={`${styles.dropdownIcon} ${isOpen ? styles.rotate : ''}`}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleDropdown();
                        }}
                    />
                </Link>
            ) : (
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
            )}

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
                        
                        // Special handling for XSMB/XSMN routes
                        let isActive = false;
                        
                        if (item.href === '/ket-qua-xo-so-mien-bac') {
                            // Match /kqxs or /ket-qua-xo-so-mien-bac
                            isActive = router.pathname === '/kqxs' || normalizedCurrent === normalizedItem;
                        } else if (item.href === '/kqxs-xsmn') {
                            // Match /kqxs-xsmn
                            isActive = router.pathname === '/kqxs-xsmn' || normalizedCurrent === normalizedItem;
                        } else {
                            // Check exact match
                            isActive = normalizedCurrent === normalizedItem;
                            
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

























