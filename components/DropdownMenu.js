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

    // Check if any submenu item is active
    const isAnySubmenuActive = items.some(item =>
        item.submenu?.some(subItem => router.pathname === subItem.href)
    );

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
                    {items.slice(1).map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={`${styles.dropdownMenuItem} ${router.pathname === item.href ? styles.active : ''}`}
                            onClick={() => setIsOpen(false)}
                        >
                            {item.icon && (
                                <item.icon size={16} className={styles.dropdownMenuIcon} />
                            )}
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

















