/**
 * Mobile Navigation Component
 * Tách riêng mobile navigation để dễ quản lý
 */

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChevronDown, MessageCircle, Users } from 'lucide-react';
import AuthButton from './Auth/AuthButton';
import styles from '../styles/Layout.module.css';

// Facebook Icon Component
const FacebookIcon = ({ size = 20, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
);

const MobileNav = ({
    isOpen,
    navLinks,
    openDropdown,
    setOpenDropdown,
    onClose,
    onLinkClick
}) => {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={styles.mobileOverlay}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Mobile Navigation */}
            <div className={`${styles.mobileNav} ${isOpen ? styles.mobileNavOpen : ''}`}>
                <div className={styles.mobileNavContent} onClick={onLinkClick}>
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
                                                                onClose();
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
                                className={`${styles.mobileNavLink} ${router.pathname === link.href ? styles.active : ''}`}
                                onClick={onClose}
                                prefetch={false}
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

                    {/* Social Media Links */}
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--color-gray-200)' }}>
                        <div style={{ fontSize: '12px', color: 'var(--color-gray-500)', marginBottom: '12px', paddingLeft: '16px', fontWeight: '600' }}>
                            Kết nối với chúng tôi
                        </div>
                        
                        {/* Telegram Link */}
                        <a
                            href="https://t.me/+IDI1WNXglndhNTY1"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.mobileNavLink}
                            onClick={onClose}
                        >
                            <div className={styles.mobileNavLinkContent}>
                                <div className={styles.mobileNavLinkHeader}>
                                    <MessageCircle size={20} className={styles.mobileNavIcon} />
                                    <span className={styles.mobileNavLinkLabel}>Nhóm Telegram VIP</span>
                                </div>
                            </div>
                        </a>

                        {/* Facebook Link */}
                        <a
                            href="https://www.facebook.com/share/g/1FrkgbX6Sw/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.mobileNavLink}
                            onClick={onClose}
                        >
                            <div className={styles.mobileNavLinkContent}>
                                <div className={styles.mobileNavLinkHeader}>
                                    <FacebookIcon size={20} className={styles.mobileNavIcon} />
                                    <span className={styles.mobileNavLinkLabel}>Nhóm Facebook</span>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileNav;

